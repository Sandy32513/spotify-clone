'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useState } from 'react';
import { createPlaylist } from '@/lib/supabase/queries';
import type { Playlist } from '@/types';

export default function Sidebar() {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    isSidebarOpen,
    selectedPlaylistId,
    resetNavigation,
  } = useUIStore();

  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  const handleNavigation = (view: string, id?: string) => {
    resetNavigation();
    if (view === 'home') {
      router.push('/');
    } else if (view === 'search') {
      router.push('/search');
    } else if (view === 'library') {
      router.push('/library');
    } else if (view === 'playlist' && id) {
      router.push(`/playlist/${id}`);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!user) return;

    const { data, error } = await createPlaylist(user.id, 'My Playlist', '');
    if (error) {
      console.error('Error creating playlist:', error);
    } else if (data) {
      setPlaylists((prev) => [...prev, data]);
      handleNavigation('playlist', data.id);
    }
  };

  return (
    <aside
      className={`h-full bg-[#000000] flex flex-col transition-all duration-300 ${
        isSidebarOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Logo */}
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2 group">
          <svg className="w-10 h-10 text-[#1DB954]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
          </svg>
          {isSidebarOpen && (
            <span className="text-white font-bold text-xl tracking-tight">Spotify</span>
          )}
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="px-2">
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => handleNavigation('home')}
              className="flex items-center gap-4 w-full px-4 py-3 text-[#B3B3B3] hover:text-white rounded-lg transition-colors group"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.5 3.247a1 1 0 0 0-1 0L4 7.577V20h4.5v-6a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v6H20V7.577l-7.5-4.33zm-2-1.732a3 3 0 0 1 3 0l7.5 4.33a2 2 0 0 1-1 1.732V4a2 2 0 0 0-2-2h-5a2 2 0 0 0-2 2v16h4.5v-7.5a2 2 0 0 1 1-1.732l7.5-4.33z" />
              </svg>
              {isSidebarOpen && <span className="font-bold">Home</span>}
            </button>
          </li>
          <li>
            <button
              onClick={() => handleNavigation('search')}
              className="flex items-center gap-4 w-full px-4 py-3 text-[#B3B3B3] hover:text-white rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10.533 1.279c-5.18 0-9.407 4.14-9.407 9.279s4.226 9.279 9.407 9.279c2.234 0 4.29-.77 5.907-2.058l4.353 4.353a1 1 0 1 1-1.414 1.414l-4.352-4.353a9.157 9.157 0 0 1-2.077 2.056c0-5.14 4.226-9.28 9.407-9.28zm-7.407 9.28c0-4.125 3.38-7.5 7.5-7.5s7.5 3.375 7.5 7.5-3.38 7.5-7.5 7.5-7.5-3.375-7.5-7.5z" />
              </svg>
              {isSidebarOpen && <span className="font-bold">Search</span>}
            </button>
          </li>
          <li>
            <button
              onClick={() => handleNavigation('library')}
              className="flex items-center gap-4 w-full px-4 py-3 text-[#B3B3B3] hover:text-white rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 22a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1zM15.5 2.134A1 1 0 0 0 14 3v18a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V6.464a1 1 0 0 0-.5-.866l-6-3.464zM9 2a1 1 0 0 0-1 1v18a1 1 0 1 0 2 0V3a1 1 0 0 0-1-1z" />
              </svg>
              {isSidebarOpen && <span className="font-bold">Your Library</span>}
            </button>
          </li>
        </ul>
      </nav>

      {/* Divider */}
      <div className="mx-6 my-2 border-t border-[#282828]" />

      {/* Playlist Section */}
      <div className="flex-1 overflow-y-auto px-2">
        <div className="flex items-center justify-between px-4 py-2">
          {isSidebarOpen && <span className="text-[#B3B3B3] font-bold text-sm">Playlists</span>}
          <button
            onClick={handleCreatePlaylist}
            className="p-1 rounded hover:bg-[#282828] text-[#B3B3B3] hover:text-white transition-colors"
            title="Create Playlist"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Liked Songs */}
        <button
          onClick={() => router.push('/liked')}
          className="flex items-center gap-4 w-full px-4 py-2 text-[#B3B3B3] hover:text-white rounded-lg transition-colors"
        >
          <div className="w-6 h-6 bg-gradient-to-br from-purple-700 to-blue-300 rounded flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
          {isSidebarOpen && <span className="font-medium">Liked Songs</span>}
        </button>

        {/* User Playlists */}
        <div className="mt-4 space-y-1">
          {playlists.map((playlist) => (
            <button
              key={playlist.id}
              onClick={() => handleNavigation('playlist', playlist.id)}
              className={`flex items-center gap-4 w-full px-4 py-2 rounded-lg transition-colors ${
                selectedPlaylistId === playlist.id
                  ? 'bg-[#282828] text-white'
                  : 'text-[#B3B3B3] hover:text-white hover:bg-[#1a1a1a]'
              }`}
            >
              <div className="w-6 h-6 bg-[#282828] rounded flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
                </svg>
              </div>
              {isSidebarOpen && (
                <span className="truncate font-medium">{playlist.name}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* User Profile */}
      {user && (
        <div className="p-4 border-t border-[#282828]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#282828] flex items-center justify-center">
              {user.avatar_url ? (
                <Image
                  src={user.avatar_url}
                  alt={user.email ?? 'User avatar'}
                  width={32}
                  height={32}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-sm">
                  {user.email?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{user.email}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
