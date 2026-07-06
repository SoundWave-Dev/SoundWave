// ============================================================
// SOUNDWAVE — UI PRIMITIVE: Textarea
// ============================================================

import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, style, id, name, rows = 4, ...rest },
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
      <textarea
        ref={ref}
        id={resolvedId}
        name={name}
        rows={rows}
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
          resize: 'vertical',
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
