"use client";
import { useEffect } from "react";

/**
 * ForceLight — ensures website/store are ALWAYS light mode (no dark).
 * Runs only after hydration (useEffect) so it never causes hydration mismatch.
 * The dashboard keeps its own dark support via usePreferencesStore.
 * LegalModal is already hardcoded light (app/sections/common/LegalModal.tsx:12),
 * this just prevents the rest of the site from flashing dark if system prefers dark.
 */
export default function ForceLight() {
  useEffect(() => {
    const root = document.documentElement;

    const enforceLight = () => {
      if (root.classList.contains("dark")) root.classList.remove("dark");
      try {
        const stored = localStorage.getItem("app_theme_mode");
        if (stored === "dark") localStorage.setItem("app_theme_mode", "light");
      } catch {}
    };

    enforceLight();

    // Watch for ThemeProvider re-adding `dark` after mount
    const obs = new MutationObserver(enforceLight);
    obs.observe(root, { attributes: true, attributeFilter: ["class"] });

    const onStorage = () => enforceLight();
    window.addEventListener("storage", onStorage);

    return () => {
      obs.disconnect();
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return null;
}
