import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { URL } from 'url';

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
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return NextResponse.json(
      { error: 'Invalid or missing title' },
      { status: 400 }
    );
  }

  if (!artist || typeof artist !== 'string' || artist.trim().length === 0) {
    return NextResponse.json(
      { error: 'Invalid or missing artist' },
      { status: 400 }
    );
  }

  if (!url || typeof url !== 'string') {
    return NextResponse.json(
      { error: 'Missing or invalid url' },
      { status: 400 }
    );
  }

  if (typeof duration !== 'number' || duration <= 0) {
    return NextResponse.json(
      { error: 'Invalid duration: must be a positive number' },
      { status: 400 }
    );
  }

  // Validate URL format and安全性
  let urlObj: URL;
  try {
    urlObj = new URL(url);
  } catch {
    return NextResponse.json(
      { error: 'Invalid URL format' },
      { status: 400 }
    );
  }

  // Only allow HTTP/HTTPS
  if (!['http:', 'https:'].includes(urlObj.protocol)) {
    return NextResponse.json(
      { error: 'URL must use HTTP or HTTPS protocol' },
      { status: 400 }
    );
  }

  // Prevent SSRF: block private IP ranges and localhost
  const hostname = urlObj.hostname.toLowerCase();
  const privateIPRegex = /^(127\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.|localhost|::1|fc00:|fd00:|127\.0\.0\.1)$/;
  if (privateIPRegex.test(hostname) || hostname === '0.0.0.0') {
    return NextResponse.json(
      { error: 'URL points to a private or reserved address' },
      { status: 400 }
    );
  }

  // Additional optional validations
  if (artist_id && typeof artist_id !== 'string') {
    return NextResponse.json(
      { error: 'artist_id must be a valid UUID' },
      { status: 400 }
    );
  }

  if (album_id && typeof album_id !== 'string') {
    return NextResponse.json(
      { error: 'album_id must be a valid UUID' },
      { status: 400 }
    );
  }

  if (thumbnail && typeof thumbnail !== 'string') {
    return NextResponse.json(
      { error: 'thumbnail must be a valid URL string' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('songs')
    .insert({
      title: title.trim(),
      artist: artist.trim(),
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
