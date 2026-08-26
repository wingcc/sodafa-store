// app/dashboard/pages/settings/StoreSettings.tsx
import React from 'react';

interface StoreSettingsProps {
  settings: any;
  setSettings: (settings: any) => void;
}

const StoreSettings: React.FC<StoreSettingsProps> = ({ settings, setSettings }) => {
  const update = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  const inputClass = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-darkGreen)]/20 focus:border-[var(--color-darkGreen)]/50 transition-all';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
      <h3 className="text-base font-semibold text-gray-900">Store Configuration</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Tax Rate (%)</label>
          <input
            type="number"
            value={settings.taxRate}
            onChange={(e) => update('taxRate', Number(e.target.value))}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Free Shipping Threshold (MAD)</label>
          <input
            type="number"
            value={settings.freeShippingThreshold}
            onChange={(e) => update('freeShippingThreshold', Number(e.target.value))}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Low Stock Alert Threshold</label>
        <input
          type="number"
          value={settings.lowStockAlert}
          onChange={(e) => update('lowStockAlert', Number(e.target.value))}
          className={inputClass}
        />
      </div>
    </div>
  );
};

export default StoreSettings;
