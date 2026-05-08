begin;

create extension if not exists pgcrypto;
create extension if not exists citext;
create extension if not exists pg_trgm;
create extension if not exists btree_gin;

create schema if not exists app_private;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('super_admin', 'admin', 'curator', 'listener');
  end if;

  if not exists (select 1 from pg_type where typname = 'playlist_visibility') then
    create type public.playlist_visibility as enum ('private', 'public', 'unlisted');
  end if;

  if not exists (select 1 from pg_type where typname = 'song_status') then
    create type public.song_status as enum ('draft', 'processing', 'published', 'archived', 'rejected');
  end if;

  if not exists (select 1 from pg_type where typname = 'asset_status') then
    create type public.asset_status as enum ('discovered', 'queued', 'validating', 'valid', 'corrupted', 'duplicate', 'uploaded', 'failed', 'skipped');
  end if;

  if not exists (select 1 from pg_type where typname = 'upload_status') then
    create type public.upload_status as enum ('queued', 'processing', 'completed', 'failed', 'cancelled', 'partial');
  end if;

  if not exists (select 1 from pg_type where typname = 'storage_file_kind') then
    create type public.storage_file_kind as enum ('audio', 'archive', 'extracted', 'artwork', 'report', 'log', 'temp', 'other');
  end if;
end $$;

create or replace function app_private.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email citext not null unique,
  username citext unique,
  display_name text,
  avatar_url text,
  default_role public.app_role not null default 'listener',
  is_active boolean not null default true,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint users_username_format_chk check (username is null or username ~* '^[a-z0-9_][a-z0-9_.-]{2,31}$')
);

alter table public.users add column if not exists username citext;
alter table public.users add column if not exists display_name text;
alter table public.users add column if not exists default_role public.app_role not null default 'listener';
alter table public.users add column if not exists is_active boolean not null default true;
alter table public.users add column if not exists last_seen_at timestamptz;
alter table public.users add column if not exists updated_at timestamptz not null default now();
alter table public.users add column if not exists deleted_at timestamptz;

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  key public.app_role not null unique,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  description text,
  created_at timestamptz not null default now(),
  constraint permissions_key_format_chk check (key ~ '^[a-z][a-z0-9_.:-]*$')
);

create table if not exists public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (role_id, permission_id)
);

create table if not exists public.user_roles (
  user_id uuid not null references public.users(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  assigned_by uuid references public.users(id) on delete set null,
  assigned_at timestamptz not null default now(),
  primary key (user_id, role_id)
);

create table if not exists public.admin_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  username citext not null unique,
  password_hash text,
  is_active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admin_accounts_username_chk check (username ~* '^[a-z0-9_][a-z0-9_.-]{2,63}$')
);

create table if not exists public.admin_sessions (
  id uuid primary key default gen_random_uuid(),
  admin_account_id uuid references public.admin_accounts(id) on delete cascade,
  session_token_hash text not null unique,
  ip_address inet,
  user_agent text,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.artists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text,
  image_url text,
  bio text,
  followers_count integer not null default 0,
  verified boolean not null default false,
  search_vector tsvector generated always as (to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(bio, ''))) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint artists_followers_count_chk check (followers_count >= 0)
);

alter table public.artists add column if not exists slug text;
alter table public.artists add column if not exists verified boolean not null default false;
alter table public.artists add column if not exists updated_at timestamptz not null default now();
alter table public.artists add column if not exists deleted_at timestamptz;
alter table public.artists add column if not exists search_vector tsvector generated always as (to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(bio, ''))) stored;

create table if not exists public.albums (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text,
  artist_id uuid references public.artists(id) on delete set null,
  artist text not null,
  thumbnail text not null default '/default-album.png',
  release_year integer,
  release_date date,
  label text,
  search_vector tsvector generated always as (to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(artist, '') || ' ' || coalesce(label, ''))) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint albums_release_year_chk check (release_year is null or (release_year between 1800 and 2200))
);

alter table public.albums add column if not exists slug text;
alter table public.albums add column if not exists release_date date;
alter table public.albums add column if not exists label text;
alter table public.albums add column if not exists updated_at timestamptz not null default now();
alter table public.albums add column if not exists deleted_at timestamptz;
alter table public.albums add column if not exists search_vector tsvector generated always as (to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(artist, '') || ' ' || coalesce(label, ''))) stored;

create table if not exists public.genres (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text unique,
  created_at timestamptz not null default now()
);

create table if not exists public.upload_batches (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'admin_portal',
  initiated_by uuid references public.users(id) on delete set null,
  admin_username citext,
  status public.upload_status not null default 'queued',
  total_files integer not null default 0,
  total_bytes bigint not null default 0,
  accepted_files integer not null default 0,
  rejected_files integer not null default 0,
  uploaded_files integer not null default 0,
  failed_files integer not null default 0,
  report_dir text,
  client_summary jsonb not null default '{}'::jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint upload_batches_counts_chk check (
    total_files >= 0 and total_bytes >= 0 and accepted_files >= 0 and rejected_files >= 0 and uploaded_files >= 0 and failed_files >= 0
  )
);

