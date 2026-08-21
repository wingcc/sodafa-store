"use client";
import React, { useState, useEffect, useMemo } from "react";
import type { SiteConfig } from "../common/types";

interface ButtonSetting {
  id: string;
  name: string;
  position: string;
  enabled: boolean;
}

interface FloatingButtonsProps {
  site: SiteConfig;
  onOpenContact?: () => void;
  buttonsSettings?: ButtonSetting[];
}

// Faithful port of applyButtonSettings() from the original app.js:
// enabled buttons stack vertically from the bottom (22px + i*74px pitch)
// on the side chosen in dashboard settings (right/left).
export default function FloatingButtons({ site, onOpenContact, buttonsSettings }: FloatingButtonsProps) {
  const [showTop, setShowTop] = useState(false);
  const waUrl = `https://wa.me/${site.whatsappMain}?text=${encodeURIComponent(site.whatsappMessage || "")}`;

  const handleWaClick = (e: React.MouseEvent) => {
    if (onOpenContact) {
      e.preventDefault();
      onOpenContact();
    }
  };

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Original defaults when no DB settings exist yet:
  // waFab → right, scrollTop → left. bell/theme buttons are dashboard-only.
  const positions = useMemo(() => {
    const defaults: Record<string, string> = { waFab: "right", scrollTop: "left" };
    const sides: Record<"left" | "right", string[]> = { left: [], right: [] };

    const getSetting = (id: string) => buttonsSettings?.find((b) => b.id === id);
    const isEnabled = (id: string) => getSetting(id)?.enabled ?? true;

    for (const id of ["waFab", "scrollTop"]) {
      if (!isEnabled(id)) continue;
      const side = getSetting(id)?.position === "left" ? "left" : "right";
      sides[side as "left" | "right"].push(id);
    }

    const result: Record<string, React.CSSProperties> = {};
    (["left", "right"] as const).forEach((side) => {
      const other = side === "left" ? "right" : "left";
      sides[side].forEach((id, i) => {
        result[id] = {
          display: undefined,
          [side]: "22px",
          [other]: "auto",
          bottom: `${22 + i * 74}px`,
        } as React.CSSProperties;
      });
    });

    // Ensure every known button has explicit placement even if disabled-slot math skipped it
    for (const id of ["waFab", "scrollTop"]) {
      if (!result[id]) {
        const side = (defaults[id] ?? "right") as "left" | "right";
        const other = side === "left" ? "right" : "left";
        result[id] = { [side]: "22px", [other]: "auto", bottom: "22px" } as React.CSSProperties;
      }
    }
    return result;
  }, [buttonsSettings]);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <>
      {/* WhatsApp FAB */}
      <a
        className="fbtn fab"
        data-btn="waFab"
        style={positions.waFab}
        href={waUrl}
        target="_blank"
        rel="noopener"
        aria-label="تواصل عبر واتساب"
        onClick={handleWaClick}
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
        style={positions.scrollTop}
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
