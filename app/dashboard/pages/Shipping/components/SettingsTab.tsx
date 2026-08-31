// Settings tab — global shipping configuration including the free shipping threshold.

import { useEffect, useState } from 'react';
import { AlertCircle, Save, Truck } from 'lucide-react';
import { useToast } from '@/lib/toast';
import type { ShippingZone } from '../../../types';

interface SettingsTabProps {
  zones: ShippingZone[];
}

const SettingsTab = ({ zones }: SettingsTabProps) => {
  const { addToast } = useToast();
  const [threshold, setThreshold] = useState<number>(500);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadThreshold = async () => {
      try {
        const res = await fetch('/api/admin/settings');
        const json = await res.json();
        const value = Number(json?.data?.free_shipping_threshold ?? 500);
        setThreshold(Number.isFinite(value) && value >= 0 ? value : 500);
      } catch (error) {
        console.error('Failed to load free shipping threshold', error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadThreshold();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const value = Math.max(0, Number(threshold) || 0);
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ free_shipping_threshold: String(value) }),
      });

      const json = await res.json();
      if (!res.ok || json?.success === false) {
        throw new Error(json?.error?.message || 'Failed to save threshold');
      }

      setThreshold(value);
      addToast('success', `Free shipping threshold updated to ${value} MAD`, { title: 'Shipping settings saved' });
    } catch (error) {
      console.error(error);
      addToast('error', 'Could not save free shipping threshold', { title: 'Save failed' });
    } finally {
      setIsSaving(false);
    }
  };

  const totalCities = new Set<string>();
  zones.forEach((z) => z.cities.forEach((c) => totalCities.add(c.name)));
  const allMethods = zones.flatMap((z) => z.cities.flatMap((c) => c.methods));

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-5">
        <h3 className="text-lg font-bold text-stone-900">General shipping configuration</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
            <label className="text-xs font-semibold text-stone-500">Currency</label>
            <p className="text-stone-900 font-bold">MAD (Dirham)</p>
          </div>
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
            <label className="text-xs font-semibold text-stone-500">Delivery zones</label>
            <p className="text-stone-900 font-bold">{zones.length} zone(s)</p>
          </div>
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
            <label className="text-xs font-semibold text-stone-500">Covered cities</label>
            <p className="text-stone-900 font-bold">{totalCities.size} city(s)</p>
          </div>
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
            <label className="text-xs font-semibold text-stone-500">Total delivery methods</label>
            <p className="text-stone-900 font-bold">{allMethods.length} method(s)</p>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
              <Truck size={16} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">Free shipping</p>
              <p className="text-sm text-stone-600">Threshold for automatic free delivery</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            <div className="flex-1">
              <label htmlFor="free-shipping-threshold" className="block text-xs font-semibold text-stone-600 mb-1.5">
                Threshold (MAD)
              </label>
              <input
                id="free-shipping-threshold"
                type="number"
                min={0}
                step={10}
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                disabled={isLoading || isSaving}
                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={isLoading || isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Save size={16} />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>

          <p className="mt-2 text-[11px] text-stone-500">
            Orders at or above {threshold} MAD will get free delivery automatically.
          </p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 text-amber-800 text-xs">
        <AlertCircle size={14} className="inline mr-1" />
        Additional checkout &amp; shipping settings are stored in the &ldquo;store_settings&rdquo; table and
        applied at checkout time.
      </div>
    </div>
  );
};

export default SettingsTab;
