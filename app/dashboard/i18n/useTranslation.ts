'use client';

import { usePreferencesStore } from '../store/usePreferencesStore';
import { translations, type TranslationKey } from './translations';

export function useTranslation() {
  const language = usePreferencesStore((s) => s.language);
  const t = (key: string, vars?: Record<string, string | number>): string => {
    const dict = translations[language] ?? translations.en;
    const fallback = (translations.en as Record<string, string>)[key] ?? key;
    let str: string = (dict as Record<string, string>)[key] ?? fallback;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        str = str.replace(`{${k}}`, String(v));
      });
    }
    return str;
  };
  const dir = language === 'ar' ? 'rtl' : 'ltr';
  return { t, language, dir, isRTL: language === 'ar' };
}
