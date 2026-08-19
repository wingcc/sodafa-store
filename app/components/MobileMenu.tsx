// components/MobileMenu.tsx
"use client";

import { useUI } from "../contexts/UIContext";

export const MobileMenu = () => {
  const { isMobileMenuOpen, closeMobileMenu } = useUI();

  return (
    <div
      className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
        isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
      onClick={closeMobileMenu}
    >
      <div
        className={`absolute top-0 right-0 h-full w-64 bg-stone-100 shadow-lg transform transition-transform duration-300 ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 flex justify-end">
          <button onClick={closeMobileMenu} className="text-2xl">
            ×
          </button>
        </div>
        <nav className="flex flex-col p-4 space-y-4 text-right">
          <a href="#products" onClick={closeMobileMenu} className="font-medium hover:text-yellow-600">
            منتجاتنا
          </a>
          <a href="#story" onClick={closeMobileMenu} className="font-medium hover:text-yellow-600">
            قصتنا
          </a>
          <a href="#how" onClick={closeMobileMenu} className="font-medium hover:text-yellow-600">
            كيفاش نخدمو
          </a>
          <a href="#visit" onClick={closeMobileMenu} className="font-medium hover:text-yellow-600">
            زورونا
          </a>
          <a href="/contact" onClick={closeMobileMenu} className="font-medium hover:text-yellow-600">
            تواصلي معنا
          </a>
        </nav>
      </div>
    </div>
  );
};