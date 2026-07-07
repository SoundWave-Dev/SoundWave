// ============================================================
// SOUNDWAVE — PLAYER: Fullscreen Player (mobile slide-up overlay)
// Large cover art + all desktop controls + close button.
// ============================================================

import { useRouter } from 'next/navigation';
import type { RepeatMode, Track } from '@/types';
import { ROUTES } from '@/lib/constants';
import { ProgressBar } from './ProgressBar';
import { VolumeControl } from './VolumeControl';
import { RepeatButton } from './RepeatButton';
import { ShuffleButton } from './ShuffleButton';

interface FullscreenPlayerProps {
  isOpen: boolean;
  track: Track;
  isPlaying: boolean;
  progress: number;
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  isShuffled: boolean;
  onClose: () => void;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (progress: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  onToggleRepeat: () => void;
  onToggleShuffle: () => void;
  onOpenQueue: () => void;
  onOpenLyrics: () => void;
}

export function FullscreenPlayer({
  isOpen,
  track,
  isPlaying,
  progress,
  volume,
  isMuted,
  repeatMode,
  isShuffled,
  onClose,
  onTogglePlay,
  onNext,
  onPrev,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleRepeat,
  onToggleShuffle,
  onOpenQueue,
  onOpenLyrics,
}: FullscreenPlayerProps) {
  const router = useRouter();

  return (
    <div
      role="dialog"
      aria-label="پخش‌کننده تمام‌صفحه"
      aria-hidden={!isOpen}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--color-bg)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        padding: 'var(--space-6)',
        transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform var(--transition-normal)',
        visibility: isOpen ? 'visible' : 'hidden',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="button"
          aria-label="بستن پخش‌کننده"
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', fontSize: 'var(--text-2xl)', cursor: 'pointer' }}
        >
          ⌄
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-6)' }}>
        {track.coverUrl ? (
          <img
            src={track.coverUrl}
            alt=""
            style={{ width: '80%', maxWidth: 320, aspectRatio: '1 / 1', borderRadius: 'var(--radius-xl)', objectFit: 'cover', boxShadow: 'var(--shadow-lg)' }}
          />
        ) : (
          <div style={{
            width: '80%',
            maxWidth: 320,
            aspectRatio: '1 / 1',
            borderRadius: 'var(--radius-xl)',
            background: 'linear-gradient(135deg, var(--color-primary), #0d5c2a)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--text-2xl)',
            fontWeight: 700,
            color: '#000',
            textAlign: 'center',
            padding: 'var(--space-4)',
          }}>
            {track.title}
          </div>
        )}

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {track.title}
          </div>
          <div style={{ marginTop: 'var(--space-2)', display: 'flex', gap: 'var(--space-2)', justifyContent: 'center' }}>
            {track.artists.map((artist, i) => (
              <button
                key={artist.id}
                type="button"
                onClick={() => router.push(ROUTES.ARTIST(artist.id))}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', fontSize: 'var(--text-base)', cursor: 'pointer', padding: 0 }}
              >
                {artist.stageName}{i < track.artists.length - 1 ? ',' : ''}
              </button>
            ))}
          </div>
          {track.albumId && track.albumTitle && (
            <button
              type="button"
              onClick={() => router.push(ROUTES.ALBUM(track.albumId as string))}
              style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', cursor: 'pointer', padding: 0, marginTop: 'var(--space-1)' }}
            >
              {track.albumTitle}
            </button>
          )}
        </div>

        <div style={{ width: '100%' }}>
          <ProgressBar progress={progress} duration={track.duration} onSeek={onSeek} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
          <ShuffleButton isShuffled={isShuffled} onClick={onToggleShuffle} />
          <button
            type="button"
            aria-label="آهنگ قبلی"
            onClick={onPrev}
            style={{ background: 'transparent', border: 'none', color: 'var(--color-text-primary)', fontSize: 'var(--text-2xl)', cursor: 'pointer' }}
          >
            ⏮
          </button>
          <button
            type="button"
            aria-label={isPlaying ? 'توقف' : 'پخش'}
            onClick={onTogglePlay}
            style={{
              width: 64,
              height: 64,
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-primary)',
              color: '#000',
              border: 'none',
              fontSize: 'var(--text-2xl)',
              cursor: 'pointer',
            }}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button
            type="button"
            aria-label="آهنگ بعدی"
            onClick={onNext}
            style={{ background: 'transparent', border: 'none', color: 'var(--color-text-primary)', fontSize: 'var(--text-2xl)', cursor: 'pointer' }}
          >
            ⏭
          </button>
          <RepeatButton repeatMode={repeatMode} onClick={onToggleRepeat} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <VolumeControl volume={volume} isMuted={isMuted} onVolumeChange={onVolumeChange} onToggleMute={onToggleMute} />
          <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
            <button
              type="button"
              aria-label="باز کردن صف پخش"
              onClick={onOpenQueue}
              style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', fontSize: 'var(--text-lg)', cursor: 'pointer' }}
            >
              📋
            </button>
            {track.lyrics !== null && (
              <button
                type="button"
                aria-label="باز کردن متن آهنگ"
                onClick={onOpenLyrics}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', fontSize: 'var(--text-lg)', cursor: 'pointer' }}
              >
                📝
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