create table if not exists public.storage_files (
  id uuid primary key default gen_random_uuid(),
  bucket_id text not null,
  object_key text not null,
  kind public.storage_file_kind not null default 'other',
  provider text not null default 'supabase',
  mime_type text,
  byte_size bigint not null default 0,
  checksum text,
  public_url text,
  secure_url text,
  cdn_url text,
  signed_url_expires_at timestamptz,
  owner_user_id uuid references public.users(id) on delete set null,
  uploaded_by uuid references public.users(id) on delete set null,
  upload_batch_id uuid references public.upload_batches(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (bucket_id, object_key),
  constraint storage_files_byte_size_chk check (byte_size >= 0)
);

create table if not exists public.songs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text,
  artist text not null,
  artist_id uuid references public.artists(id) on delete set null,
  album_id uuid references public.albums(id) on delete set null,
  url text not null,
  thumbnail text not null default '/default-album.png',
  duration integer not null default 0,
  track_number integer,
  disc_number integer not null default 1,
  release_date date,
  status public.song_status not null default 'published',
  is_explicit boolean not null default false,
  play_count bigint not null default 0,
  like_count bigint not null default 0,
  storage_file_id uuid references public.storage_files(id) on delete set null,
  search_vector tsvector generated always as (to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(artist, ''))) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint songs_duration_chk check (duration >= 0),
  constraint songs_disc_number_chk check (disc_number > 0),
  constraint songs_track_number_chk check (track_number is null or track_number > 0),
  constraint songs_counts_chk check (play_count >= 0 and like_count >= 0)
);

alter table public.songs add column if not exists slug text;
alter table public.songs add column if not exists track_number integer;
alter table public.songs add column if not exists disc_number integer not null default 1;
alter table public.songs add column if not exists release_date date;
alter table public.songs add column if not exists status public.song_status not null default 'published';
alter table public.songs add column if not exists is_explicit boolean not null default false;
alter table public.songs add column if not exists play_count bigint not null default 0;
alter table public.songs add column if not exists like_count bigint not null default 0;
alter table public.songs add column if not exists storage_file_id uuid references public.storage_files(id) on delete set null;
alter table public.songs add column if not exists updated_at timestamptz not null default now();
alter table public.songs add column if not exists deleted_at timestamptz;
alter table public.songs add column if not exists search_vector tsvector generated always as (to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(artist, ''))) stored;

create table if not exists public.song_artists (
  song_id uuid not null references public.songs(id) on delete cascade,
  artist_id uuid not null references public.artists(id) on delete cascade,
  role text not null default 'primary',
  position integer not null default 1,
  created_at timestamptz not null default now(),
  primary key (song_id, artist_id, role),
  constraint song_artists_position_chk check (position > 0)
);

create table if not exists public.song_genres (
  song_id uuid not null references public.songs(id) on delete cascade,
  genre_id uuid not null references public.genres(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (song_id, genre_id)
);

create table if not exists public.music_assets (
  id uuid primary key default gen_random_uuid(),
  song_id uuid references public.songs(id) on delete set null,
  upload_batch_id uuid references public.upload_batches(id) on delete set null,
  storage_file_id uuid references public.storage_files(id) on delete set null,
  title text not null,
  artist text not null,
  album text not null,
  genre text,
  duration integer not null default 0,
  bitrate integer,
  sample_rate integer,
  channels integer,
  codec text,
  container text,
  lossless boolean,
  file_size bigint not null,
  original_path text not null,
  cloud_url text,
  cdn_url text,
  checksum text not null unique,
  status public.asset_status not null default 'uploaded',
  duplicate_of uuid references public.music_assets(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  uploaded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint music_assets_duration_chk check (duration >= 0),
  constraint music_assets_file_size_chk check (file_size >= 0)
);

alter table public.music_assets add column if not exists song_id uuid references public.songs(id) on delete set null;
alter table public.music_assets add column if not exists upload_batch_id uuid references public.upload_batches(id) on delete set null;
alter table public.music_assets add column if not exists storage_file_id uuid references public.storage_files(id) on delete set null;
alter table public.music_assets add column if not exists sample_rate integer;
alter table public.music_assets add column if not exists channels integer;
alter table public.music_assets add column if not exists container text;
alter table public.music_assets add column if not exists lossless boolean;
alter table public.music_assets add column if not exists status public.asset_status not null default 'uploaded';
alter table public.music_assets add column if not exists duplicate_of uuid references public.music_assets(id) on delete set null;
alter table public.music_assets add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.music_assets add column if not exists updated_at timestamptz not null default now();
alter table public.music_assets add column if not exists deleted_at timestamptz;

create table if not exists public.playlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  description text,
  thumbnail text,
  is_public boolean not null default false,
  visibility public.playlist_visibility not null default 'private',
  is_collaborative boolean not null default false,
  search_vector tsvector generated always as (to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(description, ''))) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint playlists_name_length_chk check (char_length(trim(name)) between 1 and 120)
);

