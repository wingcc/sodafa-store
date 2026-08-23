// app/dashboard/pages/settings/NotificationSettings.tsx
import React, { useEffect, useState } from 'react';
import { useTranslation } from '../../i18n/useTranslation';
import { Bell, Save, Check, Loader2 } from 'lucide-react';
import { getTypeIcon, getTypeClasses, getCategoryLabel } from '../../components/notifications/notificationVisuals';

interface NotificationPreference {
  key: string;
  type: string; // notification type for visuals
  label: string; // detailed — will be shown as description per spec
  description: string;
}

const PREFERENCES: NotificationPreference[] = [
  { key: 'notify_new_orders', type: 'order', label: 'New Order Notifications', description: 'Get notified when a new order is placed' },
  { key: 'notify_low_stock', type: 'inventory', label: 'Low Stock Alerts', description: 'Get notified when inventory is low or out of stock' },
  { key: 'notify_new_reviews', type: 'review', label: 'New Review Notifications', description: 'Get notified when a customer leaves a review' },
  { key: 'notify_payments', type: 'payment', label: 'Payment Alerts', description: 'Get notified about payment issues and completions' },
  { key: 'notify_product', type: 'product', label: 'Product Updates', description: 'New products, restocks and product changes' },
  { key: 'notify_shipping', type: 'shipping', label: 'Shipping Updates', description: 'Shipping status, tracking and delivery updates' },
  { key: 'notify_promotion', type: 'promotion', label: 'Promotion Alerts', description: 'Flash sales, coupons and promotional offers' },
  { key: 'notify_social', type: 'social', label: 'Social Activity', description: 'New followers, social interactions and community updates' },
  { key: 'notify_account', type: 'account', label: 'Account Updates', description: 'Profile updates, password changes and account settings' },
  { key: 'notify_message', type: 'message', label: 'Messages', description: 'Direct messages, chat notifications and replies' },
  { key: 'notify_achievement', type: 'achievement', label: 'Achievements', description: 'Badges, milestones and rewards earned' },
  { key: 'notify_reminder', type: 'reminder', label: 'Reminders', description: 'Scheduled reminders and task alerts' },
  { key: 'notify_subscription', type: 'subscription', label: 'Subscription', description: 'Subscription renewals, upgrades and billing' },
  { key: 'notify_support', type: 'support', label: 'Support Tickets', description: 'Support tickets, responses and resolution updates' },
  { key: 'notify_analytics', type: 'analytics', label: 'Analytics Reports', description: 'Performance reports, insights and data alerts' },
  { key: 'notify_team', type: 'team', label: 'Team Collaboration', description: 'Team mentions, collaboration updates' },
  { key: 'notify_event', type: 'event', label: 'Store Events', description: 'Store events, webinars and campaigns' },
  { key: 'notify_custom', type: 'custom', label: 'Custom Notifications', description: 'Custom and plugin notifications' },
  { key: 'notify_daily_reports', type: 'system', label: 'Daily Sales Report', description: 'Receive a daily summary of sales activity' },
  { key: 'notify_system_errors', type: 'system', label: 'System Error Alerts', description: 'Get notified about critical system errors' },
  { key: 'notify_security_events', type: 'security', label: 'Security Alerts', description: 'Get notified about security-related events' },
  { key: 'notify_new_customers', type: 'social', label: 'New Customer Notifications', description: 'Get notified when a new customer registers' },
];

const NotificationSettings: React.FC = () => {
  const { t } = useTranslation();
  const [preferences, setPreferences] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/notifications/preferences');
      const json = await res.json();
      if (json.success) {
        setPreferences(json.data);
      }
    } catch (err) {
      console.error('Failed to load notification preferences:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (key: string) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaveStatus('idle');
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      const res = await fetch('/api/admin/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });
      const json = await res.json();
      if (json.success) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
      }
    } catch (err) {
      console.error('Failed to save notification preferences:', err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{t('settings.notifications.title')}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{t('settings.notifications.description')}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl font-medium text-sm hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saveStatus === 'success' ? (
            <Check size={16} />
          ) : (
            <Save size={16} />
          )}
          <span className="hidden sm:inline">
            {isSaving ? t('common.saving') : saveStatus === 'success' ? t('common.saved') : t('common.save')}
          </span>
        </button>
      </div>

      <div className="space-y-4">
        {PREFERENCES.map((pref) => {
          const typeClasses = getTypeClasses(pref.type);
          return (
            <div
              key={pref.key}
              className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 rounded-xl px-3 -mx-3 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${typeClasses}`}>
                  {getTypeIcon(pref.type, 16)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{getCategoryLabel(pref.type)}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t(`settings.notifications.preferences.${pref.key}`) !== `settings.notifications.preferences.${pref.key}` ? t(`settings.notifications.preferences.${pref.key}`) : pref.label}</p>
                </div>
              </div>
            <button
              onClick={() => handleToggle(pref.key)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                preferences[pref.key] ? 'bg-purple-500' : 'bg-gray-200'
              }`}
              aria-pressed={preferences[pref.key]}
              aria-label={preferences[pref.key] ? 'Enabled' : 'Disabled'}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  preferences[pref.key] ? 'translate-x-[22px]' : 'translate-x-[2px]'
                }`}
              />
            </button>
          </div>
          );
        })}
      </div>

      {/* Additional Settings */}
      <div className="pt-4 border-t border-gray-100">
        <h4 className="text-sm font-medium text-gray-700 mb-4">{t('settings.notifications.advancedTitle')}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                defaultChecked
              />
              <span className="text-sm text-gray-700">{t('settings.notifications.emailNotifications')}</span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-7">{t('settings.notifications.emailNotificationsDesc')}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                defaultChecked
              />
              <span className="text-sm text-gray-700">{t('settings.notifications.pushNotifications')}</span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-7">{t('settings.notifications.pushNotificationsDesc')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;