import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

const urls = [
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241711/Neeyum-Naanum-Anbe-MassTamilan.com_gbuvdt.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241666/Kadhale-Kadhale_fofmt6.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241653/iPhone-6-Nee-Yendral_wccgam.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241659/Game-Over-MassTamilan.io_hz68w3.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241702/Menaminiki-MassTamilan.org_akd2nh.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241691/Manohar-Is-In-Love-With-Keerthana-MassTamilan.io_duzywo.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241680/Local-In-International-MassTamilan.io_dufxh1.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241676/Kalangathey-MassTamilan.fm_wk6prv.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241636/Aranmanai_2_Theme_Music_w06cch.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241636/Arakkiyae-MassTamilan.fm_qaeviv.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241626/Anbae-Arivu-MassTamilan.fm_zmyaxb.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241737/Vaa-En-Anjala-_Version-2_-MassTamilan.io_jx5bg8.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241737/Time-To-Meet-MassTamilan.io_rwe4hv.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241733/Too-Close-Yet-Too-Far-MassTamilan.io_d9fuuc.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241723/Thanga-Sela-MassTamilan.fm_gxlz6t.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241707/Pooja-Hegde-Announcement-Theme-MassTamilan.so_s1ojhr.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241699/Maathare-MassTamilan.io_pqk5po.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241681/Maatikichu-MassTamilan.io_yelzew.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241723/Ready-Steady-Go-MassTamilan.fm_ecmpbs.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241654/Indru-Netru-Naalai_jw71zz.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241638/Bad-Boys-In-The-Block-Tonite-MassTamilan.io_z4a0mb.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241730/Ulaga-Azhagiye-Neeyaa-MassTamilan.io_zhh2vr.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241709/Meesaya-Murukku-MassTamilan.com_pkh5ku.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241693/Manohar_s-Funny-Proposal-To-Keerthana-MassTamilan.io_vmawk1.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778240990/Verithanam-MassTamilan.io_lv5914.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241749/Vilambara-Idaiveli-MassTamilan.com_p2jl0m.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241735/Singappenney-MassTamilan.io_pynzss.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241710/Party_with_the_Pei_ucd1qc.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241673/Kannirendum-MassTamilan.fm_hp3bun.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241641/Azhage_sn6kwv.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241735/Vaa-En-Anjala-_Version-1_-MassTamilan.io_vw65ui.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241724/Takkunu-Takkunu-MassTamilan.org_ozcxph.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241691/Machi-Engalukku-Ellam-MassTamilan.com_rb7lpf.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241677/Keerthana_s-Masterplan-MassTamilan.io_eir5ih.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241646/Engineering-College-Intro-MassTamilan.io_hhorze.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241638/Arabic-Kuthu---Halamithi-Habibo-MassTamilan.so_xbfffd.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241739/Veezhvadhu-Vetkam-Alla..-Veezhndhey-Kidappadhu-Dhaan-Vetkam-MassTamilan.io_vnckgi.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241710/Nee-Nenacha-MassTamilan.org_at1fpz.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241707/Naane-Than-Raja_odgzgo.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241677/Keerthana_s-Surprise-Visit-MassTamilan.io_nwb8uw.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241664/Kaalame-MassTamilan.io_voixdg.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241639/Bijili-Singh-MassTamilan.io_gxd6pn.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241641/Beast-Announcement-Theme-MassTamilan.so_ikhpid.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241665/Kadhal-Oru-Aagayam-MassTamilan.com_lhjfmn.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241638/Avamana-Patta-Dhaan_-MassTamilan.io_oy6lbq.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241634/Adiye-Sakkarakatti-MassTamilan.com_kkdph9.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241617/Adhi-Performs-In-College-Ragging-MassTamilan.io_dmi5v6.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241715/Revelation-of-Rudra-MassTamilan.io_tbsklc.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241704/Plan-A_b_c-MassTamilan.io_oe09md.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241641/Confession-of-Love-MassTamilan.io_emf1kh.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241619/Apram-MassTamilan.io_qy3mk4.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241723/Saitji-Saitji-MassTamilan.com_hzy00z.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241700/Maya_Maya_u6eybo.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241675/Keerthana-Proposes-Manohar-MassTamilan.io_qwzhbv.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241670/Kadhalikathey-MassTamilan.com_blyhcv.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241661/Enna-Nadanthalum-MassTamilan.com_xnoj67.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241754/The-Complete-Love-of-an-Incomplete-Life-MassTamilan.io_xqazeq.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241670/Kathakali-Theme_i9tkfd.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241687/Manohar-Explains-Aayudha-Pooja-MassTamilan.io_bdyses.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241687/Manohar-Explains-Aayudha-Pooja-MassTamilan.io_bdyses.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241683/Kovai-Gethu-Anthem-MassTamilan.com_r7gzkp.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241679/Keerthana-Vasudevan_s-Attitude-MassTamilan.io_cwltvr.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241673/Keerthana_s-Dream-MassTamilan.io_smx9il.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241646/Beast-Mode-MassTamilan.so_g6emq5.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241644/Don_t-Leave-Me-Alone-MassTamilan.io_te2v7h.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241715/Sakkarakatti-MassTamilan.io_aiaglu.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241712/Return-Of-The-Local-MassTamilan.io_ze92h0.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241659/Kaapatha-Vendiyadhu-Thambi-Ah-Illa-Da_-MassTamilan.io_siidyp.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241741/Verithanam-MassTamilan.io_sp73ej.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241726/The-Conquest-of-Time_rzbm8a.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241686/Maattikkichey-Maattikkichey-MassTamilan.com_zwevgo.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241683/Lion-vs-Hyenas-MassTamilan.com_abslgl.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241670/Kalakkalu-Mr.-Localu-MassTamilan.org_aenyge.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241656/Idharkuthaan-MassTamilan.io_pxf8g1.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241735/Vaadi-Nee-Vaa-MassTamilan.io_sgsgrz.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241734/Unakaga-MassTamilan.io_un8j0h.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241715/Poraada_Poraada_kcocal.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241659/Jolly-O-Gymkhana-MassTamilan.so_juqy8d.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241655/Heart-Quake-MassTamilan.io_j2pqhx.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241635/A-Forever_s-Promise-MassTamilan.io_wiz1hu.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241746/Yenga-Appa...-MassTamilan.io_o4aoba.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241739/Vaadi-Nee-Vaadi-MassTamilan.com_emaji6.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241718/Rudras-Symphony-MassTamilan.com_stziij.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241699/Mr.-Local-Theme-MassTamilan.org_ioyjij.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241677/Kathakali-Whistle_hy9brd.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241675/Kanavugal-MassTamilan.fm_kvxz7x.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241674/Keerthana_s-Kalaai-To-Manohar-MassTamilan.io_ma3rwt.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241648/Erangi-Vandhu_d7yiet.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241644/Bigil-Bigil-Bigiluma-MassTamilan.io_h3yiol.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241643/Enna-Nadandhalum-MassTamilan.io_vvmtpx.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241717/Sudhakar-Anna-MassTamilan.io_gwuajv.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241691/Manohar-Plays-Football-With-Rowdies-MassTamilan.io_abnhqw.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241689/Manohar-Confesses-His-Love-For-Keerthana-MassTamilan.io_mi2u0j.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241688/Kuchi_Mittai_ja5kti.mp3",
  "https://res.cloudinary.com/dd7spu5to/video/upload/v1778241638/Amma_The_Amman_Song_iiqakk.mp3"
];

