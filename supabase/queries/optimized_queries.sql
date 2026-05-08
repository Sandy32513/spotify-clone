-- Optimized application query patterns.
-- Replace :named_parameters in your API layer with Supabase query builder filters.

-- Home feed: latest playable songs.
select id, title, artist, artist_id, album_id, url, thumbnail, duration, created_at
from public.songs
where status = 'published'
  and deleted_at is null
order by created_at desc
limit :limit offset :offset;

-- Album detail with songs.
select
  a.*,
  coalesce(jsonb_agg(to_jsonb(s) order by s.disc_number, s.track_number, s.created_at) filter (where s.id is not null), '[]'::jsonb) as songs
from public.albums a
left join public.songs s on s.album_id = a.id and s.status = 'published' and s.deleted_at is null
where a.id = :album_id
  and a.deleted_at is null
group by a.id;

-- Playlist detail visible to current user or public clients.
select p.*
from public.playlists p
where p.id = :playlist_id
  and p.deleted_at is null
  and (
    p.is_public = true
    or p.visibility in ('public', 'unlisted')
    or p.user_id = auth.uid()
    or exists (
      select 1 from public.playlist_collaborators pc
      where pc.playlist_id = p.id and pc.user_id = auth.uid()
    )
  );

-- Playlist songs in stable playback order.
select ps.position, s.*
from public.playlist_songs ps
join public.songs s on s.id = ps.song_id
where ps.playlist_id = :playlist_id
  and s.status = 'published'
  and s.deleted_at is null
order by ps.position asc;

-- Full catalog search using generated tsvectors.
select *
from public.search_catalog(:query, :limit);

-- Duplicate lookup before upload.
select id, title, artist, album, checksum, status, cloud_url, cdn_url
from public.music_assets
where checksum = :sha256
  and deleted_at is null
limit 1;

-- Admin upload dashboard batches.
select id, source, admin_username, status, total_files, uploaded_files, failed_files, report_dir, created_at, completed_at
from public.upload_batches
order by created_at desc
limit :limit offset :offset;

-- Admin upload batch detail.
select
  b.*,
  coalesce(jsonb_agg(to_jsonb(q) order by q.created_at) filter (where q.id is not null), '[]'::jsonb) as queue_items
from public.upload_batches b
left join public.upload_queue_items q on q.batch_id = b.id
where b.id = :batch_id
group by b.id;

-- User liked songs.
select s.*, l.liked_at
from public.likes l
join public.songs s on s.id = l.song_id
where l.user_id = auth.uid()
  and s.status = 'published'
  and s.deleted_at is null
order by l.liked_at desc
limit :limit offset :offset;

-- Recently played.
select s.*, rp.played_at, rp.progress_seconds
from public.recently_played rp
join public.songs s on s.id = rp.song_id
where rp.user_id = auth.uid()
  and s.deleted_at is null
order by rp.played_at desc
limit :limit;

-- Admin storage inventory.
select bucket_id, kind, count(*) as files, sum(byte_size) as bytes
from public.storage_files
where deleted_at is null
group by bucket_id, kind
order by bucket_id, kind;

-- Upload reliability analytics.
select
  date_trunc('day', created_at) as day,
  count(*) as batches,
  sum(total_files) as files_seen,
  sum(uploaded_files) as files_uploaded,
  sum(failed_files) as files_failed
from public.upload_batches
group by 1
order by 1 desc;

-- ============================================================
-- USER & SOCIAL QUERIES
-- ============================================================

-- User profile with stats.
select
  u.*,
  coalesce(lc.liked_count, 0) as liked_songs_count,
  coalesce(pc.playlist_count, 0) as playlist_count,
  coalesce(pc.total_tracks, 0) as total_tracks_in_playlists
from public.users u
left join (
  select user_id, count(*)::int as liked_count
  from public.likes
  group by user_id
) lc on lc.user_id = u.id
left join (
  select user_id, count(*)::int as playlist_count, sum(track_count)::int as total_tracks
  from public.playlists
  where deleted_at is null
  group by user_id
) pc on pc.user_id = u.id
where u.id = :user_id
  and u.deleted_at is null;

-- User's public playlists (for profile viewing).
select
  p.*,
  coalesce(count(distinct ps.song_id)::int, 0) as track_count
from public.playlists p
left join public.playlist_songs ps on ps.playlist_id = p.id
where p.user_id = :user_id
  and p.deleted_at is null
  and (p.is_public = true or p.visibility in ('public', 'unlisted'))
group by p.id
order by p.created_at desc
limit :limit offset :offset;

