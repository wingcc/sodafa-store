// app/dashboard/pages/store-manager/homepage/components/ContentTab.tsx
'use client';

import { useState, useEffect, ReactNode } from 'react';
import {
  Save,
  Plus,
  Trash2,
  Sparkles,
  Tag,
  Users,
  PlayCircle,
  HelpCircle,
  Zap,
  BarChart3,
  ShieldCheck,
  Droplets,
} from 'lucide-react';
import { useToast } from '@/lib/toast';
import {
  fetchContentBlock,
  saveContentBlock,
  fetchCollection,
  createCollectionItem,
  updateCollectionItem,
  deleteCollectionItem,
} from '../services/homepageContentService';
import type {
  HeroContent,
  PricingContent,
  AboutContent,
  VideoContent,
  Faq,
  Benefit,
  StatItem,
  TrustBadge,
  Oil,
} from '../types';
import { FormField, TextInput, TextArea } from './FormField';

type ContentSubTab =
  | 'hero'
  | 'pricing'
  | 'about'
  | 'video'
  | 'faq'
  | 'benefits'
  | 'stats'
  | 'trust'
  | 'oils';

const SUB_TABS: { id: ContentSubTab; label: string; icon: typeof Sparkles }[] = [
  { id: 'hero', label: 'Hero', icon: Sparkles },
  { id: 'pricing', label: 'Pricing', icon: Tag },
  { id: 'about', label: 'About', icon: Users },
  { id: 'video', label: 'Video', icon: PlayCircle },
  { id: 'faq', label: 'FAQ', icon: HelpCircle },
  { id: 'benefits', label: 'Benefits', icon: Zap },
  { id: 'stats', label: 'Stats', icon: BarChart3 },
  { id: 'trust', label: 'Trust Badges', icon: ShieldCheck },
  { id: 'oils', label: 'Oils', icon: Droplets },
];

// ---------------------------------------------------------------------------
// Shared building blocks
// ---------------------------------------------------------------------------

function BlockCard({
  title,
  saving,
  onSave,
  children,
}: {
  title: string;
  saving: boolean;
  onSave: () => void;
  children: ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all disabled:opacity-60"
        >
          <Save size={14} className={saving ? 'animate-spin' : ''} />
          Save
        </button>
      </div>
      {children}
    </div>
  );
}

