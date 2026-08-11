// ============================================================
// SOUNDWAVE — PLAYLISTS API (apps.playlists)
// ============================================================

import type { Playlist } from '@/types';
import { apiClient, getApiErrorMessage } from './client';
import { type ApiPlaylist, mapPlaylist } from './mappers';

export async function getPlaylists(ownerId: string): Promise<Playlist[]> {
  const { data } = await apiClient.get<{ results: ApiPlaylist[] } | ApiPlaylist[]>('/playlists/', {
    params: { page_size: 100 },
  });
  const list = Array.isArray(data) ? data : data.results;
  return list.map((p) => mapPlaylist(p, ownerId));
}

export async function getPlaylistById(id: string, ownerId: string): Promise<Playlist | null> {
  try {
    const { data } = await apiClient.get<ApiPlaylist>(`/playlists/${id}/`);
    return mapPlaylist(data, ownerId);
  } catch {
    return null;
  }
}

/** Throws with a user-facing message (e.g. plan playlist-limit reached) on failure. */
export async function createPlaylist(name: string, ownerId: string): Promise<Playlist> {
  try {
    const { data } = await apiClient.post<ApiPlaylist>('/playlists/', { name });
    return mapPlaylist(data, ownerId);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Could not create the playlist.'));
  }
}

export async function renamePlaylist(id: string, name: string, ownerId: string): Promise<Playlist> {
  const { data } = await apiClient.patch<ApiPlaylist>(`/playlists/${id}/`, { name });
  return mapPlaylist(data, ownerId);
}

export async function deletePlaylist(id: string): Promise<void> {
  await apiClient.delete(`/playlists/${id}/`);
}

export async function addTrackToPlaylist(playlistId: string, trackId: string, ownerId: string): Promise<Playlist> {
  const { data } = await apiClient.post<ApiPlaylist>(`/playlists/${playlistId}/tracks/`, {
    track_id: Number(trackId),
  });
  return mapPlaylist(data, ownerId);
}

export async function removeTrackFromPlaylist(playlistId: string, trackId: string): Promise<void> {
  await apiClient.delete(`/playlists/${playlistId}/tracks/${trackId}/`);
}
