import path from 'path';
import { config as loadEnv } from 'dotenv';
import type { PipelineConfig } from './types';

loadEnv({ path: '.env.local' });

const DEFAULT_ROOT = 'C:\\Users\\SANDY\\Music';

function boolFromEnv(value: string | undefined, fallback: boolean) {
  if (value == null || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

function intFromEnv(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function createPipelineConfig(overrides: Partial<PipelineConfig> = {}): PipelineConfig {
  const rootDir = path.resolve(overrides.rootDir ?? process.env.MUSIC_PIPELINE_ROOT ?? DEFAULT_ROOT);
  const workDir = path.resolve(overrides.workDir ?? process.env.MUSIC_PIPELINE_WORK_DIR ?? path.join(rootDir, '.music-pipeline'));

  const dryRun = overrides.dryRun ?? boolFromEnv(process.env.MUSIC_PIPELINE_DRY_RUN, true);

  return {
    rootDir,
    workDir,
    extractionDir: path.resolve(overrides.extractionDir ?? process.env.MUSIC_PIPELINE_EXTRACTION_DIR ?? path.join(workDir, 'extracted')),
    reportsDir: path.resolve(overrides.reportsDir ?? process.env.MUSIC_PIPELINE_REPORTS_DIR ?? path.join(workDir, 'reports')),
    organizedDir: path.resolve(overrides.organizedDir ?? process.env.MUSIC_PIPELINE_ORGANIZED_DIR ?? path.join(rootDir, 'Organized')),
    corruptedDir: path.resolve(overrides.corruptedDir ?? process.env.MUSIC_PIPELINE_CORRUPTED_DIR ?? path.join(rootDir, 'Corrupted')),
    dryRun,
    extractArchives: overrides.extractArchives ?? boolFromEnv(process.env.MUSIC_PIPELINE_EXTRACT_ARCHIVES, false),
    organize: overrides.organize ?? boolFromEnv(process.env.MUSIC_PIPELINE_ORGANIZE, false),
    moveCorrupted: overrides.moveCorrupted ?? boolFromEnv(process.env.MUSIC_PIPELINE_MOVE_CORRUPTED, false),
    upload: overrides.upload ?? boolFromEnv(process.env.MUSIC_PIPELINE_UPLOAD, false),
    insertDatabase: overrides.insertDatabase ?? boolFromEnv(process.env.MUSIC_PIPELINE_INSERT_DB, false),
    watch: overrides.watch ?? boolFromEnv(process.env.MUSIC_PIPELINE_WATCH, false),
    parallelism: overrides.parallelism ?? intFromEnv(process.env.MUSIC_PIPELINE_PARALLELISM, 4),
    uploadParallelism: overrides.uploadParallelism ?? intFromEnv(process.env.MUSIC_PIPELINE_UPLOAD_PARALLELISM, 3),
    maxArchiveEntries: overrides.maxArchiveEntries ?? intFromEnv(process.env.MUSIC_PIPELINE_MAX_ARCHIVE_ENTRIES, 10000),
    maxArchiveBytes: overrides.maxArchiveBytes ?? intFromEnv(process.env.MUSIC_PIPELINE_MAX_ARCHIVE_BYTES, 20 * 1024 * 1024 * 1024),
    maxArchiveDepth: overrides.maxArchiveDepth ?? intFromEnv(process.env.MUSIC_PIPELINE_MAX_ARCHIVE_DEPTH, 3),
    archiveExtractionRetries: overrides.archiveExtractionRetries ?? intFromEnv(process.env.MUSIC_PIPELINE_ARCHIVE_RETRIES, 2),
    maxAudioBytes: overrides.maxAudioBytes ?? intFromEnv(process.env.MUSIC_PIPELINE_MAX_AUDIO_BYTES, 1024 * 1024 * 1024),
    cloudProvider: overrides.cloudProvider ?? (process.env.MUSIC_PIPELINE_CLOUD_PROVIDER as PipelineConfig['cloudProvider']) ?? 'none',
    databaseProvider: overrides.databaseProvider ?? (process.env.MUSIC_PIPELINE_DATABASE_PROVIDER as PipelineConfig['databaseProvider']) ?? 'none',
    supabaseUrl: overrides.supabaseUrl ?? process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseServiceRoleKey: overrides.supabaseServiceRoleKey ?? process.env.SUPABASE_SERVICE_ROLE_KEY,
    supabaseStorageBucket: overrides.supabaseStorageBucket ?? process.env.MUSIC_PIPELINE_SUPABASE_BUCKET ?? 'songs',
    supabaseStoragePrefix: overrides.supabaseStoragePrefix ?? process.env.MUSIC_PIPELINE_STORAGE_PREFIX ?? 'music-assets',
    localUploadDir: path.resolve(overrides.localUploadDir ?? process.env.MUSIC_PIPELINE_LOCAL_UPLOAD_DIR ?? path.join(workDir, 'uploaded')),
    apiToken: overrides.apiToken ?? process.env.MUSIC_PIPELINE_API_TOKEN,
  };
}
