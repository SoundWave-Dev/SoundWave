'use client';

// ============================================================
// SOUNDWAVE — ARTIST MANAGEMENT PANEL
// Owner: Foad
// Visible only to role === 'artist' && artist.status === 'approved'
// ============================================================

import { useEffect, useState } from 'react';
import type { Track } from '@/types';
import type { UploadTrackFormValues } from '@/lib/validators/uploadTrackSchema';
import { useAuthStore } from '@/lib/store/authStore';
import {
  mockGetArtistByUserId,
  mockGetArtistTracks,
  mockCreateTrack,
  mockUpdateTrack,
  mockDeleteTrack,
} from '@/lib/mock/store';
import { formatCount } from '@/lib/utils';
import { Button, Card, Modal, Table, type TableColumn } from '@/components/ui';
import { RequireRole } from '@/components/auth/RequireRole';
import { UploadTrackModal } from '@/components/artist/UploadTrackModal';

const EARNINGS_PER_STREAM = 0.0005; // mock rate, in currency units per stream

function ManagePanel() {
  const user = useAuthStore((s) => s.user);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [deletingTrack, setDeletingTrack] = useState<Track | null>(null);

  const artist = user ? mockGetArtistByUserId(user.id) : null;

  const refresh = () => {
    if (artist) setTracks(mockGetArtistTracks(artist.id));
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artist?.id]);

  if (!artist) return null;

  const handleCreateOrUpdate = (values: UploadTrackFormValues) => {
    const collaborators = (values.collaborators ?? '')
      .split(',')
      .map((name) => name.trim())
      .filter(Boolean)
      .map((name, i) => ({ id: `collab-${Date.now()}-${i}`, stageName: name }));

    const payload = {
      title: values.title,
      duration: editingTrack?.duration ?? 180,
      audioUrl: `/mock/audio/${values.audioFileName}`,
      coverUrl: `/mock/covers/${values.coverFileName}`,
      lyrics: values.lyrics || null,
      genre: values.genre,
      releaseYear: values.releaseYear,
      albumId: values.type === 'album' ? editingTrack?.albumId ?? `al-${Date.now()}` : null,
      albumTitle: values.type === 'album' ? values.title : null,
      artists: [{ id: artist.id, stageName: artist.stageName }, ...collaborators],
      isEarlyAccess: false,
    };

    if (editingTrack) {
      mockUpdateTrack(editingTrack.id, payload);
    } else {
      mockCreateTrack(payload);
    }
    refresh();
    setIsUploadOpen(false);
    setEditingTrack(null);
  };

  const handleDelete = () => {
    if (!deletingTrack) return;
    mockDeleteTrack(deletingTrack.id);
    setDeletingTrack(null);
    refresh();
  };

  const columns: TableColumn<Track>[] = [
    { key: 'title', header: 'عنوان', render: (t) => t.title },
    { key: 'type', header: 'نوع', render: (t) => (t.albumId ? 'آلبوم' : 'تک‌آهنگ') },
    { key: 'listeners', header: 'شنونده', render: (t) => formatCount(t.uniqueListeners) },
    { key: 'streams', header: 'استریم', render: (t) => formatCount(t.streamCount) },
    {
      key: 'earnings',
      header: 'درآمد تخمینی',
      render: (t) => `${formatCount(Math.round(t.streamCount * EARNINGS_PER_STREAM))} تومان`,
    },
    {
      key: 'actions',
      header: '',
      render: (t) => (
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setEditingTrack(t);
              setIsUploadOpen(true);
            }}
          >
            ویرایش
          </Button>
          <Button variant="danger" size="sm" onClick={() => setDeletingTrack(t)}>
            حذف
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
          مدیریت آثار — {artist.stageName}
        </h1>
        <Button
          onClick={() => {
            setEditingTrack(null);
            setIsUploadOpen(true);
          }}
        >
          آپلود اثر جدید
        </Button>
      </div>

      <Card style={{ padding: 0 }}>
        <Table columns={columns} rows={tracks} rowKey={(t) => t.id} emptyMessage="هنوز اثری منتشر نکرده‌اید" />
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
                type: editingTrack.albumId ? 'album' : 'single',
                collaborators: editingTrack.artists
                  .filter((a) => a.id !== artist.id)
                  .map((a) => a.stageName)
                  .join(', '),
              }
            : undefined
        }
      />

      <Modal isOpen={!!deletingTrack} onClose={() => setDeletingTrack(null)} title="حذف اثر">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
            آیا از حذف «{deletingTrack?.title}» مطمئن هستید؟ این عملیات غیرقابل بازگشت است.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <Button variant="danger" onClick={handleDelete} style={{ flex: 1 }}>
              حذف
            </Button>
            <Button variant="secondary" onClick={() => setDeletingTrack(null)} style={{ flex: 1 }}>
              انصراف
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
