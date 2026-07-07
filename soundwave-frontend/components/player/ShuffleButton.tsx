// ============================================================
// SOUNDWAVE — PLAYER: Shuffle Button
// ============================================================

interface ShuffleButtonProps {
  isShuffled: boolean;
  onClick: () => void;
}

export function ShuffleButton({ isShuffled, onClick }: ShuffleButtonProps) {
  return (
    <button
      type="button"
      aria-label={isShuffled ? 'خاموش کردن پخش تصادفی' : 'روشن کردن پخش تصادفی'}
      aria-pressed={isShuffled}
      title="پخش تصادفی"
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
