// ============================================================
// SOUNDWAVE — PLAYER: Repeat Button
// Cycles none → all → one, with a distinct icon per mode.
// ============================================================

import type { RepeatMode } from '@/types';

interface RepeatButtonProps {
  repeatMode: RepeatMode;
  onClick: () => void;
}

const ICONS: Record<RepeatMode, string> = {
  none: '🔁',
  all: '🔁',
  one: '🔂',
};

const LABELS: Record<RepeatMode, string> = {
  none: 'تکرار خاموش است',
  all: 'تکرار همه فعال است',
  one: 'تکرار آهنگ فعلی فعال است',
};

export function RepeatButton({ repeatMode, onClick }: RepeatButtonProps) {
  const isActive = repeatMode !== 'none';

  return (
    <button
      type="button"
      aria-label={LABELS[repeatMode]}
      title={LABELS[repeatMode]}
      onClick={onClick}
      style={{
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontSize: 'var(--text-lg)',
        color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
        position: 'relative',
      }}
    >
      {ICONS[repeatMode]}
    </button>
  );
}
