'use client';

import Image from 'next/image';
import { usePlayerStore } from '@/store/playerStore';
import { useUIStore } from '@/store/uiStore';

export default function QueuePanel() {
  const { queue, currentSong, removeFromQueue, playSong } = usePlayerStore();
  const { showQueue, toggleQueue } = useUIStore();

  if (!showQueue) return null;

  return (
    <aside className="fixed right-0 top-16 bottom-24 w-80 bg-[#181818] border-l border-[#282828] z-40 flex flex-col">
      <div className="p-4 border-b border-[#282828] flex items-center justify-between">
        <h2 className="text-white font-bold">Queue</h2>
        <button
          onClick={toggleQueue}
          className="text-[#B3B3B3] hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>
      </div>

      {/* Now Playing */}
      {currentSong && (
        <div className="p-4 border-b border-[#282828]">
          <p className="text-xs text-[#B3B3B3] font-bold uppercase mb-3">Now Playing</p>
          <div className="flex items-center gap-3">
            <Image
              src={currentSong.thumbnail}
              alt={currentSong.title}
              width={48}
              height={48}
              className="w-12 h-12 rounded"
            />
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{currentSong.title}</p>
              <p className="text-sm text-[#B3B3B3] truncate">{currentSong.artist}</p>
            </div>
          </div>
        </div>
      )}

      {/* Queue List */}
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-xs text-[#B3B3B3] font-bold uppercase mb-3">Next Up</p>
        {queue.length === 0 ? (
          <p className="text-[#B3B3B3] text-sm">Queue is empty</p>
        ) : (
          <ul className="space-y-2">
            {queue.map((song, index) => (
              <li
                key={`${song.id}-${index}`}
                className={`flex items-center gap-3 p-2 rounded-lg hover:bg-[#282828] transition-colors cursor-pointer group ${
                  currentSong?.id === song.id ? 'bg-[#282828]' : ''
                }`}
                onClick={() => playSong(song)}
              >
                <Image
                  src={song.thumbnail}
                  alt={song.title}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${currentSong?.id === song.id ? 'text-[#1DB954]' : 'text-white'}`}>
                    {song.title}
                  </p>
                  <p className="text-xs text-[#B3B3B3] truncate">{song.artist}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromQueue(song.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-[#B3B3B3] hover:text-white transition-all"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