-- User's private playlists (authenticated owner only).
select
  p.*,
  coalesce(count(distinct ps.song_id)::int, 0) as track_count
from public.playlists p
left join public.playlist_songs ps on ps.playlist_id = p.id
where p.user_id = :user_id
  and p.deleted_at is null
group by p.id
order by p.created_at desc
limit :limit offset :offset;

-- Liked songs with pagination, newest first.
select
  s.*,
  l.liked_at
from public.likes l
join public.songs s on s.id = l.song_id
where l.user_id = :user_id
  and s.status = 'published'
  and s.deleted_at is null
order by l.liked_at desc
limit :limit offset :offset;

-- Check if current user has liked a specific song.
select exists (
  select 1 from public.likes
  where user_id = auth.uid()
    and song_id = :song_id
) as is_liked;

-- Artists followed by user.
select
  a.*,
  fa.followed_at
from public.followed_artists fa
join public.artists a on a.id = fa.artist_id
where fa.user_id = :user_id
  and a.deleted_at is null
order by fa.followed_at desc
limit :limit offset :offset;

-- Check if current user follows an artist.
select exists (
  select 1 from public.followed_artists
  where user_id = auth.uid()
    and artist_id = :artist_id
) as is_followed;

-- Playlists followed by user.
select
  p.*,
  coalesce(count(distinct ps.song_id)::int, 0) as track_count,
  fp.followed_at
from public.followed_playlists fp
join public.playlists p on p.id = fp.playlist_id
left join public.playlist_songs ps on ps.playlist_id = p.id
where fp.user_id = :user_id
  and p.deleted_at is null
  and (p.is_public = true or p.visibility in ('public', 'unlisted'))
group by p.id, fp.followed_at
order by fp.followed_at desc
limit :limit offset :offset;

-- Playlist collaborators (who can edit).
select
  pc.*,
  u.username,
  u.display_name,
  u.avatar_url
from public.playlist_collaborators pc
join public.users u on u.id = pc.user_id
where pc.playlist_id = :playlist_id
  and pc.can_edit = true;

-- ============================================================
-- ARTIST & ALBUM QUERIES
-- ============================================================

-- Artist detail with songs and album count.
select
  a.*,
  coalesce(count(distinct s.id)::int, 0) as song_count,
  coalesce(count(distinct al.id)::int, 0) as album_count
from public.artists a
left join public.songs s on s.artist_id = a.id and s.status = 'published' and s.deleted_at is null
left join public.albums al on al.artist_id = a.id and al.deleted_at is null
where a.id = :artist_id
  and a.deleted_at is null
group by a.id;

-- Artist's published songs (paginated).
select
  s.*,
  al.title as album_title,
  al.thumbnail as album_cover
from public.songs s
left join public.albums al on al.id = s.album_id
where s.artist_id = :artist_id
  and s.status = 'published'
  and s.deleted_at is null
order by s.created_at desc
limit :limit offset :offset;

-- Artist's albums (with track counts).
select
  al.*,
  coalesce(count(s.id)::int, 0) as track_count,
  max(s.created_at) as latest_song_date
from public.albums al
left join public.songs s on s.album_id = al.id and s.status = 'published' and s.deleted_at is null
where al.artist_id = :artist_id
  and al.deleted_at is null
group by al.id
order by al.release_date desc nulls last, al.created_at desc;

-- Album detail with songs (already exists, keep as is).

-- All albums (paginated, with artist name).
select
  al.*,
  a.name as artist_name,
  a.image_url as artist_image,
  coalesce(count(s.id)::int, 0) as track_count
from public.albums al
join public.artists a on a.id = al.artist_id
left join public.songs s on s.album_id = al.id and s.status = 'published' and s.deleted_at is null
where al.deleted_at is null
group by al.id, a.name, a.image_url
order by al.release_date desc nulls last, al.created_at desc
limit :limit offset :offset;

-- Top songs by play count (for charts/leaderboard).
select
  s.*,
  a.name as artist_name,
  a.image_url as artist_image
from public.songs s
join public.artists a on a.id = s.artist_id
where s.status = 'published'
  and s.deleted_at is null
order by s.play_count desc
limit :limit offset :offset;

-- Trending songs (most played in last 7 days).
select
  s.*,
  a.name as artist_name,
  count(rp.id) as recent_plays
from public.songs s
join public.artists a on a.id = s.artist_id
join public.recently_played rp on rp.song_id = s.id
where s.status = 'published'
  and s.deleted_at is null
  and rp.played_at >= now() - interval '7 days'
