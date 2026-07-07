'use client';

// ============================================================
// SOUNDWAVE — ROLE-BASED ROUTE GUARD
// Client-side guard: auth state lives in Zustand + localStorage
// (no auth cookie yet), so we gate here rather than in middleware.
//
// authStore's persist middleware hydrates from localStorage as
// soon as the module loads on the client — before React's first
// render. So `user` may already be correct on the very first
// client render, while the server always rendered it as null.
// Rendering based on `user` immediately would be a hydration
// mismatch. Instead we always render null until this component
// has mounted (which matches the server's null output), then
// re-render with the real, by-then-accurate `user` value.
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isAuthorized =
    !!user &&
    allow.includes(user.role) &&
    (!requireApprovedArtist || mockGetArtistByUserId(user.id)?.status === 'approved');

  useEffect(() => {
    if (!mounted) return;
    if (!user) {
      router.replace('/login');
    } else if (!isAuthorized) {
      router.replace('/home');
    }
  }, [mounted, user, isAuthorized, router]);

  if (!mounted || !isAuthorized) return null;

  return <>{children}</>;
}
