'use client';

import { useMemo, useState } from 'react';
import { mockGetTracks } from '@/lib/mock/store';

export default function LibraryPage() {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('listeners');

  const tracks = useMemo(() => {
    let list = [...mockGetTracks()];

    list = list.filter(
      (t) =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.artists.some((a) =>
          a.stageName.toLowerCase().includes(search.toLowerCase())
        )
    );

    if (sort === 'listeners') {
      list.sort((a, b) => b.uniqueListeners - a.uniqueListeners);
    } else {
      list.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );
    }

    return list;
  }, [search, sort]);

  return (
    <div>
      <h1>Music Library</h1>

      <div
        style={{
          display: 'flex',
          gap: 16,
          margin: '20px 0',
        }}
      >
        <input
          placeholder="Search track or artist..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 8,
            background: '#222',
            color: 'white',
          }}
        />

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          style={{
            padding: 10,
            borderRadius: 8,
            background: '#222',
            color: 'white',
          }}
        >
          <option value="listeners">Most listeners</option>
          <option value="date">Release date</option>
        </select>
      </div>

      {tracks.map((track) => (
        <div
          key={track.id}
          style={{
            background: '#222',
            borderRadius: 10,
            padding: 18,
            marginBottom: 12,
          }}
        >
          <h3>{track.title}</h3>

          <p>
            Artist: {track.artists.map((a) => a.stageName).join(', ')}
          </p>

          <p>
            Album: {track.albumTitle ?? 'Single'}
          </p>

          <p>
            Listeners: {track.uniqueListeners.toLocaleString()}
          </p>

          <button
            style={{
              marginTop: 10,
              padding: '8px 16px',
              background: '#1DB954',
              color: 'white',
              borderRadius: 8,
            }}
          >
            ▶ Play
          </button>
        </div>
      ))}
    </div>
  );
}
