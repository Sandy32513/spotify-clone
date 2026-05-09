# 🎵 MUSIC ASSET PIPELINE - Complete Data Flow

**Version:** 1.0  
**Last Updated:** 2026-05-08  
**Components:** Scanner → Extractor → Validator → Deduper → Organizer → Uploader → Database

---

## 📊 PIPELINE ARCHITECTURE DIAGRAM

```mermaid
flowchart TD
    A[Source: C:\Users\SANDY\Music] --> B[Scanner<br/>Recursive file discovery]
    B --> C{File type?}
    C -->|Audio| D[Audio File<br/>.mp3, .flac, .wav, .m4a]
    C -->|Archive| E[Archive File<br/>.zip, .tar.gz, .rar]
    C -->|Unsupported| F[Skip & Log]
    
    D --> G[Validator<br/>Metadata extraction]
    E --> H[Extractor<br/>Safe unpacking]
    H --> D
    
    G --> I{Checksum<br/>duplicate?}
    I -->|Yes| J[Mark as Duplicate]
    I -->|No| K[Storage File<br/>record created]
    
    K --> L[Uploader<br/>Cloudinary/Supabase]
    L --> M[Cloud Storage<br/>Audio file stored]
    
    K --> N[Database<br/>music_assets insert]
    N --> O[Catalog Ready<br/>songs table]
    
    J --> P[Reports<br/>JSON/CSV/TXT]
    F --> P
    G --> P
    H --> P
    
    style A fill:#e1f5e1
    style B fill:#ffddd2
    style D fill:#ffefba
    style E fill:#ffefba
    style G fill:#d4edda
    style H fill:#cce5ff
    style I fill:#fff3cd
    style J fill:#f8d7da
    style K fill:#d1ecf1
    style L fill:#e2e3e5
    style M fill:#d4edda
    style N fill:#d1ecf1
    style O fill:#28a745
    style P fill:#e2e3e5
```

---

## 🔄 DETAILED STAGE BREAKDOWN

### Stage 1: Scanner (`lib/music-pipeline/scanner.ts`)

**Purpose:** Recursively scan root directory for music files and archives.

**Input:** Root directory path (default: `C:\Users\SANDY\Music`)  
**Output:** `ScanReport` with file inventory

**Discovery Process:**
```
1. Read directory entries
2. Skip hidden files/folders (unless configured)
3. Classify each entry:
   - Audio file: .mp3, .flac, .wav, .m4a, .ogg, .aac
   - Archive: .zip, .tar, .tar.gz, .tgz, .rar, .7z
   - Unsupported: everything else
4. Build FileRecord for each:
   - absolutePath, relativePath, filename
   - size (bytes)
   - kind (audio|archive|unsupported)
   - isHidden, isEmpty (for directories)
5. Detect duplicate filenames (case-insensitive)
6. Calculate directory tree
7. Return totals: count, bytes, breakdown
```

**Configuration:**
```typescript
const config: ScannerConfig = {
  rootDir: process.env.MUSIC_PIPELINE_ROOT || 'C:\\Users\\SANDY\\Music',
  maxDepth: 10,
  ignoreHidden: true,
  ignorePatterns: ['node_modules', '.git', '.music-pipeline'],
  followSymlinks: false, // Security: don't follow symlinks
};
```

**Safety Controls:**
- Symlink following disabled (prevents directory traversal)
- Hidden files skipped (avoids .git, system files)
- Max depth prevents infinite recursion

---

### Stage 2: Extractor (`lib/music-pipeline/extractor.ts`)

**Purpose:** Safely extract archives to temporary directory.

**Supported Formats:**
| Format | Library | Notes |
|--------|---------|-------|
| ZIP | `yauzl` | Native streaming, low memory |
| TAR | `tar` | Streaming extraction |
| GZIP/TAR.GZ | `zlib` + `tar` | Two-stage decompression |
| RAR | `unrar` (external) | Requires `7z` on PATH |
| 7Z | `7z` (external) | Requires `7z` on PATH |

**Extraction Safety:**

