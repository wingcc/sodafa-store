// app/dashboard/pages/products/ProductModal.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Save, Trash2, Upload, Link as LinkIcon, GripVertical, Star, Loader2 } from 'lucide-react';
import { useToast } from '@/lib/toast';
import { ProductTabs } from '@/app/dashboard/components/products/Tabs';
import { TagInput } from '@/app/dashboard/components/products/TagInput';

type ProductStatus = 'draft' | 'active' | 'inactive';
type TabId = 'general' | 'pricing' | 'media' | 'seo' | 'more-info' | 'advanced';

interface ProductMoreInfoForm {
  ingredients: string[];
  ingredientsFull: string;
  benefits: string[];
  howToUse: string;
  shoppingInfo: string;
}

interface ProductFormData {
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  sku: string;
  brand: string;
  categoryId: string;
  subcategory: string;
  tags: string[];
  regularPrice: number;
  salePrice: number;
  costPrice: number;
  currency: string;
  stock: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  ads: boolean;
  showInStore: boolean;
  isOffer: boolean;
  offerTime: string;
  images: string[];
  status: ProductStatus;
  featured: boolean;
  seoTitle: string;
  seoDescription: string;
  seoSlug: string;
  seoKeywords: string[];
  moreInfo: ProductMoreInfoForm;
}

interface Category {
  id: string;
  name: string;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
  productId?: string;
  onSaved: () => void;
}

const emptyForm: ProductFormData = {
  name: '',
  slug: '',
  shortDescription: '',
  fullDescription: '',
  sku: '',
  brand: '',
  categoryId: '',
  subcategory: '',
  tags: [],
  regularPrice: 0,
  salePrice: 0,
  costPrice: 0,
  currency: 'MAD',
  stock: 0,
  lowStockThreshold: 10,
  trackInventory: true,
  ads: false,
  showInStore: true,
  isOffer: false,
  offerTime: '',
  images: [],
  status: 'draft',
  featured: false,
  seoTitle: '',
  seoDescription: '',
  seoSlug: '',
  seoKeywords: [],
  moreInfo: {
    ingredients: [],
    ingredientsFull: '',
    benefits: [],
    howToUse: '',
    shoppingInfo: '',
  },
};

