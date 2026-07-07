'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import {
  mockGetAlbums,
  mockGetPlaylists,
  mockGetTracks,
} from '@/lib/mock/store';
import { canAccessEarlyContent } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import { SongSuggestions } from '@/components/suggestions/SongSuggestions';
import { MOCK_USERS } from '@/lib/mock/data'; // TEMP (testing only): see fallback below
import GreetingHeader from '@/components/home/GreetingHeader';
import SectionRow from '@/components/home/SectionRow';
import AlbumCard from '@/components/home/AlbumCard';
import TrackListItem from '@/components/home/TrackListItem';
import type { Playlist } from '@/types';

function PlaylistMiniCard({ playlist }: { playlist: Playlist }) {
  const router = useRouter();
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(`${ROUTES.PLAYLISTS}/${playlist.id}`)}
      onKeyDown={(e) => { if (e.key === 'Enter') router.push(`${ROUTES.PLAYLISTS}/${playlist.id}`); }}
      className="sw-playlist-mini-card"
      style={{
        minWidth: 180,
        maxWidth: 180,
        background: 'var(--color-surface-1)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4)',
        cursor: 'pointer',
        transition: 'transform var(--transition-fast), border-color var(--transition-fast)',
      }}
    >
      <div style={{
        width: '100%',
        aspectRatio: '1',
        borderRadius: 'var(--radius-md)',
        background: playlist.coverUrl
          ? `url(${playlist.coverUrl}) center/cover`
          : 'linear-gradient(135deg, var(--color-surface-3), var(--color-surface-2))',
        marginBottom: 'var(--space-3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 32,
        boxShadow: 'var(--shadow-md)',
      }}>
        {!playlist.coverUrl && '🎵'}
      </div>
      <h3 style={{
        fontSize: 'var(--text-base)',
        fontWeight: 700,
        marginBottom: 4,
        color: 'var(--color-text-primary)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {playlist.name}
      </h3>
      <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>
        {playlist.tracks.length} آهنگ
      </span>

      <style>{`.sw-playlist-mini-card:hover { border-color: var(--color-primary); transform: translateY(-2px); }`}</style>
    </div>
  );
}

export default function HomePage() {
  const authUser = useAuthStore((s) => s.user);
  // TEMP (testing only): fall back to a mock gold user so the page is
  // viewable without logging in. Remove this fallback (go back to
  // `const user = authUser` + the early return) before shipping/committing.
  const user = authUser ?? MOCK_USERS[1];

  if (!user) {
    return <h2>ابتدا وارد شوید.</h2>;
  }

  const playlists = mockGetPlaylists(user.id);
  const albums = mockGetAlbums();

  const tracks = [...mockGetTracks()].sort(
    (a, b) => b.streamCount - a.streamCount
  );
  const topTracks = tracks.slice(0, 6);

  const earlyTracks = tracks.filter((t) => t.isEarlyAccess);

  return (
    <div>
      <GreetingHeader />

      <SongSuggestions />

      {playlists.length > 0 && (
        <SectionRow title="پلی‌لیست‌های شما">
          {playlists.map((p) => (
            <PlaylistMiniCard key={p.id} playlist={p} />
          ))}
        </SectionRow>
      )}

      {albums.length > 0 && (
        <SectionRow title="آلبوم‌های تازه" subtitle="آخرین آلبوم‌های منتشرشده روی Soundwave">
          {albums.map((a) => (
            <AlbumCard key={a.id} album={a} />
          ))}
        </SectionRow>
      )}

      <section style={{ marginBottom: 'var(--space-10)' }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-2xl)',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--space-4)',
        }}>
          پرطرفدارترین آهنگ‌ها
        </h2>
        {topTracks.map((t) => (
          <TrackListItem key={t.id} track={t} queue={topTracks} />
        ))}
      </section>

      {canAccessEarlyContent(user.subscription) && earlyTracks.length > 0 && (
        <section style={{
          marginBottom: 'var(--space-10)',
          padding: 'var(--space-5)',
          borderRadius: 'var(--radius-xl)',
          background: 'var(--color-primary-glow)',
          border: '1px solid var(--color-primary)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-2xl)',
              fontWeight: 700,
              color: 'var(--color-primary)',
            }}>
              دسترسی زودهنگام
            </h2>
            <span style={{
              padding: '2px var(--space-2)',
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-gold)',
              color: '#000',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
            }}>
              GOLD
            </span>
          </div>
          {earlyTracks.map((t) => (
            <TrackListItem key={t.id} track={t} queue={earlyTracks} />
          ))}
        </section>
      )}

      {!canAccessEarlyContent(user.subscription) && (
        <Link
          href={ROUTES.SETTINGS}
          style={{
            display: 'block',
            padding: 'var(--space-5)',
            borderRadius: 'var(--radius-xl)',
            background: 'var(--color-surface-1)',
            border: '1px dashed var(--color-border)',
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--text-sm)',
            textAlign: 'center',
          }}
        >
          🔒 با ارتقا به اشتراک طلایی، به آهنگ‌های پیش از انتشار دسترسی پیدا کنید.
        </Link>
      )}
    </div>
  );
}
