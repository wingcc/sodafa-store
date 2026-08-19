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
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { PageSection } from '../../types';

interface NavItem {
  id: PageSection;
  label: string;
  icon: React.ReactNode;
  group: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={19} />, group: 'Overview' },
  { id: 'products', label: 'Products', icon: <Package size={19} />, group: 'Catalog' },
  { id: 'categories', label: 'Categories', icon: <FolderTree size={19} />, group: 'Catalog' },
  { id: 'orders', label: 'Orders', icon: <ShoppingCart size={19} />, group: 'Sales' },
  { id: 'customers', label: 'Customers', icon: <Users size={19} />, group: 'Sales' },
  { id: 'inventory', label: 'Inventory', icon: <Warehouse size={19} />, group: 'Operations' },
  { id: 'reviews', label: 'Reviews', icon: <Star size={19} />, group: 'Operations' },
  { id: 'coupons', label: 'Discounts & Coupons', icon: <Ticket size={19} />, group: 'Marketing' },
  { id: 'shipping', label: 'Shipping', icon: <Truck size={19} />, group: 'Operations' },
  { id: 'payments', label: 'Payments', icon: <CreditCard size={19} />, group: 'Finance' },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={19} />, group: 'Insights' },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={19} />, group: 'System' },
  { id: 'store', label: 'Store Management', icon: <Store size={19} />, group: 'System' },
  { id: 'settings', label: 'Settings', icon: <Settings size={19} />, group: 'System' },
];

const Sidebar: React.FC = () => {
  const { currentPage, setCurrentPage, sidebarCollapsed, toggleSidebar, searchQuery, setSearchQuery, unreadNotifications } = useStore();
  const groups = navItems.reduce<Record<string, NavItem[]>>((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

  const filteredGroups = Object.entries(groups).reduce<Record<string, NavItem[]>>((acc, [group, items]) => {
    const filtered = items.filter((item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filtered.length > 0) acc[group] = filtered;
    return acc;
  }, {});

  return (
    <aside
      className={`fixed left-0 top-0 h-full text-white z-40 transition-all duration-300 flex flex-col ${
        sidebarCollapsed ? 'w-[72px]' : 'w-[260px]'
      }`}
      style={{
        background: 'linear-gradient(180deg, #071f18 0%, #0a2a1f 30%, #0c3124 65%, #071f18 100%)',
        borderRight: '1px solid rgba(205,165,82,0.1)',
        boxShadow: '4px 0 24px rgba(0,0,0,0.35)',
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
              background: 'linear-gradient(135deg, #cda552, #9a7635)',
              boxShadow: '0 4px 14px rgba(205,165,82,0.35)',
            }}
          >
            <span className="text-white font-bold text-sm">S</span>
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <h1 className="text-sm font-bold tracking-widest text-white truncate">SODFA</h1>
              <p className="text-[10px] tracking-widest uppercase font-medium" style={{ color: '#cda55270' }}>
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
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(255,255,255,0.3)' }} />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none transition-all rounded-lg"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
              onFocus={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.09)';
                e.target.style.border = '1px solid rgba(205,165,82,0.4)';
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
                  title={sidebarCollapsed ? item.label : undefined}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14.5px] font-medium transition-all duration-200 mb-0.5 relative group"
                  style={
                    isActive
                      ? {
                          background: 'linear-gradient(135deg, rgba(205,165,82,0.16) 0%, rgba(13,52,40,0.5) 100%)',
                          color: '#ffffff',
                          border: '1px solid rgba(205,165,82,0.2)',
                          boxShadow: 'inset 0 1px 0 rgba(205,165,82,0.1)',
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
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[22px] rounded-r-full"
                      style={{ background: 'linear-gradient(180deg, #cda552, #9a7635)' }}
                    />
                  )}

                  {/* Icon */}
                  <span
                    className="flex-shrink-0 transition-colors duration-200"
                    style={{ color: isActive ? '#cda552' : undefined }}
                  >
                    {item.icon}
                  </span>

                  {/* Label */}
                  {!sidebarCollapsed && (
                    <span className="truncate">{item.label}</span>
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

      {/* Collapse Toggle */}
      <div
        className="p-3 flex-shrink-0"
        style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
      >
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
          style={{ color: 'rgba(255,255,255,0.4)' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)';
            (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.75)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.4)';
          }}
        >
          {sidebarCollapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
          {!sidebarCollapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;