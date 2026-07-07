import { ReactNode } from 'react';

interface SectionRowProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function SectionRow({ title, subtitle, children }: SectionRowProps) {
  return (
    <section style={{ marginBottom: 'var(--space-10)' }}>
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-2xl)',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
        }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginTop: 2 }}>
            {subtitle}
          </p>
        )}
      </div>

      <div
        className="sw-section-row"
        style={{
          display: 'flex',
          gap: 'var(--space-4)',
          overflowX: 'auto',
          paddingBottom: 'var(--space-2)',
        }}
      >
        {children}
      </div>

      <style>{`
        .sw-section-row::-webkit-scrollbar { height: 6px; }
        .sw-section-row::-webkit-scrollbar-thumb { background: var(--color-surface-3); border-radius: var(--radius-full); }
      `}</style>
    </section>
  );
}
