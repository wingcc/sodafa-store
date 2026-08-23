// SODFA MARKETPLACE - Orders Management Page

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  Eye,
  ChevronDown,
  Package,
  MapPin,
  CreditCard,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  Printer,
  Download,
  X,
  ChevronRight,
  ArrowRight,
  LayoutGrid,
  LayoutList,
  Map,
  Copy,
  User,
  Mail,
  Phone,
  FileText,
  Hash,
  Calendar,
  Tag,
  Receipt,
  CircleDot,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Badge from '../components/ui/Badge';
import RefreshButton from '../components/ui/RefreshButton';
import OrdersMapView from './OrdersMapView';
import { useStore } from '../store/useStore';
import { useToast } from '@/lib/toast';
import { useTranslation } from '../i18n/useTranslation';
import { MOROCCAN_CITIES } from '../data/moroccoCities';

const statusFilters = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const statusFlow = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

const statusConfig: Record<string, { label: string; color: string; bg: string; ring: string; activeBg: string }> = {
  pending:    { label: 'Pending',    color: 'text-amber-700',  bg: 'bg-amber-50',  ring: 'ring-amber-200',  activeBg: 'bg-amber-100' },
  confirmed:  { label: 'Confirmed',  color: 'text-blue-700',   bg: 'bg-blue-50',   ring: 'ring-blue-200',   activeBg: 'bg-blue-100' },
  processing: { label: 'Processing', color: 'text-purple-700', bg: 'bg-purple-50', ring: 'ring-purple-200', activeBg: 'bg-purple-100' },
  shipped:    { label: 'Shipped',    color: 'text-indigo-700', bg: 'bg-indigo-50', ring: 'ring-indigo-200', activeBg: 'bg-indigo-100' },
  delivered:  { label: 'Delivered',  color: 'text-emerald-700',bg: 'bg-emerald-50',ring: 'ring-emerald-200',activeBg: 'bg-emerald-100' },
  cancelled:  { label: 'Cancelled',  color: 'text-red-700',    bg: 'bg-red-50',    ring: 'ring-red-200',    activeBg: 'bg-red-100' },
  refunded:   { label: 'Refunded',   color: 'text-gray-700',   bg: 'bg-gray-50',   ring: 'ring-gray-200',   activeBg: 'bg-gray-100' },
};

const statusDotColor: Record<string, string> = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  processing: '#a855f7',
  shipped: '#6366f1',
  delivered: '#10b981',
  cancelled: '#ef4444',
  refunded: '#6b7280',
};

type ViewMode = 'cards' | 'table' | 'map';

const statusIconMap: Record<string, { icon: React.ReactNode; colorClass: string }> = {
  pending: { icon: <Clock size={12} />, colorClass: 'text-amber-600' },
  confirmed: { icon: <CheckCircle2 size={12} />, colorClass: 'text-blue-600' },
  processing: { icon: <Package size={12} />, colorClass: 'text-purple-600' },
  shipped: { icon: <Truck size={12} />, colorClass: 'text-indigo-600' },
  delivered: { icon: <CheckCircle2 size={12} />, colorClass: 'text-emerald-600' },
  cancelled: { icon: <XCircle size={12} />, colorClass: 'text-red-600' },
};

