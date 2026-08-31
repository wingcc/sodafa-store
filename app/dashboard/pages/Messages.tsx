'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Mail,
  Search,
  Star,
  Trash2,
  Archive,
  MessageSquare,
  Phone,
  AtSign,
  Clock,
  BadgeCheck,
  UsersRound,
  Inbox,
  Eye,
  Reply,
  CheckCheck,
  Check,
  X,
  MoreHorizontal,
  Sparkles,
  Loader2,
  MailOpen,
  UserCheck,
  Filter,
  ArrowUpDown,
  Copy,
  ExternalLink,
  ShieldCheck,
  Crown,
  Heart,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RefreshButton from '../components/ui/RefreshButton';
import { useStore } from '../store/useStore';
import { usePreferencesStore } from '../store/usePreferencesStore';
import { useToast } from '@/lib/toast';
import { useTranslation } from '../i18n/useTranslation';
import type { ContactMessage } from '../types';

// ── Helpers ─────────────────────────────────────────────────────
function getTimeAgo(input: string): string {
  const d = new Date(input);
  if (isNaN(d.getTime())) return '';
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
function statusMeta(status: string) {
  const map: Record<string, { label: string; dot: string; badge: string }> = {
    new: { label: 'New', dot: 'bg-blue-500', badge: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300' },
    read: { label: 'Read', dot: 'bg-amber-500', badge: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300' },
    replied: { label: 'Replied', dot: 'bg-emerald-500', badge: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300' },
    archived: { label: 'Archived', dot: 'bg-gray-400', badge: 'border-gray-200 bg-gray-50 text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-400' },
  };
  return map[status] ?? map.new;
}

// ── Component ───────────────────────────────────────────────────
const Messages: React.FC = () => {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const theme = usePreferencesStore((s) => s.theme);
  const accentColor = `var(--color-accent-${theme === 'dark' ? 'dark' : 'light'}, #d97706)`;

  // store
  const messages = useStore((s) => s.messages);
  const counts = useStore((s) => s.messageCounts);
  const isLoading = useStore((s) => s.isLoadingMessages);
  const hasMore = useStore((s) => s.hasMoreMessages);
  const fetchMessages = useStore((s) => s.fetchMessages);
  const fetchCounts = useStore((s) => s.fetchMessageCounts);
  const deleteMessage = useStore((s) => s.deleteMessage);
  const toggleStarMessage = useStore((s) => s.toggleStarMessage);
  const updateMessageStatus = useStore((s) => s.updateMessageStatus);
  const bulkDeleteMessages = useStore((s) => s.bulkDeleteMessages);
  const bulkUpdateMessages = useStore((s) => s.bulkUpdateMessages);
  const markAllMessagesRead = useStore((s) => s.markAllMessagesRead);
  const loadMoreMessages = useStore((s) => s.loadMoreMessages);

  // local UI
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showActionsFor, setShowActionsFor] = useState<string | null>(null);

  // debounce search into fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMessages({ status: activeStatus === 'all' ? undefined : activeStatus, search: searchQuery || undefined, sortBy, limit: 20, offset: 0 });
    }, searchQuery ? 400 : 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStatus, searchQuery, sortBy]);

  // initial
  useEffect(() => {
    fetchMessages({ limit: 20, offset: 0 });
    fetchCounts();
  }, [fetchMessages, fetchCounts]);

  const filtered = useMemo(() => {
    return [...messages].sort((a, b) => {
      const da = new Date(a.created_at).getTime();
      const db = new Date(b.created_at).getTime();
      return sortBy === 'oldest' ? da - db : db - da;
    });
  }, [messages, sortBy]);

  const selectedMessage = useMemo(() => filtered.find((m) => m.id === selectedId) ?? null, [filtered, selectedId]);

  // auto-select first on load (desktop)
  useEffect(() => {
    if (!selectedId && filtered.length > 0 && window.innerWidth >= 1024) {
      setSelectedId(filtered[0].id);
    }
  }, [filtered, selectedId]);

  const handleSelect = useCallback((msg: ContactMessage) => {
    setSelectedId(msg.id);
    if (msg.status === 'new') {
      updateMessageStatus(msg.id, 'read').catch(() => {});
    }
  }, [updateMessageStatus]);

  const handleRefresh = () => {
    fetchMessages({ status: activeStatus === 'all' ? undefined : activeStatus, search: searchQuery || undefined, sortBy, limit: 20, offset: 0 });
    fetchCounts();
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    addToast('success', `${label} copied`);
  };

  const handleViewCustomer = (msg: ContactMessage) => {
    const q = msg.name || msg.email || msg.phone;
    useStore.getState().setPendingNavigation({ page: 'customers', searchQuery: q, action: 'open' });
    useStore.getState().setCurrentPage('customers');
  };

  const waUrl = (msg: ContactMessage) => {
    const digits = msg.phone.replace(/\D/g, '');
    const text = encodeURIComponent(`مرحبا ${msg.name}، شكراً لتواصلك مع SODFA — بخصوص رسالتك: "${msg.message.slice(0, 100)}..."`);
    return `https://wa.me/${digits}?text=${text}`;
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllMessagesRead();
      addToast('success', 'All new messages marked as read');
    } catch { addToast('error', 'Failed to update'); }
  };

  // bulk
  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const toggleSelectAll = () => {
    setSelectedIds((prev) => (prev.size === filtered.length ? new Set() : new Set(filtered.map((m) => m.id))));
  };

  if (isLoading && messages.length === 0) {
    return (
      <div className="space-y-6 p-4 md:p-6 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-[var(--dashboard-bg-dark,#0f1411)] dark:via-[var(--dashboard-bg-dark,#0f1411)] dark:to-[var(--dashboard-bg-dark,#0f1411)] min-h-screen animate-pulse">
        <div className="h-20 bg-slate-200 dark:bg-white/10 rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          {[1,2,3,4,5,6].map(i=> <div key={i} className="h-24 bg-slate-200 dark:bg-white/10 rounded-2xl" />)}
        </div>
        <div className="h-96 bg-slate-200 dark:bg-white/10 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-[var(--dashboard-bg-dark,#0f1411)] dark:via-[var(--dashboard-bg-dark,#0f1411)] dark:to-[var(--dashboard-bg-dark,#0f1411)] min-h-screen">
      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg text-white relative shrink-0" style={{ background: accentColor, boxShadow: `0 8px 20px color-mix(in srgb, ${accentColor} 30%, transparent)` }}>
            <Mail className="w-5 h-5 text-white" />
            {counts.newCount > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-[var(--dashboard-card-dark)] animate-pulse" />}
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent flex items-center gap-2">
              Messages
              <span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold" style={{ background: `color-mix(in srgb, ${accentColor} 10%, white)`, borderColor: `color-mix(in srgb, ${accentColor} 15%, transparent)`, color: accentColor }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accentColor }} />
                Inbox
              </span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
              <Sparkles size={12} className="text-blue-500" /> {counts.total} total · {counts.newCount} new · reply fast, never miss a lead
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <RefreshButton onRefresh={handleRefresh} isLoading={isLoading} size="md" variant="default" />
          <button
            onClick={() => { setSelectMode(v=>!v); setSelectedIds(new Set()); }}
            className={`px-3.5 py-2 rounded-xl text-sm font-medium border transition flex items-center gap-1.5 ${!selectMode ? 'bg-white dark:bg-[var(--dashboard-card-dark)] border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5' : ''}`}
            style={selectMode ? { background: accentColor, color: 'white', borderColor: accentColor, boxShadow: `0 4px 12px color-mix(in srgb, ${accentColor} 25%, transparent)` } : {}}
          >
            <CheckCheck size={16} /> {selectMode ? 'Done' : 'Select'}
          </button>
          {counts.newCount > 0 && (
            <button onClick={handleMarkAllRead} className="px-3.5 py-2 rounded-xl text-sm font-semibold text-white transition flex items-center gap-1.5 shadow-sm hover:opacity-90 active:scale-95" style={{ background: accentColor }}>
              <MailOpen size={16} /> Mark all read
            </button>
          )}
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {[
          { key: 'total', label: 'Total', value: counts.total, icon: <Inbox size={16} className="text-slate-400" />, accentText: 'text-slate-800 dark:text-slate-100' },
          { key: 'new', label: 'New', value: counts.newCount, icon: <Sparkles size={16} className="text-blue-500" />, accentText: 'text-blue-600 dark:text-blue-400', pulse: counts.newCount>0 },
          { key: 'read', label: 'Read', value: counts.read, icon: <Eye size={16} className="text-amber-500" />, accentText: 'text-amber-600 dark:text-amber-400' },
          { key: 'replied', label: 'Replied', value: counts.replied, icon: <Reply size={16} className="text-emerald-500" />, accentText: 'text-emerald-600 dark:text-emerald-400' },
          { key: 'starred', label: 'Starred', value: counts.starred, icon: <Star size={16} className="text-amber-500" />, accentText: 'text-amber-600 dark:text-amber-400' },
          { key: 'customers', label: 'Customers', value: counts.customer, icon: <UserCheck size={16} className="text-violet-500" />, accentText: 'text-violet-600 dark:text-violet-400' },
        ].map((s) => (
          <div key={s.key} className="relative overflow-hidden bg-white dark:bg-[var(--dashboard-card-dark,#161d2b)] rounded-2xl border border-slate-200/60 dark:border-[var(--dashboard-card-border-dark,rgba(255,255,255,0.08))] p-4 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{s.label}</span>
              <span className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center">{s.icon}</span>
            </div>
            <div className={`text-2xl font-extrabold tracking-tight mt-2 ${s.accentText}`}>{s.value}</div>
            {s.pulse && <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow shadow-blue-300" />}
            {s.key==='total' && <div className="absolute inset-0 opacity-[0.04] rounded-2xl pointer-events-none" style={{ background: `linear-gradient(135deg, ${accentColor}, transparent)` }} />}
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="bg-white dark:bg-[var(--dashboard-card-dark,#161d2b)] rounded-2xl border border-slate-200/60 dark:border-[var(--dashboard-card-border-dark,rgba(255,255,255,0.08))] p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, phone, email or message..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:ring-blue-500/20"
              style={{ ['--tw-ring-color' as any]: `color-mix(in srgb, ${accentColor} 20%, transparent)` } as any}
              onFocus={(e) => { e.currentTarget.style.borderColor = `color-mix(in srgb, ${accentColor} 40%, transparent)`; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = ''; }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400">
                <X size={14} />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center bg-slate-100 dark:bg-white/5 rounded-xl p-1 border border-slate-200/50 dark:border-white/5">
              <button onClick={() => setSortBy('newest')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${sortBy==='newest' ? 'bg-white dark:bg-[var(--dashboard-card-dark)] shadow text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-white/10' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>Newest</button>
              <button onClick={() => setSortBy('oldest')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${sortBy==='oldest' ? 'bg-white dark:bg-[var(--dashboard-card-dark)] shadow text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-white/10' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>Oldest</button>
            </div>
            <button onClick={() => setSortBy(s=> s==='newest' ? 'oldest' : 'newest')} className="sm:hidden p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300">
              <ArrowUpDown size={16} />
            </button>
          </div>
        </div>

        {/* status pills */}
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'All', count: counts.total },
            { id: 'new', label: 'New', count: counts.newCount, dot: 'bg-blue-500' },
            { id: 'read', label: 'Read', count: counts.read, dot: 'bg-amber-500' },
            { id: 'replied', label: 'Replied', count: counts.replied, dot: 'bg-emerald-500' },
            { id: 'archived', label: 'Archived', count: counts.archived, dot: 'bg-slate-400' },
            { id: 'starred', label: 'Starred', count: counts.starred, dot: 'bg-amber-500' },
            { id: 'customer', label: 'Customers', count: counts.customer, dot: 'bg-violet-500' },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setActiveStatus(p.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-semibold border whitespace-nowrap transition-all ${
                activeStatus===p.id
                  ? 'text-white shadow-sm border-transparent'
                  : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
              style={activeStatus===p.id ? { background: accentColor, borderColor: accentColor } : {}}
            >
              {p.dot && <span className={`w-2 h-2 rounded-full ${p.dot}`} style={activeStatus===p.id ? { background: 'white'} : {}} />}
              {p.label}
              <span className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${activeStatus===p.id ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300'}`}>{p.count}</span>
            </button>
          ))}
        </div>

        {/* bulk bar */}
        {selectMode && (
          <div className="mt-3 flex flex-wrap items-center gap-2 p-3 rounded-xl text-white shadow-sm" style={{ background: accentColor }}>
            <label className="flex items-center gap-2 text-sm font-medium px-2 cursor-pointer">
              <input type="checkbox" checked={selectedIds.size===filtered.length && filtered.length>0} onChange={toggleSelectAll} className="rounded border-white/30 text-white focus:ring-white/30" />
              {selectedIds.size}/{filtered.length} selected
            </label>
            <div className="h-6 w-px bg-white/20 hidden sm:block" />
            <div className="flex items-center gap-1 flex-wrap">
              <button onClick={() => bulkUpdateMessages(Array.from(selectedIds), 'markRead').then(()=>addToast('success','Marked as read'))} disabled={!selectedIds.size} className="px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-xs font-bold disabled:opacity-40 border border-white/20">Mark read</button>
              <button onClick={() => bulkUpdateMessages(Array.from(selectedIds), 'markReplied').then(()=>addToast('success','Marked as replied'))} disabled={!selectedIds.size} className="px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-xs font-bold disabled:opacity-40 border border-white/20">Mark replied</button>
              <button onClick={() => bulkUpdateMessages(Array.from(selectedIds), 'archive').then(()=>addToast('success','Archived'))} disabled={!selectedIds.size} className="px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-xs font-bold disabled:opacity-40 border border-white/20">Archive</button>
              <button onClick={() => bulkUpdateMessages(Array.from(selectedIds), 'star').then(()=>addToast('success','Starred'))} disabled={!selectedIds.size} className="px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-600 text-xs font-bold disabled:opacity-40 border border-amber-600">Star</button>
              <button onClick={() => { if(confirm(`Delete ${selectedIds.size} messages?`)) bulkDeleteMessages(Array.from(selectedIds)).then(()=>{ setSelectedIds(new Set()); addToast('success','Deleted')}); }} disabled={!selectedIds.size} className="px-3 py-1.5 rounded-full bg-red-500 hover:bg-red-600 text-xs font-bold disabled:opacity-40 border border-red-600">Delete</button>
            </div>
            <button onClick={() => setSelectMode(false)} className="ml-auto p-1.5 rounded-full hover:bg-white/15 border border-white/20"><X size={16} /></button>
          </div>
        )}
      </div>

      {/* ── Inbox Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4 items-start">
        {/* LEFT: list */}
        <div className="bg-white dark:bg-[var(--dashboard-card-dark,#161d2b)] rounded-2xl border border-slate-200/60 dark:border-[var(--dashboard-card-border-dark,rgba(255,255,255,0.08))] shadow-sm overflow-hidden flex flex-col min-h-[540px] max-h-[720px]">
          <div className="px-4 py-3 border-b border-slate-200/60 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-white/[0.03]">
            <span className="text-xs font-bold tracking-wide text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5">
              <Mail size={14} /> {filtered.length} messages
              {activeStatus!=='all' && <span style={{ color: accentColor }}>· {activeStatus}</span>}
            </span>
            {selectMode && (
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer">
                <input type="checkbox" checked={selectedIds.size===filtered.length && filtered.length>0} onChange={toggleSelectAll} className="rounded border-slate-300 dark:border-white/20" />
                All
              </label>
            )}
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-white/10">
            <AnimatePresence initial={false}>
              {filtered.map((m) => {
                const isSelected = selectedId === m.id;
                const checked = selectedIds.has(m.id);
                const s = statusMeta(m.status);
                const initials = getInitials(m.name);
                const isNew = m.status === 'new';
                return (
                  <motion.div
                    key={m.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    onClick={() => selectMode ? toggleSelectOne(m.id) : handleSelect(m)}
                    className={`relative flex gap-3 p-4 cursor-pointer transition ${isSelected ? 'bg-blue-50/60 dark:bg-blue-500/[0.08] border-l-2' : isNew ? 'bg-blue-50/30 dark:bg-blue-500/[0.06] hover:bg-blue-50/60 dark:hover:bg-blue-500/[0.10]' : 'hover:bg-slate-50 dark:hover:bg-white/[0.04]'}`}
                    style={isSelected ? { background: `color-mix(in srgb, ${accentColor} 6%, transparent)`, borderLeftColor: accentColor } : {}}
                  >
                    {selectMode && (
                      <input type="checkbox" checked={checked} onChange={() => toggleSelectOne(m.id)} onClick={e=>e.stopPropagation()} className="mt-1 rounded border-slate-300 dark:border-white/20" style={{ accentColor: accentColor } as any} />
                    )}
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-extrabold text-xs shadow flex-shrink-0 ring-2 ${isNew ? 'bg-gradient-to-br from-blue-600 to-cyan-500 ring-blue-100 dark:ring-blue-500/20' : m.is_customer ? 'bg-gradient-to-br from-violet-600 to-indigo-500 ring-violet-100 dark:ring-violet-500/20' : 'ring-black/5 dark:ring-white/10'}`} style={!isNew && !m.is_customer ? { background: accentColor } : {}}>
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-sm truncate ${isNew ? 'font-extrabold text-slate-900 dark:text-slate-100' : 'font-semibold text-slate-800 dark:text-slate-200'}`}>{m.name}</span>
                        {m.is_customer && <span title="Existing customer" className="inline-flex items-center gap-0.5 rounded-full bg-violet-50 dark:bg-violet-500/15 border border-violet-200 dark:border-violet-500/20 px-1.5 py-0.5 text-[10px] font-bold text-violet-700 dark:text-violet-300"><Crown size={10} /> VIP</span>}
                        {m.is_starred && <Star size={12} className="text-amber-500 fill-amber-500 flex-shrink-0" />}
                        {isNew && <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse flex-shrink-0" />}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                          <Phone size={10} /> {m.phone}
                        </span>
                        {m.email && <span className="text-slate-300 dark:text-slate-600">·</span>}
                        {m.email && <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1"><AtSign size={10} /> {m.email}</span>}
                      </div>
                      <p className={`mt-1 text-xs leading-5 line-clamp-2 ${isNew ? 'text-slate-700 dark:text-slate-300 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>{m.message}</p>
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${s.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} /> {s.label}
                        </span>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 inline-flex items-center gap-1"><Clock size={10} /> {getTimeAgo(m.created_at)}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e)=>{ e.stopPropagation(); setShowActionsFor(showActionsFor===m.id ? null : m.id); }}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 dark:text-slate-500 flex-shrink-0 h-fit"
                    >
                      <MoreHorizontal size={14} />
                    </button>
                    {showActionsFor===m.id && (
                      <div className="absolute right-3 top-12 z-20 w-44 bg-white dark:bg-[var(--dashboard-card-dark)] rounded-xl shadow-xl border border-slate-200 dark:border-white/10 py-1 text-sm">
                        <button onClick={(e)=>{ e.stopPropagation(); setShowActionsFor(null); toggleStarMessage(m.id); }} className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-2 text-slate-700 dark:text-slate-300"><Star size={14} className={m.is_starred ? 'fill-amber-400 text-amber-500' : ''} /> {m.is_starred ? 'Unstar' : 'Star'}</button>
                        <button onClick={(e)=>{ e.stopPropagation(); setShowActionsFor(null); updateMessageStatus(m.id, m.status==='new' ? 'read' : 'new'); }} className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-2 text-slate-700 dark:text-slate-300"><Eye size={14}/> {m.status==='new' ? 'Mark read' : 'Mark new'}</button>
                        <button onClick={(e)=>{ e.stopPropagation(); setShowActionsFor(null); updateMessageStatus(m.id,'replied'); }} className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-2 text-slate-700 dark:text-slate-300"><Reply size={14}/> Mark replied</button>
                        <button onClick={(e)=>{ e.stopPropagation(); setShowActionsFor(null); updateMessageStatus(m.id,'archived'); }} className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-2 text-slate-700 dark:text-slate-300"><Archive size={14}/> Archive</button>
                        <div className="my-1 border-t border-slate-100 dark:border-white/10" />
                        <button onClick={(e)=>{ e.stopPropagation(); setShowActionsFor(null); if(confirm('Delete this message?')) deleteMessage(m.id).then(()=>{ if(selectedId===m.id) setSelectedId(null); addToast('success','Message deleted'); }); }} className="w-full text-left px-3 py-2 hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center gap-2"><Trash2 size={14}/> Delete</button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {filtered.length===0 && (
              <div className="py-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center mx-auto mb-3"><Mail size={20} className="text-slate-400" /></div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No messages</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Try another filter or search</p>
              </div>
            )}
          </div>

          {hasMore && filtered.length>0 && (
            <div className="p-3 border-t border-slate-200 dark:border-white/10 text-center bg-slate-50/50 dark:bg-white/[0.02]">
              <button onClick={loadMoreMessages} disabled={isLoading} className="px-4 py-2 rounded-xl text-sm font-semibold bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 disabled:opacity-50 inline-flex items-center gap-2">
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Inbox size={16} />} Load more
              </button>
            </div>
          )}
        </div>

        {/* RIGHT: detail */}
        <div className="bg-white dark:bg-[var(--dashboard-card-dark,#161d2b)] rounded-2xl border border-slate-200/60 dark:border-[var(--dashboard-card-border-dark,rgba(255,255,255,0.08))] shadow-sm overflow-hidden min-h-[540px] max-h-[720px] flex flex-col">
          {!selectedMessage ? (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
              <div className="w-20 h-20 rounded-3xl border flex items-center justify-center mb-4 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10">
                <MessageSquare size={28} style={{ color: accentColor }} />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Select a conversation</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">Choose a message on the left to read details, reply via WhatsApp or email, and update its status. Keep your inbox clean and customers happy.</p>
              <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-blue-700 dark:text-blue-300 font-semibold"><Sparkles size={12}/> New leads first</span>
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 text-violet-700 dark:text-violet-300 font-semibold"><Crown size={12}/> VIP = existing customer</span>
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 text-amber-700 dark:text-amber-300 font-semibold"><Star size={12}/> Star to follow up</span>
              </div>
            </div>
          ) : (
            <>
              {/* detail header */}
              <div className="px-6 py-5 border-b border-slate-200 dark:border-white/10 bg-gradient-to-br from-white to-slate-50/50 dark:from-[var(--dashboard-card-dark)] dark:to-[var(--dashboard-card-dark)]">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-extrabold shadow-lg flex-shrink-0" style={selectedMessage.is_customer ? { background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' } : { background: accentColor }}>
                    {getInitials(selectedMessage.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">{selectedMessage.name}</h2>
                      {selectedMessage.customer_id && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[11px] font-mono font-bold border border-slate-900 dark:border-white">
                          <ShieldCheck size={11} className="text-white/70 dark:text-slate-500" />
                          {selectedMessage.customer_id.slice(0, 8)}…{selectedMessage.customer_id.slice(-4)}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleCopy(selectedMessage.customer_id!, 'Customer ID'); }}
                            className="ml-1 p-0.5 rounded hover:bg-white/20 dark:hover:bg-slate-900/10 transition"
                            title="Copy customer ID"
                          >
                            <Copy size={11} />
                          </button>
                        </span>
                      )}
                      {selectedMessage.is_customer ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-600 text-white text-xs font-bold"><Crown size={12}/> Customer</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-bold bg-white dark:bg-white/5 border-slate-200 dark:border-white/10" style={{ color: accentColor, background: `color-mix(in srgb, ${accentColor} 8%, transparent)` }}><UsersRound size={12}/> Guest</span>
                      )}
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${statusMeta(selectedMessage.status).badge}`}>
                        <span className={`w-2 h-2 rounded-full ${statusMeta(selectedMessage.status).dot}`} /> {statusMeta(selectedMessage.status).label}
                      </span>
                      {selectedMessage.is_starred && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold"><Star size={12} className="fill-amber-500" /> Starred</span>}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                      <a href={`tel:${selectedMessage.phone}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 font-medium">
                        <Phone size={14} style={{ color: accentColor }} /> {selectedMessage.phone}
                      </a>
                      {selectedMessage.email && (
                        <a href={`mailto:${selectedMessage.email}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 font-medium">
                          <AtSign size={14} style={{ color: accentColor }} /> {selectedMessage.email}
                        </a>
                      )}
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 text-xs font-medium">
                        <Clock size={12} /> {new Date(selectedMessage.created_at).toLocaleString('en-US', { weekday:'short', year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' })}
                      </span>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
                    <button onClick={() => toggleStarMessage(selectedMessage.id)} className={`p-2.5 rounded-xl border transition ${selectedMessage.is_starred ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400' : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/10'}`} title={selectedMessage.is_starred ? 'Unstar' : 'Star'}>
                      <Star size={18} className={selectedMessage.is_starred ? 'fill-amber-500' : ''} />
                    </button>
                    <button onClick={() => { if(confirm('Delete this message?')) deleteMessage(selectedMessage.id).then(()=>{ setSelectedId(null); addToast('success','Deleted');}); }} className="p-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition" title="Delete">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                {/* quick actions */}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <a href={waUrl(selectedMessage)} target="_blank" rel="noopener" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#128C3E] text-white font-bold text-sm shadow-md shadow-[#25D366]/20 transition">
                    <MessageSquare size={16} /> Reply on WhatsApp
                  </a>
                  {selectedMessage.email && (
                    <a href={`mailto:${selectedMessage.email}?subject=Re: Your message to SODFA&body=Hello ${selectedMessage.name},%0D%0A%0D%0AThank you for contacting SODFA...`} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white font-bold text-sm transition hover:opacity-90 shadow-sm" style={{ background: accentColor }}>
                      <AtSign size={16} /> Reply by Email
                    </a>
                  )}
                  <button onClick={() => handleViewCustomer(selectedMessage)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <ExternalLink size={16} /> View Customer
                  </button>
                  <button onClick={() => handleCopy(selectedMessage.phone, 'Phone')} className="p-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300" title="Copy phone">
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              {/* message body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 dark:bg-white/[0.02]">
                <div className="relative">
                  <div className="absolute -left-2 top-3 w-1 h-8 rounded-full" style={{ background: `color-mix(in srgb, ${accentColor} 25%, transparent)` }} />
                  <div className="rounded-2xl border p-5 bg-white dark:bg-[var(--dashboard-card-dark)] border-slate-200 dark:border-white/10 shadow-sm">
                    <div className="flex items-center gap-2 text-xs font-bold tracking-wide uppercase mb-3" style={{ color: accentColor }}>
                      <MessageSquare size={14} /> Message
                      <span className="ml-auto text-[11px] font-medium text-slate-400 dark:text-slate-500 normal-case tracking-normal">{selectedMessage.message.length} chars</span>
                    </div>
                    <p className="text-[15px] leading-7 text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-words" style={{ fontFamily: 'Tajawal, sans-serif' }}>
                      {selectedMessage.message}
                    </p>
                  </div>
                </div>

                {/* meta footer */}
                <div className="rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1.5"><Clock size={12}/> Received {getTimeAgo(selectedMessage.created_at)} · {new Date(selectedMessage.created_at).toLocaleDateString()}</span>
                  <span className="inline-flex items-center gap-1.5">Updated {getTimeAgo(selectedMessage.updated_at)}</span>
                </div>
              </div>

              {/* bottom bar mobile */}
              <div className="p-3 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[var(--dashboard-card-dark)] flex sm:hidden items-center gap-2">
                <button onClick={() => toggleStarMessage(selectedMessage.id)} className={`flex-1 py-2.5 rounded-xl border text-sm font-bold flex items-center justify-center gap-1.5 ${selectedMessage.is_starred ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-300' : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300'}`}>
                  <Star size={16} className={selectedMessage.is_starred ? 'fill-amber-500' : ''}/> {selectedMessage.is_starred ? 'Starred' : 'Star'}
                </button>
                <a href={waUrl(selectedMessage)} target="_blank" className="flex-1 py-2.5 rounded-xl bg-[#25D366] text-white text-sm font-bold flex items-center justify-center gap-1.5">WhatsApp</a>
                <button onClick={() => { if(confirm('Delete?')) deleteMessage(selectedMessage.id).then(()=> setSelectedId(null)); }} className="p-2.5 rounded-xl border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 bg-white dark:bg-white/5"><Trash2 size={16}/></button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* click outside to close action menus */}
      {showActionsFor && <div className="fixed inset-0 z-10" onClick={()=>setShowActionsFor(null)} />}
    </div>
  );
};

export default Messages;
