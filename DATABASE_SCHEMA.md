# 🗄️ DATABASE ER DIAGRAM - Supabase PostgreSQL

**Version:** 1.0  
**Schema:** `public`  
**Tables:** 30  
**Indexes:** 45+  
**Extensions:** pgcrypto, citext, pg_trgm, btree_gin

---

## 📊 COMPLETE ENTITY-RELATIONSHIP DIAGRAM

```mermaid
erDiagram
    %% ================ AUTH & RBAC ================
    users ||--o{ user_roles : "has"
    users ||--o{ playlists : "owns"
    users ||--o{ likes : "likes"
    users ||--o{ recently_played : "plays"
    users ||--o{ playback_events : "emits"
    users ||--o{ notifications : "receives"
    users ||--o{ audit_logs : "acts"
    users ||--o{ activity_logs : "performs"
    users ||--o{ storage_files : "uploads"
    
    roles ||--o{ user_roles : "assigned"
    roles ||--o{ role_permissions : "grants"
    permissions ||--o{ role_permissions : "included"
    
    admin_accounts }|--|| users : "references"
    admin_accounts ||--o{ admin_sessions : "has"
    admin_sessions }|--|| admin_accounts : "belongs"
    
    %% ================ MUSIC CATALOG ================
    artists ||--o{ albums : "releases"
    artists ||--o{ song_artists : "credits"
    artists ||--o{ music_assets : "source"
    
    albums ||--o{ songs : "contains"
    albums ||--o{ music_assets : "source"
    
    genres ||--o{ song_genres : "classifies"
    
    songs ||--o{ song_artists : "has"
    songs ||--o{ song_genres : "tagged"
    songs ||--o{ playlist_songs : "listed"
    songs ||--o{ likes : "liked"
    songs ||--o{ recently_played : "played"
    songs ||--o{ playback_events : "measured"
    songs ||--o{ music_assets : "source"
    
    %% ================ PLAYLISTS ================
    playlists ||--o{ playlist_songs : "contains"
    playlists ||--o{ playlist_collaborators : "shares"
    
    playlist_collaborators }|--|| playlists : "collaborates_on"
    playlist_collaborators }|--|| users : "collaborator"
    
    %% ================ UPLOAD PIPELINE ================
    upload_batches ||--o{ upload_queue_items : "queues"
    upload_batches ||--o{ extraction_reports : "extracts"
    upload_batches ||--o{ validation_reports : "validates"
    upload_batches ||--o{ duplicate_reports : "dedupes"
    upload_batches ||--o{ storage_files : "uploads"
    upload_batches ||--o{ music_assets : "creates"
    upload_batches ||--o{ pipeline_errors : "reports"
    upload_batches ||--o{ audit_logs : "logs"
    
    upload_queue_items }|--|| upload_batches : "belongs"
    extraction_reports }|--|| upload_batches : "for_batch"
    validation_reports }|--|| upload_batches : "for_batch"
    duplicate_reports }|--|| upload_batches : "for_batch"
    storage_files }|--|| upload_batches : "belongs"
    music_assets }|--|| upload_batches : "belongs"
    
    storage_files ||--o{ music_assets : "stores"
    storage_files ||--o{ cloud_uploads : "references"
    
    music_assets ||--o{ cloud_uploads : "uploads"
    music_assets ||--o{ validation_reports : "has"
    music_assets ||--o{ duplicate_reports : "duplicates"
    
    %% ================ PIPELINE EXECUTION ================
    pipeline_runs ||--o{ pipeline_errors : "reports"
    pipeline_runs ||--o{ upload_batches : "orchestrates"
    
    %% ================ ANALYTICS & SYSTEM ================
    system_settings : key value description is_public updated_by updated_at
    notifications : id user_id title body type read_at metadata created_at
    playback_events : id user_id song_id event_type position_seconds device_id room_id metadata created_at
    
    %% ================ RELATIONSHIP LEGEND ================
    note1[||--o{ : One-to-Many<br/>e.g., users → playlists]
    note2[}|--|| : Many-to-One (FK)<br/>e.g., playlists → users]
    note3[||--|| : One-to-One<br/>e.g., admin_accounts → users]
```

---

## 📋 TABLE REFERENCE

### Core Music Tables

| Table | Rows (est.) | Purpose | Indexes |
|-------|-------------|---------|---------|
| `artists` | 10K-100K | Artist metadata | `artists_name_trgm_idx`, `artists_search_idx` |
| `albums` | 50K-500K | Album metadata | `albums_artist_idx`, `albums_search_idx` |
| `songs` | 500K-5M | Song catalog (published) | `songs_search_idx`, `songs_status_created_idx` |
| `genres` | 50-200 | Genre lookup | PK |
| `song_artists` | 1M-10M | Many-to-many (songs × artists) | `song_artists_artist_idx` |
| `song_genres` | 500K-5M | Many-to-many (songs × genres) | `song_genres_genre_idx` |