// Reusable status dropdown component
const StatusDropdown: React.FC<{
  orderId: string;
  currentStatus: string;
  onUpdate: (orderId: string, newStatus: string) => void;
  openDropdown: string | null;
  setOpenDropdown: (id: string | null) => void;
}> = ({ orderId, currentStatus, onUpdate, openDropdown, setOpenDropdown }) => {
  const cfg = statusConfig[currentStatus] || statusConfig.pending;
  const isOpen = openDropdown === orderId;
  const iconData = statusIconMap[currentStatus] ?? statusIconMap.pending;

  return (
    <div className="relative">
      <button
        onClick={() => setOpenDropdown(isOpen ? null : orderId)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all ring-1 ${cfg.color} ${cfg.bg} ${cfg.ring} hover:shadow-sm`}
      >
        <span className={iconData.colorClass}>{iconData.icon}</span>
        {cfg.label}
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-30 min-w-[170px]"
          >
            {statusFlow.map((s) => {
              const sCfg = statusConfig[s];
              const isActive = currentStatus === s;
              const sIcon = statusIconMap[s] ?? statusIconMap.pending;
              return (
                <button
                  key={s}
                  onClick={() => {
                    onUpdate(orderId, s);
                    setOpenDropdown(null);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors ${
                    isActive ? sCfg.activeBg : 'hover:bg-gray-50'
                  } ${sCfg.color}`}
                >
                  <span className={sCfg.color}>{sIcon.icon}</span>
                  {sCfg.label}
                  {isActive && <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-emerald-500" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Orders: React.FC = () => {
  const { t } = useTranslation();
  const {
    orders,
    updateOrderStatus,
    isLoadingOrders,
    ordersError,
    fetchOrders,
    fetchOrderDetail,
  } = useStore();
  const { addToast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOrderDetail, setShowOrderDetail] = useState<any>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [openStatusDropdown, setOpenStatusDropdown] = useState<string | null>(null);
  const [storeCity, setStoreCity] = useState<string>('Casablanca');
  const [storeCitySearch, setStoreCitySearch] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // City suggestions for store city dropdown
  const citySuggestions = useMemo(() => {
    const q = storeCitySearch.trim().toLowerCase();
    if (!q) return MOROCCAN_CITIES.slice(0, 8);
    return MOROCCAN_CITIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.region.toLowerCase().includes(q),
    ).slice(0, 8);
  }, [storeCitySearch]);

  // Unique cities from orders for the dropdown
  const orderCities = useMemo(() => {
    const cities = new Set(
      orders.map((o) => o.shippingAddress.city).filter(Boolean),
    );
    return Array.from(cities).sort();
  }, [orders]);

  // Fetch orders on mount
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Pagination (table view)
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Infinite scroll (card view)
  const [visibleCount, setVisibleCount] = useState(8);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const LOAD_BATCH = 8;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = () => {
      setOpenStatusDropdown(null);
      setShowCityDropdown(false);
      setShowStatusDropdown(false);
    };
    if (openStatusDropdown || showCityDropdown || showStatusDropdown) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [openStatusDropdown, showCityDropdown, showStatusDropdown]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus = selectedStatus === 'all' || o.orderStatus === selectedStatus;
      const matchesSearch =
        o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [orders, selectedStatus, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  // Infinite scroll
  const loadMore = useCallback(() => {
    if (visibleCount >= filteredOrders.length) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + LOAD_BATCH, filteredOrders.length));
      setIsLoadingMore(false);
    }, 400);
  }, [visibleCount, filteredOrders.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore && visibleCount < filteredOrders.length) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );
    const el = loadMoreRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [loadMore, isLoadingMore, visibleCount, filteredOrders.length]);

  const visibleOrders = filteredOrders.slice(0, visibleCount);
  const hasMore = visibleCount < filteredOrders.length;

  const handleFilterChange = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
    setVisibleCount(8);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
    setVisibleCount(8);
  };

  const statusCounts = {
    all: orders.length,
    pending: orders.filter((o) => o.orderStatus === 'pending').length,
    confirmed: orders.filter((o) => o.orderStatus === 'confirmed').length,
    processing: orders.filter((o) => o.orderStatus === 'processing').length,
    shipped: orders.filter((o) => o.orderStatus === 'shipped').length,
    delivered: orders.filter((o) => o.orderStatus === 'delivered').length,
    cancelled: orders.filter((o) => o.orderStatus === 'cancelled').length,
  };

  const handleQuickStatusUpdate = (orderId: string, newStatus: any) => {
    updateOrderStatus(orderId, newStatus);
    const label = statusConfig[newStatus]?.label ?? newStatus;
    addToast('success', `Order status changed to "${label}".`, { title: 'Order Updated' });
  };

  const getNextStatus = (currentStatus: string) => {
    const flow: Record<string, string> = {
      pending: 'confirmed',
      confirmed: 'processing',
      processing: 'shipped',
      shipped: 'delivered',
    };
    return flow[currentStatus];
  };

  const openOrderDetail = async (order: any) => {
    setShowOrderDetail(order);
    setIsLoadingDetail(true);
    const full = await fetchOrderDetail(order.id);
    if (full) {
      setShowOrderDetail(full);
    }
    setIsLoadingDetail(false);
  };

  const handleStatusUpdateFromDetail = async (id: string, status: string) => {
    await updateOrderStatus(id, status as any);
    const full = await fetchOrderDetail(id);
    if (full) {
      setShowOrderDetail(full);
    }
  };

  const handlePrintInvoice = () => {
    const content = invoiceRef.current;
    if (!content) return;
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${showOrderDetail.orderNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a1a; padding: 40px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; border-bottom: 2px solid #0a2c23; padding-bottom: 16px; }
          .brand { font-size: 24px; font-weight: 700; color: #0a2c23; }
          .invoice-title { font-size: 14px; color: #666; margin-top: 4px; }
          .order-num { font-size: 20px; font-weight: 600; text-align: right; }
          .date { font-size: 13px; color: #666; text-align: right; margin-top: 4px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
          .section-title { font-size: 12px; font-weight: 600; color: #0a2c23; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
          .info p { font-size: 13px; color: #333; line-height: 1.6; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          th { background: #f5f5f5; padding: 10px 12px; text-align: left; font-size: 12px; font-weight: 600; color: #555; text-transform: uppercase; letter-spacing: 0.3px; }
          td { padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #eee; }
          .text-right { text-align: right; }
          .totals { margin-left: auto; width: 280px; }
          .totals .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
          .totals .row.total { border-top: 2px solid #0a2c23; margin-top: 8px; padding-top: 10px; font-size: 16px; font-weight: 700; color: #0a2c23; }
          .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #eee; text-align: center; font-size: 11px; color: #999; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">SODFA</div>
            <div class="invoice-title">Order Invoice</div>
          </div>
          <div>
            <div class="order-num">${showOrderDetail.orderNumber}</div>
            <div class="date">${new Date(showOrderDetail.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
        </div>
        <div class="grid">
          <div>
            <div class="section-title">Customer</div>
            <div class="info">
              <p><strong>${showOrderDetail.customerName}</strong></p>
              <p>${showOrderDetail.customerEmail}</p>
              <p>${showOrderDetail.customerPhone}</p>
            </div>
          </div>
          <div>
            <div class="section-title">Shipping Address</div>
            <div class="info">
              <p>${showOrderDetail.shippingAddress.address || ''}</p>
              <p>${showOrderDetail.shippingAddress.city}, ${showOrderDetail.shippingAddress.region || ''}</p>
            </div>
          </div>
        </div>
        <table>
          <thead>
            <tr><th>Product</th><th>Variant</th><th class="text-right">Qty</th><th class="text-right">Unit Price</th><th class="text-right">Total</th></tr>
          </thead>
          <tbody>
            ${showOrderDetail.items.map((item: any) => `
              <tr>
                <td>${item.productName}</td>
                <td>${item.variant || '-'}</td>
                <td class="text-right">${item.quantity}</td>
                <td class="text-right">${item.unitPrice} MAD</td>
                <td class="text-right">${item.total} MAD</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="totals">
          <div class="row"><span>Subtotal</span><span>${showOrderDetail.subtotal} MAD</span></div>
          ${showOrderDetail.discount > 0 ? `<div class="row"><span>Discount</span><span>-${showOrderDetail.discount} MAD</span></div>` : ''}
          <div class="row"><span>Shipping</span><span>${showOrderDetail.shippingCost} MAD</span></div>
          <div class="row total"><span>Total</span><span>${showOrderDetail.total} MAD</span></div>
        </div>
        <div class="footer">Thank you for your order!</div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  const handleDownloadInvoice = () => {
    const o = showOrderDetail;
    if (!o) return;
    const lines: string[] = [
      'SODFA - Order Invoice',
      '=====================',
      '',
      `Order: ${o.orderNumber}`,
      `Date: ${new Date(o.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
      `Status: ${o.orderStatus}`,
      `Payment: ${o.paymentStatus}`,
      '',
      'CUSTOMER',
      '--------',
      `Name: ${o.customerName}`,
      `Email: ${o.customerEmail}`,
      `Phone: ${o.customerPhone}`,
      '',
      'SHIPPING ADDRESS',
      '----------------',
      `${o.shippingAddress.address || ''}`,
      `${o.shippingAddress.city}, ${o.shippingAddress.region || ''}`,
      '',
      'ITEMS',
      '-----',
    ];
    o.items.forEach((item: any, i: number) => {
      lines.push(`${i + 1}. ${item.productName}${item.variant ? ` (${item.variant})` : ''} x${item.quantity} - ${item.total} MAD`);
    });
    lines.push('');
    lines.push('TOTALS');
    lines.push('------');
    lines.push(`Subtotal: ${o.subtotal} MAD`);
    if (o.discount > 0) lines.push(`Discount: -${o.discount} MAD`);
    lines.push(`Shipping: ${o.shippingCost} MAD`);
    lines.push(`TOTAL: ${o.total} MAD`);
    lines.push('');
    lines.push('Thank you for your order!');

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${o.orderNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('success', 'Invoice downloaded.', { title: 'Download Complete' });
  };

  const inputClass = 'w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706]/20 focus:border-[#d97706]/50 transition-all';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{t('orders.title')}</h2>
          <p className="text-sm text-gray-500 mt-1">
            {isLoadingOrders ? 'Loading orders...' : `Manage and track all orders`}
          </p>
          {ordersError && (
            <p className="text-xs text-red-500 mt-1">Error: {ordersError}</p>
          )}
        </div>
      </div>

      {/* Search + Store City + Status Filter + View Toggle + Refresh */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order number or customer name..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Store City Selector */}
          <div className="relative flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-amber-500 pointer-events-none" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <input
              type="text"
              value={storeCitySearch || storeCity}
              onChange={(e) => {
                setStoreCitySearch(e.target.value);
                setShowCityDropdown(true);
              }}
              onFocus={() => setShowCityDropdown(true)}
              placeholder="Store city..."
              className="w-40 pl-8 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706]/20 focus:border-[#d97706]/50 transition-all"
            />
            {showCityDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-30 max-h-60 overflow-y-auto">
                {citySuggestions.map((city) => (
                  <button
                    key={city.name}
                    type="button"
                    onClick={() => {
                      setStoreCity(city.name);
                      setStoreCitySearch('');
                      setShowCityDropdown(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors text-sm ${
                      storeCity === city.name ? 'bg-amber-50' : ''
                    }`}
                  >
                    <MapPin size={12} className="text-gray-400 flex-shrink-0" />
                    <span className="font-medium text-gray-900">{city.name}</span>
                    <span className="text-gray-400 text-xs ml-auto">{city.region}</span>
                  </button>
                ))}
                {citySuggestions.length === 0 && (
                  <p className="px-3 py-2 text-xs text-gray-400">No cities found</p>
                )}
              </div>
            )}
          </div>

          {/* Status Filter Dropdown */}
          <div className="relative flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors whitespace-nowrap"
            >
              <Filter size={14} className="text-gray-400" />
              {selectedStatus === 'all' ? 'All Status' : statusConfig[selectedStatus]?.label ?? selectedStatus}
              <span className="px-1.5 py-0.5 rounded-md text-xs bg-gray-200 text-gray-600">
                {statusCounts[selectedStatus as keyof typeof statusCounts]}
              </span>
              <ChevronDown size={14} className={`text-gray-400 transition-transform ${showStatusDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showStatusDropdown && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-30 py-1 min-w-[180px]">
                {statusFilters.map((status) => {
                  const cfg = statusConfig[status];
                  const isActive = selectedStatus === status;
                  return (
                    <button
                      key={status}
                      onClick={() => {
                        handleFilterChange(status);
                        setShowStatusDropdown(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors ${
                        isActive ? 'bg-gray-50 font-medium' : 'hover:bg-gray-50'
                      }`}
                    >
                      {status !== 'all' && (
                        <span
                          className="flex-shrink-0"
                          style={{ color: statusDotColor[status] ?? '#888' }}
                        >
                          {(statusIconMap[status] ?? statusIconMap.pending).icon}
                        </span>
                      )}
                      {status === 'all' && <Filter size={12} className="text-gray-400 flex-shrink-0" />}
                      <span className={isActive ? 'text-gray-900' : 'text-gray-600'}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                      <span className="ml-auto px-1.5 py-0.5 rounded-md text-xs bg-gray-100 text-gray-500">
                        {statusCounts[status as keyof typeof statusCounts]}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 rounded-xl p-1 flex-shrink-0">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'cards'
                  ? 'bg-white text-[#0a2c23] shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Card view"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-[#0a2c23] shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Table view"
            >
              <LayoutList size={16} />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'map'
                  ? 'bg-white text-[#0a2c23] shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Map view"
            >
              <Map size={16} />
            </button>
          </div>

          {/* Refresh */}
          <RefreshButton
            onRefresh={fetchOrders}
            isLoading={isLoadingOrders}
            size="md"
            variant="default"
          />
        </div>
      </div>

      {/* Card View - Infinite Scroll */}
      {viewMode === 'cards' && (
        <>
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {visibleOrders.map((order, index) => {
                const nextStatus = getNextStatus(order.orderStatus);
                return (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ y: -2 }}
                    transition={{
                      opacity: { duration: 0.3, delay: index >= visibleCount - LOAD_BATCH ? (index - (visibleCount - LOAD_BATCH)) * 0.05 : 0 },
                      y: { duration: 0.3, delay: index >= visibleCount - LOAD_BATCH ? (index - (visibleCount - LOAD_BATCH)) * 0.05 : 0 },
                      layout: { duration: 0.3 },
                    }}
                    className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#d97706]/10 to-[#0f3d31]/10 flex items-center justify-center flex-shrink-0">
                          <Package size={20} className="text-[#0a2c23]" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-gray-900">{order.orderNumber}</p>
                            <StatusDropdown
                              orderId={order.id}
                              currentStatus={order.orderStatus}
                              onUpdate={handleQuickStatusUpdate}
                              openDropdown={openStatusDropdown}
                              setOpenDropdown={setOpenStatusDropdown}
                            />
                            <Badge
                              variant={order.paymentStatus === 'paid' ? 'success' : order.paymentStatus === 'failed' ? 'danger' : 'warning'}
                              size="sm"
                            >
                              {order.paymentStatus}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{order.customerName} &bull; {order.items.length} item(s)</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">{order.total.toLocaleString()} MAD</p>
                          <div className="flex items-center gap-1 justify-end mt-1">
                            <MapPin size={12} className="text-gray-400" />
                            <span className="text-xs text-gray-500">{order.shippingAddress.city}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {nextStatus && (
                            <button
                              onClick={() => handleQuickStatusUpdate(order.id, nextStatus)}
                              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-[#0a2c23] to-[#0f3d31] text-white rounded-xl text-xs font-medium hover:shadow-lg hover:shadow-[#0a2c23]/25 transition-all"
                            >
                              {nextStatus === 'confirmed' && 'Confirm'}
                              {nextStatus === 'processing' && 'Process'}
                              {nextStatus === 'shipped' && 'Ship'}
                              {nextStatus === 'delivered' && 'Deliver'}
                              <ArrowRight size={12} />
                            </button>
                          )}
                           <button
                            onClick={() => openOrderDetail(order)}
                            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Items Preview */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-3 overflow-x-auto pb-1">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 flex-shrink-0">
                            {item.productImage ? (
                              <img
                                src={item.productImage}
                                alt={item.productName}
                                className="w-8 h-8 rounded-lg object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center">
                                <Package size={14} className="text-gray-400" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-gray-900 truncate max-w-[120px]">{item.productName}</p>
                              <p className="text-[10px] text-gray-500">x{item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Loading indicator */}
          {isLoadingMore && (
            <div className="flex items-center justify-center py-8 gap-3">
              <div className="w-5 h-5 border-2 border-[#d97706] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-500">Loading more orders...</span>
            </div>
          )}

          {/* Infinite scroll sentinel */}
          {hasMore && !isLoadingMore && (
            <div ref={loadMoreRef} className="h-10" />
          )}

          {/* All loaded indicator */}
          {!hasMore && filteredOrders.length > 0 && (
            <div className="text-center py-6">
              <p className="text-sm text-gray-400">All {filteredOrders.length} orders loaded</p>
            </div>
          )}

          {/* Empty State */}
          {filteredOrders.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
              <Package size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">No orders found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
            </div>
          )}
        </>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Order</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Customer</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Items</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Total</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Payment</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Date</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedOrders.map((order) => {
                  return (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-[#0a2c23]">{order.orderNumber}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">{order.customerName}</p>
                          <p className="text-xs text-gray-400">{order.customerPhone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <div className="flex -space-x-2">
                            {order.items.slice(0, 3).map((item, i) => (
                              item.productImage ? (
                                <img
                                  key={i}
                                  src={item.productImage}
                                  alt=""
                                  className="w-7 h-7 rounded-full border-2 border-white object-cover"
                                />
                              ) : (
                                <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center">
                                  <Package size={10} className="text-gray-400" />
                                </div>
                              )
                            ))}
                          </div>
                          <span className="text-xs text-gray-500 ml-1">{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-gray-800">{order.total.toLocaleString()} MAD</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-gray-500">{order.paymentMethod.replace('_', ' ')}</span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusDropdown
                          orderId={order.id}
                          currentStatus={order.orderStatus}
                          onUpdate={handleQuickStatusUpdate}
                          openDropdown={openStatusDropdown}
                          setOpenDropdown={setOpenStatusDropdown}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => openOrderDetail(order)}
                          className="p-2 rounded-lg hover:bg-[#d97706]/10 text-gray-400 hover:text-[#d97706] transition-colors"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="py-16 text-center">
              <Package size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">No orders found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-5 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-sm text-gray-500">
                Showing <span className="font-medium text-gray-900">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span>
                {' '}&ndash;{' '}
                <span className="font-medium text-gray-900">{Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)}</span>
                {' '}of <span className="font-medium text-gray-900">{filteredOrders.length}</span> orders
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {getPageNumbers().map((page, i) =>
                  typeof page === 'string' ? (
                    <span key={`ellipsis-${i}`} className="px-2 py-1.5 text-sm text-gray-400">&hellip;</span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-[#0a2c23] text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
          {totalPages <= 1 && filteredOrders.length > 0 && (
            <div className="px-5 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Showing <span className="font-medium text-gray-900">{filteredOrders.length}</span> orders
              </p>
            </div>
          )}
        </div>
      )}

      {/* Map View */}
      {viewMode === 'map' && (
        <OrdersMapView
          orders={filteredOrders}
          storeCity={storeCity}
          onStoreCityChange={setStoreCity}
          onOrderSelect={(order) => openOrderDetail(order)}
        />
      )}

      {/* Order Detail Modal */}
      <AnimatePresence>
        {showOrderDetail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowOrderDetail(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0a2c23] flex items-center justify-center">
                      <Receipt size={18} className="text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-gray-900">{showOrderDetail.orderNumber}</h2>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(showOrderDetail.orderNumber);
                            addToast('success', 'Order number copied.', { title: 'Copied' });
                          }}
                          className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Copy order number"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Calendar size={12} className="text-gray-400" />
                        <p className="text-sm text-gray-500">
                          {new Date(showOrderDetail.createdAt).toLocaleDateString('en-US', {
                            month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowOrderDetail(null)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div ref={invoiceRef} className="p-6 space-y-6">
                {isLoadingDetail ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex items-center gap-3 text-gray-500">
                      <div className="w-5 h-5 border-2 border-[#0a2c23] border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm">Loading order details...</span>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Status Bar */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                          <CircleDot size={14} className="text-gray-500" />
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Order Status</p>
                        </div>
                        <StatusDropdown
                          orderId={showOrderDetail.id}
                          currentStatus={showOrderDetail.orderStatus}
                          onUpdate={(id, status) => {
                            handleStatusUpdateFromDetail(id, status);
                          }}
                          openDropdown={openStatusDropdown}
                          setOpenDropdown={setOpenStatusDropdown}
                        />
                      </div>
                      <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                          <CreditCard size={14} className="text-gray-500" />
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Payment</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={showOrderDetail.paymentStatus === 'paid' ? 'success' : showOrderDetail.paymentStatus === 'failed' ? 'danger' : 'warning'}
                            size="md"
                          >
                            {showOrderDetail.paymentStatus}
                          </Badge>
                          <span className="text-xs text-gray-400 capitalize">{showOrderDetail.paymentMethod?.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-2 mb-3">
                        <User size={14} className="text-gray-500" />
                        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Customer Information</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                            <User size={14} className="text-gray-400" />
                          </div>
                          <div>
                            <p className="text-[11px] text-gray-400">Name</p>
                            <p className="text-sm font-medium text-gray-900">{showOrderDetail.customerName}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                            <Mail size={14} className="text-gray-400" />
                          </div>
                          <div>
                            <p className="text-[11px] text-gray-400">Email</p>
                            <p className="text-sm font-medium text-gray-900">{showOrderDetail.customerEmail || '-'}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                            <Phone size={14} className="text-gray-400" />
                          </div>
                          <div>
                            <p className="text-[11px] text-gray-400">Phone</p>
                            <p className="text-sm font-medium text-gray-900">{showOrderDetail.customerPhone || '-'}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                            <MapPin size={14} className="text-gray-400" />
                          </div>
                          <div>
                            <p className="text-[11px] text-gray-400">City</p>
                            <p className="text-sm font-medium text-gray-900">{showOrderDetail.shippingAddress.city || '-'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Package size={14} className="text-gray-500" />
                        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Order Items</h4>
                        <span className="text-xs text-gray-400 ml-auto">{showOrderDetail.items.length} item{showOrderDetail.items.length !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="border border-gray-100 rounded-xl overflow-hidden">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                              <th className="text-left px-4 py-2.5 text-[11px] font-medium text-gray-500 uppercase tracking-wide">Product</th>
                              <th className="text-left px-4 py-2.5 text-[11px] font-medium text-gray-500 uppercase tracking-wide">Variant</th>
                              <th className="text-center px-4 py-2.5 text-[11px] font-medium text-gray-500 uppercase tracking-wide">Qty</th>
                              <th className="text-right px-4 py-2.5 text-[11px] font-medium text-gray-500 uppercase tracking-wide">Unit Price</th>
                              <th className="text-right px-4 py-2.5 text-[11px] font-medium text-gray-500 uppercase tracking-wide">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {showOrderDetail.items.map((item: any) => (
                              <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-3">
                                    {item.productImage ? (
                                      <img src={item.productImage} alt={item.productName} className="w-10 h-10 rounded-lg object-cover border border-gray-100" />
                                    ) : (
                                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                                        <Package size={16} className="text-gray-400" />
                                      </div>
                                    )}
                                    <span className="text-sm font-medium text-gray-900">{item.productName}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  {item.variant ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-xs text-gray-600">
                                      <Tag size={10} />
                                      {item.variant}
                                    </span>
                                  ) : (
                                    <span className="text-xs text-gray-300">-</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className="text-sm text-gray-700">{item.quantity}</span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <span className="text-sm text-gray-600">{item.unitPrice} MAD</span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <span className="text-sm font-semibold text-gray-900">{item.total} MAD</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Order Total */}
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Subtotal</span>
                          <span className="text-gray-900">{showOrderDetail.subtotal} MAD</span>
                        </div>
                        {showOrderDetail.discount > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Discount</span>
                            <span className="text-emerald-600">-{showOrderDetail.discount} MAD</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Shipping</span>
                          <span className="text-gray-900">{showOrderDetail.shippingCost} MAD</span>
                        </div>
                        <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-200">
                          <span className="text-gray-900">Total</span>
                          <span className="text-[#0a2c23]">{showOrderDetail.total} MAD</span>
                        </div>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Clock size={14} className="text-gray-500" />
                        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Order Timeline</h4>
                      </div>
                      {showOrderDetail.timeline.length === 0 ? (
                        <div className="text-center py-6 text-gray-400 text-sm">No timeline events yet</div>
                      ) : (
                        <div className="relative">
                          {showOrderDetail.timeline.map((event: any, index: number) => {
                            const isLast = index === showOrderDetail.timeline.length - 1;
                            const iconMap: Record<string, React.ReactNode> = {
                              pending: <Clock size={12} />,
                              confirmed: <CheckCircle2 size={12} />,
                              processing: <Package size={12} />,
                              shipped: <Truck size={12} />,
                              delivered: <CheckCircle2 size={12} />,
                              cancelled: <XCircle size={12} />,
                              refunded: <RotateCcw size={12} />,
                            };
                            const colorMap: Record<string, string> = {
                              pending: 'bg-amber-100 text-amber-700 border-amber-200',
                              confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
                              processing: 'bg-purple-100 text-purple-700 border-purple-200',
                              shipped: 'bg-indigo-100 text-indigo-700 border-indigo-200',
                              delivered: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                              cancelled: 'bg-red-100 text-red-700 border-red-200',
                              refunded: 'bg-gray-100 text-gray-700 border-gray-200',
                            };
                            return (
                              <div key={index} className="flex items-start gap-3 relative">
                                {/* Vertical connector line */}
                                {!isLast && (
                                  <div className="absolute left-[15px] top-[32px] w-0.5 h-[calc(100%-8px)] bg-gray-200" />
                                )}
                                {/* Icon */}
                                <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                                  isLast ? 'bg-[#0a2c23] text-white border-[#0a2c23]' : colorMap[event.status] || 'bg-gray-100 text-gray-400 border-gray-200'
                                }`}>
                                  {iconMap[event.status] || <CircleDot size={12} />}
                                </div>
                                {/* Content */}
                                <div className="pb-4 flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-semibold text-gray-900 capitalize">{event.status}</p>
                                    {isLast && (
                                      <span className="px-1.5 py-0.5 text-[10px] font-medium bg-[#0a2c23] text-white rounded-md">Latest</span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {new Date(event.timestamp).toLocaleDateString('en-US', {
                                      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
                                    })}
                                  </p>
                                  {event.note && (
                                    <div className="mt-1.5 px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-100">
                                      <p className="text-xs text-gray-600">{event.note}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-100 flex items-center justify-between sticky bottom-0 bg-white rounded-b-2xl">
                <div className="text-xs text-gray-400">
                  {showOrderDetail.items.length} item{showOrderDetail.items.length !== 1 ? 's' : ''} &middot; {showOrderDetail.total} MAD
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePrintInvoice}
                    disabled={isLoadingDetail}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    <Printer size={14} />
                    Print Invoice
                  </button>
                  <button
                    onClick={handleDownloadInvoice}
                    disabled={isLoadingDetail}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#0a2c23] rounded-xl hover:bg-[#0a2c23]/90 transition-colors disabled:opacity-50"
                  >
                    <Download size={14} />
                    Download
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Orders;
