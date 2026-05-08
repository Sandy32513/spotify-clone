'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import SongCard from '@/components/SongCard';
import { getAlbumById } from '@/lib/supabase/queries';
import { usePlayerStore } from '@/store/playerStore';
import type { Album, Song } from '@/types';

export default function AlbumPage() {
  const params = useParams();
  const albumId = params.id as string;

  const { playSong } = usePlayerStore();
  const [album, setAlbum] = useState<(Album & { songs: Song[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentAlbumId, setCurrentAlbumId] = useState(albumId);

  useEffect(() => {
    setCurrentAlbumId(albumId);
  }, [albumId]);

  useEffect(() => {
    if (!currentAlbumId) return;

    const loadAlbum = async () => {
      setLoading(true);
      const { data, error } = await getAlbumById(currentAlbumId);
      if (data && !error) {
        setAlbum(data);
      }
      setLoading(false);
    };

    loadAlbum();
  }, [currentAlbumId]);

  const handlePlayAll = () => {
    if (album?.songs.length) {
      playSong(album.songs[0], album.songs);
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

  if (!album) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-white mb-4">Album not found</h2>
          <p className="text-[#B3B3B3]">This album doesn&apos;t exist.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8">
        <div className="flex items-end gap-6 mb-8">
          <div className="w-56 h-56 bg-gradient-to-br from-purple-700 to-blue-300 rounded-lg shadow-2xl flex items-center justify-center overflow-hidden">
            {album.thumbnail ? (
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${album.thumbnail})` }}
                role="img"
                aria-label={album.title}
              />
            ) : (
              <svg className="w-20 h-20 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z" />
              </svg>
            )}
          </div>
          <div>
            <p className="text-sm text-[#B3B3B3] uppercase font-bold mb-2">Album</p>
            <h1 className="text-5xl font-bold text-white mb-4">{album.title}</h1>
            <p className="text-white mb-2">
              {album.artist}{' '}
              {album.release_year && `• ${album.release_year}`}
            </p>
            <p className="text-sm text-[#B3B3B3]">
              {album.songs.length} {album.songs.length === 1 ? 'song' : 'songs'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={handlePlayAll}
            disabled={album.songs.length === 0}
            className="w-14 h-14 rounded-full bg-[#1DB954] flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50"
          >
            <svg className="w-7 h-7 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        </div>

        {album.songs.length > 0 ? (
          <div className="bg-[#181818] rounded-lg">
            <div className="grid grid-cols-[40px_1fr_1fr_80px] gap-4 px-4 py-2 border-b border-[#282828] text-[#B3B3B3] text-sm">
              <div>#</div>
              <div>Title</div>
              <div className="hidden md:block">Duration</div>
              <div className="text-right"></div>
            </div>

            <div>
              {album.songs.map((song, index) => (
                <SongCard
                  key={song.id}
                  song={song}
                  index={index + 1}
                  queue={album.songs}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-xl font-bold text-white mb-2">No songs in this album</h2>
            <p className="text-[#B3B3B3]">
              This album is empty.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