const DEFAULT_THUMBNAIL = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&fit=crop';
const DEFAULT_ARTIST = 'Various Artists';
const DEFAULT_ALBUM = 'MassTamilan Extended Collection';

// Function to extract a human-readable title from the URL
function getTitleFromUrl(url: string) {
  // Extract the filename without the path
  const filename = url.split('/').pop() || '';
  // Remove the extension
  const nameWithoutExt = filename.split('.')[0];
  // Remove trailing MassTamilan tags and random hashes (e.g. -MassTamilan.com_gbuvdt)
  const cleanName = nameWithoutExt.replace(/-MassTamilan\.[a-z]+_[a-zA-Z0-9]+$/i, '')
                                  .replace(/_[a-zA-Z0-9]+$/, ''); // handles missing masstamilan tag but has hash
  
  // Replace hyphens and underscores with spaces
  return cleanName.replace(/[-_]/g, ' ').trim();
}

async function upsertArtist(name: string): Promise<string> {
  const { data, error } = await supabase
    .from('artists')
    .select('id')
    .eq('name', name)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  if (data?.id) return data.id;

  const id = uuidv4();
  const { error: insertError } = await supabase.from('artists').insert({
    id,
    name,
    image_url: DEFAULT_THUMBNAIL,
    bio: `Tamil film music artist: ${name}`,
    followers_count: 0,
    updated_at: new Date().toISOString()
  });

  if (insertError) throw insertError;
  return id;
}

