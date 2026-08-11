'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getAlbums } from '@/lib/api/music';
import { getArtistById } from '@/lib/api/artists';
import { useAuthStore } from '@/lib/store/authStore';
import { ArtistProfile } from '@/components/profile/ArtistProfile';
import { useTranslation } from '@/lib/i18n';
import type { Album, Artist, Track } from '@/types';

export default function ArtistPage() {
  const { t } = useTranslation('artistPage');
  const params = useParams<{ id: string }>();
  const viewer = useAuthStore((s) => s.user);

  const [artist, setArtist] = useState<Artist | null | undefined>(undefined);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [singles, setSingles] = useState<Track[]>([]);

  useEffect(() => {
    getArtistById(params.id).then(setArtist);
    getAlbums({ artistProfileId: params.id }).then((allReleases) => {
      // A "single" on the backend is an Album with releaseType='single' holding
      // exactly one track — split releases into the two sections the UI expects.
      setAlbums(allReleases.filter((a) => a.releaseType === 'album'));
      setSingles(allReleases.filter((a) => a.releaseType === 'single').flatMap((a) => a.tracks));
    });
  }, [params.id]);

  if (artist === undefined) {
    return null;
  }

  if (!artist) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 'var(--space-10)' }}>
        {t('notFound')}
      </div>
    );
  }

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
