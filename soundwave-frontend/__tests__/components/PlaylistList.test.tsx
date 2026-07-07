// ============================================================
// SOUNDWAVE — PLAYLIST LIST TESTS
// ============================================================

import { render, screen } from '@testing-library/react';
import { PlaylistList } from '@/components/playlist/PlaylistList';
import type { Playlist } from '@/types';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

const playlist: Playlist = {
  id: 'pl-test',
  name: 'Test Playlist',
  coverUrl: null,
  ownerId: 'u1',
  tracks: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('PlaylistList', () => {
  it('shows the empty state when there are no playlists', () => {
    render(
      <PlaylistList
        playlists={[]}
        limit={6}
        onCreateClick={jest.fn()}
        onRename={jest.fn()}
        onDeleteRequest={jest.fn()}
      />
    );

    expect(screen.getByText(/هنوز پلی‌لیستی نساخته‌اید/)).toBeInTheDocument();
  });

  it('disables the create button when the playlist limit is reached', () => {
    render(
      <PlaylistList
        playlists={[playlist]}
        limit={1}
        onCreateClick={jest.fn()}
        onRename={jest.fn()}
        onDeleteRequest={jest.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /پلی‌لیست جدید/ })).toBeDisabled();
  });

  it('enables the create button when under the playlist limit', () => {
    render(
      <PlaylistList
        playlists={[playlist]}
        limit={6}
        onCreateClick={jest.fn()}
        onRename={jest.fn()}
        onDeleteRequest={jest.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /پلی‌لیست جدید/ })).toBeEnabled();
  });
});
