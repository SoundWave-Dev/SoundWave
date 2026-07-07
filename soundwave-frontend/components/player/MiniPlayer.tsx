// ============================================================
// SOUNDWAVE — PLAYER: Mini Player (mobile collapsed bar)
// Tapping the bar expands to the fullscreen player.
// ============================================================

import type { Track } from '@/types';

interface MiniPlayerProps {
  track: Track;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onExpand: () => void;
}

export function MiniPlayer({ track, isPlaying, onTogglePlay, onExpand }: MiniPlayerProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="باز کردن پخش‌کننده تمام‌صفحه"
      onClick={onExpand}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onExpand(); }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        height: '100%',
        padding: '0 var(--space-4)',
        cursor: 'pointer',
      }}
    >
      {track.coverUrl ? (
        <img
          src={track.coverUrl}
          alt=""
          style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', objectFit: 'cover', flexShrink: 0 }}
        />
      ) : (
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 'var(--radius-sm)',
          background: 'linear-gradient(135deg, var(--color-primary), #0d5c2a)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          flexShrink: 0,
          color: '#000',
          fontWeight: 700,
        }}>
          🎵
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 'var(--text-sm)',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {track.title}
        </div>
        <div style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-secondary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {track.artists.map((a) => a.stageName).join(', ')}
        </div>
      </div>

      <button
        type="button"
        aria-label={isPlaying ? 'توقف' : 'پخش'}
        onClick={(e) => { e.stopPropagation(); onTogglePlay(); }}
        style={{
          width: 36,
          height: 36,
          borderRadius: 'var(--radius-full)',
          background: 'var(--color-primary)',
          color: '#000',
          border: 'none',
          fontSize: 'var(--text-base)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          cursor: 'pointer',
        }}
      >
        {isPlaying ? '⏸' : '▶'}
      </button>
    </div>
  );
}
