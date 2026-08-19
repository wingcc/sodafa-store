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
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Badge from '../components/ui/Badge';
import RefreshButton from '../components/ui/RefreshButton';
import { useStore } from '../store/useStore';
import { useToast } from '@/lib/toast';

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

type ViewMode = 'cards' | 'table';

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

  return (
    <div className="relative">
      <button
        onClick={() => setOpenDropdown(isOpen ? null : orderId)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all ring-1 ${cfg.color} ${cfg.bg} ${cfg.ring} hover:shadow-sm`}
      >
        <span className={`w-2 h-2 rounded-full ${cfg.color.replace('text-', 'bg-')}`} />
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
                  <span className={`w-2.5 h-2.5 rounded-full ${sCfg.color.replace('text-', 'bg-')}`} />
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
  const {
    orders,
    updateOrderStatus,
    isLoadingOrders,
    ordersError,
    fetchOrders,
  } = useStore();
  const { addToast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOrderDetail, setShowOrderDetail] = useState<any>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [openStatusDropdown, setOpenStatusDropdown] = useState<string | null>(null);

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
    const handleClick = () => setOpenStatusDropdown(null);
    if (openStatusDropdown) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [openStatusDropdown]);

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

  const inputClass = 'w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#cda552]/20 focus:border-[#cda552]/50 transition-all';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Orders</h2>
          <p className="text-sm text-gray-500 mt-1">
            {isLoadingOrders ? 'Loading orders...' : `Manage and track all orders`}
          </p>
          {ordersError && (
            <p className="text-xs text-red-500 mt-1">Error: {ordersError}</p>
          )}
        </div>
        <RefreshButton
          onRefresh={fetchOrders}
          isLoading={isLoadingOrders}
          size="md"
          variant="default"
        />
      </div>

      {/* Status Tabs */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100">
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((status) => (
            <button
              key={status}
              onClick={() => handleFilterChange(status)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedStatus === status
                  ? 'bg-gradient-to-r from-[#0a2c23] to-[#0f3d31] text-white shadow-lg shadow-[#0a2c23]/25'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              <span className={`ml-2 px-1.5 py-0.5 rounded-md text-xs ${
                selectedStatus === status ? 'bg-white/20' : 'bg-gray-200'
              }`}>
                {statusCounts[status as keyof typeof statusCounts]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Search + View Toggle */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order number or customer name..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 rounded-xl p-1">
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
          </div>
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
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#cda552]/10 to-[#0f3d31]/10 flex items-center justify-center flex-shrink-0">
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
                            onClick={() => setShowOrderDetail(order)}
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
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="w-8 h-8 rounded-lg object-cover"
                            />
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
              <div className="w-5 h-5 border-2 border-[#cda552] border-t-transparent rounded-full animate-spin" />
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
                              <img
                                key={i}
                                src={item.productImage}
                                alt=""
                                className="w-7 h-7 rounded-full border-2 border-white object-cover"
                              />
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
                          onClick={() => setShowOrderDetail(order)}
                          className="p-2 rounded-lg hover:bg-[#cda552]/10 text-gray-400 hover:text-[#cda552] transition-colors"
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
              <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{showOrderDetail.orderNumber}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {new Date(showOrderDetail.createdAt).toLocaleDateString('en-US', {
                      month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
                <button
                  onClick={() => setShowOrderDetail(null)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Status & Payment */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-gray-50">
                    <p className="text-xs text-gray-500 mb-1">Order Status</p>
                    <StatusDropdown
                      orderId={showOrderDetail.id}
                      currentStatus={showOrderDetail.orderStatus}
                      onUpdate={(id, status) => {
                        handleQuickStatusUpdate(id, status);
                        setShowOrderDetail({ ...showOrderDetail, orderStatus: status });
                      }}
                      openDropdown={openStatusDropdown}
                      setOpenDropdown={setOpenStatusDropdown}
                    />
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50">
                    <p className="text-xs text-gray-500 mb-1">Payment</p>
                    <Badge
                      variant={showOrderDetail.paymentStatus === 'paid' ? 'success' : showOrderDetail.paymentStatus === 'failed' ? 'danger' : 'warning'}
                      size="md"
                    >
                      {showOrderDetail.paymentStatus}
                    </Badge>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="p-4 rounded-xl bg-gray-50">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Customer Information</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Name</p>
                      <p className="font-medium text-gray-900">{showOrderDetail.customerName}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{showOrderDetail.customerEmail}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Phone</p>
                      <p className="font-medium text-gray-900">{showOrderDetail.customerPhone}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">City</p>
                      <p className="font-medium text-gray-900">{showOrderDetail.shippingAddress.city}</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Order Items</h4>
                  <div className="space-y-3">
                    {showOrderDetail.items.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                        <img src={item.productImage} alt={item.productName} className="w-12 h-12 rounded-xl object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                          {item.variant && <p className="text-xs text-gray-500">{item.variant}</p>}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">{item.total} MAD</p>
                          <p className="text-xs text-gray-500">x{item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Total */}
                <div className="p-4 rounded-xl bg-gray-50 space-y-2">
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
                    <span className="text-gray-900">{showOrderDetail.total} MAD</span>
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Order Timeline</h4>
                  <div className="space-y-3">
                    {showOrderDetail.timeline.map((event: any, index: number) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            index === showOrderDetail.timeline.length - 1
                              ? 'bg-[#0a2c23] text-white'
                              : 'bg-gray-100 text-gray-400'
                          }`}>
                            {event.status === 'pending' && <Clock size={14} />}
                            {event.status === 'confirmed' && <CheckCircle2 size={14} />}
                            {event.status === 'processing' && <Package size={14} />}
                            {event.status === 'shipped' && <Truck size={14} />}
                            {event.status === 'delivered' && <CheckCircle2 size={14} />}
                            {event.status === 'cancelled' && <XCircle size={14} />}
                          </div>
                          {index < showOrderDetail.timeline.length - 1 && (
                            <div className="w-0.5 h-6 bg-gray-200 mt-1" />
                          )}
                        </div>
                        <div className="pb-3">
                          <p className="text-sm font-medium text-gray-900 capitalize">{event.status}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {new Date(event.timestamp).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                            })}
                          </p>
                          {event.note && <p className="text-xs text-gray-400 mt-0.5">{event.note}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  onClick={() => addToast('info', 'Invoice is being prepared for printing.', { title: 'Printing Invoice' })}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  <Printer size={14} />
                  Print Invoice
                </button>
                <button
                  onClick={() => addToast('info', 'Order download has started.', { title: 'Downloading' })}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  <Download size={14} />
                  Download
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Orders;