group by s.id, a.name, a.image_url
order by recent_plays desc
limit :limit offset :offset;

-- Recently added songs (for home feed).
select
  id, title, artist, artist_id, album_id, thumbnail, duration, created_at
from public.songs
where status = 'published'
  and deleted_at is null
order by created_at desc
limit :limit offset :offset;

-- ============================================================
-- SEARCH & DISCOVERY QUERIES
-- ============================================================

-- Full-text search results (already using search_catalog function).
-- Function exists in schema: public.search_catalog(query, limit)

-- Search songs only with full-text search.
select
  s.*,
  ts_rank(s.search_vector, plainto_tsquery('simple', :query)) as rank
from public.songs s
where s.deleted_at is null
  and s.status = 'published'
  and s.search_vector @@ plainto_tsquery('simple', :query)
order by rank desc
limit :limit offset :offset;

-- Search artists only with full-text search.
select
  a.*,
  ts_rank(a.search_vector, plainto_tsquery('simple', :query)) as rank
from public.artists a
where a.deleted_at is null
  and a.search_vector @@ plainto_tsquery('simple', :query)
order by rank desc
limit :limit offset :offset;

-- Search albums only with full-text search.
select
  al.*,
  ts_rank(al.search_vector, plainto_tsquery('simple', :query)) as rank
from public.albums al
where al.deleted_at is null
  and al.search_vector @@ plainto_tsquery('simple', :query)
order by rank desc
limit :limit offset :offset;

