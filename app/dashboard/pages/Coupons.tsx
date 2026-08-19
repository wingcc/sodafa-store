// SODFA MARKETPLACE - Coupons & Discounts Page

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import Badge from '../components/ui/Badge';
import RefreshButton from '../components/ui/RefreshButton';
import { useToast } from '@/lib/toast';

// Define the Coupon type locally since we can't import from types
interface Coupon {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
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

const Coupons: React.FC = () => {
  const { addToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Fetch coupons from API
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/coupons');
      if (!response.ok) {
        throw new Error('Failed to fetch coupons');
      }
      const result = await response.json();
      setCoupons(result.data || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      addToast('error', 'Failed to load coupons. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load coupons on component mount
  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleRefresh = () => {
    fetchCoupons();
    addToast('info', 'Coupons list refreshed', { title: 'Refreshed' });
  };

  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
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

  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    addToast('info', `"${code}" has been copied to clipboard.`, { title: 'Code Copied' });
  };

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
    if (!confirm('Are you sure you want to delete this coupon?')) {
      return;
    }

    setDeleting(id);
    try {
      const response = await fetch(`/api/coupons/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete coupon');
      }

      // Remove the deleted coupon from state
      setCoupons(prev => prev.filter(coupon => coupon.id !== id));
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
      if (editingCoupon) {
        // Update existing coupon
        response = await fetch(`/api/coupons/${editingCoupon.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code: formData.code.toUpperCase(),
            description: formData.description,
            discount_type: formData.discountType,
            discount_value: formData.discountValue,
            minimum_order: formData.minimumOrder,
            maximum_discount: formData.maximumDiscount || null,
            applicable_to: formData.applicableTo,
            applicable_ids: formData.applicableIds ? formData.applicableIds.split(',').map(id => id.trim()) : [],
            start_date: formData.startDate,
            end_date: formData.endDate,
            usage_limit: formData.usageLimit,
            customer_usage_limit: formData.customerUsageLimit,
            status: formData.status,
          }),
        });
      } else {
        // Create new coupon
        response = await fetch('/api/coupons', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code: formData.code.toUpperCase(),
            description: formData.description,
            discount_type: formData.discountType,
            discount_value: formData.discountValue,
            minimum_order: formData.minimumOrder,
            maximum_discount: formData.maximumDiscount || null,
            applicable_to: formData.applicableTo,
            applicable_ids: formData.applicableIds ? formData.applicableIds.split(',').map(id => id.trim()) : [],
            start_date: formData.startDate,
            end_date: formData.endDate,
            usage_limit: formData.usageLimit,
            customer_usage_limit: formData.customerUsageLimit,
            status: formData.status,
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || (editingCoupon ? 'Failed to update coupon' : 'Failed to create coupon'));
      }

      const result = await response.json();
      
      if (editingCoupon) {
        // Update the coupon in the state
        setCoupons(prev => prev.map(coupon => 
          coupon.id === editingCoupon.id ? result.data : coupon
        ));
        addToast('success', `Coupon "${formData.code}" has been updated successfully.`, {
          title: 'Coupon Updated',
        });
      } else {
        // Add the new coupon to the state
        setCoupons(prev => [result.data, ...prev]);
        addToast('success', `Coupon "${formData.code}" has been created successfully.`, {
          title: 'Coupon Created',
        });
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Discounts & Coupons</h2>
          <p className="text-sm text-gray-500 mt-1">Create and manage promotional codes</p>
        </div>
        <div className="flex items-center gap-3">
          <RefreshButton
            onRefresh={handleRefresh}
            size="md"
            variant="default"
          />
          <button
            onClick={() => { 
              setEditingCoupon(null); 
              setShowModal(true); 
              resetForm();
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-purple-500/25 transition-all"
          >
            <Plus size={16} />
            Create Coupon
          </button>
        </div>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      )}

      {!loading && (
        <>
          {/* Coupons Grid */}
          {coupons.length === 0 ? (
            <div className="text-center py-12">
              <Ticket className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No coupons</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new coupon.</p>
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
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {coupons.map((coupon) => (
                <div key={coupon.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        {coupon.discount_type === 'percentage' ? (
                          <Percent size={18} className="text-white" />
                        ) : (
                          <Tag size={18} className="text-white" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900 font-mono">{coupon.code}</span>
                          <button
                            onClick={() => handleCopyCode(coupon.code)}
                            className="p-1 rounded hover:bg-gray-100 transition-colors"
                          >
                            {copiedCode === coupon.code ? (
                              <Check size={12} className="text-emerald-500" />
                            ) : (
                              <Copy size={12} className="text-gray-400" />
                            )}
                          </button>
                        </div>
                        <Badge variant={coupon.status === 'active' ? 'success' : 'default'} size="sm" dot>
                          {coupon.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{coupon.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Discount</span>
                      <span className="font-semibold text-gray-900">
                        {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `${coupon.discount_value} MAD`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Min. Order</span>
                      <span className="text-gray-700">{coupon.minimum_order} MAD</span>
                    </div>
                    {coupon.maximum_discount !== undefined && coupon.maximum_discount > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Max. Discount</span>
                        <span className="text-gray-700">{coupon.maximum_discount} MAD</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Customer Limit</span>
                      <span className="text-gray-700">{coupon.customer_usage_limit}</span>
                    </div>
                    {coupon.applicable_to && coupon.applicable_to !== 'all' && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Applies to</span>
                        <span className="text-gray-700 capitalize">{coupon.applicable_to}</span>
                      </div>
                    )}
                  </div>

                  {/* Usage Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Usage: {coupon.used_count}/{coupon.usage_limit}</span>
                      <span>{coupon.usage_limit > 0 ? Math.round((coupon.used_count / coupon.usage_limit) * 100) : 0}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                        style={{ 
                          width: `${coupon.usage_limit > 0 ? (coupon.used_count / coupon.usage_limit) * 100 : 0}%` 
                        }}
                      />
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
                    <Calendar size={12} />
                    <span>
                      {new Date(coupon.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
                      {new Date(coupon.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  {/* Additional info tooltip */}
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                    <div className="flex items-center gap-1">
                      <Info size={10} />
                      <span>Created: {new Date(coupon.created_at || '').toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleEdit(coupon)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(coupon.id)}
                      disabled={deleting === coupon.id}
                      className={`p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors ${
                        deleting === coupon.id ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {deleting === coupon.id ? (
                        <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
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
              {(formData.applicableTo === 'products' || formData.applicableTo === 'categories') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {formData.applicableTo === 'products' ? 'Product IDs' : 'Category IDs'} (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.applicableIds}
                    onChange={(e) => setFormData({ ...formData, applicableIds: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300"
                    placeholder="e.g., prod-123, prod-456"
                  />
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
    </div>
  );
};

export default Coupons;