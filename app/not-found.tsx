// app/not-found.tsx
// Global 404 fallback — used for Auth routes and any route group
// without its own not-found.tsx. Reads locale from localStorage
// directly (no LanguageProvider dependency).

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const COLORS = {
  darkGreen: "#0a2c23",
  gold: "#cda552",
  cream: "#f7f3ec",
};

type Locale = "ar" | "fr" | "en";

const translations = {
  heading: { ar: "عذراً! الصفحة غير موجودة", en: "Oops! Page Not Found", fr: "Oups ! Page introuvable" },
  description: {
    ar: "يبدو أن الصفحة التي تبحثين عنها قد تم نقلها أو حذفها أو أنها غير موجودة.",
    en: "It seems the page you're looking for has been moved, deleted, or doesn't exist.",
    fr: "Il semble que la page que vous cherchez a été déplacée, supprimée ou n'existe pas.",
  },
  homeButton: { ar: "العودة إلى الرئيسية", en: "Back to Home", fr: "Retour à l'accueil" },
  storeButton: { ar: "زيارة المتجر", en: "Visit Store", fr: "Visiter la boutique" },
  subMessage: {
    ar: "✨ يمكنك العودة إلى الصفحة الرئيسية أو تصفح متجرنا.",
    en: "✨ You can go back to the homepage or browse our store.",
    fr: "✨ Vous pouvez revenir à l'accueil ou parcourir notre boutique.",
  },
};

function getInitialLocale(): Locale {
  try {
    const saved = localStorage.getItem("sodfa_locale") as Locale | null;
    if (saved === "ar" || saved === "fr" || saved === "en") return saved;
  } catch {}
  return "ar";
}

export default function GlobalNotFound() {
  const [locale, setLocale] = useState<Locale>(getInitialLocale);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const isRTL = locale === "ar";
  const t = (key: keyof typeof translations) => translations[key][locale] || translations[key].en;

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-20 md:py-28"
      style={{ background: COLORS.cream, fontFamily: "'Tajawal', sans-serif" }}
      dir={isRTL ? "rtl" : "ltr"}
      lang={locale}
    >
      <div className="max-w-4xl w-full mx-auto">
        <div className="relative">
          {/* Decorative Background */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-5" style={{ background: `radial-gradient(circle, ${COLORS.gold} 0%, transparent 70%)` }} />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full opacity-5" style={{ background: `radial-gradient(circle, #0f3d31 0%, transparent 70%)` }} />

          <div className="relative z-10 text-center">
            {/* 404 Number */}
            <div
              className="relative inline-block mb-6"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "scale(1)" : "scale(0.8)",
                transition: "opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <h1 className="text-[120px] sm:text-[160px] md:text-[200px] font-extrabold tracking-tight leading-none select-none" style={{ color: COLORS.darkGreen }}>
                404
              </h1>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 h-1.5 rounded-full" style={{ width: "60%", background: `linear-gradient(90deg, transparent, ${COLORS.gold}, transparent)` }} />
            </div>

            {/* Heading */}
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4"
              style={{
                color: COLORS.darkGreen,
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(20px)",
                transition: "opacity 0.5s 0.15s ease, transform 0.5s 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              {t("heading")}
            </h2>

            {/* Description */}
            <p
              className="text-base sm:text-lg max-w-md mx-auto leading-relaxed"
              style={{
                color: "#0a2c23CC",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(20px)",
                transition: "opacity 0.5s 0.25s ease, transform 0.5s 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              {t("description")}
            </p>

            <p
              className="text-sm mt-3"
              style={{ color: COLORS.gold, opacity: visible ? 1 : 0, transition: "opacity 0.5s 0.3s ease" }}
            >
              {t("subMessage")}
            </p>

            {/* Action Buttons */}
            <div
              className="flex flex-wrap items-center justify-center gap-3 mt-8"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(20px)",
                transition: "opacity 0.5s 0.35s ease, transform 0.5s 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                style={{ background: COLORS.gold, color: COLORS.darkGreen, boxShadow: "0 4px 20px rgba(205, 165, 82, 0.25)" }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ transform: isRTL ? "scaleX(-1)" : "none" }}>
                  <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {t("homeButton")}
              </Link>

              <Link
                href="/store"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 hover:-translate-y-0.5 border hover:shadow-lg"
                style={{ color: COLORS.darkGreen, borderColor: "#cda55240", background: "transparent" }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
                {t("storeButton")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
