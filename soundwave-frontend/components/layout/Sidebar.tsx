'use client';

// ============================================================
// SOUNDWAVE — SIDEBAR
// Desktop: fixed left column with nav, avatar, notification bell.
// Mobile: bottom navigation bar (see .sidebar-mobile-nav).
// ============================================================

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, ListMusic, Library, Settings, Bell } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { mockGetNotifications } from '@/lib/mock/store';
import { getInitials } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';

const NAV_LINKS = [
  { href: ROUTES.HOME, label: 'خانه', icon: Home },
  { href: ROUTES.PLAYLISTS, label: 'پلی‌لیست‌ها', icon: ListMusic },
  { href: ROUTES.LIBRARY, label: 'کتابخانه', icon: Library },
  { href: ROUTES.SETTINGS, label: 'تنظیمات', icon: Settings },
];

const TIER_BADGE: Record<string, { label: string; color: string }> = {
  free: { label: 'رایگان', color: 'var(--color-text-muted)' },
  silver: { label: 'نقره‌ای', color: 'var(--color-silver)' },
  gold: { label: 'طلایی', color: 'var(--color-gold)' },
};

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setUnreadCount(mockGetNotifications().filter((n) => !n.isRead).length);
  }, [pathname]);

  const tierBadge = user ? TIER_BADGE[user.subscription] : null;

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="sidebar-desktop" style={{
        width: 'var(--sidebar-width)',
        height: '100%',
        background: 'var(--color-surface-1)',
        padding: 'var(--space-6)',
        flexDirection: 'column',
        borderLeft: '1px solid var(--color-border)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-8)',
        }}>
          <div style={{
            color: 'var(--color-primary)',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 'var(--text-xl)',
          }}>
            🎵 Soundwave
          </div>

          <button
            type="button"
            aria-label="اعلانات"
            onClick={() => router.push(ROUTES.NOTIFICATIONS)}
            style={{
              position: 'relative',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: isActive(pathname, ROUTES.NOTIFICATIONS) ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              display: 'flex',
            }}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: -4,
                insetInlineStart: -4,
                minWidth: 16,
                height: 16,
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-error)',
                color: '#fff',
                fontSize: 10,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 3px',
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', flex: 1 }}>
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-3) var(--space-4)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: active ? 700 : 500,
                  color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  background: active ? 'var(--color-primary-glow)' : 'transparent',
                  transition: 'background var(--transition-fast), color var(--transition-fast)',
                }}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </div>

        {user && (
          <Link
            href={ROUTES.PROFILE(user.username)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              paddingTop: 'var(--space-4)',
              borderTop: '1px solid var(--color-border)',
              color: 'inherit',
            }}
          >
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt=""
                style={{ width: 36, height: 36, borderRadius: 'var(--radius-full)', objectFit: 'cover', flexShrink: 0 }}
              />
            ) : (
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-primary)',
                color: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 'var(--text-xs)',
                flexShrink: 0,
              }}>
                {getInitials(user.displayName)}
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {user.displayName}
              </div>
              {tierBadge && (
                <span style={{ fontSize: 'var(--text-xs)', color: tierBadge.color, fontWeight: 600 }}>
                  {tierBadge.label}
                </span>
              )}
            </div>
          </Link>
        )}
      </nav>

      {/* Mobile bottom nav */}
      <nav className="sidebar-mobile-nav" style={{
        position: 'fixed',
        bottom: 'var(--player-height)',
        insetInlineStart: 0,
        insetInlineEnd: 0,
        background: 'var(--color-surface-1)',
        borderTop: '1px solid var(--color-border)',
        zIndex: 40,
        display: 'none',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: 'var(--space-2) 0',
      }}>
        {NAV_LINKS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
                fontSize: 'var(--text-xs)',
                padding: 'var(--space-1) var(--space-2)',
              }}
            >
              <Icon size={20} />
              {label}
            </Link>
          );
        })}
        <button
          type="button"
          aria-label="اعلانات"
          onClick={() => router.push(ROUTES.NOTIFICATIONS)}
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            background: 'transparent',
            border: 'none',
            color: isActive(pathname, ROUTES.NOTIFICATIONS) ? 'var(--color-primary)' : 'var(--color-text-muted)',
            fontSize: 'var(--text-xs)',
            padding: 'var(--space-1) var(--space-2)',
          }}
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: 0,
              insetInlineEnd: 2,
              width: 8,
              height: 8,
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-error)',
            }} />
          )}
          اعلانات
        </button>
      </nav>

      <style>{`
        .sidebar-desktop { display: flex; }
        .sidebar-mobile-nav { display: none; }
        @media (max-width: 768px) {
          .sidebar-desktop { display: none; }
          .sidebar-mobile-nav { display: flex; }
        }
      `}</style>
    </>
  );
}