export function ProductModal({ isOpen, onClose, mode, productId, onSaved }: ProductModalProps) {
  const { addToast } = useToast();
  const [form, setForm] = useState<ProductFormData>(emptyForm);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState('');

  const nameInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch categories
  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/categories')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setCategories(json.data);
        }
      })
      .catch(() => {
        // Silently fail - categories are optional
      });
  }, [isOpen]);

  // Fetch product for edit mode
  useEffect(() => {
    if (!isOpen || mode !== 'edit' || !productId) return;
    let cancelled = false;
    setIsLoading(true);
    fetch(`/api/products/${productId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          const p = json.data;
          setForm({
            name: String(p.name ?? ''),
            slug: String(p.slug ?? ''),
            shortDescription: String(p.short_description ?? ''),
            fullDescription: String(p.full_description ?? ''),
            sku: String(p.sku ?? ''),
            brand: String(p.brand ?? ''),
            categoryId: String(p.category_id ?? ''),
            subcategory: String(p.subcategory ?? ''),
            tags: Array.isArray(p.tags) ? p.tags : [],
            regularPrice: Number(p.regular_price ?? 0),
            salePrice: Number(p.sale_price ?? 0),
            costPrice: Number(p.cost_price ?? 0),
            currency: String(p.currency ?? 'MAD'),
            stock: Number(p.stock ?? 0),
            lowStockThreshold: Number(p.low_stock_threshold ?? 10),
            trackInventory: Boolean(p.track_inventory ?? true),
            ads: Boolean(p.ADS ?? p.ads ?? false),
            showInStore: Boolean(p.ShowInStor ?? p.showInStore ?? false),
            isOffer: Boolean(p.IsOffer ?? p.isOffer ?? false),
            offerTime: p.OfferTime ? String(p.OfferTime).slice(0, 16) : p.offerTime ? String(p.offerTime).slice(0, 16) : '',
            images: Array.isArray(p.images)
              ? p.images
                  .map((img: unknown) => {
                    if (typeof img === 'string') return img;
                    if (img && typeof img === 'object' && 'src' in img) return String((img as { src: unknown }).src ?? '');
                    return '';
                  })
                  .filter(Boolean)
              : [],
            status: String(p.status ?? 'draft') as ProductStatus,
            featured: Boolean(p.featured ?? false),
            seoTitle: String(p.seo_title ?? ''),
            seoDescription: String(p.seo_description ?? ''),
            seoSlug: String(p.seo_slug ?? ''),
            seoKeywords: Array.isArray(p.seo_keywords) ? p.seo_keywords : [],
            moreInfo: {
              ingredients: Array.isArray(p.more_info?.ingredients) ? p.more_info.ingredients.filter((item: unknown) => typeof item === 'string') : [],
              ingredientsFull: typeof p.more_info?.ingredientsFull === 'string' ? p.more_info.ingredientsFull : '',
              benefits: Array.isArray(p.more_info?.benefits) ? p.more_info.benefits.filter((item: unknown) => typeof item === 'string') : [],
              howToUse: typeof p.more_info?.howToUse === 'string' ? p.more_info.howToUse : '',
              shoppingInfo: typeof p.more_info?.shoppingInfo === 'string' ? p.more_info.shoppingInfo : '',
            },
          });
        } else {
          addToast('error', 'Failed to load product.', { title: 'Error' });
          onClose();
        }
      })
      .catch(() => {
        addToast('error', 'Failed to load product.', { title: 'Error' });
        onClose();
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, mode, productId, onClose, addToast]);

  // Reset form when opening add mode
  useEffect(() => {
    if (isOpen && mode === 'add') {
      setForm(emptyForm);
    }
  }, [isOpen, mode]);

  // Update a single field
  const updateField = useCallback(<K extends keyof ProductFormData>(field: K, value: ProductFormData[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    updateField('name', name);
    if (!form.slug || form.slug === form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      updateField('slug', slug);
    }
  };

  // Tags
  const handleAddTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !form.tags.includes(trimmed)) {
      updateField('tags', [...form.tags, trimmed]);
    }
  };

  const handleRemoveTag = (tag: string) => {
    updateField('tags', form.tags.filter((t) => t !== tag));
  };

  // Images
  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);
    const readers = fileArray.map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
    });
    Promise.all(readers).then((urls) => {
      updateField('images', [...form.images, ...urls]);
    });
  };

  const handleImageUrlAdd = () => {
    const url = imageUrlInput.trim();
    if (url && !form.images.includes(url)) {
      // Basic URL validation
      try {
        new URL(url);
        updateField('images', [...form.images, url]);
        setImageUrlInput('');
      } catch {
        addToast('error', 'Please enter a valid image URL.', { title: 'Invalid URL' });
      }
    }
  };

  const removeImage = (index: number) => {
    updateField('images', form.images.filter((_, i) => i !== index));
  };

  const setPrimaryImage = (index: number) => {
    const images = [...form.images];
    const primary = images.splice(index, 1)[0];
    images.unshift(primary);
    updateField('images', images);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) return;
    const images = [...form.images];
    const [dragged] = images.splice(dragIndex, 1);
    images.splice(dropIndex, 0, dragged);
    updateField('images', images);
    setDragIndex(null);
  };

  // Save
  const handleSave = async () => {
    // Validation
    if (!form.name.trim()) {
      addToast('error', 'Product name is required.', { title: 'Validation Error' });
      nameInputRef.current?.focus();
      return;
    }
    if (!form.regularPrice || form.regularPrice <= 0) {
      addToast('error', 'Regular price must be greater than 0.', { title: 'Validation Error' });
      return;
    }

    setIsSaving(true);
    try {
      // Map form to API payload
      const payload: Record<string, unknown> = {
        name: form.name,
        slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        shortDescription: form.shortDescription,
        fullDescription: form.fullDescription,
        sku: form.sku || `SKU-${Date.now()}`,
        brand: form.brand || 'SODFA',
        categoryId: form.categoryId || null,
        subcategory: form.subcategory || null,
        tags: form.tags,
        regularPrice: form.regularPrice,
        salePrice: form.salePrice || null,
        costPrice: form.costPrice || 0,
        currency: form.currency || 'MAD',
        stock: form.stock,
        lowStockThreshold: form.lowStockThreshold,
        trackInventory: form.trackInventory,
        ADS: form.ads,
        ShowInStor: form.showInStore,
        IsOffer: form.isOffer,
        OfferTime: form.offerTime || null,
        images: form.images,
        status: form.status,
        featured: form.featured,
        seoTitle: form.seoTitle || null,
        seoDescription: form.seoDescription || null,
        seoSlug: form.seoSlug || null,
        seoKeywords: form.seoKeywords,
        moreInfo: {
          ingredients: form.moreInfo.ingredients,
          ingredientsFull: form.moreInfo.ingredientsFull,
          benefits: form.moreInfo.benefits,
          howToUse: form.moreInfo.howToUse,
          shoppingInfo: form.moreInfo.shoppingInfo,
        },
      };

      const url = mode === 'edit' && productId ? `/api/products/${productId}` : '/api/products';
      const method = mode === 'edit' ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error?.message || 'Failed to save product');
      }

      addToast('success', mode === 'edit' ? 'Product updated successfully.' : 'Product created successfully.', {
        title: mode === 'edit' ? 'Updated' : 'Created',
      });
      onSaved();
      onClose();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to save product.';
      addToast('error', message, { title: 'Error' });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!productId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error?.message || 'Failed to delete product');
      }
      addToast('success', 'Product deleted successfully.', { title: 'Deleted' });
      onSaved();
      onClose();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete product.';
      addToast('error', message, { title: 'Error' });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!isOpen) return null;

  const isEdit = mode === 'edit';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-white border border-gray-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isEdit ? 'Edit Product' : 'Add Product'}
            </h2>
            <p className="text-sm text-gray-500">
              {isEdit ? 'Update product information and settings' : 'Create a new product'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--color-darkGreen)]" />
          </div>
        ) : (
          <>
            {/* Tabs */}
            <ProductTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                  {/* General Tab */}
                  {activeTab === 'general' && (
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            ref={nameInputRef}
                            type="text"
                            value={form.name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-darkGreen)] focus:border-transparent bg-white text-gray-900"
                            placeholder="Product name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Slug <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={form.slug}
                            onChange={(e) => updateField('slug', e.target.value)}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-darkGreen)] focus:border-transparent bg-white text-gray-900"
                            placeholder="product-slug"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">SKU</label>
                          <input
                            type="text"
                            value={form.sku}
                            onChange={(e) => updateField('sku', e.target.value)}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-darkGreen)] focus:border-transparent bg-white text-gray-900"
                            placeholder="SKU-001"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Brand</label>
                          <input
                            type="text"
                            value={form.brand}
                            onChange={(e) => updateField('brand', e.target.value)}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-darkGreen)] focus:border-transparent bg-white text-gray-900"
                            placeholder="Brand name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Category</label>
                          <select
                            value={form.categoryId}
                            onChange={(e) => updateField('categoryId', e.target.value)}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-darkGreen)] focus:border-transparent bg-white text-gray-900"
                          >
                            <option value="">Select category</option>
                            {categories.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Subcategory</label>
                          <input
                            type="text"
                            value={form.subcategory}
                            onChange={(e) => updateField('subcategory', e.target.value)}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-darkGreen)] focus:border-transparent bg-white text-gray-900"
                            placeholder="Subcategory"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Short Description</label>
                        <input
                          type="text"
                          value={form.shortDescription}
                          onChange={(e) => updateField('shortDescription', e.target.value)}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-darkGreen)] focus:border-transparent bg-white text-gray-900"
                          placeholder="Brief description"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Full Description</label>
                        <textarea
                          value={form.fullDescription}
                          onChange={(e) => updateField('fullDescription', e.target.value)}
                          rows={4}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-darkGreen)] focus:border-transparent bg-white text-gray-900 resize-none"
                          placeholder="Detailed product description..."
                        />
                      </div>

                      {/* Tags */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Tags</label>
                        <div className="mt-1">
                          <TagInput
                            tags={form.tags}
                            onChange={(tags) => updateField('tags', tags)}
                            placeholder="Type tag and press Enter"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pricing & Inventory Tab */}
                  {activeTab === 'pricing' && (
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Regular Price <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={form.regularPrice}
                            onChange={(e) => updateField('regularPrice', parseFloat(e.target.value) || 0)}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-darkGreen)] focus:border-transparent bg-white text-gray-900"
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Sale Price</label>
                          <input
                            type="number"
                            step="0.01"
                            value={form.salePrice}
                            onChange={(e) => updateField('salePrice', parseFloat(e.target.value) || 0)}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-darkGreen)] focus:border-transparent bg-white text-gray-900"
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Cost Price</label>
                          <input
                            type="number"
                            step="0.01"
                            value={form.costPrice}
                            onChange={(e) => updateField('costPrice', parseFloat(e.target.value) || 0)}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-darkGreen)] focus:border-transparent bg-white text-gray-900"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Currency</label>
                        <select
                          value={form.currency}
                          onChange={(e) => updateField('currency', e.target.value)}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-darkGreen)] focus:border-transparent bg-white text-gray-900"
                        >
                          <option value="MAD">MAD (Moroccan Dirham)</option>
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Stock <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            value={form.stock}
                            onChange={(e) => updateField('stock', parseInt(e.target.value) || 0)}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-darkGreen)] focus:border-transparent bg-white text-gray-900"
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Low Stock Threshold</label>
                          <input
                            type="number"
                            value={form.lowStockThreshold}
                            onChange={(e) => updateField('lowStockThreshold', parseInt(e.target.value) || 0)}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-darkGreen)] focus:border-transparent bg-white text-gray-900"
                            placeholder="10"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Track Inventory</span>
                        <button
                          type="button"
                          onClick={() => updateField('trackInventory', !form.trackInventory)}
                          className={`w-11 h-6 rounded-full transition-colors ${
                            form.trackInventory ? 'bg-[var(--color-darkGreen)]' : 'bg-gray-300'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                              form.trackInventory ? 'translate-x-5' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Media Tab */}
                  {activeTab === 'media' && (
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Upload Images
                        </label>
                        <div
                          className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[var(--color-darkGreen)]/40 transition-colors"
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            handleFileUpload(e.dataTransfer.files);
                          }}
                        >
                          <input
                            type="file"
                            ref={fileInputRef}
                            multiple
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => {
                              handleFileUpload(e.target.files);
                              e.currentTarget.value = '';
                            }}
                          />
                          <Upload className="w-8 h-8 mx-auto text-gray-400" />
                          <p className="mt-2 text-sm text-gray-500">
                            Drag & drop images here, or click to browse
                          </p>
                          <div className="mt-2 flex justify-center">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="px-3 py-1 text-xs bg-[var(--color-darkGreen)] text-white rounded-md hover:bg-[var(--color-darkGreen)]/90 transition-colors"
                            >
                              Upload Images
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Add Image URL - dedicated section below upload */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Add Image URL
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="url"
                            value={imageUrlInput}
                            onChange={(e) => setImageUrlInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleImageUrlAdd()}
                            placeholder="https://example.com/image.jpg"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                          />
                          <button
                            type="button"
                            onClick={handleImageUrlAdd}
                            className="px-3 py-2 bg-[var(--color-darkGreen)] text-white rounded-lg hover:bg-[var(--color-darkGreen)]/90 transition-colors"
                          >
                            Add URL
                          </button>
                        </div>

                        {/* URL list with edit/delete */}
                        {form.images.some((img) => /^https?:\/\//i.test(img)) && (
                          <div className="mt-3 space-y-2">
                            {form.images
                              .map((url, idx) => ({ url, idx }))
                              .filter(({ url }) => /^https?:\/\//i.test(url))
                              .map(({ url, idx }) => (
                                <div key={`${url}-${idx}`} className="flex items-center gap-2">
                                  <img
                                    src={url}
                                    alt=""
                                    className="w-10 h-10 rounded object-cover border border-gray-200"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = '/placeholder-image.png';
                                    }}
                                  />
                                  <input
                                    type="text"
                                    value={url}
                                    onChange={(e) => {
                                      const newImages = [...form.images];
                                      newImages[idx] = e.target.value;
                                      updateField('images', newImages);
                                    }}
                                    className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded bg-white text-gray-900"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeImage(idx)}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                    title="Remove URL"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>

                      {/* Image gallery */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Gallery
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {form.images.map((url, index) => (
                            <div
                              key={`${url}-${index}`}
                              draggable
                              onDragStart={(e) => handleDragStart(e, index)}
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, index)}
                              className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100"
                            >
                              <img
                                src={url}
                                alt={`Product ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/placeholder-image.png';
                                }}
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                {index === 0 && (
                                  <span className="px-2 py-0.5 bg-[var(--color-darkGreen)] text-white text-xs rounded">Primary</span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setPrimaryImage(index)}
                                  className="p-1 bg-white rounded-full hover:bg-gray-100 transition-colors"
                                  title="Set as primary"
                                >
                                  <Star className="w-4 h-4 text-yellow-500" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="p-1 bg-white rounded-full hover:bg-red-100 transition-colors"
                                  title="Remove"
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </button>
                              </div>
                              <div className="absolute top-1 left-1 cursor-grab">
                                <GripVertical className="w-4 h-4 text-white drop-shadow" />
                              </div>
                              {index === 0 && (
                                <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-[var(--color-darkGreen)] text-white text-[10px] rounded">Primary</div>
                              )}
                            </div>
                          ))}
                          {form.images.length === 0 && (
                            <div className="col-span-full text-center text-gray-400 py-4">
                              No images yet. Upload or add URLs above.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SEO Tab */}
                  {activeTab === 'seo' && (
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">SEO Title</label>
                        <input
                          type="text"
                          value={form.seoTitle}
                          onChange={(e) => updateField('seoTitle', e.target.value)}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-darkGreen)] focus:border-transparent bg-white text-gray-900"
                          placeholder="SEO title"
                        />
                        <div className="mt-1 text-xs text-gray-500">
                          {form.seoTitle.length} / 60 characters
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">SEO Description</label>
                        <textarea
                          value={form.seoDescription}
                          onChange={(e) => updateField('seoDescription', e.target.value)}
                          rows={2}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-darkGreen)] focus:border-transparent bg-white text-gray-900 resize-none"
                          placeholder="SEO description"
                        />
                        <div className="mt-1 text-xs text-gray-500">
                          {form.seoDescription.length} / 160 characters
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">SEO Slug</label>
                        <input
                          type="text"
                          value={form.seoSlug}
                          onChange={(e) => updateField('seoSlug', e.target.value)}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-darkGreen)] focus:border-transparent bg-white text-gray-900"
                          placeholder="seo-slug"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">SEO Keywords</label>
                        <input
                          type="text"
                          value={form.seoKeywords.join(', ')}
                          onChange={(e) => updateField('seoKeywords', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-darkGreen)] focus:border-transparent bg-white text-gray-900"
                          placeholder="keyword1, keyword2, keyword3"
                        />
                      </div>
                      {/* Google Preview */}
                      <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <p className="text-xs text-gray-500">Google Search Preview</p>
                        <div className="mt-2">
                          <p className="text-blue-600 text-lg font-medium truncate">
                            {form.seoTitle || form.name || 'Product Name'}
                          </p>
                          <p className="text-sm text-green-700 truncate">
                            {form.seoSlug || form.slug || 'example.com/product'}
                          </p>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {form.seoDescription || form.shortDescription || 'Product description'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* More info Tab — Beautiful JSON-driven extra details */}
                  {activeTab === 'more-info' && (
                    <div className="space-y-6">
                      {/* Header */}
                      <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white grid place-items-center shadow-md shrink-0">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-emerald-900">Extra Details (JSON)</h4>
                            <p className="text-xs text-emerald-700/70 mt-1 leading-relaxed">These fields power the product tabs: <b>Benefits</b> → Key Benefits, <b>Ingredients</b> → Ingredients, <b>How to Use</b> → About, <b>Shopping Info</b> → Shipping. Stored as <code className="px-1 py-0.5 bg-white border border-emerald-100 rounded text-[10px] font-mono">more_info JSONB</code> in DB. Leave empty to use graceful fallbacks.</p>
                          </div>
                          <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-white border border-emerald-100 rounded-full px-2.5 py-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live
                          </div>
                        </div>
                      </div>

                      {/* Benefits */}
                      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-800">
                          <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 grid place-items-center">★</span>
                          Benefits
                          <span className="ml-auto text-[11px] font-medium text-gray-400">{form.moreInfo.benefits.length} items</span>
                        </label>
                        <p className="text-xs text-gray-500 mt-1">One benefit per line — shown as check list in “Key Benefits”.</p>
                        <textarea
                          value={form.moreInfo.benefits.join('\n')}
                          onChange={(e) => updateField('moreInfo', {
                            ...form.moreInfo,
                            benefits: e.target.value.split('\n').map((item) => item.trim()).filter(Boolean),
                          })}
                          rows={4}
                          className="mt-2 w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-stone-50/50 focus:bg-white text-gray-900 resize-none text-sm leading-6"
                          placeholder={"100% Natural\nDeeply nourishes & hydrates\nParaben & Sulfate Free"}
                        />
                      </div>

                      {/* Ingredients */}
                      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-800">
                          <span className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 grid place-items-center">◍</span>
                          Ingredients
                          <span className="ml-auto text-[11px] font-medium text-gray-400">{form.moreInfo.ingredients.length} items</span>
                        </label>
                        <p className="text-xs text-gray-500 mt-1">One ingredient per line — grid in “Ingredients” tab.</p>
                        <textarea
                          value={form.moreInfo.ingredients.join('\n')}
                          onChange={(e) => updateField('moreInfo', {
                            ...form.moreInfo,
                            ingredients: e.target.value.split('\n').map((item) => item.trim()).filter(Boolean),
                          })}
                          rows={4}
                          className="mt-2 w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-stone-50/50 focus:bg-white text-gray-900 resize-none text-sm leading-6"
                          placeholder={"Argan Oil\nPrickly Pear Oil\nAloe Vera Extract\nVitamin E"}
                        />
                      </div>

                      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                        <label className="block text-sm font-bold text-gray-800">Full Ingredients</label>
                        <p className="text-xs text-gray-500 mt-1">Single paragraph — shown as “Full Ingredients List”.</p>
                        <textarea
                          value={form.moreInfo.ingredientsFull}
                          onChange={(e) => updateField('moreInfo', {
                            ...form.moreInfo,
                            ingredientsFull: e.target.value,
                          })}
                          rows={3}
                          className="mt-2 w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-stone-50/50 focus:bg-white text-gray-900 resize-none text-sm leading-6"
                          placeholder="Argania Spinosa Kernel Oil, Opuntia Ficus-Indica Seed Oil, Tocopherol, Aloe Barbadensis Leaf Extract, Sodium Hyaluronate..."
                        />
                      </div>

                      {/* How to Use */}
                      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-800">
                          <span className="w-7 h-7 rounded-lg bg-violet-100 text-violet-700 grid place-items-center">◐</span>
                          How to Use
                        </label>
                        <p className="text-xs text-gray-500 mt-1">Shown in “About This Product → How to Use”.</p>
                        <textarea
                          value={form.moreInfo.howToUse}
                          onChange={(e) => updateField('moreInfo', {
                            ...form.moreInfo,
                            howToUse: e.target.value,
                          })}
                          rows={3}
                          className="mt-2 w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-stone-50/50 focus:bg-white text-gray-900 resize-none text-sm leading-6"
                          placeholder="Apply 3-4 drops to clean, dry skin every morning before moisturizer..."
                        />
                      </div>

                      {/* Shopping / Extra */}
                      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-800">
                          <span className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 grid place-items-center">⬢</span>
                          Shopping / Extra Info
                        </label>
                        <p className="text-xs text-gray-500 mt-1">Shown in “Shipping” tab as highlighted note. Supports plain text.</p>
                        <textarea
                          value={form.moreInfo.shoppingInfo}
                          onChange={(e) => updateField('moreInfo', {
                            ...form.moreInfo,
                            shoppingInfo: e.target.value,
                          })}
                          rows={3}
                          className="mt-2 w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-stone-50/50 focus:bg-white text-gray-900 resize-none text-sm leading-6"
                          placeholder="Use as part of your daily routine. Orders ship within 24-48h in major cities. Extra care: store in cool dry place..."
                        />
                      </div>

                      {/* Raw JSON preview — beautiful */}
                      <details className="group rounded-2xl border border-gray-200 bg-stone-50 open:bg-white transition">
                        <summary className="list-none flex items-center justify-between px-4 py-3 cursor-pointer">
                          <span className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-gray-400 group-open:bg-emerald-500 transition" />
                            Raw JSON (more_info)
                          </span>
                          <span className="text-xs text-gray-400 group-open:hidden">▶</span>
                          <span className="text-xs text-gray-400 hidden group-open:inline">▼</span>
                        </summary>
                        <div className="px-4 pb-4">
                          <pre className="text-xs leading-5 p-3 rounded-xl bg-gray-900 text-emerald-50 overflow-auto border border-gray-800 max-h-[220px]">{JSON.stringify(form.moreInfo, null, 2)}</pre>
                          <p className="text-[11px] text-gray-500 mt-2">Stored as <code className="px-1 py-0.5 bg-white border rounded">JSONB</code> in <code className="px-1 py-0.5 bg-white border rounded">products.more_info</code>. Empty fields fall back to elegant defaults on storefront.</p>
                        </div>
                      </details>
                    </div>
                  )}

                  {/* Advanced Tab */}
                  {activeTab === 'advanced' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Total Sold</label>
                          <p className="mt-1 text-lg font-semibold text-gray-900">0</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Rating</label>
                          <p className="mt-1 text-lg font-semibold text-gray-900">0</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Sidebar */}
                <div className="space-y-6">
                  {/* Status & Visibility */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Status & Visibility</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500">Status</label>
                        <select
                          value={form.status}
                          onChange={(e) => updateField('status', e.target.value as ProductStatus)}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-darkGreen)] focus:border-transparent bg-white text-gray-900 text-sm"
                        >
                          <option value="draft">Draft</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Featured</span>
                        <button
                          type="button"
                          onClick={() => updateField('featured', !form.featured)}
                          className={`w-10 h-5 rounded-full transition-colors ${
                            form.featured ? 'bg-[var(--color-darkGreen)]' : 'bg-gray-300'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${
                              form.featured ? 'translate-x-5' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">ADS</span>
                        <button
                          type="button"
                          onClick={() => updateField('ads', !form.ads)}
                          className={`w-10 h-5 rounded-full transition-colors ${
                            form.ads ? 'bg-[var(--color-darkGreen)]' : 'bg-gray-300'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${
                              form.ads ? 'translate-x-5' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Show in Store</span>
                        <button
                          type="button"
                          onClick={() => updateField('showInStore', !form.showInStore)}
                          className={`w-10 h-5 rounded-full transition-colors ${
                            form.showInStore ? 'bg-[var(--color-darkGreen)]' : 'bg-gray-300'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${
                              form.showInStore ? 'translate-x-5' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Is Offer</span>
                        <button
                          type="button"
                          onClick={() => updateField('isOffer', !form.isOffer)}
                          className={`w-10 h-5 rounded-full transition-colors ${
                            form.isOffer ? 'bg-[var(--color-darkGreen)]' : 'bg-gray-300'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${
                              form.isOffer ? 'translate-x-5' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                      </div>
                      {form.isOffer && (
                        <div>
                          <label className="block text-xs font-medium text-gray-500">Offer End Time</label>
                          <input
                            type="datetime-local"
                            value={form.offerTime}
                            onChange={(e) => updateField('offerTime', e.target.value)}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-darkGreen)] focus:border-transparent bg-white text-gray-900 text-sm"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div>
                {isEdit && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Product
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--color-darkGreen)] text-white rounded-lg hover:bg-[var(--color-darkGreen)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {isEdit ? 'Update' : 'Create'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
              <h3 className="text-lg font-semibold text-gray-900">Delete Product?</h3>
              <p className="mt-2 text-sm text-gray-500">
                This action cannot be undone. This will permanently delete the product.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}