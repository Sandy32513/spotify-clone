'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import SongCard from '@/components/SongCard';
import PlaylistCard from '@/components/PlaylistCard';
import { searchAll } from '@/lib/supabase/queries';
import type { Song, Album, Artist, Playlist } from '@/types';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'songs' | 'albums' | 'artists' | 'playlists'>('all');
  const [results, setResults] = useState<{
    songs: Song[];
    albums: Album[];
    artists: Artist[];
    playlists: Playlist[];
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setIsSearching(false);
      return;
    }

    let cancelled = false;
    setIsSearching(true);

    const timer = setTimeout(async () => {
      const { data } = await searchAll(query);
      if (cancelled) return;

      if (data) {
        setResults({
          songs: data.songs,
          albums: data.albums,
          artists: data.artists,
          playlists: data.playlists || [],
        });
      }
      setIsSearching(false);
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'songs', label: 'Songs' },
    { id: 'albums', label: 'Albums' },
    { id: 'artists', label: 'Artists' },
    { id: 'playlists', label: 'Playlists' },
  ] as const;

  const filteredResults = results
    ? {
        songs: activeTab === 'all' || activeTab === 'songs' ? results.songs : [],
        albums: activeTab === 'all' || activeTab === 'albums' ? results.albums : [],
        artists: activeTab === 'all' || activeTab === 'artists' ? results.artists : [],
        playlists: activeTab === 'all' || activeTab === 'playlists' ? results.playlists : [],
      }
    : null;

  return (
    <Layout>
      <div className="p-8">
        {/* Search Input */}
        <div className="relative max-w-md mb-8">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B3B3B3]"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M10.533 1.279c-5.18 0-9.407 4.14-9.407 9.279s4.226 9.279 9.407 9.279c2.234 0 4.29-.77 5.907-2.058l4.353 4.353a1 1 0 1 1-1.414 1.414l-4.352-4.353a9.157 9.157 0 0 1-2.077 2.056c0-5.14 4.226-9.28 9.407-9.28zm-7.407 9.28c0-4.125 3.38-7.5 7.5-7.5s7.5 3.375 7.5 7.5-3.38 7.5-7.5 7.5-7.5-3.375-7.5-7.5z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What do you want to listen to?"
            className="w-full pl-12 pr-4 py-3 bg-white text-black rounded-full focus:outline-none focus:ring-2 focus:ring-[#1DB954]"
          />
        </div>

        {/* Tabs */}
        {results && (
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
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Results */}
        {isSearching && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#1DB954] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!isSearching && filteredResults && (
          <>
            {/* Songs */}
            {(filteredResults.songs.length > 0 || activeTab === 'songs') && (
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-white mb-4">Songs</h2>
                {filteredResults.songs.length > 0 ? (
                  <div className="space-y-2">
                    {filteredResults.songs.map((song) => (
                      <SongCard
                        key={song.id}
                        song={song}
                        queue={filteredResults.songs}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-[#B3B3B3]">No songs found</p>
                )}
              </section>
            )}

            {/* Albums */}
            {(filteredResults.albums.length > 0 || activeTab === 'albums') && (
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-white mb-4">Albums</h2>
                {filteredResults.albums.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredResults.albums.map((album) => (
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
                  <p className="text-[#B3B3B3]">No albums found</p>
                )}
              </section>
            )}

            {/* Artists */}
            {(filteredResults.artists.length > 0 || activeTab === 'artists') && (
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-white mb-4">Artists</h2>
                {filteredResults.artists.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredResults.artists.map((artist) => (
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
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-12 h-12 text-[#B3B3B3]" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <h3 className="text-white font-semibold truncate">{artist.name}</h3>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#B3B3B3]">No artists found</p>
                )}
              </section>
            )}

            {/* Playlists */}
            {(filteredResults.playlists.length > 0 || activeTab === 'playlists') && (
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-white mb-4">Playlists</h2>
                {filteredResults.playlists.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredResults.playlists.map((playlist) => (
                      <PlaylistCard key={playlist.id} playlist={playlist} />
                    ))}
                  </div>
                ) : (
                  <p className="text-[#B3B3B3]">No playlists found</p>
                )}
              </section>
            )}
          </>
        )}

        {/* No Search */}
        {!query && !results && (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-white mb-4">Search for music</h2>
            <p className="text-[#B3B3B3]">
              Find your favorite songs, albums, artists, and playlists.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