alter table public.playlists add column if not exists visibility public.playlist_visibility not null default 'private';
alter table public.playlists add column if not exists is_collaborative boolean not null default false;
alter table public.playlists add column if not exists deleted_at timestamptz;
alter table public.playlists add column if not exists search_vector tsvector generated always as (to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(description, ''))) stored;

create table if not exists public.playlist_collaborators (
  playlist_id uuid not null references public.playlists(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  can_edit boolean not null default true,
  invited_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (playlist_id, user_id)
);

create table if not exists public.playlist_songs (
  id uuid primary key default gen_random_uuid(),
  playlist_id uuid not null references public.playlists(id) on delete cascade,
  song_id uuid not null references public.songs(id) on delete cascade,
  added_by uuid references public.users(id) on delete set null,
  added_at timestamptz not null default now(),
  position integer not null,
  unique (playlist_id, song_id),
  unique (playlist_id, position),
  constraint playlist_songs_position_chk check (position >= 0)
);

alter table public.playlist_songs add column if not exists added_by uuid references public.users(id) on delete set null;

create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  song_id uuid not null references public.songs(id) on delete cascade,
  liked_at timestamptz not null default now(),
  unique (user_id, song_id)
);

create table if not exists public.recently_played (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  song_id uuid not null references public.songs(id) on delete cascade,
  played_at timestamptz not null default now(),
  progress_seconds integer,
  context jsonb not null default '{}'::jsonb,
  constraint recently_played_progress_chk check (progress_seconds is null or progress_seconds >= 0)
);

alter table public.recently_played add column if not exists progress_seconds integer;
alter table public.recently_played add column if not exists context jsonb not null default '{}'::jsonb;

create table if not exists public.playback_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  song_id uuid references public.songs(id) on delete set null,
  event_type text not null,
  position_seconds integer,
  device_id text,
  room_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint playback_events_position_chk check (position_seconds is null or position_seconds >= 0)
);

create table if not exists public.upload_queue_items (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.upload_batches(id) on delete cascade,
  storage_file_id uuid references public.storage_files(id) on delete set null,
  original_path text,
  relative_path text,
  filename text not null,
  extension text,
  file_size bigint not null default 0,
  checksum text,
  status public.asset_status not null default 'queued',
  failure_reason text,
  progress_percent numeric(5,2) not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint upload_queue_items_file_size_chk check (file_size >= 0),
  constraint upload_queue_items_progress_chk check (progress_percent between 0 and 100)
);

create table if not exists public.extraction_reports (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid references public.upload_batches(id) on delete cascade,
  archive_storage_file_id uuid references public.storage_files(id) on delete set null,
  archive_path text not null,
  extracted_dir text,
  status public.asset_status not null default 'queued',
  extracted_files_count integer not null default 0,
  error text,
  report jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint extraction_reports_count_chk check (extracted_files_count >= 0)
);

