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
  ArrowLeft, // ← new icon for back button
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useStore } from '../../store/useStore';
import { COLORS } from '../../theme/colors';

const Header: React.FC = () => {
  const {
    currentPage,
    setCurrentPage,
    searchQuery,
    setSearchQuery,
    notifications,
    unreadNotifications,
    markNotificationsRead,
    markNotificationAsRead,
    toggleSidebar,
  } = useStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userInitials, setUserInitials] = useState<string>('??');
  const [signingOut, setSigningOut] = useState(false);
  const router = useRouter();

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
    setSigningOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      window.location.href = '/login';
    }
  };

  const pageTitle: Record<string, string> = {
    dashboard: 'Dashboard',
    products: 'Products',
    categories: 'Categories',
    orders: 'Orders',
    customers: 'Customers',
    inventory: 'Inventory',
    reviews: 'Reviews',
    coupons: 'Discounts & Coupons',
    shipping: 'Shipping',
    payments: 'Payments',
    analytics: 'Analytics',
    notifications: 'Notifications',
    store: 'Store Management',
    'store-homepage': 'Home Page',
    'store-homepage-content': 'Homepage Contents',
    'store-reviews': 'Homepage Reviews',
    'store-settings': 'Storefront Settings',
    'store-seo': 'SEO',
    'store-banners': 'Promotional Banners',
    'store-featured': 'Featured Products',
    'store-content': 'Store Content',
    settings: 'Settings',
  };

  // Determine if we are on a Store sub‑page
  const isStoreSubPage = typeof currentPage === 'string' && currentPage.startsWith('store-');

  const handleBackToStore = () => {
    setCurrentPage('store');
  };

  const recentNotifications = notifications.slice(0, 5);

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'order': return <ShoppingCart size={15} className="text-purple-500" />;
      case 'customer': return <Users size={15} className="text-sky-500" />;
      case 'stock': return <AlertTriangle size={15} className="text-amber-500" />;
      case 'review': return <Star size={15} className="text-pink-500" />;
      case 'payment': return <CreditCard size={15} className="text-emerald-500" />;
      default: return <Bell size={15} className="text-gray-500" />;
    }
  };

  const getNotifBg = (type: string) => {
    switch (type) {
      case 'order': return 'bg-purple-50';
      case 'customer': return 'bg-sky-50';
      case 'stock': return 'bg-amber-50';
      case 'review': return 'bg-pink-50';
      case 'payment': return 'bg-emerald-50';
      default: return 'bg-gray-50';
    }
  };

  const closeAll = () => {
    setShowNotifications(false);
    setShowProfile(false);
  };

  return (
    <>
      {/* Backdrop — closes any open dropdown when clicked outside */}
      {(showNotifications || showProfile) && (
        <div className="fixed inset-0 z-40" onClick={closeAll} />
      )}

      <header
        className="h-16 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-50 text-white shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #061c16 0%, #0b2e22 40%, #0d3428 70%, #061c16 100%)',
          borderBottom: '1px solid rgba(205,165,82,0.12)',
          boxShadow: '0 2px 20px rgba(0,0,0,0.4), 0 1px 0 rgba(205,165,82,0.08)',
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
                style={{ color: '#cda552' }}
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
            )}
            <div>
              <h1 className="text-lg font-bold text-white tracking-wide">{pageTitle[currentPage]}</h1>
              <p className="text-[11px] hidden sm:block font-medium" style={{ color: '#cda552cc' }}>
                SODFA MARKETPLACE Admin
              </p>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2.5">
          {/* Search */}
          <div className="hidden md:flex items-center relative">
            <Search size={15} className="absolute left-3 text-white/30 pointer-events-none" />
            <input
              type="text"
              placeholder="Search products, orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-9 pr-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none transition-all rounded-xl"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              onFocus={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.1)';
                e.target.style.border = '1px solid rgba(205,165,82,0.45)';
              }}
              onBlur={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.06)';
                e.target.style.border = '1px solid rgba(255,255,255,0.1)';
              }}
            />
          </div>

          {/* Notifications */}
          <div className="relative z-50">
            <button
              onClick={() => {
                setShowNotifications((v) => !v);
                setShowProfile(false);
              }}
              title="Notifications"
              className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
              style={{
                background: showNotifications
                  ? 'rgba(205,165,82,0.18)'
                  : 'rgba(255,255,255,0.06)',
                border: showNotifications
                  ? '1px solid rgba(205,165,82,0.4)'
                  : '1px solid rgba(255,255,255,0.1)',
                color: showNotifications ? '#cda552' : 'rgba(255,255,255,0.75)',
              }}
            >
              <Bell size={19} />
              {unreadNotifications > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 text-white text-[10px] font-bold rounded-full flex items-center justify-center pointer-events-none"
                  style={{
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    border: '2px solid #061c16',
                    boxShadow: '0 2px 8px rgba(239,68,68,0.5)',
                  }}
                >
                  {unreadNotifications > 99 ? '99+' : unreadNotifications}
                </span>
              )}
            </button>

            {showNotifications && (
              <div
                className="absolute right-0 top-full mt-3 w-80 sm:w-[400px] rounded-2xl overflow-hidden z-50"
                style={{
                  background: '#ffffff',
                  border: '1px solid rgba(0,0,0,0.08)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.12)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div
                  className="px-5 py-3.5 flex items-center justify-between"
                  style={{ borderBottom: '1px solid #f3f4f6', background: '#fafafa' }}
                >
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
                    {unreadNotifications > 0 && (
                      <span className="px-2 py-0.5 text-[11px] font-bold text-red-600 bg-red-50 rounded-full border border-red-100">
                        {unreadNotifications} new
                      </span>
                    )}
                  </div>
                  {unreadNotifications > 0 && (
                    <button
                      onClick={() => markNotificationsRead()}
                      className="text-xs font-semibold transition-colors hover:opacity-70"
                      style={{ color: COLORS.gold }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Items */}
                <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-50">
                  {recentNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationAsRead(notif.id)}
                      className="px-5 py-3.5 cursor-pointer transition-colors hover:bg-gray-50"
                      style={!notif.read ? { background: 'rgba(205,165,82,0.05)' } : {}}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-xl ${getNotifBg(notif.type)} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          {getNotifIcon(notif.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-gray-900 truncate">{notif.title}</p>
                            {!notif.read && (
                              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#cda552' }} />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{notif.message}</p>
                          <p className="text-[10px] text-gray-400 mt-1.5 font-medium">
                            {new Date(notif.timestamp).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
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
                    style={{ color: COLORS.gold }}
                  >
                    View all notifications →
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
                background: showProfile ? 'rgba(205,165,82,0.12)' : 'rgba(255,255,255,0.06)',
                border: showProfile ? '1px solid rgba(205,165,82,0.35)' : '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-xs text-white"
                style={{
                  background: 'linear-gradient(135deg, #cda552, #9a7635)',
                  boxShadow: '0 2px 8px rgba(205,165,82,0.35)',
                }}
              >
                {userInitials}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-white leading-tight">
                  {userName || 'Loading...'}
                </span>
                <span className="text-[10px] leading-tight" style={{ color: '#cda552aa' }}>
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
                className="absolute right-0 top-full mt-3 w-64 sm:w-72 rounded-2xl overflow-hidden z-50"
                style={{
                  background: '#ffffff',
                  border: '1px solid rgba(0,0,0,0.08)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.12)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className="px-5 py-4 flex items-center gap-3"
                  style={{ borderBottom: '1px solid #f3f4f6', background: '#fafafa' }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #cda552, #9a7635)', boxShadow: '0 4px 12px rgba(205,165,82,0.3)' }}
                  >
                    {userInitials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-gray-900 truncate">{userName || '—'}</p>
                    <p className="text-xs text-gray-500 truncate">{userEmail || '—'}</p>
                  </div>
                </div>
                <div className="py-1.5 px-1.5">
                  <button className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                      <User size={14} className="text-gray-500" />
                    </div>
                    My Profile
                  </button>
                  <button className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Settings size={14} className="text-gray-500" />
                    </div>
                    Settings
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
                    {signingOut ? 'Signing out...' : 'Sign Out'}
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