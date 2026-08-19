// SODFA MARKETPLACE - Inventory Management Page

import React, { useState, useEffect } from 'react';
import {
  Warehouse,
  AlertTriangle,
  PackageCheck,
  PackageX,
  Search,
  Plus,
  Minus,
  History,
  ArrowUp,
  ArrowDown,
  RefreshCw,
} from 'lucide-react';
import Badge from '../components/ui/Badge';
import StatCard from '../components/ui/StatCard';
import RefreshButton from '../components/ui/RefreshButton';
import { useStore } from '../store/useStore';
import { useToast } from '@/lib/toast';

const Inventory: React.FC = () => {
  const {
    products,
    isLoadingProducts,
    productsError,
    fetchProducts,
  } = useStore();
  const { addToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [adjustmentModal, setAdjustmentModal] = useState<any>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState(0);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const totalProducts = products.length;
  const inStock = products.filter((p) => p.stock > p.lowStockThreshold).length;
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold).length;
  const outOfStock = products.filter((p) => p.stock === 0).length;

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' ||
      (filter === 'in-stock' && p.stock > p.lowStockThreshold) ||
      (filter === 'low-stock' && p.stock > 0 && p.stock <= p.lowStockThreshold) ||
      (filter === 'out-of-stock' && p.stock === 0);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Inventory</h2>
          <p className="text-sm text-gray-500 mt-1">
            {isLoadingProducts ? 'Loading inventory...' : 'Track and manage your stock levels'}
          </p>
          {productsError && (
            <p className="text-xs text-red-500 mt-1">Error: {productsError}</p>
          )}
        </div>
        <RefreshButton
          onRefresh={fetchProducts}
          isLoading={isLoadingProducts}
          size="md"
          variant="default"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Products" value={totalProducts.toString()} icon={<Warehouse size={22} />} iconBg="bg-purple-50" iconColor="text-purple-600" />
        <StatCard title="In Stock" value={inStock.toString()} icon={<PackageCheck size={22} />} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
        <StatCard title="Low Stock" value={lowStock.toString()} icon={<AlertTriangle size={22} />} iconBg="bg-amber-50" iconColor="text-amber-600" />
        <StatCard title="Out of Stock" value={outOfStock.toString()} icon={<PackageX size={22} />} iconBg="bg-red-50" iconColor="text-red-600" />
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 transition-all"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'in-stock', 'low-stock', 'out-of-stock'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filter === f ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? 'All' : f === 'in-stock' ? 'In Stock' : f === 'low-stock' ? 'Low Stock' : 'Out of Stock'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">Product</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">SKU</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">Stock</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">Low Threshold</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img src={product.images[0]} alt={product.name} className="w-10 h-10 rounded-xl object-cover" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[180px]">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.categoryName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-gray-600 font-mono">{product.sku}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-sm font-bold ${
                      product.stock === 0 ? 'text-red-600' : product.stock <= product.lowStockThreshold ? 'text-amber-600' : 'text-gray-900'
                    }`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-gray-500">{product.lowStockThreshold}</span>
                  </td>
                  <td className="px-5 py-4">
                    <Badge
                      variant={product.stock === 0 ? 'danger' : product.stock <= product.lowStockThreshold ? 'warning' : 'success'}
                      dot
                    >
                      {product.stock === 0 ? 'Out of Stock' : product.stock <= product.lowStockThreshold ? 'Low Stock' : 'In Stock'}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setAdjustmentModal({ ...product, type: 'increase' })}
                        className="p-2 rounded-lg hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-colors"
                        title="Increase Stock"
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        onClick={() => setAdjustmentModal({ ...product, type: 'decrease' })}
                        className="p-2 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition-colors"
                        title="Decrease Stock"
                      >
                        <Minus size={14} />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-purple-50 text-gray-400 hover:text-purple-600 transition-colors" title="History">
                        <History size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjustment Modal */}
      {adjustmentModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Adjust Stock</h2>
              <p className="text-sm text-gray-500 mt-1">{adjustmentModal.name}</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">Current Stock</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{adjustmentModal.stock}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {adjustmentModal.type === 'increase' ? 'Add' : 'Remove'} Stock
                </label>
                <input
                  type="number"
                  value={adjustmentAmount}
                  onChange={(e) => setAdjustmentAmount(Number(e.target.value))}
                  min={0}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300"
                />
              </div>
              <div className="p-3 rounded-xl bg-gray-50 text-center">
                <p className="text-sm text-gray-500">New Stock</p>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  {adjustmentModal.type === 'increase'
                    ? adjustmentModal.stock + adjustmentAmount
                    : Math.max(0, adjustmentModal.stock - adjustmentAmount)}
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3">
              <button onClick={() => { setAdjustmentModal(null); setAdjustmentAmount(0); }} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button
                onClick={() => {
                  const newStock = adjustmentModal.type === 'increase'
                    ? adjustmentModal.stock + adjustmentAmount
                    : Math.max(0, adjustmentModal.stock - adjustmentAmount);
                  if (newStock === 0) {
                    addToast('warning', `"${adjustmentModal.name}" is now out of stock (0 units).`, { title: 'Out of Stock' });
                  } else {
                    addToast('success', `"${adjustmentModal.name}" stock updated to ${newStock} units.`, { title: 'Stock Updated' });
                  }
                  setAdjustmentModal(null);
                  setAdjustmentAmount(0);
                }}
                className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl hover:shadow-lg transition-all"
              >
                Apply Adjustment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
