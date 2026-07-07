// ============================================================
// SOUNDWAVE — MOCK STORE (Phase 1)
// Simulates a backend using localStorage.
// ⚠️  Replace every function here with a real API call in Phase 2.
// ============================================================

import { STORAGE_KEYS } from '@/lib/constants';
import { slugify } from '@/lib/utils';
import {
  MOCK_USERS,
  MOCK_ARTISTS,
  MOCK_TRACKS,
  MOCK_ALBUMS,
  MOCK_PLAYLISTS,
  MOCK_NOTIFICATIONS,
  MOCK_CREDENTIALS,
  MOCK_TICKETS,
  MOCK_PAYOUTS,
} from './data';
import type {
  User,
  Artist,
  Track,
  Album,
  Playlist,
  Notification,
  Ticket,
  TicketMessage,
  TicketStatus,
  UserRole,
  ArtistPayoutRecord,
} from '@/types';

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

// ── USERS ────────────────────────────────────────────────────
// Registered-user list, seeded from MOCK_USERS and grown via mockRegister*.

export function mockGetUsers(): User[] {
  return load<User[]>(STORAGE_KEYS.USERS, MOCK_USERS);
}

function saveUsers(users: User[]): void {
  save(STORAGE_KEYS.USERS, users);
}

function getCredentials(): Record<string, string> {
  return { ...MOCK_CREDENTIALS, ...load<Record<string, string>>(STORAGE_KEYS.CREDENTIALS, {}) };
}

function addCredential(email: string, password: string): void {
  save(STORAGE_KEYS.CREDENTIALS, { ...load<Record<string, string>>(STORAGE_KEYS.CREDENTIALS, {}), [email]: password });
}

// ── AUTH ─────────────────────────────────────────────────────

export function mockLogin(email: string, password: string): User | null {
  if (getCredentials()[email] !== password) return null;
  const user = mockGetUsers().find((u) => u.email === email) ?? null;
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

export interface RegisterListenerInput {
  displayName: string;
  email: string;
  password: string;
  birthDate: string;
  gender: User['gender'];
}

export interface RegisterArtistInput {
  email: string;
  password: string;
  stageName: string;
}

export function mockRegisterListener(input: RegisterListenerInput): User {
  const id = `u-${Date.now()}`;
  const user: User = {
    id,
    username: `sw_${slugify(input.displayName)}_${id.slice(-4)}`,
    displayName: input.displayName,
    email: input.email,
    avatarUrl: null,
    role: 'listener',
    subscription: 'free',
    subscriptionExpiresAt: null,
    birthDate: input.birthDate,
    gender: input.gender,
    followersCount: 0,
    followingCount: 0,
    dailyStreamsUsed: 0,
    createdAt: new Date().toISOString(),
  };
  saveUsers([...mockGetUsers(), user]);
  addCredential(input.email, input.password);
  return user;
}

export function mockRegisterArtist(input: RegisterArtistInput): { user: User; artist: Artist } {
  const userId = `u-${Date.now()}`;
  const user: User = {
    id: userId,
    username: `sw_${slugify(input.stageName)}_${userId.slice(-4)}`,
    displayName: input.stageName,
    email: input.email,
    avatarUrl: null,
    role: 'artist',
    subscription: 'free',
    subscriptionExpiresAt: null,
    birthDate: '',
    gender: 'prefer_not_to_say',
    followersCount: 0,
    followingCount: 0,
    dailyStreamsUsed: 0,
    createdAt: new Date().toISOString(),
  };
  saveUsers([...mockGetUsers(), user]);
  addCredential(input.email, input.password);

  const artist: Artist = {
    id: `a-${Date.now()}`,
    userId,
    stageName: input.stageName,
    bio: '',
    avatarUrl: null,
    isVerified: false,
    status: 'pending',
    followersCount: 0,
    totalStreams: 0,
    totalListeners: 0,
    createdAt: new Date().toISOString(),
  };
  save(STORAGE_KEYS.ARTISTS, [...mockGetAllArtists(), artist]);

  return { user, artist };
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

export function mockGetPlaylistById(playlistId: string): Playlist | null {
  const all = load<Playlist[]>(STORAGE_KEYS.PLAYLISTS, MOCK_PLAYLISTS);
  return all.find((p) => p.id === playlistId) ?? null;
}

export function mockRenamePlaylist(playlistId: string, name: string): Playlist | null {
  const all = load<Playlist[]>(STORAGE_KEYS.PLAYLISTS, MOCK_PLAYLISTS);
  const idx = all.findIndex((p) => p.id === playlistId);
  if (idx === -1) return null;
  const updated: Playlist = { ...all[idx], name, updatedAt: new Date().toISOString() };
  all[idx] = updated;
  save(STORAGE_KEYS.PLAYLISTS, all);
  return updated;
}

export function mockRemoveTrackFromPlaylist(playlistId: string, trackId: string): Playlist | null {
  const all = load<Playlist[]>(STORAGE_KEYS.PLAYLISTS, MOCK_PLAYLISTS);
  const idx = all.findIndex((p) => p.id === playlistId);
  if (idx === -1) return null;
  const updated: Playlist = {
    ...all[idx],
    tracks: all[idx].tracks.filter((t) => t.id !== trackId),
    updatedAt: new Date().toISOString(),
  };
  all[idx] = updated;
  save(STORAGE_KEYS.PLAYLISTS, all);
  return updated;
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
  return load<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, MOCK_NOTIFICATIONS);
}

export function mockMarkAsRead(notificationId: string): void {
  const all = load<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, MOCK_NOTIFICATIONS);
  save(STORAGE_KEYS.NOTIFICATIONS, all.map((n) => n.id === notificationId ? { ...n, isRead: true } : n));
}

