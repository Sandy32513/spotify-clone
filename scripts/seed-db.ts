import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

async function seedDatabase() {
  console.log('🌱 Starting database seed...');

  try {
    // Check if data already exists
    const { count: songCount } = await supabase.from('songs').select('*', { count: 'exact', head: true });
    if (songCount && songCount > 0) {
      console.log('⚠️  Database already has songs. Skipping seed.');
      console.log('   To reseed, delete all songs first.');
      return;
    }

    // Sample artists
    const artists = [
      { id: uuidv4(), name: 'The Weeknd', image_url: 'https://example.com/weeknd.jpg', bio: 'Canadian singer-songwriter', followers_count: 10000000 },
      { id: uuidv4(), name: 'Ariana Grande', image_url: 'https://example.com/ariana.jpg', bio: 'American singer and actress', followers_count: 9000000 },
      { id: uuidv4(), name: 'Ed Sheeran', image_url: 'https://example.com/ed.jpg', bio: 'English singer-songwriter', followers_count: 12000000 },
      { id: uuidv4(), name: 'Taylor Swift', image_url: 'https://example.com/taylor.jpg', bio: 'American singer-songwriter', followers_count: 15000000 },
      { id: uuidv4(), name: 'Drake', image_url: 'https://example.com/drake.jpg', bio: 'Canadian rapper', followers_count: 11000000 },
    ];

    console.log('Inserting artists...');
    const { error: artistError } = await supabase.from('artists').insert(artists);
    if (artistError) throw artistError;

    // Sample albums
    const albums = [
      { id: uuidv4(), title: 'After Hours', artist_id: artists[0].id, artist: artists[0].name, thumbnail: 'https://example.com/after_hours.jpg', release_year: 2020 },
      { id: uuidv4(), title: 'Positions', artist_id: artists[1].id, artist: artists[1].name, thumbnail: 'https://example.com/positions.jpg', release_year: 2020 },
      { id: uuidv4(), title: 'Divide', artist_id: artists[2].id, artist: artists[2].name, thumbnail: 'https://example.com/divide.jpg', release_year: 2017 },
      { id: uuidv4(), title: '1989', artist_id: artists[3].id, artist: artists[3].name, thumbnail: 'https://example.com/1989.jpg', release_year: 2014 },
      { id: uuidv4(), title: 'Scorpion', artist_id: artists[4].id, artist: artists[4].name, thumbnail: 'https://example.com/scorpion.jpg', release_year: 2018 },
    ];

    console.log('Inserting albums...');
    const { error: albumError } = await supabase.from('albums').insert(albums);
    if (albumError) throw albumError;

    // Sample songs (using royalty-free placeholder URLs)
    const songs = [
      {
        id: uuidv4(),
        title: 'Blinding Lights',
        artist: artists[0].name,
        artist_id: artists[0].id,
        album_id: albums[0].id,
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        thumbnail: 'https://example.com/blinding_lights.jpg',
        duration: 200,
      },
      {
        id: uuidv4(),
        title: 'Save Your Tears',
        artist: artists[0].name,
        artist_id: artists[0].id,
        album_id: albums[0].id,
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        thumbnail: 'https://example.com/save_your_tears.jpg',
        duration: 215,
      },
      {
        id: uuidv4(),
        title: '34+35',
        artist: artists[1].name,
        artist_id: artists[1].id,
        album_id: albums[1].id,
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        thumbnail: 'https://example.com/34_35.jpg',
        duration: 170,
      },
      {
        id: uuidv4(),
        title: 'Shape of You',
        artist: artists[2].name,
        artist_id: artists[2].id,
        album_id: albums[2].id,
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
        thumbnail: 'https://example.com/shape_of_you.jpg',
        duration: 234,
      },
      {
        id: uuidv4(),
        title: 'Shake It Off',
        artist: artists[3].name,
        artist_id: artists[3].id,
        album_id: albums[3].id,
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
        thumbnail: 'https://example.com/shake_it_off.jpg',
        duration: 219,
      },
      {
        id: uuidv4(),
        title: 'God\'s Plan',
        artist: artists[4].name,
        artist_id: artists[4].id,
        album_id: albums[4].id,
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
        thumbnail: 'https://example.com/gods_plan.jpg',
        duration: 198,
      },
      {
        id: uuidv4(),
        title: 'Starboy',
        artist: artists[0].name,
        artist_id: artists[0].id,
        album_id: albums[0].id,
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
        thumbnail: 'https://example.com/starboy.jpg',
        duration: 230,
      },
      {
        id: uuidv4(),
        title: 'Thank U, Next',
        artist: artists[1].name,
        artist_id: artists[1].id,
        album_id: albums[1].id,
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
        thumbnail: 'https://example.com/thank_u_next.jpg',
        duration: 207,
      },
      {
        id: uuidv4(),
        title: 'Perfect',
        artist: artists[2].name,
        artist_id: artists[2].id,
        album_id: albums[2].id,
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
        thumbnail: 'https://example.com/perfect.jpg',
        duration: 263,
      },
      {
        id: uuidv4(),
        title: 'Blank Space',
        artist: artists[3].name,
        artist_id: artists[3].id,
        album_id: albums[3].id,
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
        thumbnail: 'https://example.com/blank_space.jpg',
        duration: 231,
      },
    ];

    console.log('Inserting songs...');
    const { error: songError } = await supabase.from('songs').insert(songs);
    if (songError) throw songError;

    console.log('');
    console.log('✅ Database seeded successfully!');
    console.log(`   - ${artists.length} artists`);
    console.log(`   - ${albums.length} albums`);
    console.log(`   - ${songs.length} songs`);
    console.log('');
    console.log('🎉 Ready to run: npm run dev');

  } catch (error: any) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
}

seedDatabase();
