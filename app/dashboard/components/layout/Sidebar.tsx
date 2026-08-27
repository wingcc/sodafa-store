// SODFA MARKETPLACE - Sidebar Navigation

import React from 'react';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  Warehouse,
  Star,
  Ticket,
  Truck,
  CreditCard,
  BarChart3,
  Bell,
  Store,
  Settings,
  Search,
  ExternalLink,
  ChevronsLeft,
  ChevronsRight,
  ScrollText,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { usePreferencesStore } from '../../store/usePreferencesStore';
import { useTranslation } from '../../i18n/useTranslation';
import type { PageSection } from '../../types';

interface NavItemDef {
  id: PageSection;
  icon: React.ReactNode;
  labelKey: string;
  groupKey: string;
}

const navDefs: NavItemDef[] = [
  { id: 'dashboard', icon: <LayoutDashboard size={19} />, labelKey: 'sidebar.dashboard', groupKey: 'sidebar.intelligence' },
  { id: 'analytics', icon: <BarChart3 size={19} />, labelKey: 'sidebar.analytics', groupKey: 'sidebar.intelligence' },
  { id: 'logs', icon: <ScrollText size={19} />, labelKey: 'sidebar.logs', groupKey: 'sidebar.intelligence' },
  { id: 'products', icon: <Package size={19} />, labelKey: 'sidebar.products', groupKey: 'sidebar.catalog' },
  { id: 'categories', icon: <FolderTree size={19} />, labelKey: 'sidebar.categories', groupKey: 'sidebar.catalog' },
  { id: 'orders', icon: <ShoppingCart size={19} />, labelKey: 'sidebar.orders', groupKey: 'sidebar.sales' },
  { id: 'customers', icon: <Users size={19} />, labelKey: 'sidebar.customers', groupKey: 'sidebar.sales' },
  { id: 'inventory', icon: <Warehouse size={19} />, labelKey: 'sidebar.inventory', groupKey: 'sidebar.operations' },
  { id: 'reviews', icon: <Star size={19} />, labelKey: 'sidebar.reviews', groupKey: 'sidebar.operations' },
  { id: 'coupons', icon: <Ticket size={19} />, labelKey: 'sidebar.coupons', groupKey: 'sidebar.marketing' },
  { id: 'shipping', icon: <Truck size={19} />, labelKey: 'sidebar.shipping', groupKey: 'sidebar.operations' },
  { id: 'payments', icon: <CreditCard size={19} />, labelKey: 'sidebar.payments', groupKey: 'sidebar.finance' },
  { id: 'notifications', icon: <Bell size={19} />, labelKey: 'sidebar.notifications', groupKey: 'sidebar.system' },
  { id: 'store', icon: <Store size={19} />, labelKey: 'sidebar.store', groupKey: 'sidebar.system' },
  { id: 'settings', icon: <Settings size={19} />, labelKey: 'sidebar.settings', groupKey: 'sidebar.system' },
];

