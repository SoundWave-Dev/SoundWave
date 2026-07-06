// ============================================================
// SOUNDWAVE — UI PRIMITIVE: Checkbox
// ============================================================

import { InputHTMLAttributes, ReactNode, forwardRef } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, error, id, ...rest },
  ref
) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
      <label
        htmlFor={id}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-secondary)',
          cursor: 'pointer',
        }}
      >
        <input ref={ref} id={id} type="checkbox" style={{ width: 16, height: 16, accentColor: 'var(--color-primary)' }} {...rest} />
        <span>{label}</span>
      </label>
      {error && (
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error)' }}>{error}</span>
      )}
    </div>
  );
});
