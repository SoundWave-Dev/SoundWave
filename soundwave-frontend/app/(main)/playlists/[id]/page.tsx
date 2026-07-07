'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { mockGetPlaylistById, mockRemoveTrackFromPlaylist } from '@/lib/mock/store';
import { usePlayerStore } from '@/lib/store/playerStore';
import { ROUTES } from '@/lib/constants';
import { Button } from '@/components/ui';
import TrackListItem from '@/components/home/TrackListItem';
import type { Playlist } from '@/types';

export default function PlaylistDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const play = usePlayerStore((s) => s.play);
  const [playlist, setPlaylist] = useState<Playlist | null>(() => mockGetPlaylistById(params.id));

  if (!playlist) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 'var(--space-10)' }}>
        پلی‌لیستی با این شناسه یافت نشد.
      </div>
    );
  }

  const handleRemoveTrack = (trackId: string) => {
    mockRemoveTrackFromPlaylist(playlist.id, trackId);
    setPlaylist((prev) => (prev ? { ...prev, tracks: prev.tracks.filter((t) => t.id !== trackId) } : prev));
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => router.push(ROUTES.PLAYLISTS)}
        style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', cursor: 'pointer', marginBottom: 'var(--space-4)' }}
      >
        ← بازگشت به پلی‌لیست‌ها
      </button>

      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 'var(--space-6)',
        flexWrap: 'wrap',
        marginBottom: 'var(--space-8)',
      }}>
        <div style={{
          width: 180,
          height: 180,
          borderRadius: 'var(--radius-lg)',
          background: playlist.coverUrl
            ? `url(${playlist.coverUrl}) center/cover`
            : 'linear-gradient(135deg, var(--color-surface-3), var(--color-surface-2))',
          boxShadow: 'var(--shadow-lg)',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 48,
        }}>
          {!playlist.coverUrl && '🎵'}
        </div>

        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
            پلی‌لیست
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 'var(--space-3)' }}>
            {playlist.name}
          </h1>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
            {playlist.tracks.length} آهنگ
          </div>

          {playlist.tracks.length > 0 && (
            <Button variant="primary" onClick={() => play(playlist.tracks[0], playlist.tracks)}>
              ▶ پخش همه
            </Button>
          )}
        </div>
      </div>

      {playlist.tracks.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: 'var(--space-10)',
          color: 'var(--color-text-muted)',
          background: 'var(--color-surface-1)',
          borderRadius: 'var(--radius-xl)',
          border: '1px dashed var(--color-border)',
        }}>
          این پلی‌لیست هنوز آهنگی ندارد. از صفحه‌ی کتابخانه آهنگ اضافه کنید.
        </div>
      ) : (
        <section>
          {playlist.tracks.map((track) => (
            <div key={track.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <div style={{ flex: 1 }}>
                <TrackListItem track={track} queue={playlist.tracks} />
              </div>
              <button
                type="button"
                aria-label="حذف از پلی‌لیست"
                onClick={() => handleRemoveTrack(track.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  fontSize: 'var(--text-base)',
                  marginBottom: 'var(--space-3)',
                }}
              >
                🗑
              </button>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
