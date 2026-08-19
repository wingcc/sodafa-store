// SODFA MARKETPLACE - Products Management Page

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  Plus,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Copy,
  ChevronDown,
  Package,
  Star,
  X,
  AlertTriangle,
  LayoutGrid,
  LayoutList,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Badge from '../components/ui/Badge';
import RefreshButton from '../components/ui/RefreshButton';
import { useStore } from '../store/useStore';
import { useToast } from '@/lib/toast';
import type { Product } from '../types';
import { ProductModal } from '@/app/dashboard/pages/products/ProductModal';

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
  parent_id?: string | null;
}

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const gridItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

function formatPrice(price: number) {
  return new Intl.NumberFormat('fr-SN', { style: 'decimal' }).format(price) + ' MAD';
}

type ViewMode = 'cards' | 'table';

const Products: React.FC = () => {
  const {
    products,
    searchQuery,
    setSearchQuery,
    deleteProduct,
    addProduct,
    updateProduct,
    isLoadingProducts,
    productsError,
    fetchProducts,
  } = useStore();
  const { addToast } = useToast();

  // Categories from API (real UUIDs from database)
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  // Fetch products and categories on mount
  useEffect(() => {
    fetchProducts();
    fetch('/api/categories')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setCategories(json.data);
        }
      })
      .catch(() => {
        // Fallback to empty - user can still add products without category
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  // Modals
  const [showProductModal, setShowProductModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Pagination (table view)
  const ITEMS_PER_PAGE = 12;
  const [currentPage, setCurrentPage] = useState(1);

  // Infinite scroll (card view)
  const [visibleCount, setVisibleCount] = useState(12);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const LOAD_BATCH = 8;

  // Filtered + sorted products
  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    const filtered = products.filter((p) => {
      const matchesSearch =
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || p.categoryId?.startsWith(selectedCategory);
      const matchesStatus = selectedStatus === 'all' || p.status === selectedStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-high': return (b.regularPrice || 0) - (a.regularPrice || 0);
        case 'price-low': return (a.regularPrice || 0) - (b.regularPrice || 0);
        case 'best-selling': return (b.totalSold || 0) - (a.totalSold || 0);
        case 'name': return (a.name || '').localeCompare(b.name || '');
        default: return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
    });
  }, [products, searchQuery, selectedCategory, selectedStatus, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
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

  const resetPagination = () => { setCurrentPage(1); setVisibleCount(12); };
  const handleCategoryChange = (val: string) => { setSelectedCategory(val); resetPagination(); };
  const handleStatusChange = (val: string) => { setSelectedStatus(val); resetPagination(); fetchProducts(val === 'all' ? undefined : val); };
  const handleSortChange = (val: string) => { setSortBy(val); resetPagination(); };

  // Infinite scroll for card view
  const loadMore = () => {
    if (visibleCount >= filteredProducts.length) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + LOAD_BATCH, filteredProducts.length));
      setIsLoadingMore(false);
    }, 400);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore && visibleCount < filteredProducts.length) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );
    const el = loadMoreRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadMore, isLoadingMore, visibleCount, filteredProducts.length]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  // Stats
  const stats = {
    total: products.length,
    active: products.filter((p) => p.status === 'active').length,
    lowStock: products.filter((p) => p.stock <= p.lowStockThreshold && p.status !== 'inactive').length,
    outOfStock: products.filter((p) => p.stock === 0).length,
  };

  // Handlers
  const openAdd = () => {
    setModalMode('add');
    setEditingProductId(null);
    setShowProductModal(true);
  };

  const openEdit = (product: Product) => {
    setModalMode('edit');
    setEditingProductId(product.id);
    setShowProductModal(true);
  };

  const handleDelete = (id: string): void => {
    const product = products.find((p) => p.id === id);
    deleteProduct(id);
    setShowDeleteConfirm(null);
    addToast('warning', `"${product?.name ?? 'Product'}" has been permanently removed.`, { title: 'Product Deleted' });
  };

  const getStockBadge = (product: Product): 'success' | 'warning' | 'danger' => {
    if (product.stock === 0) return 'danger';
    if (product.stock <= product.lowStockThreshold) return 'warning';
    return 'success';
  };

  const getStatusBadge = (status: string): 'success' | 'info' | 'default' => {
    if (status === 'active') return 'success';
    if (status === 'draft') return 'info';
    return 'default';
  };

  const inputClass = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#cda552]/20 focus:border-[#cda552]/50 transition-all';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Products</h2>
          <p className="text-sm text-gray-500 mt-1">
            {isLoadingProducts ? 'Loading products...' : `${stats.total} products • ${stats.active} active`}
          </p>
          {productsError && (
            <p className="text-xs text-red-500 mt-1">Error: {productsError}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <RefreshButton
            onRefresh={fetchProducts}
            isLoading={isLoadingProducts}
            size="md"
            variant="default"
          />
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#cda552] to-[#b8933e] text-white rounded-xl font-medium text-sm shadow-lg shadow-[#cda552]/25 hover:shadow-xl hover:shadow-[#cda552]/35 transition-all"
          >
            <Plus size={16} />
            Add Product
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-gray-800' },
          { label: 'Active', value: stats.active, color: 'text-emerald-600' },
          { label: 'Low Stock', value: stats.lowStock, color: 'text-amber-600' },
          { label: 'Out of Stock', value: stats.outOfStock, color: 'text-red-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters + View Toggle */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#cda552]/20 focus:border-[#cda552]/50 transition-all"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#cda552]/20 cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#cda552]/20 cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#cda552]/20 cursor-pointer"
          >
            <option value="newest">Newest</option>
            <option value="best-selling">Best Selling</option>
            <option value="price-high">Price: High to Low</option>
            <option value="price-low">Price: Low to High</option>
            <option value="name">Name</option>
          </select>

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
              {visibleProducts.map((product, index) => (
                <motion.div
                  key={product.id}
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
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group"
                >
                {/* Image */}
                <div className="relative h-44 overflow-hidden bg-gray-100">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                      product.status === 'active' ? 'bg-emerald-500/90 text-white' :
                      product.status === 'draft' ? 'bg-blue-500/90 text-white' :
                      'bg-gray-500/90 text-white'
                    }`}>
                      {product.status === 'active' ? 'Active' : product.status === 'draft' ? 'Draft' : 'Inactive'}
                    </span>
                    {product.ShowInStor && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-teal-500/90 text-white backdrop-blur-sm">
                        Show in Store
                      </span>
                    )}
                    {product.ADS && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/90 text-white backdrop-blur-sm">
                        ADS
                      </span>
                    )}
                  </div>
                  {product.stock <= product.lowStockThreshold && product.stock > 0 && (
                    <div className="absolute top-3 left-3">
                      <span className="flex items-center gap-1 px-2 py-1 bg-amber-500/90 text-white rounded-full text-xs font-medium">
                        <AlertTriangle className="w-3 h-3" />
                        Stock: {product.stock}
                      </span>
                    </div>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute top-3 left-3">
                      <span className="flex items-center gap-1 px-2 py-1 bg-red-500/90 text-white rounded-full text-xs font-medium">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="p-4">
                  <div className="flex items-center gap-1 mb-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-medium text-gray-600">{product.rating}</span>
                    <span className="text-xs text-gray-400">({product.reviewCount})</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 text-sm leading-tight line-clamp-1">{product.name}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.shortDescription}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    <span className="px-2 py-0.5 bg-[#cda552]/10 text-[#8B7034] rounded-full text-[10px] font-medium">
                      {product.categoryName}
                    </span>
                    {product.tags?.slice(0, 3).map((tag: string) => (
                      <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[10px] font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <p className="text-lg font-bold text-gray-800">
                      {formatPrice(product.regularPrice)}
                      {product.salePrice && (
                        <span className="text-xs text-red-500 line-through ml-1 font-normal">
                          {formatPrice(product.salePrice)}
                        </span>
                      )}
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setViewProduct(product)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEdit(product)}
                        className="p-1.5 rounded-lg hover:bg-[#cda552]/10 text-gray-400 hover:text-[#cda552] transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(product.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          </motion.div>

          {/* Loading indicator */}
          {isLoadingMore && (
            <div className="flex items-center justify-center py-8 gap-3">
              <div className="w-5 h-5 border-2 border-[#cda552] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-500">Loading more products...</span>
            </div>
          )}

          {/* Infinite scroll sentinel */}
          {hasMore && !isLoadingMore && (
            <div ref={loadMoreRef} className="h-10" />
          )}

          {/* All loaded indicator */}
          {!hasMore && filteredProducts.length > 0 && (
            <div className="text-center py-6">
              <p className="text-sm text-gray-400">All {filteredProducts.length} products loaded</p>
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
                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{product.name}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Star size={12} className="text-amber-400 fill-amber-400" />
                            <span className="text-xs text-gray-500">{product.rating}</span>
                            <span className="text-xs text-gray-400">({product.reviewCount})</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-600 font-mono">{product.sku}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-600">{product.categoryName}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        {product.salePrice ? (
                          <>
                            <span className="text-sm font-semibold text-gray-900">{formatPrice(product.salePrice)}</span>
                            <span className="text-xs text-gray-400 line-through ml-1">{formatPrice(product.regularPrice)}</span>
                          </>
                        ) : (
                          <span className="text-sm font-semibold text-gray-900">{formatPrice(product.regularPrice)}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={getStockBadge(product)} dot>
                        {product.stock}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <Badge variant={getStatusBadge(product.status)}>
                          {product.status}
                        </Badge>
                        {product.ShowInStor && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-teal-100 text-teal-700">
                            Show in Store
                          </span>
                        )}
                        {product.ADS && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-100 text-purple-700">
                            ADS
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setViewProduct(product)}
                          className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                          title="View"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => openEdit(product)}
                          className="p-2 rounded-lg hover:bg-[#cda552]/10 text-gray-400 hover:text-[#cda552] transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(product.id)}
                          className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="py-16 text-center">
              <Package size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">No products found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-5 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-sm text-gray-500">
                Showing <span className="font-medium text-gray-900">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span>
                {' '}&ndash;{' '}
                <span className="font-medium text-gray-900">{Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)}</span>
                {' '}of <span className="font-medium text-gray-900">{filteredProducts.length}</span> products
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
          {totalPages <= 1 && (
            <div className="px-5 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Showing <span className="font-medium text-gray-900">{filteredProducts.length}</span> products
              </p>
            </div>
          )}
        </div>
      )}

      {/* Empty State (cards mode) */}
      {viewMode === 'cards' && filteredProducts.length === 0 && (
        <div className="text-center py-16">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No products found</p>
          <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Product Modal */}
      <ProductModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        mode={modalMode}
        productId={editingProductId ?? undefined}
        onSaved={fetchProducts}
      />

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowDeleteConfirm(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full text-center"
          >
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Delete this product?</h3>
              <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
          </motion.div>
        </motion.div>
      )}

      {/* View Product Modal */}
      {viewProduct && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setViewProduct(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          >
              <div className="relative h-56">
                <img src={viewProduct.images[0]} alt={viewProduct.name} className="w-full h-full object-cover" />
                <button onClick={() => setViewProduct(null)} className="absolute top-3 right-3 p-2 bg-black/40 rounded-full text-white hover:bg-black/60 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-medium">{viewProduct.rating}</span>
                  <span className="text-sm text-gray-400">({viewProduct.reviewCount} reviews)</span>
                </div>
                <h2 className="text-xl font-bold text-gray-800">{viewProduct.name}</h2>
                <p className="text-sm text-gray-500 mt-2">{viewProduct.shortDescription}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="px-3 py-1 bg-[#cda552]/10 text-[#8B7034] rounded-full text-xs font-medium">
                    {viewProduct.categoryName}
                  </span>
                  {viewProduct.ShowInStor && (
                    <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-medium">
                      Show in Store
                    </span>
                  )}
                  {viewProduct.ADS && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      ADS
                    </span>
                  )}
                  {viewProduct.tags?.map((tag: string) => (
                    <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{formatPrice(viewProduct.regularPrice)}</p>
                    {viewProduct.salePrice && (
                      <p className="text-sm text-red-500 line-through">{formatPrice(viewProduct.salePrice)}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Stock</p>
                    <p className={`text-lg font-bold ${viewProduct.stock <= viewProduct.lowStockThreshold ? 'text-red-500' : 'text-emerald-600'}`}>
                      {viewProduct.stock} units
                    </p>
                  </div>
                </div>
              </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Products;