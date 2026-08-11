// ============================================================
// SOUNDWAVE — API MAPPERS
// Converts Django REST (snake_case) payloads into the frontend's
// camelCase types (types/index.ts). Keep ALL shape-translation
// logic here so page/component code never sees a raw API response.
// ============================================================

import type {
  Album,
  Artist,
  ArtistPayoutRecord,
  Notification,
  Playlist,
  SubscriptionPlan,
  Ticket,
  TicketMessage,
  Track,
  User,
} from '@/types';

// ── USER ─────────────────────────────────────────────────────

export interface ApiUser {
  id: number;
  email: string;
  username: string;
  display_name: string;
  role: User['role'];
  avatar: string | null;
  date_of_birth: string | null;
  gender: User['gender'];
  date_joined: string;
  subscription_tier: User['subscription'];
  subscription_expires_at: string | null;
  follower_count: number;
  following_count: number;
  daily_stream_count: number;
  artist_id: number | null;
  artist_verification_status: 'pending' | 'approved' | 'rejected' | null;
}

export function mapUser(u: ApiUser): User {
  return {
    id: String(u.id),
    username: u.username,
    displayName: u.display_name,
    email: u.email,
    avatarUrl: u.avatar,
    role: u.role,
    subscription: u.subscription_tier,
    subscriptionExpiresAt: u.subscription_expires_at,
    birthDate: u.date_of_birth ?? '',
    gender: u.gender,
    followersCount: u.follower_count,
    followingCount: u.following_count,
    dailyStreamsUsed: u.daily_stream_count,
    createdAt: u.date_joined,
    artistId: u.artist_id !== null ? String(u.artist_id) : null,
    artistVerificationStatus: u.artist_verification_status,
  };
}

export interface ApiPublicUser {
  id: number;
  username: string;
  display_name: string;
  role: User['role'];
  avatar: string | null;
  subscription_tier: User['subscription'];
  follower_count: number;
  following_count: number;
  daily_stream_count: number;
  date_joined: string;
}

/** Public `/profile/[username]` view — private fields (email/gender/birthDate)
 * aren't returned by the backend for other users, so they're left blank here;
 * UserProfile.tsx never reads them off a non-own profile. */
export function mapPublicUser(u: ApiPublicUser): User {
  return {
    id: String(u.id),
    username: u.username,
    displayName: u.display_name,
    email: '',
    avatarUrl: u.avatar,
    role: u.role,
    subscription: u.subscription_tier,
    subscriptionExpiresAt: null,
    birthDate: '',
    gender: 'prefer_not_to_say',
    followersCount: u.follower_count,
    followingCount: u.following_count,
    dailyStreamsUsed: u.daily_stream_count,
    createdAt: u.date_joined,
  };
}

// ── MUSIC ────────────────────────────────────────────────────

interface ApiArtistRef {
  id: number;
  stage_name: string;
}

export interface ApiTrack {
  id: number;
  title: string;
  album: number;
  album_title: string;
  album_cover: string | null;
  genre: string | null;
  release_year: number | null;
  collaborators: number[];
  artists: ApiArtistRef[];
  audio_file: string;
  lyrics: string | null;
  duration_seconds: number;
  track_number: number;
  stream_count: number;
  unique_listeners: number | null;
}

export function mapTrack(t: ApiTrack): Track {
  return {
    id: String(t.id),
    title: t.title,
    duration: t.duration_seconds,
    audioUrl: t.audio_file,
    coverUrl: t.album_cover,
    lyrics: t.lyrics,
    genre: t.genre,
    releaseYear: t.release_year,
    albumId: String(t.album),
    albumTitle: t.album_title,
    artists: t.artists.map((a) => ({ id: String(a.id), stageName: a.stage_name })),
    streamCount: t.stream_count,
    uniqueListeners: t.unique_listeners ?? 0,
    isEarlyAccess: false, // no early-access window modeled on the backend yet
    createdAt: '',
  };
}

export interface ApiAlbum {
  id: number;
  title: string;
  artist_profile: number;
  artist_stage_name: string;
  artists: ApiArtistRef[];
  cover_image: string | null;
  genre: string | null;
  release_year: number | null;
  release_type: 'single' | 'album';
  tracks: ApiTrack[];
  created_at: string;
}

export function mapAlbum(a: ApiAlbum): Album {
  return {
    id: String(a.id),
    title: a.title,
    coverUrl: a.cover_image,
    releaseYear: a.release_year,
    genre: a.genre,
    artists: a.artists.map((x) => ({ id: String(x.id), stageName: x.stage_name })),
    tracks: a.tracks.map(mapTrack),
    streamCount: a.tracks.reduce((sum, t) => sum + t.stream_count, 0),
    isEarlyAccess: false,
    releaseType: a.release_type,
    createdAt: a.created_at,
  };
}

export interface ApiArtistProfile {
  id: number;
  user_id: number;
  stage_name: string;
  bio: string;
  avatar: string | null;
  verification_status: 'pending' | 'approved' | 'rejected';
  follower_count: number;
  total_streams: number;
  total_listeners: number;
  created_at: string;
}

