// ============================================================
// SOUNDWAVE — UI PRIMITIVE: Table
// Generic typed data table. Pass columns + rows, get a styled table.
// ============================================================

import { ReactNode } from 'react';

export interface TableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  width?: string;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export function Table<T>({ columns, rows, rowKey, emptyMessage = 'موردی یافت نشد', onRowClick }: TableProps<T>) {
  if (rows.length === 0) {
    return (
      <div
        style={{
          padding: 'var(--space-10)',
          textAlign: 'center',
          color: 'var(--color-text-muted)',
          fontSize: 'var(--text-sm)',
        }}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  textAlign: 'right',
                  padding: 'var(--space-3) var(--space-4)',
                  color: 'var(--color-text-secondary)',
                  fontWeight: 600,
                  borderBottom: '1px solid var(--color-border)',
                  width: col.width,
                  whiteSpace: 'nowrap',
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              style={{
                cursor: onRowClick ? 'pointer' : 'default',
                transition: 'background var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                if (onRowClick) e.currentTarget.style.background = 'var(--color-surface-2)';
              }}
              onMouseLeave={(e) => {
                if (onRowClick) e.currentTarget.style.background = 'transparent';
              }}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  style={{
                    padding: 'var(--space-3) var(--space-4)',
                    borderBottom: '1px solid var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
