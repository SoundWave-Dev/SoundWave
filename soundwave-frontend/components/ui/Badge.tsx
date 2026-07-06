// ============================================================
// SOUNDWAVE — UI PRIMITIVE: Badge
// Small status pill (e.g. ticket/artist/payout status).
// ============================================================

import { ReactNode } from 'react';

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  children: ReactNode;
  tone?: Tone;
}

const TONE_STYLES: Record<Tone, React.CSSProperties> = {
  neutral: { background: 'var(--color-surface-3)', color: 'var(--color-text-secondary)' },
  success: { background: 'var(--color-primary-glow)', color: 'var(--color-primary)' },
  warning: { background: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-warning)' },
  danger: { background: 'rgba(233, 71, 90, 0.15)', color: 'var(--color-error)' },
  info: { background: 'rgba(59, 130, 246, 0.15)', color: 'var(--color-info)' },
};

export function Badge({ children, tone = 'neutral' }: BadgeProps) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: 'var(--space-1) var(--space-3)',
        borderRadius: 'var(--radius-full)',
        fontSize: 'var(--text-xs)',
        fontWeight: 600,
        whiteSpace: 'nowrap',
        ...TONE_STYLES[tone],
      }}
    >
      {children}
    </span>
  );
}
