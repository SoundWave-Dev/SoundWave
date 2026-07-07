// ============================================================
// SOUNDWAVE — APP CONSTANTS
// Single source of truth for business rules.
// ============================================================

import type { SubscriptionPlan, SubscriptionTier } from '@/types';

// ── SUBSCRIPTION PLANS ───────────────────────────────────────
// NOTE: Prices are fetched from backend (admin can change them).
// These are only used as fallback / display defaults.

export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, SubscriptionPlan> = {
  free: {
    tier: 'free',
    monthlyPrice: 0,
    features: {
      dailyStreamLimit: 60,
      playlistLimit: 6,
      profilePhoto: false,
      download: false,
      earlyAccess: false,
      viewStats: false,
    },
  },
  silver: {
    tier: 'silver',
    monthlyPrice: 0, // fetched from backend
    features: {
      dailyStreamLimit: null,
      playlistLimit: 100,
      profilePhoto: true,
      download: true,
      earlyAccess: false,
      viewStats: false,
    },
  },
  gold: {
    tier: 'gold',
    monthlyPrice: 0, // fetched from backend
    features: {
      dailyStreamLimit: null,
      playlistLimit: null,
      profilePhoto: true,
      download: true,
      earlyAccess: true,
      viewStats: true,
    },
  },
};

// ── ROUTES ───────────────────────────────────────────────────

export const ROUTES = {
  HOME:           '/',
  LOGIN:          '/login',
  REGISTER:       '/register',
  PROFILE:        (username: string) => `/profile/${username}`,
  ARTIST:         (id: string) => `/artist/${id}`,
  ALBUM:          (id: string) => `/album/${id}`,
  SETTINGS:       '/settings',
  NOTIFICATIONS:  '/notifications',
  PLAYLISTS:      '/playlists',
  LIBRARY:        '/library',
  ARTIST_MANAGE:  '/manage',
  SUPPORT:        '/support',
  SUPPORT_TICKETS: '/support/tickets',
  SUPPORT_TICKET: (id: string) => `/support/tickets/${id}`,
  PAYMENT:        '/payment',
} as const;

// ── LOCAL STORAGE KEYS ───────────────────────────────────────

export const STORAGE_KEYS = {
  AUTH_TOKEN:            'sw_auth_token',
  USER:                  'sw_user',
  PLAYER_STATE:          'sw_player_state',
  USER_SETTINGS:         'sw_user_settings',
  PLAYLISTS:             'sw_playlists',
  MOCK_DB:               'sw_mock_db',
  NOTIFICATIONS:         'sw_notifications',
  USERS:                 'sw_users',
  ARTISTS:               'sw_artists',
  TRACKS:                'sw_tracks',
  CREDENTIALS:           'sw_credentials',
  TICKETS:               'sw_tickets',
  PAYOUTS:               'sw_payouts',
  SUBSCRIPTION_PRICES:   'sw_subscription_prices',
} as const;

// ── PLAYER ───────────────────────────────────────────────────

export const DEFAULT_VOLUME = 0.8;
export const PLAYER_SEEK_STEP = 5; // seconds

// ── PAGINATION ───────────────────────────────────────────────

export const DEFAULT_PAGE_SIZE = 20;
