import fs from 'fs/promises';
import pLimit from 'p-limit';
import { createPipelineConfig } from './config';
import { markDuplicates } from './dedupe';
import { extractArchive } from './extractor';
import { sha256File } from './hash';
import { PipelineLogger } from './logger';
import { validateAudioFile } from './metadata';
import { moveCorruptedAssets, organizeAssets } from './organizer';
import { writeReports } from './reports';
import { scanDirectory } from './scanner';
import { insertAssetRecord } from './database';
import { uploadAsset } from './uploaders';
import type {
  ArchiveResult,
  FileRecord,
  PipelineConfig,
  PipelineError,
  PipelineSummary,
  ScanReport,
  ValidatedAudioAsset,
} from './types';

function mergeScans(primary: ScanReport, scans: ScanReport[]): ScanReport {
  const files = [primary.files, ...scans.map((scan) => scan.files)].flat();
  const directories = [primary.directories, ...scans.map((scan) => scan.directories)].flat();
  const audioFiles = files.filter((file) => file.kind === 'audio');
  const archives = files.filter((file) => file.kind === 'archive');
  const unsupportedFiles = files.filter((file) => file.kind === 'unsupported');
  const filenameMap = new Map<string, string[]>();

  for (const file of files) {
    const key = file.filename.toLowerCase();
    filenameMap.set(key, [...(filenameMap.get(key) ?? []), file.absolutePath]);
  }

  return {
    ...primary,
    directories,
    files,
    audioFiles,
    archives,
    unsupportedFiles,
    duplicateFilenames: Array.from(filenameMap.entries())
      .filter(([, paths]) => paths.length > 1)
      .map(([filename, paths]) => ({ filename, paths })),
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

async function validateFiles(files: FileRecord[], config: PipelineConfig, errors: PipelineError[]) {
  const limit = pLimit(config.parallelism);
  const assets = await Promise.all(
    files.map((file) =>
      limit(async (): Promise<ValidatedAudioAsset | null> => {
        try {
          if (file.size > config.maxAudioBytes) {
            return {
              file,
              checksum: '',
              metadata: {
                title: file.filename,
                artist: 'Unknown Artist',
                album: 'Unknown Album',
                durationSeconds: 0,
              },
              status: 'corrupted',
              reason: `File exceeds max audio size (${config.maxAudioBytes})`,
            };
          }

          const checksum = await sha256File(file.absolutePath);
          file.checksum = checksum;
          return validateAudioFile(file, checksum);
        } catch (error) {
          errors.push({
            stage: 'validation',
            path: file.absolutePath,
            message: error instanceof Error ? error.message : 'Validation failed',
          });
          return null;
        }
      })
    )
  );

  return assets.filter(Boolean) as ValidatedAudioAsset[];
}

async function extractArchiveWithRetries(archive: FileRecord, config: PipelineConfig) {
  let result = await extractArchive(archive, config);
  let attempts = 0;

  while (result.status === 'failed' && attempts < config.archiveExtractionRetries) {
    attempts += 1;
    result = await extractArchive(archive, config);
  }

  return result;
}

export async function runMusicPipeline(overrides: Partial<PipelineConfig> = {}) {
  const config = createPipelineConfig(overrides);
  const startedAt = new Date().toISOString();
  const errors: PipelineError[] = [];
  await fs.mkdir(config.workDir, { recursive: true });
  await fs.mkdir(config.reportsDir, { recursive: true });

  const logger = new PipelineLogger(config.reportsDir);
  await logger.init();
  await logger.info('pipeline-started', {
    rootDir: config.rootDir,
    dryRun: config.dryRun,
  });

  const initialScan = await scanDirectory(config);
  await logger.info('scan-complete', initialScan.totals);

  const extraction: ArchiveResult[] = [];
  const extractedScans: ScanReport[] = [];
  const seenArchives = new Set<string>();
  let archivesToExtract = initialScan.archives;
  let depth = 0;

  while (archivesToExtract.length > 0 && depth < config.maxArchiveDepth) {
    const currentBatch = archivesToExtract.filter((archive) => !seenArchives.has(archive.absolutePath));
    if (currentBatch.length === 0) break;

    for (const archive of currentBatch) seenArchives.add(archive.absolutePath);

    const batchResults = await Promise.all(
      currentBatch.map(async (archive) => {
        const result = await extractArchiveWithRetries(archive, config);
        if (result.status === 'failed') {
          errors.push({
            stage: 'archive-extraction',
            path: archive.absolutePath,
            message: result.error ?? 'Archive extraction failed',
          });
        }
        return result;
      })
    );

    extraction.push(...batchResults);
    const nextArchives: FileRecord[] = [];

    for (const result of batchResults) {
      if (result.status === 'extracted' && result.extractedDir) {
        const extractedScan = await scanDirectory(config, result.extractedDir, 'extracted', result.archivePath);
        extractedScans.push(extractedScan);
        nextArchives.push(...extractedScan.archives);
      }
    }

    archivesToExtract = config.extractArchives ? nextArchives : [];
    depth += 1;
  }

  const scan = mergeScans(initialScan, extractedScans);
  const assets = await validateFiles(scan.audioFiles, config, errors);
  const duplicates = markDuplicates(assets);

  await moveCorruptedAssets(assets, config);
  await organizeAssets(assets, config);

  const uploadLimit = pLimit(config.uploadParallelism);
  await Promise.all(
    assets.map((asset) =>
      uploadLimit(async () => {
        try {
          asset.upload = await uploadAsset(asset, config);
        } catch (error) {
          asset.upload = {
            status: 'failed',
            provider: config.cloudProvider,
            error: error instanceof Error ? error.message : 'Upload failed',
          };
          errors.push({
            stage: 'upload',
            path: asset.file.absolutePath,
            message: asset.upload.error ?? 'Upload failed',
          });
        }
      })
    )
  );

  await Promise.all(
    assets.map(async (asset) => {
      try {
        asset.database = await insertAssetRecord(asset, config);
      } catch (error) {
        asset.database = {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Database insert failed',
        };
        errors.push({
          stage: 'database',
          path: asset.file.absolutePath,
          message: asset.database.error ?? 'Database insert failed',
        });
      }
    })
  );

  const completedAt = new Date().toISOString();
  const summary: PipelineSummary = {
    startedAt,
    completedAt,
    rootDir: config.rootDir,
    dryRun: config.dryRun,
    scan,
    extraction,
    assets,
    duplicates,
    errors,
    totals: {
      discoveredAudio: scan.audioFiles.length,
      validatedAudio: assets.filter((asset) => asset.status === 'valid').length,
      corruptedAudio: assets.filter((asset) => asset.status === 'corrupted').length,
      exactDuplicates: duplicates.exact.reduce((sum, group) => sum + group.duplicates.length, 0),
      nearDuplicateGroups: duplicates.near.length,
      uploaded: assets.filter((asset) => asset.upload?.status === 'uploaded').length,
      databaseInserted: assets.filter((asset) => asset.database?.status === 'inserted').length,
    },
  };

  const reportDir = await writeReports(summary, config.reportsDir);
  await logger.info('pipeline-completed', { reportDir, totals: summary.totals });

  return { summary, reportDir, config };
}
