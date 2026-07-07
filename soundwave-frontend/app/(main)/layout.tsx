// ============================================================
// SOUNDWAVE — MAIN APP LAYOUT
// Wraps all authenticated pages (home, profile, library...)
// ============================================================

import { PWAInstallPrompt } from '@/components/pwa/PWAInstallPrompt';
import { Player } from '@/components/player/Player';
import Sidebar from '@/components/layout/Sidebar';
import { RequireRole } from '@/components/auth/RequireRole';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TEMP (testing only): auth guard disabled so /home etc. are viewable
  // without logging in. Restore the <RequireRole> wrapper below before
  // shipping/committing.
  return (
    // <RequireRole allow={['listener', 'artist', 'support', 'admin']}>
      <div className="app-shell">
        {/* Sidebar */}
        <aside className="app-sidebar">
          <Sidebar />
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
      </div>
    // </RequireRole>
  );
}