create table if not exists public.validation_reports (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid references public.upload_batches(id) on delete cascade,
  upload_queue_item_id uuid references public.upload_queue_items(id) on delete set null,
  music_asset_id uuid references public.music_assets(id) on delete set null,
  status public.asset_status not null,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.duplicate_reports (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid references public.upload_batches(id) on delete cascade,
  checksum text,
  similarity_key text,
  kept_asset_id uuid references public.music_assets(id) on delete set null,
  duplicate_asset_id uuid references public.music_assets(id) on delete set null,
  strategy text not null default 'sha256',
  decision text not null default 'skip_duplicate',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.cloud_uploads (
  id uuid primary key default gen_random_uuid(),
  music_asset_id uuid references public.music_assets(id) on delete cascade,
  storage_file_id uuid references public.storage_files(id) on delete set null,
  provider text not null default 'supabase',
  bucket_id text,
  object_key text,
  status public.upload_status not null default 'queued',
  public_url text,
  secure_url text,
  cdn_url text,
  upload_id text,
  error text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, upload_id)
);

create table if not exists public.pipeline_runs (
  id uuid primary key default gen_random_uuid(),
  command text not null,
  root_dir text not null,
  dry_run boolean not null default true,
  status public.upload_status not null default 'processing',
  totals jsonb not null default '{}'::jsonb,
  report_dir text,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.pipeline_errors (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references public.pipeline_runs(id) on delete cascade,
  stage text not null,
  path text,
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.users(id) on delete set null,
  actor_admin_username citext,
  action text not null,
  entity_table text,
  entity_id uuid,
  ip_address inet,
  user_agent text,
  old_data jsonb,
  new_data jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  activity_type text not null,
  entity_table text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  title text not null,
  body text,
  type text not null default 'info',
  read_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.system_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  description text,
  is_public boolean not null default false,
  updated_by uuid references public.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  constraint system_settings_key_chk check (key ~ '^[a-z][a-z0-9_.:-]*$')
);

insert into public.roles (key, name, description) values
  ('super_admin', 'Super Admin', 'Full system ownership, including role and security management'),
  ('admin', 'Admin', 'Operational administrator with upload and catalog management access'),
  ('curator', 'Curator', 'Can manage catalog metadata and playlists'),
  ('listener', 'Listener', 'Default signed-in application user')
on conflict (key) do update set name = excluded.name, description = excluded.description;

insert into public.permissions (key, description) values
  ('catalog.read', 'Read published catalog records'),
  ('catalog.write', 'Create and update catalog records'),
  ('uploads.manage', 'Manage upload batches and asset processing'),
  ('users.manage', 'Manage user roles and access'),
  ('audit.read', 'Read audit and activity logs'),
  ('settings.manage', 'Manage system settings')
on conflict (key) do update set description = excluded.description;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on
  r.key = 'super_admin'
  or (r.key = 'admin' and p.key in ('catalog.read', 'catalog.write', 'uploads.manage', 'audit.read', 'settings.manage'))
  or (r.key = 'curator' and p.key in ('catalog.read', 'catalog.write'))
  or (r.key = 'listener' and p.key in ('catalog.read'))
on conflict do nothing;

insert into public.admin_accounts (username, password_hash, is_active)
values ('admin', null, true)
on conflict (username) do nothing;

insert into public.system_settings (key, value, description, is_public) values
  ('app.name', '"Spotify Clone"'::jsonb, 'Application display name', true),
  ('uploads.max_single_file_mb', '25'::jsonb, 'Admin portal max single upload size', false),
  ('uploads.max_batch_gb', '1'::jsonb, 'Admin portal max batch upload size', false),
  ('storage.primary_bucket', '"songs"'::jsonb, 'Legacy-compatible primary public audio bucket', false)
on conflict (key) do update set value = excluded.value, description = excluded.description, is_public = excluded.is_public, updated_at = now();

create index if not exists users_email_idx on public.users (email);
create index if not exists users_username_idx on public.users (username) where deleted_at is null;
create index if not exists user_roles_role_id_idx on public.user_roles (role_id);
create index if not exists admin_sessions_expires_idx on public.admin_sessions (expires_at) where revoked_at is null;
create index if not exists artists_name_trgm_idx on public.artists using gin (name gin_trgm_ops) where deleted_at is null;
create index if not exists artists_search_idx on public.artists using gin (search_vector);
create index if not exists albums_artist_idx on public.albums (artist_id) where deleted_at is null;
create index if not exists albums_title_trgm_idx on public.albums using gin (title gin_trgm_ops) where deleted_at is null;
create index if not exists albums_search_idx on public.albums using gin (search_vector);
create index if not exists songs_artist_idx on public.songs (artist);
create index if not exists songs_artist_id_idx on public.songs (artist_id) where deleted_at is null;
create index if not exists songs_album_id_idx on public.songs (album_id) where deleted_at is null;
create index if not exists songs_status_created_idx on public.songs (status, created_at desc) where deleted_at is null;
create index if not exists songs_search_idx on public.songs using gin (search_vector);
create index if not exists songs_title_trgm_idx on public.songs using gin (title gin_trgm_ops) where deleted_at is null;
create index if not exists song_artists_artist_idx on public.song_artists (artist_id, position);
create index if not exists song_genres_genre_idx on public.song_genres (genre_id);
create index if not exists playlists_user_idx on public.playlists (user_id, created_at desc) where deleted_at is null;
create index if not exists playlists_public_idx on public.playlists (is_public, created_at desc) where deleted_at is null;
create index if not exists playlists_search_idx on public.playlists using gin (search_vector);
create index if not exists playlist_songs_playlist_position_idx on public.playlist_songs (playlist_id, position);
create index if not exists playlist_songs_song_idx on public.playlist_songs (song_id);
create index if not exists playlist_collaborators_user_idx on public.playlist_collaborators (user_id);
create index if not exists likes_user_idx on public.likes (user_id, liked_at desc);
create index if not exists likes_song_idx on public.likes (song_id);
create index if not exists recently_played_user_idx on public.recently_played (user_id, played_at desc);
create index if not exists recently_played_song_idx on public.recently_played (song_id, played_at desc);
create index if not exists playback_events_user_created_idx on public.playback_events (user_id, created_at desc);
create index if not exists playback_events_song_created_idx on public.playback_events (song_id, created_at desc);
create index if not exists storage_files_bucket_key_idx on public.storage_files (bucket_id, object_key);
create index if not exists storage_files_checksum_idx on public.storage_files (checksum) where checksum is not null;
create index if not exists storage_files_batch_idx on public.storage_files (upload_batch_id);
create index if not exists music_assets_checksum_idx on public.music_assets (checksum);
create index if not exists music_assets_artist_album_idx on public.music_assets (artist, album);
create index if not exists music_assets_status_idx on public.music_assets (status, created_at desc) where deleted_at is null;
create index if not exists music_assets_uploaded_at_idx on public.music_assets (uploaded_at desc);
create index if not exists upload_batches_status_idx on public.upload_batches (status, created_at desc);
create index if not exists upload_queue_items_batch_idx on public.upload_queue_items (batch_id, status);
create index if not exists upload_queue_items_checksum_idx on public.upload_queue_items (checksum) where checksum is not null;
create index if not exists extraction_reports_batch_idx on public.extraction_reports (batch_id);
create index if not exists validation_reports_asset_idx on public.validation_reports (music_asset_id);
create index if not exists duplicate_reports_checksum_idx on public.duplicate_reports (checksum);
create index if not exists cloud_uploads_asset_idx on public.cloud_uploads (music_asset_id);
create index if not exists pipeline_runs_status_idx on public.pipeline_runs (status, started_at desc);
create index if not exists pipeline_errors_run_idx on public.pipeline_errors (run_id, created_at desc);
create index if not exists audit_logs_entity_idx on public.audit_logs (entity_table, entity_id, created_at desc);
create index if not exists audit_logs_actor_idx on public.audit_logs (actor_user_id, created_at desc);
create index if not exists activity_logs_user_idx on public.activity_logs (user_id, created_at desc);
create index if not exists notifications_user_unread_idx on public.notifications (user_id, created_at desc) where read_at is null;

create or replace function app_private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.users (id, email, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.email, new.id::text || '@anonymous.local'),
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'full_name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update
    set email = excluded.email,
        display_name = coalesce(public.users.display_name, excluded.display_name),
        avatar_url = coalesce(public.users.avatar_url, excluded.avatar_url),
        updated_at = now();

  insert into public.user_roles (user_id, role_id)
  select new.id, r.id
  from public.roles r
  where r.key = 'listener'
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function app_private.handle_new_user();

create or replace function app_private.has_role(required_role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = (select auth.uid())
      and (
        r.key = required_role
        or r.key = 'super_admin'
      )
  );
$$;

create or replace function app_private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = (select auth.uid())
      and r.key in ('admin', 'super_admin')
  );
$$;

create or replace function app_private.can_manage_playlist(target_playlist_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.playlists p
    where p.id = target_playlist_id
      and p.deleted_at is null
      and p.user_id = (select auth.uid())
  )
  or exists (
    select 1
    from public.playlist_collaborators pc
    where pc.playlist_id = target_playlist_id
      and pc.user_id = (select auth.uid())
      and pc.can_edit = true
  )
  or (select app_private.is_admin());
$$;

create or replace function app_private.audit_row_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_logs (actor_user_id, action, entity_table, entity_id, old_data, new_data)
  values (
    (select auth.uid()),
    lower(tg_op),
    tg_table_name,
    coalesce((case when tg_op = 'DELETE' then old.id else new.id end), gen_random_uuid()),
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end
  );
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create or replace function public.record_playback_event(
  target_song_id uuid,
  event_type text,
  position_seconds integer default null,
  device_id text default null,
  room_id text default null,
  metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
set search_path = public
as $$
declare
  event_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;

  insert into public.playback_events (user_id, song_id, event_type, position_seconds, device_id, room_id, metadata)
  values ((select auth.uid()), target_song_id, event_type, position_seconds, device_id, room_id, metadata)
  returning id into event_id;

  if event_type in ('play', 'complete') then
    insert into public.recently_played (user_id, song_id, played_at, progress_seconds, context)
    values ((select auth.uid()), target_song_id, now(), position_seconds, jsonb_build_object('event_id', event_id))
    on conflict do nothing;

    update public.songs
    set play_count = play_count + 1
    where id = target_song_id;
  end if;

  return event_id;
end;
$$;

create or replace function public.search_catalog(search_query text, result_limit integer default 10)
returns table (
  entity_type text,
  entity_id uuid,
  title text,
  subtitle text,
  image_url text,
  rank real
)
language sql
stable
set search_path = public
as $$
  with q as (
    select plainto_tsquery('simple', coalesce(search_query, '')) as query
  )
  select 'song', s.id, s.title, s.artist, s.thumbnail, ts_rank(s.search_vector, q.query)
  from public.songs s, q
  where s.deleted_at is null and s.status = 'published' and s.search_vector @@ q.query
  union all
  select 'artist', a.id, a.name, null::text, a.image_url, ts_rank(a.search_vector, q.query)
  from public.artists a, q
  where a.deleted_at is null and a.search_vector @@ q.query
  union all
  select 'album', al.id, al.title, al.artist, al.thumbnail, ts_rank(al.search_vector, q.query)
  from public.albums al, q
  where al.deleted_at is null and al.search_vector @@ q.query
  union all
  select 'playlist', p.id, p.name, p.description, p.thumbnail, ts_rank(p.search_vector, q.query)
  from public.playlists p, q
  where p.deleted_at is null and (p.is_public = true or p.visibility in ('public', 'unlisted') or p.user_id = (select auth.uid())) and p.search_vector @@ q.query
  order by rank desc
  limit greatest(1, least(result_limit, 50));
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'users', 'admin_accounts', 'artists', 'albums', 'songs', 'music_assets', 'playlists',
    'upload_batches', 'storage_files', 'upload_queue_items', 'cloud_uploads', 'system_settings'
  ]
  loop
    execute format('drop trigger if exists set_%I_updated_at on public.%I', table_name, table_name);
    execute format('create trigger set_%I_updated_at before update on public.%I for each row execute function app_private.set_updated_at()', table_name, table_name);
  end loop;
end $$;

drop trigger if exists audit_songs_changes on public.songs;
create trigger audit_songs_changes after insert or update or delete on public.songs for each row execute function app_private.audit_row_change();
drop trigger if exists audit_music_assets_changes on public.music_assets;
create trigger audit_music_assets_changes after insert or update or delete on public.music_assets for each row execute function app_private.audit_row_change();
drop trigger if exists audit_upload_batches_changes on public.upload_batches;
create trigger audit_upload_batches_changes after insert or update or delete on public.upload_batches for each row execute function app_private.audit_row_change();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('songs', 'songs', true, 26214400, array['audio/*', 'application/octet-stream']::text[]),
  ('music-assets', 'music-assets', true, 26214400, array['audio/*', 'application/octet-stream']::text[]),
  ('extracted-files', 'extracted-files', false, 26214400, array['audio/*', 'application/octet-stream', 'application/json']::text[]),
  ('temp-uploads', 'temp-uploads', false, 26214400, array['audio/*', 'application/zip', 'application/x-zip-compressed', 'application/x-7z-compressed', 'application/vnd.rar', 'application/gzip', 'application/x-tar', 'application/octet-stream']::text[]),
  ('user-uploads', 'user-uploads', false, 26214400, array['audio/*', 'image/*', 'application/octet-stream']::text[]),
  ('logs', 'logs', false, 10485760, array['text/plain', 'application/json']::text[]),
  ('reports', 'reports', false, 10485760, array['text/plain', 'text/csv', 'application/json']::text[])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

grant usage on schema public to anon, authenticated, service_role;
grant usage on schema app_private to authenticated, service_role;
grant execute on function app_private.has_role(public.app_role) to authenticated, service_role;
grant execute on function app_private.is_admin() to authenticated, service_role;
grant execute on function app_private.can_manage_playlist(uuid) to authenticated, service_role;
grant execute on function public.search_catalog(text, integer) to anon, authenticated, service_role;
grant execute on function public.record_playback_event(uuid, text, integer, text, text, jsonb) to authenticated, service_role;

grant select on public.artists, public.albums, public.genres, public.songs, public.song_artists, public.song_genres to anon, authenticated;
grant select on public.playlists, public.playlist_songs to anon, authenticated;
grant select, update on public.users to authenticated;
grant select, insert, update, delete on public.playlists, public.playlist_songs, public.playlist_collaborators, public.likes, public.recently_played, public.playback_events, public.notifications to authenticated;
grant select on public.system_settings to anon, authenticated;
grant select, insert, update, delete on
  public.users, public.roles, public.permissions, public.role_permissions, public.user_roles,
  public.admin_accounts, public.admin_sessions, public.artists, public.albums, public.genres,
  public.songs, public.song_artists, public.song_genres, public.music_assets, public.upload_batches,
  public.upload_queue_items, public.extraction_reports, public.validation_reports, public.duplicate_reports,
  public.cloud_uploads, public.pipeline_runs, public.pipeline_errors, public.storage_files,
  public.audit_logs, public.activity_logs, public.notifications, public.system_settings
to service_role;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'users', 'roles', 'permissions', 'role_permissions', 'user_roles', 'admin_accounts', 'admin_sessions',
    'artists', 'albums', 'genres', 'songs', 'song_artists', 'song_genres', 'music_assets',
    'playlists', 'playlist_collaborators', 'playlist_songs', 'likes', 'recently_played',
    'playback_events', 'upload_batches', 'upload_queue_items', 'extraction_reports',
    'validation_reports', 'duplicate_reports', 'cloud_uploads', 'pipeline_runs',
    'pipeline_errors', 'storage_files', 'audit_logs', 'activity_logs', 'notifications',
    'system_settings'
  ]
  loop
    execute format('alter table public.%I enable row level security', table_name);
  end loop;
