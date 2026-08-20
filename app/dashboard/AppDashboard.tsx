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
import Analytics from './pages/Analytics';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import { useStore } from './store/useStore';

// استيراد مكونات إدارة المتجر الجديدة
import StoreManagerOverview from './pages/store-manager/Overview';
import HomepageManagement from './pages/store-manager/homepage/page';
import PromotionalBannersPage from './pages/store-manager/promotional-banners/page';
import StoreContentPage from './pages/store-manager/store-content/page';

const App: React.FC = () => {
  const { currentPage, sidebarCollapsed } = useStore();

  const renderPage = () => {
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
      case 'store-homepage': return <HomepageManagement />;
      case 'store-banners': return <PromotionalBannersPage />;
      case 'store-content': return <StoreContentPage />;
      default: return <Dashboard />;
    }
  };

  return (
    <div
      className={`flex flex-col transition-all duration-300 ${
        sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'
      } min-h-screen`}
    >
      <Header />
      <main className="p-4 lg:p-6 flex-1">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;