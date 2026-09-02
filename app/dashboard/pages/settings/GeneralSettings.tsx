// app/dashboard/pages/settings/GeneralSettings.tsx
import React from 'react';
import { Upload } from 'lucide-react';

interface GeneralSettingsProps {
  settings: any;
  setSettings: (settings: any) => void;
}

const GeneralSettings: React.FC<GeneralSettingsProps> = ({ settings, setSettings }) => {
  const update = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  const inputClass = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-darkGreen)]/20 focus:border-[var(--color-darkGreen)]/50 transition-all';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
      <h3 className="text-base font-semibold text-gray-900">General Settings</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Store Name</label>
        <input
          type="text"
          value={settings.storeName}
          onChange={(e) => update('storeName', e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Store Description</label>
        <textarea
          value={settings.storeDescription}
          onChange={(e) => update('storeDescription', e.target.value)}
          rows={3}
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Email</label>
          <input
            type="email"
            value={settings.contactEmail}
            onChange={(e) => update('contactEmail', e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Phone</label>
          <input
            type="tel"
            value={settings.contactPhone}
            onChange={(e) => update('contactPhone', e.target.value)}
            placeholder="06 XX XX XX XX"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Currency</label>
          <select
            value={settings.currency}
            onChange={(e) => update('currency', e.target.value)}
            className={inputClass}
          >
            <option value="MAD">MAD - Moroccan Dirham</option>
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Language</label>
          <select
            value={settings.language}
            onChange={(e) => update('language', e.target.value)}
            className={inputClass}
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="ar">العربية</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Store Logo</label>
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--color-darkGreen), var(--color-mediumGreen))', boxShadow: '0 4px 12px rgba(var(--color-darkGreen-rgb, 4,120,87), 0.3)' }}
          >
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors">
            <Upload size={14} /> Change Logo
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;
