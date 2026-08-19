"use client";
import React, { useState, useEffect } from "react";

export default function ScrollProgress() {
  const [w, setW] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      setW(Math.min(100, pct));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return <div id="progress" style={{ width: w + "%" }} />;
}
