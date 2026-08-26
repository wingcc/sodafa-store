// app/dashboard/pages/settings/SecuritySettings.tsx
import React from 'react';

const SecuritySettings: React.FC = () => {
  const inputClass = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-darkGreen)]/20 focus:border-[var(--color-darkGreen)]/50 transition-all';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
      <h3 className="text-base font-semibold text-gray-900">Security Settings</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
        <input
          type="password"
          placeholder="Enter current password"
          className={inputClass}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
        <input
          type="password"
          placeholder="Enter new password"
          className={inputClass}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
        <input
          type="password"
          placeholder="Confirm new password"
          className={inputClass}
        />
      </div>
      <button
        className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white rounded-xl transition-all hover:shadow-lg"
        style={{ background: 'linear-gradient(135deg, var(--color-darkGreen), var(--color-mediumGreen))' }}
      >
        Update Password
      </button>
    </div>
  );
};

export default SecuritySettings;
