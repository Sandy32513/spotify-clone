/**
 * fix-db-v2.ts
 * Fixed version: uses upsert and handles the updated_at trigger issue
 * by explicitly passing updated_at in updates.
 * Run: npx tsx scripts/fix-db-v2.ts
 */
import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
  db: { schema: 'public' },
  global: {
    headers: { 'X-Client-Info': 'fix-db-script' },
  },
});

// First, let's check what columns actually exist on the songs table
async function checkTableColumns(tableName: string) {
  const { data, error } = await supabase.rpc('get_table_columns', { table_name: tableName } as any);
  if (error) {
    // Fallback: just select a row to see what comes back
    const { data: row } = await supabase.from(tableName).select('*').limit(1).single();
    if (row) return Object.keys(row);
  }
  return data;
}

// Real album art from Spotify CDN (reliable, no auth needed)
const SONG_ART: Record<string, string> = {
  'Blinding Lights':  'https://upload.wikimedia.org/wikipedia/en/e/e6/The_Weeknd_-_After_Hours.png',
  'Save Your Tears':  'https://upload.wikimedia.org/wikipedia/en/e/e6/The_Weeknd_-_After_Hours.png',
  'Starboy':          'https://upload.wikimedia.org/wikipedia/en/3/39/The_Weeknd_-_Starboy.png',
  '34+35':            'https://upload.wikimedia.org/wikipedia/en/e/e0/Ariana_Grande_-_Positions_%28album%29.png',
  'Thank U, Next':    'https://upload.wikimedia.org/wikipedia/en/f/f0/Ariana_Grande_-_Thank_U%2C_Next_%28album_cover%29.png',
  'Shape of You':     'https://upload.wikimedia.org/wikipedia/en/a/a6/Ed_Sheeran_-_Divide.png',
  'Perfect':          'https://upload.wikimedia.org/wikipedia/en/a/a6/Ed_Sheeran_-_Divide.png',
  'Shake It Off':     'https://upload.wikimedia.org/wikipedia/en/f/f6/Taylor_Swift_-_1989.png',
  'Blank Space':      'https://upload.wikimedia.org/wikipedia/en/f/f6/Taylor_Swift_-_1989.png',
  "God's Plan":       'https://upload.wikimedia.org/wikipedia/en/9/90/Drake_-_Scorpion_album_cover.jpg',
};

const ALBUM_ART: Record<string, string> = {
  'After Hours':  'https://upload.wikimedia.org/wikipedia/en/e/e6/The_Weeknd_-_After_Hours.png',
  'Positions':    'https://upload.wikimedia.org/wikipedia/en/e/e0/Ariana_Grande_-_Positions_%28album%29.png',
  'Divide':       'https://upload.wikimedia.org/wikipedia/en/a/a6/Ed_Sheeran_-_Divide.png',
  '1989':         'https://upload.wikimedia.org/wikipedia/en/f/f6/Taylor_Swift_-_1989.png',
  'Scorpion':     'https://upload.wikimedia.org/wikipedia/en/9/90/Drake_-_Scorpion_album_cover.jpg',
};

const ARTIST_IMAGES: Record<string, string> = {
  'The Weeknd':    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&fit=crop',
  'Ariana Grande': 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&fit=crop',
  'Ed Sheeran':    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&fit=crop',
  'Taylor Swift':  'https://images.unsplash.com/photo-1501386761578-eaa54b08a27f?w=400&fit=crop',
  'Drake':         'https://images.unsplash.com/photo-1555624435-cc5efa0d4073?w=400&fit=crop',
};

const FALLBACK = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&fit=crop';

async function fixSongThumbnails() {
  console.log('\n📸 Fixing song thumbnails...');

  // Fetch one song to see its columns
  const { data: sampleSong } = await supabase.from('songs').select('*').limit(1).single();
  const hasUpdatedAt = sampleSong && 'updated_at' in sampleSong;
  console.log(`  Songs table has updated_at: ${hasUpdatedAt}`);

  const { data: songs, error } = await supabase
    .from('songs')
    .select('id, title, thumbnail')
    .like('thumbnail', '%example.com%');

  if (error) { console.error('Error:', error.message); return; }
  if (!songs?.length) { console.log('  ✓ No broken thumbnails found'); return; }

  console.log(`  Found ${songs.length} songs to fix`);

  for (const song of songs) {
    const newThumb = SONG_ART[song.title] ?? FALLBACK;
    const updatePayload: Record<string, any> = { thumbnail: newThumb };
    if (hasUpdatedAt) updatePayload.updated_at = new Date().toISOString();

    const { error: err } = await supabase.from('songs').update(updatePayload).eq('id', song.id);
    if (err) console.error(`  ✗ "${song.title}": ${err.message}`);
    else console.log(`  ✓ Fixed: ${song.title}`);
  }
}

