// ============================================================
// SOUNDWAVE — UI PRIMITIVE: Button
// ============================================================

import { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

const VARIANT_STYLES: Record<Variant, React.CSSProperties> = {
  primary: {
    background: 'var(--color-primary)',
    color: '#000',
  },
  secondary: {
    background: 'var(--color-surface-3)',
    color: 'var(--color-text-primary)',
    border: '1px solid var(--color-border)',
  },
  danger: {
    background: 'var(--color-error)',
    color: '#fff',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--color-text-secondary)',
  },
};

const SIZE_STYLES: Record<Size, React.CSSProperties> = {
  sm: { padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--text-xs)' },
  md: { padding: 'var(--space-3) var(--space-5)', fontSize: 'var(--text-sm)' },
};

export function Button({ variant = 'primary', size = 'md', style, disabled, children, ...rest }: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className="sw-btn"
      style={{
        borderRadius: 'var(--radius-full)',
        fontWeight: 600,
        fontFamily: 'var(--font-sans)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'opacity var(--transition-fast), filter var(--transition-fast), transform var(--transition-fast)',
        whiteSpace: 'nowrap',
        ...VARIANT_STYLES[variant],
        ...SIZE_STYLES[size],
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
