// components/ProductCard.tsx
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

  const imageContent = (
    <div
      className={`relative w-full h-full overflow-hidden border-4 border-orange-200/80 shadow-md shadow-orange-200/30 bg-gradient-to-br from-orange-100 to-amber-50/50 ${
        isCompact ? "rounded-t-[16px]" : "rounded-t-[20px]"
      }`}
    >
      <img
        src={typeof imageSrc === 'string' ? imageSrc : imageSrc.src}
        alt={imageAlt}
        onError={() => setImageSrc("/assets/images/no_image.png")}
        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
      />
    </div>
  );

  return (
    <div
      className={`group h-full flex flex-col bg-orange-50/80 backdrop-blur-sm shadow-[0_10px_40px_-20px_rgba(15,61,49,0.25)] hover:shadow-[0_25px_50px_-18px_rgba(15,61,49,0.4)] overflow-hidden border border-orange-200/60 transition-all duration-400 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-orange-200/20 ${
        isCompact ? "rounded-[16px]" : "rounded-[20px]"
      }`}
    >
      {/* Image Container with Store Border Styling */}
      <div className="overflow-hidden bg-orange-100 border-b-2 border-orange-200/60 text-teal-950 flex justify-center text-center">
        <div className={`relative w-full ${isCompact ? "aspect-square" : "aspect-[3/4]"}`}>
          <div className="absolute z-10 flex flex-col items-end gap-1.5 right-2.5 top-2.5">
            {product.badge && (
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-bold tracking-[0.3px] shadow-md shadow-orange-500/30">
                {product.badge}
              </span>
            )}
            {discount !== null && (
              <span className="bg-teal-950 text-white px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold shadow-md shadow-teal-950/20">
                {discount}% {isAr ? "خصم" : "off"}
              </span>
            )}
          </div>

          {/* Bottom badges: Rating + Reviews (bottom-left for LTR, bottom-right for RTL) */}
          <div
            className={`absolute z-10 flex items-center gap-1.5 text-stone-600 bottom-2 ${isAr ? "right-2" : "left-2"} sm:bottom-2.5 sm:${isAr ? "right-2.5" : "left-2.5"} ${isCompact ? "text-xs" : "text-sm"}`}
          >
            {product.rating !== undefined && (
              <div className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-0.5 shadow-2xs shadow-stone-200">
                <span className="text-yellow-600">★</span>
                <span className="font-semibold">{product.rating.toFixed(1)}</span>
              </div>
            )}
            {product.reviews !== undefined && (
              <div className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-0.5 shadow-2xs shadow-stone-200">
                <span>{product.reviews}</span>
                <span className="text-stone-400">{isAr ? "تقييم" : "reviews"}</span>
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

      {/* Card Content with Exact Store Typography & Colors */}
      <div
        className={`flex flex-1 flex-col justify-between ${
          isCompact ? "p-3 sm:p-3.5" : "pt-[18px] pb-[22px] px-[20px]"
        }`}
      >
        <div>
          {href ? (
            <Link href={href} className="block group-hover:text-yellow-700 transition-colors">
              <h3
                className={`text-teal-950 font-bold leading-snug break-words font-tajawal group-hover:text-yellow-800 transition-colors ${
                  isCompact ? "text-sm sm:text-base line-clamp-1" : "text-xl leading-[22px]"
                }`}
              >
                {product.name}
              </h3>
            </Link>
          ) : (
            <h3
              className={`text-teal-950 font-bold leading-snug break-words font-tajawal ${
                isCompact ? "text-sm sm:text-base line-clamp-1" : "text-xl leading-[22px]"
              }`}
            >
              {product.name}
            </h3>
          )}

          {(product.brand || product.category) && (
            <p
              className={`text-stone-500 font-medium ${
                isCompact ? "text-[11px] mt-0.5 truncate" : "text-sm mt-1"
              }`}
            >
              {product.brand ?? ""}{product.brand && product.category ? " · " : ""}{product.category ?? ""}
            </p>
          )}

          <div
            className={`flex items-baseline gap-x-2 ${
              isCompact ? "mt-2 mb-2" : "mt-4 mb-3.5"
            }`}
          >
            <span
              className={`text-yellow-600 font-extrabold text-nowrap block ${
                isCompact ? "text-base sm:text-lg leading-tight" : "text-[20.8px] leading-[35.36px]"
              }`}
            >
              {(product.price ?? 0).toFixed(2)} {currency}
            </span>
            {discount !== null && (
              <span
                className={`text-stone-400 line-through text-nowrap block ${
                  isCompact ? "text-[11px]" : "text-[12.8px] leading-[21.76px]"
                }`}
              >
                {product.originalPrice?.toFixed(2)} {currency}
              </span>
            )}
          </div>
        </div>

        {/* CTA Button with Exact Store Styling */}
        <button
          onClick={handleClick}
          disabled={product.inStock === false}
          className={`items-center bg-teal-950 text-white font-bold justify-center text-center w-full rounded-[32px] transition-all duration-300 hover:bg-yellow-600 hover:scale-[1.02] active:scale-95 focus:ring-2 focus:ring-yellow-500 focus:outline-none ${
            isCompact
              ? "py-2 px-3 text-xs gap-x-1.5 flex"
              : "py-3.5 px-[26px] text-base gap-x-[9px] inline-flex"
          } ${
            product.inStock === false ? "opacity-60 cursor-not-allowed hover:bg-teal-950 hover:scale-100" : ""
          }`}
        >
          {product.inStock === false ? (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              {isAr ? "غير متوفر" : "Out of stock"}
            </span>
          ) : added ? (
            isAr ? "✓ المضاف" : "✓ Added"
          ) : (
            isAr ? "اطلبي الآن" : "Order Now"
          )}
        </button>
      </div>
    </div>
  );
};
