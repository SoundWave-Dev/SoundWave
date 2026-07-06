'use client';

// ============================================================
// SOUNDWAVE — MONTHLY ARTIST PAYOUT TABLE (admin dashboard)
// ============================================================

import { useEffect, useState } from 'react';
import type { ArtistPayoutRecord } from '@/types';
import { mockGetPayouts, mockConfirmSettlement } from '@/lib/mock/store';
import { formatCount } from '@/lib/utils';
import { Badge, Button, Table, type TableColumn } from '@/components/ui';

interface PayoutTableProps {
  isAdmin: boolean;
}

export function PayoutTable({ isAdmin }: PayoutTableProps) {
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
    { key: 'name', header: 'نام هنرمند', render: (p) => p.artistName },
    { key: 'listeners', header: 'شنوندگان منحصربه‌فرد', render: (p) => formatCount(p.uniqueListeners) },
    { key: 'streams', header: 'کل استریم‌ها', render: (p) => formatCount(p.totalStreams) },
    { key: 'amount', header: 'مبلغ پرداختی', render: (p) => `${formatCount(p.amount)} تومان` },
    {
      key: 'status',
      header: 'وضعیت پرداخت',
      render: (p) =>
        p.isPaid ? <Badge tone="success">تسویه‌شده</Badge> : <Badge tone="warning">در انتظار پرداخت</Badge>,
    },
    ...(isAdmin
      ? [
          {
            key: 'actions',
            header: '',
            render: (p: ArtistPayoutRecord) =>
              !p.isPaid && (
                <Button size="sm" onClick={() => handleConfirm(p.id)}>
                  تایید تسویه
                </Button>
              ),
          } as TableColumn<ArtistPayoutRecord>,
        ]
      : []),
  ];

  return <Table columns={columns} rows={payouts} rowKey={(p) => p.id} emptyMessage="رکوردی برای این ماه ثبت نشده" />;
}