-- Search playlists (public or user's own).
select
  p.*,
  ts_rank(p.search_vector, plainto_tsquery('simple', :query)) as rank,
  count(distinct ps.song_id)::int as track_count
from public.playlists p
left join public.playlist_songs ps on ps.playlist_id = p.id
where p.deleted_at is null
  and (
    p.is_public = true
    or p.visibility in ('public', 'unlisted')
    or p.user_id = auth.uid()
  )
  and p.search_vector @@ plainto_tsquery('simple', :query)
group by p.id
order by rank desc
limit :limit offset :offset;

-- Browse by genre (songs).
select
  s.*,
  g.name as genre_name
from public.songs s
join public.song_genres sg on sg.song_id = s.id
join public.genres g on g.id = sg.genre_id
where s.status = 'published'
  and s.deleted_at is null
  and g.name = :genre_name
order by s.play_count desc nulls last, s.created_at desc
limit :limit offset :offset;

-- Get all genres with song counts.
select
  g.*,
  count(distinct s.id)::int as song_count
from public.genres g
left join public.song_genres sg on sg.genre_id = g.id
left join public.songs s on s.id = sg.song_id and s.status = 'published' and s.deleted_at is null
group by g.id, g.name, g.slug
order by song_count desc nulls last, g.name asc;

-- ============================================================
-- PLAYBACK & HISTORY QUERIES
-- ============================================================

-- Insert playback event (calls public.record_playback_event).
-- See function definition in migrations; call via:
-- select public.record_playback_event(:song_id, :event_type, :position_seconds, :device_id, :room_id, :metadata);

-- Get user's recently played (distinct songs, most recent first).
select distinct on (rp.song_id)
  s.*,
  rp.played_at,
  rp.progress_seconds
from public.recently_played rp
join public.songs s on s.id = rp.song_id
where rp.user_id = :user_id
  and s.status = 'published'
  and s.deleted_at is null
order by rp.song_id, rp.played_at desc
limit :limit offset :offset;

-- Get user's current play session (for WebSocket sync).
select
  ups.*,
  s.title as current_song_title,
  s.artist as current_song_artist,
  s.thumbnail as current_song_thumbnail,
  s.duration as current_song_duration
from public.user_play_sessions ups
left join public.songs s on s.id = ups.current_song_id
where ups.user_id = :user_id
  and ups.device_id = :device_id
limit 1;

-- Upsert user play session (insert or update).
-- Use with care: this is an upsert pattern.
insert into public.user_play_sessions (
  user_id, device_id, device_name, current_song_id, position_ms,
  is_playing, volume, shuffle_mode, repeat_mode, queue, context, updated_at
)
values (
  :user_id, :device_id, :device_name, :current_song_id, :position_ms,
  :is_playing, :volume, :shuffle_mode, :repeat_mode, :queue::jsonb, :context, now()
)
on conflict (user_id, device_id)
do update set
  current_song_id = excluded.current_song_id,
  position_ms = excluded.position_ms,
  is_playing = excluded.is_playing,
  volume = excluded.volume,
  shuffle_mode = excluded.shuffle_mode,
  repeat_mode = excluded.repeat_mode,
  queue = excluded.queue,
  context = excluded.context,
  updated_at = now()
returning *;

-- ============================================================
-- ADMIN & UPLOAD MANAGEMENT QUERIES
-- ============================================================

-- Admin: all upload batches with status filter.
select
  id, source, initiated_by, admin_username, status,
  total_files, total_bytes, accepted_files, rejected_files,
  uploaded_files, failed_files, report_dir, client_summary,
  started_at, completed_at, created_at, updated_at
from public.upload_batches
where (:status is null or status = :status)
order by created_at desc
limit :limit offset :offset;

-- Admin: batch detail with all queue items.
select
  b.*,
  coalesce(jsonb_agg(to_jsonb(q) order by q.created_at) filter (where q.id is not null), '[]'::jsonb) as queue_items
from public.upload_batches b
left join public.upload_queue_items q on q.batch_id = b.id
where b.id = :batch_id
group by b.id;

-- Admin: storage inventory summary (already exists).
-- Admin: music assets by status.
select
  status,
  count(*) as count,
  sum(file_size) as total_bytes,
  min(created_at) as oldest,
  max(created_at) as newest
from public.music_assets
where deleted_at is null
group by status
order by count desc;

-- Admin: recent upload errors from pipeline.
select
  pe.*,
  pr.command,
  pr.root_dir
from public.pipeline_errors pe
join public.pipeline_runs pr on pr.id = pe.run_id
where pr.status = 'failed'
  or pe.message is not null
order by pe.created_at desc
limit :limit;

-- Admin: user management (users with roles and admin session info).
select
  u.*,
  array_agg(distinct r.key) filter (where r.key is not null) as role_keys,
  array_agg(distinct r.name) filter (where r.name is not null) as role_names,
  max(aa.last_login_at) as last_login_at,
  max(ups.expires_at) as session_expires
from public.users u
left join public.user_roles ur on ur.user_id = u.id
left join public.roles r on r.id = ur.role_id
left join public.admin_accounts aa on aa.user_id = u.id
left join public.admin_sessions ups on ups.admin_account_id = aa.id and ups.revoked_at is null
where u.deleted_at is null
group by u.id
order by u.created_at desc
limit :limit offset :offset;

-- Admin: audit log feed.
select
  al.*,
  u.email as actor_email,
  u.display_name as actor_name
from public.audit_logs al
left join public.users u on u.id = al.actor_user_id
where al.entity_table = :table_name
  and al.entity_id = :entity_id
order by al.created_at desc
limit :limit;

-- Admin: system settings key lookup.
select * from public.system_settings where key = :key;

-- ============================================================
-- METADATA & LOOKUP QUERIES
-- ============================================================

-- Get distinct artists (catalog, paginated).
select
  id, name, image_url, bio, verified, followers_count
from public.artists
where deleted_at is null
order by name asc
limit :limit offset :offset;

-- Get distinct genres.
select id, name, slug from public.genres order by name asc;

-- Get songs by multiple IDs (for queue operations).
select * from public.songs
where id = any(:song_ids::uuid[])
  and status = 'published'
  and deleted_at is null
order by array_position(:song_ids::uuid[], id);

-- Get songs by album with track ordering.
select
  s.id, s.title, s.artist, s.artist_id, s.album_id,
  s.thumbnail, s.duration, s.track_number, s.disc_number,
  s.is_explicit
from public.songs s
where s.album_id = :album_id
  and s.status = 'published'
  and s.deleted_at is null
order by s.disc_number asc, s.track_number asc nulls last, s.created_at asc;

-- Get all songs by artist (with album info).
select
  s.*,
  al.title as album_title,
  al.thumbnail as album_cover
from public.songs s
left join public.albums al on al.id = s.album_id
where s.artist_id = :artist_id
  and s.status = 'published'
  and s.deleted_at is null
order by al.release_date desc nulls last, s.track_number asc;

-- ============================================================
-- COUNT & AGGREGATION HELPERS
-- ============================================================

-- Count published songs.
select count(*)::int from public.songs where status = 'published' and deleted_at is null;

-- Count user's liked songs.
select count(*)::int from public.likes where user_id = :user_id;

-- Count user's playlists.
select count(*)::int from public.playlists where user_id = :user_id and deleted_at is null;

-- Count playlist songs.
select count(*)::int from public.playlist_songs where playlist_id = :playlist_id;

-- Count artist's albums.
select count(*)::int from public.albums where artist_id = :artist_id and deleted_at is null;

-- Count artist's songs.
select count(*)::int from public.songs where artist_id = :artist_id and status = 'published' and deleted_at is null;

-- Get dashboard stats (for home page or user profile).
select
  (select count(*) from public.songs where status = 'published' and deleted_at is null) as total_songs,
  (select count(*) from public.artists where deleted_at is null) as total_artists,
  (select count(*) from public.albums where deleted_at is null) as total_albums,
  (select count(*) from public.playlists where is_public = true and deleted_at is null) as public_playlists;

-- ============================================================
-- BULK & UTILITY QUERIES
-- ============================================================

-- Batch fetch songs by ID array ( maintains order via unnest).
with ordered as (
  select unnest(:song_ids::uuid[]) as id, generate_subscripts(:song_ids::uuid[], 1) as idx
),
songs as (
  select s.*, o.idx
  from ordered o
  join public.songs s on s.id = o.id
  where s.status = 'published' and s.deleted_at is null
)
select * from songs order by idx;

-- Get all songs for a playlist in one query (stable order).
select
  ps.position,
  s.id, s.title, s.artist, s.artist_id, s.album_id,
  s.url, s.thumbnail, s.duration, s.track_number, s.disc_number,
  s.is_explicit
from public.playlist_songs ps
join public.songs s on s.id = ps.song_id
where ps.playlist_id = :playlist_id
  and s.status = 'published'
  and s.deleted_at is null
order by ps.position asc;

-- Recalculate playlist stats (track count, total duration) - admin use.
update public.playlists p set
  track_count = sub.track_count,
  total_duration_ms = sub.total_duration
from (
  select
    coalesce(count(s.id), 0) as track_count,
    coalesce(sum(s.duration), 0) as total_duration
  from public.playlist_songs ps
  join public.songs s on s.id = ps.song_id
  where ps.playlist_id = p.id
    and s.status = 'published'
    and s.deleted_at is null
) sub
where p.id = :playlist_id
returning p.id, p.track_count, p.total_duration_ms;

-- Mark soft-deleted songs as draft (cascade effect).
update public.songs set
  status = 'archived',
  deleted_at = now()
where id = any(:song_ids::uuid[])
  and deleted_at is null
returning id, title, status;

-- Like a song (insert).
insert into public.likes (user_id, song_id) values (:user_id, :song_id)
on conflict (user_id, song_id) do nothing
returning id, liked_at;

-- Unlike a song (delete).
delete from public.likes where user_id = :user_id and song_id = :song_id;

-- Follow an artist (insert).
insert into public.followed_artists (user_id, artist_id) values (:user_id, :artist_id)
on conflict (user_id, artist_id) do nothing
returning followed_at;

-- Unfollow an artist (delete).
delete from public.followed_artists where user_id = :user_id and artist_id = :artist_id;

-- Follow a playlist (insert).
insert into public.followed_playlists (user_id, playlist_id) values (:user_id, :playlist_id)
on conflict (user_id, playlist_id) do nothing
returning followed_at;

-- Unfollow a playlist (delete).
delete from public.followed_playlists where user_id = :user_id and playlist_id = :playlist_id;

-- Add collaborator to playlist.
insert into public.playlist_collaborators (playlist_id, user_id, can_edit, invited_by)
values (:playlist_id, :user_id, :can_edit, :invited_by)
on conflict (playlist_id, user_id) do update
  set can_edit = excluded.can_edit
returning *;

-- Remove playlist collaborator.
delete from public.playlist_collaborators
where playlist_id = :playlist_id and user_id = :user_id;

-- ============================================================
-- INDEX USAGE HINTS (for query planner)
-- ============================================================
-- These queries are designed to use existing indexes:
-- • songs (status, created_at desc)           → home feed queries
-- • songs (artist_id)                         → artist songs
-- • songs (album_id)                          → album songs
-- • songs_search_idx (GIN)                    → full-text search
-- • songs_title_trgm_idx (GIN)                → title LIKE searches
-- • playlists (user_id, created_at desc)      → user playlists
-- • playlists (is_public, created_at desc)    → public playlists
-- • playlist_songs (playlist_id, position)    → playlist ordering
-- • recently_played (user_id, played_at desc) → recent history
-- • likes (user_id, liked_at desc)            → liked songs
-- • followed_artists (user_id)                → followed artists
-- • artists_search_idx (GIN)                  → artist search
-- • albums_search_idx (GIN)                  → album search

-- End of optimized query patterns.
