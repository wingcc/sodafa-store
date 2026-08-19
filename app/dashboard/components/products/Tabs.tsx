// SODFA MARKETPLACE - Product Modal Tabs

import React from 'react';

type TabId = 'general' | 'pricing' | 'media' | 'seo' | 'advanced';

interface Tab {
  id: TabId;
  label: string;
}

interface ProductTabsProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs: Tab[] = [
  { id: 'general', label: 'General' },
  { id: 'pricing', label: 'Pricing & Inventory' },
  { id: 'media', label: 'Media' },
  { id: 'seo', label: 'SEO' },
  { id: 'advanced', label: 'Advanced' },
];

export const ProductTabs: React.FC<ProductTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex-shrink-0 px-6 pt-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex gap-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-b-2 border-purple-500'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};