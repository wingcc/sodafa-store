// SODFA MARKETPLACE - Reviews Management Page (Redesigned)
// A modern, product-centric review dashboard with beautiful UI

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Star,
  Check,
  X,
  MessageSquare,
  Search,
  Package,
  Send,
  Eye,
  Filter,
  Clock,
  Award,
  ChevronRight,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Reply,
  Trash2,
  User,
  Tag,
  TrendingUp,
  CheckCircle,
  Clock as ClockIcon,
  StarHalf,
  Sparkles,
  Zap,
} from 'lucide-react';
import Badge from '../components/ui/Badge';
import RefreshButton from '../components/ui/RefreshButton';
import { useStore } from '../store/useStore';
import { useToast } from '@/lib/toast';
import { useTranslation } from '../i18n/useTranslation';

type ApiReviewRow = {
  id: string;
  customer_id: string | null;
  customer_name: string;
  product_id: string;
  product_name: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_reply: string | null;
  created_at: string;
};

type UiReview = {
  id: string;
  customerId: string | null;
  customerName: string;
  productId: string;
  productName: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  adminReply: string | null;
  createdAt: string;
};

function mapReview(row: ApiReviewRow): UiReview {
  return {
    id: String(row.id),
    customerId: row.customer_id,
    customerName: row.customer_name || 'Anonymous',
    productId: String(row.product_id),
    productName: row.product_name || '',
    rating: Number(row.rating || 0),
    comment: String(row.comment || ''),
    status: (row.status as UiReview['status']) || 'pending',
    adminReply: row.admin_reply ?? null,
    createdAt: String(row.created_at || new Date().toISOString()),
  };
}