end $$;

drop policy if exists users_select on public.users;
create policy users_select on public.users for select to authenticated
using ((select auth.uid()) = id or (select app_private.is_admin()));
drop policy if exists users_update_own on public.users;
create policy users_update_own on public.users for update to authenticated
using ((select auth.uid()) = id or (select app_private.is_admin()))
with check ((select auth.uid()) = id or (select app_private.is_admin()));

drop policy if exists admin_read_roles on public.roles;
create policy admin_read_roles on public.roles for select to authenticated using ((select app_private.is_admin()));
drop policy if exists admin_read_permissions on public.permissions;
create policy admin_read_permissions on public.permissions for select to authenticated using ((select app_private.is_admin()));
drop policy if exists admin_manage_role_permissions on public.role_permissions;
create policy admin_manage_role_permissions on public.role_permissions for all to authenticated using ((select app_private.has_role('super_admin'))) with check ((select app_private.has_role('super_admin')));
drop policy if exists admin_manage_user_roles on public.user_roles;
create policy admin_manage_user_roles on public.user_roles for all to authenticated using ((select app_private.has_role('super_admin'))) with check ((select app_private.has_role('super_admin')));

drop policy if exists public_read_artists on public.artists;
create policy public_read_artists on public.artists for select to anon, authenticated using (deleted_at is null);
drop policy if exists admin_write_artists on public.artists;
create policy admin_write_artists on public.artists for all to authenticated using ((select app_private.is_admin())) with check ((select app_private.is_admin()));

