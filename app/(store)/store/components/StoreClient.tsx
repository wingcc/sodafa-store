'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { Product } from '../../../types/product';
import type { TrustItem } from '../../../sections/common/types';
import { ProductCard } from '../../../components/ProductCard';

import { ProductHeroCarousel } from './ProductHeroCarousel';
import { Pagination } from './Pagination';
import { useUI } from '../../../contexts/UIContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import TrustBadges from '../../../sections/TrustBadges';
import { Search } from 'lucide-react';

const PRODUCTS_PER_PAGE = 8;

interface StoreClientProps {
  initialProducts?: Product[];
  initialTrust?: TrustItem[];
}

export default function StoreClient({ initialProducts, initialTrust = [] }: StoreClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts ?? []);

  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) return;
    let cancelled = false;
    fetch('/api/products?showInStore=true&ads=true&status=active')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          const mapped = json.data.map((row: Record<string, unknown>) => {
            const regularPrice = typeof row.regular_price === 'number' ? row.regular_price : 0;
            const salePrice = typeof row.sale_price === 'number' ? row.sale_price : null;
            const price = salePrice ?? regularPrice;
            const originalPrice = salePrice !== null ? regularPrice : null;
            const imageSrcs = Array.isArray(row.images)
              ? row.images.map((img: unknown) => {
                  if (typeof img === 'string') return img;
                  if (img && typeof img === 'object' && 'src' in img) return String((img as { src: unknown }).src ?? '');
                  return '';
                }).filter(Boolean)
              : [];
            return {
              id: String(row.id ?? ''),
              slug: row.slug ? String(row.slug).trim() : undefined,
              name: String(row.name ?? ''),
              price,
              originalPrice,
              image: imageSrcs[0] ?? '/assets/images/no_image.png',
              imageAlt: String(row.name ?? ''),
              badge: row.featured ? 'Featured' : (row.ADS ? 'ADS' : null),
              ShowInStor: Boolean(row.ShowInStor ?? row.showInStore ?? false),
              showInStore: Boolean(row.ShowInStor ?? row.showInStore ?? false),
              inStock: Number(row.stock ?? 0) > 0,
              ADS: Boolean(row.ADS ?? row.ads ?? false),
              ads: Boolean(row.ADS ?? row.ads ?? false),
              brand: row.brand ? String(row.brand) : undefined,
              category: row.subcategory ? String(row.subcategory) : undefined,
              rating: typeof row.rating === 'number' ? row.rating : undefined,
              reviews: typeof row.review_count === 'number' ? row.review_count : undefined,
              sales: typeof row.total_sold === 'number' ? row.total_sold : undefined,
              description: String(row.short_description ?? row.full_description ?? ''),
              tags: Array.isArray(row.tags) ? row.tags : [],
              images: imageSrcs.map((src) => ({ src })),
              isOffer: Boolean(row.IsOffer ?? row.isOffer ?? false),
              offerTime: row.OfferTime ? String(row.OfferTime) : row.offerTime ? String(row.offerTime) : undefined,
            } as Product;
          });
          if (!cancelled) setProducts(mapped);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [initialProducts]);

  const allProducts = products;

  const { addToCart, openCart } = useUI();
  const { locale } = useLanguage();
  const isAr = locale === 'ar';

  const [addedIds, setAddedIds] = useState<(string | number)[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
          }
        }),
      { threshold: 0.08 }
    );
    sectionRef.current
      ?.querySelectorAll('.reveal, .reveal-scale, .stagger-item')
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [currentPage]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const end = start + PRODUCTS_PER_PAGE;
    return allProducts.slice(start, end);
  }, [allProducts, currentPage]);

  const totalPages = Math.ceil(allProducts.length / PRODUCTS_PER_PAGE);

  const handleAddToCart = (id: string | number) => {
    const product = allProducts.find((p) => p.id === id);
    if (!product || product.inStock === false) return;

    const imgSrc = typeof product.image === 'string' ? product.image : '';
    addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: imgSrc,
      },
      1
    );

    setAddedIds((prev) => [...prev, id]);
    setTimeout(() => {
      setAddedIds((prev) => prev.filter((x) => x !== id));
      openCart();
    }, 400);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    document
      .querySelector('.product-grid-section')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div
      ref={sectionRef}
      className="min-h-screen text-stone-800 font-sans"
      style={{ background: 'linear-gradient(180deg, #FCFAF3 0%, #F7F3E8 100%)' }}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="max-w-[1440px] mx-auto w-full">
        <div className="mx-3 sm:mx-4 mt-4 overflow-hidden rounded-[28px] shadow-[0_20px_60px_rgba(17,64,47,.12)] border border-white/60">
          <ProductHeroCarousel products={allProducts} />
        </div>
      </div>
      

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-0">
        {initialTrust.length > 0 && <TrustBadges trust={initialTrust} variant="light" />}
      </div>

      {/* ===== PRODUCT GRID SECTION ===== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 product-grid-section">
        {!allProducts.length ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-3xl border border-stone-200 my-4 p-6 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-stone-900">
              {isAr ? 'لا توجد منتجات متاحة حالياً' : 'No products available'}
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mt-1 mb-6">
              {isAr ? 'يرجى التحقق من المتجر لاحقاً.' : 'Please check back later.'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 transition-all duration-300">
              {paginatedProducts.map((product) => (
                <div key={product.id} className="h-full">
                  <ProductCard
                    product={product}
                    href={`/store/${encodeURIComponent(product.slug || String(product.id))}`}
                    onAddToCart={handleAddToCart}
                    added={addedIds.includes(product.id)}
                    showFavorite
                    showCountdown
                  />
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-12 pt-6 border-t border-stone-200">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={allProducts.length}
                  pageSize={PRODUCTS_PER_PAGE}
                  onPageChange={handlePageChange}
                  variant="default"
                  showFirstLast
                  showPageSize
                  showTotal
                  autoScroll
                  className="mt-8"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}