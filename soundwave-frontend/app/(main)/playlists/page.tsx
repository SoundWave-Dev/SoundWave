'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import {
  mockGetPlaylists,
  mockCreatePlaylist,
  mockDeletePlaylist,
} from '@/lib/mock/store';
import {
  getPlaylistLimit,
  hasReachedPlaylistLimit,
} from '@/lib/utils';

export default function PlaylistsPage() {
  const user = useAuthStore((s) => s.user);

  if (!user) return <h2>ابتدا وارد شوید.</h2>;

  const [playlists, setPlaylists] = useState(mockGetPlaylists(user.id));
  const [name, setName] = useState('');

  const limit = getPlaylistLimit(user.subscription);
  const reached = hasReachedPlaylistLimit(user, playlists.length);

  function createPlaylist() {
    if (!name.trim()) return;

    const p = mockCreatePlaylist(user.id, name);

    setPlaylists([...playlists, p]);
    setName('');
  }

  function remove(id: string) {
    mockDeletePlaylist(id);
    setPlaylists(playlists.filter((p) => p.id !== id));
  }

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <h1>Playlists</h1>

      <div>
        تعداد پلی‌لیست:
        {' '}
        {playlists.length}
        {' / '}
        {limit ?? '∞'}
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Playlist name"
          style={{
            padding: 10,
            borderRadius: 8,
            background: '#222',
            color: 'white',
          }}
        />

        <button
          disabled={reached}
          title={reached ? 'Playlist limit reached' : ''}
          onClick={createPlaylist}
          style={{
            padding: '10px 18px',
            background: reached ? '#555' : '#1DB954',
            borderRadius: 8,
            color: 'white',
          }}
        >
          Create Playlist
        </button>
      </div>

      {playlists.length === 0 ? (
        <div>هیچ پلی‌لیستی وجود ندارد.</div>
      ) : (
        playlists.map((p) => (
          <div
            key={p.id}
            style={{
              background: '#222',
              padding: 18,
              borderRadius: 10,
            }}
          >
            <h3>{p.name}</h3>

            <p>{p.tracks.length} Tracks</p>

            <button
              onClick={() => remove(p.id)}
              style={{
                marginTop: 10,
                background: '#c62828',
                color: 'white',
                padding: '8px 14px',
                borderRadius: 8,
              }}
            >
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
}
