"use client";

import { useLanguage } from "@/app/contexts/LanguageContext";

const DIR_MAP: Record<string, string> = { ar: "rtl", fr: "ltr", en: "ltr" };
const LANG_MAP: Record<string, string> = { ar: "ar", fr: "fr", en: "en" };

export function DirectionWrapper({ children }: { children: React.ReactNode }) {
  const { locale } = useLanguage();
  return (
    <div dir={DIR_MAP[locale] || "rtl"} lang={LANG_MAP[locale] || "ar"} className="store-root flex flex-col min-h-screen">
      {children}
    </div>
  );
}
