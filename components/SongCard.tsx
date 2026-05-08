'use client';

import Image from 'next/image';
import { usePlayerStore } from '@/store/playerStore';
import { formatTime } from '@/utils/helpers';
import type { Song } from '@/types';
import { useState } from 'react';

interface SongCardProps {
  song: Song;
  index?: number;
  showIndex?: boolean;
  queue?: Song[];
}

export default function SongCard({ song, index, showIndex = false, queue }: SongCardProps) {
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayerStore();
  const [isHovered, setIsHovered] = useState(false);

  const isCurrentSong = currentSong?.id === song.id;

  const handleClick = () => {
    if (isCurrentSong) {
      togglePlay();
    } else {
      playSong(song, queue);
    }
  };

  return (
    <div
      className={`group flex items-center gap-4 px-4 py-2 rounded-md transition-colors cursor-pointer ${
        isCurrentSong ? 'bg-[#282828]' : 'hover:bg-[#282828]'
      }`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Index or Play Button */}
      <div className="w-8 flex justify-center">
        {isHovered || isCurrentSong ? (
          <button className="text-white">
            {isCurrentSong && isPlaying ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        ) : showIndex ? (
          <span className="text-sm text-[#B3B3B3]">{index}</span>
        ) : (
          <div className="w-4 h-4" />
        )}
      </div>

      {/* Thumbnail */}
      {song.thumbnail ? (
        <Image
          src={song.thumbnail}
          alt={song.title}
          width={40}
          height={40}
          className="w-10 h-10 rounded object-cover"
        />
      ) : (
        <div className="w-10 h-10 rounded bg-[#282828]" />
      )}

      {/* Song Info */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isCurrentSong ? 'text-[#1DB954]' : 'text-white'}`}>
          {song.title}
        </p>
        <p className="text-sm text-[#B3B3B3] truncate">
          {song.artist}
        </p>
      </div>

      {/* Album */}
      <div className="hidden md:block flex-1 min-w-0">
        <p className="text-sm text-[#B3B3B3] truncate">
          {/* Placeholder for album name */}
        </p>
      </div>

      {/* Duration */}
      <div className="text-sm text-[#B3B3B3]">
        {formatTime(song.duration)}
      </div>
    </div>
  );
}
