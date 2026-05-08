-- ============================================================================
-- SPOTIFY CLONE - PRODUCTION-READY POSTGRESQL SCHEMA
-- ============================================================================
-- Complete database schema with RLS, indexing, constraints, and triggers
-- Optimized for Supabase with pg_trgm, citext, and pgcrypto extensions
-- ============================================================================

begin;

-- Extensions
create extension if not exists pgcrypto;
create extension if not exists citext;
create extension if not exists pg_trgm;
create extension if not exists btree_gin;

-- Private schema for internal functions
create schema if not exists app_private;

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('super_admin', 'admin', 'curator', 'listener');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'playlist_visibility') then
    create type public.playlist_visibility as enum ('private', 'public', 'unlisted');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'song_status') then
    create type public.song_status as enum (
      'draft', 'processing', 'published', 'archived', 'rejected'
    );
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'asset_status') then
    create type public.asset_status as enum (
      'discovered', 'queued', 'validating', 'valid', 'corrupted',
      'duplicate', 'uploaded', 'failed', 'skipped'
    );
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'upload_status') then
    create type public.upload_status as enum (
      'queued', 'processing', 'completed', 'failed', 'cancelled', 'partial'
    );
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'storage_file_kind') then
    create type public.storage_file_kind as enum (
      'audio', 'archive', 'extracted', 'artwork', 'report', 'log', 'temp', 'other'
    );
  end if;
end $$;

-- ============================================================================
-- TRIGGER FUNCTIONS
-- ============================================================================

create or replace function app_private.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

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
      and (r.key = required_role or r.key = 'super_admin')
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
  insert into public.audit_logs (
    actor_user_id, action, entity_table, entity_id, old_data, new_data
  )
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

-- ============================================================================
-- CORE ENTITIES
-- ============================================================================

-- Users table (extends auth.users)
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
  constraint users_username_format_chk
    check (username is null or username ~* '^[a-z0-9_][a-z0-9_.-]{2,31}$')
);

-- Roles for RBAC
create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  key public.app_role not null unique,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

-- Permissions
create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  description text,
  created_at timestamptz not null default now(),
  constraint permissions_key_format_chk check (key ~ '^[a-z][a-z0-9_.:-]*$')
);

-- Role-Permission junction
create table if not exists public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (role_id, permission_id)
);

-- User-Role junction
create table if not exists public.user_roles (
  user_id uuid not null references public.users(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  assigned_by uuid references public.users(id) on delete set null,
  assigned_at timestamptz not null default now(),
  primary key (user_id, role_id)
);

-- ============================================================================
-- CONTENT ENTITIES
-- ============================================================================

-- Genres for categorization
create table if not exists public.genres (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text unique,
  created_at timestamptz not null default now()
);

-- Artists
create table if not exists public.artists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text,
  image_url text,
  bio text,
  followers_count integer not null default 0,
  verified boolean not null default false,
  search_vector tsvector generated always as (
    to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(bio, ''))
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint artists_followers_count_chk check (followers_count >= 0)
);

-- Albums
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
  search_vector tsvector generated always as (
    to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(artist, '') || ' ' || coalesce(label, ''))
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint albums_release_year_chk check (release_year is null or (release_year between 1800 and 2200))
);

-- Songs
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
  search_vector tsvector generated always as (
    to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(artist, ''))
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint songs_duration_chk check (duration >= 0),
  constraint songs_disc_number_chk check (disc_number > 0),
  constraint songs_track_number_chk check (track_number is null or track_number > 0),
  constraint songs_counts_chk check (play_count >= 0 and like_count >= 0)
);

-- Song-Artist many-to-many (supports featuring, collaborations)
create table if not exists public.song_artists (
  song_id uuid not null references public.songs(id) on delete cascade,
  artist_id uuid not null references public.artists(id) on delete cascade,
  role text not null default 'primary',
  position integer not null default 1,
  created_at timestamptz not null default now(),
  primary key (song_id, artist_id, role),
  constraint song_artists_position_chk check (position > 0)
);

