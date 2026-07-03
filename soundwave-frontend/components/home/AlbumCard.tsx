'use client';

import type { Album } from '@/types';

interface AlbumCardProps {
  album: Album;
}

export default function AlbumCard({ album }: AlbumCardProps) {
  return (
    <div
      style={{
        minWidth: '180px',
        background: 'var(--color-surface-1)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
        transition: 'var(--transition-fast)',
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          width: '100%',
          aspectRatio: '1',
          borderRadius: '12px',
          background: album.coverUrl
            ? `url(${album.coverUrl}) center/cover`
            : 'var(--color-surface-3)',
          marginBottom: '12px',
        }}
      />

      <h3
        style={{
          fontSize: '16px',
          fontWeight: 700,
          marginBottom: '6px',
        }}
      >
        {album.title}
      </h3>

      <p
        style={{
          color: 'var(--color-text-secondary)',
          fontSize: '14px',
          marginBottom: '6px',
        }}
      >
        {album.artists.map((a) => a.stageName).join(', ')}
      </p>

      <span
        style={{
          color: 'var(--color-text-muted)',
          fontSize: '12px',
        }}
      >
        {album.releaseYear ?? '-'}
      </span>
    </div>
  );
}
