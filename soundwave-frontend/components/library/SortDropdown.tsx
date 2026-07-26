'use client';

import { Select } from '@/components/ui';
import { useTranslation } from '@/lib/i18n';

export type SortOption = 'listeners' | 'date';

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  const { t } = useTranslation('sortDropdown');
  return (
    <div style={{ minWidth: 180 }}>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        options={[
          { value: 'listeners', label: t('mostListeners') },
          { value: 'date', label: t('releaseDate') },
        ]}
      />
    </div>
  );
}