-- Song-Genre many-to-many
create table if not exists public.song_genres (
  song_id uuid not null references public.songs(id) on delete cascade,
  genre_id uuid not null references public.genres(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (song_id, genre_id)
);

-- ============================================================================
-- PLAYLIST ENTITIES
-- ============================================================================

-- Playlists
create table if not exists public.playlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  description text,
  thumbnail text,
  is_public boolean not null default false,
  visibility public.playlist_visibility not null default 'private',
  is_collaborative boolean not null default false,
  search_vector tsvector generated always as (
    to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(description, ''))
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint playlists_name_length_chk check (char_length(trim(name)) between 1 and 120)
);

-- Playlist collaborators (many-to-many with permissions)
create table if not exists public.playlist_collaborators (
  playlist_id uuid not null references public.playlists(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  can_edit boolean not null default true,
  invited_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (playlist_id, user_id)
);

-- Playlist songs (ordered junction table)
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

-- ============================================================================
-- USER INTERACTION ENTITIES
-- ============================================================================

-- Likes (one-to-many: user -> songs)
create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  song_id uuid not null references public.songs(id) on delete cascade,
  liked_at timestamptz not null default now(),
  unique (user_id, song_id)
);

-- Recently played history
create table if not exists public.recently_played (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  song_id uuid not null references public.songs(id) on delete cascade,
  played_at timestamptz not null default now(),
  progress_seconds integer,
  context jsonb not null default '{}'::jsonb,
  constraint recently_played_progress_chk check (progress_seconds is null or progress_seconds >= 0)
);

-- Playback events for analytics
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

-- ============================================================================
-- STORAGE & UPLOAD ENTITIES
-- ============================================================================

-- Upload batches for processing jobs
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
    total_files >= 0 and total_bytes >= 0 and accepted_files >= 0
    and rejected_files >= 0 and uploaded_files >= 0 and failed_files >= 0
  )
);

-- Storage files metadata
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

-- Music assets (processed tracks)
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

