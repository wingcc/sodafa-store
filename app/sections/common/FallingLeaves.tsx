"use client";
import React, { useEffect, useRef } from "react";

const LEAF_SVG =
  '<svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%"><path d="M12 2C6.5 7.5 4.5 11.5 6.3 16c1.5 3.8 5.7 6 5.7 6s4.2-2.2 5.7-6c1.8-4.5-.2-8.5-5.7-14z"/></svg>';
const FLOWER_SVG =
  '<svg viewBox="0 0 24 24" width="100%" height="100%"><g fill="currentColor"><circle cx="12" cy="5" r="3.1"/><circle cx="18.7" cy="9.9" r="3.1"/><circle cx="16.1" cy="17.6" r="3.1"/><circle cx="7.9" cy="17.6" r="3.1"/><circle cx="5.3" cy="9.9" r="3.1"/></g><circle cx="12" cy="12" r="2.5" fill="#C6A15B"/></svg>';

/* Page-wide falling leaves & flowers (test.24.html fallZone, promoted from
   hero-scoped to full page): two fixed layers for depth —
   - #fallZoneBack  sits BEHIND section content (z-index 0)
   - #fallZoneFront floats ABOVE the content (z-index 55, below the navbar) */
const BACK_COUNT = 11;
const FRONT_COUNT = 7;

export default function FallingLeaves() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || root.dataset.seeded) return;
    const rnd = (a: number, b: number) => a + Math.random() * (b - a);

    const seed = (zone: HTMLElement, count: number, startIndex: number) => {
      for (let i = 0; i < count; i++) {
        const el = document.createElement("span");
        const isFlower = (startIndex + i) % 4 === 3;
        el.className = "faller" + (isFlower ? " flower" : "");
        const sz = isFlower ? rnd(12, 20) : rnd(14, 28);
        el.style.width = sz + "px";
        el.style.height = sz + "px";
        el.style.right = rnd(2, 98) + "%";
        el.style.opacity = (isFlower ? rnd(0.35, 0.6) : rnd(0.22, 0.5)).toFixed(2);
        const dur = rnd(9, 18);
        el.style.animationDuration = dur + "s";
        el.style.animationDelay = -rnd(0, dur) + "s";
        el.innerHTML = isFlower ? FLOWER_SVG : LEAF_SVG;
        zone.appendChild(el);
      }
    };

    seed(root.querySelector<HTMLDivElement>("#fallZoneBack")!, BACK_COUNT, 0);
    seed(root.querySelector<HTMLDivElement>("#fallZoneFront")!, FRONT_COUNT, BACK_COUNT);
    root.dataset.seeded = "true";
  }, []);

  return (
    <div ref={rootRef} aria-hidden="true">
      <div id="fallZoneBack" className="fall-zone" />
      <div id="fallZoneFront" className="fall-zone" />
    </div>
  );
}
