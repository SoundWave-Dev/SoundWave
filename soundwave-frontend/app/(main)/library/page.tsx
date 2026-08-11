'use client';

import { useEffect, useState } from 'react';
import { getAlbums, getTracks } from '@/lib/api/music';
import { getPlaylists, createPlaylist as apiCreatePlaylist, addTrackToPlaylist } from '@/lib/api/playlists';
import { useAuthStore } from '@/lib/store/authStore';
import { getPlaylistLimit } from '@/lib/utils';
import { SearchBar } from '@/components/library/SearchBar';
import { SortDropdown, type SortOption } from '@/components/library/SortDropdown';
import AlbumCard from '@/components/library/AlbumCard';
import { TrackCard } from '@/components/library/TrackCard';
import { CreatePlaylistModal } from '@/components/playlist/CreatePlaylistModal';
import type { Album, Playlist, Track } from '@/types';
import { useTranslation } from '@/lib/i18n';

const SORT_TO_API: Record<SortOption, 'listeners' | 'releaseDate'> = {
  listeners: 'listeners',
  date: 'releaseDate',
};

export default function LibraryPage() {
  const { t } = useTranslation('libraryPage');
  const user = useAuthStore((s) => s.user);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption>('listeners');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);

  useEffect(() => {
    if (!user) return;
    getPlaylists(user.id).then(setPlaylists);
  }, [user]);

  // Debounced so every keystroke doesn't fire its own request.
  useEffect(() => {
    const query = search.trim();
    const handle = setTimeout(() => {
      getTracks({ query: query || undefined, sortBy: SORT_TO_API[sort], sortOrder: 'desc' }).then(setTracks);
      getAlbums({ search: query || undefined }).then(setAlbums);
    }, 250);
    return () => clearTimeout(handle);
  }, [search, sort]);

  if (!user) return <h2>{t('loginFirst')}</h2>;

  const limit = getPlaylistLimit(user.subscription);
  const limitReached = limit !== null && playlists.length >= limit;

  const handleAddToPlaylist = async (playlistId: string, track: Track) => {
    const updated = await addTrackToPlaylist(playlistId, track.id, user.id);
    setPlaylists((prev) => prev.map((p) => (p.id === playlistId ? updated : p)));
  };

  const handleCreatePlaylist = async (name: string) => {
    const p = await apiCreatePlaylist(name, user.id);
    setPlaylists((prev) => [...prev, p]);
  };

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 'var(--space-6)' }}>
        {t('title')}
      </h1>

      <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-8)', flexWrap: 'wrap' }}>
        <SearchBar value={search} onChange={setSearch} />
        <SortDropdown value={sort} onChange={setSort} />
      </div>

      {albums.length > 0 && (
        <section style={{ marginBottom: 'var(--space-10)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}>
            {t('albumsHeading')}
          </h2>
          <div style={{ display: 'flex', gap: 'var(--space-4)', overflowX: 'auto', paddingBottom: 'var(--space-2)' }}>
            {albums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}>
          {t('tracksHeading')}
        </h2>

        {tracks.length === 0 && albums.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 'var(--space-10)' }}>
            {t('noResultsPrefix')}{search}{t('noResultsSuffix')}
          </div>
        ) : (
          tracks.map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              queue={tracks}
              playlists={playlists}
              limitReached={limitReached}
              onAddToPlaylist={handleAddToPlaylist}
              onCreatePlaylist={() => setIsCreateOpen(true)}
            />
          ))
        )}
      </section>

      <CreatePlaylistModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreatePlaylist}
      />
    </div>
  );
}
