'use client';

/* eslint-disable react-hooks/set-state-in-effect -- data fetching requires setState in useEffect */
import { useState, useEffect, useCallback, useRef } from 'react';
import type { Product } from '../types/product';

interface UseProductsOptions {
  /** Maximum number of products to fetch */
  limit?: number;
  /** Filter by category slug */
  category?: string;
  /** Filter by featured flag */
  featured?: boolean;
  /** Only return products marked to be shown in store */
  showInStore?: boolean;
  /** Filter by tag (text[] column) */
  tag?: string;
  /** Filter by ADS flag */
  ads?: boolean;
  /** Filter by product status */
  status?: string;
}

interface UseProductsResult {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProducts(options: UseProductsOptions = {}): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchProducts = useCallback(async () => {
    if (!mountedRef.current) return;
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (options.limit) params.set('limit', String(options.limit));
      if (options.category) params.set('category', options.category);
      if (options.featured !== undefined) params.set('featured', String(options.featured));
      if (options.showInStore !== undefined) params.set('showInStore', String(options.showInStore));
      if (options.tag) params.set('tag', options.tag);
      if (options.ads !== undefined) params.set('ads', String(options.ads));
      if (options.status) params.set('status', options.status);

      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const json = await res.json();
      if (mountedRef.current) {
        const mapped = (json.data ?? []).map((row: Record<string, unknown>) => {
          const regularPrice = typeof row.regular_price === 'number' ? row.regular_price : 0;
          const salePrice = typeof row.sale_price === 'number' ? row.sale_price : null;
          const price: number = salePrice ?? regularPrice;
          const originalPrice: number | null = salePrice !== null ? regularPrice : null;
          const imageSrcs = Array.isArray(row.images)
            ? row.images.map((img: unknown) => {
                if (typeof img === 'string') return img;
                if (img && typeof img === 'object' && 'src' in img) return String((img as { src: unknown }).src ?? '');
                return '';
              }).filter(Boolean)
            : [];
          const images = imageSrcs.map((src) => ({ src }));
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
            images,
          } as Product;
        });
        setProducts(mapped);
      }
    } catch {
      if (mountedRef.current) {
        setError('Using offline data');
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [options.limit, options.category, options.featured, options.showInStore, options.tag, options.ads, options.status]);

  useEffect(() => {
    mountedRef.current = true;
    fetchProducts();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchProducts]);

  return { products, isLoading, error, refetch: fetchProducts };
}
