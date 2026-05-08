-- Create enum types if needed (future extension)

-- Create users table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create artists table
CREATE TABLE IF NOT EXISTS artists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT,
  bio TEXT,
  followers_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create albums table
CREATE TABLE IF NOT EXISTS albums (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  artist_id UUID REFERENCES artists(id) ON DELETE SET NULL,
  artist TEXT NOT NULL, -- Denormalized for easier querying
  thumbnail TEXT NOT NULL,
  release_year INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create songs table
CREATE TABLE IF NOT EXISTS songs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL, -- Denormalized for easier querying
  artist_id UUID REFERENCES artists(id) ON DELETE SET NULL,
  album_id UUID REFERENCES albums(id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  thumbnail TEXT NOT NULL,
  duration INTEGER NOT NULL, -- in seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create playlists table
CREATE TABLE IF NOT EXISTS playlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  thumbnail TEXT,
  is_public BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create playlist_songs junction table
CREATE TABLE IF NOT EXISTS playlist_songs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE NOT NULL,
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE NOT NULL,
  position INTEGER NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(playlist_id, song_id)
);

-- Create recently_played table
CREATE TABLE IF NOT EXISTS recently_played (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE NOT NULL,
  played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create likes table (for liked songs)
CREATE TABLE IF NOT EXISTS likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE NOT NULL,
  liked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, song_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_songs_artist ON songs(artist);
CREATE INDEX IF NOT EXISTS idx_songs_album ON songs(album_id);
CREATE INDEX IF NOT EXISTS idx_playlists_user ON playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_playlist_songs_playlist ON playlist_songs(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_songs_song ON playlist_songs(song_id);
CREATE INDEX IF NOT EXISTS idx_recently_played_user ON recently_played(user_id);
CREATE INDEX IF NOT EXISTS idx_recently_played_song ON recently_played(song_id);
CREATE INDEX IF NOT EXISTS idx_likes_user ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_song ON likes(song_id);

-- Insert sample data (for demo purposes)
INSERT INTO artists (id, name, image_url, bio, followers_count, created_at)
VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'The Weeknd', 'https://example.com/weeknd.jpg', 'Canadian singer-songwriter', 1000000, NOW()),
  ('550e8400-e29b-41d4-a716-446655440001', 'Ariana Grande', 'https://example.com/ariana.jpg', 'American singer and actress', 9000000, NOW()),
  ('550e8400-e29b-41d4-a716-446655440002', 'Ed Sheeran', 'https://example.com/ed.jpg', 'English singer-songwriter', 8000000, NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO albums (id, title, artist_id, artist, thumbnail, release_year, created_at)
VALUES
  ('660e8400-e29b-41d4-a716-446655440000', 'After Hours', '550e8400-e29b-41d4-a716-446655440000', 'The Weeknd', 'https://example.com/after_hours.jpg', 2020, NOW()),
  ('660e8400-e29b-41d4-a716-446655440001', 'Positions', '550e8400-e29b-41d4-a716-446655440001', 'Ariana Grande', 'https://example.com/positions.jpg', 2020, NOW()),
  ('660e8400-e29b-41d4-a716-446655440002', 'Divide', '550e8400-e29b-41d4-a716-446655440002', 'Ed Sheeran', 'https://example.com/divide.jpg', 2017, NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO songs (id, title, artist, artist_id, album_id, url, thumbnail, duration, created_at)
VALUES
  ('770e8400-e29b-41d4-a716-446655440000', 'Blinding Lights', 'The Weeknd', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', 'https://example.com/blinding_lights.mp3', 'https://example.com/blinding_lights.jpg', 200, NOW()),
  ('770e8400-e29b-41d4-a716-446655440001', 'Save Your Tears', 'The Weeknd', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', 'https://example.com/save_your_tears.mp3', 'https://example.com/save_your_tears.jpg', 215, NOW()),
  ('770e8400-e29b-41d4-a716-446655440002', '34+35', 'Ariana Grande', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'https://example.com/34_35.mp3', 'https://example.com/34_35.jpg', 170, NOW()),
  ('770e8400-e29b-41d4-a716-446655440003', 'Shape of You', 'Ed Sheeran', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', 'https://example.com/shape_of_you.mp3', 'https://example.com/shape_of_you.jpg', 234, NOW())
ON CONFLICT (id) DO NOTHING;

-- Function to update updated_at timestamp on playlists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on playlists
CREATE TRIGGER update_playlists_updated_at
BEFORE UPDATE ON playlists
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
