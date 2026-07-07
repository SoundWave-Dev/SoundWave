// ============================================================
// SOUNDWAVE — PLAYER: Volume Control
// Mute toggle + 0–100 slider.
// ============================================================

interface VolumeControlProps {
  volume: number;    // 0–1
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
}

export function VolumeControl({ volume, isMuted, onVolumeChange, onToggleMute }: VolumeControlProps) {
  const icon = isMuted || volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
      <button
        type="button"
        aria-label={isMuted ? 'باز کردن صدا' : 'قطع صدا'}
        onClick={onToggleMute}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: 'var(--text-lg)',
          color: 'var(--color-text-secondary)',
        }}
      >
        {icon}
      </button>
      <input
        type="range"
        aria-label="میزان صدا"
        min={0}
        max={100}
        step={1}
        value={isMuted ? 0 : Math.round(volume * 100)}
        onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
        style={{ width: 96, accentColor: 'var(--color-primary)', cursor: 'pointer' }}
      />
    </div>
  );
}
