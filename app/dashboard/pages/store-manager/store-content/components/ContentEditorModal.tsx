// app/dashboard/pages/store-manager/store-content/components/ContentEditorModal.tsx

'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { ContentPage } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  page: ContentPage | null;
  onSave: (page: ContentPage) => void;
}

export default function ContentEditorModal({ isOpen, onClose, page, onSave }: Props) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft');
  const [pageWidth, setPageWidth] = useState(768);
  const [pageHeight, setPageHeight] = useState(600);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (page) {
      setName(page.name);
      setSlug(page.slug);
      setContent(page.content);
      setStatus(page.status);
      setPageWidth(page.pageWidth || 768);
      setPageHeight(page.pageHeight || 600);
    } else {
      setName('');
      setSlug('');
      setContent('');
      setStatus('draft');
      setPageWidth(768);
      setPageHeight(600);
    }
    setError(null);
  }, [page, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Page name is required.');
      return;
    }
    if (!content.trim()) {
      setError('Page content is required.');
      return;
    }

    const slugValue = slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    onSave({
      id: page?.id || '',
      name: name.trim(),
      slug: slugValue,
      content: content.trim(),
      status,
      pageWidth: pageWidth || 768,
      pageHeight: pageHeight || 600,
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            {page ? 'Edit Page' : 'Add New Page'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Page Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Page Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!page?.slug) {
                  const slug = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                  setSlug(slug);
                }
              }}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              placeholder="e.g., About Us"
              required
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Slug (URL) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              placeholder="about-us"
              required
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors font-mono"
              placeholder="Write your page content here. Supports HTML tags."
              required
            />
            <p className="mt-1 text-xs text-gray-400">
              HTML supported: <code>&lt;h1&gt;</code>, <code>&lt;p&gt;</code>, <code>&lt;ul&gt;</code>, <code>&lt;strong&gt;</code>, etc.
            </p>
          </div>

          {/* Page Size */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Page Width (px)
              </label>
              <input
                type="number"
                value={pageWidth}
                onChange={(e) => setPageWidth(Number(e.target.value))}
                min={200}
                max={1400}
                step={20}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Page Height (px)
              </label>
              <input
                type="number"
                value={pageHeight}
                onChange={(e) => setPageHeight(Number(e.target.value))}
                min={200}
                max={1200}
                step={20}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'draft' | 'published' | 'archived')}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-start gap-2">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl hover:shadow-lg transition-all"
            >
              {page ? 'Update Page' : 'Create Page'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}