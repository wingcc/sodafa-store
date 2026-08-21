"use client";
import React, { useState, useCallback } from "react";
import type { FaqItem } from "../common/types";

interface FaqSectionProps {
  faq: FaqItem[];
}

export default function FaqSection({ faq }: FaqSectionProps) {
  const [open, setOpen] = useState<number | null>(null);

  const toggle = useCallback((i: number) => {
    setOpen((prev) => (prev === i ? null : i));
  }, []);

  return (
    <div>
      <div className="wrap">
        <div className="sec-head rv">
          <span className="eyebrow">الأسئلة الشائعة</span>
          <h2>كل ما تحتاج معرفته قبل الطلب</h2>
        </div>

        <div className="faq-list">
          {faq.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className={"faq-item" + (isOpen ? " open" : "")}
              >
                <button
                  type="button"
                  className="faq-q"
                  aria-expanded={isOpen}
                  onClick={() => toggle(i)}
                >
                  <span className="faq-q-text">{item.q}</span>
                  <span className="faq-icon" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                </button>
                <div className="faq-a-wrap" aria-hidden={!isOpen}>
                  <div className="faq-a">
                    <p>{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
