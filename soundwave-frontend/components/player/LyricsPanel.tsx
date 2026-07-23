// ============================================================
// SOUNDWAVE — PLAYER: Lyrics Panel
// Slide-in panel showing the current track's lyrics.
// ============================================================

interface LyricsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  trackTitle: string | null;
  lyrics: string | null;
}

export function LyricsPanel({ isOpen, onClose, trackTitle, lyrics }: LyricsPanelProps) {
  const lines = lyrics ? lyrics.split('\n') : [];

  return (
    <div
      role="dialog"
      aria-label="متن آهنگ"
      aria-hidden={!isOpen}
      style={{
        position: 'fixed',
        top: 0,
        bottom: 'var(--player-height)',
        left: 0,
        width: 380,
        maxWidth: '90vw',
        background: 'var(--color-surface-1)',
        borderRight: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        flexDirection: 'column',
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform var(--transition-normal)',
        zIndex: 60,
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--space-4) var(--space-5)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <span style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>
          متن آهنگ{trackTitle ? ` — ${trackTitle}` : ''}
        </span>
        <button
          type="button"
          aria-label="بستن متن آهنگ"
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', fontSize: 'var(--text-lg)', cursor: 'pointer' }}
        >
          ✕
        </button>
      </div>

      <div style={{ overflowY: 'auto', flex: 1, padding: 'var(--space-6) var(--space-5)' }}>
        {lyrics ? (
          <div style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--text-base)',
            lineHeight: 2,
            color: 'var(--color-text-primary)',
          }}>
            {lines.map((line, i) => (
              <p key={i} style={{ margin: 0, minHeight: '1.5em' }}>{line || ' '}</p>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-8)' }}>
            متنی برای این آهنگ موجود نیست
          </div>
        )}
      </div>
    </div>
  );
}
