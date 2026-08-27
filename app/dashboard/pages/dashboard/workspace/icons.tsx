'use client';
import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  ShoppingCart,
  Banknote,
  Truck,
  Boxes,
  PieChart,
  Users,
  ShoppingBag,
  Package,
  AlertTriangle,
  Clock,
  Zap,
  BarChart3,
  Filter,
  Globe,
  Smartphone,
  MousePointer,
  MapPin,
  FileText,
  Activity,
  Search,
  Clock3,
} from 'lucide-react';
import { getTypeClasses, getTypeIcon } from '../../../components/notifications/notificationVisuals';

export const widgetIcons: Record<string, React.ReactNode> = {
  // Dashboard
  'kpi-grid': <LayoutDashboard size={16} />,
  'revenue-overview': <TrendingUp size={16} />,
  'orders-performance': <ShoppingCart size={16} />,
  'aov': <Banknote size={16} />,
  'cod-performance': <Truck size={16} />,
  'inventory-health': <Boxes size={16} />,
  'sales-by-category': <PieChart size={16} />,
  'customer-snapshot': <Users size={16} />,
  'recent-orders': <ShoppingBag size={16} />,
  'top-products': <Package size={16} />,
  'low-stock': <AlertTriangle size={16} />,
  'pending-actions': <Clock size={16} />,
  'quick-actions': <Zap size={16} />,
  'orders-timeline': <Truck size={16} />,
  // Analytics
  'analytics-overview': <BarChart3 size={16} />,
  'visitor-trends': <TrendingUp size={16} />,
  'conversion-funnel': <Filter size={16} />,
  'cart-abandonment': <ShoppingCart size={16} />,
  'traffic-performance': <Globe size={16} />,
  'device-analytics': <Smartphone size={16} />,
  'user-behavior': <MousePointer size={16} />,
  'product-analytics': <Package size={16} />,
  'customer-analytics': <Users size={16} />,
  'geographic-analytics': <MapPin size={16} />,
  'top-pages': <FileText size={16} />,
  'session-quality': <Activity size={16} />,
  'peak-hours': <Clock3 size={16} />,
  'search-behavior': <Search size={16} />,
};

// Map widget id -> notification type for exact color reuse
const widgetTypeMap: Record<string, string> = {
  'kpi-grid': 'analytics',
  'revenue-overview': 'payment',
  'orders-performance': 'order',
  'aov': 'payment',
  'cod-performance': 'shipping',
  'inventory-health': 'inventory',
  'sales-by-category': 'product',
  'customer-snapshot': 'social',
  'recent-orders': 'order',
  'top-products': 'product',
  'low-stock': 'inventory',
  'pending-actions': 'order',
  'quick-actions': 'system',
  'orders-timeline': 'shipping',
  'analytics-overview': 'analytics',
  'visitor-trends': 'analytics',
  'conversion-funnel': 'order',
  'cart-abandonment': 'order',
  'traffic-performance': 'social',
  'device-analytics': 'system',
  'user-behavior': 'analytics',
  'product-analytics': 'product',
  'customer-analytics': 'social',
  'geographic-analytics': 'system',
  'top-pages': 'system',
  'session-quality': 'analytics',
  'peak-hours': 'analytics',
  'search-behavior': 'system',
};

export const WidgetIcon: React.FC<{ id: string; size?: number }> = ({ id, size = 16 }) => {
  const type = widgetTypeMap[id] || 'system';
  const classes = getTypeClasses(type); // e.g. bg-indigo-50 text-indigo-600 border-indigo-200
  const icon = getTypeIcon(type, size) as React.ReactNode;
  // Use exact Notifications visual treatment: w-10 h-10 rounded-xl border
  return (
    <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl border shrink-0 ${classes}`}>
      {icon}
    </span>
  );
};
