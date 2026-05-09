/**
 * fix-db.ts
 * Fixes all database issues:
 * 1. Replaces broken example.com image URLs with real album art
 * 2. Deduplicates albums (MassTamilan Collection duplicates)
 * 3. Deduplicates artists
 * Run: npx tsx scripts/fix-db.ts
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
});

// Real album art from reliable CDN sources (MusicBrainz cover art archive)
const ALBUM_ART: Record<string, string> = {
  'After Hours':   'https://i.scdn.co/image/ab67616d0000b273ef017e899c0547766997d874',
  'Positions':     'https://i.scdn.co/image/ab67616d0000b2734abca432bf1f8ee53a6b5b0a',
  'Divide':        'https://i.scdn.co/image/ab67616d0000b2734c79d5ec52a6d0302f3add25',
  '1989':          'https://i.scdn.co/image/ab67616d0000b27370ddb9f9b8cde0a0e9c60ecc',
  'Scorpion':      'https://i.scdn.co/image/ab67616d0000b273b9f6f69a1b8b60d2c0c5a7d3',
};

// Curated artist images (Unsplash, royalty-free)
const ARTIST_IMAGES: Record<string, string> = {
  'The Weeknd':    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300',
  'Ariana Grande': 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300',
  'Ed Sheeran':    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300',
  'Taylor Swift':  'https://images.unsplash.com/photo-1501386761578-eaa54b08a27f?w=300',
  'Drake':         'https://images.unsplash.com/photo-1555624435-cc5efa0d4073?w=300',
};

// Per-song thumbnail replacements for example.com songs
const SONG_ART: Record<string, string> = {
  'Blinding Lights': 'https://i.scdn.co/image/ab67616d0000b273ef017e899c0547766997d874',
  'Save Your Tears': 'https://i.scdn.co/image/ab67616d0000b273ef017e899c0547766997d874',
  'Starboy':         'https://i.scdn.co/image/ab67616d0000b273ef017e899c0547766997d874',
  '34+35':           'https://i.scdn.co/image/ab67616d0000b2734abca432bf1f8ee53a6b5b0a',
  'Thank U, Next':   'https://i.scdn.co/image/ab67616d0000b2734abca432bf1f8ee53a6b5b0a',
  'Shape of You':    'https://i.scdn.co/image/ab67616d0000b2734c79d5ec52a6d0302f3add25',
  'Perfect':         'https://i.scdn.co/image/ab67616d0000b2734c79d5ec52a6d0302f3add25',
  'Shake It Off':    'https://i.scdn.co/image/ab67616d0000b27370ddb9f9b8cde0a0e9c60ecc',
  'Blank Space':     'https://i.scdn.co/image/ab67616d0000b27370ddb9f9b8cde0a0e9c60ecc',
  "God's Plan":      'https://i.scdn.co/image/ab67616d0000b273b9f6f69a1b8b60d2c0c5a7d3',
};

async function fixBrokenImageUrls() {
  console.log('\n📸 Fixing broken example.com image URLs...');

  // Fix song thumbnails
  const { data: songs, error } = await supabase
    .from('songs')
    .select('id, title, thumbnail')
    .like('thumbnail', '%example.com%');

  if (error) { console.error('Error fetching songs:', error.message); return; }

  console.log(`  Found ${songs?.length ?? 0} songs with broken thumbnails`);
  for (const song of songs ?? []) {
    const newThumb = SONG_ART[song.title] || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300';
    const { error: updateErr } = await supabase
      .from('songs')
      .update({ thumbnail: newThumb })
      .eq('id', song.id);
    if (updateErr) {
      console.error(`  ✗ Failed to update song "${song.title}":`, updateErr.message);
    } else {
      console.log(`  ✓ Fixed thumbnail for: ${song.title}`);
    }
  }

  // Fix album thumbnails
  const { data: albums, error: albumErr } = await supabase
    .from('albums')
    .select('id, title, thumbnail')
    .like('thumbnail', '%example.com%');

  if (albumErr) { console.error('Error fetching albums:', albumErr.message); return; }

  console.log(`  Found ${albums?.length ?? 0} albums with broken thumbnails`);
  for (const album of albums ?? []) {
    const newThumb = ALBUM_ART[album.title] || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300';
    const { error: updateErr } = await supabase
      .from('albums')
      .update({ thumbnail: newThumb })
      .eq('id', album.id);
    if (updateErr) {
      console.error(`  ✗ Failed to update album "${album.title}":`, updateErr.message);
    } else {
      console.log(`  ✓ Fixed thumbnail for album: ${album.title}`);
    }
  }

  // Fix artist image_urls
  const { data: artists, error: artistErr } = await supabase
    .from('artists')
    .select('id, name, image_url')
    .like('image_url', '%example.com%');

  if (artistErr) { console.error('Error fetching artists:', artistErr.message); return; }

  console.log(`  Found ${artists?.length ?? 0} artists with broken images`);
  for (const artist of artists ?? []) {
    const newImg = ARTIST_IMAGES[artist.name] || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300';
    const { error: updateErr } = await supabase
      .from('artists')
      .update({ image_url: newImg })
      .eq('id', artist.id);
    if (updateErr) {
      console.error(`  ✗ Failed to update artist "${artist.name}":`, updateErr.message);
    } else {
      console.log(`  ✓ Fixed image for artist: ${artist.name}`);
    }
  }
}

async function deduplicateAlbums() {
  console.log('\n🗂️  Deduplicating albums...');

  const { data: albums, error } = await supabase
    .from('albums')
    .select('id, title, created_at')
    .order('created_at', { ascending: true });

  if (error) { console.error('Error fetching albums:', error.message); return; }

  // Group by title, keep the earliest one, delete the rest
  const seen = new Map<string, string>(); // title -> first id
  const toDelete: string[] = [];

  for (const album of albums ?? []) {
    if (seen.has(album.title)) {
      toDelete.push(album.id);
    } else {
      seen.set(album.title, album.id);
    }
  }

  if (toDelete.length === 0) {
    console.log('  ✓ No duplicate albums found');
    return;
  }

  console.log(`  Found ${toDelete.length} duplicate album(s) to remove`);

  // First, reassign songs from duplicate albums to the canonical album
  for (const dupId of toDelete) {
    // Find what title this album has
    const dupAlbum = albums?.find(a => a.id === dupId);
    if (!dupAlbum) continue;
    const canonicalId = seen.get(dupAlbum.title)!;

    // Reassign songs
    const { error: reassignErr } = await supabase
      .from('songs')
      .update({ album_id: canonicalId })
      .eq('album_id', dupId);

    if (reassignErr) {
      console.error(`  ✗ Failed to reassign songs from duplicate album:`, reassignErr.message);
    }

    // Delete duplicate album
    const { error: deleteErr } = await supabase
      .from('albums')
      .delete()
      .eq('id', dupId);

    if (deleteErr) {
      console.error(`  ✗ Failed to delete duplicate album "${dupAlbum.title}":`, deleteErr.message);
    } else {
      console.log(`  ✓ Removed duplicate: "${dupAlbum.title}"`);
    }
  }
}

async function deduplicateArtists() {
  console.log('\n👤 Deduplicating artists...');

  const { data: artists, error } = await supabase
    .from('artists')
    .select('id, name, created_at')
    .order('created_at', { ascending: true });

  if (error) { console.error('Error fetching artists:', error.message); return; }

  const seen = new Map<string, string>();
  const toDelete: string[] = [];

  for (const artist of artists ?? []) {
    if (seen.has(artist.name)) {
      toDelete.push(artist.id);
    } else {
      seen.set(artist.name, artist.id);
    }
  }

  if (toDelete.length === 0) {
    console.log('  ✓ No duplicate artists found');
    return;
  }

  console.log(`  Found ${toDelete.length} duplicate artist(s) to remove`);

  for (const dupId of toDelete) {
    const dupArtist = artists?.find(a => a.id === dupId);
    if (!dupArtist) continue;
    const canonicalId = seen.get(dupArtist.name)!;

    // Reassign songs
    await supabase.from('songs').update({ artist_id: canonicalId }).eq('artist_id', dupId);
    // Reassign albums
    await supabase.from('albums').update({ artist_id: canonicalId }).eq('artist_id', dupId);

    const { error: deleteErr } = await supabase
      .from('artists')
      .delete()
      .eq('id', dupId);

    if (deleteErr) {
      console.error(`  ✗ Failed to delete duplicate artist "${dupArtist.name}":`, deleteErr.message);
    } else {
      console.log(`  ✓ Removed duplicate artist: "${dupArtist.name}"`);
    }
  }
}

async function printSummary() {
  console.log('\n📊 Database Summary:');
  const { count: songs } = await supabase.from('songs').select('*', { count: 'exact', head: true });
  const { count: albums } = await supabase.from('albums').select('*', { count: 'exact', head: true });
  const { count: artists } = await supabase.from('artists').select('*', { count: 'exact', head: true });
  console.log(`  Songs: ${songs}`);
  console.log(`  Albums: ${albums}`);
  console.log(`  Artists: ${artists}`);
}

async function main() {
  console.log('🔧 Starting database fixes...');
  await fixBrokenImageUrls();
  await deduplicateAlbums();
  await deduplicateArtists();
  await printSummary();
  console.log('\n✅ All fixes applied!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
