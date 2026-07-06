'use client';

// ============================================================
// SOUNDWAVE — ROLE-BASED ROUTE GUARD
// Client-side guard: auth state lives in Zustand + localStorage
// (no auth cookie yet), so we gate here rather than in middleware.
// Waits for the persisted authStore to hydrate before deciding,
// to avoid flashing a redirect before localStorage is read.
// ============================================================

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { mockGetArtistByUserId } from '@/lib/mock/store';
import type { UserRole } from '@/types';

interface RequireRoleProps {
  allow: UserRole[];
  children: ReactNode;
  /** Additionally require an approved artist profile (for the artist-manage panel). */
  requireApprovedArtist?: boolean;
}

export function RequireRole({ allow, requireApprovedArtist, children }: RequireRoleProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  // `persist` is only meaningful in the browser — during SSR/static
  // generation there is no localStorage to hydrate from.
  const [hasHydrated, setHasHydrated] = useState(
    () => typeof window !== 'undefined' && (useAuthStore.persist?.hasHydrated() ?? false)
  );

  useEffect(() => {
    if (hasHydrated) return;
    return useAuthStore.persist?.onFinishHydration(() => setHasHydrated(true));
  }, [hasHydrated]);

  const isAuthorized =
    !!user &&
    allow.includes(user.role) &&
    (!requireApprovedArtist || mockGetArtistByUserId(user.id)?.status === 'approved');

  useEffect(() => {
    if (!hasHydrated) return;
    if (!user) {
      router.replace('/login');
    } else if (!isAuthorized) {
      router.replace('/home');
    }
  }, [hasHydrated, user, isAuthorized, router]);

  if (!hasHydrated || !isAuthorized) return null;

  return <>{children}</>;
}
