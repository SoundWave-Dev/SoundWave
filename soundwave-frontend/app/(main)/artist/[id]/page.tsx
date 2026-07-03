'use client';

import { mockGetArtists, mockGetAlbums } from '@/lib/mock/store';
import { useAuthStore } from '@/lib/store/authStore';
import { canViewStats } from '@/lib/utils';

export default function ArtistPage() {
  const artist = mockGetArtists()[0];
  const albums = mockGetAlbums().filter((a) =>
    a.artists.some((x) => x.id === artist.id)
  );

  const user = useAuthStore((s) => s.user);

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <h1>{artist.stageName}</h1>

      {artist.isVerified && <p>✅ Verified Artist</p>}

      <p>{artist.bio}</p>

      <button>Follow</button>

      <h2>Albums</h2>

      {albums.map((album) => (
        <div
          key={album.id}
          style={{
            background: '#181818',
            padding: 12,
            borderRadius: 10,
          }}
        >
          {album.title}
        </div>
      ))}

      {user && canViewStats(user.subscription) && (
        <div
          style={{
            background: '#181818',
            padding: 20,
            borderRadius: 12,
          }}
        >
          <h3>Stats</h3>

          <p>Total Streams: {artist.totalStreams}</p>
          <p>Unique Listeners: {artist.totalListeners}</p>
        </div>
      )}
    </div>
  );
}