drop policy if exists public_read_albums on public.albums;
create policy public_read_albums on public.albums for select to anon, authenticated using (deleted_at is null);
drop policy if exists admin_write_albums on public.albums;
create policy admin_write_albums on public.albums for all to authenticated using ((select app_private.is_admin())) with check ((select app_private.is_admin()));

drop policy if exists public_read_genres on public.genres;
create policy public_read_genres on public.genres for select to anon, authenticated using (true);
drop policy if exists admin_write_genres on public.genres;
create policy admin_write_genres on public.genres for all to authenticated using ((select app_private.is_admin())) with check ((select app_private.is_admin()));

drop policy if exists public_read_songs on public.songs;
create policy public_read_songs on public.songs for select to anon, authenticated
using (deleted_at is null and status = 'published');
drop policy if exists admin_write_songs on public.songs;
create policy admin_write_songs on public.songs for all to authenticated using ((select app_private.is_admin())) with check ((select app_private.is_admin()));

drop policy if exists public_read_song_artists on public.song_artists;
create policy public_read_song_artists on public.song_artists for select to anon, authenticated
using (exists (select 1 from public.songs s where s.id = song_id and s.deleted_at is null and s.status = 'published'));
drop policy if exists public_read_song_genres on public.song_genres;
create policy public_read_song_genres on public.song_genres for select to anon, authenticated
using (exists (select 1 from public.songs s where s.id = song_id and s.deleted_at is null and s.status = 'published'));

