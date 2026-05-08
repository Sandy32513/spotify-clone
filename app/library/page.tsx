'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import PlaylistCard from '@/components/PlaylistCard';
import { getUserPlaylists, getAllAlbums, getAllArtists } from '@/lib/supabase/queries';
import { useAuthStore } from '@/store/authStore';
import type { Playlist, Album, Artist } from '@/types';

export default function LibraryPage() {
  const { user } = useAuthStore();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'playlists' | 'albums' | 'artists'>('playlists');
  const [userId, setUserId] = useState<string | undefined>(user?.id);

  useEffect(() => {
    setUserId(user?.id);
  }, [user]);

  useEffect(() => {
    const loadLibrary = async () => {
      try {
        const [playlistsRes, albumsRes, artistsRes] = await Promise.all([
          userId ? getUserPlaylists(userId) : Promise.resolve({ data: null, error: null }),
          getAllAlbums(),
          getAllArtists(),
        ]);

        if (playlistsRes.data) setPlaylists(playlistsRes.data);
        if (albumsRes.data) setAlbums(albumsRes.data);
        if (artistsRes.data) setArtists(artistsRes.data);
      } catch (error) {
        console.error('Error loading library:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLibrary();
  }, [userId]);

  const tabs = [
    { id: 'playlists', label: 'Playlists', count: playlists.length },
    { id: 'albums', label: 'Albums', count: albums.length },
    { id: 'artists', label: 'Artists', count: artists.length },
  ] as const;

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-white mb-6">Your Library</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-black'
                  : 'bg-[#232323] text-white hover:bg-[#2a2a2a]'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#1DB954] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Playlists */}
            {activeTab === 'playlists' && (
              <div>
                {playlists.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {playlists.map((playlist) => (
                      <PlaylistCard key={playlist.id} playlist={playlist} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <h2 className="text-xl font-bold text-white mb-2">No playlists yet</h2>
                    <p className="text-[#B3B3B3]">
                      Create your first playlist to start organizing your music.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Albums */}
            {activeTab === 'albums' && (
              <div>
                {albums.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {albums.map((album) => (
                      <div
                        key={album.id}
                        className="bg-[#181818] hover:bg-[#282828] p-4 rounded-lg cursor-pointer transition-all"
                      >
                        <Image
                          src={album.thumbnail}
                          alt={album.title}
                          width={320}
                          height={320}
                          className="w-full aspect-square object-cover rounded-md mb-3 shadow-lg"
                        />
                        <h3 className="text-white font-semibold truncate">{album.title}</h3>
                        <p className="text-sm text-[#B3B3B3] truncate">{album.artist}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <h2 className="text-xl font-bold text-white mb-2">No albums yet</h2>
                    <p className="text-[#B3B3B3]">
                      Albums will appear here once added.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Artists */}
            {activeTab === 'artists' && (
              <div>
                {artists.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {artists.map((artist) => (
                      <div
                        key={artist.id}
                        className="bg-[#181818] hover:bg-[#282828] p-4 rounded-lg cursor-pointer transition-all text-center"
                      >
                        <div className="w-40 h-40 mx-auto mb-3 rounded-full overflow-hidden bg-[#282828]">
                          {artist.image_url ? (
                            <Image
                              src={artist.image_url}
                              alt={artist.name}
                              width={160}
                              height={160}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <svg className="w-12 h-12 text-[#B3B3B3] mx-auto" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                          )}
                        </div>
                        <h3 className="text-white font-semibold truncate">{artist.name}</h3>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <h2 className="text-xl font-bold text-white mb-2">No artists yet</h2>
                    <p className="text-[#B3B3B3]">
                      Artists will appear here once added.
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
