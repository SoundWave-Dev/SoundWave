// ============================================================
// SOUNDWAVE — PLAYBACK API (apps.playback) — cross-device
// preferences sync + the AI Song Suggester's play-history feed.
// ============================================================

import { apiClient } from './client';

export interface UserPreferences {
  language: 'fa' | 'en';
  systemVolume: number;
  notifyNewReleases: boolean;
  notifySubscription: boolean;
  notifyArtistVerification: boolean;
  notifyTickets: boolean;
}

interface ApiUserPreferences {
  language: 'fa' | 'en';
  system_volume: number;
  notify_new_releases: boolean;
  notify_subscription: boolean;
  notify_artist_verification: boolean;
  notify_tickets: boolean;
}

function mapPreferences(p: ApiUserPreferences): UserPreferences {
  return {
    language: p.language,
    systemVolume: p.system_volume,
    notifyNewReleases: p.notify_new_releases,
    notifySubscription: p.notify_subscription,
    notifyArtistVerification: p.notify_artist_verification,
    notifyTickets: p.notify_tickets,
  };
}

export async function getMyPreferences(): Promise<UserPreferences> {
  const { data } = await apiClient.get<ApiUserPreferences>('/playback/preferences/me/');
  return mapPreferences(data);
}

export async function updateMyPreferences(partial: Partial<UserPreferences>): Promise<UserPreferences> {
  const { data } = await apiClient.patch<ApiUserPreferences>('/playback/preferences/me/', {
    language: partial.language,
    system_volume: partial.systemVolume,
    notify_new_releases: partial.notifyNewReleases,
    notify_subscription: partial.notifySubscription,
    notify_artist_verification: partial.notifyArtistVerification,
    notify_tickets: partial.notifyTickets,
  });
  return mapPreferences(data);
}

/** Distinct track ids, most-recent-first — feeds the AI Song Suggester. */
export async function getRecentlyPlayed(): Promise<string[]> {
  const { data } = await apiClient.get<number[]>('/playback/recently-played/');
  return data.map(String);
}
