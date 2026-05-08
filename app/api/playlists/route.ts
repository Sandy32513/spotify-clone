import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/playlists - List playlists
export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id');

  let query = supabase.from('playlists').select('*').order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  } else {
    // Only return public playlists for unauthenticated users
    query = query.eq('is_public', true);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/playlists - Create playlist
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name, description, is_public } = body;

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('playlists')
    .insert({
      user_id: user.id,
      name,
      description: description || '',
      is_public: is_public || false,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
