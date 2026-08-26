'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { ProductCard } from '../../components/ProductCard';
import { Pagination } from '../store/components/Pagination';
import type { Product } from '../../types/product';
import Link from 'next/link';

const FAVORITES_PER_PAGE = 8;

export default function FavoritesPage() {
  const { favorites } = useFavorites();
  const { locale } = useLanguage();
  const isAr = locale === 'ar';
  const isFr = locale === 'fr';
  const t = (ar: string, fr: string, en: string) => (isAr ? ar : isFr ? fr : en);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const prevFavorites = useRef(favorites);

  useEffect(() => {
    const prev = prevFavorites.current;
    const changed = prev !== favorites;
    prevFavorites.current = favorites;

    if (favorites.length === 0) {
      if (changed && prev.length > 0) setCurrentPage(1);
      return;
    }

    let cancelled = false;
    setLoading(true);
    async function loadProducts() {
      try {
        const res = await fetch('/api/products');
        const json = await res.json();
        if (cancelled) return;
        if (json.success && Array.isArray(json.data)) {
          const favSet = new Set(favorites);
          const mapped = json.data
            .map((row: Record<string, unknown>) => {
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
                name: String(row.name ?? ''),
                price,
                originalPrice,
                image: imageSrcs[0] ?? '/assets/images/no_image.png',
                imageAlt: String(row.name ?? ''),
                badge: row.featured ? 'Featured' : (row.ADS ? 'ADS' : null),
                inStock: Number(row.stock ?? 0) > 0,
                brand: row.brand ? String(row.brand) : undefined,
                category: row.subcategory ? String(row.subcategory) : undefined,
                rating: typeof row.rating === 'number' ? row.rating : undefined,
                reviews: typeof row.review_count === 'number' ? row.review_count : undefined,
                description: String(row.short_description ?? row.full_description ?? ''),
                tags: Array.isArray(row.tags) ? row.tags : [],
                images: imageSrcs.map((src) => ({ src })),
                isOffer: Boolean(row.IsOffer ?? row.isOffer ?? false),
                offerTime: row.OfferTime ? String(row.OfferTime) : row.offerTime ? String(row.offerTime) : undefined,
              } as Product;
            })
            .filter((p: Product) => favSet.has(String(p.id)));
          setProducts(mapped);
        }
      } catch {}
      if (!cancelled) setLoading(false);
    }
    loadProducts();
    if (changed) setCurrentPage(1);
    return () => { cancelled = true; };
  }, [favorites]);

  const totalPages = Math.ceil((favorites.length === 0 ? 0 : products.length) / FAVORITES_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    if (favorites.length === 0) return [];
    const start = (currentPage - 1) * FAVORITES_PER_PAGE;
    return products.slice(start, start + FAVORITES_PER_PAGE);
  }, [products, currentPage, favorites.length]);

  const isInitialLoading = loading && favorites.length > 0 && products.length === 0;

  return (
    <div
      className="min-h-screen text-[var(--ink)] font-[var(--body)]"
      style={{ background: 'linear-gradient(180deg, var(--bg) 0%, var(--bg2) 100%)' }}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-2xl sm:text-3xl font-bold text-[var(--brand-deep)]"
            style={{ fontFamily: 'var(--disp)' }}
          >
            {t('❤️ المفضلة', '❤️ Favoris', '❤️ Favorites')}
          </h1>
          <p className="text-sm text-[var(--muted)] mt-2">
            {t(
              `لديكِ ${favorites.length} منتج${favorites.length !== 1 ? 'ات' : ''} مفضل${favorites.length !== 1 ? 'ة' : ''}`,
              `Vous avez ${favorites.length} produit${favorites.length !== 1 ? 's' : ''} favori${favorites.length !== 1 ? 's' : ''}`,
              `You have ${favorites.length} favorited product${favorites.length !== 1 ? 's' : ''}`
            )}
          </p>
        </div>

        {/* Loading */}
        {isInitialLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-[var(--brand)] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Empty State */}
        {!isInitialLoading && favorites.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-[var(--card)] rounded-3xl border border-[var(--line)] shadow-[var(--store-shadow)]">
            <div className="w-20 h-20 rounded-full bg-[var(--bg2)] flex items-center justify-center text-4xl mb-4">
              🤍
            </div>
            <h2 className="text-lg font-bold text-[var(--ink)] mb-2">
              {t('لم تضيفي أي منتج بعد', 'Aucun favori pour le moment', 'No favorites yet')}
            </h2>
            <p className="text-sm text-[var(--muted)] max-w-sm mb-6">
              {t(
                'اضغطي على أيقونة القلب في أي منتج لإضافته إلى قائمة المفضلة.',
                "Appuyez sur l'icône cœur sur un produit pour l'ajouter à vos favoris.",
                'Tap the heart icon on any product to add it to your favorites.'
              )}
            </p>
            <Link
              href="/store"
              className="px-6 py-3 rounded-xl font-bold text-sm text-white transition-all shadow-md hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, var(--brand-deep) 0%, var(--brand-deep2) 100%)',
              }}
            >
              {t('تصفح المتجر', 'Parcourir la boutique', 'Browse Store')}
            </Link>
          </div>
        )}

        {/* Products Grid */}
        {!isInitialLoading && paginatedProducts.length > 0 && (
          <>
            <div data-pagination-scroll className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginatedProducts.map((product) => (
                <div key={product.id} className="h-full">
                  <ProductCard
                    product={product}
                    href={`/store/${product.id}`}
                    showFavorite
                    showCountdown
                  />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 pt-6 border-t border-[var(--line)]">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={products.length}
                  pageSize={FAVORITES_PER_PAGE}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
