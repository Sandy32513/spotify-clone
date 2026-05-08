'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import SongCard from '@/components/SongCard';
import { getAllSongs } from '@/lib/supabase/queries';
import { useAuthStore } from '@/store/authStore';
import { usePlayerStore } from '@/store/playerStore';
import type { Song } from '@/types';

export default function LikedSongsPage() {
  const { user } = useAuthStore();
  const { playSong } = usePlayerStore();
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | undefined>(user?.id);

  useEffect(() => {
    setUserId(user?.id);
  }, [user]);

  useEffect(() => {
    const loadLikedSongs = async () => {
      setLoading(true);
      // Get all songs (in real app, get only liked songs)
      const { data } = await getAllSongs();
      if (data) {
        setLikedSongs(data);
      }
      setLoading(false);
    };

    loadLikedSongs();
  }, [userId]);

  const handlePlayAll = () => {
    if (likedSongs.length > 0) {
      playSong(likedSongs[0], likedSongs);
    }
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
        {/* Header */}
        <div className="flex items-end gap-6 mb-8">
          <div className="w-56 h-56 bg-gradient-to-br from-purple-700 via-blue-300 to-cyan-400 rounded-lg shadow-2xl flex items-center justify-center">
            <svg className="w-20 h-20 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-[#B3B3B3] uppercase font-bold mb-2">Playlist</p>
            <h1 className="text-5xl font-bold text-white mb-4">Liked Songs</h1>
            <p className="text-sm text-[#B3B3B3]">
              {likedSongs.length} {likedSongs.length === 1 ? 'song' : 'songs'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={handlePlayAll}
            disabled={likedSongs.length === 0}
            className="w-14 h-14 rounded-full bg-[#1DB954] flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50"
          >
            <svg className="w-7 h-7 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        </div>

        {/* Songs List */}
        {likedSongs.length > 0 ? (
          <div className="bg-[#181818] rounded-lg">
            {/* Header */}
            <div className="grid grid-cols-[40px_1fr_80px] gap-4 px-4 py-2 border-b border-[#282828] text-[#B3B3B3] text-sm">
              <div>#</div>
              <div>Title</div>
              <div className="text-right">Duration</div>
            </div>

            {/* Songs */}
            <div>
              {likedSongs.map((song, index) => (
                <SongCard
                  key={song.id}
                  song={song}
                  index={index + 1}
                  queue={likedSongs}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-xl font-bold text-white mb-2">No liked songs yet</h2>
            <p className="text-[#B3B3B3]">
              Songs you like will appear here.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
