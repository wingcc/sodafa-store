// SODFA MARKETPLACE - Coupons & Discounts Page

import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Ticket,
  Calendar,
  Users,
  DollarSign,
  Edit2,
  Trash2,
  Copy,
  Check,
  X,
  Percent,
  Tag,
  Info,
  Search,
  LayoutGrid,
  LayoutList,
  TrendingUp,
  BarChart3,
  Zap,
  Truck,
} from 'lucide-react';
import Badge from '../components/ui/Badge';
import RefreshButton from '../components/ui/RefreshButton';
import EntityPickerModal from '../components/ui/EntityPickerModal';
import { useToast } from '@/lib/toast';
import { useTranslation } from '../i18n/useTranslation';
import { useStore } from '../store/useStore';

interface Coupon {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed' | 'free_shipping';
  discount_value: number;
  minimum_order: number;
  maximum_discount?: number;
  applicable_to: 'all' | 'products' | 'categories' | 'customers';
  applicable_ids?: string[];
  start_date: string;
  end_date: string;
  usage_limit: number;
  used_count: number;
  customer_usage_limit: number;
  status: 'active' | 'inactive' | 'expired';
  created_at?: string;
  updated_at?: string;
}

type ViewMode = 'cards' | 'table';

const Coupons: React.FC = () => {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerType, setPickerType] = useState<'products' | 'categories' | 'customers'>('products');

  // ── Auto-open coupon from notification navigation ──────────────────
  const pendingNavigation = useStore((s) => s.pendingNavigation);
  const clearPendingNavigation = useStore((s) => s.clearPendingNavigation);

  useEffect(() => {
    if (pendingNavigation?.page === 'coupons') {
      if (pendingNavigation.searchQuery) {
        setSearchQuery(pendingNavigation.searchQuery);
      }
      clearPendingNavigation();
    }
  }, [pendingNavigation, clearPendingNavigation]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/coupons');
      if (!response.ok) throw new Error('Failed to fetch coupons');
      const result = await response.json();
      setCoupons(result.data || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      addToast('error', 'Failed to load coupons. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const filteredCoupons = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return coupons.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.status.toLowerCase().includes(q)
    );
  }, [coupons, searchQuery]);

  const stats = useMemo(() => {
    const active = coupons.filter((c) => c.status === 'active').length;
    const totalUses = coupons.reduce((sum, c) => sum + c.used_count, 0);
    const totalValue = coupons.reduce((sum, c) => {
      if (c.discount_type === 'free_shipping') return sum + c.used_count * 15;
      if (c.discount_type === 'percentage') return sum + c.used_count * (c.discount_value * 0.5);
      return sum + c.used_count * c.discount_value;
    }, 0);
    const expired = coupons.filter((c) => c.status === 'expired').length;
    const conversionRate = coupons.length > 0 ? ((active / coupons.length) * 100).toFixed(1) : '0';
    return { active, totalUses, totalValue, conversionRate, expired };
  }, [coupons]);

  const handleRefresh = () => {
    fetchCoupons();
    addToast('info', 'Coupons list refreshed', { title: 'Refreshed' });
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    addToast('info', `"${code}" has been copied to clipboard.`, { title: 'Code Copied' });
  };

  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage' as 'percentage' | 'fixed' | 'free_shipping',
    discountValue: 0,
    minimumOrder: 0,
    maximumDiscount: 0,
    applicableTo: 'all' as 'all' | 'products' | 'categories' | 'customers',
    applicableIds: '',
    startDate: '',
    endDate: '',
    usageLimit: 0,
    customerUsageLimit: 1,
    status: 'active' as 'active' | 'inactive' | 'expired',
  });

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discount_type,
      discountValue: coupon.discount_value,
      minimumOrder: coupon.minimum_order,
      maximumDiscount: coupon.maximum_discount || 0,
      applicableTo: coupon.applicable_to,
      applicableIds: coupon.applicable_ids ? coupon.applicable_ids.join(',') : '',
      startDate: coupon.start_date ? coupon.start_date.split('T')[0] : '',
      endDate: coupon.end_date ? coupon.end_date.split('T')[0] : '',
      usageLimit: coupon.usage_limit,
      customerUsageLimit: coupon.customer_usage_limit,
      status: coupon.status,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    setDeleting(id);
    try {
      const response = await fetch(`/api/coupons/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete coupon');
      }
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      addToast('success', 'Coupon has been deleted successfully.', { title: 'Coupon Deleted' });
    } catch (error: any) {
      console.error('Error deleting coupon:', error);
      addToast('error', error.message || 'Failed to delete coupon. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  const handleSubmit = async () => {
    if (!formData.code) {
      addToast('error', 'Please enter a coupon code.', { title: 'Missing Code' });
      return;
    }
    try {
      let response;
      const payload = {
        code: formData.code.toUpperCase(),
        description: formData.description,
        discount_type: formData.discountType,
        discount_value: formData.discountValue,
        minimum_order: formData.minimumOrder,
        maximum_discount: formData.maximumDiscount || null,
        applicable_to: formData.applicableTo,
        applicable_ids: formData.applicableIds ? formData.applicableIds.split(',').map((id) => id.trim()) : [],
        start_date: formData.startDate,
        end_date: formData.endDate,
        usage_limit: formData.usageLimit,
        customer_usage_limit: formData.customerUsageLimit,
        status: formData.status,
      };
      if (editingCoupon) {
        response = await fetch(`/api/coupons/${editingCoupon.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch('/api/coupons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      if (!response.ok) {
        const errorData = await response.json();
        const msg = errorData.error?.message || errorData.error || (editingCoupon ? 'Failed to update coupon' : 'Failed to create coupon');
        throw new Error(msg);
      }
      const result = await response.json();
      if (editingCoupon) {
        setCoupons((prev) => prev.map((c) => (c.id === editingCoupon.id ? result.data : c)));
        addToast('success', `Coupon "${formData.code}" has been updated successfully.`, { title: 'Coupon Updated' });
      } else {
        setCoupons((prev) => [result.data, ...prev]);
        addToast('success', `Coupon "${formData.code}" has been created successfully.`, { title: 'Coupon Created' });
      }
      setShowModal(false);
      setEditingCoupon(null);
      resetForm();
    } catch (error: any) {
      console.error('Error saving coupon:', error);
      addToast('error', error.message || (editingCoupon ? 'Failed to update coupon' : 'Failed to create coupon'));
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: 0,
      minimumOrder: 0,
      maximumDiscount: 0,
      applicableTo: 'all',
      applicableIds: '',
      startDate: '',
      endDate: '',
      usageLimit: 0,
      customerUsageLimit: 1,
      status: 'active',
    });
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const CouponTypeIcon = ({ type, size = 14 }: { type: string; size?: number }) => {
    if (type === 'free_shipping') return <Truck size={size} />;
    return type === 'percentage' ? <Percent size={size} /> : <Tag size={size} />;
  };

  const couponTypeStyle: Record<string, { bg: string; text: string; border: string }> = {
    percentage: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
    fixed: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
    free_shipping: { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-200' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{t('coupons.title')}</h2>
          <p className="text-sm text-gray-500 mt-1">{t('coupons.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditingCoupon(null);
              setShowModal(true);
              resetForm();
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-purple-500/25 transition-all"
          >
            <Plus size={16} />
            Create Discount
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Active Coupons', value: stats.active, icon: Zap, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Total Uses', value: stats.totalUses.toLocaleString(), icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Revenue Impact', value: `$${stats.totalValue.toLocaleString()}`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Active Rate', value: `${stats.conversionRate}%`, icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
              <stat.icon size={18} className={stat.color} />
            </div>
            <div>
              <p className="text-[11px] text-gray-400 uppercase tracking-wide">{stat.label}</p>
              <p className="text-lg font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar: Search + View Toggle */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search coupons by code or description..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 transition-all"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 rounded-xl p-1 flex-shrink-0">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'cards'
                  ? 'bg-white text-gray-900 shadow-sm'
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
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Table view"
            >
              <LayoutList size={16} />
            </button>
          </div>

          {/* Refresh */}
          <RefreshButton onRefresh={handleRefresh} size="md" variant="default" />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      )}

      {!loading && (
        <>
          {filteredCoupons.length === 0 ? (
            <div className="text-center py-12">
              <Ticket className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchQuery ? 'No coupons match your search' : 'No coupons'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery ? 'Try a different search term' : 'Get started by creating a new coupon.'}
              </p>
              {!searchQuery && (
                <div className="mt-6">
                  <button
                    onClick={() => {
                      setEditingCoupon(null);
                      setShowModal(true);
                      resetForm();
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                  >
                    <Plus size={16} />
                    Create Coupon
                  </button>
                </div>
              )}
            </div>
          ) : viewMode === 'cards' ? (
            /* Card View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredCoupons.map((coupon) => (
                <div key={coupon.id} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all group">
                  {/* Top row: code + status */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 ${couponTypeStyle[coupon.discount_type]?.bg} ${couponTypeStyle[coupon.discount_type]?.border}`}>
                        <span className={couponTypeStyle[coupon.discount_type]?.text}>
                          <CouponTypeIcon type={coupon.discount_type} size={14} />
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-gray-900 font-mono">{coupon.code}</span>
                          <button
                            onClick={() => handleCopyCode(coupon.code)}
                            className="p-0.5 rounded hover:bg-gray-100 transition-colors"
                          >
                            {copiedCode === coupon.code ? (
                              <Check size={10} className="text-emerald-500" />
                            ) : (
                              <Copy size={10} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </button>
                        </div>
                        <Badge variant={coupon.status === 'active' ? 'success' : coupon.status === 'expired' ? 'danger' : 'default'} size="sm" dot>
                          {coupon.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {coupon.description && (
                    <p className="text-xs text-gray-500 mb-2 line-clamp-1">{coupon.description}</p>
                  )}

                  {/* Discount value */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-bold text-gray-900">
                      {coupon.discount_type === 'free_shipping'
                        ? 'Free'
                        : coupon.discount_type === 'percentage'
                          ? `${coupon.discount_value}%`
                          : `${coupon.discount_value} MAD`}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md uppercase border ${couponTypeStyle[coupon.discount_type]?.bg} ${couponTypeStyle[coupon.discount_type]?.text} ${couponTypeStyle[coupon.discount_type]?.border}`}>
                      {coupon.discount_type === 'free_shipping' ? 'shipping' : coupon.discount_type === 'percentage' ? 'percent' : 'fixed'}
                    </span>
                  </div>

                  {/* Compact info */}
                  <div className="flex items-center gap-3 text-[11px] text-gray-400 mb-2">
                    <span>Min: {coupon.minimum_order} MAD</span>
                    <span className="w-px h-3 bg-gray-200" />
                    <span>
                      {coupon.used_count}/{coupon.usage_limit === 0 ? '∞' : coupon.usage_limit} uses
                    </span>
                  </div>

                  {/* Usage bar */}
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      style={{ width: `${coupon.usage_limit > 0 ? Math.min((coupon.used_count / coupon.usage_limit) * 100, 100) : 0}%` }}
                    />
                  </div>

                  {/* Dates + Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                    <div className="flex items-center gap-1 text-[10px] text-gray-400">
                      <Calendar size={10} />
                      <span>{formatDate(coupon.start_date)} - {formatDate(coupon.end_date)}</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => handleEdit(coupon)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(coupon.id)}
                        disabled={deleting === coupon.id}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                      >
                        {deleting === coupon.id ? (
                          <div className="animate-spin w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full" />
                        ) : (
                          <Trash2 size={12} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Table View */
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-3 text-[11px] font-medium text-gray-500 uppercase tracking-wide">Code</th>
                    <th className="text-left px-4 py-3 text-[11px] font-medium text-gray-500 uppercase tracking-wide">Type</th>
                    <th className="text-left px-4 py-3 text-[11px] font-medium text-gray-500 uppercase tracking-wide">Value</th>
                    <th className="text-left px-4 py-3 text-[11px] font-medium text-gray-500 uppercase tracking-wide">Min. Order</th>
                    <th className="text-left px-4 py-3 text-[11px] font-medium text-gray-500 uppercase tracking-wide">Uses</th>
                    <th className="text-left px-4 py-3 text-[11px] font-medium text-gray-500 uppercase tracking-wide">Valid Until</th>
                    <th className="text-left px-4 py-3 text-[11px] font-medium text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-right px-4 py-3 text-[11px] font-medium text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredCoupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold font-mono text-gray-900">{coupon.code}</span>
                          <button
                            onClick={() => handleCopyCode(coupon.code)}
                            className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {copiedCode === coupon.code ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${couponTypeStyle[coupon.discount_type]?.bg} ${couponTypeStyle[coupon.discount_type]?.text} ${couponTypeStyle[coupon.discount_type]?.border}`}>
                          <CouponTypeIcon type={coupon.discount_type} size={10} />
                          {coupon.discount_type === 'free_shipping' ? 'Free Shipping' : coupon.discount_type === 'percentage' ? 'Percentage' : 'Fixed'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-gray-900">
                          {coupon.discount_type === 'free_shipping'
                            ? 'Free'
                            : coupon.discount_type === 'percentage'
                              ? `${coupon.discount_value}%`
                              : `${coupon.discount_value} MAD`}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">{coupon.minimum_order} MAD</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{coupon.used_count}</span>
                          <span className="text-xs text-gray-400">/ {coupon.usage_limit === 0 ? '∞' : coupon.usage_limit}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">{formatDate(coupon.end_date)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={coupon.status === 'active' ? 'success' : coupon.status === 'expired' ? 'danger' : 'default'} size="sm" dot>
                          {coupon.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(coupon)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(coupon.id)}
                            disabled={deleting === coupon.id}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                          >
                            {deleting === coupon.id ? (
                              <div className="animate-spin w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent rounded-full" />
                            ) : (
                              <Trash2 size={14} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingCoupon(null);
                  resetForm();
                }}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Coupon Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300"
                    placeholder="e.g., SUMMER25"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (MAD)</option>
                    <option value="free_shipping">Free Shipping</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300"
                  placeholder="e.g., Summer Sale - 25% off"
                />
              </div>
              {formData.discountType === 'free_shipping' ? (
                <div className="space-y-4">
                  <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-cyan-700">
                      <Truck size={16} />
                      <span className="text-sm font-medium">Free Shipping Coupon</span>
                    </div>
                    <p className="text-xs text-cyan-600 mt-1">Customers will receive free shipping on qualifying orders.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Minimum Order to Qualify (MAD)</label>
                    <input
                      type="number"
                      value={formData.minimumOrder}
                      onChange={(e) => setFormData({ ...formData, minimumOrder: Number(e.target.value) })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300"
                      placeholder="0 for no minimum"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Discount Value</label>
                    <input
                      type="number"
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Minimum Order (MAD)</label>
                    <input
                      type="number"
                      value={formData.minimumOrder}
                      onChange={(e) => setFormData({ ...formData, minimumOrder: Number(e.target.value) })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300"
                    />
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Usage Limit</label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Customer Usage Limit</label>
                  <input
                    type="number"
                    value={formData.customerUsageLimit}
                    onChange={(e) => setFormData({ ...formData, customerUsageLimit: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Maximum Discount (MAD)</label>
                  <input
                    type="number"
                    value={formData.maximumDiscount}
                    onChange={(e) => setFormData({ ...formData, maximumDiscount: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Applies To</label>
                  <select
                    value={formData.applicableTo}
                    onChange={(e) => setFormData({ ...formData, applicableTo: e.target.value as any })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300"
                  >
                    <option value="all">All Products</option>
                    <option value="products">Specific Products</option>
                    <option value="categories">Specific Categories</option>
                    <option value="customers">Specific Customers</option>
                  </select>
                </div>
              </div>
              {(formData.applicableTo === 'products' || formData.applicableTo === 'categories' || formData.applicableTo === 'customers') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {formData.applicableTo === 'products'
                      ? 'Products'
                      : formData.applicableTo === 'categories'
                      ? 'Categories'
                      : 'Customers'}
                  </label>
                  {formData.applicableIds ? (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1.5">
                        {formData.applicableIds.split(',').filter(Boolean).map((id) => (
                          <span
                            key={id}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 border border-purple-200 rounded-lg text-xs font-medium text-purple-700"
                          >
                            {id.trim().slice(0, 12)}...
                            <button
                              onClick={() => {
                                const ids = formData.applicableIds
                                  .split(',')
                                  .map((s) => s.trim())
                                  .filter((s) => s && s !== id.trim());
                                setFormData({ ...formData, applicableIds: ids.join(',') });
                              }}
                              className="p-0.5 rounded hover:bg-purple-100"
                            >
                              <X size={10} />
                            </button>
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={() => {
                          setPickerType(formData.applicableTo as 'products' | 'categories' | 'customers');
                          setPickerOpen(true);
                        }}
                        className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                      >
                        + Add more
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setPickerType(formData.applicableTo as 'products' | 'categories' | 'customers');
                        setPickerOpen(true);
                      }}
                      className="w-full bg-gray-50 border border-dashed border-gray-300 rounded-xl px-4 py-6 text-sm text-gray-500 hover:border-purple-300 hover:text-purple-600 transition-all flex flex-col items-center gap-2"
                    >
                      <Search size={20} />
                      Click to search and select {formData.applicableTo}
                    </button>
                  )}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingCoupon(null);
                  resetForm();
                }}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl hover:shadow-lg transition-all"
              >
                {editingCoupon ? 'Save Changes' : 'Create Coupon'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Entity Picker Modal */}
      <EntityPickerModal
        open={pickerOpen}
        type={pickerType}
        selectedIds={formData.applicableIds ? formData.applicableIds.split(',').map((s) => s.trim()).filter(Boolean) : []}
        onConfirm={(ids) => setFormData({ ...formData, applicableIds: ids.join(',') })}
        onClose={() => setPickerOpen(false)}
      />
    </div>
  );
};

export default Coupons;
