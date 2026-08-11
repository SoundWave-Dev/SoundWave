// ============================================================
// SOUNDWAVE — MUSIC API (apps.music)
// ============================================================

import type { Album, Track, TrackFilters } from '@/types';
import { apiClient } from './client';
import { type ApiAlbum, type ApiTrack, mapAlbum, mapTrack } from './mappers';

interface Paginated<T> {
  count: number;
  results: T[];
}

// Course-project scale: fetch a large single page instead of building out
// infinite-scroll/pagination UI for every list.
const LIST_PAGE_SIZE = 100;

export async function getAlbums(params: { artistProfileId?: string; search?: string } = {}): Promise<Album[]> {
  const { data } = await apiClient.get<Paginated<ApiAlbum>>('/music/albums/', {
    params: {
      page_size: LIST_PAGE_SIZE,
      artist_profile: params.artistProfileId,
      search: params.search,
    },
  });
  return data.results.map(mapAlbum);
}

export async function getAlbumById(id: string): Promise<Album | null> {
  try {
    const { data } = await apiClient.get<ApiAlbum>(`/music/albums/${id}/`);
    return mapAlbum(data);
  } catch {
    return null;
  }
}

function ordering(sortBy?: TrackFilters['sortBy'], sortOrder: TrackFilters['sortOrder'] = 'desc') {
  if (!sortBy) return undefined;
  const field = sortBy === 'listeners' ? 'annotated_unique_listeners' : 'album__release_year';
  return sortOrder === 'asc' ? field : `-${field}`;
}

export async function getTracks(filters: TrackFilters = {}): Promise<Track[]> {
  const { data } = await apiClient.get<Paginated<ApiTrack>>('/music/tracks/', {
    params: {
      page_size: LIST_PAGE_SIZE,
      search: filters.query,
      ordering: ordering(filters.sortBy, filters.sortOrder),
    },
  });
  return data.results.map(mapTrack);
}

export async function getTrackById(id: string): Promise<Track | null> {
  try {
    const { data } = await apiClient.get<ApiTrack>(`/music/tracks/${id}/`);
    return mapTrack(data);
  } catch {
    return null;
  }
}

/** Logs a play — call once when a track starts (spec §2.9); enforces the
 * listener's daily stream limit server-side (throws on 400 if exceeded). */
export async function logStream(trackId: string): Promise<void> {
  await apiClient.post(`/music/tracks/${trackId}/stream/`);
}

// ── ARTIST MANAGEMENT (/manage) ──────────────────────────────
// The backend has no standalone-track model — every Track belongs to an
// Album, and a "single" is just an Album (releaseType='single') holding
// exactly one track (see apps.music.models.Album docstring). The /manage
// UI only ever uploads one track at a time, so each upload here creates
// its own Album to hold it, matching that design 1:1.

export interface ManagedTrack extends Track {
  releaseType: 'single' | 'album';
}

export async function getMyArtistTracks(artistProfileId: string): Promise<ManagedTrack[]> {
  const albums = await getAlbums({ artistProfileId });
  return albums.flatMap((a) => a.tracks.map((track) => ({ ...track, releaseType: a.releaseType })));
}

export interface UploadTrackInput {
  title: string;
  audioFile: File | null;
  coverFile: File | null;
  lyrics: string;
  genre: string;
  releaseYear: number;
  releaseType: 'single' | 'album';
}

export async function createArtistTrack(input: UploadTrackInput): Promise<Track> {
  if (!input.audioFile) throw new Error('An audio file is required.');

  const albumForm = new FormData();
  albumForm.append('title', input.title);
  albumForm.append('release_year', String(input.releaseYear));
  albumForm.append('release_type', input.releaseType);
  albumForm.append('genre', input.genre);
  if (input.coverFile) albumForm.append('cover_image', input.coverFile);
  const { data: album } = await apiClient.post<ApiAlbum>('/music/albums/', albumForm, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  const trackForm = new FormData();
  trackForm.append('title', input.title);
  trackForm.append('album', String(album.id));
  trackForm.append('track_number', '1');
  trackForm.append('audio_file', input.audioFile);
  if (input.lyrics) trackForm.append('lyrics', input.lyrics);
  const { data: track } = await apiClient.post<ApiTrack>('/music/tracks/', trackForm, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return mapTrack(track);
}

export async function updateArtistTrack(
  trackId: string,
  albumId: string,
  input: Partial<UploadTrackInput>
): Promise<Track> {
  const albumForm = new FormData();
  if (input.title) albumForm.append('title', input.title);
  if (input.releaseYear) albumForm.append('release_year', String(input.releaseYear));
  if (input.genre) albumForm.append('genre', input.genre);
  if (input.releaseType) albumForm.append('release_type', input.releaseType);
  if (input.coverFile) albumForm.append('cover_image', input.coverFile);
  await apiClient.patch(`/music/albums/${albumId}/`, albumForm, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  const trackForm = new FormData();
  if (input.title) trackForm.append('title', input.title);
  if (input.lyrics !== undefined) trackForm.append('lyrics', input.lyrics);
  if (input.audioFile) trackForm.append('audio_file', input.audioFile);
  const { data } = await apiClient.patch<ApiTrack>(`/music/tracks/${trackId}/`, trackForm, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return mapTrack(data);
}

/** Deletes the whole release (album) a track belongs to — cascades to the
 * track, consistent with the "one track per upload" model above. */
export async function deleteArtistTrack(albumId: string): Promise<void> {
  await apiClient.delete(`/music/albums/${albumId}/`);
}