### User & Social Tables

| Table | Rows (est.) | Purpose | Indexes |
|-------|-------------|---------|---------|
| `users` | 10K-100K | User profiles (extends auth.users) | `users_email_idx`, `users_username_idx` |
| `playlists` | 100K-1M | User playlists | `playlists_user_idx`, `playlists_public_idx` |
| `playlist_songs` | 10M-100M | Playlist contents (ordering) | `playlist_songs_playlist_position_idx` |
| `playlist_collaborators` | 50K-500K | Shared playlist access | `playlist_collaborators_user_idx` |
| `likes` | 50M-500M | User song likes | `likes_user_idx`, `likes_song_idx` |
| `recently_played` | 100M-1B | Listening history | `recently_played_user_idx` |
| `playback_events` | 1B+ | Real-time analytics | `playback_events_user_created_idx` |

### Upload Pipeline Tables

| Table | Rows (est.) | Purpose | Indexes |
|-------|-------------|---------|---------|
| `upload_batches` | 1K-10K | Batch upload sessions | `upload_batches_status_idx` |
| `upload_queue_items` | 100K-1M | Individual file queue | `upload_queue_items_batch_idx` |
| `extraction_reports` | 10K-100K | Archive extraction logs | `extraction_reports_batch_idx` |
| `validation_reports` | 500K-5M | Per-file validation results | `validation_reports_asset_idx` |
| `duplicate_reports` | 100K-1M | Duplicate detection records | `duplicate_reports_checksum_idx` |
| `storage_files` | 1M-10M | Cloud storage object metadata | `storage_files_bucket_key_idx` |
| `music_assets` | 500K-5M | Canonical song metadata | `music_assets_checksum_idx` |
| `cloud_uploads` | 500K-5M | Upload tracking | `cloud_uploads_asset_idx` |

### Admin & RBAC Tables

| Table | Rows | Purpose |
|-------|------|---------|
| `roles` | 4 | `super_admin`, `admin`, `curator`, `listener` |
| `permissions` | 10-20 | Fine-grained permissions (catalog.read, uploads.manage, etc.) |
| `user_roles` | 10K-100K | User → role assignments |
| `role_permissions` | 20-40 | Role → permission grants |
| `admin_accounts` | 1-10 | Legacy admin accounts (migration path) |
| `admin_sessions` | 10-100 | Active admin sessions |

### Operational Tables

| Table | Rows (est.) | Purpose |
|-------|-------------|---------|
| `audit_logs` | 10M+ | Row-level change audit trail |
| `activity_logs` | 50M+ | User activity tracking |
| `notifications` | 1M+ | User notifications |
| `pipeline_runs` | 10K-100K | Pipeline execution logs |
| `pipeline_errors` | 100K-1M | Pipeline error details |
| `system_settings` | 20-50 | App configuration keys |

---

## 🔐 ROW LEVEL SECURITY (RLS) POLICIES

### Policy Summary Matrix

| Table | Select | Insert | Update | Delete | Row Filter |
|-------|--------|--------|--------|--------|------------|
| `users` | Auth + Admin | Admin only | Self/Admin | Self/Admin | `id = auth.uid()` |
| `artists` | Public | Admin | Admin | Admin | `deleted_at IS NULL` |
| `albums` | Public | Admin | Admin | Admin | `deleted_at IS NULL` |
| `songs` | Public† | Admin | Admin | Admin | `deleted_at IS NULL AND status = 'published'` |
| `playlists` | Public‡ | Auth | Owner/Admin | Owner/Admin | Visibility rules |
| `likes` | Owner/Admin | Owner/Admin | Owner/Admin | Owner/Admin | `user_id = auth.uid()` |
| `recently_played` | Owner/Admin | Owner/Admin | - | Owner/Admin | `user_id = auth.uid()` |
| `upload_*` | Admin only | Admin only | Admin only | Admin only | `(SELECT app_private.is_admin())` |

† Public = anonymous + authenticated (catalog only)  
‡ Public = `is_public = true` OR `visibility IN ('public','unlisted')` OR owner/collaborator/admin

### Policy Definitions (Examples)

**Public Songs (Catalog):**
```sql
CREATE POLICY public_read_songs ON public.songs
  FOR SELECT TO anon, authenticated
  USING (
    deleted_at IS NULL
    AND status = 'published'
  );
```

