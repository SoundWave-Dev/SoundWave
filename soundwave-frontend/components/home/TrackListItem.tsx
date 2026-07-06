'use client';

import type { Track } from '@/types';
import { formatDuration, formatCount } from '@/lib/utils';

interface TrackListItemProps {
  track: Track;
}

export default function TrackListItem({ track }: TrackListItemProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '12px 16px',
        background: 'var(--color-surface-1)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        marginBottom: '12px',
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '10px',
          background: track.coverUrl
            ? `url(${track.coverUrl}) center/cover`
            : 'var(--color-surface-3)',
          flexShrink: 0,
        }}
      />

      <div
        style={{
          flex: 1,
        }}
      >
        <div
          style={{
            fontWeight: 600,
            marginBottom: '4px',
          }}
        >
          {track.title}
        </div>

        <div
          style={{
            fontSize: '14px',
            color: 'var(--color-text-secondary)',
          }}
        >
          {track.artists.map((a) => a.stageName).join(', ')}
        </div>
      </div>

      <div
        style={{
          textAlign: 'right',
          minWidth: '90px',
        }}
      >
        <div
          style={{
            fontSize: '13px',
            color: 'var(--color-text-secondary)',
          }}
        >
          {formatCount(track.streamCount)}
        </div>

        <div
          style={{
            fontSize: '13px',
            color: 'var(--color-text-muted)',
          }}
        >
          {formatDuration(track.duration)}
        </div>
      </div>
    </div>
  );
}
