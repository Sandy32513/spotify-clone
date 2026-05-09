// @ts-nocheck - Supabase types are experimental; ignoring to build
import { supabase } from '@/lib/supabase/client';
import type { Song, Playlist, PlaylistSong, User, Album, Artist } from '@/types';

// Users
export async function getUserById(id: string): Promise<{ data: User | null; error: any }> {
  const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
  return { data, error };
}

export async function getUserPlaylists(userId: string): Promise<{ data: Playlist[] | null; error: any }> {
  const { data, error } = await supabase
    .from('playlists')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
}

// Songs
export async function getAllSongs(): Promise<{ data: Song[] | null; error: any }> {
  const { data, error } = await supabase.from('songs').select('*').order('created_at', { ascending: false });
  return { data, error };
}

export async function getSongById(id: string): Promise<{ data: Song | null; error: any }> {
  const { data, error } = await supabase.from('songs').select('*').eq('id', id).single();
  return { data, error };
}

export async function getSongsByArtist(artistId: string): Promise<{ data: Song[] | null; error: any }> {
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .eq('artist_id', artistId)
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function searchSongs(query: string): Promise<{ data: Song[] | null; error: any }> {
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .or(`title.ilike.%${query}%,artist.ilike.%${query}%`)
    .limit(20);
  return { data, error };
}

// Playlists
export async function createPlaylist(
  userId: string,
  name: string,
  description?: string
): Promise<{ data: Playlist | null; error: any }> {
  const { data, error } = await supabase
    .from('playlists')
    .insert({
      user_id: userId,
      name,
      description: description || '',
      is_public: false,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();
  return { data, error };
}

export async function updatePlaylist(
  id: string,
  updates: Partial<Pick<Playlist, 'name' | 'description' | 'is_public'>>
): Promise<{ data: Playlist | null; error: any }> {
  const { data, error } = await supabase
    .from('playlists')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

export async function deletePlaylist(id: string): Promise<{ error: any }> {
  const { error } = await supabase.from('playlists').delete().eq('id', id);
  return { error };
}

export async function getPlaylistById(id: string): Promise<{ data: Playlist & { songs: Song[] } | null; error: any }> {
  // First get the playlist
  const { data: playlist, error: playlistError } = await supabase
    .from('playlists')
    .select('*')
    .eq('id', id)
    .single();

  if (playlistError) return { data: null, error: playlistError };

  // Then get songs via playlist_songs join
  const { data: playlistSongs, error: songsError } = await supabase
    .from('playlist_songs')
    .select(`
      position,
      song:songs(*)
    `)
    .eq('playlist_id', id)
    .order('position', { ascending: true });

  if (songsError) return { data: null, error: songsError };

  return {
    data: {
      ...playlist,
      songs: playlistSongs?.map((ps: any) => ps.song) || [],
    },
    error: null,
  };
}

export async function addSongToPlaylist(
  playlistId: string,
  songId: string
): Promise<{ data: PlaylistSong | null; error: any }> {
  // Get current max position
  const { data: existing } = await supabase
    .from('playlist_songs')
    .select('position')
    .eq('playlist_id', playlistId)
    .order('position', { ascending: false })
    .limit(1);

  const nextPosition = (existing?.[0]?.position || 0) + 1;

  const { data, error } = await supabase
    .from('playlist_songs')
    .insert({
      playlist_id: playlistId,
      song_id: songId,
      position: nextPosition,
      added_at: new Date().toISOString(),
    })
    .select()
    .single();

  return { data, error };
}

export async function removeSongFromPlaylist(
  playlistId: string,
  songId: string
): Promise<{ error: any }> {
  const { error } = await supabase
    .from('playlist_songs')
    .delete()
    .eq('playlist_id', playlistId)
    .eq('song_id', songId);
  return { error };
}

export async function reorderPlaylistSongs(
  playlistId: string,
  songIds: string[]
): Promise<{ error: any }> {
  const updates = songIds.map((songId, index) => ({
    playlist_id: playlistId,
    song_id: songId,
    position: index,
  }));

  // Delete and reinsert in correct order
  const { error: deleteError } = await supabase
    .from('playlist_songs')
    .delete()
    .eq('playlist_id', playlistId);

  if (deleteError) return { error: deleteError };

  const { error: insertError } = await supabase
    .from('playlist_songs')
    .insert(updates);

  return { error: insertError };
}

// Recently Played
export async function addToRecentlyPlayed(
  userId: string,
  songId: string
): Promise<{ error: any }> {
  const { error } = await supabase
    .from('recently_played')
    .insert({
      user_id: userId,
      song_id: songId,
      played_at: new Date().toISOString(),
    });
  return { error };
}

export async function getRecentlyPlayed(
  userId: string,
  limit: number = 20
): Promise<{ data: (Song & { played_at: string })[] | null; error: any }> {
  const { data, error } = await supabase
    .from('recently_played')
    .select(`
      played_at,
      song:songs(*)
    `)
    .eq('user_id', userId)
    .order('played_at', { ascending: false })
    .limit(limit);

  if (error) return { data: null, error };

  return {
    data: data?.map((item: any) => ({ ...item.song, played_at: item.played_at })) || [],
    error: null,
  };
}

// Liked Songs
export async function getLikedSongs(
  userId: string
): Promise<{ data: Song[] | null; error: any }> {
  const { data, error } = await supabase
    .from('likes')
    .select(`
      liked_at,
      song:songs(*)
    `)
    .eq('user_id', userId)
    .order('liked_at', { ascending: false });

  if (error) return { data: null, error };

  return {
    data: data?.map((item: any) => item.song) || [],
    error: null,
  };
}

export async function checkIsLiked(
  userId: string,
  songId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('likes')
    .select('id')
    .eq('user_id', userId)
    .eq('song_id', songId)
    .single();
  return !!data;
}

export async function toggleLikeSong(
  userId: string,
  songId: string,
  isCurrentlyLiked: boolean
): Promise<{ error: any }> {
  if (isCurrentlyLiked) {
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('user_id', userId)
      .eq('song_id', songId);
    return { error };
  } else {
    const { error } = await supabase
      .from('likes')
      .insert({
        user_id: userId,
        song_id: songId,
      });
    return { error };
  }
}
export async function getAllAlbums(): Promise<{ data: Album[] | null; error: any }> {
  const { data, error } = await supabase
    .from('albums')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function getAlbumById(id: string): Promise<{ data: Album & { songs: Song[] } | null; error: any }> {
  const { data: album, error: albumError } = await supabase
    .from('albums')
    .select('*')
    .eq('id', id)
    .single();

  if (albumError) return { data: null, error: albumError };

  const { data: songs, error: songsError } = await supabase
    .from('songs')
    .select('*')
    .eq('album_id', id)
    .order('created_at', { ascending: true });

  return {
    data: { ...album, songs: songs || [] },
    error: songsError,
  };
}

// Artists
export async function getAllArtists(): Promise<{ data: Artist[] | null; error: any }> {
  const { data, error } = await supabase.from('artists').select('*').order('name', { ascending: true });
  return { data, error };
}

export async function getArtistById(id: string): Promise<{ data: Artist & { songs: Song[] } | null; error: any }> {
  const { data: artist, error: artistError } = await supabase
    .from('artists')
    .select('*')
    .eq('id', id)
    .single();

  if (artistError) return { data: null, error: artistError };

  const { data: songs, error: songsError } = await supabase
    .from('songs')
    .select('*')
    .eq('artist_id', id)
    .order('created_at', { ascending: false });

  return {
    data: { ...artist, songs: songs || [] },
    error: songsError,
  };
}

// Combined search
export async function searchAll(
  query: string,
  limit: number = 10
): Promise<{
  data: {
    songs: Song[];
    albums: Album[];
    artists: Artist[];
    playlists: Playlist[];
  } | null;
  error: any;
}> {
  const [songsResult, albumsResult, artistsResult, playlistsResult] = await Promise.all([
    searchSongs(query),
    supabase.from('albums').select('*').ilike('title', `%${query}%`).limit(limit),
    supabase.from('artists').select('*').ilike('name', `%${query}%`).limit(limit),
    supabase.from('playlists').select('*').ilike('name', `%${query}%`).limit(limit),
  ]);

  return {
    data: {
      songs: songsResult.data || [],
      albums: albumsResult.data || [],
      artists: artistsResult.data || [],
      playlists: playlistsResult.data || [],
    },
    error: songsResult.error || albumsResult.error || artistsResult.error || playlistsResult.error,
  };
}
