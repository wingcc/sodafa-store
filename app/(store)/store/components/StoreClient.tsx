'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { Product } from '../../../types/product';
import { ProductCard } from '../../../components/ProductCard';
 
import { ProductHeroCarousel } from './ProductHeroCarousel';
import { Pagination } from './Pagination';
import { useUI } from '../../../contexts/UIContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Search, Sparkles, Filter, Grid, List, X, ArrowUpDown } from 'lucide-react';

const CATEGORIES_DATA = [
  { value: 'All', ar: 'الكل', en: 'All', icon: '✨' },
  { value: 'Skincare', ar: 'عناية بالبشرة', en: 'Skincare', icon: '🧴' },
  { value: 'Supplements', ar: 'مكملات غذائية', en: 'Supplements', icon: '💊' },
  { value: 'Body Care', ar: 'عناية بالجسم', en: 'Body Care', icon: '<ctrl42>' },
  { value: 'Devices', ar: 'أجهزة التجميل', en: 'Devices', icon: '⚡' },
  { value: 'Nutrition', ar: 'تغذية صحية', en: 'Nutrition', icon: '🥗' },
];

const SORT_OPTIONS_DATA = [
  { value: 'featured', ar: 'المميزة أولاً', en: 'Featured', icon: '⭐' },
  { value: 'price-asc', ar: 'السعر: من الأقل للأعلى', en: 'Price: Low to High', icon: '↑' },
  { value: 'price-desc', ar: 'السعر: من الأعلى للأقل', en: 'Price: High to Low', icon: '↓' },
  { value: 'rating', ar: 'الأعلى تقييماً', en: 'Top Rated', icon: '★' },
];

const PRODUCTS_PER_PAGE = 8;

interface StoreClientProps {
  initialProducts?: Product[];
}

