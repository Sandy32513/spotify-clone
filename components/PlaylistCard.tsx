'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/store/uiStore';
import type { Playlist } from '@/types';

interface PlaylistCardProps {
  playlist: Playlist;
  onPlay?: () => void;
}

export default function PlaylistCard({ playlist, onPlay }: PlaylistCardProps) {
  const router = useRouter();
  const { setSelectedPlaylist } = useUIStore();
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    setSelectedPlaylist(playlist.id);
    router.push(`/playlist/${playlist.id}`);
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPlay) {
      onPlay();
    }
  };

  return (
    <div
      className="group bg-[#181818] hover:bg-[#282828] transition-all duration-300 rounded-lg p-4 cursor-pointer"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative mb-4">
        {playlist.thumbnail ? (
          <Image
            src={playlist.thumbnail}
            alt={playlist.name}
            width={320}
            height={320}
            className="w-full aspect-square object-cover rounded-md shadow-lg"
          />
        ) : (
          <div className="w-full aspect-square bg-[#282828] rounded-md flex items-center justify-center">
            <svg className="w-12 h-12 text-[#B3B3B3]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
            </svg>
          </div>
        )}

        {/* Play Button */}
        <button
          onClick={handlePlayClick}
          className={`absolute bottom-2 right-2 w-12 h-12 rounded-full bg-[#1DB954] flex items-center justify-center shadow-lg transition-all duration-300 ${
            isHovered ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
          } hover:scale-105`}
        >
          <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      </div>

      <h3 className="text-white font-semibold truncate mb-1">{playlist.name}</h3>
      <p className="text-sm text-[#B3B3B3] line-clamp-2">
        {playlist.description || 'No description'}
      </p>
    </div>
  );
}
