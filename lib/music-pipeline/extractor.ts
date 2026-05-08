import { spawn } from 'child_process';
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import { createGunzip } from 'zlib';
import { Transform } from 'stream';
import { pipeline as streamPipeline } from 'stream/promises';
import * as tar from 'tar';
import * as yauzl from 'yauzl';
import { DANGEROUS_EXTENSIONS } from './constants';
import { sanitizeSegment, assertInside, isInside, uniquePath } from './pathSafety';
import type { ArchiveResult, FileRecord, PipelineConfig } from './types';

const MAX_COMPRESSION_RATIO = 100;

function archiveBaseName(archivePath: string) {
  const basename = path.basename(archivePath).replace(/(\.tar\.gz|\.tgz|\.zip|\.rar|\.7z|\.tar|\.gz)$/i, '');
  return sanitizeSegment(basename, 'Archive');
}

function isDangerousPath(filePath: string) {
  return DANGEROUS_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

async function destinationFor(config: PipelineConfig, archivePath: string) {
  const target = path.join(config.extractionDir, `Extracted_${archiveBaseName(archivePath)}`);
  assertInside(config.extractionDir, target);
  return uniquePath(target);
}

function openZip(filePath: string) {
  return new Promise<yauzl.ZipFile>((resolve, reject) => {
    yauzl.open(filePath, { lazyEntries: true }, (error, zipFile) => {
      if (error) reject(error);
      else if (!zipFile) reject(new Error('Unable to open zip file'));
      else resolve(zipFile);
    });
  });
}

function openZipEntry(zipFile: yauzl.ZipFile, entry: yauzl.Entry) {
  return new Promise<NodeJS.ReadableStream>((resolve, reject) => {
    zipFile.openReadStream(entry, (error, stream) => {
      if (error) reject(error);
      else if (!stream) reject(new Error(`Unable to read zip entry: ${entry.fileName}`));
      else resolve(stream);
    });
  });
}

async function extractZip(archivePath: string, dest: string, config: PipelineConfig) {
  const extractedFiles: string[] = [];
  const zipFile = await openZip(archivePath);
  let entries = 0;
  let extractedBytes = 0;

  await new Promise<void>((resolve, reject) => {
    zipFile.readEntry();

    zipFile.on('entry', async (entry) => {
      try {
        entries += 1;
        extractedBytes += entry.uncompressedSize ?? 0;

        if (entries > config.maxArchiveEntries) {
          zipFile.close();
          reject(new Error(`Archive entry limit exceeded (${config.maxArchiveEntries})`));
          return;
        }

        if (extractedBytes > config.maxArchiveBytes) {
          zipFile.close();
          reject(new Error(`Archive byte limit exceeded (${config.maxArchiveBytes})`));
          return;
        }

        const entryName = entry.fileName.replace(/\\/g, '/');
        const target = path.resolve(dest, entryName);
        if (!isInside(dest, target)) {
          zipFile.close();
          reject(new Error(`Unsafe archive path traversal entry: ${entry.fileName}`));
          return;
        }

        if (isDangerousPath(entryName)) {
          zipFile.readEntry();
          return;
        }

        // Check for symlink attacks (zip entries with external links)
        if (entry.externalAttr !== undefined && (entry.externalAttr & 0xA000) === 0xA000) {
          // 0xA000 = symlink in ZIP external attributes
          zipFile.close();
          reject(new Error(`Symlink entries are not allowed: ${entry.fileName}`));
          return;
        }

        if (
          entry.compressedSize > 0 &&
          entry.uncompressedSize / entry.compressedSize > MAX_COMPRESSION_RATIO
        ) {
          zipFile.close();
          reject(new Error(`Suspicious compression ratio in archive entry: ${entry.fileName}`));
          return;
        }

        if (/\/$/.test(entryName)) {
          await fsp.mkdir(target, { recursive: true });
          zipFile.readEntry();
          return;
        }

        await fsp.mkdir(path.dirname(target), { recursive: true });
        const stream = await openZipEntry(zipFile, entry);
        await streamPipeline(stream, fs.createWriteStream(target));
        
         // Verify the created file is not a symlink
         try {
           const stats = await fsp.lstat(target);
           if (stats.isSymbolicLink()) {
             await fsp.unlink(target);
             throw new Error(`Symlink detected after extraction: ${entry.fileName}`);
           }
         } catch (err) {
           if (err instanceof Error && 'code' in err && err.code !== 'ENOENT') {
             throw err;
           }
         }
        
        extractedFiles.push(target);
        zipFile.readEntry();
      } catch (error) {
        zipFile.close();
        reject(error);
      }
    });

    zipFile.on('end', resolve);
    zipFile.on('error', reject);
  });

  return extractedFiles;
}

async function extractTar(archivePath: string, dest: string, config: PipelineConfig) {
  const extractedFiles: string[] = [];
  let entries = 0;
  let extractedBytes = 0;

  await tar.x({
    file: archivePath,
    cwd: dest,
    preservePaths: false,
    filter(entryPath, entry) {
      entries += 1;
      extractedBytes += entry.size ?? 0;
      const target = path.resolve(dest, entryPath);
      // Cast to any for tar entry type (SymbolicLink check)
      const entryAny = entry as any;
      // Reject symlinks explicitly
      if (entryAny.type === 'SymbolicLink' || entryAny.type === 'Symlink') {
        return false;
      }
      return (
        entries <= config.maxArchiveEntries &&
        extractedBytes <= config.maxArchiveBytes &&
        isInside(dest, target) &&
        !isDangerousPath(entryPath)
      );
    },
    onentry(entry) {
      // Cast to any for safety
      const entryAny = entry as any;
      if (entryAny.type === 'File') {
        // Double-check no symlinks slipped through
        const fullPath = path.resolve(dest, entry.path);
        try {
          const stats = fs.statSync(fullPath);
          if (stats.isSymbolicLink()) {
            fs.unlinkSync(fullPath);
            return;
          }
        } catch (e) {
          // Ignore errors
        }
        extractedFiles.push(fullPath);
      }
    },
   });

   return extractedFiles;
 }

async function extractGzipFile(archivePath: string, dest: string, config: PipelineConfig) {
  const outputName = sanitizeSegment(path.basename(archivePath).replace(/\.gz$/i, ''), 'decompressed-file');
  if (isDangerousPath(outputName)) {
    throw new Error('Refusing to extract standalone gzip to a dangerous executable extension');
  }
  const outputPath = path.join(dest, outputName);
  assertInside(dest, outputPath);

  let bytes = 0;
  const guard = new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      bytes += chunk.length;
      if (bytes > config.maxArchiveBytes) {
        callback(new Error(`Gzip byte limit exceeded (${config.maxArchiveBytes})`));
        return;
      }
      callback(null, chunk);
    },
  });

  await streamPipeline(
    fs.createReadStream(archivePath),
    createGunzip(),
    guard,
    fs.createWriteStream(outputPath)
  );

  return [outputPath];
}