**User Profile (Owner Only):**
```sql
CREATE POLICY users_select ON public.users
  FOR SELECT TO authenticated
  USING (
    (SELECT auth.uid()) = id
    OR (SELECT app_private.is_admin())
  );
```

**Playlist Visibility:**
```sql
CREATE POLICY playlists_select ON public.playlists
  FOR SELECT TO anon, authenticated
  USING (
    deleted_at IS NULL
    AND (
      is_public = true
      OR visibility IN ('public', 'unlisted')
      OR (SELECT auth.uid()) IS NOT NULL AND user_id = (SELECT auth.uid())
      OR EXISTS (
        SELECT 1 FROM public.playlist_collaborators pc
        WHERE pc.playlist_id = id
          AND pc.user_id = (SELECT auth.uid())
      )
      OR (SELECT app_private.is_admin())
    )
  );
```

---

## 🔗 FOREIGN KEY CONSTRAINTS

### Referential Integrity

```
users.id ──┬── playlists.user_id (CASCADE)
           ├── likes.user_id (CASCADE)
           ├── recently_played.user_id (CASCADE)
           ├── playback_events.user_id (SET NULL)
           ├── playlist_collaborators.user_id (CASCADE)
           ├── user_roles.user_id (CASCADE)
           ├── storage_files.owner_user_id (SET NULL)
           └── upload_batches.initiated_by (SET NULL)

artists.id ──┬── albums.artist_id (SET NULL)
             ├── songs.artist_id (SET NULL)
             ├── song_artists.artist_id (CASCADE)
             └── music_assets.artist_id (SET NULL)

albums.id ──┬── songs.album_id (SET NULL)
            └── music_assets.album_id (SET NULL)

songs.id ────┬── song_artists.song_id (CASCADE)
             ├── song_genres.song_id (CASCADE)
             ├── playlist_songs.song_id (CASCADE)
             ├── likes.song_id (CASCADE)
             ├── recently_played.song_id (CASCADE)
             ├── playback_events.song_id (SET NULL)
             └── music_assets.song_id (SET NULL)

playlists.id ─┬── playlist_songs.playlist_id (CASCADE)
              ├── playlist_collaborators.playlist_id (CASCADE)
              └── music_assets.playlist_id (SET NULL)

upload_batches.id ─┬── upload_queue_items.batch_id (CASCADE)
                   ├── extraction_reports.batch_id (CASCADE)
                   ├── validation_reports.batch_id (CASCADE)
                   ├── duplicate_reports.batch_id (CASCADE)
                   ├── storage_files.upload_batch_id (SET NULL)
                   ├── music_assets.upload_batch_id (SET NULL)
                   ├── pipeline_runs.batch_id (SET NULL)
                   └── audit_logs.batch_id (SET NULL)
```

**CASCADE Strategy:**
- User deletion → delete all user-owned data (playlists, likes, etc.)
- Song/artist deletion → preserve playlist_songs but remove song reference (SET NULL)
- Upload batch deletion → preserve music_assets but clear batch reference
- Soft delete preferred (`deleted_at` column) over hard delete

---

## 📈 INDEX STRATEGY

### Index Types Used

| Type | Use Case | Examples |
|------|----------|----------|
| **B-tree** | Equality/range queries | PKs, FKs, dates, enums |
| **GIN** | Full-text search | `search_vector` columns |
| **GIN (trigram)** | Partial text search | `title`, `name` with `ilike '%query%'` |
| **BTREE_GIN** | Composite GIN | Mixed column queries |

### Critical Indexes

**Catalog Queries:**
```sql
-- Get all published songs (home page)
SELECT * FROM songs
WHERE deleted_at IS NULL AND status = 'published'
ORDER BY created_at DESC
LIMIT 50;
-- Uses: songs_status_created_idx (partial index)
```

**Search:**
```sql
SELECT * FROM songs
WHERE search_vector @@ plainto_tsquery('simple', 'query')
ORDER BY ts_rank(search_vector, query) DESC;
-- Uses: songs_search_idx (GIN)
```

**Playlist Songs (Ordered):**
```sql
SELECT * FROM playlist_songs
WHERE playlist_id = $1
ORDER BY position;
-- Uses: playlist_songs_playlist_position_idx (composite)
```

**User Library:**
```sql
SELECT * FROM playlists
WHERE user_id = $1 AND deleted_at IS NULL
ORDER BY created_at DESC;
-- Uses: playlists_user_idx (composite)
```

---

## 🎯 DATABASE SIZE PROJECTIONS

### 3 Years Growth Estimate