export function mapArtist(a: ApiArtistProfile): Artist {
  return {
    id: String(a.id),
    userId: String(a.user_id),
    stageName: a.stage_name,
    bio: a.bio,
    avatarUrl: a.avatar,
    isVerified: a.verification_status === 'approved',
    status: a.verification_status,
    followersCount: a.follower_count,
    totalStreams: a.total_streams,
    totalListeners: a.total_listeners,
    createdAt: a.created_at,
  };
}

// ── PLAYLIST ─────────────────────────────────────────────────

interface ApiPlaylistTrack {
  id: number;
  track: ApiTrack | number;
  position: number;
  added_at: string;
}

export interface ApiPlaylist {
  id: number;
  name: string;
  tracks: ApiPlaylistTrack[];
  track_count: number;
  created_at: string;
  owner?: number;
}

export function mapPlaylist(p: ApiPlaylist, ownerId: string): Playlist {
  return {
    id: String(p.id),
    name: p.name,
    coverUrl: null,
    ownerId,
    tracks: p.tracks
      .filter((pt): pt is ApiPlaylistTrack & { track: ApiTrack } => typeof pt.track === 'object')
      .map((pt) => mapTrack(pt.track)),
    createdAt: p.created_at,
    updatedAt: p.created_at,
  };
}

// ── NOTIFICATIONS ────────────────────────────────────────────

const NOTIFICATION_KIND_MAP: Record<string, Notification['type']> = {
  subscription_expiring: 'subscription_expiry',
  new_release: 'new_release',
  artist_verification_result: 'artist_verified', // refined further using the title in mapNotification
  payout_settled: 'monthly_payment',
  new_ticket: 'new_ticket',
  new_artist_request: 'new_artist_request',
};

export interface ApiNotification {
  id: number;
  kind: string;
  title: string;
  body: string;
  action_url: string;
  is_read: boolean;
  created_at: string;
}

export function mapNotification(n: ApiNotification, recipientId: string): Notification {
  let type = NOTIFICATION_KIND_MAP[n.kind] ?? 'new_release';
  if (n.kind === 'artist_verification_result' && /reject/i.test(n.title)) {
    type = 'artist_rejected';
  }
  return {
    id: String(n.id),
    userId: recipientId,
    type,
    title: n.title,
    body: n.body,
    isRead: n.is_read,
    actionUrl: n.action_url || null,
    createdAt: n.created_at,
  };
}

// ── SUPPORT ──────────────────────────────────────────────────

export interface ApiTicket {
  id: number;
  user: number;
  username: string;
  user_display_name: string;
  subject: string;
  status: 'open' | 'closed';
  created_at: string;
}

export function mapTicket(t: ApiTicket, messages: TicketMessage[] = []): Ticket {
  return {
    id: String(t.id),
    userId: String(t.user),
    userDisplayName: t.user_display_name || t.username,
    subject: t.subject,
    status: t.status,
    messages,
    createdAt: t.created_at,
    updatedAt: messages.length ? messages[messages.length - 1].createdAt : t.created_at,
  };
}

export interface ApiTicketMessage {
  id: number;
  ticket: number;
  sender: number;
  sender_role: TicketMessage['senderRole'];
  body: string;
  created_at: string;
}

export function mapTicketMessage(m: ApiTicketMessage): TicketMessage {
  return {
    id: String(m.id),
    ticketId: String(m.ticket),
    senderId: String(m.sender),
    senderRole: m.sender_role,
    body: m.body,
    createdAt: m.created_at,
  };
}

export interface ApiPayout {
  id: number;
  artist_profile: number;
  artist_name: string;
  period_month: string;
  unique_listeners: number;
  total_streams: number;
  amount: string | number;
  status: 'pending' | 'paid';
  settled_at: string | null;
}

export function mapPayout(p: ApiPayout): ArtistPayoutRecord {
  return {
    id: String(p.id),
    artistId: String(p.artist_profile),
    artistName: p.artist_name,
    month: p.period_month.slice(0, 7),
    uniqueListeners: p.unique_listeners,
    totalStreams: p.total_streams,
    amount: Number(p.amount),
    isPaid: p.status === 'paid',
    paidAt: p.settled_at,
  };
}

// ── BILLING ──────────────────────────────────────────────────

export interface ApiSubscriptionPlan {
  id: number;
  tier: SubscriptionPlan['tier'];
  monthly_price: string | number;
  daily_stream_limit: number | null;
  playlist_limit: number | null;
  can_upload_profile_photo: boolean;
  can_download_tracks: boolean;
  early_access_to_releases: boolean;
  can_view_artist_stats: boolean;
}

export function mapSubscriptionPlan(p: ApiSubscriptionPlan): SubscriptionPlan {
  return {
    tier: p.tier,
    monthlyPrice: Number(p.monthly_price),
    features: {
      dailyStreamLimit: p.daily_stream_limit,
      playlistLimit: p.playlist_limit,
      profilePhoto: p.can_upload_profile_photo,
      download: p.can_download_tracks,
      earlyAccess: p.early_access_to_releases,
      viewStats: p.can_view_artist_stats,
    },
  };
}
