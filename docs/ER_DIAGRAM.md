# Production Database ER Diagram

```mermaid
erDiagram
  users ||--o{ playlists : owns
  users ||--o{ user_roles : has
  roles ||--o{ user_roles : assigned
  roles ||--o{ role_permissions : grants
  permissions ||--o{ role_permissions : included

  artists ||--o{ albums : releases
  artists ||--o{ song_artists : credits
  albums ||--o{ songs : contains
  songs ||--o{ song_artists : has
  songs ||--o{ song_genres : tagged
  genres ||--o{ song_genres : classifies

  users ||--o{ likes : likes
  users ||--o{ recently_played : plays
  users ||--o{ playback_events : emits
  songs ||--o{ likes : liked
  songs ||--o{ recently_played : played
  songs ||--o{ playback_events : measured

  playlists ||--o{ playlist_songs : contains
  songs ||--o{ playlist_songs : listed
  playlists ||--o{ playlist_collaborators : shares
  users ||--o{ playlist_collaborators : collaborates

  upload_batches ||--o{ upload_queue_items : queues
  upload_batches ||--o{ extraction_reports : extracts
  upload_batches ||--o{ validation_reports : validates
  upload_batches ||--o{ duplicate_reports : dedupes
  upload_batches ||--o{ storage_files : uploads
  upload_batches ||--o{ music_assets : creates

  storage_files ||--o{ music_assets : stores
  storage_files ||--o{ cloud_uploads : references
  music_assets ||--o{ validation_reports : has
  music_assets ||--o{ duplicate_reports : duplicates
  music_assets ||--o{ cloud_uploads : uploads
  songs ||--o{ music_assets : source

  pipeline_runs ||--o{ pipeline_errors : reports
  users ||--o{ audit_logs : acts
  users ||--o{ activity_logs : performs
  users ||--o{ notifications : receives
```

## Key Tables

- `users`: Supabase Auth profile extension linked to `auth.users`.
- `roles`, `permissions`, `user_roles`, `role_permissions`: database-backed RBAC. Authorization uses DB rows, not user-editable JWT metadata.
- `artists`, `albums`, `songs`, `genres`, `song_artists`, `song_genres`: normalized music catalog with compatibility fields used by the current UI.
- `playlists`, `playlist_songs`, `playlist_collaborators`: private/public/collaborative playlist model.
- `likes`, `recently_played`, `playback_events`: listener behavior and analytics.
- `music_assets`, `upload_batches`, `upload_queue_items`, `extraction_reports`, `validation_reports`, `duplicate_reports`, `cloud_uploads`, `storage_files`: admin upload and asset pipeline persistence.
- `pipeline_runs`, `pipeline_errors`: local watcher/CLI run reporting.
- `audit_logs`, `activity_logs`, `notifications`, `system_settings`: operational observability and configuration.

## Referential Rules

- Deleting an Auth user cascades to `users`, playlists, likes, recent history, and collaborator rows.
- Catalog content is soft deleted with `deleted_at`; destructive deletes are reserved for service-role/admin maintenance.
- Songs keep nullable references to artists/albums/storage files so catalog metadata can survive artist/album cleanup.
- Upload batches cascade to queue/report rows but not to final catalog records.

## Realtime Tables

The migration adds these tables to `supabase_realtime`:

- `upload_batches`
- `upload_queue_items`
- `notifications`
- `playlist_songs`

These are the surfaces where live UI updates are useful without flooding clients with high-volume analytics events.
