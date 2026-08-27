// Analytic - shared helpers (theme-aware)
import React from 'react';
import { Home, ShoppingBag, ShoppingCart, LayoutGrid, CreditCard, Package, Search, User, FileText, Monitor, Smartphone, Tablet, Globe } from 'lucide-react';

export const getPageIcon = (path: string) => {
  const p = path.toLowerCase();
  if (p === '/' || p === '') return <Home size={16} className="text-[var(--color-darkGreen)]" />;
  if (p.includes('product')) return <ShoppingBag size={16} className="text-[var(--color-darkGreen)]" />;
  if (p.includes('shop')) return <ShoppingCart size={16} className="text-[var(--color-darkGreen)]" />;
  if (p.includes('collection')) return <LayoutGrid size={16} className="text-[var(--color-darkGreen)]" />;
  if (p.includes('checkout')) return <CreditCard size={16} className="text-[var(--color-darkGreen)]" />;
  if (p.includes('order')) return <Package size={16} className="text-[var(--color-darkGreen)]" />;
  if (p.includes('search')) return <Search size={16} className="text-[var(--color-darkGreen)]" />;
  if (p.includes('account') || p.includes('profile')) return <User size={16} className="text-[var(--color-darkGreen)]" />;
  return <FileText size={16} className="text-[var(--color-darkGreen)]" />;
};

export const getPageName = (path: string, title?: string) => {
  if (title && title !== path) return title;
  const p = path.toLowerCase();
  if (p === '/' || p === '') return 'Home';
  const segments = path.split('/').filter(Boolean);
  const last = segments[segments.length - 1 || 0] || path;
  return last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, ' ').replace(/_/g, ' ');
};

export const formatDuration = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};

export const formatNumber = (n: number) => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString();
};

export const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  if (dateStr.length === 13) return d.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
};

export const deviceIcon = (device: string) => {
  switch (device) {
    case 'desktop': return <Monitor size={16} />;
    case 'mobile': return <Smartphone size={16} />;
    case 'tablet': return <Tablet size={16} />;
    default: return <Globe size={16} />;
  }
};
