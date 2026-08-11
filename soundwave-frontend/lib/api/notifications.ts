// ============================================================
// SOUNDWAVE — NOTIFICATIONS API (apps.notifications)
// ============================================================

import type { Notification } from '@/types';
import { apiClient } from './client';
import { type ApiNotification, mapNotification } from './mappers';

export async function getNotifications(recipientId: string): Promise<Notification[]> {
  const { data } = await apiClient.get<{ results: ApiNotification[] } | ApiNotification[]>('/notifications/', {
    params: { page_size: 100 },
  });
  const list = Array.isArray(data) ? data : data.results;
  return list.map((n) => mapNotification(n, recipientId));
}

export async function markAsRead(notificationId: string): Promise<void> {
  await apiClient.post(`/notifications/${notificationId}/mark-read/`);
}

export async function markAllAsRead(): Promise<void> {
  await apiClient.post('/notifications/mark-all-read/');
}

export async function deleteNotification(notificationId: string): Promise<void> {
  await apiClient.delete(`/notifications/${notificationId}/`);
}
