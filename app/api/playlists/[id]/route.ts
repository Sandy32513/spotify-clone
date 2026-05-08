import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/playlists/:id - Get single playlist with songs
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // Get playlist
  const { data: playlist, error: playlistError } = await supabase
    .from('playlists')
    .select('*')
    .eq('id', id)
    .single();

  if (playlistError) {
    return NextResponse.json({ error: playlistError.message }, { status: 404 });
  }

  // Get songs via join
  const { data: playlistSongs, error: songsError } = await supabase
    .from('playlist_songs')
    .select(`
      position,
      song:songs(*)
    `)
    .eq('playlist_id', id)
    .order('position', { ascending: true });

  if (songsError) {
    return NextResponse.json({ error: songsError.message }, { status: 500 });
  }

  return NextResponse.json({
    ...playlist,
    songs: (playlistSongs as unknown as { song: any }[] | null)?.map((ps) => ps.song) || [],
  });
}

// DELETE /api/playlists/:id - Delete playlist
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const { error } = await supabase
    .from('playlists')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// PATCH /api/playlists/:id - Update playlist
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { name, description, is_public } = body;

  const { data, error } = await supabase
    .from('playlists')
    .update({
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(is_public !== undefined && { is_public }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
