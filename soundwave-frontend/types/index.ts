// ============================================================
// SOUNDWAVE — SHARED TYPES
// Add new types here. Never define API shapes inside components.
// ============================================================

// ── USER & AUTH ──────────────────────────────────────────────

export type SubscriptionTier = 'free' | 'silver' | 'gold';

export type UserRole = 'listener' | 'artist' | 'support' | 'admin';

export interface User {
  id: string;
  username: string;         // assigned by system
  displayName: string;      // chosen by user
  email: string;
  avatarUrl: string | null;
  role: UserRole;
  subscription: SubscriptionTier;
  subscriptionExpiresAt: string | null; // ISO date
  birthDate: string;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  followersCount: number;
  followingCount: number;
  dailyStreamsUsed: number;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

// ── ARTIST ──────────────────────────────────────────────────

export type ArtistStatus = 'pending' | 'approved' | 'rejected';

export interface Artist {
  id: string;
  userId: string;
  stageName: string;
  bio: string;
  avatarUrl: string | null;
  isVerified: boolean;
  status: ArtistStatus;
  rejectionReason?: string;
  followersCount: number;
  totalStreams: number;
  totalListeners: number;
  createdAt: string;
}

// ── MUSIC ────────────────────────────────────────────────────

export interface Track {
  id: string;
  title: string;
  duration: number;          // seconds
  audioUrl: string;
  coverUrl: string | null;
  lyrics: string | null;
  genre: string | null;
  releaseYear: number | null;
  albumId: string | null;
  albumTitle: string | null;
  artists: Pick<Artist, 'id' | 'stageName'>[];
  streamCount: number;
  uniqueListeners: number;
  isEarlyAccess: boolean;
  createdAt: string;
}

export interface Album {
  id: string;
  title: string;
  coverUrl: string | null;
  releaseYear: number | null;
  genre: string | null;
  artists: Pick<Artist, 'id' | 'stageName'>[];
  tracks: Track[];
  streamCount: number;
  isEarlyAccess: boolean;
  createdAt: string;
}

// ── PLAYLIST ────────────────────────────────────────────────

export interface Playlist {
  id: string;
  name: string;
  coverUrl: string | null;
  ownerId: string;
  tracks: Track[];
  createdAt: string;
  updatedAt: string;
}

// ── NOTIFICATIONS ────────────────────────────────────────────

export type NotificationType =
  | 'subscription_expiry'
  | 'new_release'
  | 'artist_verified'
  | 'artist_rejected'
  | 'monthly_payment'
  | 'new_ticket'
  | 'new_artist_request';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  actionUrl: string | null;
  createdAt: string;
}

// ── PLAYER ──────────────────────────────────────────────────

export type RepeatMode = 'none' | 'all' | 'one';

export interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  progress: number;         // 0–1
  volume: number;           // 0–1
  isMuted: boolean;
  repeatMode: RepeatMode;
  isShuffled: boolean;
}

// ── SUBSCRIPTION ─────────────────────────────────────────────

export interface SubscriptionPlan {
  tier: SubscriptionTier;
  monthlyPrice: number;
  features: {
    dailyStreamLimit: number | null;   // null = unlimited
    playlistLimit: number | null;
    profilePhoto: boolean;
    download: boolean;
    earlyAccess: boolean;
    viewStats: boolean;
  };
}

// ── SUPPORT / DASHBOARD ──────────────────────────────────────

export type TicketStatus = 'open' | 'replied' | 'closed';

export interface Ticket {
  id: string;
  userId: string;
  userDisplayName: string;
  subject: string;
  status: TicketStatus;
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderRole: UserRole;
  body: string;
  createdAt: string;
}

export interface ArtistPayoutRecord {
  id: string;
  artistId: string;
  artistName: string;
  month: string;            // 'YYYY-MM'
  uniqueListeners: number;
  totalStreams: number;
  amount: number;
  isPaid: boolean;
  paidAt: string | null;
}

// ── API HELPERS ──────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type SortOrder = 'asc' | 'desc';

export interface TrackFilters {
  query?: string;
  sortBy?: 'listeners' | 'releaseDate';
  sortOrder?: SortOrder;
}
