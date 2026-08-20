"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
import type { OilItem } from "../common/types";

interface OilsSectionProps {
  oils: OilItem[];
}

const FIRST_COUNT = 4;
const COLLAPSED_TXT = "إظهار المزيد من الزيوت";
const EXPANDED_TXT = "إخفاء الزيوت";
const ANIM_MS = 780;
const OIL_COUNT_LABEL = "16";

const CHECK = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M20 6L9 17l-5-5"/></svg>';

const delays = [0, 100, 150, 200];

export default function OilsSection({ oils }: OilsSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const first = oils.slice(0, FIRST_COUNT);
  const rest = oils.slice(FIRST_COUNT);
  const hasExtra = rest.length > 0;

  const toggle = useCallback(() => {
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    setExpanded((prev) => {
      const next = !prev;
      const more = moreRef.current;
      const btn = btnRef.current;
      const label = btn?.querySelector(".ot-label");
      const arrow = btn?.querySelector(".ot-arrow");
      if (!more) return next;

      if (reduceMotion) {
        more.style.display = next ? "block" : "none";
      } else {
        if (next) {
          more.setAttribute("aria-hidden", "false");
          more.style.display = "block";
          const h = more.scrollHeight;
          more.style.maxHeight = "0px";
          more.style.overflow = "hidden";
          more.style.transition = "none";
          requestAnimationFrame(() => {
            more.style.transition = `max-height ${ANIM_MS}ms cubic-bezier(.16,1,.3,1), opacity ${ANIM_MS}ms`;
            more.style.maxHeight = h + "px";
            more.style.opacity = "1";
          });
        } else {
          more.style.transition = `max-height ${ANIM_MS}ms cubic-bezier(.16,1,.3,1), opacity ${ANIM_MS}ms`;
          more.style.maxHeight = "0px";
          more.style.opacity = "0";
          setTimeout(() => {
            more.style.display = "none";
            more.setAttribute("aria-hidden", "true");
          }, ANIM_MS);
        }
      }

      if (btn) btn.setAttribute("aria-expanded", String(next));
      if (arrow) (arrow as HTMLElement).style.transform = next ? "rotate(180deg)" : "";
      if (label) label.textContent = next ? EXPANDED_TXT : COLLAPSED_TXT;

      // Pin button
      if (!reduceMotion && next) {
        const target = btn?.getBoundingClientRect().top;
        if (target != null) {
          const t0 = performance.now();
          const frame = (t: number) => {
            const y = btn?.getBoundingClientRect().top;
            const d = y! - target;
            if (d > 1 || d < -1) {
              try { window.scrollBy({ top: d, left: 0, behavior: "instant" }); } catch (e) { window.scrollBy(0, d); }
              requestAnimationFrame(frame);
            }
          };
          requestAnimationFrame(frame);
        }
      }

      return next;
    });
  }, []);

  // Initialize more section hidden
  useEffect(() => {
    if (moreRef.current && hasExtra) {
      moreRef.current.style.display = "none";
    }
  }, [hasExtra]);

  return (
    <section id="oils">
      <div className="wrap">
        <div className="sec-head rv">
          <span className="eyebrow">المكونات الطبيعية</span>
          <h2>تركيبة غنية من {OIL_COUNT_LABEL} زيتاً طبيعياً لشعر أكثر صحة</h2>
          <p>
            تجمع التشكيلة بين {OIL_COUNT_LABEL} زيتاً طبيعياً مختاراً بعناية، تعمل معاً لتغذية الشعر وترطيب فروة الرأس والعناية به من الجذور حتى الأطراف.
          </p>
        </div>

        <div className="oils-grid">
          {first.map((oil, i) => (
            <OilCard key={i} oil={oil} delay={delays[i] != null ? delays[i] : i * 100} />
          ))}
        </div>

        {hasExtra && (
          <div className="oils-more" id="oilsMore" data-more ref={moreRef} aria-hidden="true">
            <div className="oils-more-in">
              <div className="oils-grid oils-grid--more">
                {rest.map((oil, i) => (
                  <OilCard key={FIRST_COUNT + i} oil={oil} delay={Math.min(i * 55, 660)} extra />
                ))}
              </div>
            </div>
          </div>
        )}

        {hasExtra && (
          <div className="oils-cta">
            <button
              type="button"
              className="oils-toggle"
              id="oilsToggle"
              data-oils-toggle
              aria-expanded="false"
              aria-controls="oilsMore"
              ref={btnRef}
              onClick={toggle}
            >
              <span className="ot-label" data-oils-label>{COLLAPSED_TXT}</span>
              <span className="ot-arrow" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function OilCard({ oil, delay, extra }: { oil: OilItem; delay: number; extra?: boolean }) {
  return (
    <article
      className={"oil-card" + (extra ? "" : " rv")}
      {...(extra ? { style: { "--d": delay + "ms" } as React.CSSProperties } : { "data-d": delay })}
    >
      <div className="oil-img">
        <span className="oil-num">{oil.num}</span>
        <img loading="lazy" src={oil.img} alt={oil.name} />
      </div>
      <div className="oil-body">
        <h3>{oil.name} <small>{oil.latin}</small></h3>
        <ul>
          {oil.points.map((pt, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: CHECK + pt }} />
          ))}
        </ul>
        <span className="oil-tag">{oil.tag}</span>
      </div>
    </article>
  );
}