export default function StoreClient({ initialProducts }: StoreClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts ?? []);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      setProducts(initialProducts);
      return;
    }
    setIsLoading(true);
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
            } as Product;
          });
          setProducts(mapped);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [initialProducts]);

  const allProducts = products;

  const { addToCart, openCart } = useUI();
  const { locale } = useLanguage();
  const isAr = locale === 'ar';

  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [search, setSearch] = useState('');
  const [addedIds, setAddedIds] = useState<(string | number)[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
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
  }, [activeCategory, currentPage]);

  // Filter and sort products
  const filtered = useMemo(() => {
    return allProducts.filter(
      (p) => activeCategory === 'All' || p.category === activeCategory
    )
      .filter((p) => {
        const lowerSearch = search.toLowerCase();
        return (
          search === '' ||
          p.name.toLowerCase().includes(lowerSearch) ||
          (p.brand ?? '').toLowerCase().includes(lowerSearch) ||
          (p.category ?? '').toLowerCase().includes(lowerSearch)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return (b.rating ?? 0) - (a.rating ?? 0);
        return 0;
      });
  }, [allProducts, activeCategory, search, sortBy]);

  // Paginate
  const totalPages = Math.ceil(filtered.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const end = start + PRODUCTS_PER_PAGE;
    return filtered.slice(start, end);
  }, [filtered, currentPage]);

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

  const clearFilters = () => {
    setSearch('');
    setActiveCategory('All');
    setCurrentPage(1);
  };

  const getCategoryLabel = (catValue: string) => {
    const found = CATEGORIES_DATA.find((c) => c.value === catValue);
    return isAr ? found?.ar : found?.en;
  };

  const getCategoryIcon = (catValue: string) => {
    const found = CATEGORIES_DATA.find((c) => c.value === catValue);
    return found?.icon || '✨';
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    document
      .querySelector('.product-grid-section')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    if (isLoading) return;
    setCurrentPage(1);
  }, [activeCategory, search, sortBy, isLoading]);

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
      

      {/* ===== CONTROLS BAR — 2026 floating glass pill ===== */}
      <div className="store-controls-pill">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          {/* Top row: Search + Sort + View toggle */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <div
                className={`relative flex items-center rounded-xl border bg-stone-50/80 transition-all duration-200 ${
                  isSearchFocused
                    ? 'border-emerald-800 ring-2 ring-emerald-800/10 bg-white shadow-sm'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <Search
                  className={`w-4 h-4 absolute ${isAr ? 'right-3.5' : 'left-3.5'} transition-colors ${
                    isSearchFocused ? 'text-emerald-800' : 'text-stone-400'
                  }`}
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  placeholder={
                    isAr
                      ? 'ابحثي عن المنتجات، الماركات، الأقسام...'
                      : 'Search products, brands, categories...'
                  }
                  className={`w-full py-2.5 ${
                    isAr ? 'pr-10 pl-10' : 'pl-10 pr-10'
                  } bg-transparent text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none`}
                  aria-label="Search products"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className={`absolute ${isAr ? 'left-3' : 'right-3'} p-1 rounded-full hover:bg-stone-200/60 transition-colors`}
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5 text-stone-500" />
                  </button>
                )}
              </div>
            </div>

            {/* Right controls: Sort + Grid/List Toggle */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={`appearance-none bg-stone-50 border border-stone-200 rounded-xl py-2.5 ${
                    isAr ? 'pl-9 pr-4' : 'pr-9 pl-4'
                  } text-xs font-bold text-stone-800 cursor-pointer hover:bg-stone-100 transition-colors focus:outline-none focus:border-emerald-800`}
                >
                  {SORT_OPTIONS_DATA.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.icon} {isAr ? opt.ar : opt.en}
                    </option>
                  ))}
                </select>
                <ArrowUpDown
                  className={`w-3.5 h-3.5 absolute ${
                    isAr ? 'left-3' : 'right-3'
                  } top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none`}
                />
              </div>

              {/* View Toggle (Grid / List) */}
              <div className="flex items-center gap-1 bg-stone-100 rounded-xl border border-stone-200 p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white shadow-xs text-stone-900 font-bold'
                      : 'text-stone-400 hover:text-stone-700'
                  }`}
                  aria-label="Grid view"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-all ${
                    viewMode === 'list'
                      ? 'bg-white shadow-xs text-stone-900 font-bold'
                      : 'text-stone-400 hover:text-stone-700'
                  }`}
                  aria-label="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Category Pills — segmented pill */}
          <div className="flex gap-2 mt-3.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES_DATA.map((cat) => (
              <button
                key={cat.value}
                onClick={() => {
                  setActiveCategory(cat.value);
                  setCurrentPage(1);
                }}
                className={`flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border transition-all duration-200 ${
                  activeCategory === cat.value
                    ? 'bg-[#07231A] text-[#E8CE93] border-[#07231A] shadow-sm'
                    : 'bg-white text-stone-600 border-[var(--line)] hover:border-[#1E7A57]/30 hover:text-[#07231A]'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{isAr ? cat.ar : cat.en}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ===== PRODUCT GRID SECTION ===== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 product-grid-section">
        {/* Results Header */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs sm:text-sm text-stone-500 font-medium">
              {isAr ? (
                <>
                  عرض <strong className="text-stone-900 font-bold">{filtered.length}</strong> منتج
                  {activeCategory !== 'All' && (
                    <span className="inline-flex items-center gap-1 mx-1 text-emerald-800 font-bold">
                      في قسم {getCategoryLabel(activeCategory)} {getCategoryIcon(activeCategory)}
                    </span>
                  )}
                  {search && (
                    <span className="inline-flex items-center gap-1 mx-1 text-[#cda552] font-bold">
                      · تطابق &quot;{search}&quot;
                    </span>
                  )}
                </>
              ) : (
                <>
                  Showing <strong className="text-stone-900 font-bold">{filtered.length}</strong> products
                  {activeCategory !== 'All' && (
                    <span className="inline-flex items-center gap-1 mx-1 text-emerald-800 font-bold">
                      in {getCategoryLabel(activeCategory)} {getCategoryIcon(activeCategory)}
                    </span>
                  )}
                  {search && (
                    <span className="inline-flex items-center gap-1 mx-1 text-[#cda552] font-bold">
                      · matching &quot;{search}&quot;
                    </span>
                  )}
                </>
              )}
            </p>

            {(search || activeCategory !== 'All') && (
              <button
                onClick={clearFilters}
                className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>{isAr ? 'إلغاء التصفية' : 'Clear filters'}</span>
              </button>
            )}
          </div>
        )}

        {/* Empty State */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-3xl border border-stone-200 my-4 p-6 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-stone-900">
              {isAr ? 'لم نجد أي نتائج تطابق بحثكِ' : 'No products found'}
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mt-1 mb-6">
              {isAr
                ? 'جربي التفتيش عن كلمة أخرى أو تصفحي أقسام المنتجات المختلفة.'
                : 'Try adjusting your search terms or browse our category pills.'}
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-2.5 rounded-xl font-bold text-xs text-white transition-all shadow-md hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #061c16 0%, #0b2e22 100%)',
                color: '#f7ebd0',
              }}
            >
              {isAr ? 'عرض جميع المنتجات' : 'Browse All Products'}
            </button>
          </div>
        ) : (
          <>
            {/* Product Cards Grid */}
            <div
              className={`
                grid gap-6 transition-all duration-300
                ${
                  viewMode === 'grid'
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                    : 'grid-cols-1 max-w-3xl mx-auto'
                }
              `}
            >
              {paginatedProducts.map((product) => (
                <div key={product.id} className="h-full">
                  <ProductCard
                    product={product}
                    href={`/store/${product.id}`}
                    onAddToCart={handleAddToCart}
                    added={addedIds.includes(product.id)}
                  />
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 pt-6 border-t border-stone-200">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filtered.length}
                  pageSize={PRODUCTS_PER_PAGE}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}