drop policy if exists playlists_select on public.playlists;
create policy playlists_select on public.playlists for select to anon, authenticated
using (
  deleted_at is null
  and (
    is_public = true
    or visibility in ('public', 'unlisted')
    or ((select auth.uid()) is not null and user_id = (select auth.uid()))
    or ((select auth.uid()) is not null and exists (select 1 from public.playlist_collaborators pc where pc.playlist_id = id and pc.user_id = (select auth.uid())))
    or (select app_private.is_admin())
  )
);
drop policy if exists playlists_insert on public.playlists;
create policy playlists_insert on public.playlists for insert to authenticated
with check (user_id = (select auth.uid()) or (select app_private.is_admin()));
drop policy if exists playlists_update on public.playlists;
create policy playlists_update on public.playlists for update to authenticated
using (user_id = (select auth.uid()) or (select app_private.is_admin()))
with check (user_id = (select auth.uid()) or (select app_private.is_admin()));
drop policy if exists playlists_delete on public.playlists;
create policy playlists_delete on public.playlists for delete to authenticated
using (user_id = (select auth.uid()) or (select app_private.is_admin()));

drop policy if exists playlist_collaborators_select on public.playlist_collaborators;
create policy playlist_collaborators_select on public.playlist_collaborators for select to authenticated
using (user_id = (select auth.uid()) or (select app_private.can_manage_playlist(playlist_id)));
drop policy if exists playlist_collaborators_manage on public.playlist_collaborators;
create policy playlist_collaborators_manage on public.playlist_collaborators for all to authenticated
using (exists (select 1 from public.playlists p where p.id = playlist_id and p.user_id = (select auth.uid())) or (select app_private.is_admin()))
with check (exists (select 1 from public.playlists p where p.id = playlist_id and p.user_id = (select auth.uid())) or (select app_private.is_admin()));

drop policy if exists playlist_songs_select on public.playlist_songs;
create policy playlist_songs_select on public.playlist_songs for select to anon, authenticated
using (exists (select 1 from public.playlists p where p.id = playlist_id and p.deleted_at is null and (p.is_public = true or p.visibility in ('public', 'unlisted') or p.user_id = (select auth.uid()) or (select app_private.is_admin()))));
drop policy if exists playlist_songs_manage on public.playlist_songs;
create policy playlist_songs_manage on public.playlist_songs for all to authenticated
using ((select app_private.can_manage_playlist(playlist_id)))
with check ((select app_private.can_manage_playlist(playlist_id)));

drop policy if exists likes_own on public.likes;
create policy likes_own on public.likes for all to authenticated
using (user_id = (select auth.uid()) or (select app_private.is_admin()))
with check (user_id = (select auth.uid()) or (select app_private.is_admin()));
drop policy if exists recently_played_own on public.recently_played;
create policy recently_played_own on public.recently_played for all to authenticated
using (user_id = (select auth.uid()) or (select app_private.is_admin()))
with check (user_id = (select auth.uid()) or (select app_private.is_admin()));
drop policy if exists playback_events_own on public.playback_events;
create policy playback_events_own on public.playback_events for all to authenticated
using (user_id = (select auth.uid()) or (select app_private.is_admin()))
with check (user_id = (select auth.uid()) or (select app_private.is_admin()));

