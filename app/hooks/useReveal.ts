"use client";

import { useEffect, useRef } from "react";

export function useReveal() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const els = container.querySelectorAll<HTMLDivElement>(".rv");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const delay = parseInt(el.getAttribute("data-d") || "0", 10);
            setTimeout(() => {
              el.classList.add("in");
            }, delay);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    els.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return containerRef;
}

export function useGlobalReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLDivElement>(".rv");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const delay = parseInt(el.getAttribute("data-d") || "0", 10);
            setTimeout(() => {
              el.classList.add("in");
            }, delay);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    els.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}
