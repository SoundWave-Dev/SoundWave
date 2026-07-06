'use client';

// ============================================================
// SOUNDWAVE — NOTIFICATION CARD
// ============================================================

import { useRouter } from 'next/navigation';
import type { Notification } from '@/types';
import { timeAgo } from '@/lib/utils';
import { Button } from '@/components/ui';

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NotificationCard({ notification, onMarkAsRead, onDelete }: NotificationCardProps) {
  const router = useRouter();
  const { id, title, body, isRead, actionUrl, createdAt } = notification;

  const handleClick = () => {
    if (actionUrl) router.push(actionUrl);
  };

  return (
    <div
      data-testid="notification-card"
      data-read={isRead}
      onClick={actionUrl ? handleClick : undefined}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 'var(--space-4)',
        padding: 'var(--space-5)',
        borderRadius: 'var(--radius-lg)',
        background: isRead ? 'var(--color-surface-1)' : 'var(--color-primary-glow)',
        border: `1px solid ${isRead ? 'var(--color-border)' : 'var(--color-primary)'}`,
        cursor: actionUrl ? 'pointer' : 'default',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: isRead ? 500 : 700,
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-1)',
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>
          {body}
        </div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{timeAgo(createdAt)}</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', flexShrink: 0 }}>
        {!isRead && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead(id);
            }}
          >
            علامت‌گذاری به عنوان خوانده‌شده
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          style={{ color: 'var(--color-error)' }}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(id);
          }}
        >
          حذف
        </Button>
      </div>
    </div>
  );
}
