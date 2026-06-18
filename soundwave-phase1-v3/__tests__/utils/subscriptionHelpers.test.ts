// ============================================================
// SAMPLE TEST — shows the testing patterns used in this project
// This tests utility functions — each person should write similar
// tests for their own components.
// ============================================================

import { formatDuration, formatCount, getInitials, timeAgo } from '@/lib/utils';
import {
  canUploadPhoto,
  canDownload,
  canAccessEarlyContent,
  canViewStats,
  hasReachedPlaylistLimit,
  getDailyStreamLimit,
} from '@/lib/utils';
import type { User } from '@/types';

const mockUser = (subscription: 'free' | 'silver' | 'gold'): User => ({
  id: 'test-1',
  username: 'test_user',
  displayName: 'Test User',
  email: 'test@example.com',
  avatarUrl: null,
  role: 'listener',
  subscription,
  subscriptionExpiresAt: null,
  birthDate: '2000-01-01',
  gender: 'other',
  followersCount: 0,
  followingCount: 0,
  dailyStreamsUsed: 0,
  createdAt: '2024-01-01T00:00:00Z',
});

describe('formatDuration', () => {
  it('formats seconds under a minute correctly', () => {
    expect(formatDuration(45)).toBe('0:45');
  });

  it('formats minutes and seconds correctly', () => {
    expect(formatDuration(245)).toBe('4:05');
  });

  it('pads single-digit seconds with a leading zero', () => {
    expect(formatDuration(70)).toBe('1:10');
  });
});

describe('formatCount', () => {
  it('returns raw number for small values', () => {
    expect(formatCount(999)).toBe('999');
  });

  it('formats thousands with K suffix', () => {
    expect(formatCount(1500)).toBe('1.5K');
  });

  it('formats millions with M suffix', () => {
    expect(formatCount(2_400_000)).toBe('2.4M');
  });
});

describe('getInitials', () => {
  it('returns first two initials', () => {
    expect(getInitials('Ali Rezaei')).toBe('AR');
  });

  it('returns single initial for one-word name', () => {
    expect(getInitials('Dariush')).toBe('D');
  });
});

describe('Subscription helpers', () => {
  it('free tier cannot upload photo', () => {
    expect(canUploadPhoto('free')).toBe(false);
  });

  it('silver tier can upload photo', () => {
    expect(canUploadPhoto('silver')).toBe(true);
  });

  it('gold tier can access early content', () => {
    expect(canAccessEarlyContent('gold')).toBe(true);
  });

  it('silver tier cannot access early content', () => {
    expect(canAccessEarlyContent('silver')).toBe(false);
  });

  it('free tier has 60 daily stream limit', () => {
    expect(getDailyStreamLimit('free')).toBe(60);
  });

  it('gold tier has no daily stream limit', () => {
    expect(getDailyStreamLimit('gold')).toBeNull();
  });

  it('free user with 6 playlists has reached the limit', () => {
    const user = mockUser('free');
    expect(hasReachedPlaylistLimit(user, 6)).toBe(true);
  });

  it('free user with 5 playlists has not reached the limit', () => {
    const user = mockUser('free');
    expect(hasReachedPlaylistLimit(user, 5)).toBe(false);
  });

  it('gold user never reaches playlist limit', () => {
    const user = mockUser('gold');
    expect(hasReachedPlaylistLimit(user, 1000)).toBe(false);
  });
});
