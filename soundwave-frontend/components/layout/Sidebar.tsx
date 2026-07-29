'use client';

// ============================================================
// SOUNDWAVE — SIDEBAR
// Desktop: fixed left column with nav, avatar, notification bell.
// Mobile: bottom navigation bar (see .sidebar-mobile-nav).
// ============================================================

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, ListMusic, Library, Settings, Bell, LogOut } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { mockGetNotifications } from '@/lib/mock/store';
import { getInitials } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import { useTranslation } from '@/lib/i18n';

const NAV_LINKS = [
  { href: ROUTES.HOME, labelKey: 'navHome', icon: Home },
  { href: ROUTES.PLAYLISTS, labelKey: 'navPlaylists', icon: ListMusic },
  { href: ROUTES.LIBRARY, labelKey: 'navLibrary', icon: Library },
  { href: ROUTES.SETTINGS, labelKey: 'navSettings', icon: Settings },
] as const;

const TIER_BADGE_KEY: Record<string, { key: 'tierFree' | 'tierSilver' | 'tierGold'; color: string }> = {
  free: { key: 'tierFree', color: 'var(--color-text-muted)' },
  silver: { key: 'tierSilver', color: 'var(--color-silver)' },
  gold: { key: 'tierGold', color: 'var(--color-gold)' },
};

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [unreadCount, setUnreadCount] = useState(0);
  const { t } = useTranslation('sidebar');


  useEffect(() => {
    setUnreadCount(mockGetNotifications().filter((n) => !n.isRead).length);
  }, [pathname]);

  const tierBadge = user ? TIER_BADGE_KEY[user.subscription] : null;

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
            aria-label={t('notificationsAriaLabel')}
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
          {NAV_LINKS.map(({ href, labelKey, icon: Icon }) => {
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
                {t(labelKey)}
              </Link>
            );
          })}
        </div>

        {user && (
          <div style={{
            paddingTop: 'var(--space-4)',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
          }}>
          <Link
            href={ROUTES.PROFILE(user.username)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
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
                  {t(tierBadge.key)}
                </span>
              )}
            </div>
          </Link>
          <button
            type="button"
            onClick={logout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              padding: 'var(--space-2) var(--space-1)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
            }}
          >
            <LogOut size={18} />
            {t('logout')}
          </button>
          </div>
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
        {NAV_LINKS.map(({ href, labelKey, icon: Icon }) => {
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
              {t(labelKey)}
            </Link>
          );
        })}
        <button
          type="button"
          aria-label={t('notificationsAriaLabel')}
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
          {t('notificationsAriaLabel')}
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