const Sidebar: React.FC = () => {
  const { currentPage, setCurrentPage, sidebarCollapsed, toggleSidebar, searchQuery, setSearchQuery, unreadNotifications } = useStore();
  const { t, isRTL } = useTranslation();
  const prefTheme = usePreferencesStore((s) => s.theme);

  const groups = navDefs.reduce<Record<string, NavItemDef[]>>((acc, item) => {
    const groupLabel = t(item.groupKey as any);
    if (!acc[groupLabel]) acc[groupLabel] = [];
    acc[groupLabel].push(item);
    return acc;
  }, {});

  const filteredGroups = Object.entries(groups).reduce<Record<string, NavItemDef[]>>((acc, [group, items]) => {
    const filtered = items.filter((item) =>
      t(item.labelKey as any).toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filtered.length > 0) acc[group] = filtered;
    return acc;
  }, {});

  const positionStyle: React.CSSProperties = isRTL
    ? { right: 0, left: 'auto', borderLeft: '1px solid rgba(255,255,255,0.08)', borderRight: 'none' }
    : { left: 0, right: 'auto' };

  return (
    <aside
      className={`fixed top-0 h-full text-white z-40 transition-all duration-300 flex flex-col ${
        sidebarCollapsed ? 'w-[72px]' : 'w-[260px]'
      }`}
      style={{
        background: 'var(--color-darkGreen, #0a2c23)',
        borderRight: isRTL ? undefined : '1px solid rgba(255,255,255,0.08)',
        boxShadow: isRTL ? '-4px 0 24px rgba(0,0,0,0.35)' : '4px 0 24px rgba(0,0,0,0.35)',
        ...positionStyle,
      }}
    >
      {/* Logo */}
      <div
        className="h-16 flex items-center px-4 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: `var(--color-accent-${prefTheme === 'dark' ? 'dark' : 'light'}, #d97706)`,
              boxShadow: `0 4px 14px var(--color-accent-${prefTheme === 'dark' ? 'dark' : 'light'}, #d97706)33`,
            }}
          >
            <span className="text-white font-bold text-sm">S</span>
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <h1 className="text-sm font-bold tracking-widest text-white truncate">SODFA</h1>
              <p className="text-[10px] tracking-widest uppercase font-medium opacity-50">
                Marketplace
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Search */}
      {!sidebarCollapsed && (
        <div className="px-3 pt-3 pb-1 flex-shrink-0">
          <div className="relative">
            <Search size={14} className={`absolute top-1/2 -translate-y-1/2 pointer-events-none ${isRTL ? 'right-3' : 'left-3'}`} style={{ color: 'rgba(255,255,255,0.3)' }} />
            <input
              type="text"
              placeholder={t('sidebar.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full py-2 text-sm text-white placeholder-white/30 focus:outline-none transition-all rounded-lg ${isRTL ? 'pr-8 pl-3' : 'pl-8 pr-3'}`}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
              onFocus={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.09)';
                e.target.style.border = '1px solid var(--color-accent-' + (prefTheme === 'dark' ? 'dark' : 'light') + ', #d97706)40';
              }}
              onBlur={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.05)';
                e.target.style.border = '1px solid rgba(255,255,255,0.08)';
              }}
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-2" style={{ scrollbarWidth: 'none' }}>
        {Object.entries(filteredGroups).map(([group, items]) => (
          <div key={group} className="mb-2">
            {!sidebarCollapsed && (
              <p
                className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em]"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                {group}
              </p>
            )}
            {items.map((item) => {
              // Determine if this item is active
              let isActive = false;
              if (item.id === 'store') {
                // Highlight Store when on any store‑subpage (store-homepage, store-banners, etc.)
                isActive = currentPage === 'store' || (typeof currentPage === 'string' && currentPage.startsWith('store-'));
              } else {
                isActive = currentPage === item.id;
              }

              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  title={sidebarCollapsed ? t(item.labelKey as any) : undefined}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14.5px] font-medium transition-all duration-200 mb-0.5 relative group"
                  style={
                    isActive
                      ? {
                          background: `color-mix(in srgb, var(--color-accent-${prefTheme === 'dark' ? 'dark' : 'light'}, #d97706) 16%, rgba(255,255,255,0.05))`,
                          color: '#ffffff',
                          border: '1px solid var(--color-accent-' + (prefTheme === 'dark' ? 'dark' : 'light') + ', #d97706)20',
                        }
                      : {
                          background: 'transparent',
                          color: 'rgba(255,255,255,0.65)',
                          border: '1px solid transparent',
                        }
                  }
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)';
                      (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.95)';
                      (e.currentTarget as HTMLButtonElement).style.border = '1px solid rgba(255,255,255,0.07)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                      (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.65)';
                      (e.currentTarget as HTMLButtonElement).style.border = '1px solid transparent';
                    }
                  }}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <div
                      className={`absolute top-1/2 -translate-y-1/2 w-[3px] h-[22px] rounded-full ${isRTL ? 'right-0' : 'left-0'}`}
                      style={{ background: `var(--color-accent-${prefTheme === 'dark' ? 'dark' : 'light'}, #d97706)` }}
                    />
                  )}

                  {/* Icon */}
                  <span
                    className="flex-shrink-0 transition-colors duration-200"
                    style={{ color: isActive ? `var(--color-accent-${prefTheme === 'dark' ? 'dark' : 'light'}, #d97706)` : undefined }}
                  >
                    {item.icon}
                  </span>

                  {/* Label */}
                  {!sidebarCollapsed && (
                    <span className="truncate">{t(item.labelKey as any)}</span>
                  )}

                  {/* Notification badge */}
                  {item.id === 'notifications' && unreadNotifications > 0 && (
                    <span
                      className="ml-auto text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        boxShadow: '0 2px 8px rgba(239,68,68,0.4)',
                      }}
                    >
                      {unreadNotifications}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* View Store Button */}
      <div
        className="p-3 flex-shrink-0"
        style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
      >
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
          style={{
            background: `var(--color-accent-${prefTheme === 'dark' ? 'dark' : 'light'}, #d97706)`,
            color: '#ffffff',
            boxShadow: `0 4px 14px var(--color-accent-${prefTheme === 'dark' ? 'dark' : 'light'}, #d97706)33`,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)';
            (e.currentTarget as HTMLAnchorElement).style.filter = 'brightness(1.1)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
            (e.currentTarget as HTMLAnchorElement).style.filter = 'brightness(1)';
          }}
        >
          <Store size={16} />
          {!sidebarCollapsed && <span>View Store</span>}
          {!sidebarCollapsed && <ExternalLink size={12} className="opacity-60" />}
        </a>
      </div>

      {/* Desktop Collapse Toggle */}
      <div
        className="hidden lg:flex p-3 flex-shrink-0 justify-center"
        style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
      >
        <button
          onClick={toggleSidebar}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all duration-200"
          style={{
            background: 'rgba(255,255,255,0.06)',
            color: 'rgba(255,255,255,0.6)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)';
            (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.9)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)';
            (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.6)';
          }}
        >
          {isRTL ? (
            sidebarCollapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />
          ) : (
            sidebarCollapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />
          )}
          {!sidebarCollapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
