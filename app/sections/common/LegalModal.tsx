"use client";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface LegalModalProps {
  title: string;
  body: string;
  updatedAt?: string;
  onClose: () => void;
}

/**
 * LegalModal — always light mode.
 * Rendered via portal outside .website-root so it must NOT rely on
 * .website-root CSS variables (they don't exist on body). All colors are
 * hardcoded to light palette and we set color-scheme: light to prevent
 * OS / .dark class from inverting the popup (black bg + green/gray text bug).
 */
export default function LegalModal({ title, body, updatedAt, onClose }: LegalModalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const max = el.scrollHeight - el.clientHeight;
      setScrollProgress(max > 0 ? el.scrollTop / max : 0);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Hardcoded light palette — never reads from CSS variables so .dark / prefers-color-scheme can't affect it
  const C = {
    brand: "#1E7A57",
    brandDeep: "#07231A",
    brandDeep2: "#11402F",
    brandGlow: "rgba(30,122,87,.25)",
    brandTint: "#EAF4EE",
    accent: "#C6A15B",
    accentDeep: "#9C7C3E",
    accentSoft: "#E8CE93",
    card: "#FFFDF8",
    bg: "#F7F3E8",
    ink: "#122A20",
    muted: "#5A6B5F",
    mutedBody: "#3A4A44",
    line: "rgba(23,64,47,.08)",
    lineStrong: "rgba(23,64,47,.15)",
    lineSoft: "rgba(23,64,47,.12)",
  } as const;

  const content = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="legal-modal-root"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        // Force light mode regardless of html.dark or prefers-color-scheme
        colorScheme: "light",
        isolation: "isolate",
      } as React.CSSProperties}
    >
      {/* overlay — dark translucent with blur, but content box stays light */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(7,35,26,0.58)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      />

      {/* box — always light */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "760px",
          maxHeight: "88vh",
          background: C.card,
          color: C.ink,
          colorScheme: "light",
          borderRadius: "28px",
          boxShadow: "0 32px 80px rgba(7,35,26,.35), 0 8px 32px rgba(7,35,26,.18)",
          border: `1px solid ${C.lineStrong}`,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation: "legalIn 420ms cubic-bezier(.16,1,.3,1)",
        } as React.CSSProperties}
      >
        {/* header */}
        <div
          style={{
            position: "relative",
            padding: "28px 28px 20px",
            borderBottom: `1px solid ${C.line}`,
            background: `linear-gradient(135deg, ${C.brandTint} 85%, ${C.card})`,
            flex: "none",
            colorScheme: "light",
          }}
        >
          {/* subtle pattern */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.04,
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E")`,
              pointerEvents: "none",
            }}
          />
          <div style={{ position: "relative", display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div
              aria-hidden
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                display: "grid",
                placeItems: "center",
                background: `linear-gradient(135deg, ${C.brand}, ${C.brandDeep2})`,
                color: "white",
                flex: "none",
                boxShadow: `0 8px 20px ${C.brandGlow}`,
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
                <path d="M10 13H8" />
                <path d="M16 17H8" />
                <path d="M13 13h3" />
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3
                style={{
                  fontFamily: "'El Messiri', serif",
                  fontSize: "clamp(20px, 3.4vw, 26px)",
                  lineHeight: 1.25,
                  fontWeight: 800,
                  color: C.brandDeep,
                  margin: 0,
                  letterSpacing: "-0.02em",
                }}
              >
                {title}
              </h3>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 8, flexWrap: "wrap" }}>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: C.accentDeep,
                    background: "rgba(198,161,91,0.14)",
                    border: "1px solid rgba(198,161,91,0.18)",
                    padding: "4px 10px",
                    borderRadius: 999,
                  }}
                >
                  وثيقة قانونية
                </span>
                <span style={{ fontSize: 13, color: C.muted, fontWeight: 600 }}>
                  آخر تحديث: {updatedAt || "غشت 2026"}
                </span>
                <span style={{ width: 4, height: 4, borderRadius: 999, background: C.lineStrong, display: "inline-block" }} />
                <span style={{ fontSize: 13, color: C.muted }}>قراءة 3 دقائق</span>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="إغلاق"
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                border: `1px solid ${C.lineSoft}`,
                background: "#FFFFFF",
                display: "grid",
                placeItems: "center",
                color: C.ink,
                cursor: "pointer",
                flex: "none",
                transition: "all .2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = C.brandDeep;
                (e.currentTarget as HTMLButtonElement).style.color = "white";
                (e.currentTarget as HTMLButtonElement).style.borderColor = C.brandDeep;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#FFFFFF";
                (e.currentTarget as HTMLButtonElement).style.color = C.ink;
                (e.currentTarget as HTMLButtonElement).style.borderColor = C.lineSoft;
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          {/* progress */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 3,
              background: C.line,
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${scrollProgress * 100}%`,
                background: `linear-gradient(90deg, ${C.brand}, ${C.accent})`,
                transition: "width 120ms linear",
                borderRadius: "0 999px 999px 0",
              }}
            />
          </div>
        </div>

        {/* body — always light, readable */}
        <div
          ref={scrollRef}
          style={{
            flex: 1,
            overflow: "auto",
            padding: "28px",
            overscrollBehavior: "contain",
            scrollbarWidth: "thin",
            scrollbarColor: `${C.brand} transparent`,
            background: C.card,
            colorScheme: "light",
          } as React.CSSProperties}
          className="legal-scroll"
        >
          <div
            className="legal-prose"
            style={{
              fontFamily: "Tajawal, sans-serif",
              fontSize: 15,
              lineHeight: 1.85,
              color: C.ink,
              colorScheme: "light",
            }}
            dangerouslySetInnerHTML={{ __html: body }}
          />
          <style>{`
            /* Force light mode inside popup — overrides global .dark and prefers-color-scheme */
            .legal-modal-root, .legal-modal-root * { color-scheme: light !important; }
            .legal-prose { color: #122A20 !important; background: transparent !important; }
            .legal-prose h1, .legal-prose h2 { font-family: 'El Messiri', serif; font-size: 20px; font-weight: 800; color: #07231A !important; margin: 26px 0 12px; line-height: 1.35; }
            .legal-prose h2:first-child, .legal-prose h1:first-child { margin-top: 0; }
            .legal-prose h3 { font-family: 'El Messiri', serif; font-size: 17px; font-weight: 800; color: #07231A !important; margin: 22px 0 10px; }
            .legal-prose h4, .legal-prose h5, .legal-prose h6 { color: #07231A !important; }
            .legal-prose p { color: #3A4A44 !important; margin: 0 0 14px; }
            .legal-prose p b, .legal-prose p strong, .legal-prose strong, .legal-prose b { color: #07231A !important; font-weight: 800; }
            .legal-prose span { color: inherit; }
            .legal-prose a { color: #1E7A57 !important; font-weight: 700; text-decoration: underline; text-underline-offset: 3px; }
            .legal-prose a:hover { color: #07231A !important; }
            .legal-prose ul, .legal-prose ol { margin: 12px 0 16px; padding-inline-start: 22px; }
            .legal-prose li { margin: 6px 0; color: #3A4A44 !important; }
            .legal-prose li::marker { color: #C6A15B !important; }
            .legal-prose blockquote { margin: 18px 0; padding: 14px 16px; background: #EAF4EE !important; border-inline-start: 3px solid #1E7A57 !important; border-radius: 12px; color: #07231A !important; font-weight: 600; }
            .legal-prose hr { border: none; height: 1px; background: rgba(23,64,47,.08) !important; margin: 22px 0; }
            .legal-prose code { font-family: ui-monospace, SFMono-Regular, monospace; font-size: 13px; background: #EAF4EE !important; color: #07231A !important; padding: 2px 6px; border-radius: 6px; border: 1px solid rgba(23,64,47,.06); }
            .legal-prose pre { background: #F7F3E8 !important; color: #122A20 !important; border: 1px solid rgba(23,64,47,.08); border-radius: 12px; padding: 14px; overflow: auto; }
            .legal-prose table { border-collapse: collapse; width: 100%; margin: 16px 0; background: white !important; border-radius: 12px; overflow: hidden; border: 1px solid rgba(23,64,47,.08); }
            .legal-prose th { background: #EAF4EE !important; color: #07231A !important; font-weight: 800; text-align: start; padding: 10px 12px; border-bottom: 1px solid rgba(23,64,47,.08); }
            .legal-prose td { padding: 10px 12px; color: #3A4A44 !important; border-bottom: 1px solid rgba(23,64,47,.06); background: white !important; }
            .legal-prose img { border-radius: 12px; max-width: 100%; }
            .legal-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
            .legal-scroll::-webkit-scrollbar-track { background: transparent; }
            .legal-scroll::-webkit-scrollbar-thumb { background: rgba(30,122,87,0.22); border-radius: 999px; border: 2px solid transparent; background-clip: content-box; }
            .legal-scroll::-webkit-scrollbar-thumb:hover { background: rgba(30,122,87,0.34); background-clip: content-box; }
            @keyframes legalIn { from { opacity: 0; transform: translateY(10px) scale(.98); } to { opacity: 1; transform: none; } }
            @media (prefers-color-scheme: dark) {
              .legal-prose, .legal-prose p, .legal-prose li, .legal-prose td { color: #3A4A44 !important; }
              .legal-prose h2, .legal-prose h3 { color: #07231A !important; }
            }
          `}</style>
        </div>

        {/* footer — always light */}
        <div
          style={{
            padding: "16px 28px",
            borderTop: `1px solid ${C.line}`,
            background: "#FFFFFF",
            display: "flex",
            gap: 12,
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            colorScheme: "light",
          }}
        >
          <span style={{ fontSize: 12, color: C.muted, fontWeight: 600, display: "inline-flex", gap: 6, alignItems: "center" }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: C.brand, display: "inline-block" }} />
            SODFA • وثيقة محمية • تُطبّق الشروط العامة
          </span>
          <button
            onClick={onClose}
            style={{
              padding: "10px 18px",
              borderRadius: 999,
              border: `1px solid ${C.lineSoft}`,
              background: C.brandDeep,
              color: "white",
              fontWeight: 800,
              fontSize: 13,
              cursor: "pointer",
              boxShadow: "0 8px 20px rgba(7,35,26,.18)",
            }}
          >
            فهمت، إغلاق
          </button>
        </div>
      </div>

      <style>{` .legal-modal-root { animation: legalFade 260ms ease; } @keyframes legalFade { from { opacity: 0; } to { opacity: 1; } } `}</style>
    </div>
  );

  if (!mounted) return null;
  return createPortal(content, document.body);
}
