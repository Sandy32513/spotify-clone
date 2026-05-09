'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { useUIStore } from '@/store/uiStore';

export default function Player() {
  const {
    currentSong,
    isPlaying,
    volume,
    progress,
    duration,
    shuffle,
    repeat,
    togglePlay,
    setVolume,
    seekTo,
    toggleShuffle,
    cycleRepeat,
    playNext,
    playPrevious,
  } = usePlayerStore();

  const { showQueue, toggleQueue } = useUIStore();
  const progressRef = useRef<HTMLDivElement>(null);

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    let percent = (e.clientX - rect.left) / rect.width;
    // Clamp percent to [0, 1]
    percent = Math.max(0, Math.min(1, percent));
    const newTime = percent * duration;
    seekTo(newTime);
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  return (
    <div className="glass-player h-[72px] md:h-24 px-2 md:px-4 flex items-center justify-between border-t border-[#282828] md:border-none">
      {/* Track Info */}
      <div className="flex items-center gap-2 md:gap-4 w-[60%] md:w-1/4 min-w-0 md:min-w-[200px]">
        {currentSong ? (
          <>
            <div className="relative group shrink-0">
              <Image
                src={currentSong.thumbnail}
                alt={currentSong.title}
                width={56}
                height={56}
                className="w-10 h-10 md:w-14 md:h-14 rounded shadow-lg"
              />
              <div className="hidden md:flex absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded items-center justify-center">
                <button
                  onClick={togglePlay}
                  className="w-8 h-8 rounded-full bg-[#1DB954] flex items-center justify-center"
                >
                  {isPlaying ? (
                    <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div className="flex flex-col min-w-0 overflow-hidden">
              <p className="text-white font-medium truncate text-sm hover:underline cursor-pointer">
                {currentSong.title}
              </p>
              <p className="text-[#B3B3B3] text-xs truncate hover:underline cursor-pointer">
                {currentSong.artist}
              </p>
            </div>
          </>
        ) : (
          <div className="text-[#B3B3B3] text-sm">No track</div>
        )}
      </div>

      {/* Player Controls */}
      <div className="flex flex-row md:flex-col items-center justify-end md:justify-center gap-2 w-[40%] md:w-2/4 max-w-[722px]">
        <div className="flex items-center gap-2 md:gap-4">
          {/* Shuffle (Hidden on mobile) */}
          <button
            onClick={toggleShuffle}
            className={`hidden md:block transition-colors ${shuffle ? 'text-[#1DB954]' : 'text-[#B3B3B3] hover:text-white'}`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
            </svg>
          </button>

          {/* Previous (Hidden on mobile) */}
          <button
            onClick={playPrevious}
            className="hidden md:block text-[#B3B3B3] hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>

          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            disabled={!currentSong}
            className="w-10 h-10 md:rounded-full md:bg-white flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50"
          >
            {isPlaying ? (
              <svg className="w-7 h-7 md:w-5 md:h-5 md:text-black text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-7 h-7 md:w-5 md:h-5 md:text-black text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Next */}
          <button
            onClick={playNext}
            className="text-[#B3B3B3] hover:text-white transition-colors ml-2 md:ml-0"
          >
            <svg className="w-7 h-7 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>

          {/* Repeat (Hidden on mobile) */}
          <button
            onClick={cycleRepeat}
            className={`hidden md:block transition-colors relative ${
              repeat !== 'off' ? 'text-[#1DB954]' : 'text-[#B3B3B3] hover:text-white'
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z" />
            </svg>
            {repeat === 'one' && (
              <span className="absolute text-[8px] font-bold -top-1 -right-1">1</span>
            )}
          </button>
        </div>

        {/* Progress Bar (Hidden on mobile) */}
        <div className="hidden md:flex items-center gap-2 w-full">
          <span className="text-xs text-[#B3B3B3] w-10 text-right">
            {formatDuration(progress)}
          </span>
          <div
            ref={progressRef}
            onClick={handleProgressClick}
            className="flex-1 h-1 bg-[#4d4d4d] rounded-full cursor-pointer group relative"
          >
            <div
              className="h-full bg-white rounded-full relative"
              style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <span className="text-xs text-[#B3B3B3] w-10">
            {formatDuration(duration)}
          </span>
        </div>
      </div>

      {/* Volume & Extra Controls (Hidden on mobile) */}
      <div className="hidden md:flex items-center justify-end gap-3 w-1/4 min-w-[200px]">
        {/* Queue */}
        <button
          onClick={toggleQueue}
          className={`p-2 rounded transition-colors ${
            showQueue ? 'text-[#1DB954]' : 'text-[#B3B3B3] hover:text-white'
          }`}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
          </svg>
        </button>

        {/* Volume */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVolume(volume === 0 ? 0.7 : 0)}
            className="text-[#B3B3B3] hover:text-white transition-colors"
            title={volume === 0 ? 'Unmute' : 'Mute'}
          >
            {volume === 0 ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
              </svg>
            ) : volume < 0.5 ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              </svg>
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-24 accent-white cursor-pointer"
          />
        </div>
      </div>

      {/* Mobile Progress Bar (absolute bottom) */}
      <div className="md:hidden absolute bottom-0 left-0 right-0 h-[2px] bg-[#4d4d4d]">
        <div
          className="h-full bg-white transition-all"
          style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }}
        />
      </div>
    </div>
  );
}
