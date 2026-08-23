// Settings tab — read-only summary of global shipping configuration.

import { AlertCircle } from 'lucide-react';
import type { ShippingZone } from '../../../types';

interface SettingsTabProps {
  zones: ShippingZone[];
}

const SettingsTab = ({ zones }: SettingsTabProps) => {
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
