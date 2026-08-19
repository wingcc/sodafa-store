// components/SearchDialog.tsx
"use client";

/* eslint-disable react-hooks/set-state-in-effect -- resetting search on open */
import { useState, useEffect, useRef, useCallback } from "react";
import { X, Search } from "lucide-react";
import { useUI } from "../contexts/UIContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useProducts } from "../hooks/useProducts";

export const SearchDialog = () => {
  const { isSearchOpen, closeSearch } = useUI();
  const { locale } = useLanguage();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const isAr = locale === "ar";

  // Fetch products for search filtering
  const { products: allProducts } = useProducts();

  // Filter products based on query
  const results = query.trim().length > 0
    ? allProducts.filter((p) => {
        const q = query.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          (p.brand ?? "").toLowerCase().includes(q) ||
          (p.category ?? "").toLowerCase().includes(q)
        );
      })
    : [];

  // Auto-focus input when dialog opens
  useEffect(() => {
    if (isSearchOpen) {
      setQuery("");
      // Small delay to allow dialog to render
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [isSearchOpen]);

  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSearchOpen) {
        closeSearch();
      }
    },
    [isSearchOpen, closeSearch]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Lock body scroll when open
  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 z-[998] bg-black/50 backdrop-blur-sm"
        onClick={closeSearch}
        aria-hidden="true"
      />

      {/* Dialog container – always dir="ltr" so positions never flip */}
      <div
        dir="ltr"
        className="fixed inset-0 z-[999] flex items-start justify-center pt-[80px] md:pt-[120px] px-4"
      >
        <div
          className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
          style={{
            animation: "searchSlideDown 0.25s ease-out",
            border: "1px solid rgba(0, 0, 0, 0.08)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search input bar */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-200">
            <Search className="w-5 h-5 text-neutral-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isAr ? "ابحثي عن المنتجات..." : "Search products..."}
              className="flex-1 bg-transparent text-base text-neutral-800 outline-none placeholder:text-neutral-400"
              dir={isAr ? "rtl" : "ltr"}
              style={{ textAlign: isAr ? "right" : "left" }}
            />
            {query.length > 0 && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="p-1 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors"
                aria-label={isAr ? "مسح البحث" : "Clear search"}
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={closeSearch}
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-700 transition-all duration-150 shrink-0"
              aria-label={isAr ? "إغلاق البحث" : "Close search"}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Results area */}
          <div className="max-h-[60vh] overflow-y-auto">
            {query.trim().length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <Search className="w-10 h-10 text-neutral-300 mb-3" />
                <p className="text-neutral-500 text-sm">
                  {isAr
                    ? "اكتبي اسم المنتج للبحث..."
                    : "Type a product name to search..."}
                </p>
              </div>
            ) : results.length > 0 ? (
              /* Search results */
              <div className="p-4">
                <h4
                  className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3 px-1"
                  dir={isAr ? "rtl" : "ltr"}
                >
                  {isAr ? "المنتجات" : "Products"}{" "}
                  <span className="text-neutral-300">({results.length})</span>
                </h4>
                <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3 list-none p-0">
                  {results.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`/store`}
                        onClick={closeSearch}
                        className="group block rounded-xl overflow-hidden border border-neutral-100 hover:border-neutral-200 hover:shadow-md transition-all duration-200"
                      >
                        <div className="aspect-[4/5] bg-neutral-100 overflow-hidden">
                          <img
                            src={typeof item.image === 'string' ? item.image : ''}
                            alt={item.imageAlt || item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        </div>
                        <div className="p-3">
                          <p className="text-sm font-medium text-neutral-800 line-clamp-2 leading-snug mb-1">
                            {item.name}
                          </p>
                          <div className="flex items-center gap-2">
                            <span
                              className="text-sm font-bold"
                              style={{ color: "#0b2e22" }}
                            >
                              {item.price.toFixed(2)}{" "}
                              {isAr ? "د.م" : "MAD"}
                            </span>
                            {item.originalPrice && (
                              <span className="text-xs text-neutral-400 line-through">
                                {item.originalPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                          {item.badge && (
                            <span
                              className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold text-white rounded-full"
                              style={{
                                background:
                                  "linear-gradient(135deg, #cda552, #b8922e)",
                              }}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              /* No results */
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                  style={{ background: "rgba(205, 165, 82, 0.1)" }}
                >
                  <Search className="w-5 h-5" style={{ color: "#cda552" }} />
                </div>
                <p className="text-neutral-600 font-medium text-sm mb-1">
                  {isAr ? "لا توجد نتائج" : "No results found"}
                </p>
                <p className="text-neutral-400 text-xs">
                  {isAr
                    ? `لا توجد نتائج ل "${query}"`
                    : `No results for "${query}"`}
                </p>
              </div>
            )}
          </div>

          {/* Footer hint */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-neutral-100 bg-neutral-50">
            <span className="text-xs text-neutral-400">
              {isAr ? "اضغطي ESC للإغلاق" : "Press ESC to close"}
            </span>
            <span className="text-xs text-neutral-400">
              {isAr ? "صدفة ماركت" : "SODFA Market"}
            </span>
          </div>
        </div>
      </div>

      {/* Animation keyframe */}
      <style jsx>{`
        @keyframes searchSlideDown {
          from {
            opacity: 0;
            transform: translateY(-12px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  );
};