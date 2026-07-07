'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import {
  mockGetPlaylists,
  mockCreatePlaylist,
  mockDeletePlaylist,
  mockRenamePlaylist,
} from '@/lib/mock/store';
import { MOCK_USERS } from '@/lib/mock/data'; // TEMP (testing only): see fallback below
import { getPlaylistLimit } from '@/lib/utils';
import { Modal, Button } from '@/components/ui';
import { PlaylistList } from '@/components/playlist/PlaylistList';
import { CreatePlaylistModal } from '@/components/playlist/CreatePlaylistModal';
import type { Playlist } from '@/types';

export default function PlaylistsPage() {
  const authUser = useAuthStore((s) => s.user);
  // TEMP (testing only): fall back to a mock user so the page is viewable
  // without logging in. Remove this fallback (go back to
  // `const user = authUser` + the early return) before shipping/committing.
  const user = authUser ?? MOCK_USERS[1];
  const [playlists, setPlaylists] = useState<Playlist[]>(() => (user ? mockGetPlaylists(user.id) : []));
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Playlist | null>(null);

  if (!user) return <h2>ابتدا وارد شوید.</h2>;

  const limit = getPlaylistLimit(user.subscription);

  const handleCreate = (name: string) => {
    const p = mockCreatePlaylist(user.id, name);
    setPlaylists((prev) => [...prev, p]);
  };

  const handleRename = (id: string, name: string) => {
    mockRenamePlaylist(id, name);
    setPlaylists((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
  };

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;
    mockDeletePlaylist(pendingDelete.id);
    setPlaylists((prev) => prev.filter((p) => p.id !== pendingDelete.id));
    setPendingDelete(null);
  };

  return (
    <div>
      <PlaylistList
        playlists={playlists}
        limit={limit}
        onCreateClick={() => setIsCreateOpen(true)}
        onRename={handleRename}
        onDeleteRequest={setPendingDelete}
      />

      <CreatePlaylistModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreate}
      />

      <Modal isOpen={pendingDelete !== null} onClose={() => setPendingDelete(null)} title="حذف پلی‌لیست">
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-5)' }}>
          آیا از حذف پلی‌لیست «{pendingDelete?.name}» مطمئن هستید؟ این عمل قابل بازگشت نیست.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={() => setPendingDelete(null)}>انصراف</Button>
          <Button variant="danger" onClick={handleConfirmDelete}>حذف</Button>
        </div>
      </Modal>
    </div>
  );
}