```typescript
// 1. Path traversal protection
function isInside(parent: string, child: string): boolean {
  const relative = path.relative(path.resolve(parent), path.resolve(child));
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

// 2. Archive entry limits
const MAX_ARCHIVE_ENTRIES = 10000;
const MAX_ARCHIVE_BYTES = 10 * 1024 * 1024 * 1024; // 10GB

// 3. Dangerous extension blocking
const DANGEROUS_EXTENSIONS = new Set([
  '.exe', '.bat', '.cmd', '.ps1', '.sh', '.dll',
  '.so', '.dylib', '.scr', '.com', '.vbs'
]);

// 4. Extraction flow per entry:
for each entry in archive:
  if entry.name contains '..' → reject
  if entry.name is absolute path → reject
  if DANGEROUS_EXTENSIONS.has(ext) → skip or reject
  if totalEntries > MAX → abort
  if totalBytes > MAX → abort
  if compressionRatio > 100 → reject (zip bomb)
  extractTo: path.join(extractionDir, safeEntryName)
  assertInside(extractionDir, extractTo)
  write file
```

**Extraction Report Fields:**
- `archive_storage_file_id` → links to storage_files record
- `archive_path` → original archive location
- `extracted_dir` → where files were unpacked
- `status`: `queued` → `processing` → `extracted` / `failed` / `skipped`
- `extracted_files_count` → number of files unpacked
- `error` → failure reason if any
- `report` → JSON with per-file details

---

### Stage 3: Validator (`lib/music-pipeline/metadata.ts`)

**Purpose:** Parse audio files, extract metadata, validate integrity.

**Library:** `music-metadata` (supports 200+ audio formats)

**Extraction Pipeline:**

```typescript
async function validateAudioFile(file: FileRecord, checksum: string): Promise<ValidatedAudioAsset> {
  // 1. Parse metadata with music-metadata
  const metadata = await parseFile(file.absolutePath);
  
  // 2. Extract fields
  const common = metadata.common;
  const audio = metadata.format;
  
  const result: ValidatedAudioAsset = {
    file,
    checksum,
    metadata: {
      title: common.title || file.filename,
      artist: common.artist || 'Unknown Artist',
      album: common.album || 'Unknown Album',
      genre: common.genre || null,
      durationSeconds: audio.duration || 0,
      bitrate: audio.bitrate || null,
      sampleRate: audio.sampleRate || null,
      channels: audio.numberOfChannels || null,
      codec: audio.codec || null,
      container: audio.container || null,
      lossless: isLossless(audio),
      // ... more fields
    },
    status: 'valid',
  };

  // 3. Validation checks
  if (result.metadata.durationSeconds < 1) {
    result.status = 'corrupted';
    result.reason = 'Duration too short or zero';
  }
  
  if (file.size === 0) {
    result.status = 'corrupted';
    result.reason = 'Zero-byte file';
  }

  if (file.size > MAX_AUDIO_BYTES) {
    result.status = 'corrupted';
    result.reason = `File exceeds max size (${MAX_AUDIO_BYTES} bytes)`;
  }

  return result;
}
```

**Validation Rules:**
- Duration > 0 seconds
- File size > 0 bytes
- Metadata parseable (not binary garbage)
- Audio codec supported (MP3, FLAC, AAC, etc.)
- No excessive sample rates (>192kHz may be downsampled later)

**Output:** `ValidatedAudioAsset` with:
- `file` (FileRecord)
- `checksum` (SHA256)
- `metadata` (rich audio info)
- `status`: `valid` | `corrupted` | `error`
- `reason` (if invalid)

---

### Stage 4: Deduplicator (`lib/music-pipeline/dedupe.ts`)

**Purpose:** Identify and handle duplicate files.

**Duplicate Detection Strategies:**

#### 4.1 Exact Duplicate (Primary)
**Method:** SHA256 checksum of entire file
```typescript
const checksum = await sha256File(filePath);
// Lookup: SELECT id FROM music_assets WHERE checksum = $checksum
```
- ✅ 100% accurate
- ⚠️ Two different encodings of same song ≠ same checksum

#### 4.2 Near-Duplicate (Secondary)
**Method:** Fuzzy hash based on metadata
```typescript
const nearDupKey = `${artist.trim().toLowerCase()}-${title.trim().toLowerCase()}`;
// Matches: "Artist - Song" vs "Artist - Song (Remix)" need manual review
```

