"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

type Locale = "ar" | "en";

type LanguageContextType = {
  locale: Locale;
  toggleLanguage: () => void;
  setLocale: (locale: Locale) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("ar");

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const dir = locale === "ar" ? "rtl" : "ltr";
    html.setAttribute("lang", locale);
    html.setAttribute("dir", dir);
    if (body) {
      body.setAttribute("lang", locale);
      body.setAttribute("dir", dir);
    }
  }, [locale]);

  const toggleLanguage = () => {
    setLocale((prev) => (prev === "ar" ? "en" : "ar"));
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
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}