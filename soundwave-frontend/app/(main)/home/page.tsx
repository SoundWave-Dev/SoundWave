'use client';

import { useAuthStore } from '@/lib/store/authStore';
import {
  mockGetAlbums,
  mockGetPlaylists,
  mockGetTracks,
} from '@/lib/mock/store';
import {
  getInitials,
  canAccessEarlyContent,
} from '@/lib/utils';
import { SongSuggestions } from '@/components/suggestions/SongSuggestions';

export default function HomePage() {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <h2>ابتدا وارد شوید.</h2>;
  }

  const playlists = mockGetPlaylists(user.id);
  const albums = mockGetAlbums();

  const tracks = [...mockGetTracks()].sort(
    (a, b) => b.streamCount - a.streamCount
  );

  const earlyTracks = tracks.filter((t) => t.isEarlyAccess);

  return (
    <div style={{ display: 'grid', gap: 32 }}>
      <section>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: '#1DB954',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
            }}
          >
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" />
            ) : (
              getInitials(user.displayName)
            )}
          </div>

          <div>
            <h2>سلام {user.displayName} 👋</h2>
            <p>{user.subscription.toUpperCase()} Plan</p>
          </div>
        </div>
      </section>

      <SongSuggestions />

      <section>
        <h2>Recently Played</h2>

        {playlists.map((p) => (
          <div
            key={p.id}
            style={{
              padding: 16,
              background: '#222',
              borderRadius: 10,
              marginTop: 10,
            }}
          >
            <strong>{p.name}</strong>

            <div>{p.tracks.length} Tracks</div>
          </div>
        ))}
      </section>

      <section>
        <h2>Latest Albums</h2>

        {albums.map((a) => (
          <div
            key={a.id}
            style={{
              padding: 16,
              background: '#222',
              borderRadius: 10,
              marginTop: 10,
            }}
          >
            <strong>{a.title}</strong>

            <div>{a.artists[0].stageName}</div>
          </div>
        ))}
      </section>

      <section>
        <h2>Top Tracks</h2>

        {tracks.map((t) => (
          <div
            key={t.id}
            style={{
              padding: 16,
              background: '#222',
              borderRadius: 10,
              marginTop: 10,
            }}
          >
            <strong>{t.title}</strong>

            <div>{t.streamCount.toLocaleString()} Streams</div>
          </div>
        ))}
      </section>

      {canAccessEarlyContent(user.subscription) && (
        <section>
          <h2>Early Access</h2>

          {earlyTracks.map((t) => (
            <div
              key={t.id}
              style={{
                padding: 16,
                background: '#14532d',
                borderRadius: 10,
                marginTop: 10,
              }}
            >
              {t.title}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
