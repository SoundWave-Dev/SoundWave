// ============================================================
// SOUNDWAVE — UI PRIMITIVE: Card
// ============================================================

import { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, style, ...rest }: CardProps) {
  return (
    <div
      style={{
        background: 'var(--color-surface-1)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-5)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
