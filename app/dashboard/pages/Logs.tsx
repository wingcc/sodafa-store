'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Search, RefreshCw, ScrollText, ShoppingCart, Package, Users, CreditCard, Star, Settings2, Copy, ExternalLink, ChevronDown, ChevronUp, Clock, AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';
import AnalyticsInfoButton from './Analytic/analytics/AnalyticsInfoButton';

type LogCategory = 'all' | 'orders' | 'products' | 'customers' | 'payments' | 'inventory' | 'reviews' | 'users' | 'system';
type LogSeverity = 'info' | 'success' | 'warning' | 'error' | 'critical';

interface ActivityLog {
  id: string;
  category: LogCategory;
  type: string;
  title: string;
  description: string;
  user?: string;
  timestamp: string;
  entity?: string;
  entityId?: string;
  status?: string;
  severity: LogSeverity;
  metadata?: Record<string, any>;
}

const categoryIcons: Record<string, React.ReactNode> = {
  orders: <ShoppingCart size={14} />,
  products: <Package size={14} />,
  customers: <Users size={14} />,
  payments: <CreditCard size={14} />,
  reviews: <Star size={14} />,
  system: <Settings2 size={14} />,
  inventory: <Package size={14} />,
  users: <Users size={14} />,
};

const severityConfig: Record<LogSeverity, { bg: string; text: string; icon: React.ReactNode; label: string }> = {
  info: { bg: 'bg-sky-50 dark:bg-sky-500/10 border-sky-100 dark:border-sky-500/15', text: 'text-sky-700 dark:text-sky-300', icon: <Info size={12} />, label: 'Info' },
  success: { bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/15', text: 'text-emerald-700 dark:text-emerald-300', icon: <CheckCircle2 size={12} />, label: 'Success' },
  warning: { bg: 'bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/15', text: 'text-amber-700 dark:text-amber-300', icon: <AlertTriangle size={12} />, label: 'Warning' },
  error: { bg: 'bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/15', text: 'text-red-700 dark:text-red-300', icon: <AlertCircle size={12} />, label: 'Error' },
  critical: { bg: 'bg-red-100 dark:bg-red-500/20 border-red-200 dark:border-red-500/25', text: 'text-red-800 dark:text-red-200', icon: <AlertCircle size={12} />, label: 'Critical' },
};

const Logs: React.FC = () => {
  const { t, language } = useTranslation();
  const isAr = language === 'ar';
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<LogCategory>('all');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/activity?limit=100');
      const json = await res.json();
      if (json.success) setLogs(json.data);
      else {
        // Fallback: generate from notifications + orders if api not ready
        const nRes = await fetch('/api/admin/notifications?limit=50').then(r => r.json()).catch(() => ({ data: [] }));
        const oRes = await fetch('/api/orders?limit=50').then(r => r.json()).catch(() => ({ data: [] }));
        const fallback: ActivityLog[] = [
          ...(nRes.data || []).slice(0, 20).map((n: any) => ({
            id: `n-${n.id}`, category: n.type === 'order' ? 'orders' : n.type === 'product' ? 'products' : n.type === 'payment' ? 'payments' : 'system' as LogCategory,
            type: n.type, title: n.title, description: n.message, user: 'System', timestamp: n.timestamp || n.created_at, entity: n.type, entityId: n.id, severity: n.priority === 'urgent' ? 'critical' : n.priority === 'high' ? 'warning' : 'info' as LogSeverity, metadata: n.metadata,
          })),
          ...(oRes.data || oRes.orders || []).slice(0, 20).map((o: any) => ({
            id: `o-${o.id}`, category: 'orders' as LogCategory, type: 'order_created', title: isAr ? `طلب جديد ${o.order_number}` : `Order Created ${o.order_number}`, description: `${o.customer_name || 'Customer'} • ${o.total} MAD`, user: o.customer_name || 'Customer', timestamp: o.created_at, entity: 'Order', entityId: o.order_number, status: o.order_status, severity: 'success' as LogSeverity, metadata: { amount: o.total, payment: o.payment_status },
          })),
        ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setLogs(fallback);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchLogs(); }, []);

  const filtered = useMemo(() => {
    return logs.filter(l => {
      if (filter !== 'all' && l.category !== filter) return false;
      if (search && !`${l.title} ${l.description} ${l.entityId || ''}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [logs, filter, search]);

  const paged = filtered.slice(0, page * pageSize);
  const hasMore = filtered.length > paged.length;

  const copyRef = (id: string) => { navigator.clipboard?.writeText(id); };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/10 animate-pulse" />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-24 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/10 animate-pulse p-4">
            <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-32 mb-2" />
            <div className="h-3 bg-gray-100 dark:bg-white/5 rounded w-64" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: 'var(--color-darkGreen, #047857)' }}>
            <ScrollText size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('logs.title')}</h2>
              <AnalyticsInfoButton title={t('logs.infoTitle')} description={t('logs.infoDesc')} />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('logs.subtitle')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchLogs} className="p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/10 p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('logs.searchPlaceholder')} className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-darkGreen)]/20" />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {(['all','orders','products','customers','payments','inventory','reviews','system'] as LogCategory[]).map(cat => (
              <button key={cat} onClick={() => { setFilter(cat); setPage(1); }} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border ${filter === cat ? 'bg-[var(--color-darkGreen, #047857)] text-white border-[var(--color-darkGreen, #047857)]' : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:bg-gray-50'}`}>
                {t(`logs.filter${cat.charAt(0).toUpperCase() + cat.slice(1)}` as any) || cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
        {paged.length === 0 ? (
          <div className="py-16 text-center">
            <ScrollText size={32} className="mx-auto text-gray-300 dark:text-white/20" />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{t('logs.noLogs')}</p>
            <p className="text-xs text-gray-400 dark:text-white/30 mt-1">Data sources: orders, products, notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-white/5">
            {paged.map(log => {
              const sev = severityConfig[log.severity] || severityConfig.info;
              const isExpanded = expanded === log.id;
              return (
                <div key={log.id} className="p-4 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                  <div className="flex gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${sev.bg} ${sev.text}`}>
                      {categoryIcons[log.category] || <Info size={14} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{log.title}</h4>
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${sev.bg} ${sev.text}`}>
                          {sev.icon} {sev.label}
                        </span>
                        {log.status && <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10">{log.status}</span>}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 leading-5">{log.description}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        {log.user && <span>{isAr ? 'المستخدم:' : 'User:'} {log.user}</span>}
                        {log.entity && <span>{log.entity} {log.entityId && `• ${log.entityId}`}</span>}
                        <span className="inline-flex items-center gap-1"><Clock size={12} /> {new Date(log.timestamp).toLocaleString(isAr ? 'ar-MA' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mt-3">
                        <button onClick={() => setExpanded(isExpanded ? null : log.id)} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50">
                          {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />} {isExpanded ? t('logs.hideDetails') : t('logs.showDetails')}
                        </button>
                        {log.entityId && (
                          <button onClick={() => copyRef(log.entityId!)} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-600 dark:text-gray-300">
                            <Copy size={12} /> {t('logs.copyRef')}
                          </button>
                        )}
                      </div>

                      {isExpanded && (
                        <div className="mt-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div><span className="text-gray-400">Action:</span> <span className="font-medium text-gray-900 dark:text-white ml-1">{log.type}</span></div>
                            <div><span className="text-gray-400">Category:</span> <span className="font-medium text-gray-900 dark:text-white ml-1">{log.category}</span></div>
                            <div><span className="text-gray-400">Time:</span> <span className="font-medium text-gray-900 dark:text-white ml-1">{new Date(log.timestamp).toLocaleString()}</span></div>
                            <div><span className="text-gray-400">User:</span> <span className="font-medium text-gray-900 dark:text-white ml-1">{log.user || '—'}</span></div>
                            {log.entity && <div><span className="text-gray-400">Entity:</span> <span className="font-medium text-gray-900 dark:text-white ml-1">{log.entity} {log.entityId}</span></div>}
                            {log.status && <div><span className="text-gray-400">Status:</span> <span className="font-medium text-gray-900 dark:text-white ml-1">{log.status}</span></div>}
                          </div>
                          {log.metadata && (
                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-white/10">
                              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Changes / Metadata</p>
                              <pre className="text-xs bg-white dark:bg-black/20 rounded-lg p-2.5 overflow-auto max-h-40 border border-gray-100 dark:border-white/5 text-gray-700 dark:text-gray-300">{JSON.stringify(log.metadata, null, 2)}</pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {hasMore && (
          <div className="p-4 text-center border-t border-gray-100 dark:border-white/5">
            <button onClick={() => setPage(p => p + 1)} className="px-4 py-2 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50">
              {t('logs.loadMore')} ({filtered.length - paged.length} {isAr ? 'متبقي' : 'remaining'})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Logs;
