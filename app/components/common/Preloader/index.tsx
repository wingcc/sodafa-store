"use client";
import React, { useEffect, useState } from "react";

/**
 * Unified Preloader Component
 * 
 * Self-contained with inline styles - works in any layout.
 * Usage: <Preloader />
 * 
 * Features:
 * - Full-screen overlay with dark background
 * - Spinning logo animation
 * - Fades out after 2 seconds
 * - No external CSS dependencies
 */
export default function Preloader() {
  const [done, setDone] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDone(true), 2000);
    const hideTimer = setTimeout(() => setHidden(true), 2600);
    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (hidden) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#07231A",
        display: "grid",
        placeItems: "center",
        opacity: done ? 0 : 1,
        visibility: done ? "hidden" : "visible",
        pointerEvents: done ? "none" : "auto",
        transition: "opacity 0.6s ease, visibility 0.6s ease",
      }}
      aria-hidden="true"
    >
      {/* Spinning ring */}
      <div
        style={{
          position: "relative",
          width: 76,
          height: 76,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "3px solid rgba(198, 161, 91, 0.25)",
            borderTopColor: "#C6A15B",
            animation: "sodfa-spin 1s linear infinite",
          }}
        />
        {/* Logo letter */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            fontFamily: "'El Messiri', sans-serif",
            color: "#E8CE93",
            fontSize: "1.6rem",
            fontWeight: 700,
          }}
        >
          <b>ص</b>
        </div>
      </div>

      {/* Spin animation keyframes */}
      <style>{`
        @keyframes sodfa-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
