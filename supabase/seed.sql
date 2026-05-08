-- Development-only seed data.
-- This does not create auth.users. Create test users through Supabase Auth UI or the app.

insert into public.genres (id, name, slug) values
  ('10000000-0000-0000-0000-000000000001', 'Pop', 'pop'),
  ('10000000-0000-0000-0000-000000000002', 'Electronic', 'electronic'),
  ('10000000-0000-0000-0000-000000000003', 'Indie', 'indie')
on conflict (id) do nothing;

insert into public.artists (id, name, slug, image_url, bio, followers_count, verified) values
  ('20000000-0000-0000-0000-000000000001', 'Neon Harbor', 'neon-harbor', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f', 'Synth-pop project for local development.', 12000, true),
  ('20000000-0000-0000-0000-000000000002', 'River Signal', 'river-signal', 'https://images.unsplash.com/photo-1516280440614-37939bbacd81', 'Indie artist sample record.', 8400, false),
  ('20000000-0000-0000-0000-000000000003', 'Midnight Index', 'midnight-index', 'https://images.unsplash.com/photo-1511379938547-c1f69419868d', 'Electronic sample artist.', 23000, true)
on conflict (id) do nothing;

insert into public.albums (id, title, slug, artist_id, artist, thumbnail, release_year, release_date, label) values
  ('30000000-0000-0000-0000-000000000001', 'Signals at Dawn', 'signals-at-dawn', '20000000-0000-0000-0000-000000000001', 'Neon Harbor', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f', 2026, '2026-01-15', 'Local Demo'),
  ('30000000-0000-0000-0000-000000000002', 'Quiet Current', 'quiet-current', '20000000-0000-0000-0000-000000000002', 'River Signal', 'https://images.unsplash.com/photo-1516280440614-37939bbacd81', 2025, '2025-08-10', 'Local Demo'),
  ('30000000-0000-0000-0000-000000000003', 'Index One', 'index-one', '20000000-0000-0000-0000-000000000003', 'Midnight Index', 'https://images.unsplash.com/photo-1511379938547-c1f69419868d', 2024, '2024-06-04', 'Local Demo')
on conflict (id) do nothing;

insert into public.songs (id, title, slug, artist, artist_id, album_id, url, thumbnail, duration, track_number, status) values
  ('40000000-0000-0000-0000-000000000001', 'First Light Loop', 'first-light-loop', 'Neon Harbor', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f', 372, 1, 'published'),
  ('40000000-0000-0000-0000-000000000002', 'Harbor Echo', 'harbor-echo', 'Neon Harbor', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f', 293, 2, 'published'),
  ('40000000-0000-0000-0000-000000000003', 'Slow Water Map', 'slow-water-map', 'River Signal', '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', 'https://images.unsplash.com/photo-1516280440614-37939bbacd81', 221, 1, 'published'),
  ('40000000-0000-0000-0000-000000000004', 'Index Pulse', 'index-pulse', 'Midnight Index', '20000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', 'https://images.unsplash.com/photo-1511379938547-c1f69419868d', 305, 1, 'published'),
  ('40000000-0000-0000-0000-000000000005', 'Verithanam', 'verithanam', 'Various Artists', null, null, 'https://res.cloudinary.com/dd7spu5to/video/upload/v1778240990/Verithanam-MassTamilan.io_lv5914.mp3', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f', 300, 1, 'published')
on conflict (id) do nothing;

insert into public.song_artists (song_id, artist_id, role, position) values
  ('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'primary', 1),
  ('40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'primary', 1),
  ('40000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', 'primary', 1),
  ('40000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000003', 'primary', 1)
on conflict do nothing;

insert into public.song_genres (song_id, genre_id) values
  ('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002'),
  ('40000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003'),
  ('40000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002'),
  ('40000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001')
on conflict do nothing;
