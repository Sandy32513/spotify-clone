import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

// ── Song data ────────────────────────────────────────────────────────────────
// Manually curated artist assignments based on known Tamil film credits.
// Songs without definitive artist info are attributed to "Various Artists".
type SongEntry = {
  title: string;
  artist: string;
  url: string;
  duration: number; // seconds
  album?: string;
  thumbnail?: string;
};

const songs: SongEntry[] = [
  {
    title: 'The Complete Love of an Incomplete Life',
    artist: 'A.R. Rahman',
    url: 'https://res.cloudinary.com/dd7spu5to/video/upload/v1778241754/The-Complete-Love-of-an-Incomplete-Life-MassTamilan.io_xqazeq.mp3',
    duration: 270,
    album: 'The Complete Love of an Incomplete Life',
  },
  {
    title: 'Vilambara Idaiveli',
    artist: 'Karthik, Shreya Ghoshal',
    url: 'https://res.cloudinary.com/dd7spu5to/video/upload/v1778241749/Vilambara-Idaiveli-MassTamilan.com_p2jl0m.mp3',
    duration: 260,
    album: 'MassTamilan Collection',
  },
  {
    title: 'Yenga Appa',
    artist: 'Dhanush',
    url: 'https://res.cloudinary.com/dd7spu5to/video/upload/v1778241746/Yenga-Appa...-MassTamilan.io_o4aoba.mp3',
    duration: 240,
    album: 'MassTamilan Collection',
  },
  {
    title: 'Verithanam',
    artist: 'Vijay, Swetha Mohan',
    url: 'https://res.cloudinary.com/dd7spu5to/video/upload/v1778241741/Verithanam-MassTamilan.io_sp73ej.mp3',
    duration: 300,
    album: 'MassTamilan Collection',
  },
  {
    title: 'Vaa En Anjala (Version 2)',
    artist: 'A.R. Rahman, Shashaa Tirupati',
    url: 'https://res.cloudinary.com/dd7spu5to/video/upload/v1778241737/Vaa-En-Anjala-_Version-2_-MassTamilan.io_jx5bg8.mp3',
    duration: 265,
    album: 'MassTamilan Collection',
  },
  {
    title: 'Veezhvadhu Vetkam Alla.. Veezhndhey Kidappadhu Dhaan Vetkam',
    artist: 'Various Artists',
    url: 'https://res.cloudinary.com/dd7spu5to/video/upload/v1778241739/Veezhvadhu-Vetkam-Alla..-Veezhndhey-Kidappadhu-Dhaan-Vetkam-MassTamilan.io_vnckgi.mp3',
    duration: 280,
    album: 'MassTamilan Collection',
  },
  {
    title: 'Vaadi Nee Vaadi',
    artist: 'Various Artists',
    url: 'https://res.cloudinary.com/dd7spu5to/video/upload/v1778241739/Vaadi-Nee-Vaadi-MassTamilan.com_emaji6.mp3',
    duration: 250,
    album: 'MassTamilan Collection',
  },
  {
    title: 'Time To Meet',
    artist: 'Various Artists',
    url: 'https://res.cloudinary.com/dd7spu5to/video/upload/v1778241737/Time-To-Meet-MassTamilan.io_rwe4hv.mp3',
    duration: 245,
    album: 'MassTamilan Collection',
  },
  {
    title: 'Vaa En Anjala (Version 1)',
    artist: 'A.R. Rahman, Shashaa Tirupati',
    url: 'https://res.cloudinary.com/dd7spu5to/video/upload/v1778241735/Vaa-En-Anjala-_Version-1_-MassTamilan.io_vw65ui.mp3',
    duration: 260,
    album: 'MassTamilan Collection',
  },
  {
    title: 'Vaadi Nee Vaa',
    artist: 'Various Artists',
    url: 'https://res.cloudinary.com/dd7spu5to/video/upload/v1778241735/Vaadi-Nee-Vaa-MassTamilan.io_sgsgrz.mp3',
    duration: 248,
    album: 'MassTamilan Collection',
  },
  {
    title: 'Unakaga',
    artist: 'Various Artists',
    url: 'https://res.cloudinary.com/dd7spu5to/video/upload/v1778241734/Unakaga-MassTamilan.io_un8j0h.mp3',
    duration: 255,
    album: 'MassTamilan Collection',
  },
  {
    title: 'Singappenney',
    artist: 'A.R. Rahman, Shashaa Tirupati',
    url: 'https://res.cloudinary.com/dd7spu5to/video/upload/v1778241735/Singappenney-MassTamilan.io_pynzss.mp3',
    duration: 290,
    album: 'MassTamilan Collection',
  },
  {
    title: 'Too Close Yet Too Far',
    artist: 'Various Artists',
    url: 'https://res.cloudinary.com/dd7spu5to/video/upload/v1778241733/Too-Close-Yet-Too-Far-MassTamilan.io_d9fuuc.mp3',
    duration: 275,
    album: 'MassTamilan Collection',
  },
  {
    title: 'The Conquest of Time',
    artist: 'Various Artists',
    url: 'https://res.cloudinary.com/dd7spu5to/video/upload/v1778241726/The-Conquest-of-Time_rzbm8a.mp3',
    duration: 285,
    album: 'MassTamilan Collection',
  },
  {
    title: 'Ulaga Azhagiye Neeyaa',
    artist: 'Various Artists',
    url: 'https://res.cloudinary.com/dd7spu5to/video/upload/v1778241730/Ulaga-Azhagiye-Neeyaa-MassTamilan.io_zhh2vr.mp3',
    duration: 252,
    album: 'MassTamilan Collection',
  },
  {
    title: 'Takkunu Takkunu',
    artist: 'Various Artists',
    url: 'https://res.cloudinary.com/dd7spu5to/video/upload/v1778241724/Takkunu-Takkunu-MassTamilan.org_ozcxph.mp3',
    duration: 238,
    album: 'MassTamilan Collection',
  },
  {
    title: 'Saitji Saitji',
    artist: 'Various Artists',
    url: 'https://res.cloudinary.com/dd7spu5to/video/upload/v1778241723/Saitji-Saitji-MassTamilan.com_hzy00z.mp3',
    duration: 246,
    album: 'MassTamilan Collection',
  },
  {
    title: 'Ready Steady Go',
    artist: 'Various Artists',
    url: 'https://res.cloudinary.com/dd7spu5to/video/upload/v1778241723/Ready-Steady-Go-MassTamilan.fm_ecmpbs.mp3',
    duration: 242,
    album: 'MassTamilan Collection',
  },
];

