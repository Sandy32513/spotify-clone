create table if not exists public.music_assets (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist text not null,
  album text not null,
  genre text,
  duration integer not null default 0,
  bitrate integer,
  codec text,
  file_size bigint not null,
  original_path text not null,
  cloud_url text,
  cdn_url text,
  checksum text not null unique,
  uploaded_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists music_assets_artist_idx on public.music_assets (artist);
create index if not exists music_assets_album_idx on public.music_assets (album);
create index if not exists music_assets_checksum_idx on public.music_assets (checksum);
create index if not exists music_assets_created_at_idx on public.music_assets (created_at desc);

alter table public.music_assets enable row level security;

create policy if not exists "music assets are readable"
  on public.music_assets
  for select
  using (true);

