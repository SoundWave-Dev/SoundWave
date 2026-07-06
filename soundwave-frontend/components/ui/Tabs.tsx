'use client';

// ============================================================
// SOUNDWAVE — UI PRIMITIVE: Tabs
// Controlled tab bar. Parent owns the active tab state.
// ============================================================

export interface TabItem {
  key: string;
  label: string;
}

interface TabsProps {
  tabs: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
}

export function Tabs({ tabs, activeKey, onChange }: TabsProps) {
  return (
    <div
      role="tablist"
      style={{
        display: 'flex',
        gap: 'var(--space-2)',
        borderBottom: '1px solid var(--color-border)',
        marginBottom: 'var(--space-6)',
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey;
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.key)}
            style={{
              padding: 'var(--space-3) var(--space-5)',
              fontSize: 'var(--text-sm)',
              fontWeight: isActive ? 700 : 500,
              color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              borderBottom: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
              marginBottom: '-1px',
              transition: 'color var(--transition-fast)',
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
