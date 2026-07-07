'use client';

import { useState } from 'react';
import type { Playlist, Track } from '@/types';

interface AddToPlaylistMenuProps {
  track: Track;
  playlists: Playlist[];
  limitReached: boolean;
  onAdd: (playlistId: string, track: Track) => void;
  onCreateNew: () => void;
}

export function AddToPlaylistMenu({ track, playlists, limitReached, onAdd, onCreateNew }: AddToPlaylistMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        aria-label="افزودن به پلی‌لیست"
        onClick={(e) => { e.stopPropagation(); setIsOpen((v) => !v); }}
        style={{
          width: 32,
          height: 32,
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--color-border)',
          background: 'transparent',
          color: 'var(--color-text-secondary)',
          cursor: 'pointer',
          fontSize: 'var(--text-base)',
        }}
      >
        +
      </button>

      {isOpen && (
        <>
          <div
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
            style={{ position: 'fixed', inset: 0, zIndex: 70 }}
          />
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              insetInlineEnd: 0,
              top: '110%',
              minWidth: 220,
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 71,
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}>
              افزودن «{track.title}» به:
            </div>

            {playlists.length === 0 && (
              <div style={{ padding: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                هنوز پلی‌لیستی ندارید.
              </div>
            )}

            {playlists.map((playlist) => {
              const alreadyIn = playlist.tracks.some((t) => t.id === track.id);
              return (
                <button
                  key={playlist.id}
                  type="button"
                  disabled={alreadyIn}
                  onClick={() => { onAdd(playlist.id, track); setIsOpen(false); }}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'right',
                    padding: 'var(--space-3) var(--space-4)',
                    background: 'transparent',
                    border: 'none',
                    color: alreadyIn ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                    fontSize: 'var(--text-sm)',
                    cursor: alreadyIn ? 'not-allowed' : 'pointer',
                  }}
                >
                  {playlist.name} {alreadyIn && '✓'}
                </button>
              );
            })}

            <button
              type="button"
              disabled={limitReached}
              title={limitReached ? 'به سقف مجاز پلی‌لیست‌های اشتراک فعلی رسیده‌اید.' : undefined}
              onClick={() => { onCreateNew(); setIsOpen(false); }}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'right',
                padding: 'var(--space-3) var(--space-4)',
                background: 'transparent',
                border: 'none',
                borderTop: '1px solid var(--color-border)',
                color: limitReached ? 'var(--color-text-muted)' : 'var(--color-primary)',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                cursor: limitReached ? 'not-allowed' : 'pointer',
              }}
            >
              + پلی‌لیست جدید {limitReached && '🔒'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