const DEFAULT_THUMBNAIL = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f';

async function upsertArtist(name: string): Promise<string> {
  const { data, error } = await supabase
    .from('artists')
    .select('id')
    .eq('name', name)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  if (data?.id) {
    return data.id;
  }

  const id = uuidv4();
  // Insert only columns we know exist: id, name, image_url, bio, followers_count
  const { error: insertError } = await supabase.from('artists').insert({
    id,
    name,
    image_url: DEFAULT_THUMBNAIL,
    bio: `Tamil film music artist: ${name}`,
    followers_count: 0,
  });

  if (insertError) throw insertError;
  console.log(`  ✓ Created artist: ${name}`);
  return id;
}

async function createAlbum(title: string, artistId: string, artistName: string): Promise<string> {
  const id = uuidv4();
  const { error } = await supabase.from('albums').insert({
    id,
    title,
    artist_id: artistId,
    artist: artistName,
    thumbnail: DEFAULT_THUMBNAIL,
    release_year: 2025,
  });

  if (error) throw error;
  console.log(`  ✓ Created album: ${title}`);
  return id;
}

async function insertSong(song: SongEntry, artistId: string, albumId: string): Promise<void> {
  const { error } = await supabase.from('songs').insert({
    id: uuidv4(),
    title: song.title,
    slug: song.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    artist: song.artist,
    artist_id: artistId,
    album_id: albumId,
    url: song.url,
    thumbnail: DEFAULT_THUMBNAIL,
    duration: song.duration,
    track_number: 1,
    status: 'published',
    is_explicit: false,
    play_count: 0,
    like_count: 0,
  });

  if (error) throw error;
}

async function linkArtistToSong(songId: string, artistId: string): Promise<void> {
  const { error } = await supabase.from('song_artists').insert({
    song_id: songId,
    artist_id: artistId,
    // role and position have defaults ('primary', 1)
  });

  if (error) throw error;
}

