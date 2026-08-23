// components/ProductCard.tsx — 2026 Quiet Luxury refresh
"use client";

import type { StaticImageData } from "next/image";
import Link from "next/link";
import { useState } from "react";

import type { Product } from "../types/product";
import { useLanguage } from "../contexts/LanguageContext";

export type ProductCardProps = {
  product: Product;
  href?: string;
  onAddToCart?: (id: string | number) => void;
  added?: boolean;
  variant?: "default" | "compact";
};

export const ProductCard = ({
  product,
  href,
  onAddToCart,
  added = false,
  variant = "default",
}: ProductCardProps) => {
  const { locale } = useLanguage();
  const isAr = locale === "ar";

  const isCompact = variant === "compact";

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const initialImageSrc: string | StaticImageData =
    typeof product.image === "string"
      ? product.image.trim() || "/assets/images/no_image.png"
      : product.image ?? "/assets/images/no_image.png";

  const [imageSrc, setImageSrc] = useState<string | StaticImageData>(initialImageSrc);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.inStock !== false) {
      onAddToCart?.(product.id);
    }
  };

  const imageAlt = product.imageAlt ?? product.name ?? "Product image";
  const currency = isAr ? "د.م" : "MAD";

  // Unified brand image container — no orange double border
  const imageContent = (
    <div className={`relative w-full h-full overflow-hidden bg-[#EAF4EE] ${isCompact ? "rounded-t-[18px]" : "rounded-t-[20px]"}`}>
      <img
        src={typeof imageSrc === 'string' ? imageSrc : imageSrc.src}
        alt={imageAlt}
        onError={() => setImageSrc("/assets/images/no_image.png")}
        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        loading="lazy"
      />
      {/* subtle inner vignette on hover */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
    </div>
  );

  return (
    <div
      className={`group h-full flex flex-col bg-[#FFFDF8] overflow-hidden border transition-all duration-300 ${
        isCompact ? "rounded-[18px]" : "rounded-[22px]"
      } border-[var(--line)] shadow-[0_10px_30px_rgba(17,64,47,.06)] hover:shadow-[0_22px_55px_rgba(17,64,47,.13)] hover:border-[var(--brand)] hover:-translate-y-1.5`}
    >
      {/* Image */}
      <div className="overflow-hidden bg-[var(--brand-tint)] border-b border-[var(--line)] flex justify-center text-center">
        <div className={`relative w-full ${isCompact ? "aspect-square" : "aspect-[4/5]"}`}>
          {/* Top badges — minimal pill, brand aligned */}
          <div className="absolute z-10 flex flex-col items-end gap-1.5 right-2.5 top-2.5">
            {product.badge && (
              <span className="bg-[#C6A15B] text-white px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide shadow-sm">
                {product.badge}
              </span>
            )}
            {discount !== null && (
              <span className="bg-[#07231A] text-[#E8CE93] px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm">
                -{discount}%
              </span>
            )}
          </div>

          {/* Bottom meta — glass pill */}
          <div className={`absolute z-10 flex items-center gap-1.5 bottom-2.5 ${isAr ? "right-2.5" : "left-2.5"}`}>
            {product.rating !== undefined && (
              <div className="inline-flex items-center gap-1 rounded-full bg-white/90 backdrop-blur px-2.5 py-1 text-xs font-bold text-[#07231A] shadow-sm border border-black/5">
                <span className="text-[#C6A15B]">★</span>
                <span>{product.rating.toFixed(1)}</span>
              </div>
            )}
            {product.reviews !== undefined && (
              <div className="inline-flex items-center gap-1 rounded-full bg-white/90 backdrop-blur px-2.5 py-1 text-xs font-medium text-stone-600 shadow-sm border border-black/5">
                <span>{product.reviews}</span>
                <span className="text-stone-400 hidden sm:inline">{isAr ? "تقييم" : "reviews"}</span>
              </div>
            )}
          </div>

          {href ? (
            <Link href={href} className="block w-full h-full">
              {imageContent}
            </Link>
          ) : (
            imageContent
          )}
        </div>
      </div>

      {/* Content */}
      <div className={`flex flex-1 flex-col justify-between ${isCompact ? "p-3.5" : "p-5"}`}>
        <div>
          {href ? (
            <Link href={href} className="block">
              <h3
                className={`text-[#07231A] font-bold leading-snug break-words group-hover:text-[#1E7A57] transition-colors ${
                  isCompact ? "text-[15px] line-clamp-1" : "text-[17px] leading-6 line-clamp-2"
                }`}
                style={{ fontFamily: "var(--disp)" }}
              >
                {product.name}
              </h3>
            </Link>
          ) : (
            <h3
              className={`text-[#07231A] font-bold leading-snug break-words ${
                isCompact ? "text-[15px] line-clamp-1" : "text-[17px] leading-6 line-clamp-2"
              }`}
              style={{ fontFamily: "var(--disp)" }}
            >
              {product.name}
            </h3>
          )}

          {(product.brand || product.category) && (
            <p className={`font-tajawal text-stone-500 font-medium ${isCompact ? "text-[11px] mt-1 truncate" : "text-xs mt-1.5"}`}>
              {product.brand ?? ""}
              {product.brand && product.category ? " · " : ""}
              {product.category ?? ""}
            </p>
          )}

          <div className={`flex items-baseline gap-2 ${isCompact ? "mt-2.5 mb-2.5" : "mt-3.5 mb-4"}`}>
            <span className={`text-[#1E7A57] font-extrabold text-nowrap ${isCompact ? "text-[16px]" : "text-[19px]"}`}>
              {(product.price ?? 0).toFixed(2)} {currency}
            </span>
            {discount !== null && (
              <span className="text-stone-400 line-through text-xs">
                {product.originalPrice?.toFixed(2)} {currency}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleClick}
          disabled={product.inStock === false}
          className={`w-full inline-flex items-center justify-center gap-2 rounded-full font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#C6A15B]/40 ${
            isCompact ? "py-2.5 px-4 text-xs" : "py-3.5 px-6 text-sm"
          } ${
            product.inStock === false
              ? "bg-stone-200 text-stone-500 cursor-not-allowed"
              : added
              ? "bg-emerald-700 text-white"
              : "bg-[#07231A] text-[#E8CE93] hover:bg-[#1E7A57] hover:text-white hover:shadow-lg active:scale-[0.98]"
          }`}
        >
          {product.inStock === false ? (
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              {isAr ? "غير متوفر" : "Out of stock"}
            </span>
          ) : added ? (
            <span>✓ {isAr ? "تمت الإضافة" : "Added"}</span>
          ) : (
            <span>{isAr ? "أضيفي للسلة" : "Add to bag"}</span>
          )}
        </button>
      </div>
    </div>
  );
};
