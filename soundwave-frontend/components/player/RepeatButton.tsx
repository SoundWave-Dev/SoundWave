'use client';

// ============================================================
// SOUNDWAVE — PLAYER: Repeat Button
// Cycles none → all → one, with a distinct icon per mode.
// ============================================================

import type { RepeatMode } from '@/types';
import { useTranslation } from '@/lib/i18n';

interface RepeatButtonProps {
  repeatMode: RepeatMode;
  onClick: () => void;
}

const ICONS: Record<RepeatMode, string> = {
  none: '🔁',
  all: '🔁',
  one: '🔂',
};

export function RepeatButton({ repeatMode, onClick }: RepeatButtonProps) {
  const isActive = repeatMode !== 'none';
  const { t } = useTranslation('repeatButton');
  const label = t(repeatMode);

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
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
