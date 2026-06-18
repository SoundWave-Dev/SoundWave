// ============================================================
// SOUNDWAVE — PLAYER STORE (Zustand)
// ============================================================

import { create } from 'zustand';
import type { Track, RepeatMode } from '@/types';
import { DEFAULT_VOLUME } from '@/lib/constants';

interface PlayerStore {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  progress: number;        // 0–1
  volume: number;          // 0–1
  isMuted: boolean;
  repeatMode: RepeatMode;
  isShuffled: boolean;

  // Actions
  play: (track: Track, queue?: Track[]) => void;
  pause: () => void;
  resume: () => void;
  next: () => void;
  prev: () => void;
  seek: (progress: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  addToQueue: (track: Track) => void;
  clearQueue: () => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentTrack: null,
  queue: [],
  isPlaying: false,
  progress: 0,
  volume: DEFAULT_VOLUME,
  isMuted: false,
  repeatMode: 'none',
  isShuffled: false,

  play: (track, queue = []) =>
    set({ currentTrack: track, queue, isPlaying: true, progress: 0 }),

  pause: () => set({ isPlaying: false }),

  resume: () => set({ isPlaying: true }),

  next: () => {
    const { queue, currentTrack, repeatMode, isShuffled } = get();
    if (!queue.length || !currentTrack) return;
    const idx = queue.findIndex((t) => t.id === currentTrack.id);
    let nextIdx: number;
    if (isShuffled) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else if (idx === queue.length - 1) {
      if (repeatMode === 'all') nextIdx = 0;
      else return; // end of queue
    } else {
      nextIdx = idx + 1;
    }
    set({ currentTrack: queue[nextIdx], isPlaying: true, progress: 0 });
  },

  prev: () => {
    const { queue, currentTrack, progress } = get();
    // If more than 3s in, restart current track
    if (progress > 0.05) {
      set({ progress: 0 });
      return;
    }
    if (!queue.length || !currentTrack) return;
    const idx = queue.findIndex((t) => t.id === currentTrack.id);
    if (idx > 0) {
      set({ currentTrack: queue[idx - 1], isPlaying: true, progress: 0 });
    }
  },

  seek: (progress) => set({ progress }),

  setVolume: (volume) => set({ volume, isMuted: volume === 0 }),

  toggleMute: () =>
    set((s) => ({ isMuted: !s.isMuted })),

  toggleShuffle: () =>
    set((s) => ({ isShuffled: !s.isShuffled })),

  cycleRepeat: () =>
    set((s) => {
      const next: Record<RepeatMode, RepeatMode> = { none: 'all', all: 'one', one: 'none' };
      return { repeatMode: next[s.repeatMode] };
    }),

  addToQueue: (track) =>
    set((s) => ({ queue: [...s.queue, track] })),

  clearQueue: () => set({ queue: [], currentTrack: null, isPlaying: false }),
}));