| Table | Year 1 | Year 2 | Year 3 |
|-------|--------|--------|--------|
| `songs` | 500K | 1.5M | 3M |
| `playback_events` | 500M | 2B | 6B |
| `recently_played` | 50M | 200M | 600M |
| `likes` | 5M | 20M | 60M |
| `upload_batches` | 1K | 3K | 10K |
| `audit_logs` | 10M | 40M | 120M |

**Estimated DB Size:** 500GB - 2TB after 3 years (requires scale-up)

**Mitigation:**
- Partition `playback_events` by month (PostgreSQL declarative partitioning)
- Archive old `recently_played` to Parquet on Cloud Storage
- Summary tables for analytics (daily aggregates)

---

## 🔍 SAMPLE QUERIES

### 1. Get User's Playlists with Song Counts
```sql
SELECT 
  p.*,
  COUNT(ps.song_id) AS song_count
FROM playlists p
LEFT JOIN playlist_songs ps ON ps.playlist_id = p.id
WHERE p.user_id = $1 AND p.deleted_at IS NULL
GROUP BY p.id
ORDER BY p.created_at DESC;
```

### 2. Get Playlist with Songs (Ordered)
```sql
SELECT 
  p.*,
  ps.position,
  s.*
FROM playlists p
JOIN playlist_songs ps ON ps.playlist_id = p.id
JOIN songs s ON s.id = ps.song_id
WHERE p.id = $1 AND p.deleted_at IS NULL
  AND s.deleted_at IS NULL AND s.status = 'published'
ORDER BY ps.position;
```

### 3. Search Catalog (Using search_catalog function)
```sql
SELECT * FROM public.search_catalog('beatles', 20);
-- Returns: entity_type, entity_id, title, subtitle, image_url, rank
```

### 4. Get Recently Played with Song Details
```sql
SELECT 
  rp.*,
  s.title, s.artist, s.thumbnail, s.duration
FROM recently_played rp
JOIN songs s ON s.id = rp.song_id
WHERE rp.user_id = $1
ORDER BY rp.played_at DESC
LIMIT 20;
```

### 5. Increment Play Count (Atomic)
```sql
UPDATE songs
SET play_count = play_count + 1
WHERE id = $1
RETURNING play_count;
```

---

## 📊 CONSTRAINTS & CHECKS

### Column Constraints

| Column | Constraint | Purpose |
|--------|------------|---------|
| `users.email` | `UNIQUE`, `NOT NULL` | Prevent duplicate accounts |
| `users.username` | `CHECK (username ~* '^[a-z0-9_][a-z0-9_.-]{2,31}$')` | Username format validation |
| `songs.duration` | `CHECK (duration >= 0)` | Non-negative duration |
| `songs.disc_number` | `CHECK (disc_number > 0)` | Disc numbering starts at 1 |
| `songs.track_number` | `CHECK (track_number IS NULL OR track_number > 0)` | Optional track numbers |
| `albums.release_year` | `CHECK (release_year BETWEEN 1800 AND 2200)` | Reasonable year range |
| `music_assets.file_size` | `CHECK (file_size >= 0)` | Non-negative size |
| `system_settings.key` | `CHECK (key ~ '^[a-z][a-z0-9_.:-]*$')` | Valid setting key format |

---

## 🔄 TRIGGERS

### Automatic Timestamps

```sql
-- Updated at trigger (all tables)
CREATE TRIGGER set_table_updated_at
  BEFORE UPDATE ON table_name
  FOR EACH ROW EXECUTE FUNCTION app_private.set_updated_at();
```

**Applies to:** users, roles, permissions, user_roles, admin_accounts, admin_sessions, artists, albums, songs, music_assets, playlists, playlists_albums, playlists_songs, playlists_collaborators, upload_batches, storage_files, pipeline_runs

### Audit Logging

```sql
CREATE TRIGGER audit_songs_changes
  AFTER INSERT OR UPDATE OR DELETE ON songs
  FOR EACH ROW EXECUTE FUNCTION app_private.audit_row_change();
```

**Captures:**
- `actor_user_id` (who made change)
- `action` (INSERT/UPDATE/DELETE)
- `entity_table`, `entity_id`
- `old_data`, `new_data` (JSONB snapshots)
- `created_at`

### Full-Text Search Vectors

```sql
-- Songs: title + artist
ALTER TABLE songs
  ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(artist, ''))
  ) STORED;

-- Auto-updated via trigger (not instant on bulk inserts)
CREATE TRIGGER songs_search_update
  BEFORE INSERT OR UPDATE OF title, artist ON songs
  FOR EACH ROW EXECUTE FUNCTION
  tsvector_update_trigger(search_vector, 'pg_catalog.simple', title, artist);
```

