'use client';

// ============================================================
// SOUNDWAVE — SUPPORT TICKET LIST (support/admin dashboard)
// ============================================================

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Ticket, TicketStatus } from '@/types';
import { mockGetTickets } from '@/lib/mock/store';
import { Badge, Table, type TableColumn } from '@/components/ui';

const STATUS_LABEL: Record<TicketStatus, { label: string; tone: 'warning' | 'info' | 'neutral' }> = {
  open: { label: 'باز', tone: 'warning' },
  replied: { label: 'پاسخ داده‌شده', tone: 'info' },
  closed: { label: 'بسته‌شده', tone: 'neutral' },
};

export function TicketList() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    setTickets(mockGetTickets());
  }, []);

  const columns: TableColumn<Ticket>[] = [
    { key: 'id', header: 'شناسه تیکت', render: (t) => t.id },
    { key: 'user', header: 'کاربر', render: (t) => t.userDisplayName },
    { key: 'subject', header: 'موضوع', render: (t) => t.subject },
    { key: 'date', header: 'تاریخ', render: (t) => new Date(t.createdAt).toLocaleDateString('fa-IR') },
    {
      key: 'status',
      header: 'وضعیت',
      render: (t) => <Badge tone={STATUS_LABEL[t.status].tone}>{STATUS_LABEL[t.status].label}</Badge>,
    },
  ];

  return (
    <Table
      columns={columns}
      rows={tickets}
      rowKey={(t) => t.id}
      emptyMessage="تیکتی برای نمایش وجود ندارد"
      onRowClick={(t) => router.push(`/support/tickets/${t.id}`)}
    />
  );
}
