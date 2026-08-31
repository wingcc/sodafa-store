// app/dashboard/pages/store-manager/homepage/components/SettingsTab.tsx
'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, ToggleLeft, MousePointerClick, Store, FileText, Link2 } from 'lucide-react';
import Badge from '@/app/dashboard/components/ui/Badge';
import RefreshButton from '@/app/dashboard/components/ui/RefreshButton';
import { useToast } from '@/lib/toast';
import {
  fetchCollection,
  updateCollectionItem,
  fetchContentBlock,
  saveContentBlock,
} from '../services/homepageContentService';
import type { PageFeature, FloatingButton, SiteInfoContent } from '../types';
import { FormField, TextInput } from './FormField';

const DEFAULT_SITE_INFO: SiteInfoContent = {
  brandName: 'SODFA',
  tagline: '',
  whatsappMain: '',
  phoneDisplay: '',
  email: '',
  address: '',
  hoursStore: '',
  instagram: '',
  facebook: '',
  tiktok: '',
  privacyPolicySlug: 'privacy-policy',
  termsSlug: 'terms',
  cookiesSlug: 'cookies',
};

export default function SettingsTab() {
  const [features, setFeatures] = useState<PageFeature[]>([]);
  const [buttons, setButtons] = useState<FloatingButton[]>([]);
  const [siteInfo, setSiteInfo] = useState<SiteInfoContent>(DEFAULT_SITE_INFO);
  const [contentPages, setContentPages] = useState<{ slug: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSite, setSavingSite] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetchCollection<PageFeature>('page-features'),
      fetchCollection<FloatingButton>('floating-buttons'),
      fetchContentBlock<SiteInfoContent>('site_info', DEFAULT_SITE_INFO),
    ])
      .then(([f, b, s]) => {
        if (cancelled) return;
        setFeatures(f);
        setButtons(b);
        // Ensure legal slugs have defaults if missing (backwards compat)
        setSiteInfo({
          privacyPolicySlug: 'privacy-policy',
          termsSlug: 'terms',
          cookiesSlug: 'cookies',
          ...s,
        } as SiteInfoContent);
      })
      .catch((error) => {
        console.error('Load settings error:', error);
        if (!cancelled) addToast('error', 'Failed to load homepage settings.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    // Load available Store Content pages for legal-link pickers
    fetch('/api/content-pages')
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        if (json.success && Array.isArray(json.data)) {
          setContentPages(json.data.map((row: any) => ({ slug: String(row.slug), name: String(row.name) })));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const handleReload = () => {
    setLoading(true);
    Promise.all([
      fetchCollection<PageFeature>('page-features'),
      fetchCollection<FloatingButton>('floating-buttons'),
      fetchContentBlock<SiteInfoContent>('site_info', DEFAULT_SITE_INFO),
    ])
      .then(([f, b, s]) => {
        setFeatures(f);
        setButtons(b);
        setSiteInfo(s);
        addToast('info', 'Settings refreshed', { title: 'Refreshed' });
      })
      .catch(() => addToast('error', 'Failed to reload settings.'))
      .finally(() => setLoading(false));
  };

  const toggleFeature = async (feature: PageFeature) => {
    const next = !feature.is_enabled;
    setFeatures((prev) =>
      prev.map((f) => (f.feature_key === feature.feature_key ? { ...f, is_enabled: next } : f))
    );
    try {
      await updateCollectionItem('page-features', feature.feature_key, { is_enabled: next });
    } catch (error) {
      console.error('Toggle feature error:', error);
      addToast('error', 'Failed to update feature.');
      setFeatures((prev) =>
        prev.map((f) => (f.feature_key === feature.feature_key ? { ...f, is_enabled: !next } : f))
      );
    }
  };

  const toggleButton = async (button: FloatingButton) => {
    const next = !button.is_enabled;
    setButtons((prev) =>
      prev.map((b) => (b.button_key === button.button_key ? { ...b, is_enabled: next } : b))
    );
    try {
      await updateCollectionItem('floating-buttons', button.button_key, { is_enabled: next });
    } catch (error) {
      console.error('Toggle button error:', error);
      addToast('error', 'Failed to update button.');
      setButtons((prev) =>
        prev.map((b) => (b.button_key === button.button_key ? { ...b, is_enabled: !next } : b))
      );
    }
  };

  const setButtonPosition = async (button: FloatingButton, position: 'left' | 'right') => {
    setButtons((prev) =>
      prev.map((b) => (b.button_key === button.button_key ? { ...b, position } : b))
    );
    try {
      await updateCollectionItem('floating-buttons', button.button_key, { position });
    } catch (error) {
      console.error('Position change error:', error);
      addToast('error', 'Failed to update button position.');
      loadButtons();
    }
  };

  const loadButtons = () => {
    fetchCollection<FloatingButton>('floating-buttons')
      .then(setButtons)
      .catch(() => addToast('error', 'Failed to reload buttons.'));
  };

  const updateSite = (patch: Partial<SiteInfoContent>) =>
    setSiteInfo((prev) => ({ ...prev, ...patch }));

  const handleSaveSite = async () => {
    setSavingSite(true);
    try {
      await saveContentBlock('site_info', siteInfo);
      addToast('success', 'Store info saved successfully.');
    } catch (error) {
      console.error('Save site info error:', error);
      addToast('error', 'Failed to save store info.');
    } finally {
      setSavingSite(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  const enabledFeatures = features.filter((f) => f.is_enabled).length;
  const enabledButtons = buttons.filter((b) => b.is_enabled).length;

  return (
    <div className="space-y-6">
      {/* Page Features */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
              <ToggleLeft size={16} className="text-purple-600" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Page Features</h4>
              <p className="text-xs text-gray-500">Enable or disable homepage behaviors</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="purple" size="md" dot>
              {enabledFeatures} / {features.length} on
            </Badge>
            <RefreshButton onRefresh={handleReload} size="sm" variant="default" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {features.map((f) => (
            <button
              key={f.feature_key}
              type="button"
              onClick={() => toggleFeature(f)}
              className={`flex items-center justify-between p-4 rounded-xl transition-colors text-right ${
                f.is_enabled ? 'bg-emerald-50 hover:bg-emerald-100' : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <span>
                <span className="block text-sm font-medium text-gray-900">{f.name}</span>
                <span className="block text-[11px] text-gray-400 font-mono mt-0.5" dir="ltr">
                  {f.feature_key}
                </span>
              </span>
              <span
                className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors ${
                  f.is_enabled ? 'bg-emerald-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 mt-1 ml-1 rounded-full bg-white shadow transform transition-transform ${
                    f.is_enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Floating Buttons */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-pink-50 flex items-center justify-center">
            <MousePointerClick size={16} className="text-pink-600" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Floating Buttons</h4>
            <p className="text-xs text-gray-500">Corner placement and visibility of floating actions</p>
          </div>
          <div className="ms-auto">
            <Badge variant="purple" size="md" dot>
              {enabledButtons} / {buttons.length} on
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {buttons.map((b) => (
            <div
              key={b.button_key}
              className={`p-4 rounded-xl space-y-3 ${
                b.is_enabled ? 'bg-emerald-50' : 'bg-gray-50'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleButton(b)}
                className="flex items-center justify-between w-full text-right"
              >
                <span>
                  <span className="block text-sm font-medium text-gray-900">{b.name}</span>
                  <span className="block text-[11px] text-gray-400 font-mono mt-0.5" dir="ltr">
                    {b.button_key}
                  </span>
                </span>
                <span
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors ${
                    b.is_enabled ? 'bg-emerald-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 mt-1 ml-1 rounded-full bg-white shadow transform transition-transform ${
                      b.is_enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Position:</span>
                {(['left', 'right'] as const).map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setButtonPosition(b, pos)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                      b.position === pos
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Store Info */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
              <Store size={16} className="text-amber-600" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Store Info</h4>
              <p className="text-xs text-gray-500">Contact details shown across the homepage</p>
            </div>
          </div>
          <button
            onClick={handleSaveSite}
            disabled={savingSite}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all disabled:opacity-60"
          >
            <Save size={14} className={savingSite ? 'animate-spin' : ''} />
            Save Store Info
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField label="Brand Name">
            <TextInput value={siteInfo.brandName} onChange={(e) => updateSite({ brandName: e.target.value })} />
          </FormField>
          <FormField label="Tagline">
            <TextInput value={siteInfo.tagline} onChange={(e) => updateSite({ tagline: e.target.value })} />
          </FormField>
          <FormField label="WhatsApp Number" hint="International format, e.g., +212...">
            <TextInput
              dir="ltr"
              value={siteInfo.whatsappMain}
              onChange={(e) => updateSite({ whatsappMain: e.target.value })}
            />
          </FormField>
          <FormField label="Phone Display">
            <TextInput
              dir="ltr"
              value={siteInfo.phoneDisplay}
              onChange={(e) => updateSite({ phoneDisplay: e.target.value })}
            />
          </FormField>
          <FormField label="Email">
            <TextInput
              dir="ltr"
              type="email"
              value={siteInfo.email}
              onChange={(e) => updateSite({ email: e.target.value })}
            />
          </FormField>
          <FormField label="Address">
            <TextInput value={siteInfo.address} onChange={(e) => updateSite({ address: e.target.value })} />
          </FormField>
          <FormField label="Store Hours">
            <TextInput value={siteInfo.hoursStore} onChange={(e) => updateSite({ hoursStore: e.target.value })} />
          </FormField>
          <FormField label="Instagram URL">
            <TextInput
              dir="ltr"
              value={siteInfo.instagram}
              onChange={(e) => updateSite({ instagram: e.target.value })}
            />
          </FormField>
          <FormField label="Facebook URL">
            <TextInput
              dir="ltr"
              value={siteInfo.facebook}
              onChange={(e) => updateSite({ facebook: e.target.value })}
            />
          </FormField>
          <FormField label="TikTok URL">
            <TextInput dir="ltr" value={siteInfo.tiktok} onChange={(e) => updateSite({ tiktok: e.target.value })} />
          </FormField>
        </div>
      </section>

      {/* Legal Links — Footer Popups use Store Content */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <FileText size={16} className="text-emerald-600" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Legal Pages — Footer Popups</h4>
              <p className="text-xs text-gray-500">Pick which Store Content page is shown for each footer link. Popup loads from its slug.</p>
            </div>
          </div>
          <a
            href="/dashboard/store-content"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-purple-600 hover:text-purple-700"
          >
            <Link2 size={12} /> Go to Store Content
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { key: 'privacyPolicySlug' as const, label: 'Privacy Policy', hint: 'Footer → Privacy' },
            { key: 'termsSlug' as const, label: 'Terms & Conditions', hint: 'Footer → Terms' },
            { key: 'cookiesSlug' as const, label: 'Cookies Policy', hint: 'Footer → Cookies' },
          ].map((field) => (
            <FormField key={field.key} label={field.label} hint={field.hint}>
              <div className="relative">
                <select
                  value={(siteInfo as any)[field.key] || ''}
                  onChange={(e) => updateSite({ [field.key]: e.target.value } as Partial<SiteInfoContent>)}
                  className="w-full px-3 py-2.5 pr-8 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 appearance-none"
                >
                  <option value="">— Select Store Content —</option>
                  {contentPages.map((p) => (
                    <option key={p.slug} value={p.slug}>
                      {p.name} — /content/{p.slug}
                    </option>
                  ))}
                  {/* Allow custom slug even if not in list */}
                  {contentPages.every((p) => p.slug !== (siteInfo as any)[field.key]) && (siteInfo as any)[field.key] ? (
                    <option value={(siteInfo as any)[field.key]}>{(siteInfo as any)[field.key]} — custom</option>
                  ) : null}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                </div>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Link: <span dir="ltr" className="font-mono text-gray-600">/content/{(siteInfo as any)[field.key] || '…'}</span>
                {(siteInfo as any)[field.key] && (
                  <a href={`/content/${(siteInfo as any)[field.key]}`} target="_blank" rel="noopener" className="ml-2 text-purple-600 hover:underline">
                    Preview
                  </a>
                )}
              </p>
            </FormField>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Tip: Create or edit pages in <b>Store Content</b>. Published content is loaded via <code className="px-1 py-0.5 bg-gray-100 rounded text-[11px]">/api/content-pages?slug=…</code>
          </p>
          <button
            onClick={handleSaveSite}
            disabled={savingSite}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all disabled:opacity-60"
          >
            <Save size={14} className={savingSite ? 'animate-spin' : ''} />
            Save Legal Links
          </button>
        </div>
      </section>
    </div>
  );
}