export function mockMarkAllAsRead(): void {
  const all = load<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, MOCK_NOTIFICATIONS);
  save(STORAGE_KEYS.NOTIFICATIONS, all.map((n) => ({ ...n, isRead: true })));
}

export function mockDeleteNotification(notificationId: string): void {
  const all = load<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, MOCK_NOTIFICATIONS);
  save(STORAGE_KEYS.NOTIFICATIONS, all.filter((n) => n.id !== notificationId));
}

function addNotification(notification: Notification): void {
  const all = load<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, MOCK_NOTIFICATIONS);
  save(STORAGE_KEYS.NOTIFICATIONS, [notification, ...all]);
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

export function mockGetAlbumById(id: string): Album | null {
  return MOCK_ALBUMS.find((a) => a.id === id) ?? null;
}

export function mockGetUserByUsername(username: string): User | null {
  return mockGetUsers().find((u) => u.username === username) ?? null;
}

// ── FOLLOWING (listener → artist / listener → listener) ────────
// Phase 1: tracked client-side only, per browser, keyed by the
// current user's id. Followers counts on the target entity are
// bumped/dropped locally so the UI reflects the change immediately.

interface FollowState {
  artistIds: string[];
  userIds: string[];
}

function followKey(byUserId: string): string {
  return `sw_follows_${byUserId}`;
}

function loadFollowState(byUserId: string): FollowState {
  return load<FollowState>(followKey(byUserId), { artistIds: [], userIds: [] });
}

function saveFollowState(byUserId: string, state: FollowState): void {
  save(followKey(byUserId), state);
}

export function mockIsFollowingArtist(byUserId: string, artistId: string): boolean {
  return loadFollowState(byUserId).artistIds.includes(artistId);
}

export function mockToggleFollowArtist(byUserId: string, artistId: string): boolean {
  const state = loadFollowState(byUserId);
  const isFollowing = state.artistIds.includes(artistId);
  const nextArtistIds = isFollowing
    ? state.artistIds.filter((id) => id !== artistId)
    : [...state.artistIds, artistId];
  saveFollowState(byUserId, { ...state, artistIds: nextArtistIds });

  const all = mockGetAllArtists();
  const idx = all.findIndex((a) => a.id === artistId);
  if (idx !== -1) {
    all[idx] = { ...all[idx], followersCount: all[idx].followersCount + (isFollowing ? -1 : 1) };
    save(STORAGE_KEYS.ARTISTS, all);
  }
  return !isFollowing;
}

export function mockIsFollowingUser(byUserId: string, targetUserId: string): boolean {
  return loadFollowState(byUserId).userIds.includes(targetUserId);
}

