// app/dashboard/pages/settings/NotificationSettings.tsx
import React from 'react';

const NotificationSettings: React.FC = () => {
  const items = [
    { label: 'New Order Notifications', description: 'Get notified when a new order is placed' },
    { label: 'Low Stock Alerts', description: 'Get notified when stock is running low' },
    { label: 'New Review Notifications', description: 'Get notified when a customer leaves a review' },
    { label: 'Payment Alerts', description: 'Get notified about payment issues' },
    { label: 'Daily Sales Report', description: 'Receive a daily summary of sales' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
      <h3 className="text-base font-semibold text-gray-900">Notification Settings</h3>
      {items.map((item, i) => (
        <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
          <div>
            <p className="text-sm font-medium text-gray-900">{item.label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
          </div>
          <button
            className={`w-11 h-6 rounded-full transition-colors ${i < 3 ? 'bg-purple-500' : 'bg-gray-200'}`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                i < 3 ? 'translate-x-[22px]' : 'translate-x-[2px]'
              }`}
            />
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationSettings;