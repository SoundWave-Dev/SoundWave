'use client';

// ============================================================
// SOUNDWAVE — ARTIST VERIFICATION TABLE (support/admin dashboard)
// ============================================================

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { rejectReasonSchema, type RejectReasonFormValues } from '@/lib/validators/rejectReasonSchema';
import {
  getPendingArtistVerifications,
  approveArtistVerification,
  rejectArtistVerification,
  type PendingArtistVerification,
} from '@/lib/api/support';
import { Badge, Button, Modal, Table, Textarea, type TableColumn } from '@/components/ui';
import { useTranslation } from '@/lib/i18n';

export function ArtistApprovalTable() {
  const { t } = useTranslation('artistApprovalTable');
  const [artists, setArtists] = useState<PendingArtistVerification[]>([]);
  const [portfolioArtist, setPortfolioArtist] = useState<PendingArtistVerification | null>(null);
  const [rejectingArtist, setRejectingArtist] = useState<PendingArtistVerification | null>(null);

  const refresh = () => getPendingArtistVerifications().then(setArtists);

  useEffect(() => {
    refresh();
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RejectReasonFormValues>({ resolver: zodResolver(rejectReasonSchema) });

  const handleApprove = async (artist: PendingArtistVerification) => {
    await approveArtistVerification(artist.id);
    refresh();
  };

  const handleRejectSubmit = async (values: RejectReasonFormValues) => {
    if (!rejectingArtist) return;
    await rejectArtistVerification(rejectingArtist.id, values.reason);
    setRejectingArtist(null);
    reset();
    refresh();
  };

  const columns: TableColumn<PendingArtistVerification>[] = [
    { key: 'stageName', header: t('colStageName'), render: (a) => a.stageName },
    { key: 'email', header: t('colEmail'), render: (a) => a.email },
    {
      key: 'date',
      header: t('colDate'),
      render: (a) => new Date(a.createdAt).toLocaleDateString('fa-IR'),
    },
    { key: 'status', header: t('colStatus'), render: () => <Badge tone="warning">{t('statusPending')}</Badge> },
    {
      key: 'actions',
      header: '',
      render: (a) => (
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Button variant="secondary" size="sm" onClick={() => setPortfolioArtist(a)}>
            {t('viewPortfolio')}
          </Button>
          <Button variant="primary" size="sm" onClick={() => handleApprove(a)}>
            {t('approve')}
          </Button>
          <Button variant="danger" size="sm" onClick={() => setRejectingArtist(a)}>
            {t('reject')}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Table columns={columns} rows={artists} rowKey={(a) => a.id} emptyMessage={t('emptyMessage')} />

      <Modal isOpen={!!portfolioArtist} onClose={() => setPortfolioArtist(null)} title={t('portfolioModalTitle')}>
        <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
          {t('portfolioBody').replace('{name}', portfolioArtist?.stageName ?? '')}
        </div>
      </Modal>

      <Modal
        isOpen={!!rejectingArtist}
        onClose={() => {
          setRejectingArtist(null);
          reset();
        }}
        title={t('rejectModalTitle')}
      >
        <form onSubmit={handleSubmit(handleRejectSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <Textarea
            label={t('rejectReasonLabel').replace('{name}', rejectingArtist?.stageName ?? '')}
            placeholder={t('rejectReasonPlaceholder')}
            error={errors.reason?.message}
            {...register('reason')}
          />
          <Button type="submit" variant="danger" style={{ width: '100%' }}>
            {t('reject')}
          </Button>
        </form>
      </Modal>
    </>
  );
}
