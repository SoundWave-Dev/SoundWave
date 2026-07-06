import { ReactNode } from 'react';

interface SectionRowProps {
  title: string;
  children: ReactNode;
}

export default function SectionRow({
  title,
  children,
}: SectionRowProps) {
  return (
    <section
      style={{
        marginBottom: '40px',
      }}
    >
      <h2
        style={{
          fontSize: '24px',
          fontWeight: 700,
          marginBottom: '16px',
          color: 'var(--color-text-primary)',
        }}
      >
        {title}
      </h2>

      <div
        style={{
          display: 'flex',
          gap: '16px',
          overflowX: 'auto',
          paddingBottom: '8px',
        }}
      >
        {children}
      </div>
    </section>
  );
}
