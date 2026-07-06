// ============================================================
// SOUNDWAVE — MAIN APP LAYOUT
// Wraps all authenticated pages (home, profile, library...)
// ============================================================

// TODO (Rayan): Replace the placeholder sidebar with <Sidebar />
// TODO (Rayan): Replace the placeholder player with <Player />

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-shell">
      {/* Sidebar — Rayan owns this component */}
      <aside className="app-sidebar">
        {/* TODO: <Sidebar /> */}
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
          <div style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-xl)' }}>
            🎵 Soundwave
          </div>
          <a href="/" style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>خانه</a>
          <a href="/playlists" style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>پلی‌لیست‌ها</a>
          <a href="/library" style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>کتابخانه</a>
          <a href="/settings" style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>تنظیمات</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="app-main">
        {children}
      </main>

      {/* Player Bar — Iliya owns this component */}
      <footer className="app-player">
        {/* TODO: <Player /> */}
        <div style={{
          height: 'var(--player-height)',
          background: 'var(--color-surface-1)',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 var(--space-6)',
          color: 'var(--color-text-muted)',
          fontSize: 'var(--text-sm)',
        }}>
          🎵 Player — coming soon (Iliya)
        </div>
      </footer>

    </div>
  );
}

