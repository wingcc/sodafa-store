'use client';

import { useState } from 'react';

const NOTIFICATION_TYPES = [
  { key: 'order', label: 'Orders', icon: '📦', color: '#1E7A57' },
  { key: 'inventory', label: 'Inventory', icon: '📊', color: '#C6A15B' },
  { key: 'customer', label: 'Customers', icon: '👤', color: '#3B82F6' },
  { key: 'review', label: 'Reviews', icon: '⭐', color: '#F59E0B' },
  { key: 'payment', label: 'Payments', icon: '💰', color: '#10B981' },
  { key: 'promotion', label: 'Promotions', icon: '🏷️', color: '#EF4444' },
  { key: 'shipping', label: 'Shipping', icon: '🚚', color: '#8B5CF6' },
  { key: 'system', label: 'System', icon: '⚙️', color: '#6B7280' },
  { key: 'security', label: 'Security', icon: '🔒', color: '#DC2626' },
];

export default function TestNotificationsPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<string[]>([]);
  const [allLoading, setAllLoading] = useState(false);

  const send = async (type?: string) => {
    const key = type ?? 'all';
    setLoading(key);
    setResults([]);
    try {
      const res = await fetch('/api/test-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(type ? { type } : {}),
      });
      const data = await res.json();
      setResults(data.results ?? []);
    } catch (e) {
      setResults([`❌ Error: ${String(e)}`]);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1a', color: '#e2e8f0', fontFamily: 'Inter, sans-serif', padding: '40px 20px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: '#fff' }}>
          Test Notifications
        </h1>
        <p style={{ color: '#94a3b8', marginBottom: 32 }}>
          Send real notifications using data from your database. Click a type to test individually, or &quot;Send All&quot; to test everything.
        </p>

        {/* Send All */}
        <button
          onClick={() => { setAllLoading(true); send().finally(() => setAllLoading(false)); }}
          disabled={loading !== null}
          style={{
            width: '100%', padding: '14px 24px', marginBottom: 32,
            background: 'linear-gradient(135deg, #1E7A57, #C6A15B)',
            color: '#fff', border: 'none', borderRadius: 12,
            fontSize: 16, fontWeight: 600, cursor: loading ? 'wait' : 'pointer',
            opacity: loading ? 0.6 : 1, transition: 'opacity 0.2s',
          }}
        >
          {allLoading ? 'Sending...' : '🚀 Send All Notifications'}
        </button>

        {/* Individual Types */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 }}>
          {NOTIFICATION_TYPES.map((n) => (
            <button
              key={n.key}
              onClick={() => send(n.key)}
              disabled={loading !== null}
              style={{
                padding: '16px 12px', background: '#111827',
                border: `1px solid ${n.color}33`, borderRadius: 10,
                color: '#e2e8f0', cursor: loading ? 'wait' : 'pointer',
                opacity: loading ? 0.5 : 1, transition: 'all 0.2s',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = n.color; e.currentTarget.style.background = '#1a2332'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${n.color}33`; e.currentTarget.style.background = '#111827'; }}
            >
              <div style={{ fontSize: 24, marginBottom: 6 }}>{n.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: n.color }}>{n.label}</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                {loading === n.key ? 'Sending...' : 'Click to test'}
              </div>
            </button>
          ))}
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div style={{ background: '#111827', border: '1px solid #1E7A5733', borderRadius: 12, padding: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#1E7A57' }}>Results</h3>
            {results.map((r, i) => (
              <div key={i} style={{ padding: '6px 0', fontSize: 14, borderBottom: i < results.length - 1 ? '1px solid #1e293b' : 'none' }}>
                {r}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}