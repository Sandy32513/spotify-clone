# API To Database Mapping

## Public App

| Area | Code Path | Tables | Notes |
| --- | --- | --- | --- |
| Home feed | `app/page.tsx`, `lib/supabase/queries.ts#getAllSongs` | `songs` | Reads published, non-deleted songs ordered by `created_at`. |
| Search | `app/search/page.tsx`, `searchAll` | `songs`, `albums`, `artists`, `playlists` | Use `search_catalog()` or generated `search_vector` indexes for production search. |
| Library | `app/library/page.tsx` | `playlists`, `albums`, `artists` | User playlists are isolated by `user_id`; catalog reads are public. |
| Playlist detail | `app/playlist/[id]/page.tsx` | `playlists`, `playlist_songs`, `songs` | RLS exposes public playlists or owned/collaborative playlists. |
| Album detail | `app/album/[id]/page.tsx` | `albums`, `songs` | Indexed by `songs.album_id`. |
| Liked songs | `app/liked/page.tsx` | `likes`, `songs` | Current UI reads all songs; production query should use `likes`. |
| Playback | `store/playerStore.ts`, `Player.tsx` | `playback_events`, `recently_played`, `songs` | `record_playback_event()` inserts analytics and increments `songs.play_count`. |

## API Routes

| Route | Tables | Operations |
| --- | --- | --- |
| `GET /api/songs` | `songs` | Select published catalog rows. |
| `POST /api/songs` | `songs`, `artists`, `albums`, `song_artists` | Admin/curator catalog write. |
| `GET /api/playlists` | `playlists` | Public list or filtered by owner. |
| `POST /api/playlists` | `playlists` | Authenticated insert with `user_id = auth.uid()`. |
| `GET /api/playlists/[id]` | `playlists`, `playlist_songs`, `songs` | Visibility-aware playlist load. |
| `PATCH /api/playlists/[id]` | `playlists` | Owner/admin update. |
| `DELETE /api/playlists/[id]` | `playlists` | Owner/admin delete, preferably soft delete in a future route update. |

## Admin Upload Portal

| Route | Tables | Operations |
| --- | --- | --- |
| `POST /api/admin/music/analyze` | `pipeline_runs`, `pipeline_errors` | Dry-run analysis can persist run summaries. |
| `POST /api/admin/music/upload` | `upload_batches`, `upload_queue_items`, `storage_files`, `music_assets`, `validation_reports`, `duplicate_reports`, `cloud_uploads`, `audit_logs` | Full upload lifecycle. |
| Pipeline CLI/watcher | Same upload tables plus `extraction_reports` | Used for recursive folder scanning, archives, validation, dedupe, storage upload, and metadata inserts. |

## Storage Buckets

| Bucket | Access | Purpose |
| --- | --- | --- |
| `songs` | Public read, admin write | Legacy-compatible playable audio bucket used by current env. |
| `music-assets` | Public read, admin write | Canonical playable audio bucket for future uploads. |
| `temp-uploads` | Private, admin write | Temporary browser uploads and archives. |
| `extracted-files` | Private, admin write | Safe extraction output. |
| `user-uploads` | Private, owner-scoped | Future user-generated uploads. |
| `logs` | Private, admin write | Pipeline logs. |
| `reports` | Private, admin write | JSON/CSV/TXT reports. |
