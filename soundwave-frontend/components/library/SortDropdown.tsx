'use client';

import { Select } from '@/components/ui';

export type SortOption = 'listeners' | 'date';

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <div style={{ minWidth: 180 }}>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        options={[
          { value: 'listeners', label: 'بیشترین شنونده' },
          { value: 'date', label: 'تاریخ انتشار' },
        ]}
      />
    </div>
  );
}
