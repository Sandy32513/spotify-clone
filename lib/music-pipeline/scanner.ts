import fs from 'fs/promises';
import type { Dirent } from 'fs';
import path from 'path';
import { ARCHIVE_EXTENSIONS, AUDIO_EXTENSIONS, IGNORED_EXTENSIONS, IGNORED_FILENAMES } from './constants';
import { isInside } from './pathSafety';
import type { DirectoryRecord, FileKind, FileRecord, PipelineConfig, ScanReport } from './types';

function extensionFor(filePath: string) {
  const lower = filePath.toLowerCase();
  if (lower.endsWith('.tar.gz')) return '.tar.gz';
  return path.extname(lower);
}

function classifyFile(filePath: string): FileKind {
  const ext = extensionFor(filePath);
  const filename = path.basename(filePath).toLowerCase();

  if (AUDIO_EXTENSIONS.includes(ext as never)) return 'audio';
  if (ARCHIVE_EXTENSIONS.includes(ext as never)) return 'archive';
  if (IGNORED_FILENAMES.has(filename) || IGNORED_EXTENSIONS.has(ext)) return 'other';
  return 'unsupported';
}

function isHiddenName(name: string) {
  return name.startsWith('.') || name.startsWith('~$');
}

function shouldSkipDirectory(config: PipelineConfig, dirPath: string) {
  return isInside(config.workDir, dirPath) || isInside(config.organizedDir, dirPath) || isInside(config.corruptedDir, dirPath);
}

export async function scanDirectory(
  config: PipelineConfig,
  rootDir = config.rootDir,
  discoveredFrom: FileRecord['discoveredFrom'] = 'root',
  archiveSource?: string
): Promise<ScanReport> {
  const root = path.resolve(rootDir);
  const directories: DirectoryRecord[] = [];
  const files: FileRecord[] = [];
  const filenameMap = new Map<string, string[]>();

  async function walk(currentDir: string) {
    if (!isInside(root, currentDir)) return;
    if (discoveredFrom === 'root' && shouldSkipDirectory(config, currentDir) && currentDir !== root) return;

    let entries: Dirent[];
    try {
      entries = await fs.readdir(currentDir, { withFileTypes: true });
    } catch {
      return;
    }

    directories.push({
      absolutePath: currentDir,
      relativePath: path.relative(root, currentDir) || '.',
      isEmpty: entries.length === 0,
      isHidden: isHiddenName(path.basename(currentDir)),
    });

    for (const entry of entries) {
      const absolutePath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await walk(absolutePath);
        continue;
      }

      if (!entry.isFile()) continue;

      const stat = await fs.stat(absolutePath);
      const kind = classifyFile(absolutePath);
      const filename = path.basename(absolutePath);
      const relativePath = path.relative(root, absolutePath);
      const record: FileRecord = {
        absolutePath,
        relativePath,
        filename,
        extension: extensionFor(absolutePath),
        size: stat.size,
        modifiedAt: stat.mtime.toISOString(),
        isHidden: isHiddenName(filename),
        kind,
        discoveredFrom,
        archiveSource,
      };

      files.push(record);
      const key = filename.toLowerCase();
      filenameMap.set(key, [...(filenameMap.get(key) ?? []), absolutePath]);
    }
  }

  await walk(root);

  const duplicateFilenames = Array.from(filenameMap.entries())
    .filter(([, paths]) => paths.length > 1)
    .map(([filename, paths]) => ({ filename, paths }));

  const audioFiles = files.filter((file) => file.kind === 'audio');
  const archives = files.filter((file) => file.kind === 'archive');
  const unsupportedFiles = files.filter((file) => file.kind === 'unsupported');

  return {
    rootDir: root,
    scannedAt: new Date().toISOString(),
    directories,
    files,
    audioFiles,
    archives,
    unsupportedFiles,
    duplicateFilenames,
    totals: {
      directories: directories.length,
      files: files.length,
      audioFiles: audioFiles.length,
      archives: archives.length,
      unsupportedFiles: unsupportedFiles.length,
      hiddenFiles: files.filter((file) => file.isHidden).length,
      emptyFolders: directories.filter((dir) => dir.isEmpty).length,
      bytes: files.reduce((sum, file) => sum + file.size, 0),
    },
  };
}
