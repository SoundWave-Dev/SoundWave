'use client';

// ============================================================
// SOUNDWAVE — SUPPORT TICKET LIST (support/admin dashboard)
// ============================================================

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Ticket, TicketStatus } from '@/types';
import { mockGetTickets } from '@/lib/mock/store';
import { Badge, Table, type TableColumn } from '@/components/ui';
import { useTranslation } from '@/lib/i18n';

export function TicketList() {
  const { t } = useTranslation('ticketList');
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);

  const STATUS_LABEL: Record<TicketStatus, { label: string; tone: 'warning' | 'info' | 'neutral' }> = {
    open: { label: t('statusOpen'), tone: 'warning' },
    replied: { label: t('statusReplied'), tone: 'info' },
    closed: { label: t('statusClosed'), tone: 'neutral' },
  };

  useEffect(() => {
    setTickets(mockGetTickets());
  }, []);

  const columns: TableColumn<Ticket>[] = [
    { key: 'id', header: t('colId'), render: (row) => row.id },
    { key: 'user', header: t('colUser'), render: (row) => row.userDisplayName },
    { key: 'subject', header: t('colSubject'), render: (row) => row.subject },
    { key: 'date', header: t('colDate'), render: (row) => new Date(row.createdAt).toLocaleDateString('fa-IR') },
    {
      key: 'status',
      header: t('colStatus'),
      render: (row) => <Badge tone={STATUS_LABEL[row.status].tone}>{STATUS_LABEL[row.status].label}</Badge>,
    },
  ];

  return (
    <Table
      columns={columns}
      rows={tickets}
      rowKey={(row) => row.id}
      emptyMessage={t('emptyMessage')}
      onRowClick={(row) => router.push(`/support/tickets/${row.id}`)}
    />
  );
}
