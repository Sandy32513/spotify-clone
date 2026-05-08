export type PipelineCommand = 'analyze' | 'run' | 'watch';

export type CloudProvider = 'none' | 'local' | 'supabase';

export type DatabaseProvider = 'none' | 'supabase';

export type FileKind = 'audio' | 'archive' | 'unsupported' | 'other';

export type UploadStatus = 'skipped' | 'uploaded' | 'failed' | 'dry-run';

export interface PipelineConfig {
  rootDir: string;
  workDir: string;
  extractionDir: string;
  reportsDir: string;
  organizedDir: string;
  corruptedDir: string;
  dryRun: boolean;
  extractArchives: boolean;
  organize: boolean;
  moveCorrupted: boolean;
  upload: boolean;
  insertDatabase: boolean;
  watch: boolean;
  parallelism: number;
  uploadParallelism: number;
  maxArchiveEntries: number;
  maxArchiveBytes: number;
  maxArchiveDepth: number;
  archiveExtractionRetries: number;
  maxAudioBytes: number;
  cloudProvider: CloudProvider;
  databaseProvider: DatabaseProvider;
  supabaseUrl?: string;
  supabaseServiceRoleKey?: string;
  supabaseStorageBucket: string;
  supabaseStoragePrefix: string;
  localUploadDir: string;
  apiToken?: string;
}

export interface FileRecord {
  absolutePath: string;
  relativePath: string;
  filename: string;
  extension: string;
  size: number;
  modifiedAt: string;
  isHidden: boolean;
  kind: FileKind;
  discoveredFrom: 'root' | 'extracted';
  archiveSource?: string;
  checksum?: string;
}

export interface DirectoryRecord {
  absolutePath: string;
  relativePath: string;
  isEmpty: boolean;
  isHidden: boolean;
}

export interface ScanReport {
  rootDir: string;
  scannedAt: string;
  directories: DirectoryRecord[];
  files: FileRecord[];
  audioFiles: FileRecord[];
  archives: FileRecord[];
  unsupportedFiles: FileRecord[];
  duplicateFilenames: Array<{ filename: string; paths: string[] }>;
  totals: {
    directories: number;
    files: number;
    audioFiles: number;
    archives: number;
    unsupportedFiles: number;
    hiddenFiles: number;
    emptyFolders: number;
    bytes: number;
  };
}

export interface ArchiveResult {
  archivePath: string;
  extractedDir?: string;
  status: 'skipped' | 'extracted' | 'failed' | 'dry-run';
  extractedFiles: string[];
  error?: string;
}

export interface AudioMetadata {
  title: string;
  artist: string;
  album: string;
  genre?: string;
  durationSeconds: number;
  bitrate?: number;
  sampleRate?: number;
  channels?: number;
  codec?: string;
  container?: string;
  lossless?: boolean;
}

export interface ValidatedAudioAsset {
  file: FileRecord;
  checksum: string;
  metadata: AudioMetadata;
  status: 'valid' | 'corrupted' | 'duplicate' | 'unsupported';
  reason?: string;
  duplicateOf?: string;
  nearDuplicateKey?: string;
  organizedPath?: string;
  upload?: UploadResult;
  database?: DatabaseInsertResult;
}

export interface DuplicateReport {
  exact: Array<{ checksum: string; kept: string; duplicates: string[] }>;
  near: Array<{ key: string; paths: string[] }>;
}

export interface UploadResult {
  status: UploadStatus;
  provider: CloudProvider;
  objectKey?: string;
  publicUrl?: string;
  secureUrl?: string;
  cdnUrl?: string;
  uploadId?: string;
  error?: string;
}

export interface DatabaseInsertResult {
  status: 'inserted' | 'skipped' | 'failed' | 'dry-run';
  id?: string;
  error?: string;
}

export interface PipelineError {
  stage: string;
  path?: string;
  message: string;
}

export interface PipelineSummary {
  startedAt: string;
  completedAt: string;
  rootDir: string;
  dryRun: boolean;
  scan: ScanReport;
  extraction: ArchiveResult[];
  assets: ValidatedAudioAsset[];
  duplicates: DuplicateReport;
  errors: PipelineError[];
  totals: {
    discoveredAudio: number;
    validatedAudio: number;
    corruptedAudio: number;
    exactDuplicates: number;
    nearDuplicateGroups: number;
    uploaded: number;
    databaseInserted: number;
  };
}