-- Cloud uploads tracking
create table if not exists public.cloud_uploads (
  id uuid primary key default gen_random_uuid(),
  music_asset_id uuid references public.music_assets(id) on delete set null,
  storage_file_id uuid references public.storage_files(id) on delete set null,
  provider text not null default 'supabase',
  bucket_id text not null,
  object_key text not null,
  status text not null default 'completed',
  public_url text,
  secure_url text,
  cdn_url text,
  upload_id text not null,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (provider, upload_id)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- User indexes
create index if not exists users_email_idx on public.users (email);
create index if not exists users_username_idx on public.users (username) where deleted_at is null;
create index if not exists user_roles_role_id_idx on public.user_roles (role_id);

-- Artist indexes
create index if not exists artists_name_trgm_idx on public.artists using gin (name gin_trgm_ops) where deleted_at is null;
create index if not exists artists_search_idx on public.artists using gin (search_vector);

-- Album indexes
create index if not exists albums_artist_idx on public.albums (artist_id) where deleted_at is null;
create index if not exists albums_title_trgm_idx on public.albums using gin (title gin_trgm_ops) where deleted_at is null;
create index if not exists albums_search_idx on public.albums using gin (search_vector);

-- Song indexes
create index if not exists songs_artist_idx on public.songs (artist);
create index if not exists songs_artist_id_idx on public.songs (artist_id) where deleted_at is null;
create index if not exists songs_album_id_idx on public.songs (album_id) where deleted_at is null;
create index if not exists songs_status_created_idx on public.songs (status, created_at desc) where deleted_at is null;
create index if not exists songs_search_idx on public.songs using gin (search_vector);
create index if not exists songs_title_trgm_idx on public.songs using gin (title gin_trgm_ops) where deleted_at is null;
create index if not exists song_artists_artist_idx on public.song_artists (artist_id, position);
create index if not exists song_genres_genre_idx on public.song_genres (genre_id);

-- Playlist indexes
create index if not exists playlists_user_idx on public.playlists (user_id, created_at desc) where deleted_at is null;
create index if not exists playlists_public_idx on public.playlists (is_public, created_at desc) where deleted_at is null;
create index if not exists playlists_search_idx on public.playlists using gin (search_vector);
create index if not exists playlist_songs_playlist_position_idx on public.playlist_songs (playlist_id, position);
create index if not exists playlist_songs_song_idx on public.playlist_songs (song_id);
create index if not exists playlist_collaborators_user_idx on public.playlist_collaborators (user_id);

-- User interaction indexes
create index if not exists likes_user_idx on public.likes (user_id, liked_at desc);
create index if not exists likes_song_idx on public.likes (song_id);
create index if not exists recently_played_user_idx on public.recently_played (user_id, played_at desc);
create index if not exists recently_played_song_idx on public.recently_played (song_id, played_at desc);
create index if not exists playback_events_user_created_idx on public.playback_events (user_id, created_at desc);
create index if not exists playback_events_song_created_idx on public.playback_events (song_id, created_at desc);

-- Storage indexes
create index if not exists storage_files_bucket_key_idx on public.storage_files (bucket_id, object_key);
create index if not exists storage_files_checksum_idx on public.storage_files (checksum) where checksum is not null;
create index if not exists storage_files_batch_idx on public.storage_files (upload_batch_id);
create index if not exists music_assets_checksum_idx on public.music_assets (checksum);
create index if not exists music_assets_artist_album_idx on public.music_assets (artist, album);
create index if not exists music_assets_status_idx on public.music_assets (status, created_at desc) where deleted_at is null;
create index if not exists music_assets_uploaded_at_idx on public.music_assets (uploaded_at desc);
create index if not exists upload_batches_status_idx on public.upload_batches (status, created_at desc);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'users', 'roles', 'permissions', 'role_permissions', 'user_roles',
    'artists', 'albums', 'genres', 'songs', 'song_artists', 'song_genres',
    'playlists', 'playlist_collaborators', 'playlist_songs', 'likes',
    'recently_played', 'playback_events', 'upload_batches', 'storage_files',
    'music_assets'
  ]
  loop
    execute format('alter table public.%I enable row level security', table_name);
  end loop;
end $$;

-- Users policies
create policy if not exists users_select on public.users for select to authenticated
  using ((select auth.uid()) = id or (select app_private.is_admin()));

create policy if not exists users_update_own on public.users for update to authenticated
  using ((select auth.uid()) = id or (select app_private.is_admin()))
  with check ((select auth.uid()) = id or (select app_private.is_admin()));

-- Artists policies
create policy if not exists public_read_artists on public.artists for select to anon, authenticated
  using (deleted_at is null);

create policy if not exists admin_write_artists on public.artists for all to authenticated
  using ((select app_private.is_admin()))
  with check ((select app_private.is_admin()));

-- Albums policies
create policy if not exists public_read_albums on public.albums for select to anon, authenticated
  using (deleted_at is null);

create policy if not exists admin_write_albums on public.albums for all to authenticated
  using ((select app_private.is_admin()))
  with check ((select app_private.is_admin()));

-- Genres policies
create policy if not exists public_read_genres on public.genres for select to anon, authenticated
  using (true);

create policy if not exists admin_write_genres on public.genres for all to authenticated
  using ((select app_private.is_admin()))
  with check ((select app_private.is_admin()));

-- Songs policies
create policy if not exists public_read_songs on public.songs for select to anon, authenticated
  using (deleted_at is null and status = 'published');

create policy if not exists admin_write_songs on public.songs for all to authenticated
  using ((select app_private.is_admin()))
  with check ((select app_private.is_admin()));

