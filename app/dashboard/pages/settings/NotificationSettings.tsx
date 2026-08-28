// app/dashboard/pages/settings/NotificationSettings.tsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useTranslation } from '../../i18n/useTranslation';
import {
  Bell, Save, Check, Loader2, Send,
  ChevronDown, Sparkles, ShoppingBag,
  Clock, CheckCircle2, Cog, Truck, PackageCheck, XCircle, RotateCcw, RefreshCw, Layers
} from 'lucide-react';
import { getTypeIcon, getTypeClasses, getCategoryLabel } from '../../components/notifications/notificationVisuals';

// ── Base preferences (non-order) ─────────────────────────────────────
interface NotificationPreference {
  key: string;
  type: string;
  label: string;
  description: string;
}

const BASE_PREFERENCES: NotificationPreference[] = [
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

// ── Order sub-notifications — each has own icon/color via notificationVisuals helpers ──
interface OrderSub {
  key: string;
  status: string | null; // null = new order
  label: string;
  description: string;
}

const ORDER_SUBS: OrderSub[] = [
  { key: 'notify_new_orders', status: null, label: 'New Order', description: 'A brand new order lands — Shopper + total' },
  { key: 'notify_order_pending', status: 'pending', label: 'Pending', description: 'Order created, awaiting confirmation' },
  { key: 'notify_order_confirmed', status: 'confirmed', label: 'Confirmed', description: 'Merchant confirmed the order' },
  { key: 'notify_order_processing', status: 'processing', label: 'Processing', description: 'Picking & packing in progress' },
  { key: 'notify_order_shipped', status: 'shipped', label: 'Shipped', description: 'Handed to courier — tracking live' },
  { key: 'notify_order_delivered', status: 'delivered', label: 'Delivered', description: 'Customer received the package' },
  { key: 'notify_order_cancelled', status: 'cancelled', label: 'Cancelled', description: 'Order cancelled by customer or admin' },
  { key: 'notify_order_refunded', status: 'refunded', label: 'Refunded', description: 'Refund issued for order' },
];

const ORDER_FLOW = [
  { status: 'pending', icon: Clock },
  { status: 'confirmed', icon: CheckCircle2 },
  { status: 'processing', icon: Cog },
  { status: 'shipped', icon: Truck },
  { status: 'delivered', icon: PackageCheck },
];

const TESTABLE_TYPES = new Set(['order', 'inventory', 'customer', 'review', 'payment', 'promotion', 'shipping', 'product', 'system', 'security']);

// ── Reusable Toggle — large hit-area, consistent design, a11y ──────────
const Toggle: React.FC<{ checked: boolean; onChange: () => void; label?: string; size?: 'sm' | 'md'; disabled?: boolean }> = ({ checked, onChange, label, size = 'md', disabled }) => {
  const isSm = size === 'sm';
  return (
    <span className="inline-flex items-center justify-center p-1.5 -m-1.5 shrink-0">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={(e) => { e.stopPropagation(); onChange(); }}
        className={`relative inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-darkGreen)] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation ${
          checked ? 'bg-[var(--color-darkGreen)] shadow-inner' : 'bg-gray-200 hover:bg-gray-300'
        } ${isSm ? 'h-5 w-9 p-0.5' : 'h-6 w-11 p-0.5'}`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${isSm ? 'h-4 w-4' : 'h-5 w-5'} ${checked ? (isSm ? 'translate-x-4' : 'translate-x-5') : 'translate-x-0'}`}
        />
      </button>
    </span>
  );
};

const NotificationSettings: React.FC = () => {
  const { t } = useTranslation();
  const [preferences, setPreferences] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [testingKey, setTestingKey] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ key: string; ok: boolean; message: string } | null>(null);
  const [orderExpanded, setOrderExpanded] = useState(true);

  useEffect(() => { loadPreferences(); }, []);

  const loadPreferences = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/notifications/preferences');
      const json = await res.json();
      if (json.success) setPreferences(json.data);
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

  // Order group: master toggle sets all 8
  const orderKeys = useMemo(() => ORDER_SUBS.map(s => s.key), []);
  const orderEnabledCount = useMemo(() => orderKeys.filter(k => preferences[k] !== false).length, [preferences, orderKeys]);
  const allOrderEnabled = orderEnabledCount === orderKeys.length;
  const someOrderEnabled = orderEnabledCount > 0 && orderEnabledCount < orderKeys.length;

  const handleOrderMasterToggle = () => {
    const next = !allOrderEnabled;
    setPreferences(prev => {
      const n = { ...prev };
      orderKeys.forEach(k => n[k] = next);
      return n;
    });
    setSaveStatus('idle');
  };

  const handleOrderSubToggle = (key: string) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
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
      } else setSaveStatus('error');
    } catch (err) {
      console.error('Failed to save notification preferences:', err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = useCallback(async (prefKey: string) => {
    setTestingKey(prefKey);
    setTestResult(null);
    try {
      const res = await fetch('/api/test-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferenceKey: prefKey }),
      });
      const json = await res.json();
      if (json.success && json.results?.length > 0) {
        const msg = json.results[0];
        const ok = msg.startsWith('✅');
        setTestResult({ key: prefKey, ok, message: ok ? 'Sent!' : msg.replace(/^[⚠️❌]\s*/, '') });
      } else {
        setTestResult({ key: prefKey, ok: false, message: json.error ?? 'No test available for this type' });
      }
    } catch {
      setTestResult({ key: prefKey, ok: false, message: 'Network error' });
    } finally {
      setTestingKey(null);
      setTimeout(() => setTestResult(null), 3000);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-darkGreen)]" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
      {/* Header — sticky save action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--color-darkGreen)] to-[var(--color-mediumGreen)] grid place-items-center text-white shadow-sm">
              <Bell size={14} />
            </span>
            {t('settings.notifications.title')}
          </h3>
          <p className="text-sm text-gray-500 mt-1">{t('settings.notifications.description')}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white rounded-xl transition-all hover:shadow-lg disabled:opacity-50 shrink-0"
          style={{ background: 'linear-gradient(135deg, var(--color-darkGreen), var(--color-mediumGreen))' }}
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : saveStatus === 'success' ? <Check size={16} /> : <Save size={16} />}
          <span>{isSaving ? t('common.saving') : saveStatus === 'success' ? t('common.saved') : t('common.save')}</span>
          {saveStatus === 'success' && <span className="ml-1 w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />}
        </button>
      </div>

      {/* ── Orders — expandable premium card ─────────────────────────── */}
      <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
        {/* Card header — clickable */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setOrderExpanded(v => !v)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOrderExpanded(v => !v); }}}
          className="flex items-center gap-4 p-4 sm:p-5 cursor-pointer hover:bg-gray-50/60 transition-colors group"
        >
          <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${getTypeClasses('order')}`}>
            <ShoppingBag size={18} />
          </div>

          <div className="flex-1 min-w-0 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-gray-900">Orders</p>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${allOrderEnabled ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : someOrderEnabled ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                {orderEnabledCount}/{orderKeys.length} on
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-gray-400">
                <Layers size={11} /> 8 notification types
              </span>
              {someOrderEnabled && <span className="text-[11px] text-amber-600 hidden sm:inline">• partial</span>}
            </div>
            <p className="text-xs text-gray-500 mt-1 line-clamp-1">New orders &amp; every status change — each with its own icon and color</p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Master toggle — same Toggle component as elsewhere */}
            <span onClick={e => e.stopPropagation()}>
              <Toggle
                checked={allOrderEnabled}
                onChange={handleOrderMasterToggle}
                label={allOrderEnabled ? 'Disable all order notifications' : 'Enable all order notifications'}
                size="md"
              />
            </span>
            {someOrderEnabled && !allOrderEnabled && (
              <span className="hidden sm:inline text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">partial</span>
            )}
            <button
              type="button"
              aria-expanded={orderExpanded}
              aria-label={orderExpanded ? 'Collapse order notifications' : 'Expand order notifications'}
              onClick={(e) => { e.stopPropagation(); setOrderExpanded(v => !v); }}
              className="w-8 h-8 rounded-xl border bg-white grid place-items-center hover:bg-gray-50 hover:border-gray-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-darkGreen)] focus-visible:ring-offset-1 shrink-0 touch-manipulation"
            >
              <ChevronDown size={16} className={`text-gray-500 transition-transform duration-200 ${orderExpanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Expandable body */}
        <div className={`grid transition-all duration-300 ease-in-out ${orderExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
          <div className="overflow-hidden">
            <div className="border-t border-gray-100 bg-gradient-to-br from-slate-50/70 via-white to-indigo-50/30 p-4 sm:p-5 space-y-4">
              {/* subtle header + quick actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <Sparkles size={12} className="text-indigo-500" />
                  Fine-tune which order moments notify you. Each sub-type has a distinct icon — same as the notification center.
                </p>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setPreferences(prev => { const n={...prev}; orderKeys.forEach(k=>n[k]=true); return n; });
                      setSaveStatus('idle');
                    }}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg border bg-white hover:bg-gray-50 text-gray-700 border-gray-200 transition-colors"
                  >
                    Enable all
                  </button>
                  <button
                    onClick={() => {
                      setPreferences(prev => { const n={...prev}; orderKeys.forEach(k=>n[k]=false); return n; });
                      setSaveStatus('idle');
                    }}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg border bg-white hover:bg-red-50 text-gray-600 hover:text-red-600 border-gray-200 hover:border-red-200 transition-colors"
                  >
                    Disable all
                  </button>
                </div>
              </div>

              {/* Order flow timeline — same pill design for ALL states (cancelled/refund included) */}
              <div className="rounded-xl bg-white border border-gray-100 p-3 shadow-sm">
                <p className="text-[11px] font-semibold tracking-widest uppercase text-gray-400 mb-2.5 flex items-center gap-1.5">
                  <RefreshCw size={11} /> Order lifecycle
                </p>
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
                  {ORDER_FLOW.map((step, idx) => {
                    const isEnabled = preferences[`notify_order_${step.status}`] !== false;
                    const classes = getTypeClasses('order', { metadata: { status: step.status } });
                    const Icon = step.icon;
                    return (
                      <React.Fragment key={step.status}>
                        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-medium whitespace-nowrap transition-all ${isEnabled ? classes + ' shadow-sm' : 'bg-gray-50 text-gray-400 border-gray-200 opacity-60'}`}>
                          <Icon size={12} />
                          <span className="capitalize">{step.status}</span>
                        </div>
                        {idx < ORDER_FLOW.length - 1 && (
                          <span className={`shrink-0 w-6 h-px ${isEnabled ? 'bg-gray-300' : 'bg-gray-200'}`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                  <span className="shrink-0 w-6 h-px bg-gray-200" />
                  {(['cancelled','refunded'] as const).map((status) => {
                    const isEnabled = preferences[`notify_order_${status}`] !== false;
                    const classes = getTypeClasses('order', { metadata: { status } });
                    const Icon = status === 'cancelled' ? XCircle : RotateCcw;
                    return (
                      <div key={status} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-medium whitespace-nowrap transition-all ${isEnabled ? classes + ' shadow-sm' : 'bg-gray-50 text-gray-400 border-gray-200 opacity-60'}`}>
                        <Icon size={12} />
                        <span className="capitalize">{status}</span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[11px] text-gray-400 mt-2">Tip: disable noisy steps like <em>pending</em> but keep <em>shipped / delivered / cancelled</em> for ops.</p>
              </div>

              {/* Sub notifications grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ORDER_SUBS.map(sub => {
                  const enabled = preferences[sub.key] !== false;
                  const visualOpts = sub.status ? { metadata: { status: sub.status } } : undefined;
                  const iconClasses = getTypeClasses('order', visualOpts as any);
                  const isTestable = true; // all order subs are testable via order type
                  const isTesting = testingKey === sub.key;
                  const result = testResult?.key === sub.key ? testResult : null;

                  return (
                    <div
                      key={sub.key}
                      className={`group relative flex items-center gap-3 p-3.5 rounded-xl border bg-white transition-all hover:shadow-sm ${enabled ? 'border-gray-200 hover:border-gray-300' : 'border-gray-200 bg-gray-50/70 opacity-90'}`}
                    >
                      {/* Hover accent line */}
                      <div className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full transition-colors ${enabled ? 'bg-[var(--color-darkGreen)] opacity-80' : 'bg-gray-300 opacity-40'}`} />

                      <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ml-1 ${enabled ? iconClasses : 'bg-white text-gray-400 border-gray-200'}`}>
                        {getTypeIcon('order', 15, visualOpts as any)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium leading-tight ${enabled ? 'text-gray-900' : 'text-gray-500'}`}>{sub.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{sub.description}</p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {isTestable && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleTest(sub.key); }}
                            disabled={isTesting}
                            className="w-7 h-7 rounded-lg border grid place-items-center transition-colors disabled:opacity-50 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-darkGreen)] focus-visible:ring-offset-1 touch-manipulation"
                            style={{
                              borderColor: result ? (result.ok ? '#10B981' : '#EF4444') : '#e5e7eb',
                              color: result ? (result.ok ? '#10B981' : '#EF4444') : '#6b7280',
                              background: result ? (result.ok ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)') : 'white',
                            }}
                            title={`Test ${sub.label}`}
                            aria-label={`Test ${sub.label} notification`}
                          >
                            {isTesting ? <Loader2 size={11} className="animate-spin" /> : result ? (result.ok ? <Check size={11} /> : <span className="text-[10px]">!</span>) : <Send size={11} />}
                          </button>
                        )}
                        <Toggle checked={enabled} onChange={() => handleOrderSubToggle(sub.key)} label={`${sub.label} ${enabled ? 'enabled' : 'disabled'}`} size="sm" />
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-[11px] text-gray-400 flex items-center gap-1">
                <Bell size={11} /> Changes apply after you click <span className="font-medium text-gray-600">Save</span>. Disabled types won’t create new notifications but existing ones remain visible.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Other notification types — clean list ────────────────── */}
      <div className="space-y-2">
        <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 px-1 flex items-center gap-1.5">
          <Sparkles size={12} className="text-gray-400" /> Other notifications
        </p>
        <div className="rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-100 bg-white">
          {BASE_PREFERENCES.map((pref) => {
            const typeClasses = getTypeClasses(pref.type);
            const isTestable = TESTABLE_TYPES.has(pref.type);
            const isTesting = testingKey === pref.key;
            const result = testResult?.key === pref.key ? testResult : null;
            const enabled = preferences[pref.key] !== false;

            return (
              <div
                key={pref.key}
                className={`flex items-center justify-between py-3.5 px-4 hover:bg-gray-50/60 transition-colors ${!enabled ? 'opacity-80' : ''}`}
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${enabled ? typeClasses : 'bg-white text-gray-400 border-gray-200'}`}>
                    {getTypeIcon(pref.type, 15)}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-medium truncate ${enabled ? 'text-gray-900' : 'text-gray-500'}`}>{getCategoryLabel(pref.type)}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{t(`settings.notifications.preferences.${pref.key}`) !== `settings.notifications.preferences.${pref.key}` ? t(`settings.notifications.preferences.${pref.key}`) : pref.label}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  {isTestable && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleTest(pref.key); }}
                      disabled={isTesting}
                      className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all disabled:opacity-50 bg-white hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-darkGreen)] focus-visible:ring-offset-1 touch-manipulation"
                      style={{
                        borderColor: result ? (result.ok ? '#10B981' : '#EF4444') : '#e5e7eb',
                        color: result ? (result.ok ? '#10B981' : '#EF4444') : '#374151',
                      }}
                    >
                      {isTesting ? <Loader2 size={12} className="animate-spin" /> : result ? (result.ok ? <Check size={12} /> : <span className="text-[11px]">!</span>) : <Send size={12} />}
                      <span>{isTesting ? 'Sending…' : result ? result.message : 'Test'}</span>
                    </button>
                  )}
                  {/* mobile test icon */}
                  {isTestable && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleTest(pref.key); }}
                      disabled={isTesting}
                      className="sm:hidden w-7 h-7 rounded-lg border bg-white grid place-items-center hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-darkGreen)] touch-manipulation"
                      style={{ borderColor: result ? (result.ok ? '#10B981' : '#EF4444') : '#e5e7eb', color: result ? (result.ok ? '#10B981' : '#EF4444') : '#6b7280' }}
                      aria-label={`Test ${pref.label}`}
                    >
                      {isTesting ? <Loader2 size={11} className="animate-spin" /> : <Send size={11} />}
                    </button>
                  )}
                  <Toggle checked={enabled} onChange={() => handleToggle(pref.key)} label={`${pref.label} ${enabled ? 'enabled' : 'disabled'}`} size="md" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Additional Settings */}
      <div className="pt-4 border-t border-gray-100">
        <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-gray-100 border border-gray-200 grid place-items-center text-gray-500">
            <Bell size={12} />
          </span>
          {t('settings.notifications.advancedTitle')}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:bg-white hover:shadow-sm transition-all">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[var(--color-darkGreen)] focus:ring-[var(--color-darkGreen)]" defaultChecked />
              <span className="text-sm text-gray-700 font-medium">{t('settings.notifications.emailNotifications')}</span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-7">{t('settings.notifications.emailNotificationsDesc')}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:bg-white hover:shadow-sm transition-all">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[var(--color-darkGreen)] focus:ring-[var(--color-darkGreen)]" defaultChecked />
              <span className="text-sm text-gray-700 font-medium">{t('settings.notifications.pushNotifications')}</span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-7">{t('settings.notifications.pushNotificationsDesc')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
