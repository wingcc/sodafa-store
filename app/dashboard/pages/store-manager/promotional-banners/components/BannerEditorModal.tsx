// app/dashboard/pages/store-manager/promotional-banners/components/BannerEditorModal.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import { X, Image as ImageIcon, Link as LinkIcon, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Banner } from "../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  banner: Banner | null;
  onSave: (banner: Banner) => void;
}

export default function BannerEditorModal({ isOpen, onClose, banner, onSave }: Props) {
  const [title, setTitle] = useState("");
  const [discount, setDiscount] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [link, setLink] = useState("");
  const [active, setActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (banner) {
      setTitle(banner.title);
      setDiscount(banner.discount);
      setImageUrl(banner.imageUrl || "");
      setLink(banner.link || "");
      setActive(banner.active);
      setImagePreview(banner.imageUrl || null);
    } else {
      setTitle("");
      setDiscount("");
      setImageUrl("");
      setLink("");
      setActive(true);
      setImagePreview(null);
    }
    setError(null);
  }, [banner, isOpen]);

  // Auto‑focus on title when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleImageUrlChange = (url: string) => {
    setImageUrl(url);
    setImagePreview(url || null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      nameInputRef.current?.focus();
      return;
    }

    onSave({
      id: banner?.id || crypto.randomUUID(),
      title: title.trim(),
      discount: discount.trim(),
      active,
      imageUrl: imageUrl.trim() || undefined,
      link: link.trim() || undefined,
      order: banner?.order || 0,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            {banner ? "Edit Banner" : "Add New Banner"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              ref={nameInputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              placeholder="e.g., Summer Sale"
              required
            />
          </div>

          {/* Discount / Tagline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Discount / Tagline
            </label>
            <input
              type="text"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              placeholder="e.g., 25% OFF or Shop Now"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Image URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => handleImageUrlChange(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                placeholder="https://example.com/banner.jpg"
              />
            </div>
            {imagePreview && (
              <div className="mt-3 relative rounded-xl overflow-hidden border border-gray-200 h-32 bg-gray-100">
                <img
                  src={imagePreview}
                  alt="Banner preview"
                  className="w-full h-full object-cover"
                  onError={() => setImagePreview(null)}
                />
                <button
                  type="button"
                  onClick={() => { setImageUrl(""); setImagePreview(null); }}
                  className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-lg hover:bg-black/80 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            {!imagePreview && (
              <div className="mt-3 rounded-xl border-2 border-dashed border-gray-200 p-6 text-center text-gray-400 text-sm">
                <ImageIcon size={24} className="mx-auto mb-2 opacity-30" />
                No image set
              </div>
            )}
          </div>

          {/* Link URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Link URL
            </label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              placeholder="https://example.com/sale"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Status
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setActive(true)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Eye size={16} />
                  Active
                </div>
              </button>
              <button
                type="button"
                onClick={() => setActive(false)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  !active
                    ? 'bg-gray-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <EyeOff size={16} />
                  Inactive
                </div>
              </button>
            </div>
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
              {banner ? "Update Banner" : "Create Banner"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}