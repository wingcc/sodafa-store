'use client';

import React, { useEffect, useState } from 'react';
import {
  Home,
  ArrowLeft,
  Search,
  ShoppingCart,
  Package,
  Users,
  Bell,
  Settings,
  LayoutGrid,
  Receipt,
  Truck,
  BarChart3,
  Tag,
  FileText,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { usePreferencesStore } from '../store/usePreferencesStore';
import type { PageSection } from '../types';

interface QuickLink {
  label: string;
  page: PageSection;
  icon: React.ReactNode;
  color: string;
}

const quickLinks: QuickLink[] = [
  { label: 'Dashboard',   page: 'dashboard',     icon: <Home size={18} />,           color: 'from-emerald-500 to-teal-600' },
  { label: 'Orders',      page: 'orders',        icon: <ShoppingCart size={18} />,   color: 'from-indigo-500 to-blue-600' },
  { label: 'Products',    page: 'products',      icon: <Package size={18} />,        color: 'from-violet-500 to-purple-600' },
  { label: 'Customers',   page: 'customers',     icon: <Users size={18} />,          color: 'from-cyan-500 to-sky-600' },
  { label: 'Reviews',     page: 'reviews',       icon: <FileText size={18} />,       color: 'from-amber-500 to-orange-600' },
  { label: 'Coupons',     page: 'coupons',       icon: <Tag size={18} />,            color: 'from-pink-500 to-rose-600' },
  { label: 'Shipping',    page: 'shipping',      icon: <Truck size={18} />,          color: 'from-teal-500 to-emerald-600' },
  { label: 'Analytics',   page: 'analytics',     icon: <BarChart3 size={18} />,      color: 'from-blue-500 to-indigo-600' },
  { label: 'Inventory',   page: 'inventory',     icon: <LayoutGrid size={18} />,     color: 'from-orange-500 to-red-600' },
  { label: 'Payments',    page: 'payments',      icon: <Receipt size={18} />,        color: 'from-green-500 to-emerald-600' },
  { label: 'Notifications', page: 'notifications', icon: <Bell size={18} />,         color: 'from-rose-500 to-pink-600' },
  { label: 'Settings',    page: 'settings',      icon: <Settings size={18} />,       color: 'from-slate-500 to-gray-600' },
];

const DashboardNotFound: React.FC = () => {
  const setCurrentPage = useStore((s) => s.setCurrentPage);
  const language = usePreferencesStore((s) => s.language);
  const isRTL = language === 'ar';
  const [mounted, setMounted] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Trigger glitch animation periodically
    const interval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 200);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Animated background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/5 dark:bg-emerald-500/3 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/5 dark:bg-amber-500/3 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-slate-100/50 to-transparent dark:from-white/2 rounded-full" />
      </div>

      <div className="relative z-10 max-w-2xl w-full">
        {/* 404 Number with glitch effect */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <h1
              className={`text-[10rem] md:text-[14rem] font-black leading-none tracking-tighter select-none ${
                glitchActive ? 'animate-pulse' : ''
              }`}
              style={{
                background: 'linear-gradient(135deg, var(--color-darkGreen, #0a2c23) 0%, var(--color-gold, #d97706) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: glitchActive ? 'hue-rotate(20deg)' : 'none',
                transition: 'filter 0.1s',
              }}
            >
              404
            </h1>
            {/* Glitch overlay lines */}
            {glitchActive && (
              <>
                <div
                  className="absolute inset-0 text-[10rem] md:text-[14rem] font-black leading-none tracking-tighter text-red-500/20 select-none"
                  style={{ transform: 'translate(2px, -1px)', clipPath: 'inset(20% 0 60% 0)' }}
                >
                  404
                </div>
                <div
                  className="absolute inset-0 text-[10rem] md:text-[14rem] font-black leading-none tracking-tighter text-blue-500/20 select-none"
                  style={{ transform: 'translate(-2px, 1px)', clipPath: 'inset(60% 0 10% 0)' }}
                >
                  404
                </div>
              </>
            )}
          </div>

          {/* Subtitle */}
          <div className="mt-[-2rem] md:mt-[-3rem]">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-3">
              {language === 'ar' ? 'الصفحة غير موجودة' : 'Page Not Found'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base max-w-md mx-auto leading-relaxed">
              {language === 'ar'
                ? 'يبدو أنك ضعت في الطريق. الصفحة التي تبحث عنها غير موجودة أو تم نقلها.'
                : 'Looks like you\'ve wandered off the path. The page you\'re looking for doesn\'t exist or has been moved.'}
            </p>
          </div>
        </div>

        {/* Search bar hint */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-500 text-sm">
            <Search size={14} />
            <span>{language === 'ar' ? 'جرب البحث في الشريط الجانبي' : 'Try searching from the sidebar'}</span>
          </div>
        </div>

        {/* Quick navigation grid */}
        <div className="mb-10">
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center mb-4">
            {language === 'ar' ? 'الانتقال السريع' : 'Quick Navigation'}
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {quickLinks.map((link) => (
              <button
                key={link.page}
                onClick={() => setCurrentPage(link.page)}
                className="group flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white dark:bg-[var(--dashboard-card-dark,#131a28)] border border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-black/20"
              >
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${link.color} flex items-center justify-center text-white shadow-sm group-hover:shadow-md transition-shadow`}>
                  {link.icon}
                </div>
                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
                  {link.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="group px-5 py-2.5 rounded-xl text-sm font-medium border border-slate-200 dark:border-white/10 bg-white dark:bg-[var(--dashboard-card-dark,#131a28)] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-all duration-200 flex items-center gap-2 hover:shadow-md"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            {language === 'ar' ? 'رجوع' : 'Go Back'}
          </button>
          <button
            onClick={() => setCurrentPage('dashboard')}
            className="group px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-200 flex items-center gap-2 hover:shadow-lg hover:shadow-emerald-500/25"
            style={{
              background: 'linear-gradient(135deg, var(--color-darkGreen, #0a2c23) 0%, var(--color-darkGreen, #0a2c23) 100%)',
            }}
          >
            <Home size={16} className="group-hover:scale-110 transition-transform" />
            {language === 'ar' ? 'الصفحة الرئيسية' : 'Dashboard'}
          </button>
        </div>

        {/* Fun error details */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-white/3 border border-slate-100 dark:border-white/5">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
              Error 404 · {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardNotFound;
