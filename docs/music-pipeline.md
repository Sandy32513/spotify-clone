# Music Asset Pipeline

This project includes a reusable TypeScript pipeline for scanning, extracting, validating, deduplicating, organizing, uploading, and registering music assets from:

```text
C:\Users\SANDY\Music
```

The pipeline is safe by default. Commands run as dry runs unless `--apply` is provided.

## Architecture Analysis

- Scanner: recursively indexes folders, audio files, archives, unsupported files, hidden files, empty folders, duplicate filenames, and total storage.
- Extractor: handles `.zip`, `.tar`, `.tar.gz`, `.tgz`, `.gz`, and optional `.rar`/`.7z` via `7z` on PATH. It blocks path traversal and enforces archive entry and byte limits.
- Validator: parses audio with `music-metadata`, extracts duration/bitrate/codec/sample rate/channels, and marks 0-byte or unreadable files as corrupted.
- Deduper: computes SHA256 for exact duplicate detection and metadata-derived near duplicate grouping.
- Organizer: can move valid files to `Artist/Album/Song.ext` and corrupted files to `Corrupted`, only when explicitly enabled.
- Uploaders: supports `none`, local filesystem upload, and Supabase Storage. The provider interface is isolated for future S3/Firebase/Azure adapters.
- Database: inserts/upserts into Supabase `music_assets` by checksum.
- Reports: writes JSON, CSV, and TXT reports per run under `.music-pipeline/reports`.
- Watcher: monitors new files and queues follow-up runs with write-finish protection.
- Admin portal: `/admin/music` provides protected browser uploads, folder picker support, drag-and-drop intake, progress, duplicate warnings, upload summaries, and dry-run library analysis.

## Security Controls

- Dry-run default prevents accidental moves/uploads.
- Archive extraction is isolated under `.music-pipeline/extracted`.
- Archive paths are normalized and checked for traversal before writing.
- Maximum archive entry and byte limits reduce zip bomb risk.
- Filenames and metadata path segments are normalized and stripped of illegal characters.
- API access requires `MUSIC_PIPELINE_API_TOKEN`.
- API scans are restricted to `MUSIC_PIPELINE_ROOT`.
- Duplicate uploads are prevented by checksum-based object keys and DB uniqueness.
- Browser uploads require an HTTP-only signed admin session cookie.
- Default admin credentials are `admin` / `admin@123`; override them with `ADMIN_USERNAME` and `ADMIN_PASSWORD` before deployment.
- Executable/script uploads are rejected, and dangerous archive entries are skipped or fail extraction.

## Performance Controls

- Hashing/validation uses bounded concurrency.
- Uploads use a separate bounded concurrency limit.
- File uploads use streams where supported.
- Reports are written once per run.
- Watch mode coalesces multiple file events into queued runs.
- Browser uploads enforce a 25 MB single-file limit and 1 GB batch limit before server-side processing.
- Nested archive extraction is bounded by `MUSIC_PIPELINE_MAX_ARCHIVE_DEPTH`.

## Commands

Read-only analysis:

```bash
npm run music:analyze
```

Extract archives in dry-run mode:

```bash
npm run music:run -- --extract
```

Extract, organize, upload to Supabase, and insert DB rows:

```bash
npm run music:run -- --apply --extract --organize --move-corrupted --upload --db --cloud=supabase --database=supabase
```

Watch the music folder:

```bash
npm run music:watch -- --extract --upload --db --cloud=supabase --database=supabase
```

Open the admin portal:

```text
http://localhost:3000/admin/music
```

Click `Upload Songs` to trigger admin login, then use the file picker, folder picker, or drag-and-drop zone.

Use a different root:

```bash
npm run music:analyze -- --root="D:\Music Import"
```

## Supabase Setup

1. Run `supabase/migrations/001_initial_schema.sql` in the Supabase SQL editor or apply it with `supabase db push`.
2. Run `npm run supabase:storage` to create/update the required buckets.
3. Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`.
4. Use service-role credentials only from trusted local/server environments.

Recommended production values:

```env
MUSIC_PIPELINE_CLOUD_PROVIDER=supabase
MUSIC_PIPELINE_DATABASE_PROVIDER=supabase
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<strong unique password>
ADMIN_SESSION_SECRET=<long random secret>
```

Supabase notes checked against current docs:

- Storage uploads require a bucket to exist before upload.
- Service-role keys bypass Storage RLS and must stay server-side only.
- Upserts return rows only when chained with `select()`, which the pipeline does for `music_assets`.

## Reports

Each run writes:

- `final-summary.json`
- `final-summary.txt`
- `music-assets.csv`
- `extraction-report.json`
- `duplicate-report.json`
- `corrupted-files.json`
- `unsupported-files.json`
- `upload-report.json`
- `database-insert-report.json`

## Scaling Recommendations

- Move extraction and upload work into a durable queue for very large libraries.
- Store scan state in SQLite/Postgres to avoid hashing unchanged files every run.
- Add S3 multipart upload adapter for files over 100 MB.
- Generate waveform peaks during validation and store them in DB for fast UI rendering.
- Keep Supabase Storage buckets private and issue signed URLs for production audio.

## API Reference

- `POST /api/admin/login`: creates an admin upload session.
- `POST /api/admin/logout`: clears the admin upload session.
- `GET /api/admin/session`: returns admin session state.
- `POST /api/admin/music/analyze`: dry-run analysis of `MUSIC_PIPELINE_ROOT`.
- `POST /api/admin/music/upload`: multipart upload endpoint using `files` and `relativePaths` form fields.

## Current Provider Support

Executable adapters are implemented for:

- Supabase Storage
- Local filesystem upload for development dry-runs
- Supabase Postgres metadata upserts

The provider boundary is isolated in `lib/music-pipeline/uploaders.ts` and `lib/music-pipeline/database.ts` so AWS S3, Firebase Storage, Azure Blob, Cloudinary, and Google Drive can be added without changing scanner, validation, dedupe, or reports.
