// app/dashboard/pages/store-manager/homepage/components/SeoTab.tsx
'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, Search, Share2 } from 'lucide-react';
import { useToast } from '@/lib/toast';
import { fetchContentBlock, saveContentBlock } from '../services/homepageContentService';
import type { SeoContent } from '../types';
import { FormField, TextInput, TextArea, Toggle } from './FormField';

const DEFAULT_SEO: SeoContent = {
  metaTitle: '',
  metaDescription: '',
  metaKeywords: '',
  author: '',
  robots: 'index, follow',
  siteUrl: '',
  ogImage: '',
  ogType: 'website',
  ogLocale: 'ar_MA',
  twitterCard: 'summary_large_image',
  indexable: true,
};

export default function SeoTab() {
  const [seo, setSeo] = useState<SeoContent>(DEFAULT_SEO);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    let cancelled = false;
    fetchContentBlock<SeoContent>('seo', DEFAULT_SEO)
      .then((data) => !cancelled && setSeo(data))
      .catch((error) => {
        console.error('Load SEO error:', error);
        if (!cancelled) addToast('error', 'Failed to load SEO settings.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveContentBlock('seo', seo);
      addToast('success', 'SEO settings saved successfully.');
    } catch (error) {
      console.error('Save error:', error);
      addToast('error', 'Failed to save SEO settings.');
    } finally {
      setSaving(false);
    }
  };

  const update = (patch: Partial<SeoContent>) => setSeo((prev) => ({ ...prev, ...patch }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Google preview */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Search size={15} className="text-purple-600" />
          Google Search Preview
        </h4>
        <div className="bg-gray-50 rounded-xl p-5 max-w-2xl" dir="ltr">
          <p className="text-xs text-gray-500 mb-1">{seo.siteUrl || 'https://www.sodfa.com'}</p>
          <p className="text-lg text-blue-700 hover:underline cursor-pointer truncate">
            {seo.metaTitle || 'Your page title appears here'}
          </p>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {seo.metaDescription || 'Your meta description appears here. Write a compelling summary of the page.'}
          </p>
        </div>
      </div>

      {/* Basic meta */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <h4 className="text-sm font-semibold text-gray-900">Basic Meta Tags</h4>

        <FormField label="Meta Title" hint={`${seo.metaTitle.length}/60 characters`}>
          <TextInput value={seo.metaTitle} onChange={(e) => update({ metaTitle: e.target.value })} />
        </FormField>

        <FormField label="Meta Description" hint={`${seo.metaDescription.length}/160 characters`}>
          <TextArea rows={3} value={seo.metaDescription} onChange={(e) => update({ metaDescription: e.target.value })} />
        </FormField>

        <FormField label="Keywords" hint="Comma-separated keywords">
          <TextInput value={seo.metaKeywords} onChange={(e) => update({ metaKeywords: e.target.value })} />
        </FormField>

        <Toggle
          label="Indexable"
          description="Allow search engines to index this page"
          checked={seo.indexable}
          onChange={(indexable) =>
            update({ indexable, robots: indexable ? 'index, follow' : 'noindex, nofollow' })
          }
        />

        <FormField label="Robots Directive">
          <TextInput dir="ltr" value={seo.robots} onChange={(e) => update({ robots: e.target.value })} />
        </FormField>

        <FormField label="Author">
          <TextInput dir="ltr" value={seo.author} onChange={(e) => update({ author: e.target.value })} />
        </FormField>
      </section>

      {/* Open Graph */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Share2 size={15} className="text-purple-600" />
          Open Graph & Social Sharing
        </h4>

        <FormField label="Site URL" hint="Canonical URL used for og:url">
          <TextInput dir="ltr" value={seo.siteUrl} onChange={(e) => update({ siteUrl: e.target.value })} placeholder="https://www.sodfa.com" />
        </FormField>

        <FormField label="OG Image URL" hint="Recommended: 1200×630px">
          <TextInput dir="ltr" value={seo.ogImage} onChange={(e) => update({ ogImage: e.target.value })} />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField label="OG Type">
            <select
              value={seo.ogType}
              onChange={(e) => update({ ogType: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            >
              <option value="website">website</option>
              <option value="product">product</option>
              <option value="article">article</option>
            </select>
          </FormField>
          <FormField label="OG Locale">
            <select
              value={seo.ogLocale}
              onChange={(e) => update({ ogLocale: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            >
              <option value="ar_MA">ar_MA</option>
              <option value="ar_AR">ar_AR</option>
              <option value="en_US">en_US</option>
              <option value="fr_FR">fr_FR</option>
            </select>
          </FormField>
          <FormField label="Twitter Card">
            <select
              value={seo.twitterCard}
              onChange={(e) => update({ twitterCard: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            >
              <option value="summary">summary</option>
              <option value="summary_large_image">summary_large_image</option>
            </select>
          </FormField>
        </div>
      </section>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all disabled:opacity-60"
        >
          <Save size={14} className={saving ? 'animate-spin' : ''} />
          Save SEO Settings
        </button>
      </div>
    </div>
  );
}
