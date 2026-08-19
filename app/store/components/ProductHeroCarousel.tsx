'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

import type { Product } from '../../types/product';

type ProductHeroCarouselProps = {
  products: Product[];
};

const SLIDE_INTERVAL_MS = 5500;

const getHeroDescription = (product: Product) => {
  if (product.description) return product.description;
  const brand = product.brand ? `${product.brand} ` : '';
  const category = product.category ? `${product.category.toLowerCase()} ` : '';
  return `${brand}${category}essence for a radiant, nourished look.`;
};

const getHeroBadge = (product: Product) => {
  if (product.badge) return product.badge.toUpperCase();
  if (product.sales && product.sales > 700) return 'TRENDING';
  if (product.rating && product.rating >= 4.7) return 'BEST SELLER';
  return product.category ? product.category.toUpperCase() : 'FEATURED';
};

export function ProductHeroCarousel({ products }: ProductHeroCarouselProps) {
  const featuredProducts = useMemo(() => {
    return [...products]
      .filter((product) => product.inStock !== false)
      .sort((a, b) => {
        const salesA = a.sales ?? 0;
        const salesB = b.sales ?? 0;
        const ratingA = a.rating ?? 0;
        const ratingB = b.rating ?? 0;
        const reviewsA = a.reviews ?? 0;
        const reviewsB = b.reviews ?? 0;
        return salesB - salesA || ratingB - ratingA || reviewsB - reviewsA;
      })
      .slice(0, 3);
  }, [products]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
  const carouselRef = useRef<HTMLDivElement | null>(null);

  const product = featuredProducts[activeIndex] ?? featuredProducts[0];
  const slideCount = featuredProducts.length;

  const goToIndex = (index: number) => {
    if (slideCount === 0) return;
    setActiveIndex((current) => {
      const next = ((index % slideCount) + slideCount) % slideCount;
      return next;
    });
  };

  const goToNext = () => {
    if (slideCount > 1) goToIndex(activeIndex + 1);
  };

  const goToPrev = () => {
    if (slideCount > 1) goToIndex(activeIndex - 1);
  };

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const listener = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches);
    motionQuery.addEventListener('change', listener);
    return () => motionQuery.removeEventListener('change', listener);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || slideCount <= 1 || isHovering) return undefined;

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slideCount);
    }, SLIDE_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [prefersReducedMotion, slideCount, isHovering]);

  if (!product) return null;

  const rating = product.rating ?? 0;
  const filledStars = Math.round(rating);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

 return (
  <section
    ref={carouselRef}
    role="region"
    aria-roledescription="carousel"
    aria-label="Featured products"
    tabIndex={0}
    onMouseEnter={() => setIsHovering(true)}
    onMouseLeave={() => setIsHovering(false)}
    className="relative isolate w-full overflow-hidden border-b border-border/50 bg-[#0a2c23] shadow-[0_20px_60px_-20px_rgba(250,204,21,0.08)]"
  >
    {/* =========================================================
        HERO BACKGROUND
    ========================================================== */}
    <div
      className="absolute inset-0 -z-10"
      style={{
        background:
          'linear-gradient(120deg, #0f3d31 0%, #0a2c23 60%, #0a2c23 100%)',
      }}
    />

    {/* =========================================================
        MAIN HERO
    ========================================================== */}
    <div className="relative grid min-h-[400px] w-full grid-cols-1 lg:min-h-[520px] lg:grid-cols-2">

      {/* =======================================================
          IMAGE HALF — FULL BLEED PRODUCT IMAGE
      ======================================================== */}
      <div className="relative min-h-[360px] w-full overflow-hidden lg:min-h-[520px] hero-image-side">

        {/* Product image */}
        <img
          src={(() => {
            const img = product.bannerImage ?? product.image ?? '/assets/Image/no_image.png';
            return typeof img === 'string' ? img : img.src;
          })()}
          alt={
            product.bannerImageAlt ??
            product.imageAlt ??
            product.name
          }
          className="z-0 w-full h-full object-cover object-center hero-image-object"
          onError={(event) => {
            (event.target as HTMLImageElement).src =
              '/assets/Image/no_image.png';
          }}
        />

        {/* =====================================================
            IMAGE → GREEN BLEND

            This is the important part.
            The image remains visible on the edge and gradually
            disappears into the exact same green used by the
            content section.
        ====================================================== */}

        {/* Center overlay fade at the 50% boundary */}
        <div className="pointer-events-none absolute inset-y-0 z-10 hero-image-overlay" />

        {/* Subtle overall darkening near bottom */}
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background:
              'linear-gradient(to top, rgba(10,44,35,0.18) 0%, transparent 35%)',
          }}
        />

        {/* =====================================================
            DISCOUNT BADGE
        ====================================================== */}
        {discount && (
          <div className="absolute right-4 top-4 z-30 bg-gradient-to-br from-amber-500 to-orange-500 px-4 py-2 text-center text-white shadow-lg shadow-amber-500/30 lg:right-5 lg:top-5">
            <div className="text-2xl font-extrabold leading-none">
              -{discount}%
            </div>

            <div className="text-[10px] font-medium uppercase tracking-wider opacity-90">
              OFF
            </div>
          </div>
        )}

        {/* =====================================================
            SLIDE INDICATORS
        ====================================================== */}
        <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 lg:left-1/3">
          {featuredProducts.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => goToIndex(index)}
              aria-label={`Show featured product ${slide.name}`}
              aria-current={index === activeIndex}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === activeIndex
                  ? 'w-8 bg-amber-400 shadow-[0_6px_20px_-8px_rgba(250,174,66,0.35)]'
                  : 'w-2.5 bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </div>

      {/* =======================================================
          CONTENT HALF
      ======================================================== */}
      <div className="relative z-20 flex items-center bg-[#0a2c23] p-6 sm:p-8 lg:p-12 hero-content-side">

        {/* Extra center-edge blend into image */}
        <div className="pointer-events-none absolute inset-y-0 hidden w-24 lg:block hero-content-edge" />

        <div className="relative z-30 w-full max-w-xl space-y-5">

          {/* Badge / category */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-lg shadow-amber-300/30">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/80" />
              {getHeroBadge(product)}
            </span>

            <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
              {product.category ?? 'Beauty'}
            </span>
          </div>

          {/* Product title + description */}
          <div className="space-y-3">
            <h2 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
              {product.name}
            </h2>

            <p className="max-w-xl text-sm leading-relaxed text-slate-200 sm:text-base">
              {getHeroDescription(product)}
            </p>
          </div>

          {/* Rating */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="inline-flex items-center gap-3 rounded-full bg-transparent px-4 py-2 text-sm text-slate-100">
              <span className="flex items-center gap-0.5 text-amber-500">
                {Array.from({ length: 5 }).map((_, index) => (
                  <span
                    key={index}
                    className={
                      index < filledStars
                        ? 'opacity-100'
                        : 'opacity-25'
                    }
                  >
                    ★
                  </span>
                ))}
              </span>

              <span className="font-semibold text-white">
                {rating.toFixed(1)}
              </span>

              <span className="text-slate-300">
                ({product.reviews ?? 0} reviews)
              </span>
            </div>
          </div>

          {/* Price + CTA */}
          <div className="flex flex-wrap items-end gap-4 pt-2">

            <div className="flex items-center gap-3">
              <div className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                {product.price.toFixed(2)} MAD
              </div>

              {discount !== null && (
                <div className="space-y-0.5">
                  <div className="text-sm text-slate-300 line-through">
                    {product.originalPrice?.toFixed(2)} MAD
                  </div>

                  <div className="text-sm font-bold uppercase tracking-[0.15em] text-emerald-300">
                    -{discount}%
                  </div>
                </div>
              )}
            </div>

            <Link
              href={`/store/${product.id}`}
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-slate-900 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-100 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#0a2c23]"
              role="button"
              aria-label={`View product ${product.name}`}
            >
              Shop Now

              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>

    {/* =========================================================
        PREVIOUS BUTTON
    ========================================================== */}
    <style jsx>{`
      .hero-image-side {
        order: 1;
      }

      .hero-content-side {
        order: 2;
      }

      .hero-image-overlay {
        inset-block-start: 0;
        inset-block-end: 0;
        inset-inline-start: 50%;
        width: 50%;
        background: linear-gradient(
          to inline-end,
          rgba(10,44,35,0) 0%,
          rgba(10,44,35,0.12) 15%,
          rgba(10,44,35,0.35) 45%,
          rgba(10,44,35,0.65) 70%,
          #0a2c23 100%
        );
      }

      .hero-content-edge {
        inset-block-start: 0;
        inset-block-end: 0;
        inset-inline-end: 0;
        background: linear-gradient(to left, transparent 0%, #0a2c23 100%);
      }

      .hero-image-object {
        object-position: center;
      }

      html[dir='rtl'] .hero-image-side {
        order: 2;
      }

      html[dir='rtl'] .hero-content-side {
        order: 1;
      }

      html[dir='rtl'] .hero-image-overlay {
        inset-inline-start: auto;
        inset-inline-end: 50%;
        background: linear-gradient(
          to inline-start,
          rgba(10,44,35,0) 0%,
          rgba(10,44,35,0.12) 15%,
          rgba(10,44,35,0.35) 45%,
          rgba(10,44,35,0.65) 70%,
          #0a2c23 100%
        );
      }

      html[dir='rtl'] .hero-content-edge {
        inset-inline-start: 0;
        inset-inline-end: auto;
        background: linear-gradient(to right, transparent 0%, #0a2c23 100%);
      }
    `}</style>
    <button
      type="button"
      onClick={goToPrev}
      aria-label="Previous featured product"
      className="absolute left-4 top-1/2 z-50 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/50 focus:outline-none focus:ring-2 focus:ring-amber-300"
    >
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 18l-6-6 6-6"
        />
      </svg>
    </button>

    {/* =========================================================
        NEXT BUTTON
    ========================================================== */}
    <button
      type="button"
      onClick={goToNext}
      aria-label="Next featured product"
      className="absolute right-4 top-1/2 z-50 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/50 focus:outline-none focus:ring-2 focus:ring-amber-300"
    >
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 6l6 6-6 6"
        />
      </svg>
    </button>
  </section>
);
}