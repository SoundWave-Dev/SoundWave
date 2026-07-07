'use client';

import { useParams, useRouter } from 'next/navigation';
import { mockGetAlbumById } from '@/lib/mock/store';
import { usePlayerStore } from '@/lib/store/playerStore';
import { ROUTES } from '@/lib/constants';
import { formatCount } from '@/lib/utils';
import { Button } from '@/components/ui';
import TrackListItem from '@/components/home/TrackListItem';

export default function AlbumPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const play = usePlayerStore((s) => s.play);

  const album = mockGetAlbumById(params.id);

  if (!album) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 'var(--space-10)' }}>
        آلبومی با این شناسه یافت نشد.
      </div>
    );
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 'var(--space-6)',
        flexWrap: 'wrap',
        marginBottom: 'var(--space-8)',
      }}>
        <div style={{
          width: 200,
          height: 200,
          borderRadius: 'var(--radius-lg)',
          background: album.coverUrl
            ? `url(${album.coverUrl}) center/cover`
            : 'linear-gradient(135deg, var(--color-primary), #0d5c2a)',
          boxShadow: 'var(--shadow-lg)',
          flexShrink: 0,
        }} />

        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
            آلبوم {album.isEarlyAccess && '· دسترسی زودهنگام'}
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 'var(--space-3)' }}>
            {album.title}
          </h1>
          <div style={{ display: 'flex', gap: 4, fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>
            {album.artists.map((a, i) => (
              <span
                key={a.id}
                onClick={() => router.push(ROUTES.ARTIST(a.id))}
                style={{ cursor: 'pointer', fontWeight: 600, color: 'var(--color-text-primary)' }}
              >
                {a.stageName}{i < album.artists.length - 1 ? ',' : ''}
              </span>
            ))}
            <span>· {album.releaseYear ?? '—'}</span>
            {album.genre && <span>· {album.genre}</span>}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
            {formatCount(album.streamCount)} استریم · {album.tracks.length} آهنگ
          </div>

          {album.tracks.length > 0 && (
            <Button variant="primary" onClick={() => play(album.tracks[0], album.tracks)}>
              ▶ پخش آلبوم
            </Button>
          )}
        </div>
      </div>

      <section>
        {album.tracks.map((track) => (
          <TrackListItem key={track.id} track={track} queue={album.tracks} />
        ))}
      </section>
    </div>
  );
}
