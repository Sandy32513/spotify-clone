import { usePlayerStore } from '@/store/playerStore';
import { act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from '@jest/globals';

describe('Player Store', () => {
  beforeEach(() => {
    // Reset store before each test
    usePlayerStore.getState().setCurrentSong(null);
    usePlayerStore.getState().clearQueue();
  });

  it('should initialize with default values', () => {
    const state = usePlayerStore.getState();
    expect(state.currentSong).toBeNull();
    expect(state.queue).toEqual([]);
    expect(state.isPlaying).toBe(false);
    expect(state.volume).toBe(0.7);
    expect(state.shuffle).toBe(false);
    expect(state.repeat).toBe('off');
  });

  it('should set current song', () => {
    const mockSong = {
      id: '1',
      title: 'Test Song',
      artist: 'Test Artist',
      url: 'https://example.com/song.mp3',
      thumbnail: 'https://example.com/thumb.jpg',
      duration: 180,
    };

    act(() => {
      usePlayerStore.getState().setCurrentSong(mockSong);
    });

    const state = usePlayerStore.getState();
    expect(state.currentSong).toEqual(mockSong);
  });

  it('should set queue', () => {
    const mockSongs = [
      { id: '1', title: 'Song 1', artist: 'Artist 1', url: '', thumbnail: '', duration: 180 },
      { id: '2', title: 'Song 2', artist: 'Artist 2', url: '', thumbnail: '', duration: 200 },
    ];

    act(() => {
      usePlayerStore.getState().setQueue(mockSongs);
    });

    const state = usePlayerStore.getState();
    expect(state.queue).toEqual(mockSongs);
    expect(state.originalQueue).toEqual(mockSongs);
  });

  it('should toggle shuffle', () => {
    act(() => {
      usePlayerStore.getState().toggleShuffle();
    });

    let state = usePlayerStore.getState();
    expect(state.shuffle).toBe(true);

    act(() => {
      usePlayerStore.getState().toggleShuffle();
    });

    state = usePlayerStore.getState();
    expect(state.shuffle).toBe(false);
  });

  it('should cycle repeat modes', () => {
    act(() => {
      usePlayerStore.getState().cycleRepeat();
    });

    let state = usePlayerStore.getState();
    expect(state.repeat).toBe('all');

    act(() => {
      usePlayerStore.getState().cycleRepeat();
    });

    state = usePlayerStore.getState();
    expect(state.repeat).toBe('one');

    act(() => {
      usePlayerStore.getState().cycleRepeat();
    });

    state = usePlayerStore.getState();
    expect(state.repeat).toBe('off');
  });

  it('should set volume', () => {
    act(() => {
      usePlayerStore.getState().setVolume(0.5);
    });

    const state = usePlayerStore.getState();
    expect(state.volume).toBe(0.5);
  });

  it('should add song to queue', () => {
    const initialSongs = [
      { id: '1', title: 'Song 1', artist: 'Artist 1', url: '', thumbnail: '', duration: 180 },
    ];

    act(() => {
      usePlayerStore.getState().setQueue(initialSongs);
    });

    const newSong = { id: '2', title: 'Song 2', artist: 'Artist 2', url: '', thumbnail: '', duration: 200 };

    act(() => {
      usePlayerStore.getState().addToQueue(newSong);
    });

    const state = usePlayerStore.getState();
    expect(state.queue.length).toBe(2);
    expect(state.queue[1]).toEqual(newSong);
  });

  it('should remove song from queue', () => {
    const songs = [
      { id: '1', title: 'Song 1', artist: 'Artist 1', url: '', thumbnail: '', duration: 180 },
      { id: '2', title: 'Song 2', artist: 'Artist 2', url: '', thumbnail: '', duration: 200 },
    ];

    act(() => {
      usePlayerStore.getState().setQueue(songs);
    });

    act(() => {
      usePlayerStore.getState().removeFromQueue('1');
    });

    const state = usePlayerStore.getState();
    expect(state.queue.length).toBe(1);
    expect(state.queue[0].id).toBe('2');
  });

  it('should clear queue', () => {
    const songs = [
      { id: '1', title: 'Song 1', artist: 'Artist 1', url: '', thumbnail: '', duration: 180 },
    ];

    act(() => {
      usePlayerStore.getState().setQueue(songs);
    });

    act(() => {
      usePlayerStore.getState().clearQueue();
    });

    const state = usePlayerStore.getState();
    expect(state.queue).toEqual([]);
    expect(state.originalQueue).toEqual([]);
  });
});
