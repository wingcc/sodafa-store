"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";

type Locale = "ar" | "fr" | "en";

const LANGUAGES: { code: Locale; flag: string; label: string; short: string }[] = [
  { code: "ar", flag: "🇲🇦", label: "العربية", short: "MA" },
  { code: "fr", flag: "🇫🇷", label: "Français", short: "FR" },
  { code: "en", flag: "🇬🇧", label: "English", short: "GB" },
];

export function LanguageDropdown() {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const current = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0];

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        aria-label="Change language"
        onClick={() => setOpen(!open)}
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          border: "1.5px solid var(--line)",
          background: "var(--card)",
          display: "grid",
          placeItems: "center",
          cursor: "pointer",
          fontSize: 13,
          fontWeight: 800,
          color: "var(--brand-deep)",
          fontFamily: "var(--body)",
          position: "relative",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 12px 40px rgba(0,0,0,.15)",
            border: "1px solid var(--line)",
            padding: "6px",
            minWidth: 180,
            zIndex: 100,
            animation: "fadeIn .15s ease",
          }}
        >
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLocale(lang.code);
                setOpen(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                padding: "10px 14px",
                borderRadius: 12,
                border: "none",
                background: locale === lang.code ? "var(--brand-tint)" : "transparent",
                cursor: "pointer",
                fontWeight: locale === lang.code ? 800 : 500,
                fontSize: 14,
                color: locale === lang.code ? "var(--brand)" : "var(--ink)",
                fontFamily: "var(--body)",
                textAlign: "left",
                transition: "background .15s",
              }}
              onMouseEnter={(e) => {
                if (locale !== lang.code) e.currentTarget.style.background = "var(--bg2)";
              }}
              onMouseLeave={(e) => {
                if (locale !== lang.code) e.currentTarget.style.background = "transparent";
              }}
            >
              <span style={{ fontSize: 18 }}>{lang.flag}</span>
              <span style={{ flex: 1 }}>{lang.label}</span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--muted)",
                  background: "var(--bg2)",
                  padding: "2px 6px",
                  borderRadius: 6,
                }}
              >
                {lang.short}
              </span>
            </button>
          ))}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
