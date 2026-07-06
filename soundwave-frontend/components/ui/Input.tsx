// ============================================================
// SOUNDWAVE — UI PRIMITIVE: Input
// ============================================================

import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, style, id, name, ...rest },
  ref
) {
  const resolvedId = id ?? name;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      {label && (
        <label
          htmlFor={resolvedId}
          style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={resolvedId}
        name={name}
        style={{
          background: 'var(--color-surface-3)',
          border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-3) var(--space-4)',
          color: 'var(--color-text-primary)',
          fontSize: 'var(--text-sm)',
          fontFamily: 'var(--font-sans)',
          outline: 'none',
          width: '100%',
          ...style,
        }}
        {...rest}
      />
      {error && (
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error)' }}>{error}</span>
      )}
    </div>
  );
});