---

## 🏷️ ENUMS

### app_role
```sql
CREATE TYPE public.app_role AS ENUM (
  'super_admin',  -- Full system ownership
  'admin',        -- Operational administrator
  'curator',      -- Catalog metadata manager
  'listener'      -- Default user
);
```

### playlist_visibility
```sql
CREATE TYPE public.playlist_visibility AS ENUM (
  'private',   -- Owner only
  'public',    -- Anyone can view
  'unlisted'   -- Link-access only
);
```

### song_status
```sql
CREATE TYPE public.song_status AS ENUM (
  'draft',      -- Not ready for publication
  'processing', -- Being processed (transcoding, etc.)
  'published',  -- Live on platform
  'archived',   -- Hidden but retained
  'rejected'    -- Failed validation
);
```

### asset_status
```sql
CREATE TYPE public.asset_status AS ENUM (
  'discovered', 'queued', 'validating', 'valid',
  'corrupted', 'duplicate', 'uploaded', 'failed', 'skipped'
);
```

### upload_status
```sql
CREATE TYPE public.upload_status AS ENUM (
  'queued', 'processing', 'completed', 'failed', 'cancelled', 'partial'
);
```

### storage_file_kind
```sql
CREATE TYPE public.storage_file_kind AS ENUM (
  'audio', 'archive', 'extracted', 'artwork', 'report', 'log', 'temp', 'other'
);
```

---

## 🔐 STORAGE BUCKETS (Supabase)

### Bucket Configuration

| Bucket | Public? | Size Limit | MIME Types | Purpose |
|--------|---------|------------|------------|---------|
| `songs` | ✅ Yes | 25 MB | `audio/*` | Public audio playback |
| `music-assets` | ✅ Yes | 25 MB | `audio/*` | Future canonical bucket |
| `temp-uploads` | ❌ No | 25 MB | audio, archives | Admin upload staging |
| `extracted-files` | ❌ No | 25 MB | audio, json | Extracted archive contents |
| `user-uploads` | ❌ No | 25 MB | audio, image | Future user uploads |
| `logs` | ❌ No | 10 MB | text, json | Pipeline logs |
| `reports` | ❌ No | 10 MB | csv, json, txt | Batch reports |

**Storage Policies:**
- Public buckets: Anyone can read, admin-only write
- Private buckets: Owner or admin-only access
- RLS enforced on all bucket operations

---

## 📝 MIGRATION SCRIPT

**File:** `supabase/migrations/001_initial_schema.sql`

**Applies:**
1. Create all tables
2. Create all indexes
3. Enable RLS
4. Create RLS policies
5. Create functions & triggers
6. Insert seed data (roles, permissions, settings)
7. Create storage buckets

**Rollback:** `supabase/rollbacks/001_drop_production_schema.sql` (DESTRUCTIVE - drops all tables)

**To Apply:**
```bash
# Using Supabase CLI
supabase db push

# Or via SQL Editor (web)
# Copy contents of 001_initial_schema.sql
# Paste into Supabase SQL Editor
# Click "Run"
```

---

## 🔄 DATABASE MIGRATIONS

### Migration History

| Version | Date | Changes |
|---------|------|---------|
| 001 | 2026-05-08 | Initial schema (30 tables, 45 indexes, RLS, functions) |

### Future Migration Template

```sql
-- 002_add_waveform_peaks.sql
BEGIN;

-- Add waveform peak storage for audio visualization
ALTER TABLE public.songs
  ADD COLUMN waveform_peaks integer[];

-- Index for fast retrieval
CREATE INDEX songs_waveform_peaks_idx ON public.songs USING gin (waveform_peaks);

-- Update function to compute waveform (if needed)
CREATE OR REPLACE FUNCTION public.compute_waveform(audio_url text)
RETURNS integer[] AS $$
  -- Implementation with audio processing
$$ LANGUAGE plpgsql;

COMMIT;
```

---

## 📊 MONITORING QUERIES

### Table Growth Rate
```sql
SELECT 
  schemaname,
  tablename,
  n_tup_ins - n_tup_del as row_count,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Index Usage
```sql
SELECT
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as rows_read,
  idx_tup_fetch as rows_fetched,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

### Long-Running Queries
```sql
SELECT pid, query, now() - query_start AS duration
FROM pg_stat_activity
WHERE state = 'active'
  AND query_start < now() - interval '5 seconds'
ORDER BY duration DESC;
```

---

**Document Version:** 1.0  
**Last Schema Review:** 2026-05-08  
**Next Review:** Quarterly or after 10% data growth
