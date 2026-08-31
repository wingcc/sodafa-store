'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useStore } from '../store/useStore';
import type { PageSection } from '../types';

const VALID_PAGES: Record<string, PageSection> = {
  dashboard: 'dashboard',
  products: 'products',
  categories: 'categories',
  orders: 'orders',
  customers: 'customers',
  inventory: 'inventory',
  reviews: 'reviews',
  coupons: 'coupons',
  shipping: 'shipping',
  payments: 'payments',
  analytics: 'analytics',
  logs: 'logs',
  notifications: 'notifications',
  messages: 'messages',
  settings: 'settings',
  store: 'store',
  'store-homepage': 'store-homepage',
  'store-homepage-content': 'store-homepage-content',
  'store-reviews': 'store-reviews',
  'store-settings': 'store-settings',
  'store-seo': 'store-seo',
  'store-banners': 'store-banners',
  'store-content': 'store-content',
  // legacy alias for direct URL /dashboard/store-featured (maps to same as store-banners/content if needed)
  'store-featured': 'store-banners' as PageSection,
};

/**
 * Reads the URL slug on mount and sets the dashboard page + search query.
 * Supports /dashboard, /dashboard/orders, /dashboard/orders/ORD-123, etc.
 */
export function useSlugRouter() {
  const params = useParams();
  const setCurrentPage = useStore((s) => s.setCurrentPage);
  const setPendingNavigation = useStore((s) => s.setPendingNavigation);

  useEffect(() => {
    const slug = params?.slug;
    const segments: string[] = Array.isArray(slug) ? slug : slug ? [slug] : [];

    if (segments.length === 0) {
      // /dashboard → default dashboard page
      setCurrentPage('dashboard');
      return;
    }

    const pageKey = segments[0];
    const pageSection = VALID_PAGES[pageKey];

    if (!pageSection) {
      // Unknown page — set to a marker so AppDashboard shows NotFound
      // Use an invalid page section value that AppDashboard recognizes
      setCurrentPage('__not_found__' as PageSection);
      return;
    }

    setCurrentPage(pageSection);

    // If there's a second segment, it's an item ID — set as search query
    if (segments.length > 1) {
      const itemId = segments.slice(1).join('/');
      setPendingNavigation({
        page: pageSection,
        searchQuery: decodeURIComponent(itemId),
        action: 'open',
      });
    }
  }, [params, setCurrentPage, setPendingNavigation]);
}
