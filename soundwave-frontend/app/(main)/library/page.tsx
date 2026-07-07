'use client';

import { useMemo, useState } from 'react';
import { mockGetTracks, mockGetAlbums, mockGetPlaylists, mockAddTrackToPlaylist, mockCreatePlaylist } from '@/lib/mock/store';
import { useAuthStore } from '@/lib/store/authStore';
import { MOCK_USERS } from '@/lib/mock/data'; // TEMP (testing only): see fallback below
import { getPlaylistLimit } from '@/lib/utils';
import { SearchBar } from '@/components/library/SearchBar';
import { SortDropdown, type SortOption } from '@/components/library/SortDropdown';
import AlbumCard from '@/components/library/AlbumCard';
import { TrackCard } from '@/components/library/TrackCard';
import { CreatePlaylistModal } from '@/components/playlist/CreatePlaylistModal';
import type { Playlist, Track } from '@/types';

export default function LibraryPage() {
  const authUser = useAuthStore((s) => s.user);
  // TEMP (testing only): fall back to a mock user so the page is viewable
  // without logging in. Remove this fallback (go back to
  // `const user = authUser` + the early return) before shipping/committing.
  const user = authUser ?? MOCK_USERS[1];
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption>('listeners');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>(() => (user ? mockGetPlaylists(user.id) : []));

  const query = search.trim().toLowerCase();

  const matchesQuery = (title: string, artistNames: string[]) =>
    !query || title.toLowerCase().includes(query) || artistNames.some((n) => n.toLowerCase().includes(query));

  const tracks = useMemo(() => {
    const list = mockGetTracks().filter((t) =>
      matchesQuery(t.title, t.artists.map((a) => a.stageName))
    );
    return [...list].sort((a, b) =>
      sort === 'listeners'
        ? b.uniqueListeners - a.uniqueListeners
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sort]);

  const albums = useMemo(() => {
    return mockGetAlbums().filter((a) =>
      matchesQuery(a.title, a.artists.map((x) => x.stageName))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  if (!user) return <h2>ابتدا وارد شوید.</h2>;

  const limit = getPlaylistLimit(user.subscription);
  const limitReached = limit !== null && playlists.length >= limit;

  const handleAddToPlaylist = (playlistId: string, track: Track) => {
    const updated = mockAddTrackToPlaylist(playlistId, track);
    if (updated) setPlaylists((prev) => prev.map((p) => (p.id === playlistId ? updated : p)));
  };

  const handleCreatePlaylist = (name: string) => {
    const p = mockCreatePlaylist(user.id, name);
    setPlaylists((prev) => [...prev, p]);
  };

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 'var(--space-6)' }}>
        کتابخانه
      </h1>

      <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-8)', flexWrap: 'wrap' }}>
        <SearchBar value={search} onChange={setSearch} />
        <SortDropdown value={sort} onChange={setSort} />
      </div>

      {albums.length > 0 && (
        <section style={{ marginBottom: 'var(--space-10)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}>
            آلبوم‌ها
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
          آهنگ‌ها
        </h2>

        {tracks.length === 0 && albums.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 'var(--space-10)' }}>
            نتیجه‌ای برای «{search}» یافت نشد.
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