async function commandExists(command: string) {
  return new Promise<boolean>((resolve) => {
    const child = spawn('where.exe', [command], { stdio: 'ignore' });
    child.on('close', (code) => resolve(code === 0));
    child.on('error', () => resolve(false));
  });
}

async function runCommand(command: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, { windowsHide: true });
    let stderr = '';

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(stderr.trim() || `${command} exited with code ${code}`));
    });
  });
}

async function collectFiles(dir: string) {
  const files: string[] = [];

  async function walk(current: string) {
    const entries = await fsp.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) await walk(fullPath);
      else if (entry.isFile()) files.push(fullPath);
    }
  }

  await walk(dir);
  return files;
}

async function extractWith7z(archivePath: string, dest: string, config: PipelineConfig) {
  const available = await commandExists('7z');
  if (!available) {
    throw new Error('7z executable not found. Install 7-Zip and make 7z available on PATH for .rar/.7z extraction.');
  }

  await runCommand('7z', ['x', '-y', `-o${dest}`, archivePath]);
  const files = await collectFiles(dest);
  const bytes = files.reduce((sum, file) => sum + fs.statSync(file).size, 0);

  if (files.length > config.maxArchiveEntries || bytes > config.maxArchiveBytes) {
    throw new Error('Extracted archive exceeded configured safety limits');
  }

  for (const file of files) {
    assertInside(dest, file);
    if (isDangerousPath(file)) {
      throw new Error(`Archive contained dangerous executable entry: ${path.basename(file)}`);
    }
  }
  return files;
}

export async function extractArchive(archive: FileRecord, config: PipelineConfig): Promise<ArchiveResult> {
  if (!config.extractArchives) {
    return {
      archivePath: archive.absolutePath,
      status: 'skipped',
      extractedFiles: [],
    };
  }

  const dest = await destinationFor(config, archive.absolutePath);

  if (config.dryRun) {
    return {
      archivePath: archive.absolutePath,
      extractedDir: dest,
      status: 'dry-run',
      extractedFiles: [],
    };
  }

  try {
    await fsp.mkdir(dest, { recursive: true });
    const lower = archive.absolutePath.toLowerCase();
    let extractedFiles: string[];

    if (lower.endsWith('.zip')) extractedFiles = await extractZip(archive.absolutePath, dest, config);
    else if (lower.endsWith('.tar') || lower.endsWith('.tar.gz') || lower.endsWith('.tgz')) {
      extractedFiles = await extractTar(archive.absolutePath, dest, config);
    } else if (lower.endsWith('.gz')) {
      // Standalone .gz files are decompressed as single files. .tar.gz is handled above.
      extractedFiles = await extractGzipFile(archive.absolutePath, dest, config);
    } else if (lower.endsWith('.rar') || lower.endsWith('.7z')) {
      extractedFiles = await extractWith7z(archive.absolutePath, dest, config);
    } else {
      throw new Error(`Unsupported archive extension: ${archive.extension}`);
    }

    return {
      archivePath: archive.absolutePath,
      extractedDir: dest,
      status: 'extracted',
      extractedFiles,
    };
  } catch (error) {
    await fsp.rm(dest, { recursive: true, force: true }).catch(() => undefined);
    return {
      archivePath: archive.absolutePath,
      extractedDir: dest,
      status: 'failed',
      extractedFiles: [],
      error: error instanceof Error ? error.message : 'Archive extraction failed',
    };
  }
}