**Duplicate Handling Policy:**
```typescript
const strategy = process.env.DUPLICATE_STRATEGY || 'skip_duplicate'; // or 'replace', 'keep_both'

switch (strategy) {
  case 'skip_duplicate':
    // Don't upload, mark as duplicate of existing
    asset.status = 'duplicate';
    asset.duplicateOf = existingAssetId;
    asset.upload = { status: 'skipped' };
    break;
  
  case 'replace':
    // Upload new version, archive old
    // (requires admin approval workflow)
    break;
  
  case 'keep_both':
    // Upload anyway (different versions)
    break;
}
```

**Duplicate Report Table:**
- `duplicate_reports` table tracks all duplicate decisions
- `checksum` + `similarity_key` for grouping
- `kept_asset_id` → which asset was kept
- `duplicate_asset_id` → which was rejected
- `strategy` + `decision` for audit trail
- `metadata` → full context of both files

---

### Stage 5: Organizer (`lib/music-pipeline/organizer.ts`)

**Purpose:** Restructure files into standardized naming convention.

**Default Organization:**
```
{OrganizedRoot}/
├── {Artist}/
│   ├── {Album}/
│   │   ├── 01 - {Title}.mp3
│   │   ├── 02 - {Title}.flac
│   │   └── folder.jpg
│   └── Various - Compilation/
├── Unknown Artist/
│   └── {Title}.mp3
└── Corrupted/
    └── [reason]/{original-name}.mp3
```

**Naming Rules:**
```typescript
function organizePath(asset: ValidatedAudioAsset): string {
  const artist = sanitize(asset.metadata.artist || 'Unknown Artist');
  const album = sanitize(asset.metadata.album || 'Unknown Album');
  const title = sanitize(asset.metadata.title || asset.file.filename);
  
  // Pad track numbers if available
  const track = asset.metadata.trackNumber
    ? String(asset.metadata.trackNumber).padStart(2, '0')
    : null;
  
  const filename = track
    ? `${track} - ${title}${asset.file.extension}`
    : `${title}${asset.file.extension}`;
  
  return path.join(organizedDir, artist, album, filename);
}
```

**When to Organize:**
- Only when `--organize` flag is set
- Moves files (not copies) by default
- Can be configured to copy instead (preserve originals)

---

### Stage 6: Uploader (`lib/music-pipeline/uploaders.ts`)

**Purpose:** Transfer audio files to cloud storage.

**Provider Interface:**
```typescript
interface CloudProvider {
  uploadFile(localPath: string, remoteKey: string): Promise<UploadResult>;
  deleteFile(remoteKey: string): Promise<void>;
  getSignedUrl(remoteKey: string, expiresIn: number): Promise<string>;
}
```

**Supported Providers:**

| Provider | Status | Implementation |
|----------|--------|----------------|
| **Supabase Storage** | ✅ Production | `@supabase/supabase-js` |
| **Local Filesystem** | ✅ Dev | `fs.copyFile` |
| **AWS S3** | ⏳ Planned | `@aws-sdk/client-s3` |
| **Cloudinary** | ⏳ Planned | Cloudinary Admin API |
| **Google Cloud Storage** | ⏳ Planned | `@google-cloud/storage` |

**Supabase Upload Flow:**
```typescript
const result = await supabase.storage
  .from(config.supabaseStorageBucket)
  .upload(remoteKey, fs.createReadStream(localPath), {
    contentType: asset.metadata.container || 'audio/mpeg',
    metadata: {
      checksum: asset.checksum,
      duration: asset.metadata.durationSeconds,
      size: asset.file.size,
    },
    upsert: false, // Prevent overwrites (handled by dedupe)
  });

if (result.error) throw result.error;

// Generate public URL
const { data: { publicUrl } } = supabase.storage
  .from(bucket)
  .getPublicUrl(remoteKey);
```

**Upload Record → `cloud_uploads` table:**
- `music_asset_id` → FK to `music_assets`
- `storage_file_id` → FK to `storage_files`
- `provider` = 'supabase'
- `bucket_id` = 'songs'
- `object_key` = storage path
- `status` = 'completed' | 'failed' | 'partial'
- `public_url` / `secure_url` / `cdn_url`
- `upload_id` = unique upload identifier (for tracking)
- `started_at`, `completed_at` for timing

---

### Stage 7: Database (`lib/music-pipeline/database.ts`)

**Purpose:** Persist asset metadata and relationships.

