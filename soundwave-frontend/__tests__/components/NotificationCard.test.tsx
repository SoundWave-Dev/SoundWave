// ============================================================
// SOUNDWAVE — NOTIFICATION CARD TESTS
// ============================================================

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationCard } from '@/components/notifications/NotificationCard';
import type { Notification } from '@/types';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

const notification: Notification = {
  id: 'n-test',
  type: 'new_release',
  title: 'Test notification',
  body: 'Body text',
  isRead: false,
  actionUrl: null,
  createdAt: new Date().toISOString(),
};

describe('NotificationCard', () => {
  it('calls onDelete with the notification id when the delete button is clicked', async () => {
    const user = userEvent.setup();
    const onDelete = jest.fn();
    render(<NotificationCard notification={notification} onMarkAsRead={jest.fn()} onDelete={onDelete} />);

    await user.click(screen.getByRole('button', { name: 'حذف' }));

    expect(onDelete).toHaveBeenCalledWith('n-test');
  });

  it('calls onMarkAsRead with the notification id when marked as read', async () => {
    const user = userEvent.setup();
    const onMarkAsRead = jest.fn();
    render(<NotificationCard notification={notification} onMarkAsRead={onMarkAsRead} onDelete={jest.fn()} />);

    await user.click(screen.getByRole('button', { name: 'علامت‌گذاری به عنوان خوانده‌شده' }));

    expect(onMarkAsRead).toHaveBeenCalledWith('n-test');
  });
});
