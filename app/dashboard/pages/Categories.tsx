// SODFA MARKETPLACE - Categories Management Page (Real Data)

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  FolderTree,
  Loader2,
  X,
  Upload,
} from 'lucide-react';
import Badge from '../components/ui/Badge';
import RefreshButton from '../components/ui/RefreshButton';
import { useToast } from '@/lib/toast';
import { useTranslation } from '../i18n/useTranslation';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  status: 'active' | 'inactive';
  productCount?: number;
  parentId?: string | null;
  children?: Category[];
}

const Categories: React.FC = () => {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active' as 'active' | 'inactive',
    image: '',
  });

  const fetchCategories = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      const cats = data.data || data.categories || data || [];
      const map = new Map<string, Category>();
      const roots: Category[] = [];
      for (const cat of cats) {
        map.set(cat.id, { ...cat, children: [] });
      }
      for (const cat of cats) {
        const node = map.get(cat.id)!;
        if (cat.parentId && map.has(cat.parentId)) {
          map.get(cat.parentId)!.children!.push(node);
        } else {
          roots.push(node);
        }
      }
      setCategories(roots);
    } catch {
      addToast('error', 'Failed to load categories');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [addToast]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: String(category.name || ''),
      description: String(category.description || ''),
      status: String(category.status || 'active') as 'active' | 'inactive',
      image: String(category.image || ''),
    });
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', status: 'active', image: '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name) {
      addToast('error', 'Please enter a category name.', { title: 'Missing Name' });
      return;
    }
    try {
      const method = editingCategory ? 'PUT' : 'POST';
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories';
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: formData.description,
          status: formData.status,
          image: formData.image || null,
        }),
      });
      addToast('success', `"${formData.name}" has been saved successfully.`, {
        title: editingCategory ? 'Category Updated' : 'Category Created',
      });
      setShowModal(false);
      setEditingCategory(null);
      fetchCategories();
    } catch {
      addToast('error', 'Failed to save category');
    }
  };

  const handleDelete = async (category: Category) => {
    try {
      await fetch(`/api/categories/${category.id}`, { method: 'DELETE' });
      addToast('success', 'Category deleted');
      fetchCategories();
    } catch {
      addToast('error', 'Failed to delete category');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-[#1E7A57] mx-auto mb-4" />
          <p className="text-gray-500">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{t('header.page.categories')}</h2>
          <p className="text-sm text-gray-500 mt-1">{categories.length} categories</p>
        </div>
        <div className="flex items-center gap-3">
          <RefreshButton
            onRefresh={() => fetchCategories(true)}
            isLoading={refreshing}
            size="md"
            variant="default"
          />
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-purple-500/25 transition-all"
          >
            <Plus size={16} />
            Add Category
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div key={category.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all">
            <div className="relative h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="text-white font-semibold text-lg">{category.name}</h3>
                <p className="text-white/70 text-xs">{category.productCount} products</p>
              </div>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-500 line-clamp-2 mb-3">{category.description}</p>
              {category.children && category.children.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-400 mb-2">Subcategories:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {category.children.map((child) => (
                      <Badge key={child.id} variant="purple" size="sm">
                        {child.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <Badge variant={category.status === 'active' ? 'success' : 'default'} dot>
                  {category.status}
                </Badge>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-1.5 rounded-lg hover:bg-purple-50 text-gray-400 hover:text-purple-600 transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                    onClick={() => handleDelete(category)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h2>
              <button onClick={() => { setShowModal(false); setEditingCategory(null); }} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300"
                  placeholder="e.g., Hair Care"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 resize-none"
                  placeholder="Category description..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category Image</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-purple-300 transition-colors cursor-pointer">
                  <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Click to upload image</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3">
              <button onClick={() => { setShowModal(false); setEditingCategory(null); }} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl hover:shadow-lg transition-all">
                {editingCategory ? 'Save Changes' : 'Create Category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
