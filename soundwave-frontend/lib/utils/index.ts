// ============================================================
// SOUNDWAVE — UTILITY FUNCTIONS
// ============================================================

import type { SubscriptionTier, User } from '@/types';
import { SUBSCRIPTION_PLANS } from '@/lib/constants';

// ── TIME ─────────────────────────────────────────────────────

/** Convert seconds to mm:ss display string */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Returns a relative time string like "2 hours ago" */
export function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'همین الان';
  if (minutes < 60) return `${minutes} دقیقه پیش`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ساعت پیش`;
  const days = Math.floor(hours / 24);
  return `${days} روز پیش`;
}

// ── NUMBERS ──────────────────────────────────────────────────

/** Format large numbers: 1200 → "1.2K" */
export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

// ── SUBSCRIPTION CHECKS ──────────────────────────────────────

export function canUploadPhoto(tier: SubscriptionTier): boolean {
  return SUBSCRIPTION_PLANS[tier].features.profilePhoto;
}

export function canDownload(tier: SubscriptionTier): boolean {
  return SUBSCRIPTION_PLANS[tier].features.download;
}

export function canAccessEarlyContent(tier: SubscriptionTier): boolean {
  return SUBSCRIPTION_PLANS[tier].features.earlyAccess;
}

export function canViewStats(tier: SubscriptionTier): boolean {
  return SUBSCRIPTION_PLANS[tier].features.viewStats;
}

export function getPlaylistLimit(tier: SubscriptionTier): number | null {
  return SUBSCRIPTION_PLANS[tier].features.playlistLimit;
}

export function getDailyStreamLimit(tier: SubscriptionTier): number | null {
  return SUBSCRIPTION_PLANS[tier].features.dailyStreamLimit;
}

export function hasReachedPlaylistLimit(user: User, currentCount: number): boolean {
  const limit = getPlaylistLimit(user.subscription);
  return limit !== null && currentCount >= limit;
}

export function hasReachedStreamLimit(user: User): boolean {
  const limit = getDailyStreamLimit(user.subscription);
  return limit !== null && user.dailyStreamsUsed >= limit;
}

// ── STRING HELPERS ───────────────────────────────────────────

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}

// ── CLASS NAME HELPER ─────────────────────────────────────────
// Simple cx() — prefer using the `clsx` package from npm for real usage

export function cx(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
