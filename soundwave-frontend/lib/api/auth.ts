// ============================================================
// SOUNDWAVE — AUTH API
// ============================================================

import type { User } from '@/types';
import { apiClient } from './client';
import { type ApiPublicUser, type ApiUser, mapPublicUser, mapUser } from './mappers';
import { clearTokens, setTokens } from './tokenStore';

export interface RegisterListenerInput {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
  birthDate: string;
  gender: User['gender'];
  privacyPolicy: boolean;
}

export interface RegisterArtistInput {
  email: string;
  password: string;
  stageName: string;
}

interface TokenPair {
  access: string;
  refresh: string;
}

export async function login(email: string, password: string): Promise<User | null> {
  try {
    const { data } = await apiClient.post<TokenPair>('/auth/login/', { email, password });
    setTokens(data.access, data.refresh);
    return await getMe();
  } catch {
    return null;
  }
}

export function logout(): void {
  clearTokens();
}

export async function getMe(): Promise<User> {
  const { data } = await apiClient.get<ApiUser>('/auth/me/');
  return mapUser(data);
}

export async function getUserByUsername(username: string): Promise<User | null> {
  try {
    const { data } = await apiClient.get<ApiPublicUser>(`/auth/users/${username}/`);
    return mapPublicUser(data);
  } catch {
    return null;
  }
}

export async function updateMe(partial: Partial<Pick<User, 'displayName' | 'birthDate' | 'gender'>>): Promise<User> {
  const { data } = await apiClient.patch<ApiUser>('/auth/me/', {
    display_name: partial.displayName,
    date_of_birth: partial.birthDate,
    gender: partial.gender,
  });
  return mapUser(data);
}

export async function updateMyAvatar(file: File): Promise<User> {
  const formData = new FormData();
  formData.append('avatar', file);
  const { data } = await apiClient.patch<ApiUser>('/auth/me/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return mapUser(data);
}

export async function registerListener(input: RegisterListenerInput): Promise<User> {
  await apiClient.post('/auth/register/listener/', {
    email: input.email,
    password: input.password,
    confirm_password: input.confirmPassword,
    display_name: input.displayName,
    date_of_birth: input.birthDate,
    gender: input.gender,
    accept_privacy_policy: input.privacyPolicy,
  });
  const user = await login(input.email, input.password);
  if (!user) throw new Error('Registered but automatic login failed.');
  return user;
}

export async function registerArtist(input: RegisterArtistInput): Promise<{ pending: true }> {
  // Phase 1's portfolio "upload" only ever stored a filename, never real file bytes
  // (see RegisterArtistForm.tsx) — nothing real to send here yet, so portfolio_url
  // is left blank rather than faking a URL out of a filename.
  await apiClient.post('/auth/register/artist/', {
    email: input.email,
    password: input.password,
    stage_name: input.stageName,
  });
  return { pending: true };
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await apiClient.post('/auth/password/change/', {
    current_password: currentPassword,
    new_password: newPassword,
  });
}

export async function requestPasswordReset(email: string): Promise<void> {
  await apiClient.post('/auth/password/forgot/', { email });
}

export async function confirmPasswordReset(token: string, newPassword: string): Promise<void> {
  await apiClient.post('/auth/password/reset/', { token, new_password: newPassword });
}
