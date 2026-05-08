# Database Performance Report

## Workload Profile

- Catalog reads are the primary user-facing read path: songs, albums, artists, playlists.
- Upload writes are bursty and admin-driven: queue rows, validation rows, duplicate reports, storage references, asset metadata.
- Playback analytics can become high-volume if every play/seek/skip is persisted.

## Index Strategy

- B-tree indexes cover foreign keys and ordering:
  - `songs(album_id)`, `songs(artist_id)`, `playlist_songs(playlist_id, position)`, `likes(user_id, liked_at)`, `recently_played(user_id, played_at)`.
- GIN indexes cover full-text search:
  - `songs.search_vector`, `artists.search_vector`, `albums.search_vector`, `playlists.search_vector`.
- Trigram indexes cover partial text matching:
  - `songs.title`, `artists.name`, `albums.title`.
- Partial indexes exclude soft-deleted records where relevant.
- Upload dedupe uses unique `music_assets.checksum` and secondary checksum indexes on queue/storage rows.

## Scaling Notes

- Use keyset pagination for very large song/playback/event lists once datasets grow beyond tens of thousands of rows.
- Keep `playback_events` append-only; roll up long-term analytics into daily aggregate tables if event volume becomes high.
- Use `music_assets.checksum` before upload to avoid duplicate storage costs.
- Keep browser upload max size aligned with Supabase bucket limits. Current production target is `25MB`.
- Use `reports` and `logs` buckets for long JSON/CSV artifacts rather than storing full report payloads in row columns.

## Query Recommendations

- Prefer `search_catalog()` for global search because it uses generated vectors and centralizes filtering.
- For playlist details, select playlist metadata and songs separately or use a bounded join. Avoid unbounded JSON aggregation for playlists over 1000 songs.
- For admin dashboards, filter upload batches by `(status, created_at desc)` and load queue items by `batch_id`.
- For duplicate checks, query `music_assets` by exact checksum before metadata/near-duplicate comparison.

## Future Optimizations

- Add daily aggregate tables for playback counts and upload reliability once analytics volume grows.
- Add a materialized `catalog_search` view if search needs cross-entity ranking with very large catalogs.
- Add Supabase read replicas or external search only after Postgres full-text/trigram indexes become insufficient.
