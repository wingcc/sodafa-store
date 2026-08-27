import type { Order, Product, Customer } from '../../types';

export function getOrderStatusCounts(orders: Order[]) {
  const c = { pending: 0, confirmed: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0, refunded: 0 };
  for (const o of orders) {
    const s = o.orderStatus as keyof typeof c;
    if (s in c) c[s]++;
    else c.pending++;
  }
  return c;
}

export function getRevenueByPeriod(orders: Order[], days: number) {
  const now = Date.now();
  const ms = days * 86400000;
  const start = now - ms;
  const curr = orders.filter(o => new Date(o.createdAt).getTime() >= start);
  const prev = orders.filter(o => {
    const t = new Date(o.createdAt).getTime();
    return t >= start - ms && t < start;
  });
  const sum = (arr: Order[]) => arr.reduce((a, o) => a + o.total, 0);
  const currRev = sum(curr);
  const prevRev = sum(prev);
  const change = prevRev === 0 ? (currRev > 0 ? 100 : 0) : Math.round(((currRev - prevRev) / prevRev) * 100);
  return { currRev, prevRev, change, currCount: curr.length, prevCount: prev.length };
}

export function getSparklineData(values: number[]): { x: number; y: number }[] {
  if (values.length < 2) return values.map((y, x) => ({ x, y }));
  return values.map((y, x) => ({ x, y }));
}

export function buildRevenueSparkline(orders: Order[], days: number = 7): number[] {
  const now = new Date();
  const points: number[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    const rev = orders.filter(o => (o.createdAt || '').slice(0, 10) === key).reduce((a, o) => a + o.total, 0);
    points.push(rev);
  }
  return points;
}

export function buildOrdersSparkline(orders: Order[], days: number = 7): number[] {
  const now = new Date();
  const points: number[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    const cnt = orders.filter(o => (o.createdAt || '').slice(0, 10) === key).length;
    points.push(cnt);
  }
  return points;
}

export function getAov(orders: Order[]) {
  const delivered = orders.filter(o => o.orderStatus === 'delivered');
  const base = delivered.length > 0 ? delivered : orders.filter(o => o.paymentStatus === 'paid');
  const pool = base.length > 0 ? base : orders;
  const total = pool.reduce((a, o) => a + o.total, 0);
  const aov = pool.length ? total / pool.length : 0;
  // previous period AOV (7d vs prior 7d)
  const now = Date.now();
  const week = 7 * 86400000;
  const currOrders = pool.filter(o => new Date(o.createdAt).getTime() >= now - week);
  const prevOrders = pool.filter(o => {
    const t = new Date(o.createdAt).getTime();
    return t >= now - week * 2 && t < now - week;
  });
  const currAov = currOrders.length ? currOrders.reduce((a, o) => a + o.total, 0) / currOrders.length : 0;
  const prevAov = prevOrders.length ? prevOrders.reduce((a, o) => a + o.total, 0) / prevOrders.length : 0;
  const change = prevAov === 0 ? (currAov > 0 ? 100 : 0) : Math.round(((currAov - prevAov) / prevAov) * 100);
  return { aov, currAov, prevAov, change, count: pool.length };
}

export function getCodMetrics(orders: Order[]) {
  const cod = orders.filter(o => o.paymentMethod === 'cash_on_delivery');
  const total = orders.length;
  const codTotal = cod.length;
  const delivered = orders.filter(o => o.orderStatus === 'delivered').length;
  const cancelled = orders.filter(o => o.orderStatus === 'cancelled').length;
  const refunded = orders.filter(o => o.orderStatus === 'refunded').length;
  const pending = orders.filter(o => o.orderStatus === 'pending' || o.orderStatus === 'confirmed').length;

  const confirmationRate = total ? Math.round(((total - orders.filter(o => o.orderStatus === 'pending').length) / total) * 100) : 0;
  const deliverySuccess = (delivered + cancelled + refunded) ? Math.round((delivered / (delivered + cancelled + refunded)) * 100) : 0;
  const cancellationRate = total ? Math.round((cancelled / total) * 100) : 0;
  const rtoRate = total ? Math.round((refunded / total) * 100) : 0;

  const cashCollected = orders.filter(o => o.orderStatus === 'delivered' && o.paymentStatus === 'paid').reduce((a, o) => a + o.total, 0);
  const cashPending = cod.filter(o => o.paymentStatus === 'pending').reduce((a, o) => a + o.total, 0);

  return { codTotal, total, pending, delivered, cancelled, refunded, confirmationRate, deliverySuccess, cancellationRate, rtoRate, cashCollected, cashPending };
}

export function getInventoryHealth(products: Product[]) {
  const totalStockValue = products.reduce((a, p) => a + p.stock * (p.salePrice ?? p.regularPrice), 0);
  const outOfStock = products.filter(p => p.stock === 0).length;
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold).length;
  const fastMoving = [...products].sort((a, b) => b.totalSold - a.totalSold).slice(0, 3);
  const slowMoving = [...products].filter(p => p.stock > 0).sort((a, b) => a.totalSold - b.totalSold).slice(0, 3);
  const healthy = products.filter(p => p.stock > p.lowStockThreshold).length;
  const healthPct = products.length ? Math.round((healthy / products.length) * 100) : 100;
  return { totalStockValue, outOfStock, lowStock, fastMoving, slowMoving, healthPct, total: products.length };
}

export function getCustomerSnapshot(customers: Customer[]) {
  const total = customers.length;
  const now = Date.now();
  const thirtyDays = 30 * 86400000;
  const newCustomers = customers.filter(c => c.registeredAt && new Date(c.registeredAt).getTime() >= now - thirtyDays).length;
  const returning = customers.filter(c => c.totalOrders > 1).length;
  const repeatRate = total ? Math.round((returning / total) * 100) : 0;
  return { total, newCustomers, returning, repeatRate };
}

export function sparklinePath(values: number[], width = 100, height = 32): string {
  if (!values.length) return '';
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const stepX = width / Math.max(values.length - 1, 1);
  return values.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * height;
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}
