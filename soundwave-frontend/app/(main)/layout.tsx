// ============================================================
// SOUNDWAVE — MAIN APP LAYOUT
// Wraps all authenticated pages (home, profile, library...)
// ============================================================

// TODO (Rayan): Replace the placeholder sidebar with <Sidebar />

import { PWAInstallPrompt } from '@/components/pwa/PWAInstallPrompt';
import { Player } from '@/components/player/Player';

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
        <Player />
      </footer>

      <PWAInstallPrompt />

      <style>{`
        .app-shell {
          display: grid;
          grid-template-columns: var(--sidebar-width) 1fr;
          grid-template-rows: 1fr var(--player-height);
          grid-template-areas:
            "sidebar main"
            "player  player";
          height: 100dvh;
          overflow: hidden;
          direction: rtl;
        }

        .app-sidebar {
          grid-area: sidebar;
          overflow-y: auto;
        }

        .app-main {
          grid-area: main;
          overflow-y: auto;
          background: var(--color-bg);
          padding: var(--space-6);
        }

        .app-player {
          grid-area: player;
          position: sticky;
          bottom: 0;
          z-index: 50;
        }

        /* Mobile: stack layout */
        @media (max-width: 768px) {
          .app-shell {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr var(--player-height);
            grid-template-areas:
              "main"
              "player";
          }

          .app-sidebar {
            display: none; /* TODO: mobile nav drawer */
          }
        }
      `}</style>
    </div>
  );
}