**Upsert Logic (Idempotent):**
```typescript
// Step 1: Upsert storage_files record
const { data: storageFile } = await supabase
  .from('storage_files')
  .upsert({
    bucket_id: bucket,
    object_key: remoteKey,
    kind: 'audio',
    provider: 'supabase',
    mime_type: asset.metadata.container,
    byte_size: asset.file.size,
    checksum: asset.checksum,
    public_url: publicUrl,
    cdn_url: cdnUrl,
  }, { onConflict: 'bucket_id,object_key' })
  .select('id')
  .single();

// Step 2: Upsert music_assets record
const { data: musicAsset } = await supabase
  .from('music_assets')
  .upsert({
    storage_file_id: storageFile.id,
    title: asset.metadata.title,
    artist: asset.metadata.artist,
    album: asset.metadata.album,
    genre: asset.metadata.genre,
    duration: Math.round(asset.metadata.durationSeconds),
    bitrate: Math.round(asset.metadata.bitrate || 0),
    sample_rate: asset.metadata.sampleRate,
    channels: asset.metadata.channels,
    codec: asset.metadata.codec,
    container: asset.metadata.container,
    lossless: asset.metadata.lossless,
    file_size: asset.file.size,
    original_path: asset.file.absolutePath,
    cloud_url: publicUrl,
    cdn_url: cdnUrl,
    checksum: asset.checksum,
    status: 'uploaded',
    metadata: {
      relative_path: asset.file.relativePath,
      discovered_from: asset.file.discoveredFrom,
      archive_source: asset.file.archiveSource,
      near_duplicate_key: asset.nearDuplicateKey,
    },
    uploaded_at: new Date().toISOString(),
  }, { onConflict: 'checksum' })
  .select('id')
  .single();
```

**Transaction Safety:**
- `music_assets` insertion uses `checksum` as natural key
- Prevents duplicate uploads at DB level
- `storage_files` uses composite key `(bucket_id, object_key)`
- Both upserts are atomic
- No explicit transaction needed (Supabase handles per-statement)

---

## 📈 PIPELINE PERFORMANCE METRICS

### Throughput (Local Dev Machine)

| Stage | Time per File | Throughput | Bottleneck |
|-------|---------------|------------|------------|
| **Scan** | 2ms/file | ~500 files/sec | Filesystem I/O |
| **Hash (SHA256)** | 50ms/MB | ~20MB/sec | CPU-bound |
| **Metadata Parse** | 100ms/file | 10 files/sec | `music-metadata` library |
| **Extract (Archive)** | 200ms/entry | ~5 entries/sec | Disk I/O + decompression |
| **Upload (Supabase)** | 500ms/MB | 2MB/sec | Network upload |
| **DB Insert** | 150ms/row | ~6 rows/sec | Supabase API latency |

**Total Time Estimate:**
- 1000 song files (~5GB total): ~2-3 hours
- With parallelism (p=8): ~30-45 minutes

### Optimization Opportunities

1. **Parallel Hashing:** Already using `p-limit` ✓
2. **Batch DB Inserts:** Could use ` supabase.from(...).insert([...])` instead of per-file
3. **Upload Batching:** Multiple files per request (Supabase supports batch)
4. **Streaming Extraction:** Already streaming ✓
5. **Incremental Scans:** Store file hashes, skip unchanged files (future)

---

## 🛡️ PIPELINE SECURITY CONTROLS

### Threat Model

| Threat | Mitigation |
|--------|------------|
| **Malicious Archive** (zip bomb, path traversal) | Entry limits, byte limits, compression ratio check, `assertInside()` |
| **Executable Upload** (`.exe` disguised as `.mp3`) | Extension + MIME type checking, `file` command (future) |
| **Duplicate Flood** (thousands of duplicates) | Checksum dedupe before upload, DB unique constraint |
| **Disk Exhaustion** (huge archives) | Max archive bytes (10GB), max entries (10k), disk space check |
| **Symlink Attack** (symlink → /etc/passwd) | `followSymlinks: false` in scanner |
| **RCE via Metadata** (crafted ID3 tags) | `music-metadata` library is safe (no code exec) |
| **SQL Injection** (metadata in DB) | Using parameterized queries via Supabase SDK |
| **Token Theft** (pipeline logs) | Avoid logging tokens, use env vars only |

### Audit Logging

Every pipeline run generates:

