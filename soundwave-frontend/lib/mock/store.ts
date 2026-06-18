// ============================================================
// SOUNDWAVE — MOCK STORE (Phase 1)
// Simulates a backend using localStorage.
// ⚠️  Replace every function here with a real API call in Phase 2.
// ============================================================

import { STORAGE_KEYS } from '@/lib/constants';
import {
  MOCK_USERS,
  MOCK_ARTISTS,
  MOCK_TRACKS,
  MOCK_ALBUMS,
  MOCK_PLAYLISTS,
  MOCK_NOTIFICATIONS,
  MOCK_CREDENTIALS,
} from './data';
import type { User, Artist, Track, Album, Playlist, Notification } from '@/types';

// ── HELPERS ──────────────────────────────────────────────────

function load<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

// ── AUTH ─────────────────────────────────────────────────────

export function mockLogin(email: string, password: string): User | null {
  if (MOCK_CREDENTIALS[email] !== password) return null;
  const user = MOCK_USERS.find((u) => u.email === email) ?? null;
  if (user) {
    save(STORAGE_KEYS.USER, user);
    save(STORAGE_KEYS.AUTH_TOKEN, `mock-token-${user.id}`);
  }
  return user;
}

export function mockLogout(): void {
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
}

export function mockGetCurrentUser(): User | null {
  return load<User | null>(STORAGE_KEYS.USER, null);
}

// ── PLAYLISTS ────────────────────────────────────────────────

export function mockGetPlaylists(userId: string): Playlist[] {
  const all = load<Playlist[]>(STORAGE_KEYS.PLAYLISTS, MOCK_PLAYLISTS);
  return all.filter((p) => p.ownerId === userId);
}

export function mockCreatePlaylist(userId: string, name: string): Playlist {
  const all = load<Playlist[]>(STORAGE_KEYS.PLAYLISTS, MOCK_PLAYLISTS);
  const newPlaylist: Playlist = {
    id: `pl-${Date.now()}`,
    name,
    coverUrl: null,
    ownerId: userId,
    tracks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  save(STORAGE_KEYS.PLAYLISTS, [...all, newPlaylist]);
  return newPlaylist;
}

export function mockDeletePlaylist(playlistId: string): void {
  const all = load<Playlist[]>(STORAGE_KEYS.PLAYLISTS, MOCK_PLAYLISTS);
  save(STORAGE_KEYS.PLAYLISTS, all.filter((p) => p.id !== playlistId));
}

export function mockAddTrackToPlaylist(playlistId: string, track: Track): Playlist | null {
  const all = load<Playlist[]>(STORAGE_KEYS.PLAYLISTS, MOCK_PLAYLISTS);
  const idx = all.findIndex((p) => p.id === playlistId);
  if (idx === -1) return null;
  const playlist = { ...all[idx] };
  if (!playlist.tracks.find((t) => t.id === track.id)) {
    playlist.tracks = [...playlist.tracks, track];
    playlist.updatedAt = new Date().toISOString();
    all[idx] = playlist;
    save(STORAGE_KEYS.PLAYLISTS, all);
  }
  return playlist;
}

// ── NOTIFICATIONS ─────────────────────────────────────────────

export function mockGetNotifications(): Notification[] {
  return load<Notification[]>('sw_notifications', MOCK_NOTIFICATIONS);
}

export function mockMarkAsRead(notificationId: string): void {
  const all = load<Notification[]>('sw_notifications', MOCK_NOTIFICATIONS);
  save('sw_notifications', all.map((n) => n.id === notificationId ? { ...n, isRead: true } : n));
}

export function mockMarkAllAsRead(): void {
  const all = load<Notification[]>('sw_notifications', MOCK_NOTIFICATIONS);
  save('sw_notifications', all.map((n) => ({ ...n, isRead: true })));
}

export function mockDeleteNotification(notificationId: string): void {
  const all = load<Notification[]>('sw_notifications', MOCK_NOTIFICATIONS);
  save('sw_notifications', all.filter((n) => n.id !== notificationId));
}

// ── MUSIC ────────────────────────────────────────────────────

export function mockGetTracks(): Track[]   { return MOCK_TRACKS; }
export function mockGetAlbums(): Album[]   { return MOCK_ALBUMS; }
export function mockGetArtists(): Artist[] { return MOCK_ARTISTS; }

export function mockGetArtistById(id: string): Artist | null {
  return MOCK_ARTISTS.find((a) => a.id === id) ?? null;
}

export function mockGetTrackById(id: string): Track | null {
  return MOCK_TRACKS.find((t) => t.id === id) ?? null;
}
