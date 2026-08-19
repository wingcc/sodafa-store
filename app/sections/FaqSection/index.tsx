"use client";
import React, { useState, useRef, useCallback } from "react";
import type { FaqItem } from "../common/types";

interface FaqSectionProps {
  faq: FaqItem[];
}

export default function FaqSection({ faq }: FaqSectionProps) {
  const [open, setOpen] = useState<number | null>(null);
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  const toggle = useCallback((i: number) => {
    setOpen((prev) => {
      if (prev === i) return null;
      return i;
    });
  }, []);

  // Set maxHeight via ref to match original JS behavior
  React.useEffect(() => {
    refs.current.forEach((el, i) => {
      if (el) {
        if (open === i) {
          el.style.maxHeight = el.scrollHeight + "px";
        } else {
          el.style.maxHeight = "";
        }
      }
    });
  }, [open]);

  return (
    <section id="faq">
      <div className="wrap">
        <div className="sec-head rv">
          <span className="eyebrow">الأسئلة الشائعة</span>
          <h2>كل ما تحتاج معرفته قبل الطلب</h2>
        </div>

        <div className="faq-list">
          {faq.map((item, i) => (
            <div
              key={i}
              className={"faq-item rv" + (open === i ? " open" : "")}
              data-d={i * 60}
            >
              <button
                className="faq-q"
                aria-expanded={open === i}
                onClick={() => toggle(i)}
              >
                <span>{item.q}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
              <div className="faq-a" ref={(el) => { refs.current[i] = el; }}>
                <p>{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
