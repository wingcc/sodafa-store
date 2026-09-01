"use client";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useLanguage } from "../../contexts/LanguageContext";
import { useUI } from "../../contexts/UIContext";
import { useFavorites } from "../../contexts/FavoritesContext";
import type { Product } from "../../types/product";

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

function FlashSaleSkeleton() {
  return (
    <div>
      <div className="wrap">
        <div className="fs-head">
          <div className="fs-skeleton-title" />
          <div className="fs-skeleton-btn" />
        </div>
        <div className="fs-grid">
          {[0, 1].map((i) => (
            <div key={i} className="fs-card fs-skeleton-card">
              <div className="fs-img fs-skeleton-image-wrap">
                <div className="fs-skeleton-image" />
              </div>

              <div className="fs-body fs-skeleton-body">
                <div className="fs-skeleton-meta">
                  <div className="fs-skeleton-line fs-skeleton-name" />
                  <div className="fs-skeleton-line fs-skeleton-rate" />
                </div>

                <div className="fs-skeleton-price" />

                <div className="fs-controls-row fs-skeleton-controls-row">
                  <div className="fs-skeleton-button" />
                  <div className="fs-skeleton-counter" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FlashProductCard({
  product,
  index,
  onAddToCart,
  isAr,
}: {
  product: Product;
  index: number;
  onAddToCart: (id: string | number) => void;
  isAr: boolean;
}) {
  const countdown = useCountdown(product.offerTime);
  const currency = isAr ? "د.م" : "MAD";
  const { toggleFavorite, isFavorite } = useFavorites();
  const favorited = isFavorite(String(product.id));

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const imageSrc =
    typeof product.image === "string"
      ? product.image
      : typeof product.image === "object" && product.image !== null && "src" in product.image
      ? String((product.image as { src: string }).src ?? "")
      : "/assets/images/no_image.png";

  if (countdown.expired) return null;

  return (
    <div className="fs-card" data-d={index * 120}>
      {/* Heart button - top left */}
      <button
        className={`fs-heart ${favorited ? "fs-heart-active" : ""}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleFavorite(String(product.id));
        }}
        aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
      >
        <svg viewBox="0 0 24 24" fill={favorited ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      </button>

      {/* Image */}
      <div className="fs-img">
        {discount !== null && (
          <span className="fs-disc">-{discount}%</span>
        )}
        <img loading="lazy" src={imageSrc} alt={product.name} />
      </div>

      {/* Content */}
      <div className="fs-body">
        <div>
          <h3>{product.name}</h3>
          {product.rating !== undefined && product.rating > 0 && (
            <div className="fs-rate">
              <b>{product.rating.toFixed(1)}</b>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l2.9 6.6 7.1.7-5.4 4.8 1.6 7L12 17.4 5.8 21l1.6-7L2 9.3l7.1-.7z" />
              </svg>
              <span>({product.reviews ?? 0} {isAr ? "تقييم" : "reviews"})</span>
            </div>
          )}
        </div>
        <div className="fs-price">
          <b>{product.price.toFixed(2)} {currency}</b>
          {discount !== null && product.originalPrice && (
            <s>{product.originalPrice.toFixed(2)} {currency}</s>
          )}
        </div>
        <div className="fs-controls-row">
          <button
            className="fs-add"
            onClick={() => onAddToCart(product.id)}
            aria-label={isAr ? "أضف إلى السلة" : "Add to cart"}
            title={isAr ? "أضف إلى السلة" : "Add to cart"}
          >
            <svg className="fs-add-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="9" cy="19" r="1.5" />
              <circle cx="17" cy="19" r="1.5" />
              <path d="M3 4h2l2.2 9.2a1 1 0 0 0 1 .8H17a1 1 0 0 0 1-.8L20 7H7" />
            </svg>
            <span className="fs-add-text">{isAr ? "أضف إلى السلة" : "Add to cart"}</span>
          </button>
          <div className="fs-card-timer timer-left">
            <div className="fs-card-timer-inner">
              {countdown.days > 0 && (
                <div className="fs-card-timer-unit">
                  <b>{String(countdown.days).padStart(2, "0")}</b>
                  <small>{isAr ? "أيام" : "Days"}</small>
                </div>
              )}
              <div className="fs-card-timer-unit">
                <b>{String(countdown.hours).padStart(2, "0")}</b>
                <small>{isAr ? "ساعات" : "Hrs"}</small>
              </div>
              <i>:</i>
              <div className="fs-card-timer-unit">
                <b>{String(countdown.minutes).padStart(2, "0")}</b>
                <small>{isAr ? "دقائق" : "Min"}</small>
              </div>
              <i>:</i>
              <div className="fs-card-timer-unit">
                <b>{String(countdown.seconds).padStart(2, "0")}</b>
                <small>{isAr ? "ثواني" : "Sec"}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FlashSaleSection() {
  const { locale } = useLanguage();
  const isAr = locale === "ar";
  const { addToCart, openCart } = useUI();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/products?showInStore=true&status=active");
        const json = await res.json();
        if (cancelled || !json.success || !Array.isArray(json.data)) return;

        const offerProducts: Product[] = json.data
          .filter((row: Record<string, unknown>) => row.IsOffer === true)
          .map((row: Record<string, unknown>) => {
            const regularPrice = typeof row.regular_price === "number" ? row.regular_price : 0;
            const salePrice = typeof row.sale_price === "number" ? row.sale_price : null;
            const price = salePrice ?? regularPrice;
            const originalPrice = salePrice !== null ? regularPrice : null;
            const imageSrcs = Array.isArray(row.images)
              ? row.images
                  .map((img: unknown) => {
                    if (typeof img === "string") return img;
                    if (img && typeof img === "object" && "src" in img)
                      return String((img as { src: unknown }).src ?? "");
                    return "";
                  })
                  .filter(Boolean)
              : [];

            return {
              id: String(row.id ?? ""),
              name: String(row.name ?? ""),
              price,
              originalPrice,
              image: imageSrcs[0] ?? "/assets/images/no_image.png",
              imageAlt: String(row.name ?? ""),
              inStock: Number(row.stock ?? 0) > 0,
              brand: row.brand ? String(row.brand) : undefined,
              rating: typeof row.rating === "number" ? row.rating : undefined,
              reviews: typeof row.review_count === "number" ? row.review_count : undefined,
              images: imageSrcs.map((src) => ({ src })),
              isOffer: true,
              offerTime: row.OfferTime ? String(row.OfferTime) : undefined,
            } as Product;
          });

        setProducts(offerProducts);
      } catch {}
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const handleAddToCart = (id: string | number) => {
    const product = products.find((p) => p.id === id);
    if (!product || product.inStock === false) return;
    const imgSrc = typeof product.image === "string" ? product.image : "";
    addToCart({ id: product.id, name: product.name, price: product.price, image: imgSrc }, 1);
    setTimeout(() => openCart(), 300);
  };

  // Show skeleton during loading
  if (loading) {
    return <FlashSaleSkeleton />;
  }

  // Show nothing if no offer products (after loading)
  if (products.length === 0) return null;

  return (
    <div>
      <div className="wrap">
        <div className="fs-head">
          <h2>🔥 {isAr ? "تخفيضات سريعة" : "Flash Sale"}</h2>
          <Link className="btn btn-main fs-all" href="/store">
            {isAr ? "عرض الكل" : "View All"}
          </Link>
        </div>

        <div className="fs-grid">
          {products.map((product, i) => (
            <FlashProductCard
              key={product.id}
              product={product}
              index={i}
              onAddToCart={handleAddToCart}
              isAr={isAr}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