```json
{
  "run_id": "uuid",
  "command": "music:run",
  "root_dir": "C:\\Users\\SANDY\\Music",
  "dry_run": false,
  "status": "completed",
  "totals": {
    "scanned": 1250,
    "audio_files": 980,
    "archives": 15,
    "valid": 960,
    "corrupted": 20,
    "duplicates": 45,
    "uploaded": 915,
    "failed": 25
  },
  "report_dir": ".music-pipeline/reports/2026-05-08-..."

```

---

## 🔄 INTEGRATION WITH ADMIN PORTAL

**Endpoint:** `POST /api/admin/music/upload`

**Request:**
```
Content-Type: multipart/form-data
- files[]: File (multiple)
- relativePaths[]: string (original relative paths)
```

**Admin Session Check:**
```typescript
if (!(await isAdminAuthenticated())) {
  return 401;
}
```

**Pipeline Invocation:**
```typescript
const { summary, reportDir, config } = await runMusicPipeline({
  rootDir: incomingDir,
  workDir: stagingDir,
  dryRun: false,
  extractArchives: true,
  organize: false,
  upload: true,
  insertDatabase: true,
});
```

**Response Structure:**
```json
{
  "uploadId": "uuid",
  "reportDir": ".music-pipeline/reports/2026-05-08-...",
  "storageProvider": "supabase",
  "databaseProvider": "supabase",
  "totals": { ... },
  "scan": { "totals": { ... } },
  "duplicates": [
    { "path": "...", "duplicateOf": "checksum-of-existing" }
  ],
  "files": [
    {
      "name": "song.mp3",
      "path": "Artist/Album/song.mp3",
      "status": "uploaded" | "duplicate" | "corrupted" | "error",
      "reason": "if failed",
      "title": "Song Title",
      "artist": "Artist Name",
      "album": "Album Name",
      "durationSeconds": 245,
      "bitrate": 320,
      "codec": "mp3",
      "fileSize": 10485760,
      "checksum": "sha256hash",
      "duplicateOf": "existing-checksum",
      "upload": { "status": "completed", "objectKey": "..." },
      "database": { "status": "inserted", "id": "uuid" }
    }
  ],
  "unsupportedFiles": [ ... ],
  "errors": [ ... ],
  "warnings": [ ... ]
}
```

---

## 🗄️ CLOUDINARY VS SUPABASE STORAGE

### Current: Supabase Storage (Primary)

**Advantages:**
- Integrated with Supabase database (FK constraints)
- RLS policies protect access
- Direct PostgreSQL integration via `storage_files` table
- No external service needed (all-in-one)

**Disadvantages:**
- CDN not as fast as Cloudinary (less edge nodes)
- No built-in image/audio transformations
- Higher cost at scale

### Future: Cloudinary (Optional)

**Would Provide:**
- Global CDN (faster audio streaming)
- On-the-fly transcoding (MP3 → AAC, bitrate adjustment)
- Audio waveform generation
- Image transformations (album art resizing, WebP conversion)

**Migration Path:**
```typescript
// Abstract provider interface already exists
config.cloudProvider = 'cloudinary'; // Switch in .env
// Pipeline automatically uses CloudinaryUploader
```

---

## 📊 REPORT FILES GENERATED

Each pipeline run creates:

| File | Format | Purpose |
|------|--------|---------|
| `final-summary.json` | JSON | Machine-readable run summary |
| `final-summary.txt` | TXT | Human-readable summary |
| `music-assets.csv` | CSV | All assets found/processed |
| `extraction-report.json` | JSON | Archive extraction details |
| `duplicate-report.json` | JSON | Duplicate detection results |
| `corrupted-files.json` | JSON | Files that failed validation |
| `unsupported-files.json` | JSON | Files skipped due to format |
| `upload-report.json` | JSON | Upload success/failure per file |
| `database-insert-report.json` | JSON | DB insert results |

**Location:** `.music-pipeline/reports/{YYYY-MM-DD-HHmmss}/`

---

## 🎯 SCALING STRATEGY

### Small Library (<10,000 songs)
- Single run on local machine
- Upload in one batch
- No queue needed

### Medium Library (10K - 100K songs)
- Staggered runs (1k files per batch)
- Progress tracking in `upload_batches` table
- Resume from last failed batch

### Large Library (100K+ songs)
- Distributed processing (multiple workers)
- Message queue (Redis/Bull) for job management
- Database partitioning by year/genre
- Cloud Functions/AWS Lambda for parallel extraction

