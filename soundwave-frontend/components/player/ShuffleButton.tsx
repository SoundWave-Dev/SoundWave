'use client';

// ============================================================
// SOUNDWAVE — PLAYER: Shuffle Button
// ============================================================

import { useTranslation } from '@/lib/i18n';

interface ShuffleButtonProps {
  isShuffled: boolean;
  onClick: () => void;
}

export function ShuffleButton({ isShuffled, onClick }: ShuffleButtonProps) {
  const { t } = useTranslation('shuffleButton');

  return (
    <button
      type="button"
      aria-label={isShuffled ? t('turnOff') : t('turnOn')}
      aria-pressed={isShuffled}
      title={t('title')}
      onClick={onClick}
      style={{
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontSize: 'var(--text-lg)',
        color: isShuffled ? 'var(--color-primary)' : 'var(--color-text-secondary)',
      }}
    >
      🔀
    </button>
  );
}