-- Song-Artist policies
create policy if not exists public_read_song_artists on public.song_artists for select to anon, authenticated
  using (exists (
    select 1 from public.songs s
    where s.id = song_id and s.deleted_at is null and s.status = 'published'
  ));

create policy if not exists public_read_song_genres on public.song_genres for select to anon, authenticated
  using (exists (
    select 1 from public.songs s
    where s.id = song_id and s.deleted_at is null and s.status = 'published'
  ));

-- Playlist policies
create policy if not exists playlists_select on public.playlists for select to anon, authenticated
  using (
    deleted_at is null
    and (
      is_public = true
      or visibility in ('public', 'unlisted')
      or ((select auth.uid()) is not null and user_id = (select auth.uid()))
      or ((select auth.uid()) is not null and exists (
        select 1 from public.playlist_collaborators pc
        where pc.playlist_id = id and pc.user_id = (select auth.uid())
      ))
      or (select app_private.is_admin())
    )
  );

create policy if not exists playlists_insert on public.playlists for insert to authenticated
  with check (user_id = (select auth.uid()) or (select app_private.is_admin()));

create policy if not exists playlists_update on public.playlists for update to authenticated
  using (user_id = (select auth.uid()) or (select app_private.is_admin()))
  with check (user_id = (select auth.uid()) or (select app_private.is_admin()));

create policy if not exists playlists_delete on public.playlists for delete to authenticated
  using (user_id = (select auth.uid()) or (select app_private.is_admin()));

-- Playlist collaborators policies
create policy if not exists playlist_collaborators_select on public.playlist_collaborators
  for select to authenticated
  using (user_id = (select auth.uid()) or (select app_private.can_manage_playlist(playlist_id)));

create policy if not exists playlist_collaborators_manage on public.playlist_collaborators
  for all to authenticated
  using (exists (select 1 from public.playlists p where p.id = playlist_id and p.user_id = (select auth.uid())) or (select app_private.is_admin()))
  with check (exists (select 1 from public.playlists p where p.id = playlist_id and p.user_id = (select auth.uid())) or (select app_private.is_admin()));

-- Playlist songs policies
create policy if not exists playlist_songs_select on public.playlist_songs for select to anon, authenticated
  using (exists (
    select 1 from public.playlists p
    where p.id = playlist_id
      and p.deleted_at is null
      and (p.is_public = true or p.visibility in ('public', 'unlisted') or p.user_id = (select auth.uid()) or (select app_private.is_admin()))
  ));

create policy if not exists playlist_songs_manage on public.playlist_songs for all to authenticated
  using ((select app_private.can_manage_playlist(playlist_id)))
  with check ((select app_private.can_manage_playlist(playlist_id)));

-- Likes policies
create policy if not exists likes_own on public.likes for all to authenticated
  using (user_id = (select auth.uid()) or (select app_private.is_admin()))
  with check (user_id = (select auth.uid()) or (select app_private.is_admin()));

-- Recently played policies
create policy if not exists recently_played_own on public.recently_played for all to authenticated
  using (user_id = (select auth.uid()) or (select app_private.is_admin()))
  with check (user_id = (select auth.uid()) or (select app_private.is_admin()));

-- Playback events policies
create policy if not exists playback_events_own on public.playback_events for all to authenticated
  using (user_id = (select auth.uid()) or (select app_private.is_admin()))
  with check (user_id = (select auth.uid()) or (select app_private.is_admin()));

-- Storage files policies
create policy if not exists storage_files_admin_or_owner on public.storage_files for all to authenticated
  using ((select app_private.is_admin()) or owner_user_id = (select auth.uid()) or uploaded_by = (select auth.uid()))
  with check ((select app_private.is_admin()) or owner_user_id = (select auth.uid()) or uploaded_by = (select auth.uid()));

-- Music assets policies
create policy if not exists music_assets_admin_select on public.music_assets for select to authenticated
  using ((select app_private.is_admin()));