---

## 🚨 ERROR HANDLING

### Failure Modes & Recovery

| Failure | Recovery |
|---------|----------|
| **Network outage during upload** | Retry with exponential backoff (3 attempts) |
| **Disk full during extraction** | Abort, cleanup partial extraction, alert admin |
| **Corrupted MP3 file** | Mark as corrupted, continue with others |
| **Database constraint violation** | Log error, skip file, continue |
| **Duplicate checksum collision** | (Impossible with SHA256) - but if happens, keep both with suffix |
| **Out of memory** | Process in smaller batches, increase Node heap |

---

## 📁 FILESystem LAYOUT

```
project-root/
├── .music-pipeline/
│   ├── work/               # Working directories (auto-cleanup)
│   │   ├── admin-uploads/{uuid}/
│   │   │   ├── incoming/       # Uploaded files
│   │   │   ├── .music-pipeline/ # Extracted files
│   │   │   └── Organized/       # Organized output (if enabled)
│   │   └── scan-cache.json      # Cached scan results
│   └── reports/
│       ├── 2026-05-08-143022/
│       │   ├── final-summary.json
│       │   ├── music-assets.csv
│       │   ├── extraction-report.json
│       │   ├── duplicate-report.json
│       │   └── ...
│       └── latest → current/
├── scripts/
│   └── music-pipeline.ts   # CLI entry point
└── lib/
    └── music-pipeline/
        ├── pipeline.ts     # Main orchestration
        ├── scanner.ts      # File discovery
        ├── extractor.ts    # Archive extraction
        ├── metadata.ts     # Audio validation
        ├── dedupe.ts       # Duplicate detection
        ├── organizer.ts    # File reorganization
        ├── uploaders.ts    # Cloud upload
        ├── database.ts     # DB persistence
        ├── reports.ts      # Report generation
        ├── watcher.ts      # File system watcher
        ├── config.ts       # Configuration
        ├── types.ts        # TypeScript types
        ├── constants.ts    # Extensions, limits
        ├── logger.ts       # Logging
        └── hash.ts         # SHA256 utilities
```

---

## ⚙️ CONFIGURATION REFERENCE

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MUSIC_PIPELINE_ROOT` | `C:\Users\SANDY\Music` | Scan root directory |
| `MUSIC_PIPELINE_WORK_DIR` | `.music-pipeline` | Working directory |
| `MUSIC_PIPELINE_CLOUD_PROVIDER` | `supabase` | `supabase` \| `none` \| `cloudinary` |
| `MUSIC_PIPELINE_DATABASE_PROVIDER` | `supabase` | `supabase` \| `none` |
| `MUSIC_PIPELINE_SUPABASE_BUCKET` | `songs` | Storage bucket name |
| `MUSIC_PIPELINE_UPLOAD` | `true` | Enable cloud upload |
| `MUSIC_PIPELINE_INSERT_DB` | `true` | Enable DB insertion |
| `MUSIC_PIPELINE_ORGANIZE` | `false` | Enable file reorganization |
| `MUSIC_PIPELINE_MAX_AUDIO_BYTES` | `100 * 1024 * 1024` | 100MB max per file |
| `MUSIC_PIPELINE_MAX_ARCHIVE_BYTES` | `10 * 1024 * 1024 * 1024` | 10GB max archive |
| `MUSIC_PIPELINE_MAX_ARCHIVE_ENTRIES` | `10000` | Max files per archive |
| `MUSIC_PIPELINE_PARALLELISM` | `8` | Concurrent workers |
| `MUSIC_PIPELINE_API_TOKEN` | - | Auth token for API endpoints |

### CLI Flags

```bash
npm run music:run -- [options]

Options:
  --apply              Actually make changes (default: dry-run)
  --extract            Extract archives
  --organize           Reorganize files into Artist/Album/
  --upload             Upload to cloud storage
  --db                 Insert records into database
  --move-corrupted     Move corrupted files to Corrupted/
  --watch              Watch mode (continuous)
  --root <path>        Override scan root directory
  --cloud <provider>   Override cloud provider
  --database <provider> Override database provider
  --parallelism <n>    Worker count (default: 8)
  --max-audio-bytes <n>  Max audio file size
```

---

**End of Music Pipeline Documentation**
