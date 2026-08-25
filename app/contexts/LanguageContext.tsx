"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

type Locale = "ar" | "fr" | "en";

type LanguageContextType = {
  locale: Locale;
  toggleLanguage: () => void;
  setLocale: (locale: Locale) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LOCALE_KEY = "sodfa_locale";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ar");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCALE_KEY) as Locale | null;
      if (saved === "ar" || saved === "fr" || saved === "en") setLocaleState(saved);
    } catch {}
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const html = document.documentElement;
    const body = document.body;
    const dir = locale === "ar" ? "rtl" : "ltr";
    html.setAttribute("lang", locale);
    html.setAttribute("dir", dir);
    if (body) {
      body.setAttribute("lang", locale);
      body.setAttribute("dir", dir);
    }
    try { localStorage.setItem(LOCALE_KEY, locale); } catch {}
  }, [locale, mounted]);

  const setLocale = (l: Locale) => setLocaleState(l);

  const toggleLanguage = () => {
    setLocaleState((prev) => {
      if (prev === "ar") return "fr";
      if (prev === "fr") return "en";
      return "ar";
    });
  };

  return (
    <LanguageContext.Provider value={{ locale, toggleLanguage, setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return { locale: "ar" as Locale, toggleLanguage: () => {}, setLocale: () => {} };
  }
  return context;
}