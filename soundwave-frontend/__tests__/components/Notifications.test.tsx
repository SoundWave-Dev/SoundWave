// ============================================================
// SOUNDWAVE — NOTIFICATIONS TESTS
// ============================================================

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationList } from '@/components/notifications/NotificationList';
import { MOCK_NOTIFICATIONS } from '@/lib/mock/data';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

describe('NotificationList', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the notification list from mock data', () => {
    render(<NotificationList />);

    for (const notification of MOCK_NOTIFICATIONS) {
      expect(screen.getByText(notification.title)).toBeInTheDocument();
    }
  });

  it('updates the notification after clicking "mark as read"', async () => {
    const user = userEvent.setup();
    render(<NotificationList />);

    const unread = MOCK_NOTIFICATIONS.find((n) => !n.isRead)!;
    const card = screen.getByText(unread.title).closest('[data-testid="notification-card"]') as HTMLElement;
    expect(card).toHaveAttribute('data-read', 'false');

    const markAsReadButton = within(card).getByRole('button', { name: 'علامت‌گذاری به عنوان خوانده‌شده' });
    await user.click(markAsReadButton);

    const updatedCard = screen.getByText(unread.title).closest('[data-testid="notification-card"]') as HTMLElement;
    expect(updatedCard).toHaveAttribute('data-read', 'true');
  });
});
