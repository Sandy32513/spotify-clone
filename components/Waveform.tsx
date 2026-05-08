'use client';

import { useRef, useState } from 'react';

interface WaveformProps {
  progress: number;
  duration: number;
  onSeek: (position: number) => void;
  isPlaying: boolean;
}

export default function Waveform({ progress, duration, onSeek, isPlaying }: WaveformProps) {
  const [bars] = useState(() => {
    const count = 100;
    return Array.from({ length: count }, () => Math.random() * 0.7 + 0.3);
  });

  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    if (!containerRef.current || !duration) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    onSeek(percentage * duration);
  };

  if (duration === 0) return null;

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className="waveform-container w-full h-12 cursor-pointer select-none"
    >
      {bars.map((height, index) => {
        const barEnd = ((index + 1) / bars.length) * 100;
        const isPlayed = barEnd <= (progress / duration) * 100;

        return (
          <div
            key={index}
            className="waveform-bar flex-1 mx-[1px] rounded-full transition-all duration-100"
            style={{
              height: isPlaying ? `${height * 100}%` : `${height * 30}%`,
              backgroundColor: isPlayed ? '#1DB954' : '#B3B3B3',
            }}
          />
        );
      })}
    </div>
  );
}