drop policy if exists upload_admin_only on public.upload_batches;
create policy upload_admin_only on public.upload_batches for all to authenticated using ((select app_private.is_admin())) with check ((select app_private.is_admin()));
drop policy if exists upload_queue_admin_only on public.upload_queue_items;
create policy upload_queue_admin_only on public.upload_queue_items for all to authenticated using ((select app_private.is_admin())) with check ((select app_private.is_admin()));
drop policy if exists extraction_admin_only on public.extraction_reports;
create policy extraction_admin_only on public.extraction_reports for all to authenticated using ((select app_private.is_admin())) with check ((select app_private.is_admin()));
drop policy if exists validation_admin_only on public.validation_reports;
create policy validation_admin_only on public.validation_reports for all to authenticated using ((select app_private.is_admin())) with check ((select app_private.is_admin()));
drop policy if exists duplicate_admin_only on public.duplicate_reports;
create policy duplicate_admin_only on public.duplicate_reports for all to authenticated using ((select app_private.is_admin())) with check ((select app_private.is_admin()));
drop policy if exists cloud_uploads_admin_only on public.cloud_uploads;
create policy cloud_uploads_admin_only on public.cloud_uploads for all to authenticated using ((select app_private.is_admin())) with check ((select app_private.is_admin()));
drop policy if exists music_assets_admin_select on public.music_assets;
create policy music_assets_admin_select on public.music_assets for select to authenticated using ((select app_private.is_admin()));
drop policy if exists music_assets_admin_write on public.music_assets;
create policy music_assets_admin_write on public.music_assets for all to authenticated using ((select app_private.is_admin())) with check ((select app_private.is_admin()));

drop policy if exists storage_files_admin_or_owner on public.storage_files;
create policy storage_files_admin_or_owner on public.storage_files for all to authenticated
using ((select app_private.is_admin()) or owner_user_id = (select auth.uid()) or uploaded_by = (select auth.uid()))
with check ((select app_private.is_admin()) or owner_user_id = (select auth.uid()) or uploaded_by = (select auth.uid()));

drop policy if exists pipeline_admin_only on public.pipeline_runs;
create policy pipeline_admin_only on public.pipeline_runs for all to authenticated using ((select app_private.is_admin())) with check ((select app_private.is_admin()));
drop policy if exists pipeline_errors_admin_only on public.pipeline_errors;
create policy pipeline_errors_admin_only on public.pipeline_errors for all to authenticated using ((select app_private.is_admin())) with check ((select app_private.is_admin()));
drop policy if exists audit_admin_only on public.audit_logs;
create policy audit_admin_only on public.audit_logs for select to authenticated using ((select app_private.is_admin()));
drop policy if exists activity_own_or_admin on public.activity_logs;
create policy activity_own_or_admin on public.activity_logs for select to authenticated using (user_id = (select auth.uid()) or (select app_private.is_admin()));
drop policy if exists notifications_own_or_admin on public.notifications;
create policy notifications_own_or_admin on public.notifications for all to authenticated
using (user_id = (select auth.uid()) or (select app_private.is_admin()))
with check (user_id = (select auth.uid()) or (select app_private.is_admin()));
drop policy if exists settings_public_read on public.system_settings;
create policy settings_public_read on public.system_settings for select to anon, authenticated using (is_public = true or (select app_private.is_admin()));
drop policy if exists settings_admin_write on public.system_settings;
create policy settings_admin_write on public.system_settings for all to authenticated using ((select app_private.is_admin())) with check ((select app_private.is_admin()));

drop policy if exists storage_public_audio_read on storage.objects;
create policy storage_public_audio_read on storage.objects for select to anon, authenticated
using (bucket_id in ('songs', 'music-assets'));
drop policy if exists storage_admin_manage_pipeline_buckets on storage.objects;
create policy storage_admin_manage_pipeline_buckets on storage.objects for all to authenticated
using ((select app_private.is_admin()) and bucket_id in ('songs', 'music-assets', 'extracted-files', 'temp-uploads', 'logs', 'reports'))
with check ((select app_private.is_admin()) and bucket_id in ('songs', 'music-assets', 'extracted-files', 'temp-uploads', 'logs', 'reports'));
drop policy if exists storage_user_uploads_own on storage.objects;
create policy storage_user_uploads_own on storage.objects for all to authenticated
using (bucket_id = 'user-uploads' and (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id = 'user-uploads' and (storage.foldername(name))[1] = (select auth.uid())::text);

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'upload_batches') then
    alter publication supabase_realtime add table public.upload_batches;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'upload_queue_items') then
    alter publication supabase_realtime add table public.upload_queue_items;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications') then
    alter publication supabase_realtime add table public.notifications;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'playlist_songs') then
    alter publication supabase_realtime add table public.playlist_songs;
  end if;
end $$;

commit;
