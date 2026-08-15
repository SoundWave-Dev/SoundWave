'use client';

// ============================================================
// SOUNDWAVE — ARTIST MANAGEMENT PANEL
// Owner: Foad
// Visible only to role === 'artist' && artist.status === 'approved'
// ============================================================

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import {
  getMyArtistTracks,
  createArtistTrack,
  updateArtistTrack,
  deleteArtistTrack,
  type ManagedTrack,
} from '@/lib/api/music';
import { formatCount } from '@/lib/utils';
import { Button, Card, Modal, Table, type TableColumn } from '@/components/ui';
import { RequireRole } from '@/components/auth/RequireRole';
import { UploadTrackModal, type UploadTrackSubmitValues } from '@/components/artist/UploadTrackModal';
import { useTranslation } from '@/lib/i18n';

const EARNINGS_PER_STREAM = 0.0005; // mock rate, in currency units per stream

function ManagePanel() {
  const { t } = useTranslation('artistManagePage');
  const user = useAuthStore((s) => s.user);
  const [tracks, setTracks] = useState<ManagedTrack[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<ManagedTrack | null>(null);
  const [deletingTrack, setDeletingTrack] = useState<ManagedTrack | null>(null);

  const artistId = user?.artistId ?? null;

  const refresh = () => {
    if (artistId) getMyArtistTracks(artistId).then(setTracks);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artistId]);

  if (!artistId) return null;

  const handleCreateOrUpdate = async (values: UploadTrackSubmitValues) => {
    if (editingTrack) {
      await updateArtistTrack(editingTrack.id, editingTrack.albumId as string, {
        title: values.title,
        lyrics: values.lyrics ?? '',
        genre: values.genre,
        releaseYear: values.releaseYear,
        releaseType: values.type,
        audioFile: values.audioFile,
        coverFile: values.coverFile,
      });
    } else {
      await createArtistTrack({
        title: values.title,
        audioFile: values.audioFile,
        coverFile: values.coverFile,
        lyrics: values.lyrics ?? '',
        genre: values.genre,
        releaseYear: values.releaseYear,
        releaseType: values.type,
      });
    }
    refresh();
    setIsUploadOpen(false);
    setEditingTrack(null);
  };

  const handleDelete = async () => {
    if (!deletingTrack?.albumId) return;
    await deleteArtistTrack(deletingTrack.albumId);
    setDeletingTrack(null);
    refresh();
  };

  const columns: TableColumn<ManagedTrack>[] = [
    { key: 'title', header: t('colTitle'), render: (row) => row.title },
    { key: 'type', header: t('colType'), render: (row) => (row.releaseType === 'album' ? t('typeAlbum') : t('typeSingle')) },
    { key: 'listeners', header: t('colListeners'), render: (row) => formatCount(row.uniqueListeners) },
    { key: 'streams', header: t('colStreams'), render: (row) => formatCount(row.streamCount) },
    {
      key: 'earnings',
      header: t('colEarnings'),
      render: (row) => `${formatCount(Math.round(row.streamCount * EARNINGS_PER_STREAM))} ${t('currencyToman')}`,
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setEditingTrack(row);
              setIsUploadOpen(true);
            }}
          >
            {t('edit')}
          </Button>
          <Button variant="danger" size="sm" onClick={() => setDeletingTrack(row)}>
            {t('delete')}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
          {t('pageTitle').replace('{name}', user?.displayName ?? '')}
        </h1>
        <Button
          onClick={() => {
            setEditingTrack(null);
            setIsUploadOpen(true);
          }}
        >
          {t('uploadNew')}
        </Button>
      </div>

      <Card style={{ padding: 0 }}>
        <Table columns={columns} rows={tracks} rowKey={(row) => row.id} emptyMessage={t('emptyMessage')} />
      </Card>

      <UploadTrackModal
        key={editingTrack?.id ?? 'new'}
        isOpen={isUploadOpen}
        onClose={() => {
          setIsUploadOpen(false);
          setEditingTrack(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialValues={
          editingTrack
            ? {
                title: editingTrack.title,
                audioFileName: editingTrack.audioUrl.split('/').pop() ?? '',
                coverFileName: editingTrack.coverUrl?.split('/').pop() ?? '',
                lyrics: editingTrack.lyrics ?? '',
                genre: editingTrack.genre ?? '',
                releaseYear: editingTrack.releaseYear ?? new Date().getFullYear(),
                type: editingTrack.releaseType,
                collaborators: '',
              }
            : undefined
        }
      />

      <Modal isOpen={!!deletingTrack} onClose={() => setDeletingTrack(null)} title={t('deleteModalTitle')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
            {t('deleteConfirmText').replace('{title}', deletingTrack?.title ?? '')}
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <Button variant="danger" onClick={handleDelete} style={{ flex: 1 }}>
              {t('delete')}
            </Button>
            <Button variant="secondary" onClick={() => setDeletingTrack(null)} style={{ flex: 1 }}>
              {t('cancel')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function ArtistManagePage() {
  return (
    <RequireRole allow={['artist']} requireApprovedArtist>
      <ManagePanel />
    </RequireRole>
  );
}
