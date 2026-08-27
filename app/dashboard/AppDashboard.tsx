// app/dashboard/AppDashboard.tsx
// Page-switching router for the Dashboard.
// The outer shell (Sidebar, auth, CSS) is provided by app/dashboard/layout.tsx.
// DashboardLayout (Header + content area) wraps the active page.
'use client';

import React from 'react';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Inventory from './pages/Inventory';
import Reviews from './pages/Reviews';
import Coupons from './pages/Coupons';
import Shipping from './pages/Shipping';
import Payments from './pages/Payments';
import Analytics from './pages/Analytic';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import DashboardNotFound from './pages/DashboardNotFound';
import { useStore } from './store/useStore';
import { usePreferencesStore } from './store/usePreferencesStore';
import { useSlugRouter } from './hooks/useSlugRouter';
import type { PageSection } from './types';

// استيراد مكونات إدارة المتجر الجديدة
import StoreManagerOverview from './pages/store-manager/Overview';
import HomepageManagement from './pages/store-manager/homepage/page';
import PromotionalBannersPage from './pages/store-manager/promotional-banners/page';
import StoreContentPage from './pages/store-manager/store-content/page';

const VALID_PAGE_KEYS = new Set([
  'dashboard', 'products', 'categories', 'orders', 'customers', 'inventory',
  'reviews', 'coupons', 'shipping', 'payments', 'analytics', 'notifications',
  'settings', 'store', 'store-homepage', 'store-homepage-content', 'store-reviews',
  'store-settings', 'store-seo', 'store-banners', 'store-content',
]);

const App: React.FC = () => {
  useSlugRouter();
  const { currentPage, sidebarCollapsed } = useStore();
  const language = usePreferencesStore((s) => s.language);
  const isRTL = language === 'ar';

  // Check if current page is valid (from URL)
  const isValidPage = VALID_PAGE_KEYS.has(currentPage) || currentPage === ('__not_found__' as PageSection);

  const renderPage = () => {
    if (currentPage === ('__not_found__' as PageSection)) return <DashboardNotFound />;
    if (!isValidPage) return <DashboardNotFound />;

    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'products': return <Products />;
      case 'categories': return <Categories />;
      case 'orders': return <Orders />;
      case 'customers': return <Customers />;
      case 'inventory': return <Inventory />;
      case 'reviews': return <Reviews />;
      case 'coupons': return <Coupons />;
      case 'shipping': return <Shipping />;
      case 'payments': return <Payments />;
      case 'analytics': return <Analytics />;
      case 'notifications': return <Notifications />;
      case 'settings': return <Settings />;
      // حالات إدارة المتجر الجديدة
      case 'store': return <StoreManagerOverview />;
      case 'store-homepage': return <HomepageManagement initialTab="sections" />;
      case 'store-homepage-content': return <HomepageManagement initialTab="content" />;
      case 'store-reviews': return <HomepageManagement initialTab="reviews" />;
      case 'store-settings': return <HomepageManagement initialTab="settings" />;
      case 'store-seo': return <HomepageManagement initialTab="seo" />;
      case 'store-banners': return <PromotionalBannersPage />;
      case 'store-content': return <StoreContentPage />;
      default: return <DashboardNotFound />;
    }
  };

  const marginClass = isRTL
    ? (sidebarCollapsed ? 'mr-[72px]' : 'mr-[260px]')
    : (sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]');
  return (
    <div
      className={`flex flex-col transition-all duration-300 ${marginClass} min-h-screen`}
    >
      <Header />
      <main className="p-4 lg:p-6 flex-1">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;