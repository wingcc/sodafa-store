// SODFA MARKETPLACE - Header Component

import React, { useState, useEffect } from 'react';
import {
  Bell,
  Search,
  ChevronDown,
  User,
  LogOut,
  Settings,
  Menu,
  ShoppingCart,
  Users,
  AlertTriangle,
  Star,
  CreditCard,
  ArrowLeft,
  ArrowRight,
  Sun,
  Moon,
  Languages,
  Check,
  CheckCheck,
  Loader2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useStore } from '../../store/useStore';
import { usePreferencesStore } from '../../store/usePreferencesStore';
import { useTranslation } from '../../i18n/useTranslation';
import { getHeaderIcon, getHeaderBg, formatRelativeTime } from '../notifications/notificationVisuals';

const Header: React.FC = () => {
  const {
    currentPage,
    setCurrentPage,
    searchQuery,
    setSearchQuery,
    notifications,
    unreadNotifications,
    fetchNotifications,
    isLoadingNotifications,
    markNotificationsRead,
    markNotificationAsRead,
    toggleStarNotification,
    toggleSidebar,
  } = useStore();
  const { theme, toggleTheme, language, toggleLanguage } = usePreferencesStore();
  const { t, isRTL } = useTranslation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userInitials, setUserInitials] = useState<string>('??');
  const [signingOut, setSigningOut] = useState(false);
  const router = useRouter();

  // Fetch notifications for bell (shared source of truth with Notification Center)
  useEffect(() => {
    if (notifications.length === 0 && !isLoadingNotifications) {
      fetchNotifications().then(() => {
        // Auto-seed if empty on first load
        const state = useStore.getState();
        if (state.notifications.length === 0 && !state.isLoadingNotifications) {
          fetch('/api/admin/notifications/seed', { method: 'POST' })
            .then(() => fetchNotifications())
            .catch(() => {});
        }
      }).catch(() => {});
    }
  }, [fetchNotifications, notifications.length, isLoadingNotifications]);

  // Fetch the logged-in Supabase user
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      const user = data?.user;
      if (!user) return;
      const email = user.email ?? '';
      const fullName: string =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        '';
      const displayName = fullName || email.split('@')[0] || 'User';
      const initials = fullName
        ? fullName
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((w: string) => w[0].toUpperCase())
            .join('')
        : email.slice(0, 2).toUpperCase();
      setUserName(displayName);
      setUserEmail(email);
      setUserInitials(initials);
    });
  }, []);

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);

    // Clear ALL local auth storage immediately
    try {
      Object.keys(localStorage).forEach(k => { if (k.startsWith('sb-')) localStorage.removeItem(k); });
      Object.keys(sessionStorage).forEach(k => { if (k.startsWith('sb-')) sessionStorage.removeItem(k); });
    } catch {}

    // Fire-and-forget: Supabase signOut + server cookie clear
    try { createClient().auth.signOut({ scope: 'local' }); } catch {}
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});

    // Hard redirect — bypasses React router, layout auth, everything
    window.location.replace('/login');
  };

  const pageTitleMap: Record<string, string> = {
    dashboard: t('header.page.dashboard'),
    products: t('header.page.products'),
    categories: t('header.page.categories'),
    orders: t('header.page.orders'),
    customers: t('header.page.customers'),
    inventory: t('header.page.inventory'),
    reviews: t('header.page.reviews'),
    coupons: t('header.page.coupons'),
    shipping: t('header.page.shipping'),
    payments: t('header.page.payments'),
    analytics: t('header.page.analytics'),
    notifications: t('header.page.notifications'),
    store: t('header.page.store'),
    'store-homepage': t('header.page.store-homepage'),
    'store-homepage-content': t('header.page.store-homepage-content'),
    'store-reviews': t('header.page.store-reviews'),
    'store-settings': t('header.page.store-settings'),
    'store-seo': t('header.page.store-seo'),
    'store-banners': t('header.page.store-banners'),
    'store-featured': t('header.page.store-featured'),
    'store-content': t('header.page.store-content'),
    settings: t('header.page.settings'),
  };

  // Determine if we are on a Store sub‑page
  const isStoreSubPage = typeof currentPage === 'string' && currentPage.startsWith('store-');

  const handleBackToStore = () => {
    setCurrentPage('store');
  };

  const recentNotifications = notifications.slice(0, 5);

  // Accent color helper — uses palette accent instead of hardcoded gold
  const accentColor = `var(--color-accent-${theme === 'dark' ? 'dark' : 'light'}, #d97706)`;

  // Shared visuals — header uses subtle bg + dark icon, same hue as Center.
  // Now supports order status-change: pass whole notification so delivered/cancelled etc get distinct icons.
  const getNotifIcon = (type: string, notification?: any) => getHeaderIcon(type, 15, notification);
  const getNotifBg = (type: string, notification?: any) => getHeaderBg(type, notification);
  const getTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      order: 'Orders', review: 'Reviews', product: 'Products', payment: 'Payments',
      shipping: 'Shipping', promotion: 'Promotions', system: 'System', social: 'Social',
      inventory: 'Inventory', stock: 'Inventory', customer: 'Social', security: 'Security',
    };
    return map[type] ?? type;
  };

  const closeAll = () => {
    setShowNotifications(false);
    setShowProfile(false);
  };

  // Handle click outside — close popups when clicking outside them
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!showNotifications && !showProfile) return;
      const target = e.target as HTMLElement;
      // Don't close if click is inside any popup
      if (target.closest('[data-popup]')) return;
      closeAll();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications, showProfile]);

  return (
    <>
      {/* Backdrop — closes any open dropdown when clicked outside */}
      {(showNotifications || showProfile) && (
        <div className="fixed inset-0 z-40" onClick={closeAll} />
      )}

      <header
        className="h-16 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-50 text-white shadow-lg"
        style={{
          background: 'linear-gradient(135deg, var(--color-darkGreen, #061c16) 0%, var(--color-mediumGreen, #0b2e22) 45%, color-mix(in srgb, var(--color-mediumGreen, #0b2e22) 85%, black) 70%, var(--color-darkGreen, #061c16) 100%)',
          borderBottom: '1px solid color-mix(in srgb, var(--color-gold, #d97706) 14%, transparent)',
          boxShadow: '0 2px 20px rgba(0,0,0,0.4), 0 1px 0 color-mix(in srgb, var(--color-gold, #d97706) 10%, transparent)',
        }}
      >
        {/* Left side */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-lg text-white/70 hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            {/* Back button for store sub‑pages */}
            {isStoreSubPage && (
              <button
                onClick={handleBackToStore}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:bg-white/10"
                style={{ color: accentColor }}
              >
                {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
                <span>{t('header.back')}</span>
              </button>
            )}
            <div>
              <h1 className="text-lg font-bold text-white tracking-wide">{pageTitleMap[currentPage] ?? currentPage}</h1>
              <p className="text-[11px] hidden sm:block font-medium opacity-60">
                {t('header.subtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2.5">
          {/* Search */}
          <div className="hidden md:flex items-center relative">
            <Search size={15} className={`absolute ${isRTL ? 'right-3' : 'left-3'} text-white/30 pointer-events-none`} />
            <input
              type="text"
              placeholder={t('header.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-64 py-2 text-sm text-white placeholder-white/30 focus:outline-none transition-all rounded-xl ${isRTL ? 'pr-9 pl-4' : 'pl-9 pr-4'}`}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              onFocus={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.1)';
                e.target.style.border = `1px solid ${accentColor}73`;
              }}
              onBlur={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.06)';
                e.target.style.border = '1px solid rgba(255,255,255,0.1)';
              }}
            />
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? t('header.theme.light') : t('header.theme.dark')}
            aria-label={t('header.toggleTheme')}
            className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.85)',
            }}
          >
            {theme === 'dark' ? <Sun size={18} style={{ color: accentColor }} /> : <Moon size={18} />}
          </button>

          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            title={t('header.toggleLanguage')}
            aria-label={t('header.toggleLanguage')}
            className="relative w-10 h-10 rounded-xl flex items-center justify-center gap-1 transition-all duration-200 hover:scale-105 active:scale-95 text-xs font-bold"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.85)',
            }}
          >
            <Languages size={15} />
            <span className="hidden sm:inline text-[10px] leading-none">{language === 'ar' ? 'AR' : 'EN'}</span>
          </button>

          {/* Notifications */}
          <div className="relative z-50">
            <button
              onClick={() => {
                setShowNotifications((v) => !v);
                setShowProfile(false);
              }}
              title={t('header.notifications')}
              className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
              style={{
                background: showNotifications
                  ? `color-mix(in srgb, ${accentColor} 18%, transparent)`
                  : 'rgba(255,255,255,0.06)',
                border: showNotifications
                  ? `1px solid color-mix(in srgb, ${accentColor} 40%, transparent)`
                  : '1px solid rgba(255,255,255,0.1)',
                color: showNotifications ? accentColor : 'rgba(255,255,255,0.75)',
              }}
            >
              <Bell size={19} />
              {unreadNotifications > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 text-white text-[10px] font-bold rounded-full flex items-center justify-center pointer-events-none"
                  style={{
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    border: '2px solid var(--color-darkGreen, #0a2c23)',
                    boxShadow: '0 2px 8px rgba(239,68,68,0.5)',
                  }}
                >
                  {unreadNotifications > 99 ? '99+' : unreadNotifications}
                </span>
              )}
            </button>

            {showNotifications && (
              <div
                className={`absolute top-full mt-3 w-80 sm:w-[400px] rounded-2xl overflow-hidden z-50 ${isRTL ? 'left-0' : 'right-0'}`}
                style={{
                  background: '#ffffff',
                  border: '1px solid rgba(0,0,0,0.08)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.12)',
                }}
                data-popup="notifications"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div
                  className="px-5 py-3.5 flex items-center justify-between"
                  style={{ borderBottom: '1px solid #f3f4f6', background: '#fafafa' }}
                >
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-bold text-gray-900 text-sm">{t('header.notifications')}</h3>
                    {unreadNotifications > 0 && (
                      <span className="px-2 py-0.5 text-[11px] font-bold text-red-600 bg-red-50 rounded-full border border-red-100">
                        {unreadNotifications} {t('header.new')}
                      </span>
                    )}
                  </div>
                  {unreadNotifications > 0 && (
                    <button
                      onClick={() => markNotificationsRead()}
                      className="text-xs font-semibold transition-colors hover:opacity-70"
                      style={{ color: accentColor }}
                    >
                      {t('header.markAllRead')}
                    </button>
                  )}
                </div>

                {/* Items */}
                <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-50">
                  {isLoadingNotifications && recentNotifications.length === 0 ? (
                    <div className="py-10 flex flex-col items-center gap-2 text-gray-400">
                      <Loader2 size={18} className="animate-spin text-gray-400" />
                      <span className="text-xs">Loading notifications...</span>
                    </div>
                  ) : recentNotifications.length === 0 ? (
                    <div className="py-10 flex flex-col items-center gap-2 text-gray-400">
                      <Bell size={20} className="text-gray-300" />
                      <span className="text-xs">No notifications</span>
                    </div>
                  ) : (
                    recentNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          if (!notif.read) markNotificationAsRead(notif.id).catch(()=>{});
                          if (notif.actionUrl) {
                            const p = notif.actionUrl.replace(/^\/dashboard\/?/, '') || 'dashboard';
                            setCurrentPage(p as any);
                            setShowNotifications(false);
                          }
                        }}
                        className="px-5 py-3.5 cursor-pointer transition-colors hover:bg-gray-50"
                        style={!notif.read ? { background: `color-mix(in srgb, ${accentColor} 5%, transparent)` } : {}}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-xl ${getNotifBg(notif.type, notif as any)} flex items-center justify-center flex-shrink-0 mt-0.5 border shadow-sm`}>
                            {getNotifIcon(notif.type, notif as any)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-gray-900 truncate">{notif.title}</p>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                {(notif as any).starred && <Star size={12} className="text-amber-500 fill-amber-500" />}
                                {!notif.read && (
                                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: accentColor }} />
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{notif.message}</p>
                            <p className="text-[10px] text-gray-400 mt-1.5 font-medium">
                              {formatRelativeTime(notif.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                <div
                  className="px-5 py-3 text-center"
                  style={{ borderTop: '1px solid #f3f4f6', background: '#fafafa' }}
                >
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      setCurrentPage('notifications');
                    }}
                    className="text-xs font-semibold w-full transition-colors hover:opacity-70"
                    style={{ color: accentColor }}
                  >
                    {t('header.viewAll')}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="w-px h-6 hidden sm:block" style={{ background: 'rgba(255,255,255,0.1)' }} />

          {/* Profile */}
          <div className="relative z-50">
            <button
              onClick={() => {
                setShowProfile((v) => !v);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all duration-200"
              style={{
                background: showProfile ? `color-mix(in srgb, ${accentColor} 12%, transparent)` : 'rgba(255,255,255,0.06)',
                border: showProfile ? `1px solid color-mix(in srgb, ${accentColor} 35%, transparent)` : '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-xs text-white"
                style={{
                  background: accentColor,
                  boxShadow: `0 2px 8px color-mix(in srgb, ${accentColor} 35%, transparent)`,
                }}
              >
                {userInitials}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-white leading-tight">
                  {userName || 'Loading...'}
                </span>
                <span className="text-[10px] leading-tight opacity-50">
                  {userEmail || '—'}
                </span>
              </div>
              <ChevronDown
                size={13}
                className="hidden sm:block ml-0.5 transition-transform duration-200"
                style={{
                  color: 'rgba(255,255,255,0.5)',
                  transform: showProfile ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
            </button>

            {showProfile && (
              <div
                className={`absolute top-full mt-3 w-64 sm:w-72 rounded-2xl overflow-hidden z-50 ${isRTL ? 'left-0' : 'right-0'}`}
                style={{
                  background: '#ffffff',
                  border: '1px solid rgba(0,0,0,0.08)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.12)',
                }}
                data-popup="profile"
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className="px-5 py-4 flex items-center gap-3"
                  style={{ borderBottom: '1px solid #f3f4f6', background: '#fafafa' }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ background: accentColor, boxShadow: `0 4px 12px color-mix(in srgb, ${accentColor} 30%, transparent)` }}
                  >
                    {userInitials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-gray-900 truncate">{userName || '—'}</p>
                    <p className="text-xs text-gray-500 truncate">{userEmail || '—'}</p>
                  </div>
                </div>
                <div className="py-1.5 px-1.5">
                  <button
                    onClick={() => {
                      setShowProfile(false);
                      setCurrentPage('settings');
                    }}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                      <User size={14} className="text-gray-500" />
                    </div>
                    {t('header.profile.myProfile')}
                  </button>
                  <button
                    onClick={() => {
                      setShowProfile(false);
                      setCurrentPage('settings');
                    }}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Settings size={14} className="text-gray-500" />
                    </div>
                    {t('header.profile.settings')}
                  </button>
                  <div className="my-1 mx-3" style={{ borderTop: '1px solid #f3f4f6' }} />
                  <button
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-60"
                  >
                    <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
                      <LogOut size={14} className="text-red-500" />
                    </div>
                    {signingOut ? t('header.profile.signingOut') : t('header.profile.signOut')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
