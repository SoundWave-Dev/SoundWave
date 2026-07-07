// ============================================================
// SOUNDWAVE — SIDEBAR TESTS
// ============================================================

import { render, screen } from '@testing-library/react';
import Sidebar from '@/components/layout/Sidebar';
import { useAuthStore } from '@/lib/store/authStore';
import type { User } from '@/types';

jest.mock('next/navigation', () => ({
  usePathname: () => '/home',
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/lib/mock/store', () => ({
  mockGetNotifications: () => [],
}));

const user: User = {
  id: 'u1',
  username: 'sw_test',
  displayName: 'Test User',
  email: 'test@example.com',
  avatarUrl: null,
  role: 'listener',
  subscription: 'free',
  subscriptionExpiresAt: null,
  birthDate: '2000-01-01',
  gender: 'other',
  followersCount: 0,
  followingCount: 0,
  dailyStreamsUsed: 0,
  createdAt: new Date().toISOString(),
};

describe('Sidebar', () => {
  beforeEach(() => {
    useAuthStore.setState({ user, token: 'mock-token', isLoading: false });
  });

  it('renders all navigation links', () => {
    render(<Sidebar />);

    expect(screen.getAllByText('خانه').length).toBeGreaterThan(0);
    expect(screen.getAllByText('پلی‌لیست‌ها').length).toBeGreaterThan(0);
    expect(screen.getAllByText('کتابخانه').length).toBeGreaterThan(0);
    expect(screen.getAllByText('تنظیمات').length).toBeGreaterThan(0);
  });

  it('highlights the active link with the primary color', () => {
    render(<Sidebar />);

    const homeLinks = screen.getAllByText('خانه');
    const activeLink = homeLinks[0].closest('a');
    const inactiveLink = screen.getAllByText('تنظیمات')[0].closest('a');

    expect(activeLink).toHaveStyle({ color: 'var(--color-primary)' });
    expect(inactiveLink?.style.color).not.toBe('var(--color-primary)');
  });
});
