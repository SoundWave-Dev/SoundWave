'use client';

// ============================================================
// SOUNDWAVE — NOTIFICATION LIST
// ============================================================

import { useEffect, useState } from 'react';
import type { Notification } from '@/types';
import {
  mockGetNotifications,
  mockMarkAsRead,
  mockMarkAllAsRead,
  mockDeleteNotification,
} from '@/lib/mock/store';
import { Button } from '@/components/ui';
import { NotificationCard } from './NotificationCard';

export function NotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    setNotifications(mockGetNotifications());
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = (id: string) => {
    mockMarkAsRead(id);
    setNotifications(mockGetNotifications());
  };

  const handleDelete = (id: string) => {
    mockDeleteNotification(id);
    setNotifications(mockGetNotifications());
  };

  const handleMarkAllAsRead = () => {
    mockMarkAllAsRead();
    setNotifications(mockGetNotifications());
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
        اعلانی برای نمایش وجود ندارد
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
          اعلانات {unreadCount > 0 && `(${unreadCount})`}
        </h1>
        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" onClick={handleMarkAllAsRead}>
            علامت‌گذاری همه به عنوان خوانده‌شده
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
