// ============================================================
// SOUNDWAVE — LOCALE STORE (Zustand)
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/lib/constants';

export type Language = 'fa' | 'en';

interface LocaleStore {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const useLocaleStore = create<LocaleStore>()(
  persist(
    (set) => ({
      language: 'fa',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: STORAGE_KEYS.LOCALE,
    }
  )
);
