// ============================================================
// SOUNDWAVE — TRANSLATION HOOK
// ============================================================

import { useLocaleStore, type Language } from '@/lib/store/localeStore';
import en from './dictionaries/en';
import fa from './dictionaries/fa';

const dictionaries = { en, fa } as const;

type Dictionaries = typeof dictionaries;
type Namespace = keyof Dictionaries['fa'];

export function useTranslation<N extends Namespace>(namespace: N) {
  const language = useLocaleStore((s) => s.language);

  const t = (key: keyof Dictionaries['fa'][N] & string): string => {
    const dict = dictionaries[language as Language][namespace] as Record<string, string>;
    return dict?.[key] ?? key;
  };

  return { t, language };
}
