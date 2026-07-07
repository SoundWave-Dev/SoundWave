'use client';

import { useRouter } from 'next/navigation';
import type { Playlist, Track } from '@/types';
import { formatDuration, formatCount } from '@/lib/utils';
import { usePlayerStore } from '@/lib/store/playerStore';
import { ROUTES } from '@/lib/constants';
import { AddToPlaylistMenu } from './AddToPlaylistMenu';

interface TrackCardProps {
  track: Track;
  queue: Track[];
  playlists: Playlist[];
  limitReached: boolean;
  onAddToPlaylist: (playlistId: string, track: Track) => void;
  onCreatePlaylist: () => void;
}

export function TrackCard({ track, queue, playlists, limitReached, onAddToPlaylist, onCreatePlaylist }: TrackCardProps) {
  const router = useRouter();
  const play = usePlayerStore((s) => s.play);
  const currentTrackId = usePlayerStore((s) => s.currentTrack?.id);
  const isCurrent = currentTrackId === track.id;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => play(track, queue)}
      onKeyDown={(e) => { if (e.key === 'Enter') play(track, queue); }}
      className="sw-track-card"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-4)',
        padding: 'var(--space-3) var(--space-4)',
        background: isCurrent ? 'var(--color-primary-glow)' : 'var(--color-surface-1)',
        border: `1px solid ${isCurrent ? 'var(--color-primary)' : 'var(--color-border)'}`,
        borderRadius: 'var(--radius-md)',
        marginBottom: 'var(--space-3)',
        cursor: 'pointer',
      }}
    >
      <div style={{
        width: 56,
        height: 56,
        borderRadius: 'var(--radius-sm)',
        background: track.coverUrl ? `url(${track.coverUrl}) center/cover` : 'linear-gradient(135deg, var(--color-primary), #0d5c2a)',
        flexShrink: 0,
      }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: 600,
          marginBottom: 4,
          color: isCurrent ? 'var(--color-primary)' : 'var(--color-text-primary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {track.title}
        </div>
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {track.artists.map((a, i) => (
            <span
              key={a.id}
              onClick={(e) => { e.stopPropagation(); router.push(ROUTES.ARTIST(a.id)); }}
              style={{ cursor: 'pointer' }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
            >
              {a.stageName}{i < track.artists.length - 1 ? ',' : ''}
            </span>
          ))}
          {track.albumId && track.albumTitle && (
            <>
              <span>·</span>
              <span
                onClick={(e) => { e.stopPropagation(); router.push(ROUTES.ALBUM(track.albumId as string)); }}
                style={{ cursor: 'pointer' }}
                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
              >
                {track.albumTitle}
              </span>
            </>
          )}
        </div>
      </div>

      <div style={{ textAlign: 'right', minWidth: 90, flexShrink: 0 }}>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
          {formatCount(track.uniqueListeners)} شنونده
        </div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          {formatDuration(track.duration)}
        </div>
      </div>

      <div onClick={(e) => e.stopPropagation()}>
        <AddToPlaylistMenu
          track={track}
          playlists={playlists}
          limitReached={limitReached}
          onAdd={onAddToPlaylist}
          onCreateNew={onCreatePlaylist}
        />
      </div>

      <style>{`.sw-track-card:hover { border-color: var(--color-primary); }`}</style>
    </div>
  );
}
