// ============================================================
// SOUNDWAVE — UI PRIMITIVE: Input
// ============================================================

import { InputHTMLAttributes, forwardRef, useState } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, style, id, name, onFocus, onBlur, ...rest },
  ref
) {
  const resolvedId = id ?? name;
  const [isFocused, setIsFocused] = useState(false);

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
        onFocus={(e) => { setIsFocused(true); onFocus?.(e); }}
        onBlur={(e) => { setIsFocused(false); onBlur?.(e); }}
        style={{
          background: 'var(--color-surface-3)',
          border: `1px solid ${error ? 'var(--color-error)' : isFocused ? 'var(--color-primary)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-3) var(--space-4)',
          color: 'var(--color-text-primary)',
          fontSize: 'var(--text-sm)',
          fontFamily: 'var(--font-sans)',
          outline: 'none',
          width: '100%',
          boxShadow: isFocused ? `0 0 0 3px ${error ? 'rgba(233,71,90,0.15)' : 'var(--color-primary-glow)'}` : '0 0 0 0 transparent',
          transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
          ...style,
        }}
        {...rest}
      />
      {error && (
        <span className="sw-fade-in-down" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error)' }}>
          {error}
        </span>
      )}
    </div>
  );
});
