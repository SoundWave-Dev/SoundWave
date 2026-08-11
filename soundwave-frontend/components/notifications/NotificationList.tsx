'use client';

// ============================================================
// SOUNDWAVE — NOTIFICATION LIST
// ============================================================

import { useEffect, useState } from 'react';
import type { Notification } from '@/types';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '@/lib/api/notifications';
import { useAuthStore } from '@/lib/store/authStore';
import { Button } from '@/components/ui';
import { useTranslation } from '@/lib/i18n';
import { NotificationCard } from './NotificationCard';

export function NotificationList() {
  const user = useAuthStore((s) => s.user);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { t } = useTranslation('notificationList');

  const refresh = (userId: string) => getNotifications(userId).then(setNotifications);

  useEffect(() => {
    if (user) refresh(user.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = async (id: string) => {
    if (!user) return;
    await markAsRead(id);
    refresh(user.id);
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    await deleteNotification(id);
    refresh(user.id);
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    await markAllAsRead();
    refresh(user.id);
  };

  if (notifications.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: 'var(--space-16)',
          color: 'var(--color-text-muted)',
          fontSize: 'var(--text-sm)',
        }}
      >
        <div style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-4)' }}>🔔</div>
        {t('empty')}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
          {t('title')} {unreadCount > 0 && `(${unreadCount})`}
        </h1>
        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" onClick={handleMarkAllAsRead}>
            {t('markAllAsRead')}
          </Button>
        )}
      </div>

      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onMarkAsRead={handleMarkAsRead}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
