// SODFA MARKETPLACE - Customers Management Page

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  Search,
  Users,
  Mail,
  Phone,
  MapPin,
  ShoppingCart,
  DollarSign,
  Calendar,
  Eye,
  X,
  Star,
  LayoutGrid,
  LayoutList,
  TrendingUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Badge from '../components/ui/Badge';
import RefreshButton from '../components/ui/RefreshButton';
import { useStore } from '../store/useStore';
import { orders } from '../data/mockData';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

type ViewMode = 'cards' | 'table';

const Customers: React.FC = () => {
  const {
    customers,
    isLoadingCustomers,
    customersError,
    fetchCustomers,
  } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  // Fetch customers on mount
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Pagination (table view)
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Infinite scroll (card view)
  const [visibleCount, setVisibleCount] = useState(8);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const LOAD_BATCH = 8;

  const filteredCustomers = useMemo(() => {
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery)
    );
  }, [customers, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
  const paginatedCustomers = filteredCustomers.slice(
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
    if (visibleCount >= filteredCustomers.length) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + LOAD_BATCH, filteredCustomers.length));
      setIsLoadingMore(false);
    }, 400);
  }, [visibleCount, filteredCustomers.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore && visibleCount < filteredCustomers.length) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );
    const el = loadMoreRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [loadMore, isLoadingMore, visibleCount, filteredCustomers.length]);

  const visibleCustomers = filteredCustomers.slice(0, visibleCount);
  const hasMore = visibleCount < filteredCustomers.length;

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
    setVisibleCount(8);
  };

  const getCustomerOrders = (customerId: string) =>
    orders.filter((o) => o.customerId === customerId);

  const topCustomers = [...customers]
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 3);

  const totalSpent = customers.reduce((s, c) => s + c.totalSpent, 0);
  const totalOrders = customers.reduce((s, c) => s + c.totalOrders, 0);
  const avgSpent = customers.length > 0 ? totalSpent / customers.length : 0;

  const inputClass = 'w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#cda552]/20 focus:border-[#cda552]/50 transition-all';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Customers</h2>
          <p className="text-sm text-gray-500 mt-1">
            {isLoadingCustomers ? 'Loading customers...' : `${customers.length} registered customers`}
          </p>
          {customersError && (
            <p className="text-xs text-red-500 mt-1">Error: {customersError}</p>
          )}
        </div>
        <RefreshButton
          onRefresh={fetchCustomers}
          isLoading={isLoadingCustomers}
          size="md"
          variant="default"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Customers', value: customers.length, icon: <Users className="w-5 h-5" />, color: 'from-[#0f3d31] to-[#0a2c23]' },
          { label: 'Total Orders', value: totalOrders, icon: <ShoppingCart className="w-5 h-5" />, color: 'from-[#cda552] to-[#b8933e]' },
          { label: 'Avg. Spent', value: avgSpent.toLocaleString() + ' MAD', icon: <DollarSign className="w-5 h-5" />, color: 'from-[#0f3d31] to-[#cda552]' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-lg`}>
                {s.icon}
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">{s.value}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Top Customers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {topCustomers.map((customer, index) => (
          <div key={customer.id} className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm ${
                  index === 0 ? 'bg-gradient-to-br from-[#cda552] to-[#b8933e]' :
                  index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' :
                  'bg-gradient-to-br from-[#0f3d31] to-[#0a2c23]'
                }`}>
                  {customer.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </div>
                {index === 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#cda552] rounded-full flex items-center justify-center">
                    <Star size={10} className="text-white fill-white" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{customer.name}</p>
                <p className="text-xs text-gray-500 truncate">{customer.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-2 rounded-lg bg-gray-50">
                <p className="text-[10px] text-gray-500">Total Spent</p>
                <p className="text-sm font-bold text-gray-900">{customer.totalSpent.toLocaleString()} MAD</p>
              </div>
              <div className="p-2 rounded-lg bg-gray-50">
                <p className="text-[10px] text-gray-500">Orders</p>
                <p className="text-sm font-bold text-gray-900">{customer.totalOrders}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search + View Toggle */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers by name, email, or phone..."
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
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {visibleCustomers.map((customer, index) => (
                <motion.div
                  key={customer.id}
                  layout
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ y: -4 }}
                  transition={{
                    opacity: { duration: 0.3, delay: index >= visibleCount - LOAD_BATCH ? (index - (visibleCount - LOAD_BATCH)) * 0.05 : 0 },
                    y: { duration: 0.3, delay: index >= visibleCount - LOAD_BATCH ? (index - (visibleCount - LOAD_BATCH)) * 0.05 : 0 },
                    scale: { duration: 0.2 },
                    layout: { duration: 0.3 },
                  }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0f3d31] to-[#0a2c23] flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 ring-2 ring-[#cda552]/20">
                      {customer.avatar ? (
                        <img src={customer.avatar} alt={customer.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        customer.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-800 text-sm truncate">{customer.name}</h3>
                      <p className="text-xs text-gray-400 truncate">{customer.email}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      {customer.phone}
                    </div>
                    {customer.addresses?.[0] && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span className="truncate">{customer.addresses[0].city}, {customer.addresses[0].region}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-lg font-bold text-gray-800">{customer.totalOrders}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">Orders</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#cda552]">{customer.totalSpent.toLocaleString()} MAD</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">Spent</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-[10px] text-gray-400">
                      Since {new Date(customer.registeredAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </p>
                    <Badge variant={customer.status === 'active' ? 'success' : 'default'} size="sm">
                      {customer.status}
                    </Badge>
                  </div>

                  <button
                    onClick={() => setSelectedCustomer(customer)}
                    className="w-full mt-3 py-2 text-xs font-medium text-[#0a2c23] bg-[#cda552]/10 hover:bg-[#cda552]/20 rounded-xl transition-colors"
                  >
                    View Details
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Loading indicator */}
          {isLoadingMore && (
            <div className="flex items-center justify-center py-8 gap-3">
              <div className="w-5 h-5 border-2 border-[#cda552] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-500">Loading more customers...</span>
            </div>
          )}

          {/* Infinite scroll sentinel */}
          {hasMore && !isLoadingMore && (
            <div ref={loadMoreRef} className="h-10" />
          )}

          {/* All loaded indicator */}
          {!hasMore && filteredCustomers.length > 0 && (
            <div className="text-center py-6">
              <p className="text-sm text-gray-400">All {filteredCustomers.length} customers loaded</p>
            </div>
          )}

          {/* Empty State */}
          {filteredCustomers.length === 0 && (
            <div className="text-center py-16">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No customers found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your search</p>
            </div>
          )}
        </>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Orders</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Spent</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Order</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0f3d31] to-[#0a2c23] flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                          {customer.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{customer.name}</p>
                          <p className="text-xs text-gray-500 truncate">
                            Since {new Date(customer.registeredAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm text-gray-900">{customer.email}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{customer.phone}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-medium text-gray-900">{customer.totalOrders}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-semibold text-gray-900">{customer.totalSpent.toLocaleString()} MAD</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-600">
                        {new Date(customer.lastOrderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={customer.status === 'active' ? 'success' : 'default'} dot>
                        {customer.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setSelectedCustomer(customer)}
                        className="p-2 rounded-lg hover:bg-[#cda552]/10 text-gray-400 hover:text-[#cda552] transition-colors"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCustomers.length === 0 && (
            <div className="py-16 text-center">
              <Users size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">No customers found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your search</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-5 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-sm text-gray-500">
                Showing <span className="font-medium text-gray-900">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span>
                {' '}&ndash;{' '}
                <span className="font-medium text-gray-900">{Math.min(currentPage * ITEMS_PER_PAGE, filteredCustomers.length)}</span>
                {' '}of <span className="font-medium text-gray-900">{filteredCustomers.length}</span> customers
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
          {totalPages <= 1 && filteredCustomers.length > 0 && (
            <div className="px-5 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Showing <span className="font-medium text-gray-900">{filteredCustomers.length}</span> customers
              </p>
            </div>
          )}
        </div>
      )}

      {/* Customer Detail Modal */}
      <AnimatePresence>
        {selectedCustomer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedCustomer(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0f3d31] to-[#0a2c23] flex items-center justify-center text-white font-bold text-sm">
                    {selectedCustomer.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{selectedCustomer.name}</h2>
                    <p className="text-sm text-gray-500">{selectedCustomer.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-[#0f3d31]/5 text-center">
                    <p className="text-2xl font-bold text-[#0f3d31]">{selectedCustomer.totalOrders}</p>
                    <p className="text-xs text-[#0f3d31]/70 mt-1">Total Orders</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#cda552]/10 text-center">
                    <p className="text-2xl font-bold text-[#cda552]">{selectedCustomer.totalSpent.toLocaleString()}</p>
                    <p className="text-xs text-[#cda552]/70 mt-1">Total Spent (MAD)</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-100 text-center">
                    <p className="text-2xl font-bold text-gray-700">
                      {selectedCustomer.favoriteCategories.length}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Favorite Categories</p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="p-4 rounded-xl bg-gray-50">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Contact Information</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-gray-400" />
                      <span className="text-gray-600">{selectedCustomer.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-gray-400" />
                      <span className="text-gray-600">{selectedCustomer.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Addresses */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Addresses</h4>
                  <div className="space-y-2">
                    {selectedCustomer.addresses.map((addr: any) => (
                      <div key={addr.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                        <MapPin size={14} className="text-gray-400 mt-0.5" />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900">{addr.label}</p>
                            {addr.isDefault && (
                              <Badge variant="success" size="sm">Default</Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {addr.address}, {addr.city}, {addr.region}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Favorite Categories */}
                {selectedCustomer.favoriteCategories.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Favorite Categories</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCustomer.favoriteCategories.map((cat: string) => (
                        <span key={cat} className="px-3 py-1 bg-[#cda552]/10 text-[#8B7034] rounded-full text-xs font-medium">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Orders */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Recent Orders</h4>
                  <div className="space-y-2">
                    {getCustomerOrders(selectedCustomer.id).slice(0, 3).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{order.orderNumber}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">{order.total} MAD</p>
                          <Badge
                            variant={order.orderStatus === 'delivered' ? 'success' : 'info'}
                            size="sm"
                          >
                            {order.orderStatus}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {getCustomerOrders(selectedCustomer.id).length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-4">No orders yet</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Customers;
