'use client';

// ============================================================
// SOUNDWAVE — LANDING PAGE HEADER
// Shows Login / Sign up when signed out, or a Dashboard button
// once the persisted auth store has hydrated and a user exists.
// ============================================================

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/authStore';
import { ROUTES } from '@/lib/constants';

export function LandingHeader() {
  const user = useAuthStore((s) => s.user);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const showDashboard = mounted && !!user;

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--space-4) var(--space-8)',
        background: 'rgba(13, 13, 13, 0.72)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: 'var(--text-lg)',
        color: 'var(--color-text-primary)',
      }}>
        🎵 Soundwave
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        {showDashboard ? (
          <Link
            href={ROUTES.HOME}
            className="sw-btn"
            style={{
              padding: 'var(--space-2) var(--space-5)',
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-primary)',
              color: '#000',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
            }}
          >
            داشبورد
          </Link>
        ) : (
          <>
            <Link
              href={ROUTES.LOGIN}
              className="sw-btn"
              style={{
                padding: 'var(--space-2) var(--space-5)',
                borderRadius: 'var(--radius-full)',
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
              }}
            >
              ورود
            </Link>
            <Link
              href={ROUTES.REGISTER}
              className="sw-btn"
              style={{
                padding: 'var(--space-2) var(--space-5)',
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-primary)',
                color: '#000',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
              }}
            >
              ثبت‌نام
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
