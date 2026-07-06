'use client';

// ============================================================
// SOUNDWAVE — ARTIST VERIFICATION TABLE (support/admin dashboard)
// ============================================================

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Artist } from '@/types';
import { rejectReasonSchema, type RejectReasonFormValues } from '@/lib/validators/rejectReasonSchema';
import { mockGetPendingArtists, mockGetUsers, mockApproveArtist, mockRejectArtist } from '@/lib/mock/store';
import { Badge, Button, Modal, Table, Textarea, type TableColumn } from '@/components/ui';

export function ArtistApprovalTable() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [portfolioArtist, setPortfolioArtist] = useState<Artist | null>(null);
  const [rejectingArtist, setRejectingArtist] = useState<Artist | null>(null);

  const refresh = () => setArtists(mockGetPendingArtists());

  useEffect(() => {
    refresh();
  }, []);

  const getEmail = (userId: string) => mockGetUsers().find((u) => u.id === userId)?.email ?? '—';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RejectReasonFormValues>({ resolver: zodResolver(rejectReasonSchema) });

  const handleApprove = (artist: Artist) => {
    mockApproveArtist(artist.id);
    refresh();
  };

  const handleRejectSubmit = (values: RejectReasonFormValues) => {
    if (!rejectingArtist) return;
    mockRejectArtist(rejectingArtist.id, values.reason);
    setRejectingArtist(null);
    reset();
    refresh();
  };

  const columns: TableColumn<Artist>[] = [
    { key: 'stageName', header: 'نام هنری', render: (a) => a.stageName },
    { key: 'email', header: 'ایمیل', render: (a) => getEmail(a.userId) },
    {
      key: 'date',
      header: 'تاریخ ثبت‌نام',
      render: (a) => new Date(a.createdAt).toLocaleDateString('fa-IR'),
    },
    { key: 'status', header: 'وضعیت', render: () => <Badge tone="warning">در انتظار تایید</Badge> },
    {
      key: 'actions',
      header: '',
      render: (a) => (
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Button variant="secondary" size="sm" onClick={() => setPortfolioArtist(a)}>
            مشاهده نمونه‌کار
          </Button>
          <Button variant="primary" size="sm" onClick={() => handleApprove(a)}>
            تایید
          </Button>
          <Button variant="danger" size="sm" onClick={() => setRejectingArtist(a)}>
            رد درخواست
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Table columns={columns} rows={artists} rowKey={(a) => a.id} emptyMessage="درخواست هنرمندی در انتظار بررسی وجود ندارد" />

      <Modal isOpen={!!portfolioArtist} onClose={() => setPortfolioArtist(null)} title="نمونه‌کار هنرمند">
        <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
          نمونه‌کار ارسالی «{portfolioArtist?.stageName}» — بارگذاری فایل واقعی در فاز دوم پیاده‌سازی می‌شود.
        </div>
      </Modal>

      <Modal
        isOpen={!!rejectingArtist}
        onClose={() => {
          setRejectingArtist(null);
          reset();
        }}
        title="رد درخواست هنرمندی"
      >
        <form onSubmit={handleSubmit(handleRejectSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <Textarea
            label={`دلیل رد درخواست «${rejectingArtist?.stageName ?? ''}»`}
            placeholder="دلیل رد درخواست را بنویسید"
            error={errors.reason?.message}
            {...register('reason')}
          />
          <Button type="submit" variant="danger" style={{ width: '100%' }}>
            رد درخواست
          </Button>
        </form>
      </Modal>
    </>
  );
}
