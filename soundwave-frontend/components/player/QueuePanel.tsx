// ============================================================
// SOUNDWAVE — PLAYER: Queue Panel
// Slide-in panel listing upcoming tracks in the queue.
// ============================================================

import type { Track } from '@/types';
import { formatDuration } from '@/lib/utils';

interface QueuePanelProps {
  isOpen: boolean;
  onClose: () => void;
  queue: Track[];
  currentTrackId: string | null;
  onPlayTrack: (track: Track) => void;
}

export function QueuePanel({ isOpen, onClose, queue, currentTrackId, onPlayTrack }: QueuePanelProps) {
  return (
    <div
      role="dialog"
      aria-label="صف پخش"
      aria-hidden={!isOpen}
      style={{
        position: 'fixed',
        top: 0,
        bottom: 'var(--player-height)',
        left: 0,
        width: 340,
        maxWidth: '90vw',
        background: 'var(--color-surface-1)',
        borderRight: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        flexDirection: 'column',
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform var(--transition-normal)',
        zIndex: 60,
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--space-4) var(--space-5)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <span style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>
          صف پخش
        </span>
        <button
          type="button"
          aria-label="بستن صف پخش"
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', fontSize: 'var(--text-lg)', cursor: 'pointer' }}
        >
          ✕
        </button>
      </div>

      <div style={{ overflowY: 'auto', flex: 1, padding: 'var(--space-2) 0' }}>
        {queue.length === 0 && (
          <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
            صف پخش خالی است.
          </div>
        )}

        {queue.map((track) => {
          const isCurrent = track.id === currentTrackId;
          return (
            <button
              key={track.id}
              type="button"
              onClick={() => onPlayTrack(track)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 'var(--space-3)',
                padding: 'var(--space-3) var(--space-5)',
                background: 'transparent',
                border: 'none',
                borderInlineStart: isCurrent ? '3px solid var(--color-primary)' : '3px solid transparent',
                cursor: 'pointer',
                textAlign: 'right',
              }}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600,
                  color: isCurrent ? 'var(--color-primary)' : 'var(--color-text-primary)',
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
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', flexShrink: 0 }}>
                {formatDuration(track.duration)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
