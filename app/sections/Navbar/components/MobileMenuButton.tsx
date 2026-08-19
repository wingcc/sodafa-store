"use client";

import { useUI } from "../../../contexts/UIContext";
import { useLanguage } from "../../../contexts/LanguageContext";

export const MobileMenuButton = () => {
  const { isMobileMenuOpen, toggleMobileMenu } = useUI();
  const { locale } = useLanguage();

  const ariaLabel =
    locale === "ar"
      ? isMobileMenuOpen
        ? "إغلاق القائمة"
        : "فتح القائمة"
      : isMobileMenuOpen
      ? "Close menu"
      : "Open menu";

  return (
    <button
      onClick={toggleMobileMenu}
      aria-label={ariaLabel}
      aria-expanded={isMobileMenuOpen}
      className="relative flex flex-col items-end justify-center w-8 h-8 md:hidden gap-y-1.5 p-0 z-50 bg-transparent group"
    >
      {/* Line 1 – top */}
      <span
        className={`block h-0.5 rounded-sm bg-teal-950 dark:bg-stone-200 transition-all duration-300 ease-in-out origin-center ${
          isMobileMenuOpen
            ? "w-6 translate-y-[7px] rotate-45"
            : "w-6 -translate-y-0 rotate-0"
        }`}
      />
      {/* Line 2 – middle */}
      <span
        className={`block h-0.5 rounded-sm bg-teal-950 dark:bg-stone-200 transition-all duration-300 ease-in-out origin-center ${
          isMobileMenuOpen
            ? "w-0 opacity-0"
            : "w-6 opacity-100"
        }`}
      />
      {/* Line 3 – bottom */}
      <span
        className={`block h-0.5 rounded-sm bg-teal-950 dark:bg-stone-200 transition-all duration-300 ease-in-out origin-center ${
          isMobileMenuOpen
            ? "w-6 -translate-y-[7px] -rotate-45"
            : "w-6 translate-y-0 rotate-0"
        }`}
      />
    </button>
  );
};