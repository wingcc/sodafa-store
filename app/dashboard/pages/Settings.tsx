// SODFA MARKETPLACE - Settings Page (Modular)
import React, { useState } from 'react';
import { Save, Check } from 'lucide-react';
import { useToast } from '@/lib/toast';

// Import tab components
import GeneralSettings from '@/app/dashboard/pages/settings/GeneralSettings';
import StoreSettings from '@/app/dashboard/pages/settings/StoreSettings';
import NotificationSettings from '@/app/dashboard/pages/settings/NotificationSettings';
import SecuritySettings from '@/app/dashboard/pages/settings/SecuritySettings';
import ThemeSettings from '@/app/dashboard/pages/settings/ThemeSettings';
import ToastSettings from './settings/ToastSettings'; 

// Tab configuration – add new tabs here
const TABS = [
  { id: 'general', label: 'General', icon: '🏪', component: GeneralSettings },
  { id: 'store', label: 'Store', icon: '🌐', component: StoreSettings },
  { id: 'theme', label: 'Theme', icon: '🎨', component: ThemeSettings },
  { id: 'toast', label: 'Toast', icon: '🍞', component: ToastSettings }, // 👈 NEW
  { id: 'notifications', label: 'Notifications', icon: '🔔', component: NotificationSettings },
  { id: 'security', label: 'Security', icon: '🛡️', component: SecuritySettings },
];

const Settings: React.FC = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [saved, setSaved] = useState(false);

  // Centralized settings state – passed to all tab components
  const [settings, setSettings] = useState({
    storeName: 'SODFA MARKETPLACE',
    storeDescription: 'Your premium destination for beauty products, hair oils, and cosmetic oils.',
    contactEmail: 'contact@sodfa.ma',
    contactPhone: '+212 5XX XXX XXX',
    currency: 'MAD',
    language: 'en',
    taxRate: 20,
    freeShippingThreshold: 300,
    lowStockAlert: 20,
  });

  const handleSave = () => {
    setSaved(true);
    addToast('success', 'Your store settings have been applied successfully.', { title: 'Settings Saved' });
    setTimeout(() => setSaved(false), 3000);
  };

  const ActiveComponent = TABS.find((tab) => tab.id === activeTab)?.component;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Settings</h2>
          <p className="text-sm text-gray-500 mt-1">Configure your store settings</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-purple-500/25 transition-all"
        >
          {saved ? <Check size={16} /> : <Save size={16} />}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-56">
          <div className="bg-white rounded-2xl border border-gray-100 p-2 flex lg:flex-col gap-1 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-purple-50 text-purple-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {ActiveComponent && (
            <ActiveComponent settings={settings} setSettings={setSettings} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;