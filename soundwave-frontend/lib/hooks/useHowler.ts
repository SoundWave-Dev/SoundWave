// ============================================================
// SOUNDWAVE — useHowler hook
// Bridges the player store (state) with Howler.js (actual audio).
//
// - Creates a new Howl instance whenever currentTrack changes.
// - Starts/pauses playback to match isPlaying.
// - Polls Howler every 250ms to update `progress` in the store.
// - On track end, advances according to repeatMode.
// - Keeps Howler volume/mute in sync with the store.
// ============================================================

import { useCallback, useEffect, useRef } from 'react';
import { Howl } from 'howler';
import { usePlayerStore } from '@/lib/store/playerStore';

const PROGRESS_INTERVAL_MS = 250;

export function useHowler() {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const volume = usePlayerStore((s) => s.volume);
  const isMuted = usePlayerStore((s) => s.isMuted);

  const howlRef = useRef<Howl | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearProgressInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Create a fresh Howl instance whenever the track changes.
  useEffect(() => {
    clearProgressInterval();
    howlRef.current?.unload();
    howlRef.current = null;

    if (!currentTrack) return;

    const { volume: startVolume, isMuted: startMuted, isPlaying: shouldAutoplay } =
      usePlayerStore.getState();

    const howl = new Howl({
      src: [currentTrack.audioUrl],
      html5: true,
      volume: startMuted ? 0 : startVolume,
      onplay: () => {
        clearProgressInterval();
        intervalRef.current = setInterval(() => {
          const duration = howl.duration();
          if (duration > 0) {
            usePlayerStore.getState().seek((howl.seek() as number) / duration);
          }
        }, PROGRESS_INTERVAL_MS);
      },
      onpause: clearProgressInterval,
      onend: () => {
        clearProgressInterval();
        const { repeatMode, currentTrack: track, queue, pause, next } = usePlayerStore.getState();

        if (repeatMode === 'one') {
          howl.seek(0);
          howl.play();
          return;
        }

        const idx = queue.findIndex((t) => t.id === track?.id);
        const isLastInQueue = idx === -1 || idx === queue.length - 1;

        if (isLastInQueue && repeatMode !== 'all') {
          usePlayerStore.setState({ progress: 0 });
          pause();
          return;
        }

        next();
      },
      onloaderror: () => {
        clearProgressInterval();
        usePlayerStore.getState().pause();
      },
    });

    howlRef.current = howl;

    if (shouldAutoplay) howl.play();

    return () => {
      clearProgressInterval();
      howl.unload();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack?.id]);

  // Keep play/pause in sync with the store.
  useEffect(() => {
    const howl = howlRef.current;
    if (!howl) return;
    if (isPlaying && !howl.playing()) howl.play();
    if (!isPlaying && howl.playing()) howl.pause();
  }, [isPlaying]);

  // Keep volume/mute in sync with the store.
  useEffect(() => {
    howlRef.current?.volume(isMuted ? 0 : volume);
  }, [volume, isMuted]);

  const seekTo = useCallback((fraction: number) => {
    const clamped = Math.min(1, Math.max(0, fraction));
    usePlayerStore.getState().seek(clamped);
    const howl = howlRef.current;
    if (howl) {
      const duration = howl.duration();
      if (duration > 0) howl.seek(clamped * duration);
    }
  }, []);

  return { seekTo };
}
