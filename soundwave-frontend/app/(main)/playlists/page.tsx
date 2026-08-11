'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import {
  getPlaylists,
  createPlaylist,
  deletePlaylist,
  renamePlaylist,
} from '@/lib/api/playlists';
import { getPlaylistLimit } from '@/lib/utils';
import { Modal, Button } from '@/components/ui';
import { PlaylistList } from '@/components/playlist/PlaylistList';
import { CreatePlaylistModal } from '@/components/playlist/CreatePlaylistModal';
import type { Playlist } from '@/types';
import { useTranslation } from '@/lib/i18n';

export default function PlaylistsPage() {
  const { t } = useTranslation('playlistsPage');
  const user = useAuthStore((s) => s.user);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Playlist | null>(null);

  useEffect(() => {
    if (user) getPlaylists(user.id).then(setPlaylists);
  }, [user]);

  if (!user) return <h2>{t('loginFirst')}</h2>;

  const limit = getPlaylistLimit(user.subscription);

  const handleCreate = async (name: string) => {
    const p = await createPlaylist(name, user.id);
    setPlaylists((prev) => [...prev, p]);
  };

  const handleRename = async (id: string, name: string) => {
    await renamePlaylist(id, name, user.id);
    setPlaylists((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    await deletePlaylist(pendingDelete.id);
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

      <Modal isOpen={pendingDelete !== null} onClose={() => setPendingDelete(null)} title={t('deletePlaylistTitle')}>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-5)' }}>
          {t('deleteConfirmPrefix')}{pendingDelete?.name}{t('deleteConfirmSuffix')}
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={() => setPendingDelete(null)}>{t('cancel')}</Button>
          <Button variant="danger" onClick={handleConfirmDelete}>{t('delete')}</Button>
        </div>
      </Modal>
    </div>
  );
}
