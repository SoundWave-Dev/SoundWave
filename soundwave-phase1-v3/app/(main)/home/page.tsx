// ============================================================
// SOUNDWAVE — HOME PAGE
// Owner: Rayan
// ============================================================
//
// TODO (Rayan): Build the full home page:
//   1. Greeting header with user avatar + displayName
//   2. "Recently played playlists" horizontal scroll section
//   3. "Latest albums" horizontal scroll section
//   4. "Top tracks" list
//   5. Gold-only "Early Access" section (hide for free/silver)
//   6. Sidebar quick-links already handled by layout
//
// Use data from: lib/mock/store.ts (mockGetTracks, mockGetAlbums)
// Check subscription with: canAccessEarlyContent(user.subscription)
// ============================================================

export default function HomePage() {
  return (
    <div style={{ padding: 'var(--space-6)', color: 'var(--color-text-primary)' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-6)' }}>
        👋 خوش آمدید
      </h1>

      {/* TODO (Rayan): Replace with real sections */}
      <section style={{ marginBottom: 'var(--space-8)' }}>
        <h2 style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>
          آخرین پلی‌لیست‌های شنیده شده
        </h2>
        <div style={{
          background: 'var(--color-surface-1)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-8)',
          textAlign: 'center',
          color: 'var(--color-text-muted)',
        }}>
          🚧 این بخش توسط Rayan پیاده‌سازی می‌شود
        </div>
      </section>

      <section style={{ marginBottom: 'var(--space-8)' }}>
        <h2 style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>
          آخرین آلبوم‌های منتشر شده
        </h2>
        <div style={{
          background: 'var(--color-surface-1)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-8)',
          textAlign: 'center',
          color: 'var(--color-text-muted)',
        }}>
          🚧 این بخش توسط Rayan پیاده‌سازی می‌شود
        </div>
      </section>

      <section>
        <h2 style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>
          پرشنونده‌ترین آهنگ‌ها
        </h2>
        <div style={{
          background: 'var(--color-surface-1)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-8)',
          textAlign: 'center',
          color: 'var(--color-text-muted)',
        }}>
          🚧 این بخش توسط Rayan پیاده‌سازی می‌شود
        </div>
      </section>
    </div>
  );
}
