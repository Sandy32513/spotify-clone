import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/songs - Get all songs
export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/songs - Create a new song (admin only in production)
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
   const { title, artist, url, thumbnail, duration, artist_id, album_id } = body;

   // Validate required fields
   if (!title || !artist || !url || !duration) {
     return NextResponse.json(
       { error: 'Missing required fields: title, artist, url, duration' },
       { status: 400 }
     );
   }

   // Validate URL format
   let urlObj;
   try {
     urlObj = new URL(url);
   } catch (err) {
     return NextResponse.json(
       { error: 'Invalid URL format' },
       { status: 400 }
     );
   }

   // Optional: Validate URL protocol
   if (!['http:', 'https:'].includes(urlObj.protocol)) {
     return NextResponse.json(
       { error: 'URL must be HTTP or HTTPS' },
       { status: 400 }
     );
   }

  const { data, error } = await supabase
    .from('songs')
    .insert({
      title,
      artist,
      artist_id: artist_id || null,
      album_id: album_id || null,
      url,
      thumbnail: thumbnail || '/default-album.png',
      duration,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
