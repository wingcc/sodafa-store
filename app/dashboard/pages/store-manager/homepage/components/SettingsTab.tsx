// app/dashboard/pages/store-manager/homepage/components/SettingsTab.tsx
'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, ToggleLeft, MousePointerClick, Store } from 'lucide-react';
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
};

export default function SettingsTab() {
  const [features, setFeatures] = useState<PageFeature[]>([]);
  const [buttons, setButtons] = useState<FloatingButton[]>([]);
  const [siteInfo, setSiteInfo] = useState<SiteInfoContent>(DEFAULT_SITE_INFO);
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
        setSiteInfo(s);
      })
      .catch((error) => {
        console.error('Load settings error:', error);
        if (!cancelled) addToast('error', 'Failed to load homepage settings.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
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
    </div>
  );
}
