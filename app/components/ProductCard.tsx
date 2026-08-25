"use client";

import type { StaticImageData } from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";

import type { Product } from "../types/product";
import { useLanguage } from "../contexts/LanguageContext";
import { useFavorites } from "../contexts/FavoritesContext";
import { useUI } from "../contexts/UIContext";
import styles from "./ProductCard.module.css";

function useCountdown(targetDate: string | undefined) {
  const target = useMemo(() => (targetDate ? new Date(targetDate).getTime() : 0), [targetDate]);
  const [time, setTime] = useState(() => {
    if (!target) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    const diff = Math.max(0, target - Date.now());
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
      expired: diff <= 0,
    };
  });

  useEffect(() => {
    if (!target || time.expired) return;
    const id = setInterval(() => {
      const diff = Math.max(0, target - Date.now());
      setTime({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
        expired: diff <= 0,
      });
    }, 1000);
    return () => clearInterval(id);
  }, [target, time.expired]);

  return time;
}

export type ProductCardProps = {
  product: Product;
  href?: string;
  onAddToCart?: (id: string | number) => void;
  added?: boolean;
  variant?: "default" | "compact";
  showFavorite?: boolean;
  showCountdown?: boolean;
};

const SLIDE_INTERVAL = 4000;

export const ProductCard = ({
  product,
  href,
  onAddToCart,
  added = false,
  variant = "default",
  showFavorite = false,
  showCountdown = false,
}: ProductCardProps) => {
  const { locale } = useLanguage();
  const isAr = locale === "ar";
  const { toggleFavorite, isFavorite } = useFavorites();
  const { openCart } = useUI();
  const favorited = isFavorite(String(product.id));

  const isCompact = variant === "compact";

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  // ── Image slideshow ──
  const allImages: string[] = [];
  if (Array.isArray(product.images)) {
    for (const img of product.images) {
      const src = typeof img.src === "string" ? img.src : "";
      if (src) allImages.push(src);
    }
  }
  if (allImages.length === 0) {
    const main =
      typeof product.image === "string"
        ? product.image.trim()
        : typeof product.image === "object" && product.image !== null && "src" in product.image
        ? String((product.image as { src: string }).src ?? "")
        : "";
    allImages.push(main || "/assets/images/no_image.png");
  }

  const [activeSlide, setActiveSlide] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const countdown = useCountdown(product.isOffer ? product.offerTime : undefined);
  const showCountdownTimer = showCountdown && product.isOffer && product.offerTime && !countdown.expired;

  const hasMultiple = allImages.length > 1;

  // Preload next image
  const preloadImage = useCallback(
    (index: number) => {
      if (loadedImages.has(index)) return;
      const src = allImages[index];
      if (!src) return;
      const img = new Image();
      img.onload = () => {
        setLoadedImages((prev) => new Set(prev).add(index));
      };
      img.src = src;
    },
    [allImages, loadedImages]
  );

  // Auto-cycle when hovering
  useEffect(() => {
    if (!hasMultiple || !isHovering) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setActiveSlide((prev) => {
        const next = (prev + 1) % allImages.length;
        preloadImage(next);
        return next;
      });
    }, SLIDE_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [hasMultiple, isHovering, allImages.length, preloadImage]);

  // Preload next image on slide change
  useEffect(() => {
    if (hasMultiple) {
      preloadImage((activeSlide + 1) % allImages.length);
    }
  }, [activeSlide, hasMultiple, preloadImage, allImages.length]);

  // ── Handlers ──
  const handleOrderNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.inStock !== false) {
      onAddToCart?.(product.id);
      setTimeout(() => openCart(), 300);
    }
  };

  const imageAlt = product.imageAlt ?? product.name ?? "Product image";
  const currency = isAr ? "د.م" : "MAD";

  // ── Classes ──
  const rootClass = [styles.card, isCompact ? styles.compact : ""].filter(Boolean).join(" ");
  const titleClass = [styles.title, isCompact ? styles.titleCompact : styles.titleNormal].join(" ");

  // ── Image slideshow content ──
  const slideshowContent = (
    <div className={styles.imageInner}>
      {allImages.map((src, i) => (
        <div
          key={i}
          className={`${styles.slide} ${i === activeSlide ? styles.slideActive : ""}`}
        >
          <img
            src={src}
            alt={imageAlt}
            loading={i === 0 ? "eager" : "lazy"}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/assets/images/no_image.png";
            }}
          />
        </div>
      ))}
      <div className={styles.imageOverlay} />

      {/* Slideshow dots */}
      {hasMultiple && (
        <div className={styles.dots}>
          {allImages.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === activeSlide ? styles.dotActive : ""}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveSlide(i);
              }}
              aria-label={`Image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div
      className={rootClass}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Image Area */}
      <div className={styles.imageArea}>
        <div className={styles.imageWrap}>
          {/* Badges - top left */}
          <div className={styles.badges}>
            {product.badge && (
              <span className={styles.badgeFeatured}>{product.badge}</span>
            )}
            {discount !== null && (
              <span className={styles.badgeDiscount}>-{discount}%</span>
            )}
          </div>

          {/* Rating - top right */}
          {product.rating !== undefined && product.rating > 0 && (
            <div className={styles.ratingBadge}>
              <span className={styles.ratingStar}>★</span>
              <span>{product.rating.toFixed(1)}</span>
            </div>
          )}

          {/* Offer countdown - centered at bottom */}
          {showCountdownTimer && (
            <div className={styles.countdown}>
              <div className={styles.countdownUnits}>
                {countdown.days > 0 && (
                  <span className={styles.countdownUnit}>
                    <span className={styles.countdownNum}>{countdown.days}</span>
                    <span className={styles.countdownLabel}>{isAr ? "أيام" : "Days"}</span>
                  </span>
                )}
                <span className={styles.countdownUnit}>
                  <span className={styles.countdownNum}>{String(countdown.hours).padStart(2, "0")}</span>
                  <span className={styles.countdownLabel}>{isAr ? "ساعات" : "Hrs"}</span>
                </span>
                <span className={styles.countdownSep}>:</span>
                <span className={styles.countdownUnit}>
                  <span className={styles.countdownNum}>{String(countdown.minutes).padStart(2, "0")}</span>
                  <span className={styles.countdownLabel}>{isAr ? "دقائق" : "Min"}</span>
                </span>
                <span className={styles.countdownSep}>:</span>
                <span className={styles.countdownUnit}>
                  <span className={styles.countdownNum}>{String(countdown.seconds).padStart(2, "0")}</span>
                  <span className={styles.countdownLabel}>{isAr ? "ثواني" : "Sec"}</span>
                </span>
              </div>
            </div>
          )}

          {/* Image link or plain image */}
          {href ? (
            <Link href={href} style={{ display: "block", width: "100%", height: "100%" }}>
              {slideshowContent}
            </Link>
          ) : (
            slideshowContent
          )}
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <div>
          {/* Title */}
          {href ? (
            <Link href={href}>
              <h3 className={titleClass} title={product.name}>{product.name}</h3>
            </Link>
          ) : (
            <h3 className={titleClass} title={product.name}>{product.name}</h3>
          )}

          {/* Brand */}
          {product.brand && (
            <p className={styles.brand}>{product.brand}</p>
          )}

          {/* Price row */}
          <div className={styles.priceRow}>
            <span className={styles.price}>
              {(product.price ?? 0).toFixed(2)} {currency}
            </span>
            {discount !== null && product.originalPrice && (
              <>
                <span className={styles.originalPrice}>
                  {product.originalPrice.toFixed(2)} {currency}
                </span>
                <span className={styles.discountTag}>-{discount}%</span>
              </>
            )}
          </div>
        </div>

        {/* Buttons row - Order Now + Favorite side by side */}
        <div className={styles.buttonsRow}>
          <button
            onClick={handleOrderNow}
            disabled={product.inStock === false}
            className={`${styles.orderBtn} ${product.inStock === false ? styles.orderBtnDisabled : ""}`}
          >
            <svg className={styles.orderBtnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            <span>
              {product.inStock === false
                ? (isAr ? "غير متوفر" : "Out of stock")
                : added
                ? (isAr ? "تمت الإضافة ✓" : "Added ✓")
                : (isAr ? "اطلبي الآن" : "Order Now")
              }
            </span>
          </button>

          {showFavorite && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorite(String(product.id));
              }}
              className={`${styles.favoriteBtn} ${favorited ? styles.favoriteBtnActive : ""}`}
              aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
            >
              <svg
                viewBox="0 0 24 24"
                fill={favorited ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
