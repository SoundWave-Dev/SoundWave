'use client';

// ============================================================
// SOUNDWAVE — PLAYER: Progress Bar
// Displays elapsed/total time. Click or drag to seek.
// ============================================================

import { formatDuration } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

interface ProgressBarProps {
  progress: number;   // 0–1
  duration: number;   // seconds
  onSeek: (progress: number) => void;
}

export function ProgressBar({ progress, duration, onSeek }: ProgressBarProps) {
  const elapsed = progress * duration;
  const { t } = useTranslation('progressBar');

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', width: '100%' }}>
      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', minWidth: 36, textAlign: 'left' }}>
        {formatDuration(Math.floor(elapsed))}
      </span>

      <input
        type="range"
        role="slider"
        aria-label={t('playbackProgress')}
        min={0}
        max={1}
        step={0.001}
        value={Number.isFinite(progress) ? progress : 0}
        onChange={(e) => onSeek(Number(e.target.value))}
        style={{
          flex: 1,
          accentColor: 'var(--color-primary)',
          cursor: 'pointer',
        }}
      />

      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', minWidth: 36, textAlign: 'right' }}>
        {formatDuration(Math.floor(duration))}
      </span>
    </div>
  );
}
