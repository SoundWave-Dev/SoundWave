// ============================================================
// SOUNDWAVE — SOCIAL API (apps.social) — Follow/Unfollow
// ============================================================

import { apiClient } from './client';

export interface FollowStats {
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
}

interface ApiFollowStats {
  follower_count: number;
  following_count: number;
  is_following: boolean;
}

export async function getFollowStats(userId: string): Promise<FollowStats> {
  const { data } = await apiClient.get<ApiFollowStats>(`/social/users/${userId}/follow-stats/`);
  return {
    followerCount: data.follower_count,
    followingCount: data.following_count,
    isFollowing: data.is_following,
  };
}

export async function follow(userId: string): Promise<void> {
  await apiClient.post(`/social/users/${userId}/follow/`);
}

export async function unfollow(userId: string): Promise<void> {
  await apiClient.delete(`/social/users/${userId}/follow/`);
}