async function linkGenreToSong(songId: string, genreId: string): Promise<void> {
  const { error } = await supabase.from('song_genres').insert({
    song_id: songId,
    genre_id: genreId,
  });

  if (error) throw error;
}

async function ensureGenre(name: string): Promise<string> {
  const { data, error } = await supabase
    .from('genres')
    .select('id')
    .eq('name', name)
    .single();

  if (data?.id) return data.id;

  const id = uuidv4();
  const { error: insertError } = await supabase.from('genres').insert({
    id,
    name,
    slug: name.toLowerCase(),
  });

  if (insertError) throw insertError;
  console.log(`  ✓ Created genre: ${name}`);
  return id;
}

async function main() {
  console.log('🎵 Starting Tamil songs bulk insert...\n');

  try {
    // Ensure base genres exist
    console.log('Ensuring base genres exist...');
    const genreId = await ensureGenre('Pop');
    console.log('');

    // Check for existing songs with these titles to avoid duplicates
    const titles = songs.map(s => s.title);
    const { data: existingSongs } = await supabase
      .from('songs')
      .select('title')
      .in('title', titles);

    const existingSet = new Set(existingSongs?.map(s => s.title) ?? []);
    const toInsert = songs.filter(s => !existingSet.has(s.title));

    if (toInsert.length === 0) {
      console.log('✅ All songs already exist in database. Nothing to do.');
      return;
    }

    console.log(`Found ${toInsert.length} new songs to insert (${songs.length - toInsert.length} already exist).\n`);

    // Collect all unique artists
    const uniqueArtists = Array.from(new Set(toInsert.map(s => s.artist)));
    console.log(`Artists to upsert: ${uniqueArtists.join(', ')}`);

    const artistIdMap = new Map<string, string>();
    for (const artistName of uniqueArtists) {
      const id = await upsertArtist(artistName);
      artistIdMap.set(artistName, id);
    }

    console.log('');

    // Group songs by album (use provided album or default collection)
    const albumMap = new Map<string, { title: string; artistName: string }>();
    for (const song of toInsert) {
      const albumTitle = song.album || 'MassTamilan Collection';
      if (!albumMap.has(albumTitle)) {
        albumMap.set(albumTitle, {
          title: albumTitle,
          artistName: song.artist,
        });
      }
    }

    console.log(`Albums to create: ${albumMap.size}`);
    const albumIdMap = new Map<string, string>();

    for (const [albumTitle, meta] of albumMap) {
      const artistId = artistIdMap.get(meta.artistName)!;
      const albumId = await createAlbum(albumTitle, artistId, meta.artistName);
      albumIdMap.set(albumTitle, albumId);
    }

    console.log('');

    // Insert songs with relationships
    console.log('Inserting songs...');
    for (const song of toInsert) {
      const artistId = artistIdMap.get(song.artist)!;
      const albumId = albumIdMap.get(song.album || 'MassTamilan Collection')!;

      const { data: insertedSong, error: songInsertErr } = await supabase
        .from('songs')
        .insert({
          id: uuidv4(),
          title: song.title,
          artist: song.artist,
          artist_id: artistId,
          album_id: albumId,
          url: song.url,
          thumbnail: DEFAULT_THUMBNAIL,
          duration: song.duration,
        })
        .select('id')
        .single();

      if (songInsertErr) {
        throw new Error(`Failed to insert song "${song.title}": ${songInsertErr.message}${songInsertErr.details ? ' – ' + songInsertErr.details : ''}`);
      }

      await linkArtistToSong(insertedSong.id, artistId);
      await linkGenreToSong(insertedSong.id, genreId);

      console.log(`  ✓ ${song.title} (${song.artist})`);
    }

    console.log('\n✅ All songs inserted successfully!');
    console.log(`   Total inserted: ${toInsert.length}`);
    console.log(`   Total artists: ${artistIdMap.size}`);
    console.log(`   Total albums: ${albumIdMap.size}`);
    console.log('\n🎉 Ready to play – restart dev server if needed.');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    if (error.details) console.error('   Details:', error.details);
    process.exit(1);
  }
}

main();
