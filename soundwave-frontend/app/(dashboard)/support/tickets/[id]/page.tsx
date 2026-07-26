'use client';

// ============================================================
// SOUNDWAVE — TICKET DETAIL / CHAT PAGE
// Owner: Foad
// Visible only to role === 'support' || role === 'admin'
// ============================================================

import { useRouter } from 'next/navigation';
// import { RequireRole } from '@/components/auth/RequireRole'; // TEMP (testing only): see below
import { TicketChat } from '@/components/dashboard/TicketChat';
import { Button } from '@/components/ui';
import { useTranslation } from '@/lib/i18n';

export default function TicketDetailPage({ params }: { params: { id: string } }) {
  const { t } = useTranslation('supportTicketPage');
  const router = useRouter();

  // TEMP (testing only): auth guard disabled, restore the <RequireRole>
  // wrapper below before shipping/committing.
  return (
    // <RequireRole allow={['support', 'admin']}>
      <div style={{ padding: 'var(--space-8)', maxWidth: '1100px', margin: '0 auto' }}>
        <Button variant="ghost" size="sm" onClick={() => router.push('/support')} style={{ marginBottom: 'var(--space-5)' }}>
          {t('backToTickets')}
        </Button>
        <TicketChat ticketId={params.id} />
      </div>
    // </RequireRole>
  );
}