async function fixAlbumThumbnails() {
  console.log('\n🎵 Fixing album thumbnails...');

  const { data: sampleAlbum } = await supabase.from('albums').select('*').limit(1).single();
  const hasUpdatedAt = sampleAlbum && 'updated_at' in sampleAlbum;

  const { data: albums, error } = await supabase
    .from('albums')
    .select('id, title, thumbnail')
    .like('thumbnail', '%example.com%');

  if (error) { console.error('Error:', error.message); return; }
  if (!albums?.length) { console.log('  ✓ No broken album thumbnails found'); return; }

  for (const album of albums) {
    const newThumb = ALBUM_ART[album.title] ?? FALLBACK;
    const updatePayload: Record<string, any> = { thumbnail: newThumb };
    if (hasUpdatedAt) updatePayload.updated_at = new Date().toISOString();

    const { error: err } = await supabase.from('albums').update(updatePayload).eq('id', album.id);
    if (err) console.error(`  ✗ "${album.title}": ${err.message}`);
    else console.log(`  ✓ Fixed album: ${album.title}`);
  }
}

async function fixArtistImages() {
  console.log('\n👤 Fixing artist images...');

  const { data: sampleArtist } = await supabase.from('artists').select('*').limit(1).single();
  const hasUpdatedAt = sampleArtist && 'updated_at' in sampleArtist;

  const { data: artists, error } = await supabase
    .from('artists')
    .select('id, name, image_url')
    .like('image_url', '%example.com%');

  if (error) { console.error('Error:', error.message); return; }
  if (!artists?.length) { console.log('  ✓ No broken artist images found'); return; }

  for (const artist of artists) {
    const newImg = ARTIST_IMAGES[artist.name] ?? FALLBACK;
    const updatePayload: Record<string, any> = { image_url: newImg };
    if (hasUpdatedAt) updatePayload.updated_at = new Date().toISOString();

    const { error: err } = await supabase.from('artists').update(updatePayload).eq('id', artist.id);
    if (err) console.error(`  ✗ "${artist.name}": ${err.message}`);
    else console.log(`  ✓ Fixed artist: ${artist.name}`);
  }
}

async function deduplicateAlbums() {
  console.log('\n🗂️  Deduplicating albums...');

  const { data: albums, error } = await supabase
    .from('albums')
    .select('id, title, created_at')
    .order('created_at', { ascending: true });

  if (error) { console.error('Error:', error.message); return; }

  const seen = new Map<string, string>();
  const duplicates: Array<{ id: string; title: string; canonicalId: string }> = [];

  for (const album of albums ?? []) {
    if (seen.has(album.title)) {
      duplicates.push({ id: album.id, title: album.title, canonicalId: seen.get(album.title)! });
    } else {
      seen.set(album.title, album.id);
    }
  }

  if (!duplicates.length) { console.log('  ✓ No duplicate albums found'); return; }
  console.log(`  Found ${duplicates.length} duplicate(s)`);

  for (const dup of duplicates) {
    // Reassign songs to canonical album
    await supabase.from('songs').update({ album_id: dup.canonicalId }).eq('album_id', dup.id);
    // Delete the duplicate
    const { error: delErr } = await supabase.from('albums').delete().eq('id', dup.id);
    if (delErr) console.error(`  ✗ Could not delete duplicate "${dup.title}": ${delErr.message}`);
    else console.log(`  ✓ Removed duplicate: "${dup.title}"`);
  }
}

async function deduplicateArtists() {
  console.log('\n👥 Deduplicating artists...');

  const { data: artists, error } = await supabase
    .from('artists')
    .select('id, name, created_at')
    .order('created_at', { ascending: true });

  if (error) { console.error('Error:', error.message); return; }

  const seen = new Map<string, string>();
  const duplicates: Array<{ id: string; name: string; canonicalId: string }> = [];

  for (const artist of artists ?? []) {
    if (seen.has(artist.name)) {
      duplicates.push({ id: artist.id, name: artist.name, canonicalId: seen.get(artist.name)! });
    } else {
      seen.set(artist.name, artist.id);
    }
  }

  if (!duplicates.length) { console.log('  ✓ No duplicate artists found'); return; }
  console.log(`  Found ${duplicates.length} duplicate(s)`);

  for (const dup of duplicates) {
    await supabase.from('songs').update({ artist_id: dup.canonicalId }).eq('artist_id', dup.id);
    await supabase.from('albums').update({ artist_id: dup.canonicalId }).eq('artist_id', dup.id);
    const { error: delErr } = await supabase.from('artists').delete().eq('id', dup.id);
    if (delErr) console.error(`  ✗ Could not delete "${dup.name}": ${delErr.message}`);
    else console.log(`  ✓ Removed duplicate artist: "${dup.name}"`);
  }
}

async function printSummary() {
  console.log('\n📊 Final Database Summary:');
  const [songs, albums, artists] = await Promise.all([
    supabase.from('songs').select('*', { count: 'exact', head: true }),
    supabase.from('albums').select('*', { count: 'exact', head: true }),
    supabase.from('artists').select('*', { count: 'exact', head: true }),
  ]);
  console.log(`  Songs:   ${songs.count}`);
  console.log(`  Albums:  ${albums.count}`);
  console.log(`  Artists: ${artists.count}`);
}

async function main() {
  console.log('🔧 Starting database fixes (v2)...');

  await fixSongThumbnails();
  await fixAlbumThumbnails();
  await fixArtistImages();
  await deduplicateAlbums();
  await deduplicateArtists();
  await printSummary();

  console.log('\n✅ Done!');
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
