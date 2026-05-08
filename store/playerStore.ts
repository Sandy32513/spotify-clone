import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Howl as HowlType } from 'howler';
import type { Song, RepeatMode } from '@/types';

type HowlConstructor = typeof import('howler').Howl;

let HowlClass: HowlConstructor | null = null;

async function loadHowler() {
  if (HowlClass) return HowlClass;
  const howler = await import('howler');
  HowlClass = howler.Howl;
  return HowlClass;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function shuffleSongs(songs: Song[]) {
  const next = [...songs];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

interface PlayerStore {
  // State
  currentSong: Song | null;
  queue: Song[];
  originalQueue: Song[];
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  shuffle: boolean;
  repeat: RepeatMode;
  sound: HowlType | null;
  isLoading: boolean;
  _rafId: number | null;
  _loadToken: number;

  // Actions
  setCurrentSong: (song: Song | null) => void;
  setQueue: (songs: Song[]) => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (songId: string) => void;
  clearQueue: () => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  playNext: () => void;
  playPrevious: () => void;
  playSong: (song: Song, queue?: Song[]) => void;
  seekTo: (position: number) => void;
  _loadSong: (song: Song | null, autoplay?: boolean) => Promise<void>;
  _startProgressLoop: () => void;
  _stopProgressLoop: () => void;
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      currentSong: null,
      queue: [],
      originalQueue: [],
      isPlaying: false,
      volume: 0.7,
      progress: 0,
      duration: 0,
      shuffle: false,
      repeat: 'off',
      sound: null,
      isLoading: false,
      _rafId: null,
      _loadToken: 0,

      setCurrentSong: (song) => {
        void get()._loadSong(song, false);
      },

      setQueue: (songs) => {
        set({ queue: songs, originalQueue: songs });
      },

      addToQueue: (song) => {
        set((state) => ({ queue: [...state.queue, song] }));
      },

      removeFromQueue: (songId) => {
        set((state) => ({
          queue: state.queue.filter((song) => song.id !== songId),
        }));
      },

      clearQueue: () => {
        set({ queue: [], originalQueue: [] });
      },

      play: () => {
        const { sound, currentSong } = get();
        if (sound) {
          sound.play();
          return;
        }

        if (currentSong) {
          void get()._loadSong(currentSong, true);
        }
      },

      pause: () => {
        const { sound } = get();
        if (sound) {
          sound.pause();
        }
      },

      togglePlay: () => {
        const { isPlaying, play, pause } = get();
        if (isPlaying) pause();
        else play();
      },

      setVolume: (volume) => {
        const nextVolume = clamp(volume, 0, 1);
        get().sound?.volume(nextVolume);
        set({ volume: nextVolume });
      },

      setProgress: (progress) => {
        set({ progress: Math.max(0, progress) });
      },

      setDuration: (duration) => {
        set({ duration: Math.max(0, duration) });
      },

      toggleShuffle: () => {
        const { shuffle, queue, originalQueue, currentSong } = get();
        if (!shuffle) {
          const rest = queue.filter((song) => song.id !== currentSong?.id);
          set({
            shuffle: true,
            queue: currentSong ? [currentSong, ...shuffleSongs(rest)] : shuffleSongs(rest),
          });
        } else {
          set({ shuffle: false, queue: [...originalQueue] });
        }
      },

      cycleRepeat: () => {
        const modes: RepeatMode[] = ['off', 'all', 'one'];
        const currentIndex = modes.indexOf(get().repeat);
        set({ repeat: modes[(currentIndex + 1) % modes.length] });
      },

      playNext: () => {
        const { queue, currentSong, repeat, sound } = get();
        if (queue.length === 0) return;

        if (repeat === 'one') {
          sound?.seek(0);
          sound?.play();
          return;
        }

        const currentIndex = queue.findIndex((song) => song.id === currentSong?.id);
        const isLast = currentIndex === queue.length - 1;

        if (isLast && repeat !== 'all') {
          sound?.stop();
          set({ isPlaying: false, progress: 0 });
          return;
        }

        const nextIndex = currentIndex === -1 || isLast ? 0 : currentIndex + 1;
        const nextSong = queue[nextIndex];
        if (nextSong) get().playSong(nextSong);
      },

      playPrevious: () => {
        const { queue, currentSong, progress } = get();
        if (queue.length === 0) return;

        if (progress > 3) {
          get().seekTo(0);
          return;
        }

        const currentIndex = queue.findIndex((song) => song.id === currentSong?.id);
        const prevIndex = currentIndex <= 0 ? queue.length - 1 : currentIndex - 1;
        const prevSong = queue[prevIndex];
        if (prevSong) get().playSong(prevSong);
      },

      playSong: (song, queueOverride) => {
        if (queueOverride) {
          get().setQueue(queueOverride);
        } else if (get().queue.length === 0) {
          get().setQueue([song]);
        }

        void get()._loadSong(song, true);
      },

      seekTo: (position) => {
        const { sound, duration } = get();
        if (!sound || duration <= 0 || Number.isNaN(position)) return;
        const nextPosition = clamp(position, 0, duration);
        sound.seek(nextPosition);
        set({ progress: nextPosition });
      },

      _loadSong: async (song, autoplay = false) => {
        const previousSound = get().sound;
        const token = get()._loadToken + 1;

        get()._stopProgressLoop();
        // Stop and unload previous sound
        if (previousSound) {
          previousSound.stop();
          previousSound.unload();
        }

        if (!song) {
          set({
            currentSong: null,
            sound: null,
            isPlaying: false,
            isLoading: false,
            progress: 0,
            duration: 0,
            _loadToken: token,
          });
          return;
        }

        set({
          currentSong: song,
          sound: null,
          isPlaying: false,
          isLoading: true,
          progress: 0,
          duration: 0,
          _loadToken: token,
        });

         try {
           const Howl = await loadHowler();
           // Immediate token check after await
           if (get()._loadToken !== token) return;

           const nextSound = new Howl({
             src: [song.url],
             html5: true,
             volume: get().volume,
             preload: true,
             onload: () => {
               if (get()._loadToken !== token) {
                 nextSound.unload();
                 return;
               }
               set({ duration: nextSound.duration(), isLoading: false });
             },
             onplay: () => {
               if (get()._loadToken !== token) {
                 nextSound.pause();
                 return;
               }
               set({ isPlaying: true, isLoading: false });
               get()._startProgressLoop();
             },
             onpause: () => {
               if (get()._loadToken !== token) return;
               set({ isPlaying: false });
               get()._stopProgressLoop();
             },
             onstop: () => {
               if (get()._loadToken !== token) return;
               set({ isPlaying: false, progress: 0 });
               get()._stopProgressLoop();
             },
             onend: () => {
               if (get()._loadToken !== token) return;
               set({ progress: 0, isPlaying: false });
               get()._stopProgressLoop();
               get().playNext();
             },
             onloaderror: (_id, error) => {
               if (get()._loadToken !== token) return;
               console.error('Error loading audio:', error);
               set({ isLoading: false, isPlaying: false });
             },
             onplayerror: () => {
               nextSound.once('unlock', () => nextSound.play());
             },
           });

           set({ sound: nextSound });
           if (autoplay) nextSound.play();
          } catch (error) {
            console.error('Unable to initialize audio player:', error);
            if (get()._loadToken === token) {
              set({ isLoading: false, isPlaying: false });
            }
          }
        },

      _startProgressLoop: () => {
        get()._stopProgressLoop();

        const tick = () => {
          const { sound } = get();
          if (!sound) return;

          const seek = sound.seek();
          if (typeof seek === 'number' && Number.isFinite(seek)) {
            set({ progress: seek });
          }

          const rafId = requestAnimationFrame(tick);
          set({ _rafId: rafId });
        };

        const rafId = requestAnimationFrame(tick);
        set({ _rafId: rafId });
      },

      _stopProgressLoop: () => {
        const { _rafId } = get();
        if (_rafId !== null) {
          cancelAnimationFrame(_rafId);
          set({ _rafId: null });
        }
      },
    }),
    {
      name: 'player-storage',
      partialize: (state) => ({
        volume: state.volume,
        shuffle: state.shuffle,
        repeat: state.repeat,
      }),
    }
  )
);
