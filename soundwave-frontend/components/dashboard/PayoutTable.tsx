'use client';

// ============================================================
// SOUNDWAVE — MONTHLY ARTIST PAYOUT TABLE (admin dashboard)
// ============================================================

import { useEffect, useState } from 'react';
import type { ArtistPayoutRecord } from '@/types';
import { mockGetPayouts, mockConfirmSettlement } from '@/lib/mock/store';
import { formatCount } from '@/lib/utils';
import { Badge, Button, Table, type TableColumn } from '@/components/ui';
import { useTranslation } from '@/lib/i18n';

interface PayoutTableProps {
  isAdmin: boolean;
}

export function PayoutTable({ isAdmin }: PayoutTableProps) {
  const { t } = useTranslation('payoutTable');
  const [payouts, setPayouts] = useState<ArtistPayoutRecord[]>([]);

  const refresh = () => setPayouts(mockGetPayouts());

  useEffect(() => {
    refresh();
  }, []);

  const handleConfirm = (id: string) => {
    mockConfirmSettlement(id);
    refresh();
  };

  const columns: TableColumn<ArtistPayoutRecord>[] = [
    { key: 'name', header: t('colArtistName'), render: (p) => p.artistName },
    { key: 'listeners', header: t('colListeners'), render: (p) => formatCount(p.uniqueListeners) },
    { key: 'streams', header: t('colStreams'), render: (p) => formatCount(p.totalStreams) },
    { key: 'amount', header: t('colAmount'), render: (p) => `${formatCount(p.amount)} ${t('currencyToman')}` },
    {
      key: 'status',
      header: t('colStatus'),
      render: (p) =>
        p.isPaid ? <Badge tone="success">{t('statusPaid')}</Badge> : <Badge tone="warning">{t('statusPending')}</Badge>,
    },
    ...(isAdmin
      ? [
          {
            key: 'actions',
            header: '',
            render: (p: ArtistPayoutRecord) =>
              !p.isPaid && (
                <Button size="sm" onClick={() => handleConfirm(p.id)}>
                  {t('confirmSettlement')}
                </Button>
              ),
          } as TableColumn<ArtistPayoutRecord>,
        ]
      : []),
  ];

  return <Table columns={columns} rows={payouts} rowKey={(p) => p.id} emptyMessage={t('emptyMessage')} />;
}
