"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { StarRating } from "../common/icons";
import type { TestimonialItem } from "../common/types";

interface TestimonialsSectionProps {
  testimonials: TestimonialItem[];
  stats?: { count: number; pre?: string; suf?: string; label: string }[];
}

const VISIBLE = 3;

export default function TestimonialsSection({ testimonials, stats }: TestimonialsSectionProps) {
  // Get customer count from stats config
  const customerCount = stats?.[0]?.count || 8500;
  const customerPre = stats?.[0]?.pre || "+";
  const [offset, setOffset] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const total = testimonials.length;

  const max = Math.max(0, total - VISIBLE);

  const prev = useCallback(() => setOffset((o) => Math.max(0, o - 1)), []);
  const next = useCallback(() => setOffset((o) => Math.min(max, o + 1)), [max]);

  useEffect(() => {
    if (!trackRef.current) return;
    // scroll the track
    const cardWidth = trackRef.current.children[0]?.getBoundingClientRect().width || 0;
    const gap = 24;
    trackRef.current.style.transform = `translateX(${offset * (cardWidth + gap)}px)`;
  }, [offset]);

  return (
    <section id="reviews">
      <div className="wrap">
        <div className="tst-head rv">
          <div className="sec-head">
            <span className="eyebrow">آراء زبوناتنا</span>
            <h2>ثقتهنّ شرفنا</h2>
            <p style={{ marginTop: ".2rem" }}>تجارب حقيقية من عميلاتنا في مختلف المدن</p>
          </div>

          <div className="tst-nav">
            <button className="tst-btn" id="tstPrev" aria-label="السابق" onClick={prev} disabled={offset === 0}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button className="tst-btn solid" id="tstNext" aria-label="التالي" onClick={next} disabled={offset >= max}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="tst-viewport rv" data-d="120" id="tstViewport">
          <div className="tst-track" id="tstTrack" ref={trackRef}>
            {testimonials.map((t, i) => (
              <div key={i} className="tst-slide">
                <div className="tst-card">
                  <span className="quote">"</span>
                  <div className="tst-stars">
                    <StarRating rating={t.stars ?? t.rating ?? 5} size={15} id={`tst-${i}`} />
                  </div>
                  <p>"{t.text}"</p>
                  <div className="tst-who">
                    <span className="av">{t.initial}</span>
                    <div>
                      <span className="nm">{t.name}</span>
                      {t.city && (
                        <span className="loc">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          {t.city}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="tst-count rv" data-d="200">
          ⭐ أكثر من <b>{customerPre}{customerCount.toLocaleString("ar-MA")}</b> عميلة سعيدة — وهذه مجرد عيّنة من آرائهنّ
        </p>
      </div>
    </section>
  );
}