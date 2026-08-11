// ============================================================
// SOUNDWAVE — NOTIFICATIONS TESTS
// ============================================================

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationList } from '@/components/notifications/NotificationList';
import { useAuthStore } from '@/lib/store/authStore';
import { getNotifications, markAsRead } from '@/lib/api/notifications';
import { MOCK_NOTIFICATIONS } from '@/lib/mock/data';
import type { User } from '@/types';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

jest.mock('@/lib/api/notifications', () => ({
  getNotifications: jest.fn(),
  markAsRead: jest.fn(),
  markAllAsRead: jest.fn(),
  deleteNotification: jest.fn(),
}));

const testUser: User = {
  id: 'u2',
  username: 'sara',
  displayName: 'Sara Karimi',
  email: 'sara@example.com',
  avatarUrl: null,
  role: 'listener',
  subscription: 'silver',
  subscriptionExpiresAt: null,
  birthDate: '2000-01-01',
  gender: 'female',
  followersCount: 0,
  followingCount: 0,
  dailyStreamsUsed: 0,
  createdAt: new Date().toISOString(),
};

describe('NotificationList', () => {
  let currentNotifications = MOCK_NOTIFICATIONS.filter((n) => n.userId === testUser.id);

  beforeEach(() => {
    currentNotifications = MOCK_NOTIFICATIONS.filter((n) => n.userId === testUser.id).map((n) => ({ ...n }));
    (getNotifications as jest.Mock).mockImplementation(() => Promise.resolve(currentNotifications));
    (markAsRead as jest.Mock).mockImplementation((id: string) => {
      currentNotifications = currentNotifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
      return Promise.resolve();
    });
    useAuthStore.setState({ user: testUser, token: 'mock-token', isLoading: false });
  });

  it('renders the notification list from the backend', async () => {
    render(<NotificationList />);

    for (const notification of currentNotifications) {
      expect(await screen.findByText(notification.title)).toBeInTheDocument();
    }
  });

  it('updates the notification after clicking "mark as read"', async () => {
    const user = userEvent.setup();
    render(<NotificationList />);

    const unread = currentNotifications.find((n) => !n.isRead)!;
    const card = (await screen.findByText(unread.title)).closest('[data-testid="notification-card"]') as HTMLElement;
    expect(card).toHaveAttribute('data-read', 'false');

    const markAsReadButton = within(card).getByRole('button', { name: 'علامت‌گذاری به عنوان خوانده‌شده' });
    await user.click(markAsReadButton);

    const updatedCard = (await screen.findByText(unread.title)).closest('[data-testid="notification-card"]') as HTMLElement;
    expect(updatedCard).toHaveAttribute('data-read', 'true');
  });
});
