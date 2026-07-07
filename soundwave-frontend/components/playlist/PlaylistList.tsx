'use client';

import type { Playlist } from '@/types';
import { Button } from '@/components/ui';
import { PlaylistCard } from './PlaylistCard';

interface PlaylistListProps {
  playlists: Playlist[];
  limit: number | null;
  onCreateClick: () => void;
  onRename: (id: string, name: string) => void;
  onDeleteRequest: (playlist: Playlist) => void;
}

export function PlaylistList({ playlists, limit, onCreateClick, onRename, onDeleteRequest }: PlaylistListProps) {
  const limitReached = limit !== null && playlists.length >= limit;

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 'var(--space-6)',
        flexWrap: 'wrap',
        gap: 'var(--space-3)',
      }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            پلی‌لیست‌های من
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
            {playlists.length}{limit !== null ? ` از ${limit}` : ''} پلی‌لیست
          </p>
        </div>

        <div title={limitReached ? 'به سقف مجاز پلی‌لیست‌های اشتراک فعلی رسیده‌اید. برای ساخت پلی‌لیست بیشتر، اشتراک خود را ارتقا دهید.' : undefined}>
          <Button variant="primary" onClick={onCreateClick} disabled={limitReached}>
            + پلی‌لیست جدید
          </Button>
        </div>
      </div>

      {playlists.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: 'var(--space-10)',
          color: 'var(--color-text-muted)',
          background: 'var(--color-surface-1)',
          borderRadius: 'var(--radius-xl)',
          border: '1px dashed var(--color-border)',
        }}>
          <div style={{ fontSize: 40, marginBottom: 'var(--space-3)' }}>🎧</div>
          هنوز پلی‌لیستی نساخته‌اید. اولین پلی‌لیست خود را بسازید!
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 'var(--space-4)',
        }}>
          {playlists.map((playlist) => (
            <PlaylistCard
              key={playlist.id}
              playlist={playlist}
              onRename={onRename}
              onDelete={onDeleteRequest}
            />
          ))}
        </div>
      )}
    </div>
  );
}
