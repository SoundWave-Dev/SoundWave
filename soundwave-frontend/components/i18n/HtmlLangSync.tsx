'use client';

// ============================================================
// SOUNDWAVE — HTML LANG/DIR SYNC
// Server always renders lang="fa" dir="rtl" (see app/layout.tsx); this
// mounts once and flips <html> to match the persisted locale after hydration.
// ============================================================

import { useEffect } from 'react';
import { useLocaleStore } from '@/lib/store/localeStore';

export function HtmlLangSync() {
  const language = useLocaleStore((s) => s.language);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'en' ? 'ltr' : 'rtl';
  }, [language]);

  return null;
}
