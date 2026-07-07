'use client';

// ============================================================
// SOUNDWAVE — TICKET CHAT (support/admin dashboard)
// ============================================================

import { useEffect, useState } from 'react';
import type { Ticket } from '@/types';
import { useAuthStore } from '@/lib/store/authStore';
import { mockGetTicketById, mockAddTicketMessage } from '@/lib/mock/store';
import { MOCK_USERS } from '@/lib/mock/data'; // TEMP (testing only): see fallback below
import { timeAgo } from '@/lib/utils';
import { Button, Textarea } from '@/components/ui';

interface TicketChatProps {
  ticketId: string;
}

export function TicketChat({ ticketId }: TicketChatProps) {
  const authUser = useAuthStore((s) => s.user);
  // TEMP (testing only): fall back to a mock support agent so replying is
  // testable without logging in. Remove this fallback (go back to
  // `const user = authUser`) before shipping/committing.
  const user = authUser ?? MOCK_USERS[4];
  const [ticket, setTicket] = useState<Ticket | null | undefined>(undefined);
  const [reply, setReply] = useState('');

  useEffect(() => {
    setTicket(mockGetTicketById(ticketId));
  }, [ticketId]);

  if (ticket === undefined) return null;
  if (ticket === null) {
    return <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>تیکت یافت نشد.</div>;
  }

  const handleSend = () => {
    if (!reply.trim() || !user) return;
    const updated = mockAddTicketMessage(ticketId, user.id, user.role, reply.trim());
    setTicket(updated);
    setReply('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', maxWidth: '640px' }}>
      <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
        {ticket.subject} — {ticket.userDisplayName}
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {ticket.messages.map((message) => {
          const isStaff = message.senderRole === 'support' || message.senderRole === 'admin';
          return (
            <div
              key={message.id}
              style={{
                alignSelf: isStaff ? 'flex-start' : 'flex-end',
                maxWidth: '80%',
                background: isStaff ? 'var(--color-surface-2)' : 'var(--color-primary-glow)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-3) var(--space-4)',
              }}
            >
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>{message.body}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
                {timeAgo(message.createdAt)}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <Textarea
          placeholder="پاسخ خود را بنویسید..."
          value={reply}
          onChange={(e) => setReply(e.target.value)}
        />
        <Button onClick={handleSend} disabled={!reply.trim()} style={{ alignSelf: 'flex-end' }}>
          ارسال پاسخ
        </Button>
      </div>
    </div>
  );
}