function ItemCard({
  title,
  active,
  onToggleActive,
  onDelete,
  saving,
  onSave,
  children,
}: {
  title: string;
  active?: boolean;
  onToggleActive?: () => void;
  onDelete: () => void;
  saving?: boolean;
  onSave?: () => void;
  children: ReactNode;
}) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 p-6 space-y-4 ${active === false ? 'opacity-60' : ''}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-gray-900 truncate">{title || '(untitled)'}</p>
        <div className="flex items-center gap-2 flex-shrink-0">
          {onToggleActive && (
            <button
              type="button"
              onClick={onToggleActive}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors ${
                active ? 'bg-emerald-500' : 'bg-gray-300'
              }`}
              title={active ? 'Disable' : 'Enable'}
            >
              <span
                className={`inline-block h-4 w-4 mt-1 ml-1 rounded-full bg-white shadow transform transition-transform ${
                  active ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          )}
          {onSave && (
            <button
              onClick={onSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-xs font-medium hover:shadow-md transition-all disabled:opacity-60"
            >
              <Save size={12} className={saving ? 'animate-spin' : ''} />
              Save
            </button>
          )}
          <button
            onClick={onDelete}
            className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full py-3 border-2 border-dashed border-gray-200 rounded-2xl text-sm font-medium text-gray-500 hover:border-purple-300 hover:text-purple-600 transition-colors flex items-center justify-center gap-2"
    >
      <Plus size={16} />
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Singleton block editors
// ---------------------------------------------------------------------------

function HeroEditor() {
  const [content, setContent] = useState<HeroContent>({
    badge: '', h1a: '', hl: '', h1b: '', lead: '', rate: '', trustNote: '', img: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    let cancelled = false;
    fetchContentBlock<HeroContent>('hero', content)
      .then((data) => !cancelled && setContent(data))
      .catch((err) => console.error('Load hero error:', err))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (patch: Partial<HeroContent>) => setContent((prev) => ({ ...prev, ...patch }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveContentBlock('hero', content);
      addToast('success', 'Hero section saved.');
    } catch (error) {
      console.error('Save hero error:', error);
      addToast('error', 'Failed to save hero section.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#d97706] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <BlockCard title="Hero Section" saving={saving} onSave={handleSave}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Badge" hint="Small pill above the headline">
          <TextInput value={content.badge} onChange={(e) => set({ badge: e.target.value })} />
        </FormField>
        <FormField label="Rating">
          <TextInput value={content.rate} onChange={(e) => set({ rate: e.target.value })} placeholder="e.g., 4.9 / 5" />
        </FormField>
        <FormField label="Headline — part 1">
          <TextInput value={content.h1a} onChange={(e) => set({ h1a: e.target.value })} />
        </FormField>
        <FormField label="Headline — highlighted word">
          <TextInput value={content.hl} onChange={(e) => set({ hl: e.target.value })} />
        </FormField>
        <FormField label="Headline — part 2">
          <TextInput value={content.h1b} onChange={(e) => set({ h1b: e.target.value })} />
        </FormField>
        <FormField label="Product Image URL">
          <TextInput value={content.img} onChange={(e) => set({ img: e.target.value })} dir="ltr" />
        </FormField>
      </div>
      <FormField label="Lead Paragraph" hint="HTML tags like <b> are allowed">
        <TextArea rows={3} value={content.lead} onChange={(e) => set({ lead: e.target.value })} />
      </FormField>
      <FormField label="Trust Note">
        <TextInput value={content.trustNote} onChange={(e) => set({ trustNote: e.target.value })} />
      </FormField>
    </BlockCard>
  );
}

function PricingEditor() {
  const [content, setContent] = useState<PricingContent>({ label: '', current: 0, old: 0, currency: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    let cancelled = false;
    fetchContentBlock<PricingContent>('pricing', content)
      .then((data) => !cancelled && setContent(data))
      .catch((err) => console.error('Load pricing error:', err))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveContentBlock('pricing', content);
      addToast('success', 'Pricing saved.');
    } catch (error) {
      console.error('Save pricing error:', error);
      addToast('error', 'Failed to save pricing.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#d97706] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <BlockCard title="Offer Pricing" saving={saving} onSave={handleSave}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <FormField label="Label">
          <TextInput
            value={content.label}
            onChange={(e) => setContent((prev) => ({ ...prev, label: e.target.value }))}
          />
        </FormField>
        <FormField label="Current Price">
          <TextInput
            type="number"
            min={0}
            value={content.current}
            onChange={(e) => setContent((prev) => ({ ...prev, current: Number(e.target.value) }))}
          />
        </FormField>
        <FormField label="Old Price">
          <TextInput
            type="number"
            min={0}
            value={content.old}
            onChange={(e) => setContent((prev) => ({ ...prev, old: Number(e.target.value) }))}
          />
        </FormField>
        <FormField label="Currency">
          <TextInput
            value={content.currency}
            onChange={(e) => setContent((prev) => ({ ...prev, currency: e.target.value }))}
          />
        </FormField>
      </div>
    </BlockCard>
  );
}

function AboutEditor() {
  const [content, setContent] = useState<AboutContent>({
    badge: '', eyebrow: '', title: '', p1: '', p2: '', founderName: '', founderLogo: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    let cancelled = false;
    fetchContentBlock<AboutContent>('about', content)
      .then((data) => !cancelled && setContent(data))
      .catch((err) => console.error('Load about error:', err))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (patch: Partial<AboutContent>) => setContent((prev) => ({ ...prev, ...patch }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveContentBlock('about', content);
      addToast('success', 'About section saved.');
    } catch (error) {
      console.error('Save about error:', error);
      addToast('error', 'Failed to save about section.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#d97706] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <BlockCard title="About / Founder Section" saving={saving} onSave={handleSave}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Badge">
          <TextInput value={content.badge} onChange={(e) => set({ badge: e.target.value })} />
        </FormField>
        <FormField label="Eyebrow">
          <TextInput value={content.eyebrow} onChange={(e) => set({ eyebrow: e.target.value })} />
        </FormField>
      </div>
      <FormField label="Title">
        <TextInput value={content.title} onChange={(e) => set({ title: e.target.value })} />
      </FormField>
      <FormField label="Paragraph 1">
        <TextArea rows={3} value={content.p1} onChange={(e) => set({ p1: e.target.value })} />
      </FormField>
      <FormField label="Paragraph 2">
        <TextArea rows={3} value={content.p2} onChange={(e) => set({ p2: e.target.value })} />
      </FormField>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Founder Name">
          <TextInput value={content.founderName} onChange={(e) => set({ founderName: e.target.value })} />
        </FormField>
        <FormField label="Founder Logo URL">
          <TextInput value={content.founderLogo} onChange={(e) => set({ founderLogo: e.target.value })} dir="ltr" />
        </FormField>
      </div>
    </BlockCard>
  );
}

function VideoEditor() {
  const [content, setContent] = useState<VideoContent>({ eyebrow: '', title: '', desc: '', caption: '', poster: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    let cancelled = false;
    fetchContentBlock<VideoContent>('video', content)
      .then((data) => !cancelled && setContent(data))
      .catch((err) => console.error('Load video error:', err))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (patch: Partial<VideoContent>) => setContent((prev) => ({ ...prev, ...patch }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveContentBlock('video', content);
      addToast('success', 'Video section saved.');
    } catch (error) {
      console.error('Save video error:', error);
      addToast('error', 'Failed to save video section.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#d97706] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <BlockCard title="Video Section" saving={saving} onSave={handleSave}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Eyebrow">
          <TextInput value={content.eyebrow} onChange={(e) => set({ eyebrow: e.target.value })} />
        </FormField>
        <FormField label="Caption">
          <TextInput value={content.caption} onChange={(e) => set({ caption: e.target.value })} />
        </FormField>
      </div>
      <FormField label="Title">
        <TextInput value={content.title} onChange={(e) => set({ title: e.target.value })} />
      </FormField>
      <FormField label="Description">
        <TextArea rows={2} value={content.desc} onChange={(e) => set({ desc: e.target.value })} />
      </FormField>
      <FormField label="Poster Image URL">
        <TextInput value={content.poster} onChange={(e) => set({ poster: e.target.value })} dir="ltr" />
      </FormField>
    </BlockCard>
  );
}

// ---------------------------------------------------------------------------
// Collection editors
// ---------------------------------------------------------------------------

function FaqsEditor() {
  const [items, setItems] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const { addToast } = useToast();

  const load = () =>
    fetchCollection<Faq>('faqs')
      .then(setItems)
      .catch((err) => {
        console.error('Load faqs error:', err);
        addToast('error', 'Failed to load FAQs.');
      });

  useEffect(() => {
    let cancelled = false;
    load().finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateLocal = (id: string, patch: Partial<Faq>) =>
    setItems((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));

  const handleAdd = async () => {
    try {
      const maxOrder = items.reduce((max, f) => Math.max(max, f.sort_order), -1);
      const created = await createCollectionItem<Faq>('faqs', {
        question: '',
        answer: '',
        is_active: true,
        sort_order: maxOrder + 1,
      });
      setItems((prev) => [...prev, created]);
    } catch (error) {
      console.error('Create faq error:', error);
      addToast('error', 'Failed to create FAQ.');
    }
  };

  const handleSave = async (item: Faq) => {
    setSavingIds((prev) => new Set(prev).add(item.id));
    try {
      await updateCollectionItem('faqs', item.id, {
        question: item.question,
        answer: item.answer,
        is_active: item.is_active,
        sort_order: item.sort_order,
      });
      addToast('success', 'FAQ saved.');
    } catch (error) {
      console.error('Save faq error:', error);
      addToast('error', 'Failed to save FAQ.');
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this FAQ?')) return;
    try {
      await deleteCollectionItem('faqs', id);
      setItems((prev) => prev.filter((f) => f.id !== id));
    } catch (error) {
      console.error('Delete faq error:', error);
      addToast('error', 'Failed to delete FAQ.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#d97706] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((f) => (
        <ItemCard
          key={f.id}
          title={f.question}
          active={f.is_active}
          onToggleActive={() => {
            updateLocal(f.id, { is_active: !f.is_active });
            updateCollectionItem('faqs', f.id, { is_active: !f.is_active }).catch(() => {
              addToast('error', 'Failed to toggle FAQ.');
              load();
            });
          }}
          onDelete={() => handleDelete(f.id)}
          saving={savingIds.has(f.id)}
          onSave={() => handleSave(f)}
        >
          <div className="space-y-4">
            <FormField label="Question">
              <TextInput value={f.question} onChange={(e) => updateLocal(f.id, { question: e.target.value })} />
            </FormField>
            <FormField label="Answer">
              <TextArea rows={3} value={f.answer} onChange={(e) => updateLocal(f.id, { answer: e.target.value })} />
            </FormField>
            <FormField label="Sort Order">
              <TextInput
                type="number"
                value={f.sort_order}
                onChange={(e) => updateLocal(f.id, { sort_order: Number(e.target.value) })}
              />
            </FormField>
          </div>
        </ItemCard>
      ))}
      <AddButton label="Add FAQ" onClick={handleAdd} />
    </div>
  );
}

function BenefitsEditor() {
  const [items, setItems] = useState<Benefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const { addToast } = useToast();

  const load = () =>
    fetchCollection<Benefit>('benefits')
      .then(setItems)
      .catch((err) => {
        console.error('Load benefits error:', err);
        addToast('error', 'Failed to load benefits.');
      });

  useEffect(() => {
    let cancelled = false;
    load().finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateLocal = (id: string, patch: Partial<Benefit>) =>
    setItems((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));

  const handleAdd = async () => {
    try {
      const maxOrder = items.reduce((max, b) => Math.max(max, b.sort_order), -1);
      const created = await createCollectionItem<Benefit>('benefits', {
        icon: 'shield',
        title: '',
        description: '',
        col_span: 2,
        is_active: true,
        sort_order: maxOrder + 1,
      });
      setItems((prev) => [...prev, created]);
    } catch (error) {
      console.error('Create benefit error:', error);
      addToast('error', 'Failed to create benefit.');
    }
  };

  const handleSave = async (item: Benefit) => {
    setSavingIds((prev) => new Set(prev).add(item.id));
    try {
      await updateCollectionItem('benefits', item.id, {
        icon: item.icon,
        title: item.title,
        description: item.description,
        col_span: item.col_span,
        is_active: item.is_active,
        sort_order: item.sort_order,
      });
      addToast('success', 'Benefit saved.');
    } catch (error) {
      console.error('Save benefit error:', error);
      addToast('error', 'Failed to save benefit.');
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this benefit?')) return;
    try {
      await deleteCollectionItem('benefits', id);
      setItems((prev) => prev.filter((b) => b.id !== id));
    } catch (error) {
      console.error('Delete benefit error:', error);
      addToast('error', 'Failed to delete benefit.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#d97706] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((b) => (
        <ItemCard
          key={b.id}
          title={b.title}
          active={b.is_active}
          onToggleActive={() => {
            updateLocal(b.id, { is_active: !b.is_active });
            updateCollectionItem('benefits', b.id, { is_active: !b.is_active }).catch(() => {
              addToast('error', 'Failed to toggle benefit.');
              load();
            });
          }}
          onDelete={() => handleDelete(b.id)}
          saving={savingIds.has(b.id)}
          onSave={() => handleSave(b)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Icon Key" hint="shield, droplet, sprout, sparkle, sun...">
              <TextInput value={b.icon} onChange={(e) => updateLocal(b.id, { icon: e.target.value })} dir="ltr" />
            </FormField>
            <FormField label="Title">
              <TextInput value={b.title} onChange={(e) => updateLocal(b.id, { title: e.target.value })} />
            </FormField>
            <FormField label="Grid Columns (2 or 3)">
              <TextInput
                type="number"
                min={1}
                max={3}
                value={b.col_span}
                onChange={(e) => updateLocal(b.id, { col_span: Number(e.target.value) })}
              />
            </FormField>
          </div>
          <FormField label="Description">
            <TextArea rows={2} value={b.description} onChange={(e) => updateLocal(b.id, { description: e.target.value })} />
          </FormField>
          <FormField label="Sort Order">
            <TextInput
              type="number"
              value={b.sort_order}
              onChange={(e) => updateLocal(b.id, { sort_order: Number(e.target.value) })}
            />
          </FormField>
        </ItemCard>
      ))}
      <AddButton label="Add Benefit" onClick={handleAdd} />
    </div>
  );
}

function StatsEditor() {
  const [items, setItems] = useState<StatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const { addToast } = useToast();

  const load = () =>
    fetchCollection<StatItem>('stats')
      .then(setItems)
      .catch((err) => {
        console.error('Load stats error:', err);
        addToast('error', 'Failed to load stats.');
      });

  useEffect(() => {
    let cancelled = false;
    load().finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateLocal = (id: string, patch: Partial<StatItem>) =>
    setItems((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const handleAdd = async () => {
    try {
      const maxOrder = items.reduce((max, s) => Math.max(max, s.sort_order), -1);
      const created = await createCollectionItem<StatItem>('stats', {
        count_value: 0,
        prefix: '',
        suffix: '',
        label: '',
        is_active: true,
        sort_order: maxOrder + 1,
      });
      setItems((prev) => [...prev, created]);
    } catch (error) {
      console.error('Create stat error:', error);
      addToast('error', 'Failed to create stat.');
    }
  };

  const handleSave = async (item: StatItem) => {
    setSavingIds((prev) => new Set(prev).add(item.id));
    try {
      await updateCollectionItem('stats', item.id, {
        count_value: item.count_value,
        prefix: item.prefix,
        suffix: item.suffix,
        label: item.label,
        is_active: item.is_active,
        sort_order: item.sort_order,
      });
      addToast('success', 'Stat saved.');
    } catch (error) {
      console.error('Save stat error:', error);
      addToast('error', 'Failed to save stat.');
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this stat?')) return;
    try {
      await deleteCollectionItem('stats', id);
      setItems((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      console.error('Delete stat error:', error);
      addToast('error', 'Failed to delete stat.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#d97706] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((s) => (
        <ItemCard
          key={s.id}
          title={`${s.prefix}${s.count_value.toLocaleString()}${s.suffix} — ${s.label}`}
          active={s.is_active}
          onToggleActive={() => {
            updateLocal(s.id, { is_active: !s.is_active });
            updateCollectionItem('stats', s.id, { is_active: !s.is_active }).catch(() => {
              addToast('error', 'Failed to toggle stat.');
              load();
            });
          }}
          onDelete={() => handleDelete(s.id)}
          saving={savingIds.has(s.id)}
          onSave={() => handleSave(s)}
        >
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <FormField label="Count Value">
              <TextInput
                type="number"
                value={s.count_value}
                onChange={(e) => updateLocal(s.id, { count_value: Number(e.target.value) })}
              />
            </FormField>
            <FormField label="Prefix">
              <TextInput value={s.prefix} onChange={(e) => updateLocal(s.id, { prefix: e.target.value })} />
            </FormField>
            <FormField label="Suffix">
              <TextInput value={s.suffix} onChange={(e) => updateLocal(s.id, { suffix: e.target.value })} />
            </FormField>
            <FormField label="Label">
              <TextInput value={s.label} onChange={(e) => updateLocal(s.id, { label: e.target.value })} />
            </FormField>
            <FormField label="Sort Order">
              <TextInput
                type="number"
                value={s.sort_order}
                onChange={(e) => updateLocal(s.id, { sort_order: Number(e.target.value) })}
              />
            </FormField>
          </div>
        </ItemCard>
      ))}
      <AddButton label="Add Stat" onClick={handleAdd} />
    </div>
  );
}

function TrustBadgesEditor() {
  const [items, setItems] = useState<TrustBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const { addToast } = useToast();

  const load = () =>
    fetchCollection<TrustBadge>('trust-badges')
      .then(setItems)
      .catch((err) => {
        console.error('Load trust badges error:', err);
        addToast('error', 'Failed to load trust badges.');
      });

  useEffect(() => {
    let cancelled = false;
    load().finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateLocal = (id: string, patch: Partial<TrustBadge>) =>
    setItems((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const handleAdd = async () => {
    try {
      const maxOrder = items.reduce((max, t) => Math.max(max, t.sort_order), -1);
      const created = await createCollectionItem<TrustBadge>('trust-badges', {
        icon: 'shield',
        title: '',
        description: '',
        is_active: true,
        sort_order: maxOrder + 1,
      });
      setItems((prev) => [...prev, created]);
    } catch (error) {
      console.error('Create trust badge error:', error);
      addToast('error', 'Failed to create trust badge.');
    }
  };

  const handleSave = async (item: TrustBadge) => {
    setSavingIds((prev) => new Set(prev).add(item.id));
    try {
      await updateCollectionItem('trust-badges', item.id, {
        icon: item.icon,
        title: item.title,
        description: item.description,
        is_active: item.is_active,
        sort_order: item.sort_order,
      });
      addToast('success', 'Trust badge saved.');
    } catch (error) {
      console.error('Save trust badge error:', error);
      addToast('error', 'Failed to save trust badge.');
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this trust badge?')) return;
    try {
      await deleteCollectionItem('trust-badges', id);
      setItems((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error('Delete trust badge error:', error);
      addToast('error', 'Failed to delete trust badge.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#d97706] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((t) => (
        <ItemCard
          key={t.id}
          title={t.title}
          active={t.is_active}
          onToggleActive={() => {
            updateLocal(t.id, { is_active: !t.is_active });
            updateCollectionItem('trust-badges', t.id, { is_active: !t.is_active }).catch(() => {
              addToast('error', 'Failed to toggle trust badge.');
              load();
            });
          }}
          onDelete={() => handleDelete(t.id)}
          saving={savingIds.has(t.id)}
          onSave={() => handleSave(t)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Icon Key" hint="cod, returns, truck, shield...">
              <TextInput value={t.icon} onChange={(e) => updateLocal(t.id, { icon: e.target.value })} dir="ltr" />
            </FormField>
            <FormField label="Title">
              <TextInput value={t.title} onChange={(e) => updateLocal(t.id, { title: e.target.value })} />
            </FormField>
            <FormField label="Sort Order">
              <TextInput
                type="number"
                value={t.sort_order}
                onChange={(e) => updateLocal(t.id, { sort_order: Number(e.target.value) })}
              />
            </FormField>
          </div>
          <FormField label="Description">
            <TextInput value={t.description} onChange={(e) => updateLocal(t.id, { description: e.target.value })} />
          </FormField>
        </ItemCard>
      ))}
      <AddButton label="Add Trust Badge" onClick={handleAdd} />
    </div>
  );
}

function OilsEditor() {
  const [items, setItems] = useState<Oil[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const { addToast } = useToast();

  const load = () =>
    fetchCollection<Oil>('oils')
      .then(setItems)
      .catch((err) => {
        console.error('Load oils error:', err);
        addToast('error', 'Failed to load oils.');
      });

  useEffect(() => {
    let cancelled = false;
    load().finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateLocal = (id: string, patch: Partial<Oil>) =>
    setItems((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));

  const handleAdd = async () => {
    try {
      const maxOrder = items.reduce((max, o) => Math.max(max, o.sort_order), -1);
      const created = await createCollectionItem<Oil>('oils', {
        display_num: '',
        image_url: '',
        name: '',
        latin_name: '',
        points: [],
        tag: '',
        is_active: true,
        sort_order: maxOrder + 1,
      });
      setItems((prev) => [...prev, created]);
    } catch (error) {
      console.error('Create oil error:', error);
      addToast('error', 'Failed to create oil.');
    }
  };

  const handleSave = async (item: Oil) => {
    setSavingIds((prev) => new Set(prev).add(item.id));
    try {
      await updateCollectionItem('oils', item.id, {
        display_num: item.display_num,
        image_url: item.image_url,
        name: item.name,
        latin_name: item.latin_name,
        points: item.points,
        tag: item.tag,
        is_active: item.is_active,
        sort_order: item.sort_order,
      });
      addToast('success', 'Oil saved.');
    } catch (error) {
      console.error('Save oil error:', error);
      addToast('error', 'Failed to save oil.');
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this oil?')) return;
    try {
      await deleteCollectionItem('oils', id);
      setItems((prev) => prev.filter((o) => o.id !== id));
    } catch (error) {
      console.error('Delete oil error:', error);
      addToast('error', 'Failed to delete oil.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#d97706] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((o) => (
        <ItemCard
          key={o.id}
          title={`${o.display_num ? `${o.display_num}. ` : ''}${o.name}`}
          active={o.is_active}
          onToggleActive={() => {
            updateLocal(o.id, { is_active: !o.is_active });
            updateCollectionItem('oils', o.id, { is_active: !o.is_active }).catch(() => {
              addToast('error', 'Failed to toggle oil.');
              load();
            });
          }}
          onDelete={() => handleDelete(o.id)}
          saving={savingIds.has(o.id)}
          onSave={() => handleSave(o)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormField label="Display Number">
              <TextInput value={o.display_num} onChange={(e) => updateLocal(o.id, { display_num: e.target.value })} placeholder="01" />
            </FormField>
            <FormField label="Name">
              <TextInput value={o.name} onChange={(e) => updateLocal(o.id, { name: e.target.value })} />
            </FormField>
            <FormField label="Latin Name">
              <TextInput value={o.latin_name} onChange={(e) => updateLocal(o.id, { latin_name: e.target.value })} dir="ltr" />
            </FormField>
            <FormField label="Tag">
              <TextInput value={o.tag} onChange={(e) => updateLocal(o.id, { tag: e.target.value })} />
            </FormField>
          </div>
          <FormField label="Image URL">
            <TextInput value={o.image_url} onChange={(e) => updateLocal(o.id, { image_url: e.target.value })} dir="ltr" />
          </FormField>
          <FormField label="Points" hint="One point per line">
            <TextArea
              rows={3}
              dir="ltr"
              value={(o.points ?? []).join('\n')}
              onChange={(e) =>
                updateLocal(o.id, {
                  points: e.target.value.split('\n').map((p) => p.trim()).filter(Boolean),
                })
              }
            />
          </FormField>
          <FormField label="Sort Order">
            <TextInput
              type="number"
              value={o.sort_order}
              onChange={(e) => updateLocal(o.id, { sort_order: Number(e.target.value) })}
            />
          </FormField>
        </ItemCard>
      ))}
      <AddButton label="Add Oil" onClick={handleAdd} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main tab
// ---------------------------------------------------------------------------

export default function ContentTab() {
  const [subTab, setSubTab] = useState<ContentSubTab>('hero');

  const renderSubTab = () => {
    switch (subTab) {
      case 'hero':
        return <HeroEditor />;
      case 'pricing':
        return <PricingEditor />;
      case 'about':
        return <AboutEditor />;
      case 'video':
        return <VideoEditor />;
      case 'faq':
        return <FaqsEditor />;
      case 'benefits':
        return <BenefitsEditor />;
      case 'stats':
        return <StatsEditor />;
      case 'trust':
        return <TrustBadgesEditor />;
      case 'oils':
        return <OilsEditor />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-tab navigation */}
      <div className="bg-white rounded-2xl border border-gray-100 p-1.5 flex flex-wrap gap-1">
        {SUB_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === subTab;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon size={13} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {renderSubTab()}
    </div>
  );
}
