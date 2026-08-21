// app/dashboard/pages/store-manager/homepage/components/SectionEditorModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { HomepageSection } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  section: HomepageSection | null;
  onSave: (section: HomepageSection) => void;
  existingIds?: string[]; // Add this prop
}

// Predefined sections that match the public homepage components
const PREDEFINED_SECTIONS = [
  { id: 'hero', name: 'البطل الرئيسي', description: 'Main hero section with promotional content' },
  { id: 'stats', name: 'الإحصائيات', description: 'Animated statistics counters' },
  { id: 'trust', name: 'الثقة', description: 'Trust badges showing payment and delivery options' },
  { id: 'flash', name: 'العروض السريعة', description: 'Flash sale products countdown' },
  { id: 'oils', name: 'الزيوت', description: 'Natural oils showcase' },
  { id: 'benefits', name: 'المميزات', description: 'Serum benefits and features grid' },
  { id: 'video', name: 'الفيديو', description: 'Promotional video section' },
  { id: 'cases', name: 'قبل وبعد', description: 'Before and after results gallery' },
  { id: 'about', name: 'من نحن', description: 'About the store and founder' },
  { id: 'products', name: 'المنتجات', description: 'Featured products grid' },
  { id: 'reviews', name: 'التقييمات', description: 'Customer reviews and testimonials' },
  { id: 'faq', name: 'الأسئلة الشائعة', description: 'Frequently asked questions accordion' },
  { id: 'order', name: 'طريقة الطلب', description: 'How to order steps' },
  { id: 'cta', name: 'دعوة للعمل', description: 'Call to action banner' },
  { id: 'store', name: 'المتجر', description: 'Store location and map' },
  { id: 'footer', name: 'التذييل', description: 'Page footer' },
];

export default function SectionEditorModal({ isOpen, onClose, section, onSave, existingIds = [] }: Props) {
  const [selectedId, setSelectedId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens or section changes
  useEffect(() => {
    if (section) {
      setSelectedId(section.id);
      setName(section.name);
      setDescription(section.description);
      setStatus(section.status);
      setError(null);
    } else {
      setSelectedId('');
      setName('');
      setDescription('');
      setStatus('active');
      setError(null);
    }
  }, [section, isOpen]);

  // Auto-fill name/description when a predefined section is selected
  const handleSectionSelect = (id: string) => {
    setSelectedId(id);
    setError(null);
    
    if (id === '__custom') {
      // Allow custom ID, but warn
      setName('');
      setDescription('');
      return;
    }
    
    const found = PREDEFINED_SECTIONS.find((s) => s.id === id);
    if (found) {
      setName(found.name);
      setDescription(found.description);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate
    if (!selectedId.trim()) {
      setError('Section ID is required.');
      return;
    }
    if (!name.trim()) {
      setError('Section name is required.');
      return;
    }

    // Check duplicate ID (only for new sections, not when editing the same)
    const isDuplicate = existingIds.includes(selectedId.trim()) && section?.id !== selectedId.trim();
    if (isDuplicate) {
      setError(`Section ID "${selectedId.trim()}" already exists. Please choose a different ID.`);
      return;
    }

    onSave({
      id: selectedId.trim(),
      name: name.trim(),
      description: description.trim() || '',
      status,
      order: section?.order || 0,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            {section ? 'Edit Section' : 'Add New Section'}
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
          {/* Section ID Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Section Type <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedId}
              onChange={(e) => handleSectionSelect(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              required
            >
              <option value="">Select a section type…</option>
              {PREDEFINED_SECTIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.id})
                </option>
              ))}
              <option value="__custom">+ Custom (not recommended)</option>
            </select>
            {selectedId && !PREDEFINED_SECTIONS.some((s) => s.id === selectedId) && selectedId !== '__custom' && (
              <p className="mt-1 text-xs text-amber-600 flex items-center gap-1">
                <AlertCircle size={12} /> Custom ID – ensure the component exists in the homepage.
              </p>
            )}
          </div>

          {/* Name (auto-filled) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Display Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              placeholder="e.g., Hero Banner"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              placeholder="Brief description for admin reference"
            />
          </div>

          {/* Status Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Status
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStatus('active')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  status === 'active'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => setStatus('inactive')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  status === 'inactive'
                    ? 'bg-gray-400 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Inactive
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {status === 'active'
                ? 'Section will appear on the homepage.'
                : 'Section will be hidden from the homepage.'}
            </p>
          </div>

          {/* Error message */}
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
              {section ? 'Update Section' : 'Create Section'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}