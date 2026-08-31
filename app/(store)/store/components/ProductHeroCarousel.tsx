'use client';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Star, ShoppingBag, Sparkles, Award, TrendingUp, Shield, Truck, RotateCcw, Play, Pause } from 'lucide-react';
import type { Product } from '../../../types/product';

type ProductHeroCarouselProps = {
  products: Product[];
};

const SLIDE_INTERVAL_MS = 6000;

const getHeroDescription = (product: Product) => {
  if (product.description) return product.description;
  const brand = product.brand ? `${product.brand}` : '';
  const category = product.category ? `${product.category.toLowerCase()}` : '';
  return `${brand}${category}essence for a radiant, nourished look.`;
};

const getHeroBadge = (product: Product) => {
  if (product.badge) return product.badge.toUpperCase();
  if (product.sales && product.sales > 700) return 'TRENDING';
  if (product.rating && product.rating >= 4.7) return 'BEST SELLER';
  return product.category ? product.category.toUpperCase() : 'FEATURED';
};

const getBadgeIcon = (badge: string) => {
  if (badge.includes('TRENDING')) return <TrendingUp className="h-3 w-3" />;
  if (badge.includes('BEST')) return <Award className="h-3 w-3" />;
  return <Sparkles className="h-3 w-3" />;
};

