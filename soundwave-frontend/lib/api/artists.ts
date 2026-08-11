// ============================================================
// SOUNDWAVE — PUBLIC ARTIST PROFILE API (apps.accounts)
// ============================================================

import type { Artist } from '@/types';
import { apiClient } from './client';
import { type ApiArtistProfile, mapArtist } from './mappers';

export async function getArtistById(id: string): Promise<Artist | null> {
  try {
    const { data } = await apiClient.get<ApiArtistProfile>(`/auth/artists/${id}/`);
    return mapArtist(data);
  } catch {
    return null;
  }
}
