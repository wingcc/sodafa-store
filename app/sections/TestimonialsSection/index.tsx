"use client";
import React, { useRef, useEffect, useCallback } from "react";
import { StarRating } from "../common/icons";
import type { TestimonialItem } from "../common/types";

interface TestimonialsSectionProps {
  testimonials: TestimonialItem[];
  stats?: { count: number; pre?: string; suf?: string; label: string }[];
}

export default function TestimonialsSection({ testimonials, stats }: TestimonialsSectionProps) {
  // Get customer count from stats config
  const customerCount = stats?.[0]?.count || 8500;
  const customerPre = stats?.[0]?.pre || "+";

  const total = testimonials.length;

  const vpRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const idxRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const perView = () =>
    typeof window !== "undefined"
      ? window.innerWidth >= 1024
        ? 3
        : window.innerWidth >= 640
          ? 2
          : 1
      : 3;

  const apply = useCallback((anim = true) => {
    const track = trackRef.current;
    if (!track) return;
    if (anim === false) track.classList.add("noanim");
    track.style.transform = `translateX(${idxRef.current * (100 / perView())}%)`;
    if (anim === false) {
      void track.offsetWidth; // force reflow so the jump is not animated
      track.classList.remove("noanim");
    }
  }, []);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      idxRef.current += 1;
      apply();
    }, 4000);
  }, [apply]);

  useEffect(() => {
    if (total === 0) return;
    apply(false);
    resetTimer();
    const onResize = () => {
      idxRef.current = 0;
      apply(false);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [total, apply, resetTimer]);

  const pauseAuto = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const onNext = () => {
    idxRef.current += 1;
    apply();
    resetTimer();
  };

  const onPrev = () => {
    idxRef.current = (idxRef.current - 1 + total * 2) % total;
    apply();
    resetTimer();
  };

  if (total === 0) return null;

  return (
    <div>
      <div className="wrap">
        <div className="tst-head rv">
          <div className="sec-head">
            <span className="eyebrow">آراء زبوناتنا</span>
            <h2>ثقتهنّ شرفنا</h2>
            <p style={{ marginTop: ".2rem" }}>تجارب حقيقية من عميلاتنا في مختلف المدن</p>
          </div>

          <div className="tst-nav">
            <button className="tst-btn" id="tstPrev" aria-label="السابق" onClick={onPrev}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button className="tst-btn solid" id="tstNext" aria-label="التالي" onClick={onNext}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div
          className="tst-viewport rv"
          data-d="120"
          id="tstViewport"
          ref={vpRef}
          onMouseEnter={pauseAuto}
          onMouseLeave={resetTimer}
        >
          <div className="tst-track" id="tstTrack" ref={trackRef}>
            {[0, 1].map((c) =>
              testimonials.map((t, i) => (
                <div key={`${c}-${i}`} className="tst-slide">
                  <div className="tst-card">
                    <span className="quote"></span>
                    <div className="tst-stars">
                      <StarRating rating={t.stars ?? t.rating ?? 5} size={15} id={`tst-${c}-${i}`} />
                    </div>
                    <p>{t.text}</p>
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
              ))
            )}
          </div>
        </div>

        <p className="tst-count rv" data-d="200">
          ⭐ أكثر من <b>{customerPre}{customerCount.toLocaleString("ar-MA")}</b> عميلة سعيدة — وهذه مجرد عيّنة من آرائهنّ
        </p>
      </div>
    </div>
  );
}