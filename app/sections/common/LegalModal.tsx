"use client";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface LegalModalProps {
  title: string;
  body: string;
  updatedAt?: string;
  onClose: () => void;
}

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
      }}
    >
      {/* overlay */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: "color-mix(in srgb, var(--brand-deep, #07231A) 72%, black)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      />

      {/* box */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "760px",
          maxHeight: "88vh",
          background: "var(--card, #FFFDF8)",
          borderRadius: "28px",
          boxShadow: "0 32px 80px rgba(7,35,26,.35), 0 8px 32px rgba(7,35,26,.18)",
          border: "1px solid color-mix(in srgb, var(--line, rgba(23,64,47,.15)) 80%, transparent)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation: "legalIn 420ms cubic-bezier(.16,1,.3,1)",
        }}
      >
        {/* header */}
        <div
          style={{
            position: "relative",
            padding: "28px 28px 20px",
            borderBottom: "1px solid var(--line, rgba(23,64,47,.08))",
            background: "linear-gradient(135deg, color-mix(in srgb, var(--brand-tint, #EAF4EE) 85%, white), var(--card, #FFFDF8))",
            flex: "none",
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
                background: "linear-gradient(135deg, var(--brand, #1E7A57), var(--brand-deep2, #11402F))",
                color: "white",
                flex: "none",
                boxShadow: "0 8px 20px var(--brand-glow, rgba(30,122,87,.25))",
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
                  fontFamily: "var(--disp, 'El Messiri', serif)",
                  fontSize: "clamp(20px, 3.4vw, 26px)",
                  lineHeight: 1.25,
                  fontWeight: 800,
                  color: "var(--brand-deep, #07231A)",
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
                    color: "var(--accent-deep, #9C7C3E)",
                    background: "color-mix(in srgb, var(--accent, #C6A15B) 14%, transparent)",
                    border: "1px solid color-mix(in srgb, var(--accent, #C6A15B) 18%, transparent)",
                    padding: "4px 10px",
                    borderRadius: 999,
                  }}
                >
                  وثيقة قانونية
                </span>
                <span style={{ fontSize: 13, color: "var(--muted, #5A6B5F)", fontWeight: 600 }}>
                  آخر تحديث: {updatedAt || "غشت 2026"}
                </span>
                <span style={{ width: 4, height: 4, borderRadius: 999, background: "var(--line)", display: "inline-block" }} />
                <span style={{ fontSize: 13, color: "var(--muted, #5A6B5F)" }}>قراءة 3 دقائق</span>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="إغلاق"
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                border: "1px solid var(--line, rgba(23,64,47,.12))",
                background: "white",
                display: "grid",
                placeItems: "center",
                color: "var(--ink, #122A20)",
                cursor: "pointer",
                flex: "none",
                transition: "all .2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "var(--brand-deep, #07231A)";
                (e.currentTarget as HTMLButtonElement).style.color = "white";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--brand-deep)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "white";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--ink, #122A20)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--line, rgba(23,64,47,.12))";
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
              background: "var(--line, rgba(23,64,47,.08))",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${scrollProgress * 100}%`,
                background: "linear-gradient(90deg, var(--brand, #1E7A57), var(--accent, #C6A15B))",
                transition: "width 120ms linear",
                borderRadius: "0 999px 999px 0",
              }}
            />
          </div>
        </div>

        {/* body */}
        <div
          ref={scrollRef}
          style={{
            flex: 1,
            overflow: "auto",
            padding: "28px",
            overscrollBehavior: "contain",
            scrollbarWidth: "thin",
            scrollbarColor: "var(--brand, #1E7A57) transparent",
          } as React.CSSProperties}
          className="legal-scroll"
        >
          <div
            className="legal-prose"
            // content comes from TipTap / dashboard editor — keep typography editorial
            style={{
              fontFamily: "var(--body, Tajawal, sans-serif)",
              fontSize: 15,
              lineHeight: 1.85,
              color: "var(--ink, #122A20)",
            }}
            dangerouslySetInnerHTML={{ __html: body }}
          />
          <style>{`
            .legal-prose h2 { font-family: var(--disp, 'El Messiri', serif); font-size: 20px; font-weight: 800; color: var(--brand-deep, #07231A); margin: 26px 0 12px; line-height: 1.35; }
            .legal-prose h2:first-child { margin-top: 0; }
            .legal-prose h3 { font-family: var(--disp, 'El Messiri', serif); font-size: 17px; font-weight: 800; color: var(--brand-deep, #07231A); margin: 22px 0 10px; }
            .legal-prose p { color: var(--muted, #3A4A44); margin: 0 0 14px; }
            .legal-prose p b, .legal-prose p strong { color: var(--brand-deep, #07231A); font-weight: 800; }
            .legal-prose a { color: var(--brand, #1E7A57); font-weight: 700; text-decoration: underline; text-underline-offset: 3px; }
            .legal-prose a:hover { color: var(--brand-deep, #07231A); }
            .legal-prose ul, .legal-prose ol { margin: 12px 0 16px; padding-inline-start: 22px; }
            .legal-prose li { margin: 6px 0; color: var(--muted, #3A4A44); }
            .legal-prose li::marker { color: var(--accent, #C6A15B); }
            .legal-prose blockquote { margin: 18px 0; padding: 14px 16px; background: color-mix(in srgb, var(--brand-tint, #EAF4EE) 70%, white); border-inline-start: 3px solid var(--brand, #1E7A57); border-radius: 12px; color: var(--brand-deep, #07231A); font-weight: 600; }
            .legal-prose hr { border: none; height: 1px; background: var(--line, rgba(23,64,47,.08)); margin: 22px 0; }
            .legal-prose code { font-family: ui-monospace, SFMono-Regular, monospace; font-size: 13px; background: var(--brand-tint, #EAF4EE); padding: 2px 6px; border-radius: 6px; }
            .legal-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
            .legal-scroll::-webkit-scrollbar-track { background: transparent; }
            .legal-scroll::-webkit-scrollbar-thumb { background: color-mix(in srgb, var(--brand, #1E7A57) 22%, transparent); border-radius: 999px; border: 2px solid transparent; background-clip: content-box; }
            .legal-scroll::-webkit-scrollbar-thumb:hover { background: color-mix(in srgb, var(--brand, #1E7A57) 34%, transparent); background-clip: content-box; }
            @keyframes legalIn { from { opacity: 0; transform: translateY(10px) scale(.98); } to { opacity: 1; transform: none; } }
          `}</style>
        </div>

        {/* footer */}
        <div
          style={{
            padding: "16px 28px",
            borderTop: "1px solid var(--line, rgba(23,64,47,.08))",
            background: "color-mix(in srgb, var(--bg, #F7F3E8) 70%, white)",
            display: "flex",
            gap: 12,
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 12, color: "var(--muted, #5A6B5F)", fontWeight: 600, display: "inline-flex", gap: 6, alignItems: "center" }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--brand, #1E7A57)", display: "inline-block" }} />
            SODFA • وثيقة محمية • تُطبّق الشروط العامة
          </span>
          <button
            onClick={onClose}
            style={{
              padding: "10px 18px",
              borderRadius: 999,
              border: "1px solid var(--line, rgba(23,64,47,.12))",
              background: "var(--brand-deep, #07231A)",
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
