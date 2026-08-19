"use client";
import React, { useState, useEffect } from "react";
import type { SiteConfig } from "../common/types";

interface FloatingButtonsProps {
  site: SiteConfig;
}

export default function FloatingButtons({ site }: FloatingButtonsProps) {
  const [showTop, setShowTop] = useState(false);
  const waUrl = `https://wa.me/${site.whatsappMain}?text=${encodeURIComponent(site.whatsappMessage || "")}`;

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <>
      {/* WhatsApp FAB */}
      <a
        className="fbtn fab"
        data-btn="waFab"
        href={waUrl}
        target="_blank"
        rel="noopener"
        aria-label="تواصل عبر واتساب"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.2 14.2c-.2.6-1.2 1.2-1.7 1.2-.4.1-1 .1-1.6-.1a13 13 0 0 1-5.9-5.2c-.6-1-.9-2-.6-2.6.2-.5.8-1.4 1.3-1.5.4 0 .7 0 .9.5l.7 1.6c.1.3 0 .6-.2.8l-.5.6c-.2.2-.2.4-.1.7.5.9 2 2.4 3.2 2.9.3.1.5.1.7-.1l.7-.8c.2-.3.5-.3.8-.2l1.7.8c.4.2.6.4.6.6 0 .2 0 .5-.1.8Z" />
        </svg>
      </a>

      {/* Scroll To Top */}
      <button
        className={`fbtn top-btn${showTop ? " show" : ""}`}
        id="topBtn"
        data-btn="scrollTop"
        onClick={scrollTop}
        aria-label="العودة للأعلى"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      </button>
    </>
  );
}
