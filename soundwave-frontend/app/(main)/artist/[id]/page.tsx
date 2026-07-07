'use client';

import { useParams } from 'next/navigation';
import { mockGetArtistById, mockGetAlbums, mockGetTracks } from '@/lib/mock/store';
import { useAuthStore } from '@/lib/store/authStore';
import { MOCK_USERS } from '@/lib/mock/data'; // TEMP (testing only): see fallback below
import { ArtistProfile } from '@/components/profile/ArtistProfile';

export default function ArtistPage() {
  const params = useParams<{ id: string }>();
  const authViewer = useAuthStore((s) => s.user);
  // TEMP (testing only): fall back to a mock gold user so follow/stats are
  // testable without logging in. Remove this fallback (go back to
  // `const viewer = authViewer`) before shipping/committing.
  const viewer = authViewer ?? MOCK_USERS[1];

  const artist = mockGetArtistById(params.id);

  if (!artist) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 'var(--space-10)' }}>
        هنرمندی با این شناسه یافت نشد.
      </div>
    );
  }

  const albums = mockGetAlbums().filter((a) => a.artists.some((x) => x.id === artist.id));
  const singles = mockGetTracks().filter(
    (t) => t.albumId === null && t.artists.some((x) => x.id === artist.id)
  );

  return (
    <ArtistProfile
      artist={artist}
      albums={albums}
      singles={singles}
      viewerId={viewer?.id ?? null}
      viewerSubscription={viewer?.subscription ?? null}
    />
  );
}