async function upsertAlbum(title: string, artistId: string, artistName: string): Promise<string> {
  const { data, error } = await supabase
    .from('albums')
    .select('id')
    .eq('title', title)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  if (data?.id) return data.id;

  const id = uuidv4();
  const { error: insertError } = await supabase.from('albums').insert({
    id,
    title,
    artist_id: artistId,
    artist: artistName,
    thumbnail: DEFAULT_THUMBNAIL,
    release_year: 2025,
    updated_at: new Date().toISOString()
  });

  if (insertError) throw insertError;
  return id;
}

async function ensureGenre(name: string): Promise<string> {
  const { data, error } = await supabase
    .from('genres')
    .select('id')
    .eq('name', name)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  if (data?.id) return data.id;

  const id = uuidv4();
  const { error: insertError } = await supabase.from('genres').insert({
    id,
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
  });

  if (insertError) throw insertError;
  return id;
}

async function main() {
  console.log('🎵 Starting extended Tamil songs bulk insert...\n');

  try {
    const genreId = await ensureGenre('Pop');
    const artistId = await upsertArtist(DEFAULT_ARTIST);
    const albumId = await upsertAlbum(DEFAULT_ALBUM, artistId, DEFAULT_ARTIST);

    // Filter out duplicates directly from URLs to parse titles
    const uniqueTitles = Array.from(new Set(urls.map(getTitleFromUrl)));
    
    // Check existing songs in DB
    const { data: existingSongs } = await supabase
      .from('songs')
      .select('title')
      .in('title', uniqueTitles);

    const existingSet = new Set(existingSongs?.map(s => s.title) ?? []);
    
    // Create the final list to insert
    const toInsert = urls.map(url => ({
      title: getTitleFromUrl(url),
      url
    })).filter(s => !existingSet.has(s.title));

    // Remove duplicates from the array itself
    const finalToInsert = [];
    const seenTitles = new Set();
    for (const song of toInsert) {
      if (!seenTitles.has(song.title)) {
        seenTitles.add(song.title);
        finalToInsert.push(song);
      }
    }

    if (finalToInsert.length === 0) {
      console.log('✅ All songs already exist in database. Nothing to do.');
      return;
    }

    console.log(`Found ${finalToInsert.length} new songs to insert.\n`);

    for (const song of finalToInsert) {
      const { data: insertedSong, error: songInsertErr } = await supabase
        .from('songs')
        .insert({
          id: uuidv4(),
          title: song.title,
          artist: DEFAULT_ARTIST,
          artist_id: artistId,
          album_id: albumId,
          url: song.url,
          thumbnail: DEFAULT_THUMBNAIL,
          duration: 240, // default placeholder duration
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (songInsertErr) {
        console.error(`  ✗ Failed to insert song "${song.title}":`, songInsertErr.message);
        continue;
      }

      await supabase.from('song_artists').insert({
        song_id: insertedSong.id,
        artist_id: artistId,
      });

      await supabase.from('song_genres').insert({
        song_id: insertedSong.id,
        genre_id: genreId,
      });

      console.log(`  ✓ Added: ${song.title}`);
    }

    console.log('\n✅ Extended songs inserted successfully!');
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    if (error.details) console.error('   Details:', error.details);
    process.exit(1);
  }
}

main();
