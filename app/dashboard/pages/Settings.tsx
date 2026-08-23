// SODFA MARKETPLACE - Settings Page (Modular)
import React, { useState } from 'react';
import { Save, Check } from 'lucide-react';
import { useToast } from '@/lib/toast';
import { useTranslation } from '../i18n/useTranslation';

// Import tab components
import MyProfileSettings from '@/app/dashboard/pages/settings/MyProfileSettings';
import NotificationSettings from '@/app/dashboard/pages/settings/NotificationSettings';
import ThemeSettings from '@/app/dashboard/pages/settings/ThemeSettings';
import ToastSettings from './settings/ToastSettings'; 

// Tab configuration – add new tabs here (labels resolved via i18n inside component)
const TABS_CONFIG = [
  { id: 'profile', labelKey: 'settings.profile' as const, icon: '👤', component: MyProfileSettings },
  { id: 'theme', labelKey: 'settings.theme' as const, icon: '🎨', component: ThemeSettings },
  { id: 'toast', labelKey: 'settings.toast' as const, icon: '🍞', component: ToastSettings },
  { id: 'notifications', labelKey: 'settings.notifications' as const, icon: '🔔', component: NotificationSettings },
];

const Settings: React.FC = () => {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);
  const TABS = TABS_CONFIG.map(tb => ({ ...tb, label: t(tb.labelKey) }));

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
          <h2 className="text-xl font-bold text-gray-900">{t('settings.title')}</h2>
          <p className="text-sm text-gray-500 mt-1">{t('settings.subtitle')}</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-purple-500/25 transition-all"
        >
          {saved ? <Check size={16} /> : <Save size={16} />}
          {saved ? t('common.saved') : t('common.saveChanges')}
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