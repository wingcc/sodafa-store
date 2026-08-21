"use client";
import React, { useRef, useCallback, useEffect, useState } from "react";
import type { CaseItem } from "../common/types";

interface CasesSectionProps {
  cases: CaseItem[];
}

const STAR = '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.6 7.1.7-5.4 4.8 1.6 7L12 17.4 5.8 21l1.6-7L2 9.3l7.1-.7z"/></svg>';

function CaseCard({ item, index }: { item: CaseItem; index: number }) {
  const baRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const handleMove = useCallback((clientX: number) => {
    if (!baRef.current) return;
    const rect = baRef.current.getBoundingClientRect();
    const pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    baRef.current.style.setProperty("--pos", pct + "%");
    const before = baRef.current.querySelector(".before") as HTMLElement;
    if (before) before.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    const handle = baRef.current.querySelector(".handle") as HTMLElement;
    if (handle) handle.style.left = pct + "%";
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    handleMove(e.clientX);
  }, [handleMove]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    handleMove(e.clientX);
  }, [handleMove]);

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  return (
    <article className="case rv" data-d={index * 120}>
      <div className="ba" ref={baRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <img className="after" src={item.after} alt={item.afterAlt || "بعد الاستخدام"} loading="lazy" />
        <img className="before" src={item.before} alt={item.beforeAlt || "قبل الاستخدام"} loading="lazy" style={{ clipPath: "inset(0 50% 0 0)" }} />
        <span className="tag b">{item.beforeTag}</span>
        <span className="tag a">{item.afterTag}</span>
        <div className="handle" style={{ left: "50%" }}>
          <div className="knob" tabIndex={0} aria-label="اسحب للمقارنة">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M8 7l-5 5 5 5M16 7l5 5-5 5" />
            </svg>
          </div>
        </div>
        <span className="hint">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <path d="M8 7l-5 5 5 5M16 7l5 5-5 5" />
          </svg>
          اسحب للمقارنة
        </span>
      </div>
      <div className="case-body">
        <div className="who">
          <h3>{item.name}</h3>
          <span>{item.period}</span>
        </div>
        <blockquote>"{item.quote}"</blockquote>
        <div className="stars" dangerouslySetInnerHTML={{ __html: STAR.repeat(5) }} />
      </div>
    </article>
  );
}

export default function CasesSection({ cases }: CasesSectionProps) {
  return (
    <div>
      <div className="wrap">
        <div className="sec-head rv">
          <span className="eyebrow">نتائج حقيقية قبل وبعد</span>
          <h2>شاهدوا التحول المذهل بعد شهرين من الاستخدام المنتظم</h2>
          <p>اسحب المؤشر يميناً ويساراً لمقارنة النتائج بنفسك.</p>
        </div>
        <div className="case-grid">
          {cases.map((item, i) => (
            <CaseCard key={i} item={item} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
