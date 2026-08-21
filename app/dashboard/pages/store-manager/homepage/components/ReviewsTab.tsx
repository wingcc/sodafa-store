// app/dashboard/pages/store-manager/homepage/components/ReviewsTab.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Star,
  Quote,
  Save,
  CheckCircle2,
  Clock,
  Pencil,
  X,
  Eye,
  EyeOff,
  MapPin,
} from 'lucide-react';
import RefreshButton from '@/app/dashboard/components/ui/RefreshButton';
import { useToast } from '@/lib/toast';
import { StarRating } from '@/app/sections/common/icons';
import {
  fetchCollection,
  createCollectionItem,
  updateCollectionItem,
  deleteCollectionItem,
} from '../services/homepageContentService';
import { Testimonial } from '../types';
import { FormField, TextInput, TextArea } from './FormField';

function InteractiveStars({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="transition-transform hover:scale-110"
          aria-label={`${star} stars`}
        >
          <Star
            size={24}
            className={star <= value ? 'text-[#cda552] fill-[#cda552]' : 'text-gray-300'}
          />
        </button>
      ))}
      <span className="text-sm font-bold text-gray-700 mr-2">{value}.0</span>
    </div>
  );
}

export default function ReviewsTab() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [modalSaving, setModalSaving] = useState(false);
  const { addToast } = useToast();

  const loadTestimonials = async () => {
    setLoading(true);
    try {
      const data = await fetchCollection<Testimonial>('testimonials');
      setTestimonials(data);
    } catch (error) {
      console.error('Load error:', error);
      addToast('error', 'Failed to load testimonials.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    fetchCollection<Testimonial>('testimonials')
      .then((data) => {
        if (!cancelled) setTestimonials(data);
      })
      .catch((error) => {
        console.error('Load error:', error);
        if (!cancelled) addToast('error', 'Failed to load testimonials.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateLocal = (id: string, patch: Partial<Testimonial>) =>
    setTestimonials((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const handleSave = async (t: Testimonial) => {
    setSavingIds((prev) => new Set(prev).add(t.id));
    try {
      await updateCollectionItem('testimonials', t.id, {
        name: t.name,
        city: t.city,
        initials: t.initials,
        rating: t.rating,
        comment: t.comment,
        is_approved: t.is_approved,
        sort_order: t.sort_order,
      });
      addToast('success', `Review by "${t.name || 'customer'}" saved.`);
    } catch (error) {
      console.error('Save error:', error);
      addToast('error', 'Failed to save review.');
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(t.id);
        return next;
      });
    }
  };

  const handleVisibilityToggle = async (t: Testimonial) => {
    const next = !t.is_approved;
    updateLocal(t.id, { is_approved: next });
    try {
      await updateCollectionItem('testimonials', t.id, { is_approved: next });
    } catch (error) {
      console.error('Visibility toggle error:', error);
      addToast('error', 'Failed to update visibility.');
      loadTestimonials();
    }
  };

  const openEdit = (t: Testimonial) => {
    setEditing({ ...t });
    setIsNew(false);
  };

  const openCreate = () => {
    const maxOrder = testimonials.reduce((max, t) => Math.max(max, t.sort_order), -1);
    setEditing({
      id: '',
      name: '',
      city: '',
      initials: '',
      rating: 5,
      comment: '',
      is_approved: false,
      sort_order: maxOrder + 1,
    });
    setIsNew(true);
  };

  const handleModalSave = async () => {
    if (!editing) return;
    setModalSaving(true);
    try {
      const payload = {
        name: editing.name,
        city: editing.city,
        initials: editing.initials,
        rating: editing.rating,
        comment: editing.comment,
        is_approved: editing.is_approved,
        sort_order: editing.sort_order,
      };
      if (isNew) {
        const created = await createCollectionItem<Testimonial>('testimonials', payload);
        setTestimonials((prev) => [...prev, created]);
        addToast('success', 'Review created.');
      } else {
        await updateCollectionItem('testimonials', editing.id, payload);
        updateLocal(editing.id, payload);
        addToast('success', `Review by "${editing.name || 'customer'}" saved.`);
      }
      setEditing(null);
    } catch (error) {
      console.error('Modal save error:', error);
      addToast('error', 'Failed to save review.');
    } finally {
      setModalSaving(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Delete this review permanently?')) return;
    try {
      await deleteCollectionItem('testimonials', id);
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
      addToast('success', 'Review deleted.');
    } catch (error) {
      console.error('Delete error:', error);
      addToast('error', 'Failed to delete review.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#cda552] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const approvedCount = testimonials.filter((t) => t.is_approved).length;
  const pendingCount = testimonials.length - approvedCount;
  const avgRating =
    testimonials.length > 0
      ? (testimonials.reduce((sum, t) => sum + Number(t.rating), 0) / testimonials.length).toFixed(1)
      : '—';

  const stats = [
    { label: 'Total Reviews', value: String(testimonials.length), icon: Quote, color: 'text-purple-600 bg-purple-50' },
    { label: 'Available', value: String(approvedCount), icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Hidden', value: String(pendingCount), icon: Clock, color: 'text-amber-600 bg-amber-50' },
    { label: 'Avg. Rating', value: avgRating, icon: Star, color: 'text-pink-600 bg-pink-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                <Icon size={16} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-sm text-gray-500">
          Cards mirror the live homepage design — edit opens a popup
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Plus size={14} />
            Add Review
          </button>
          <RefreshButton onRefresh={loadTestimonials} size="md" variant="default" />
        </div>
      </div>

      {testimonials.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-500">
          No reviews yet. Click &quot;Add Review&quot; to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className={`relative bg-white rounded-[22px] border p-7 pt-8 shadow-[0_10px_30px_-24px_rgba(17,64,47,.45)] transition-all hover:-translate-y-1 ${
                t.is_approved ? 'border-gray-100' : 'border-dashed border-amber-300 opacity-75'
              }`}
            >
              <span className="absolute top-2 left-5 text-6xl leading-none text-emerald-900/10 select-none pointer-events-none">
                &rdquo;
              </span>

              {/* Stars — horizontal row, first star on the right */}
              <div className="text-[#cda552] mb-3">
                <StarRating rating={Number(t.rating)} size={15} id={`dash-${t.id}`} />
              </div>

              <p className="text-gray-500 text-sm font-medium leading-relaxed min-h-[60px]">
                {t.comment || '—'}
              </p>

              <div className="flex items-center gap-3 mt-5 pt-4 border-t border-dashed border-gray-200">
                <span className="flex-none w-11 h-11 rounded-full bg-gradient-to-br from-emerald-800 to-emerald-950 text-amber-100 grid place-items-center font-bold text-lg shadow-md">
                  {t.initials || '?'}
                </span>
                <div className="min-w-0">
                  <span className="block font-extrabold text-emerald-950 text-sm truncate">
                    {t.name || 'Unnamed customer'}
                  </span>
                  {t.city && (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                      <MapPin size={12} className="text-[#cda552]" />
                      {t.city}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-2 mt-5 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => handleVisibilityToggle(t)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    t.is_approved
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                  title={t.is_approved ? 'Visible on homepage' : 'Hidden from homepage'}
                >
                  {t.is_approved ? <Eye size={13} /> : <EyeOff size={13} />}
                  {t.is_approved ? 'Available' : 'Hidden'}
                </button>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEdit(t)}
                    className="p-2 rounded-lg hover:bg-emerald-50 text-gray-400 hover:text-emerald-700 transition-colors"
                    title="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(t.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSave(t)}
                    disabled={savingIds.has(t.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-xs font-medium hover:shadow-md transition-all disabled:opacity-60"
                    title="Save changes made here"
                  >
                    <Save size={12} className={savingIds.has(t.id) ? 'animate-spin' : ''} />
                    Save
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Create popup */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm"
            onClick={() => setEditing(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                {isNew ? 'Add Review' : 'Edit Review'}
              </h3>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField label="Customer Name">
                <TextInput
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  placeholder="e.g., سعاد م."
                />
              </FormField>
              <FormField label="City">
                <TextInput
                  value={editing.city}
                  onChange={(e) => setEditing({ ...editing, city: e.target.value })}
                  placeholder="e.g., الدار البيضاء"
                />
              </FormField>
              <FormField label="Initial" hint="Shown in the avatar circle">
                <TextInput
                  value={editing.initials}
                  maxLength={2}
                  onChange={(e) => setEditing({ ...editing, initials: e.target.value })}
                  placeholder="e.g., س"
                />
              </FormField>
            </div>

            <FormField label="Rating">
              <InteractiveStars
                value={Number(editing.rating)}
                onChange={(v) => setEditing({ ...editing, rating: v })}
              />
            </FormField>

            <FormField label="Comment">
              <TextArea
                rows={4}
                value={editing.comment}
                onChange={(e) => setEditing({ ...editing, comment: e.target.value })}
                placeholder="What did the customer say?"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Sort Order">
                <TextInput
                  type="number"
                  value={editing.sort_order}
                  onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })}
                />
              </FormField>
              <FormField label="Availability">
                <button
                  type="button"
                  onClick={() => setEditing({ ...editing, is_approved: !editing.is_approved })}
                  className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    editing.is_approved
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {editing.is_approved ? <Eye size={14} /> : <EyeOff size={14} />}
                  {editing.is_approved ? 'Available' : 'Hidden'}
                </button>
              </FormField>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleModalSave}
                disabled={modalSaving}
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-sm font-medium hover:shadow-md transition-all disabled:opacity-60"
              >
                <Save size={14} className={modalSaving ? 'animate-spin' : ''} />
                {isNew ? 'Create' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
