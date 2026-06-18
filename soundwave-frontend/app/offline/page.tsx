// ============================================================
// SOUNDWAVE — OFFLINE PAGE
// Shown by the service worker when user is offline and the
// requested page is not cached.
// ============================================================

export default function OfflinePage() {
  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--color-bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--space-6)',
      padding: 'var(--space-8)',
      textAlign: 'center',
      direction: 'rtl',
    }}>
      <div style={{ fontSize: 64 }}>🎵</div>

      <div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-2xl)',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--space-3)',
        }}>
          اتصال اینترنت ندارید
        </h1>
        <p style={{
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--text-base)',
          maxWidth: 300,
          lineHeight: 1.8,
        }}>
          Soundwave برای پخش موسیقی به اینترنت نیاز دارد.
          لطفاً اتصال خود را بررسی کنید.
        </p>
      </div>

      <button
        onClick={() => window.location.reload()}
        style={{
          padding: 'var(--space-3) var(--space-8)',
          borderRadius: 'var(--radius-full)',
          background: 'var(--color-primary)',
          color: '#000',
          fontWeight: 600,
          fontSize: 'var(--text-base)',
          cursor: 'pointer',
          border: 'none',
        }}
      >
        تلاش مجدد
      </button>
    </div>
  );
}
