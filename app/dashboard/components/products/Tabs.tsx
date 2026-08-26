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
                ? 'bg-[var(--color-darkGreen)]/10 text-[var(--color-darkGreen)] border-b-2 border-[var(--color-darkGreen)]'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};