export function mockToggleFollowUser(byUserId: string, targetUserId: string): boolean {
  const state = loadFollowState(byUserId);
  const isFollowing = state.userIds.includes(targetUserId);
  const nextUserIds = isFollowing
    ? state.userIds.filter((id) => id !== targetUserId)
    : [...state.userIds, targetUserId];
  saveFollowState(byUserId, { ...state, userIds: nextUserIds });

  const all = mockGetUsers();
  const idx = all.findIndex((u) => u.id === targetUserId);
  if (idx !== -1) {
    all[idx] = { ...all[idx], followersCount: all[idx].followersCount + (isFollowing ? -1 : 1) };
    saveUsers(all);
  }
  return !isFollowing;
}

// ── ARTIST OWN WORKS (artist management panel) ─────────────────
// Storage-backed track list, seeded from MOCK_TRACKS.

export type NewTrackInput = Omit<Track, 'id' | 'streamCount' | 'uniqueListeners' | 'createdAt'>;

export function mockGetAllManagedTracks(): Track[] {
  return load<Track[]>(STORAGE_KEYS.TRACKS, MOCK_TRACKS);
}

export function mockGetArtistTracks(artistId: string): Track[] {
  return mockGetAllManagedTracks().filter((t) => t.artists.some((a) => a.id === artistId));
}

export function mockCreateTrack(input: NewTrackInput): Track {
  const track: Track = {
    ...input,
    id: `t-${Date.now()}`,
    streamCount: 0,
    uniqueListeners: 0,
    createdAt: new Date().toISOString(),
  };
  save(STORAGE_KEYS.TRACKS, [...mockGetAllManagedTracks(), track]);
  return track;
}

export function mockUpdateTrack(trackId: string, partial: Partial<Track>): Track | null {
  const all = mockGetAllManagedTracks();
  const idx = all.findIndex((t) => t.id === trackId);
  if (idx === -1) return null;
  const updated: Track = { ...all[idx], ...partial };
  all[idx] = updated;
  save(STORAGE_KEYS.TRACKS, all);
  return updated;
}

export function mockDeleteTrack(trackId: string): void {
  save(STORAGE_KEYS.TRACKS, mockGetAllManagedTracks().filter((t) => t.id !== trackId));
}

// ── ARTIST VERIFICATION (support/admin) ───────────────────────
// Storage-backed artist list, seeded from MOCK_ARTISTS.
// Separate from mockGetArtists() (Rayan's read-only browse list).

export function mockGetAllArtists(): Artist[] {
  return load<Artist[]>(STORAGE_KEYS.ARTISTS, MOCK_ARTISTS);
}

export function mockGetPendingArtists(): Artist[] {
  return mockGetAllArtists().filter((a) => a.status === 'pending');
}

export function mockGetArtistByUserId(userId: string): Artist | null {
  return mockGetAllArtists().find((a) => a.userId === userId) ?? null;
}

export function mockApproveArtist(artistId: string): Artist | null {
  const all = mockGetAllArtists();
  const idx = all.findIndex((a) => a.id === artistId);
  if (idx === -1) return null;
  const updated: Artist = { ...all[idx], status: 'approved', isVerified: true };
  all[idx] = updated;
  save(STORAGE_KEYS.ARTISTS, all);
  addNotification({
    id: `n-${Date.now()}`,
    type: 'artist_verified',
    title: 'حساب هنرمند شما تایید شد',
    body: `درخواست هنرمندی «${updated.stageName}» تایید شد. اکنون می‌توانید آثار خود را منتشر کنید.`,
    isRead: false,
    actionUrl: '/manage',
    createdAt: new Date().toISOString(),
  });
  return updated;
}

export function mockRejectArtist(artistId: string, reason: string): Artist | null {
  const all = mockGetAllArtists();
  const idx = all.findIndex((a) => a.id === artistId);
  if (idx === -1) return null;
  const updated: Artist = { ...all[idx], status: 'rejected', isVerified: false, rejectionReason: reason };
  all[idx] = updated;
  save(STORAGE_KEYS.ARTISTS, all);
  addNotification({
    id: `n-${Date.now()}`,
    type: 'artist_rejected',
    title: 'درخواست هنرمندی شما رد شد',
    body: `دلیل: ${reason}`,
    isRead: false,
    actionUrl: null,
    createdAt: new Date().toISOString(),
  });
  return updated;
}

