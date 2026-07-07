'use client';

import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
      <Search
        size={16}
        style={{ position: 'absolute', insetInlineStart: 'var(--space-4)', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="جستجوی آهنگ یا هنرمند..."
        style={{
          width: '100%',
          padding: 'var(--space-3) var(--space-4) var(--space-3) var(--space-10)',
          paddingInlineStart: 'var(--space-10)',
          background: 'var(--color-surface-3)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-text-primary)',
          fontSize: 'var(--text-sm)',
          fontFamily: 'var(--font-sans)',
          outline: 'none',
        }}
      />
    </div>
  );
}
