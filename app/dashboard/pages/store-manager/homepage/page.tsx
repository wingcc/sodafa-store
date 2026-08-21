// app/dashboard/pages/store-manager/homepage/page.tsx
'use client';

import { useState } from 'react';
import { Layout, FileText, Star, Settings, Globe, LucideIcon } from 'lucide-react';
import { HomepageTab } from './types';
import SectionsTab from './components/SectionsTab';
import ContentTab from './components/ContentTab';
import ReviewsTab from './components/ReviewsTab';
import SettingsTab from './components/SettingsTab';
import SeoTab from './components/SeoTab';

interface TabDefinition {
  id: HomepageTab;
  label: string;
  description: string;
  icon: LucideIcon;
}

const TABS: TabDefinition[] = [
  {
    id: 'sections',
    label: 'Home Page',
    description: 'Manage sections and layout of your homepage',
    icon: Layout,
  },
  {
    id: 'content',
    label: 'Contents',
    description: 'Edit the texts displayed across your homepage',
    icon: FileText,
  },
  {
    id: 'reviews',
    label: 'Reviews',
    description: 'Manage customer reviews shown on the homepage',
    icon: Star,
  },
  {
    id: 'settings',
    label: 'Settings',
    description: 'General behavior and appearance of your homepage',
    icon: Settings,
  },
  {
    id: 'seo',
    label: 'SEO',
    description: 'Optimize how your store appears in search engines',
    icon: Globe,
  },
];

interface HomepageManagementProps {
  /** When provided, renders as a dedicated page showing only that tab
   *  (no tab navigation) — used by the Store Management cards. */
  initialTab?: HomepageTab;
}

export default function HomepageManagement({ initialTab }: HomepageManagementProps = {}) {
  const [activeTab, setActiveTab] = useState<HomepageTab>(initialTab ?? 'sections');
  const activeTabDef = TABS.find((t) => t.id === activeTab) ?? TABS[0];

  const renderTab = () => {
    switch (activeTab) {
      case 'sections':
        return <SectionsTab />;
      case 'content':
        return <ContentTab />;
      case 'reviews':
        return <ReviewsTab />;
      case 'settings':
        return <SettingsTab />;
      case 'seo':
        return <SeoTab />;
      default:
        return null;
    }
  };

  const dedicated = typeof initialTab === 'string';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">{activeTabDef.label}</h2>
        <p className="text-sm text-gray-500 mt-1">{activeTabDef.description}</p>
      </div>

      {/* Tab navigation — only in combined mode */}
      {!dedicated && (
        <div className="bg-white rounded-2xl border border-gray-100 p-1.5 flex flex-wrap gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Active tab content */}
      <div>{renderTab()}</div>
    </div>
  );
}
