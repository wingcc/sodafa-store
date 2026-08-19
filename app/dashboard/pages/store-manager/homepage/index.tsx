// app/dashboard/pages/store-manager/homepage/index.tsx
'use client';

import { useStore } from '../../../store/useStore';
import { ArrowLeft } from 'lucide-react';
// ... other imports

export default function HomepageManagement() {
  const { setCurrentPage } = useStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setCurrentPage('store')}
          className="flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Store Management
        </button>
      </div>
      {/* ... rest of the component */}
    </div>
  );
}