'use client';

import { useRouter } from 'next/navigation';
import type { Album } from '@/types';
import { ROUTES } from '@/lib/constants';
import { usePlayerStore } from '@/lib/store/playerStore';

interface AlbumCardProps {
  album: Album;
}

export default function AlbumCard({ album }: AlbumCardProps) {
  const router = useRouter();
  const play = usePlayerStore((s) => s.play);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(ROUTES.ALBUM(album.id))}
      onKeyDown={(e) => { if (e.key === 'Enter') router.push(ROUTES.ALBUM(album.id)); }}
      className="sw-album-card"
      style={{
        minWidth: 180,
        maxWidth: 180,
        background: 'var(--color-surface-1)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4)',
        transition: 'transform var(--transition-fast), border-color var(--transition-fast)',
        cursor: 'pointer',
      }}
    >
      <div style={{ position: 'relative', marginBottom: 'var(--space-3)' }}>
        <div
          style={{
            width: '100%',
            aspectRatio: '1',
            borderRadius: 'var(--radius-md)',
            background: album.coverUrl
              ? `url(${album.coverUrl}) center/cover`
              : 'linear-gradient(135deg, var(--color-primary), #0d5c2a)',
            boxShadow: 'var(--shadow-md)',
          }}
        />
        {album.tracks.length > 0 && (
          <button
            type="button"
            aria-label="پخش آلبوم"
            onClick={(e) => { e.stopPropagation(); play(album.tracks[0], album.tracks); }}
            className="sw-album-card__play"
            style={{
              position: 'absolute',
              bottom: 8,
              insetInlineEnd: 8,
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-primary)',
              color: '#000',
              border: 'none',
              fontSize: 16,
              cursor: 'pointer',
              boxShadow: 'var(--shadow-md)',
              opacity: 0,
              transform: 'translateY(4px)',
              transition: 'opacity var(--transition-fast), transform var(--transition-fast)',
            }}
          >
            ▶
          </button>
        )}
      </div>

      <h3 style={{
        fontSize: 'var(--text-base)',
        fontWeight: 700,
        marginBottom: 4,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        color: 'var(--color-text-primary)',
      }}>
        {album.title}
      </h3>

      <p
        onClick={(e) => { e.stopPropagation(); router.push(ROUTES.ARTIST(album.artists[0].id)); }}
        style={{
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--text-sm)',
          marginBottom: 4,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {album.artists.map((a) => a.stageName).join(', ')}
      </p>

      <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>
        {album.releaseYear ?? '-'}
      </span>

      <style>{`
        .sw-album-card:hover { border-color: var(--color-primary); transform: translateY(-2px); }
        .sw-album-card:hover .sw-album-card__play { opacity: 1; transform: translateY(0); }
      `}</style>
    </div>
  );
}
