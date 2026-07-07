// ============================================================
// SOUNDWAVE — PLAYER STORE (Zustand)
// ============================================================

import { create } from 'zustand';
import type { Track, RepeatMode } from '@/types';
import { DEFAULT_VOLUME } from '@/lib/constants';

const RESTART_THRESHOLD_SECONDS = 3;
const MAX_HISTORY = 20;

interface PlayerStore {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  progress: number;        // 0–1
  volume: number;          // 0–1
  isMuted: boolean;
  repeatMode: RepeatMode;
  isShuffled: boolean;
  history: string[];       // recently played track ids, most recent first

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
  history: [],

  play: (track, queue = []) =>
    set((s) => ({
      currentTrack: track,
      queue,
      isPlaying: true,
      progress: 0,
      history: [track.id, ...s.history.filter((id) => id !== track.id)].slice(0, MAX_HISTORY),
    })),

  pause: () => set({ isPlaying: false }),

  resume: () => set({ isPlaying: true }),

  next: () => {
    const { queue, currentTrack, repeatMode, isShuffled, history } = get();
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
    const nextTrack = queue[nextIdx];
    set({
      currentTrack: nextTrack,
      isPlaying: true,
      progress: 0,
      history: [nextTrack.id, ...history.filter((id) => id !== nextTrack.id)].slice(0, MAX_HISTORY),
    });
  },

  prev: () => {
    const { queue, currentTrack, progress, history } = get();
    // If more than RESTART_THRESHOLD_SECONDS in, restart current track instead of going back
    const elapsedSeconds = progress * (currentTrack?.duration ?? 0);
    if (elapsedSeconds >= RESTART_THRESHOLD_SECONDS) {
      set({ progress: 0 });
      return;
    }
    if (!queue.length || !currentTrack) return;
    const idx = queue.findIndex((t) => t.id === currentTrack.id);
    if (idx > 0) {
      const prevTrack = queue[idx - 1];
      set({
        currentTrack: prevTrack,
        isPlaying: true,
        progress: 0,
        history: [prevTrack.id, ...history.filter((id) => id !== prevTrack.id)].slice(0, MAX_HISTORY),
      });
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