// ── SUPPORT TICKETS ────────────────────────────────────────────

export function mockGetTickets(): Ticket[] {
  return load<Ticket[]>(STORAGE_KEYS.TICKETS, MOCK_TICKETS);
}

export function mockGetTicketById(ticketId: string): Ticket | null {
  return mockGetTickets().find((t) => t.id === ticketId) ?? null;
}

export function mockAddTicketMessage(
  ticketId: string,
  senderId: string,
  senderRole: UserRole,
  body: string
): Ticket | null {
  const all = mockGetTickets();
  const idx = all.findIndex((t) => t.id === ticketId);
  if (idx === -1) return null;
  const message: TicketMessage = {
    id: `tkm-${Date.now()}`,
    ticketId,
    senderId,
    senderRole,
    body,
    createdAt: new Date().toISOString(),
  };
  const isStaffReply = senderRole === 'support' || senderRole === 'admin';
  const updated: Ticket = {
    ...all[idx],
    messages: [...all[idx].messages, message],
    status: isStaffReply ? 'replied' : 'open',
    updatedAt: new Date().toISOString(),
  };
  all[idx] = updated;
  save(STORAGE_KEYS.TICKETS, all);
  return updated;
}

export function mockUpdateTicketStatus(ticketId: string, status: TicketStatus): Ticket | null {
  const all = mockGetTickets();
  const idx = all.findIndex((t) => t.id === ticketId);
  if (idx === -1) return null;
  const updated: Ticket = { ...all[idx], status, updatedAt: new Date().toISOString() };
  all[idx] = updated;
  save(STORAGE_KEYS.TICKETS, all);
  return updated;
}

// ── ACCOUNTING / PAYOUTS (admin) ───────────────────────────────

export function mockGetPayouts(): ArtistPayoutRecord[] {
  return load<ArtistPayoutRecord[]>(STORAGE_KEYS.PAYOUTS, MOCK_PAYOUTS);
}

export function mockConfirmSettlement(payoutId: string): ArtistPayoutRecord | null {
  const all = mockGetPayouts();
  const idx = all.findIndex((p) => p.id === payoutId);
  if (idx === -1) return null;
  const updated: ArtistPayoutRecord = { ...all[idx], isPaid: true, paidAt: new Date().toISOString() };
  all[idx] = updated;
  save(STORAGE_KEYS.PAYOUTS, all);
  return updated;
}

// ── USER SETTINGS (notification prefs, volume, language) ───────

export interface UserSettings {
  notifyNewRelease: boolean;
  notifySubscription: boolean;
  notifyAccountStatus: boolean;
  notifySystem: boolean;
  volume: number;
  language: 'fa' | 'en';
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  notifyNewRelease: true,
  notifySubscription: true,
  notifyAccountStatus: true,
  notifySystem: true,
  volume: 80,
  language: 'fa',
};

export function mockGetUserSettings(): UserSettings {
  return load<UserSettings>(STORAGE_KEYS.USER_SETTINGS, DEFAULT_USER_SETTINGS);
}

export function mockUpdateUserSettings(partial: Partial<UserSettings>): UserSettings {
  const merged = { ...mockGetUserSettings(), ...partial };
  save(STORAGE_KEYS.USER_SETTINGS, merged);
  return merged;
}

// ── SUBSCRIPTION PRICING (admin) ───────────────────────────────

export interface SubscriptionPrices {
  silver: number;
  gold: number;
}

const DEFAULT_SUBSCRIPTION_PRICES: SubscriptionPrices = { silver: 49000, gold: 89000 };

export function mockGetSubscriptionPrices(): SubscriptionPrices {
  return load<SubscriptionPrices>(STORAGE_KEYS.SUBSCRIPTION_PRICES, DEFAULT_SUBSCRIPTION_PRICES);
}

export function mockUpdateSubscriptionPrices(prices: SubscriptionPrices): void {
  save(STORAGE_KEYS.SUBSCRIPTION_PRICES, prices);
}
