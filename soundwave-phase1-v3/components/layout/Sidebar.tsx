// ============================================================
// SOUNDWAVE — SIDEBAR
// Owner: Rayan
// ============================================================
//
// TODO (Rayan): Build the sidebar navigation component.
//
// DESKTOP SIDEBAR (240px fixed left column):
//   - App logo / name at top
//   - Nav links (with icons from lucide-react):
//       Home         → /home
//       Playlists    → /playlists
//       Library      → /library
//       Settings     → /settings
//   - Active link highlighted with --color-primary
//   - At the bottom: user avatar + displayName + subscription badge
//   - Notification bell icon (with unread count badge)
//
// MOBILE (<768px):
//   - Hidden sidebar; replaced by bottom navigation bar OR
//     a hamburger menu that opens a drawer from the right (RTL)
//
// STATE: useAuthStore (lib/store/authStore.ts) for user info
//
// TESTS: Write at least 2 tests in __tests__/components/Sidebar.test.tsx
//   - renders correct nav links
//   - active link is highlighted
// ============================================================

export default function Sidebar() {
  return (
    <nav style={{
      width: 'var(--sidebar-width)',
      height: '100%',
      background: 'var(--color-surface-1)',
      padding: 'var(--space-6)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)',
      borderLeft: '1px solid var(--color-border)',
    }}>
      <div style={{
        color: 'var(--color-primary)',
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: 'var(--text-xl)',
        marginBottom: 'var(--space-4)',
      }}>
        🎵 Soundwave
      </div>

      <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
        🚧 Sidebar — Rayan در حال پیاده‌سازی
      </p>
    </nav>
  );
}