const Reviews: React.FC = () => {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const { products, fetchProducts, isLoadingProducts } = useStore();

  const [reviews, setReviews] = useState<UiReview[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [expandedReplyId, setExpandedReplyId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Fetch reviews from Supabase via API
  const fetchReviews = async (productId?: string | null) => {
    setIsLoadingReviews(true);
    setReviewsError(null);
    try {
      const params = new URLSearchParams();
      if (productId) params.set('productId', productId);
      const url = params.toString() ? `/api/reviews?${params.toString()}` : '/api/reviews';
      const res = await fetch(url);
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || 'Failed to fetch reviews');
      const mapped: UiReview[] = (json.data || []).map((r: ApiReviewRow) => mapReview(r));
      setReviews(mapped);
    } catch (err: any) {
      setReviewsError(err.message || 'Unknown error');
    } finally {
      setIsLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchReviews(null);
  }, []);

  const handleRefresh = async () => {
    await Promise.all([fetchProducts(), fetchReviews(selectedProductId)]);
    addToast('info', 'Reviews refreshed', { title: 'Refreshed' });
  };

  // Compute product stats from reviews
  const productStats = useMemo(() => {
    const map = new Map<string, { count: number; pending: number; approved: number; rejected: number; avg: number; sum: number }>();
    for (const r of reviews) {
      const s = map.get(r.productId) || { count: 0, pending: 0, approved: 0, rejected: 0, avg: 0, sum: 0 };
      s.count += 1;
      s.sum += r.rating;
      if (r.status === 'pending') s.pending += 1;
      if (r.status === 'approved') s.approved += 1;
      if (r.status === 'rejected') s.rejected += 1;
      s.avg = s.count ? s.sum / s.count : 0;
      map.set(r.productId, s);
    }
    return map;
  }, [reviews]);

  // Products with reviews + search
  const productsWithReviews = useMemo(() => {
    const list = products
      .filter((p) => productStats.has(p.id))
      .sort((a, b) => (productStats.get(b.id)?.count || 0) - (productStats.get(a.id)?.count || 0));
    if (!productSearch) return list;
    const q = productSearch.toLowerCase();
    return list.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
  }, [products, productStats, productSearch]);

  // Auto-select first product if none selected and we have data
  useEffect(() => {
    if (!selectedProductId && productsWithReviews.length > 0) {
      setSelectedProductId(productsWithReviews[0].id);
    }
  }, [productsWithReviews, selectedProductId]);

  const selectedProduct = useMemo(() => products.find((p) => p.id === selectedProductId) || null, [products, selectedProductId]);

  const selectedReviews = useMemo(() => {
    let list = reviews;
    if (selectedProductId) {
      list = list.filter((r) => r.productId === selectedProductId);
    }
    if (filter !== 'all') {
      list = list.filter((r) => r.status === filter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((r) => r.customerName.toLowerCase().includes(q) || r.comment.toLowerCase().includes(q));
    }
    return list;
  }, [reviews, selectedProductId, filter, searchQuery]);

  const globalAvg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const globalPending = reviews.filter((r) => r.status === 'pending').length;
  const globalApproved = reviews.filter((r) => r.status === 'approved').length;

  const selectedStats = selectedProductId ? productStats.get(selectedProductId) : null;
  const selectedAvg = selectedStats?.avg ?? 0;

  const ratingDistribution = useMemo(() => {
    const base = selectedProductId ? reviews.filter((r) => r.productId === selectedProductId) : reviews;
    return [5, 4, 3, 2, 1].map((rating) => {
      const count = base.filter((r) => r.rating === rating).length;
      const percentage = base.length ? (count / base.length) * 100 : 0;
      return { rating, count, percentage };
    });
  }, [reviews, selectedProductId]);

  const handleModerate = async (reviewId: string, newStatus: UiReview['status'], adminReply?: string | null) => {
    setActionLoading(reviewId);
    try {
      const body: any = { status: newStatus };
      if (adminReply !== undefined) body.adminReply = adminReply;
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || 'Failed to update');
      const updated: UiReview = mapReview(json.data);
      setReviews((prev) => prev.map((r) => (r.id === reviewId ? updated : r)));
      addToast('success', `Review ${newStatus}`, { title: newStatus === 'approved' ? 'Approved' : 'Rejected' });
    } catch (e: any) {
      addToast('error', e.message || 'Failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReply = async (review: UiReview) => {
    const draft = replyDrafts[review.id] ?? review.adminReply ?? '';
    if (!draft.trim()) {
      addToast('error', 'Reply cannot be empty');
      return;
    }
    await handleModerate(review.id, review.status, draft.trim());
    setExpandedReplyId(null);
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Delete this review? This cannot be undone.')) return;
    setActionLoading(reviewId);
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || 'Failed to delete');
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      addToast('success', 'Review deleted');
    } catch (e: any) {
      addToast('error', e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const renderStars = (rating: number, size = 16) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            size={size}
            className={s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}
          />
        ))}
      </div>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6 p-4 md:p-6 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent flex items-center gap-2">
            <span className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-xl text-white">
              <Star size={20} className="fill-white" />
            </span>
            Review Management
          </h2>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
            <span className="inline-flex items-center gap-1">
              <Sparkles size={14} className="text-blue-500" />
              Product-centric moderation
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <span>Supabase live</span>
          </p>
        </div>
        <RefreshButton onRefresh={handleRefresh} isLoading={isLoadingReviews || isLoadingProducts} size="md" variant="default" />
      </div>

      {/* Global overview - Redesigned Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Average Rating</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">{globalAvg ? globalAvg.toFixed(1) : '—'}</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 p-3 rounded-xl text-white">
              <Star size={20} className="fill-white" />
            </div>
          </div>
          <div className="mt-2">{renderStars(Math.round(globalAvg), 14)}</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Reviews</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">{reviews.length}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl text-white">
              <MessageSquare size={20} />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
            <CheckCircle size={14} className="text-emerald-500" />
            <span>{globalApproved} approved</span>
            <ClockIcon size={14} className="text-amber-500 ml-1" />
            <span>{globalPending} pending</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Pending Reviews</p>
              <p className="text-3xl font-bold text-amber-600 mt-1">{globalPending}</p>
            </div>
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-3 rounded-xl text-white">
              <ClockIcon size={20} />
            </div>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {globalPending > 0 ? 'Awaiting moderation' : 'All caught up! ✨'}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Products</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">{productsWithReviews.length}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-3 rounded-xl text-white">
              <Package size={20} />
            </div>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            with customer feedback
          </div>
        </div>
      </div>

      {/* Distribution Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-500" />
            {selectedProduct ? `${selectedProduct.name} — Rating Distribution` : 'Global Rating Distribution'}
          </h4>
          <Badge variant="outline" size="sm" className="bg-slate-50">
            {selectedProduct ? `${selectedStats?.count || 0} reviews` : `${reviews.length} total reviews`}
          </Badge>
        </div>
        <div className="space-y-2.5">
          {ratingDistribution.map(({ rating, count, percentage }) => (
            <div key={rating} className="flex items-center gap-3">
              <span className="text-sm font-medium w-8 text-slate-600">{rating} ★</span>
              <div className="flex-1 h-2.5 rounded-full overflow-hidden bg-slate-100">
                <div 
                  className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-blue-400 to-indigo-500" 
                  style={{ width: `${percentage}%` }} 
                />
              </div>
              <span className="text-sm text-slate-500 w-8 text-right font-medium">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main product-centric layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Product selector */}
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden sticky top-4">
            <div className="p-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Package size={16} className="text-blue-500" />
                  Products
                </h3>
                <Badge variant="secondary" size="sm" className="bg-blue-50 text-blue-600">
                  {productsWithReviews.length}
                </Badge>
              </div>
              <div className="relative mt-3">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="max-h-[520px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
              {isLoadingProducts ? (
                <div className="p-8 text-center">
                  <Loader2 size={24} className="animate-spin mx-auto text-blue-500 mb-2" />
                  <p className="text-sm text-slate-500">Loading products...</p>
                </div>
              ) : productsWithReviews.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                    <ImageIcon size={24} className="text-slate-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">No products with reviews</p>
                  <p className="text-xs text-slate-400 mt-1">Reviews will appear here once customers comment.</p>
                </div>
              ) : (
                productsWithReviews.map((product) => {
                  const stats = productStats.get(product.id);
                  const isActive = selectedProductId === product.id;
                  const initials = product.name.split(' ').slice(0, 2).map(n => n[0]).join('');
                  return (
                    <button
                      key={product.id}
                      onClick={() => setSelectedProductId(product.id)}
                      className={`w-full text-left p-4 flex gap-3 transition-all hover:bg-slate-50 border-l-4 ${
                        isActive ? 'bg-blue-50/50 border-blue-500' : 'border-transparent hover:border-slate-200'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${
                        isActive ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-slate-400 to-slate-500'
                      }`}>
                        {initials || 'P'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate text-slate-800">{product.name}</p>
                        <p className="text-xs text-slate-500 truncate">{product.categoryName} · {product.sku}</p>
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          <span className="flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                            <Star size={10} className="fill-yellow-400 text-yellow-400" />
                            {stats ? stats.avg.toFixed(1) : product.rating.toFixed(1)}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {stats?.count ?? 0} reviews
                          </span>
                          {stats && stats.pending > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                              {stats.pending} pending
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight size={16} className={`self-center flex-shrink-0 transition-colors ${
                        isActive ? 'text-blue-500' : 'text-slate-300'
                      }`} />
                    </button>
                  );
                })
              )}
            </div>

            <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <button
                onClick={() => setSelectedProductId(null)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition ${
                  !selectedProductId
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                All products
              </button>
              <span className="text-xs text-slate-400">
                {selectedProductId ? `${selectedReviews.length} shown` : `${reviews.length} total`}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Reviews for selected product */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-4">
          {/* Selected product header */}
          {selectedProduct ? (
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="relative h-28 md:h-32 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600">
                <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzR2LTRoNHY0aC00em0wIDB2LTRoLTR2NGg0eiIvPjwvZz48L2c+PC9zdmc+')]"></div>
                <div className="absolute -bottom-8 left-5 flex items-end gap-4">
                  <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg bg-white overflow-hidden flex items-center justify-center">
                    {selectedProduct.images?.[0] ? (
                      <img src={selectedProduct.images[0]} alt={selectedProduct.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package size={32} className="text-slate-400" />
                    )}
                  </div>
                  <div className="pb-2">
                    <h3 className="text-white font-bold text-lg leading-none drop-shadow-md">{selectedProduct.name}</h3>
                    <p className="text-white/80 text-xs flex items-center gap-2">
                      <Tag size={12} />
                      {selectedProduct.categoryName} · {selectedProduct.sku} · {selectedProduct.regularPrice} MAD
                    </p>
                  </div>
                </div>
                <div className="absolute top-3 right-3 flex gap-2">
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/20 backdrop-blur text-white border border-white/20 flex items-center gap-1">
                    <Award size={12} /> {selectedAvg.toFixed(1)} ★
                  </span>
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white text-slate-800">
                    {selectedStats?.count || 0} reviews
                  </span>
                </div>
              </div>
              <div className="pt-10 p-5">
                <p className="text-sm text-slate-600 line-clamp-2">
                  {selectedProduct.shortDescription || selectedProduct.fullDescription || 'No description available'}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="secondary" size="sm" className="bg-blue-50 text-blue-600 border-blue-200">
                    {selectedProduct.categoryName}
                  </Badge>
                  {selectedProduct.tags.slice(0, 4).map((tag) => (
                    <Badge key={tag} variant="outline" size="sm" className="bg-slate-50">
                      {tag}
                    </Badge>
                  ))}
                  <Badge 
                    variant="outline" 
                    size="sm" 
                    className={selectedProduct.stock > 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}
                  >
                    {selectedProduct.stock > 0 ? `${selectedProduct.stock} in stock` : 'Out of stock'}
                  </Badge>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
                <Eye size={24} className="text-blue-500" />
              </div>
              <p className="text-sm font-semibold text-slate-700">Select a product to moderate its reviews</p>
              <p className="text-xs text-slate-400 mt-1">Or use “All products” to see every comment.</p>
            </div>
          )}

          {/* Filters for reviews */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={selectedProduct ? `Search ${selectedProduct.name} reviews...` : 'Search reviews by customer or comment...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400"
              />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                    filter === f
                      ? 'bg-blue-500 text-white border-blue-500 shadow-sm shadow-blue-200'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                  {f !== 'all' && (
                    <span className={`ml-1.5 text-xs ${
                      filter === f ? 'text-blue-100' : 'text-slate-400'
                    }`}>
                      ({reviews.filter(r => r.status === f).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Reviews list */}
          <div className="space-y-4">
            {isLoadingReviews ? (
              <div className="bg-white rounded-2xl border border-slate-200/60 p-10 text-center">
                <Loader2 size={32} className="animate-spin mx-auto text-blue-500 mb-3" />
                <p className="text-sm text-slate-500">Loading reviews from Supabase...</p>
              </div>
            ) : selectedReviews.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/60 p-10 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <MessageSquare size={24} className="text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-700">No reviews found</p>
                <p className="text-xs text-slate-400 mt-1">
                  {selectedProduct ? `No ${filter !== 'all' ? filter : ''} reviews for ${selectedProduct.name}` : 'Try adjusting filters or search'}
                </p>
              </div>
            ) : (
              selectedReviews.map((review) => {
                const isPending = review.status === 'pending';
                const isApproved = review.status === 'approved';
                const isRejected = review.status === 'rejected';
                const initials = getInitials(review.customerName);
                const draft = replyDrafts[review.id] ?? review.adminReply ?? '';
                const isReplyOpen = expandedReplyId === review.id;
                const statusColor = getStatusColor(review.status);

                return (
                  <div key={review.id} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 hover:shadow-md transition-all">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0 ${
                        isPending ? 'bg-gradient-to-br from-amber-400 to-orange-500' :
                        isApproved ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' :
                        'bg-gradient-to-br from-red-400 to-red-600'
                      }`}>
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-slate-800">{review.customerName}</p>
                          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${statusColor}`}>
                            {review.status}
                          </span>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <ClockIcon size={12} />
                            {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                          on <span className="font-medium text-blue-600">{review.productName || selectedProduct?.name || 'Product'}</span>
                          {!selectedProductId && review.productId && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                              {review.productId.slice(0, 6)}
                            </span>
                          )}
                        </p>
                        <div className="flex items-center gap-1 mt-1.5">
                          {renderStars(review.rating, 14)}
                          <span className="text-xs text-slate-400 ml-1">{review.rating}.0</span>
                        </div>
                        <p className="text-sm mt-3 leading-relaxed text-slate-700">{review.comment || <span className="italic text-slate-400">No comment</span>}</p>

                        {review.adminReply && !isReplyOpen && (
                          <div className="mt-3 p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-slate-700">
                            <p className="text-xs font-semibold flex items-center gap-1 text-blue-600">
                              <Reply size={12} /> Admin reply
                            </p>
                            <p className="text-sm mt-1">{review.adminReply}</p>
                          </div>
                        )}

                        {isReplyOpen && (
                          <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                              <Reply size={12} className="text-blue-500" />
                              Reply as admin
                            </label>
                            <textarea
                              value={draft}
                              onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [review.id]: e.target.value }))}
                              rows={3}
                              placeholder="Write a helpful reply..."
                              className="w-full rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all bg-white border border-slate-200 text-slate-700 placeholder:text-slate-400"
                            />
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => setExpandedReplyId(null)}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleReply(review)}
                                disabled={!!actionLoading}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 transition flex items-center gap-1 disabled:opacity-50"
                              >
                                {actionLoading === review.id ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                                Save reply {isPending ? '& approve' : ''}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 mt-4 pt-3 border-t border-slate-100">
                      {isPending && (
                        <>
                          <button
                            onClick={() => handleModerate(review.id, 'approved', draft || review.adminReply || undefined)}
                            disabled={!!actionLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-emerald-500 hover:bg-emerald-600 transition disabled:opacity-50"
                          >
                            {actionLoading === review.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                            Approve
                          </button>
                          <button
                            onClick={() => handleModerate(review.id, 'rejected', draft || review.adminReply || undefined)}
                            disabled={!!actionLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-red-500 hover:bg-red-600 transition disabled:opacity-50"
                          >
                            {actionLoading === review.id ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
                            Reject
                          </button>
                        </>
                      )}
                      {isApproved && (
                        <button
                          onClick={() => handleModerate(review.id, 'rejected')}
                          disabled={!!actionLoading}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 bg-white text-red-500 hover:bg-red-50 transition disabled:opacity-50"
                        >
                          <X size={12} /> Reject
                        </button>
                      )}
                      {isRejected && (
                        <button
                          onClick={() => handleModerate(review.id, 'approved')}
                          disabled={!!actionLoading}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-emerald-500 hover:bg-emerald-600 transition disabled:opacity-50"
                        >
                          <Check size={12} /> Approve
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setExpandedReplyId(isReplyOpen ? null : review.id);
                          if (!replyDrafts[review.id]) setReplyDrafts((p) => ({ ...p, [review.id]: review.adminReply || '' }));
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                          isReplyOpen
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Reply size={12} /> {review.adminReply ? 'Edit reply' : 'Reply'}
                      </button>
                      <button
                        onClick={() => handleDelete(review.id)}
                        disabled={!!actionLoading}
                        className="ml-auto flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reviews;