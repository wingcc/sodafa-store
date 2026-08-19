"use client";

import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";

export const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full text-white transition-all duration-300 md:bottom-10 md:right-10"
      style={{
        background: 'linear-gradient(135deg, #0b2e22, #0d3428)',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(205, 165, 82, 0.25)',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.8)',
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
    >
      <ChevronUp className="w-5 h-5" />
    </button>
  );
};