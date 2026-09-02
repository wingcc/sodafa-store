"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "../contexts/LanguageContext";
import { useStoreSettings } from "../contexts/StoreSettingsContext";
import { getWhatsAppLink } from "../lib/whatsapp";

export const FloatingWhatsappButton = () => {
  const [showTop, setShowTop] = useState(false);
  const [progress, setProgress] = useState(0);
  const [waUrl, setWaUrl] = useState<string | null>(null);
  const pathname = usePathname();
  const { locale } = useLanguage();
  const { siteConfig } = useStoreSettings();

  // Determine context based on current page
  const isHome = pathname === "/";
  const waContext = isHome ? "home" as const : "general" as const;

  useEffect(() => {
    const handleScroll = () => {
      setShowTop(window.scrollY > 300);
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0) setProgress((window.scrollY / total) * 100);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Build WhatsApp URL from store settings
  useEffect(() => {
    if (siteConfig) {
      const url = getWhatsAppLink(siteConfig, locale, waContext);
      setWaUrl(url);
    }
  }, [siteConfig, locale, waContext]);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  if (!waUrl) return null;

  return (
    <>
      <div id="progress" style={{ width: `${progress}%` }} aria-hidden="true" />
      <a
        className="fbtn fab"
        id="waFab"
        data-btn="waFab"
        style={{ right: '22px', left: 'auto', bottom: '22px' }}
        href={waUrl}
        target="_blank"
        rel="noopener"
        aria-label={locale === 'ar' ? 'تواصل عبر واتساب' : locale === 'fr' ? 'Contactez-nous via WhatsApp' : 'Contact us via WhatsApp'}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.2 14.2c-.2.6-1.2 1.2-1.7 1.2-.4.1-1 .1-1.6-.1a13 13 0 0 1-5.9-5.2c-.6-1-.9-2-.6-2.6.2-.5.8-1.4 1.3-1.5.4 0 .7 0 .9.5l.7 1.6c.1.3 0 .6-.2.8l-.5.6c-.2.2-.2.4-.1.7.5.9 2 2.4 3.2 2.9.3.1.5.1.7-.1l.7-.8c.2-.3.5-.3.8-.2l1.7.8c.4.2.6.4.6.6 0 .2 0 .5-.1.8Z" />
        </svg>
      </a>
      <button
        className={`fbtn top-btn${showTop ? " show" : ""}`}
        id="topBtn"
        data-btn="scrollTop"
        style={{ left: '22px', right: 'auto', bottom: '96px' }}
        onClick={scrollTop}
        aria-label={locale === 'ar' ? 'العودة للأعلى' : locale === 'fr' ? 'Retour en haut' : 'Back to top'}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      </button>
    </>
  );
};
