'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import SongCard from '@/components/SongCard';
import PlaylistCard from '@/components/PlaylistCard';
import { usePlayerStore } from '@/store/playerStore';
import { getAllSongs, getUserPlaylists } from '@/lib/supabase/queries';
import { useAuthStore } from '@/store/authStore';
import type { Song, Playlist } from '@/types';

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { playSong } = usePlayerStore();

  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [songsRes, playlistsRes] = await Promise.all([
          getAllSongs(),
          user ? getUserPlaylists(user.id) : Promise.resolve({ data: null, error: null }),
        ]);

        if (songsRes.data) setSongs(songsRes.data);
        if (playlistsRes.data) setPlaylists(playlistsRes.data);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handlePlaySong = (song: Song) => {
    playSong(song, songs);
  };

  const handlePlayAll = () => {
    if (songs.length > 0) {
      playSong(songs[0], songs);
    }
  };

  const greet = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="w-12 h-12 border-4 border-[#1DB954] border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{greet()}</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={handlePlayAll}
              disabled={songs.length === 0}
              className="w-14 h-14 rounded-full bg-[#1DB954] flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50"
            >
              <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
            <span className="text-[#B3B3B3]">
              {songs.length} {songs.length === 1 ? 'song' : 'songs'} available
            </span>
          </div>
        </div>

        {/* Quick Play Grid */}
        {songs.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">Quick Play</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {songs.slice(0, 10).map((song) => (
                <div
                  key={song.id}
                  onClick={() => handlePlaySong(song)}
                  className="group bg-[#181818] hover:bg-[#282828] p-4 rounded-lg cursor-pointer transition-all"
                >
                  <div className="relative mb-4">
                    <Image
                      src={song.thumbnail}
                      alt={song.title}
                      width={320}
                      height={320}
                      className="w-full aspect-square object-cover rounded-md shadow-lg"
                    />
                    <button className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-[#1DB954] flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:scale-105">
                      <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </button>
                  </div>
                  <h3 className="text-white font-semibold truncate">{song.title}</h3>
                  <p className="text-sm text-[#B3B3B3] truncate">{song.artist}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Your Playlists */}
        {playlists.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Your Playlists</h2>
              <button
                onClick={() => router.push('/library')}
                className="text-sm text-[#B3B3B3] hover:underline"
              >
                Show all
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {playlists.slice(0, 5).map((playlist) => (
                <PlaylistCard key={playlist.id} playlist={playlist} />
              ))}
            </div>
          </section>
        )}

        {/* All Songs List */}
        {songs.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">All Songs</h2>
            <div className="bg-[#181818] rounded-lg">
              {/* Header */}
              <div className="grid grid-cols-[40px_1fr_1fr_80px] gap-4 px-4 py-2 border-b border-[#282828] text-[#B3B3B3] text-sm">
                <div>#</div>
                <div>Title</div>
                <div className="hidden md:block">Album</div>
                <div className="text-right">Duration</div>
              </div>

              {/* Songs */}
              <div>
                {songs.map((song, index) => (
                  <SongCard
                    key={song.id}
                    song={song}
                    index={index + 1}
                    queue={songs}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Empty State */}
        {songs.length === 0 && (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-white mb-4">No songs yet</h2>
            <p className="text-[#B3B3B3] mb-6">
              Add some songs to your library to get started.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