const getBadgeGradient = (badge: string) => {
  if (badge.includes('TRENDING')) return 'from-blue-500 to-cyan-500';
  if (badge.includes('BEST')) return 'from-amber-500 to-orange-500';
  if (badge.includes('PREMIUM')) return 'from-purple-500 to-pink-500';
  return 'from-emerald-500 to-teal-500';
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
      .slice(0, 4);
  }, [products]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(500);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  const product = featuredProducts[activeIndex] ?? featuredProducts[0];
  const slideCount = featuredProducts.length;

  const goToIndex = useCallback((index: number) => {
    if (slideCount === 0) return;
    setIsTransitioning(true);
    setImageLoaded(false);
    setActiveIndex(() => {
      const next = ((index % slideCount) + slideCount) % slideCount;
      return next;
    });
    setTimeout(() => setIsTransitioning(false), 700);
  }, [slideCount]);

  const goToNext = useCallback(() => {
    if (slideCount > 1) goToIndex(activeIndex + 1);
  }, [slideCount, activeIndex, goToIndex]);

  const goToPrev = useCallback(() => {
    if (slideCount > 1) goToIndex(activeIndex - 1);
  }, [slideCount, activeIndex, goToIndex]);

  const toggleAutoplay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const listener = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches);
    motionQuery.addEventListener('change', listener);
    return () => motionQuery.removeEventListener('change', listener);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || slideCount <= 1 || isHovering || !isPlaying) return undefined;
    const intervalId = window.setInterval(() => {
      goToNext();
    }, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [prefersReducedMotion, slideCount, isHovering, isPlaying, goToNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!carouselRef.current?.contains(document.activeElement)) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNext();
      } else if (e.key === ' ') {
        e.preventDefault();
        toggleAutoplay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev, toggleAutoplay]);

  // Touch support
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goToNext();
      else goToPrev();
    }
    setTouchStartX(null);
  };

  useEffect(() => {
    let active = true;

    const loadThreshold = async () => {
      try {
        const res = await fetch('/api/admin/settings', { cache: 'no-store' });
        const json = await res.json();
        const value = Number(json?.data?.free_shipping_threshold ?? 500);
        if (active && Number.isFinite(value) && value >= 0) {
          setFreeShippingThreshold(value);
        }
      } catch (error) {
        console.error('Failed to load free shipping threshold', error);
      }
    };

    void loadThreshold();
    return () => {
      active = false;
    };
  }, []);

  if (!product) return null;

  const rating = product.rating ?? 0;
  const filledStars = Math.round(rating);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;
  const categoryLabel = product.category ?? 'Beauty';
  const badgeText = getHeroBadge(product);
  const badgeIcon = getBadgeIcon(badgeText);
  const badgeGradient = getBadgeGradient(badgeText);

  const imageSrc = (() => {
    const img = product.bannerImage ?? product.image ?? '/assets/Image/no_image.png';
    return typeof img === 'string' ? img : img.src;
  })();

  return (
    <section
      ref={carouselRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured products"
      tabIndex={0}
      className="relative w-full overflow-hidden rounded-3xl shadow-2xl focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        background: 'var(--brand-deep)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
      }}
    >
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 z-0 transition-opacity duration-1000"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 30% 20%, rgba(var(--accent-rgb), 0.12) 0%, transparent 70%), 
                       radial-gradient(ellipse 40% 40% at 80% 80%, rgba(var(--accent-rgb), 0.08) 0%, transparent 60%), 
                       linear-gradient(135deg, var(--brand-deep2) 0%, var(--brand-deep) 50%, var(--brand-deep3) 100%)`,
        }}
      />

      {/* Floating orbs */}
      <div
        className="absolute -top-20 -left-20 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(var(--accent-rgb), 0.4) 0%, transparent 70%)',
          animation: 'float 8s ease-in-out infinite',
        }}
      />
      <div
        className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(232, 206, 147, 0.3) 0%, transparent 70%)',
          animation: 'float 10s ease-in-out infinite reverse',
        }}
      />

      {/* Subtle pattern overlay */}
      <div
        className="absolute inset-0 -z-5 opacity-[0.03]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 50%, rgba(255,255,255,0.05) 0%, transparent 50%)
          `,
        }}
      />

      {/* Main hero grid — responsive stack on mobile, split layout on larger screens */}
      <div className="relative grid w-full grid-cols-1 lg:grid-cols-2 lg:h-[520px]">
        {/* =======================================================
            IMAGE HALF — visible on all screen sizes, stacked on mobile
        ======================================================== */}
        <div className="relative h-[260px] w-full overflow-hidden sm:h-[320px] lg:h-full">
          {/* Loading skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-stone-800 to-stone-900 animate-pulse" />
          )}

          {/* Product image with Ken Burns effect */}
          <img
            src={imageSrc}
            alt={product.bannerImageAlt ?? product.imageAlt ?? product.name}
            className={`absolute inset-0 z-10 h-full w-full object-cover object-center transition-all duration-1000 ${
              imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={(event) => {
              (event.target as HTMLImageElement).src = '/assets/Image/no_image.png';
              setImageLoaded(true);
            }}
            style={{
              animation: imageLoaded && !prefersReducedMotion ? 'kenburns 20s ease-in-out infinite' : 'none',
            }}
          />

          {/* Gradient overlay - left to right fade */}
          <div
            className="pointer-events-none absolute inset-0 z-20 hero-image-overlay"
            style={{
              background: `
                linear-gradient(
                  to right,
                  rgba(var(--brand-deep-rgb), 0) 0%,
                  rgba(var(--brand-deep-rgb), 0.05) 20%,
                  rgba(var(--brand-deep-rgb), 0.2) 45%,
                  rgba(var(--brand-deep-rgb), 0.5) 70%,
                  rgba(var(--brand-deep-rgb), 0.85) 90%,
                  var(--brand-deep) 100%
                )
              `,
            }}
          />

          {/* Bottom vignette */}
          <div
            className="pointer-events-none absolute inset-0 z-20"
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 40%)',
            }}
          />

          <div className="absolute inset-x-4 top-4 z-30 flex items-start justify-between gap-3 sm:inset-x-5 sm:top-5 lg:inset-x-6 lg:top-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-1.5 text-[11px] font-semibold text-emerald-50 backdrop-blur-sm shadow-lg shadow-emerald-500/10">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300/70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
              </span>
              In Stock
            </div>

            <div className="ml-auto flex items-center gap-2">
              {badgeText && (
                <span className={`inline-flex items-center gap-1.5 rounded-full border border-emerald-300/40 bg-gradient-to-r ${badgeGradient} px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white shadow-lg shadow-emerald-500/20`}>
                  {badgeIcon}
                  {badgeText}
                </span>
              )}

              {discount && discount > 0 && (
                <div className="relative group">
                  <div className="absolute inset-0 rounded-2xl bg-amber-500/40 blur-xl group-hover:blur-2xl transition-all duration-500" />
                  <div className="relative flex flex-col items-center rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 px-4 py-2.5 text-white shadow-xl shadow-amber-500/40 transform transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3 sm:px-5 sm:py-3">
                    <span className="text-2xl font-extrabold leading-none tracking-tight drop-shadow-lg sm:text-3xl">
                      -{discount}%
                    </span>
                    <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-amber-100 sm:text-[10px]">
                      OFF
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product count badge */}
          <div className="absolute bottom-4 right-4 z-30 rounded-full bg-black/40 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md border border-white/10 lg:bottom-6 lg:right-6">
            <span className="opacity-70">Featured</span>
            <span className="mx-1.5 opacity-30">•</span>
            <span className="font-bold">{activeIndex + 1}</span>
            <span className="opacity-50">/{slideCount}</span>
          </div>

          {/* Slide indicators - premium dots */}
          <div className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2.5 lg:bottom-8 lg:left-[15%]">
            {featuredProducts.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => goToIndex(index)}
                aria-label={`Show featured product ${slide.name}`}
                aria-current={index === activeIndex}
                className={`relative h-2 rounded-full transition-all duration-500 ${
                  index === activeIndex
                    ? 'w-10 bg-white shadow-lg shadow-white/30'
                    : 'w-2.5 bg-white/30 hover:bg-white/50'
                }`}
              >
                {index === activeIndex && (
                  <span className="absolute inset-0 rounded-full bg-white/40 blur-sm" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* =======================================================
            CONTENT HALF
        ======================================================== */}
        <div className="relative z-30 flex items-center overflow-hidden bg-transparent p-5 sm:p-8 lg:p-12 xl:p-16">
          {/* Additional edge blend */}
          <div
            className="pointer-events-none absolute inset-y-0 hidden w-32 lg:block hero-content-edge"
            style={{
              left: 0,
              background: 'linear-gradient(to right, transparent 0%, var(--brand-deep) 100%)',
            }}
          />

          <div className={`relative z-30 w-full max-w-xl space-y-4 sm:space-y-6 transition-all duration-700 ${
            isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/80 backdrop-blur-sm shadow-sm">
                <span className="inline-flex items-center gap-0.5 text-amber-300">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className={`h-3 w-3 ${
                        index < filledStars ? 'fill-amber-300 text-amber-300' : 'text-white/20'
                      }`}
                    />
                  ))}
                </span>
                <span className="font-semibold text-white">{rating.toFixed(1)}</span>
              </span>

              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70 backdrop-blur-sm">
                {categoryLabel}
              </span>
            </div>

            {/* Product name */}
            <div className="space-y-3">
              <h2
                className="text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl md:text-[40px] lg:text-[44px]"
                style={{ fontFamily: 'var(--disp)' }}
              >
                {product.name}
              </h2>
              <p className="max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
                {getHeroDescription(product)}
              </p>
            </div>

            {/* Price + CTA */}
            <div className="flex flex-wrap items-end gap-4 pt-2">
              <div className="flex items-center gap-3">
                <div className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  {product.price.toFixed(2)} MAD
                </div>
                {discount !== null && discount > 0 && (
                  <div className="space-y-0.5">
                    <div className="text-sm text-white/40 line-through">
                      {product.originalPrice?.toFixed(2)} MAD
                    </div>
                    <div className="text-sm font-bold uppercase tracking-[0.15em] text-emerald-300">
                      Save {discount}%
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href={`/store/${encodeURIComponent(product.slug || String(product.id))}`}
                className="group relative inline-flex items-center gap-2.5 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[var(--brand-deep)] overflow-hidden sm:px-8 sm:py-3.5"
                role="button"
                aria-label={`View product ${product.name}`}
              >
                {/* Shine effect */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <ShoppingBag className="h-4 w-4 transition-transform duration-300 group-hover:scale-110 relative z-10" />
                <span className="relative z-10">Shop Now</span>
                <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 relative z-10" />
              </Link>
              <Link
                href={`/store/${encodeURIComponent(product.slug || String(product.id))}`}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-sm font-medium text-white/80 transition-all duration-300 hover:bg-white/10 hover:text-white hover:border-white/30 backdrop-blur-sm sm:px-6 sm:py-3"
              >
                View Details
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] text-white/50 sm:gap-4 sm:text-xs">
              <span className="flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5 text-emerald-400/80" />
                Free delivery over {freeShippingThreshold} MAD
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-emerald-400/80" />
                Cash on delivery
              </span>
              <span className="flex items-center gap-1.5">
                <RotateCcw className="h-3.5 w-3.5 text-emerald-400/80" />
                30-day returns
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          NAVIGATION BUTTONS - Enhanced
      ========================================================== */}
      {/* Previous */}
      <button
        type="button"
        onClick={goToPrev}
        aria-label="Previous featured product"
        className="absolute left-3 top-1/2 z-50 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/10 p-3 text-white shadow-xl backdrop-blur-md transition-all duration-300 hover:bg-white/25 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] lg:flex"
        style={{ opacity: slideCount > 1 ? 1 : 0.3 }}
        disabled={slideCount <= 1}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* Next */}
      <button
        type="button"
        onClick={goToNext}
        aria-label="Next featured product"
        className="absolute right-3 top-1/2 z-50 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/10 p-3 text-white shadow-xl backdrop-blur-md transition-all duration-300 hover:bg-white/25 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] lg:flex"
        style={{ opacity: slideCount > 1 ? 1 : 0.3 }}
        disabled={slideCount <= 1}
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Autoplay control */}
      {slideCount > 1 && (
        <button
          type="button"
          onClick={toggleAutoplay}
          aria-label={isPlaying ? 'Pause autoplay' : 'Start autoplay'}
          className="absolute top-4 right-4 z-50 hidden items-center justify-center rounded-full bg-white/10 p-2.5 text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:bg-white/25 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] lg:flex"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
      )}

      {/* Progress bar */}
      {slideCount > 1 && (
        <div className="absolute bottom-0 left-0 right-0 z-30 h-1 bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] transition-all duration-700 ease-out"
            style={{
              width: `${((activeIndex + 1) / slideCount) * 100}%`,
            }}
          />
        </div>
      )}

      {/* =========================================================
          ANIMATIONS & STYLES
      ========================================================== */}
      <style jsx global>{`
        @media (max-width: 1023px) {
          .hero-image-overlay {
            background: linear-gradient(
              to top,
              rgba(var(--brand-deep-rgb), 0.82) 0%,
              rgba(var(--brand-deep-rgb), 0.42) 32%,
              rgba(var(--brand-deep-rgb), 0.18) 60%,
              rgba(var(--brand-deep-rgb), 0.1) 100%
            ) !important;
          }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }

        @keyframes kenburns {
          0%, 100% { transform: scale(1) translate(0, 0); }
          50% { transform: scale(1.05) translate(-1%, -1%); }
        }

        [dir="rtl"] .hero-image-overlay {
          left: auto;
          right: 0;
          background: linear-gradient(
            to left,
            rgba(var(--brand-deep-rgb), 0) 0%,
            rgba(var(--brand-deep-rgb), 0.05) 20%,
            rgba(var(--brand-deep-rgb), 0.2) 45%,
            rgba(var(--brand-deep-rgb), 0.5) 70%,
            rgba(var(--brand-deep-rgb), 0.85) 90%,
            var(--brand-deep) 100%
          );
        }

        [dir="rtl"] .hero-content-edge {
          left: 0;
          right: auto;
          background: linear-gradient(to left, transparent 0%, var(--brand-deep) 100%);
        }

        [dir="rtl"] .group:hover .group-hover\\:translate-x-1 {
          transform: translateX(-4px);
        }

        [dir="rtl"] .group:hover .shine-effect {
          transform: translateX(100%);
        }
      `}</style>
    </section>
  );
}