create policy if not exists music_assets_admin_write on public.music_assets for all to authenticated
  using ((select app_private.is_admin()))
  with check ((select app_private.is_admin()));

-- Cloud uploads policies
create policy if not exists cloud_uploads_admin on public.cloud_uploads for all to authenticated
  using ((select app_private.is_admin()))
  with check ((select app_private.is_admin()));

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Updated_at triggers for all tables with updated_at column
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'users', 'artists', 'albums', 'songs', 'playlists', 'music_assets',
    'upload_batches', 'storage_files'
  ]
  loop
    execute format('
      drop trigger if exists set_%I_updated_at on public.%I;
      create trigger set_%I_updated_at
      before update on public.%I
      for each row execute function app_private.set_updated_at()
    ', table_name, table_name, table_name, table_name);
  end loop;
end $$;

-- Audit triggers
create trigger if not exists audit_songs_changes
  after insert or update or delete on public.songs
  for each row execute function app_private.audit_row_change();

create trigger if not exists audit_music_assets_changes
  after insert or update or delete on public.music_assets
  for each row execute function app_private.audit_row_change();

-- Auth user creation trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function app_private.handle_new_user();

-- ============================================================================
-- DEFAULT DATA
-- ============================================================================

-- Insert default roles
insert into public.roles (key, name, description) values
  ('super_admin', 'Super Admin', 'Full system ownership, including role and security management'),
  ('admin', 'Admin', 'Operational administrator with upload and catalog management access'),
  ('curator', 'Curator', 'Can manage catalog metadata and playlists'),
  ('listener', 'Listener', 'Default signed-in application user')
on conflict (key) do nothing;

-- Insert default permissions
insert into public.permissions (key, description) values
  ('catalog.read', 'Read published catalog records'),
  ('catalog.write', 'Create and update catalog records'),
  ('uploads.manage', 'Manage upload batches and asset processing'),
  ('users.manage', 'Manage user roles and access'),
  ('audit.read', 'Read audit and activity logs'),
  ('settings.manage', 'Manage system settings')
on conflict (key) do nothing;

-- Assign permissions to roles
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on
  r.key = 'super_admin'
  or (r.key = 'admin' and p.key in ('catalog.read', 'catalog.write', 'uploads.manage', 'audit.read', 'settings.manage'))
  or (r.key = 'curator' and p.key in ('catalog.read', 'catalog.write'))
  or (r.key = 'listener' and p.key in ('catalog.read'))
on conflict do nothing;

-- ============================================================================
-- PERMISSIONS GRANTS
-- ============================================================================

grant usage on schema public to anon, authenticated, service_role;
grant usage on schema app_private to authenticated, service_role;
grant execute on function app_private.has_role(public.app_role) to authenticated, service_role;
grant execute on function app_private.is_admin() to authenticated, service_role;
grant execute on function app_private.can_manage_playlist(uuid) to authenticated, service_role;

grant select on public.artists, public.albums, public.genres, public.songs,
  public.song_artists, public.song_genres to anon, authenticated;

grant select on public.playlists, public.playlist_songs to anon, authenticated;
grant select, update on public.users to authenticated;
grant select, insert, update, delete on public.playlists, public.playlist_songs,
  public.playlist_collaborators, public.likes, public.recently_played,
  public.playback_events to authenticated;

-- Service role gets full access
grant select, insert, update, delete on
  public.users, public.roles, public.permissions, public.role_permissions, public.user_roles,
  public.artists, public.albums, public.genres, public.songs, public.song_artists, public.song_genres,
  public.music_assets, public.playlists, public.playlist_collaborators, public.playlist_songs,
  public.likes, public.recently_played, public.playback_events, public.upload_batches,
  public.storage_files
  to service_role;

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Catalog search function
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

-- Playback event recording function
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

grant execute on function public.search_catalog(text, integer) to anon, authenticated, service_role;
grant execute on function public.record_playback_event(uuid, text, integer, text, text, jsonb) to authenticated, service_role;

commit;