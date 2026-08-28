
import { create } from 'zustand';
import type {
  PageSection,
  PendingNavigation,
  Product,
  Order,
  Customer,
  Notification,
  ShippingZone,
  ShippingCity,
  ShippingMethod,
} from '../types';

// API base URL
const API_BASE = '/api';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiRow = Record<string, any>;

interface AppState {
  // Navigation
  currentPage: PageSection;
  setCurrentPage: (page: PageSection) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  pendingNavigation: PendingNavigation | null;
  setPendingNavigation: (nav: PendingNavigation | null) => void;
  clearPendingNavigation: () => void;

  // Products
  products: Product[];
  isLoadingProducts: boolean;
  productsError: string | null;
  fetchProducts: (status?: string) => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<{ success: boolean; error?: string }>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  // Orders
  orders: Order[];
  isLoadingOrders: boolean;
  ordersError: string | null;
  fetchOrders: () => Promise<void>;
  fetchOrderDetail: (id: string) => Promise<Order | null>;
  updateOrderStatus: (id: string, status: Order['orderStatus']) => Promise<void>;

  // Customers
  customers: Customer[];
  isLoadingCustomers: boolean;
  customersError: string | null;
  fetchCustomers: () => Promise<void>;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Modals
  showProductModal: boolean;
  setShowProductModal: (show: boolean) => void;
  editingProduct: Product | null;
  setEditingProduct: (product: Product | null) => void;

  // Notifications
  notifications: Notification[];
  unreadNotifications: number;
  starredNotifications: number;
  isLoadingNotifications: boolean;
  notificationsError: string | null;
  notificationFilters: { type: string; priority: string; status: string; search: string };
  hasMoreNotifications: boolean;
  setNotificationFilters: (filters: { type?: string; priority?: string; status?: string; search?: string }) => void;
  fetchNotifications: (filters?: { type?: string; priority?: string; status?: string; search?: string; limit?: number; offset?: number }) => Promise<void>;
  markNotificationsRead: () => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markNotificationAsUnread: (id: string) => Promise<void>;
  toggleStarNotification: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  bulkDeleteNotifications: (ids: string[]) => Promise<void>;
  bulkMarkNotifications: (ids: string[], read: boolean) => Promise<void>;
  loadMoreNotifications: () => Promise<void>;

  // Shipping Zones
  shippingZones: ShippingZone[];
  isLoadingShipping: boolean;
  shippingError: string | null;
  fetchShippingZones: () => Promise<void>;
  addShippingZone: (zone: ShippingZoneInput) => Promise<{ success: boolean; error?: string }>;
  addCity: (city: { name: string; name_ar?: string; zone_id: string; latitude: number; longitude: number }) => Promise<{ success: boolean; error?: string; data?: ShippingCity }>;
  updateShippingZone: (id: string, updates: Partial<ShippingZoneInput>) => Promise<void>;
  deleteShippingZone: (id: string) => Promise<{ success: boolean; error?: string }>;
  addDeliveryMethod: (method: ShippingMethodInput & { city_id: string; zone_id: string }) => Promise<{ success: boolean; error?: string; data?: ShippingMethod }>;
  updateDeliveryMethod: (id: string, updates: Partial<ShippingMethodInput & { is_active?: boolean }>) => Promise<{ success: boolean; error?: string }>;
  deleteDeliveryMethod: (id: string) => Promise<{ success: boolean; error?: string }>;
}

// Helper to map Supabase row to our Product type
function mapProduct(row: ApiRow): Product {
  return {
    id: String(row.id ?? ''),
    name: String(row.name ?? ''),
    slug: String(row.slug ?? ''),
    shortDescription: String(row.short_description ?? ''),
    fullDescription: String(row.full_description ?? ''),
    sku: String(row.sku ?? ''),
    brand: String(row.brand ?? 'SODFA'),
    categoryId: String(row.category_id ?? ''),
    categoryName: String(row.category_name ?? ''),
    subcategory: row.subcategory ? String(row.subcategory) : undefined,
    tags: Array.isArray(row.tags) ? row.tags : [],
    regularPrice: Number(row.regular_price ?? 0),
    salePrice: row.sale_price ? Number(row.sale_price) : undefined,
    costPrice: Number(row.cost_price ?? 0),
    currency: (row.currency ?? 'MAD') as 'MAD',
    stock: Number(row.stock ?? 0),
    lowStockThreshold: Number(row.low_stock_threshold ?? 10),
    trackInventory: Boolean(row.track_inventory ?? true),
    ADS: row.ADS !== undefined ? Boolean(row.ADS) : Boolean(row.ads ?? false),
    ShowInStor: row.ShowInStor !== undefined ? Boolean(row.ShowInStor) : Boolean(row.showinstor ?? row.showInStore ?? false),
    images: Array.isArray(row.images) ? row.images : [],
    variants: [],
    status: (row.status ?? 'draft') as Product['status'],
    featured: Boolean(row.featured ?? false),
    seoTitle: row.seo_title ? String(row.seo_title) : undefined,
    seoDescription: row.seo_description ? String(row.seo_description) : undefined,
    seoSlug: row.seo_slug ? String(row.seo_slug) : undefined,
    seoKeywords: Array.isArray(row.seo_keywords) ? row.seo_keywords : undefined,
    createdAt: String(row.created_at ?? ''),
    updatedAt: String(row.updated_at ?? ''),
    totalSold: Number(row.total_sold ?? 0),
    rating: Number(row.rating ?? 0),
    reviewCount: Number(row.review_count ?? 0),
  };
}

function mapOrderItem(row: any): Order['items'][number] {
  return {
    id: String(row.id ?? ''),
    productId: String(row.product_id ?? ''),
    productName: String(row.product_name ?? ''),
    productImage: String(row.product_image ?? ''),
    variant: row.variant ? String(row.variant) : undefined,
    quantity: Number(row.quantity ?? 1),
    unitPrice: Number(row.unit_price ?? 0),
    total: Number(row.total ?? 0),
  };
}

function mapOrder(row: ApiRow): Order {
  return {
    id: String(row.id ?? ''),
    orderNumber: String(row.order_number ?? ''),
    customerId: String(row.customer_id ?? ''),
    customerName: String(row.customer_name ?? ''),
    customerEmail: String(row.customer_email ?? ''),
    customerPhone: String(row.customer_phone ?? ''),
    items: Array.isArray(row.items) ? row.items.map(mapOrderItem) : [],
    subtotal: Number(row.subtotal ?? 0),
    discount: Number(row.discount ?? 0),
    shippingCost: Number(row.shipping_cost ?? 0),
    total: Number(row.total ?? 0),
    currency: (row.currency ?? 'MAD') as 'MAD',
    paymentMethod: (row.payment_method ?? 'cash_on_delivery') as Order['paymentMethod'],
    paymentStatus: (row.payment_status ?? 'pending') as Order['paymentStatus'],
    orderStatus: (row.order_status ?? 'pending') as Order['orderStatus'],
    shippingAddress: row.shipping_address && typeof row.shipping_address === 'object'
      ? row.shipping_address as Order['shippingAddress']
      : { name: '', address: '', city: '', region: '', phone: '' },
    billingAddress: row.billing_address && typeof row.billing_address === 'object'
      ? row.billing_address as Order['billingAddress']
      : { name: '', address: '', city: '', region: '' },
    trackingNumber: row.tracking_number ? String(row.tracking_number) : undefined,
    shippingProvider: row.shipping_provider ? String(row.shipping_provider) : undefined,
    notes: row.notes ? String(row.notes) : undefined,
    couponCode: row.coupon_code ? String(row.coupon_code) : undefined,
    createdAt: String(row.created_at ?? ''),
    updatedAt: String(row.updated_at ?? ''),
    timeline: Array.isArray(row.timeline) ? row.timeline : Array.isArray((row as any).order_timeline) ? (row as any).order_timeline : [],
  };
}

function mapCustomer(row: ApiRow): Customer {
  return {
    id: String(row.id ?? ''),
    name: String(row.name ?? ''),
    email: String(row.email ?? ''),
    phone: String(row.phone ?? ''),
    avatar: row.avatar ? String(row.avatar) : undefined,
    totalOrders: Number(row.total_orders ?? 0),
    totalSpent: Number(row.total_spent ?? 0),
    currency: (row.currency ?? 'MAD') as 'MAD',
    lastOrderDate: String(row.last_order_date ?? ''),
    registeredAt: String(row.registered_at ?? ''),
    status: (row.status ?? 'active') as Customer['status'],
    addresses: Array.isArray(row.addresses) ? row.addresses : [],
    favoriteCategories: Array.isArray(row.favorite_categories) ? row.favorite_categories : [],
  };
}

function mapNotification(row: ApiRow): Notification {
  // Parse metadata — handle both object and JSON string cases
  let metadata: Record<string, any> | undefined;
  if (row.metadata && typeof row.metadata === 'object') {
    metadata = row.metadata as Record<string, any>;
  } else if (typeof row.metadata === 'string') {
    try { metadata = JSON.parse(row.metadata); } catch { metadata = undefined; }
  }

  return {
    id: String(row.id ?? ''),
    type: (row.type ?? 'system') as Notification['type'],
    title: String(row.title ?? ''),
    message: String(row.message ?? ''),
    read: Boolean(row.read ?? false),
    starred: Boolean(row.starred ?? false),
    priority: (row.priority ?? 'medium') as Notification['priority'],
    timestamp: String(row.timestamp ?? row.created_at ?? new Date().toISOString()),
    actionUrl: row.action_url ? String(row.action_url) : undefined,
    metadata,
  };
}

// ─── Shipping input types (camelCase payloads sent to the API) ─────────
interface ShippingMethodInput {
  id?: string;
  city_id?: string;
  name: string;
  slug?: string;
  price?: number;
  estimated_days?: number;
  estimated_hours?: number | null;
  description?: string;
  isActive?: boolean;
}

interface ShippingCityInput {
  id?: string;
  name: string;
  name_ar?: string;
  latitude?: number;
  longitude?: number;
  methods?: ShippingMethodInput[];
}

interface ShippingZoneInput {
  name: string;
  description?: string;
  isActive?: boolean;
  city_ids?: string[];
  cities?: ShippingCityInput[];
}

// Helper to map a Supabase delivery method row to our method type
function mapMethod(row: ApiRow): ShippingMethod {
  return {
    id: String(row.id ?? ''),
    cityId: String(row.city_id ?? ''),
    zoneId: String(row.zone_id ?? ''),
    name: String(row.name ?? ''),
    slug: String(row.slug ?? 'standard'),
    price: Number(row.price ?? 0),
    estimatedDays: Number(row.estimated_days ?? 2),
    estimatedHours: row.estimated_hours != null ? Number(row.estimated_hours) : null,
    description: String(row.description ?? ''),
    isActive: Boolean(row.is_active ?? true),
  };
}

// Helper to map a Supabase delivery city row (with nested methods) to our type
function mapCity(row: ApiRow): ShippingCity {
  const methods = Array.isArray(row.methods) ? row.methods.map(mapMethod) : [];
  return {
    id: String(row.id ?? ''),
    name: String(row.name ?? ''),
    nameAr: String(row.name_ar ?? ''),
    zoneId: String(row.zone_id ?? ''),
    latitude: Number(row.latitude ?? 0),
    longitude: Number(row.longitude ?? 0),
    isActive: Boolean(row.is_active ?? true),
    methods,
  };
}

// Helper to map a Supabase delivery zone row (with nested cities) to our type
function mapZone(row: ApiRow): ShippingZone {
  const cities = Array.isArray(row.cities) ? row.cities.map(mapCity) : [];
  return {
    id: String(row.id ?? ''),
    name: String(row.name ?? ''),
    description: String(row.description ?? ''),
    isActive: Boolean(row.is_active ?? true),
    cities,
  };
}

export const useStore = create<AppState>((set) => ({
  // Navigation
  currentPage: 'dashboard',
  setCurrentPage: (page) => set({ currentPage: page }),
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  pendingNavigation: null,
  setPendingNavigation: (nav) => set({ pendingNavigation: nav }),
  clearPendingNavigation: () => set({ pendingNavigation: null }),

  // Products
  products: [],
  isLoadingProducts: false,
  productsError: null,
  fetchProducts: async (status?: string) => {
    set({ isLoadingProducts: true, productsError: null });
    try {
      const params = new URLSearchParams();
      params.set('limit', '1000');
      if (status && status !== 'all') params.set('status', status);
      const url = `${API_BASE}/products?${params.toString()}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        const mapped = (json.data ?? []).map(mapProduct);
        set({ products: mapped, isLoadingProducts: false });
      } else {
        set({ productsError: json.error?.message ?? 'Failed to fetch products', isLoadingProducts: false });
      }
    } catch (err: unknown) {
      set({ productsError: err instanceof Error ? err.message : 'Unknown error', isLoadingProducts: false });
    }
  },
  addProduct: async (product) => {
    try {
      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      const json = await res.json();
      if (json.success) {
        set((state) => ({ products: [...state.products, mapProduct(json.data)] }));
        return { success: true };
      }
      return { success: false, error: json.error?.message ?? 'Failed to add product' };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to add product:', message);
      return { success: false, error: message };
    }
  },
  updateProduct: async (id, updates) => {
    try {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const json = await res.json();
      if (json.success) {
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? mapProduct(json.data) : p)),
        }));
      }
    } catch (err: unknown) {
      console.error('Failed to update product:', err);
    }
  },
  deleteProduct: async (id) => {
    try {
      const res = await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        set((state) => ({ products: state.products.filter((p) => p.id !== id) }));
      }
    } catch (err: unknown) {
      console.error('Failed to delete product:', err);
    }
  },

  // Orders
  orders: [],
  isLoadingOrders: false,
  ordersError: null,
  fetchOrders: async () => {
    set({ isLoadingOrders: true, ordersError: null });
    try {
      const res = await fetch(`${API_BASE}/orders`);
      const json = await res.json();
      if (json.success) {
        set({ orders: (json.data ?? []).map(mapOrder), isLoadingOrders: false });
      } else {
        set({ ordersError: json.error?.message ?? 'Failed to fetch orders', isLoadingOrders: false });
      }
    } catch (err: unknown) {
      set({ ordersError: err instanceof Error ? err.message : 'Unknown error', isLoadingOrders: false });
    }
  },
  fetchOrderDetail: async (id) => {
    try {
      const res = await fetch(`${API_BASE}/orders/${id}`);
      const json = await res.json();
      if (json.success) {
        return mapOrder(json.data);
      }
      return null;
    } catch (err: unknown) {
      console.error('Failed to fetch order detail:', err);
      return null;
    }
  },
  updateOrderStatus: async (id, status) => {
    // Optimistic local state update
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === id ? { ...o, orderStatus: status, updatedAt: new Date().toISOString(), shippedAt: status === 'shipped' ? new Date().toISOString() : (o as any).shippedAt, deliveredAt: status === 'delivered' ? new Date().toISOString() : (o as any).deliveredAt } : o
      ),
    }));

    try {
      const res = await fetch(`${API_BASE}/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: status }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        set((state) => ({
          orders: state.orders.map((o) => (o.id === id ? mapOrder(json.data) : o)),
        }));
      }
    } catch (err: unknown) {
      console.error('Failed to update order status on server:', err);
    }
  },

  // Customers
  customers: [],
  isLoadingCustomers: false,
  customersError: null,
  fetchCustomers: async () => {
    set({ isLoadingCustomers: true, customersError: null });
    try {
      const res = await fetch(`${API_BASE}/customers`);
      const json = await res.json();
      if (json.success) {
        set({ customers: (json.data ?? []).map(mapCustomer), isLoadingCustomers: false });
      } else {
        set({ customersError: json.error?.message ?? 'Failed to fetch customers', isLoadingCustomers: false });
      }
    } catch (err: unknown) {
      set({ customersError: err instanceof Error ? err.message : 'Unknown error', isLoadingCustomers: false });
    }
  },

  // Search
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Modals
  showProductModal: false,
  setShowProductModal: (show) => set({ showProductModal: show }),
  editingProduct: null,
  setEditingProduct: (product) => set({ editingProduct: product }),

  // Notifications
  notifications: [],
  unreadNotifications: 0,
  starredNotifications: 0,
  isLoadingNotifications: false,
  notificationsError: null,
  notificationFilters: { type: 'all', priority: 'all', status: 'all', search: '' },
  hasMoreNotifications: true,
  setNotificationFilters: (filters) => set((state) => ({
    notificationFilters: { ...state.notificationFilters, ...filters },
    hasMoreNotifications: true,
    notificationsError: null,
  })),
  fetchNotifications: async (filters?: { type?: string; priority?: string; status?: string; search?: string; limit?: number; offset?: number }) => {
    const stateFilters = useStore.getState().notificationFilters;
    const merged = { ...stateFilters, ...filters };
    const limit = filters?.limit ?? 20;
    const offset = filters?.offset ?? 0;
    const isLoadMore = offset > 0;

    if (!isLoadMore) set({ isLoadingNotifications: true, notificationsError: null });

    try {
      const params = new URLSearchParams();
      if (merged.type && merged.type !== 'all') params.set('type', merged.type);
      if (merged.priority && merged.priority !== 'all') params.set('priority', merged.priority);
      if (merged.status && merged.status !== 'all') params.set('status', merged.status);
      if (merged.search) params.set('search', merged.search);
      params.set('limit', String(limit));
      params.set('offset', String(offset));

      const res = await fetch(`${API_BASE}/admin/notifications?${params.toString()}`);
      const json = await res.json();

      if (!res.ok || !json.success) throw new Error(json?.error?.message ?? 'Failed to fetch notifications');

      const newNotifications = (json.data ?? []).map(mapNotification);
      const total = json.meta?.total ?? 0;
      const unreadCount = json.meta?.unreadCount;
      const starredCount = json.meta?.starredCount;

      if (isLoadMore) {
        set((state) => {
          const existingIds = new Set(state.notifications.map((n) => n.id));
          const deduped = newNotifications.filter((n: Notification) => !existingIds.has(n.id));
          const combined = [...state.notifications, ...deduped];
          return {
            notifications: combined,
            isLoadingNotifications: false,
            hasMoreNotifications: combined.length < total,
            unreadNotifications: unreadCount ?? combined.filter((n) => !n.read).length,
            starredNotifications: starredCount ?? combined.filter((n) => n.starred).length,
          };
        });
      } else {
        set({
          notifications: newNotifications,
          unreadNotifications: unreadCount ?? newNotifications.filter((n: Notification) => !n.read).length,
          starredNotifications: starredCount ?? newNotifications.filter((n: Notification) => n.starred).length,
          isLoadingNotifications: false,
          hasMoreNotifications: newNotifications.length < total,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch notifications';
      set({ isLoadingNotifications: false, notificationsError: msg });
    }
  },
  markNotificationsRead: async () => {
    const prev = useStore.getState().notifications;
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadNotifications: 0,
    }));
    try {
      const res = await fetch(`${API_BASE}/admin/notifications`, { method: 'PUT' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json?.error?.message);
    } catch (err) {
      set({ notifications: prev, unreadNotifications: prev.filter((n) => !n.read).length });
      console.error('Failed to mark all as read:', err);
      throw err;
    }
  },
  markNotificationAsRead: async (id) => {
    const prev = useStore.getState().notifications;
    set((state) => {
      const updated = state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
      return { notifications: updated, unreadNotifications: updated.filter((n) => !n.read).length };
    });
    try {
      const res = await fetch(`${API_BASE}/admin/notifications?id=${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json?.error?.message);
      if (json.data) set((state) => ({ notifications: state.notifications.map((n) => (n.id === id ? mapNotification(json.data) : n)) }));
    } catch (err) {
      set({ notifications: prev, unreadNotifications: prev.filter((n) => !n.read).length });
      console.error('Failed to mark as read:', err);
      throw err;
    }
  },
  markNotificationAsUnread: async (id) => {
    const prev = useStore.getState().notifications;
    set((state) => {
      const updated = state.notifications.map((n) => (n.id === id ? { ...n, read: false } : n));
      return { notifications: updated, unreadNotifications: updated.filter((n) => !n.read).length };
    });
    try {
      const res = await fetch(`${API_BASE}/admin/notifications?id=${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: false }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json?.error?.message);
      if (json.data) set((state) => ({ notifications: state.notifications.map((n) => (n.id === id ? mapNotification(json.data) : n)) }));
    } catch (err) {
      set({ notifications: prev, unreadNotifications: prev.filter((n) => !n.read).length });
      console.error('Failed to mark as unread:', err);
      throw err;
    }
  },
  toggleStarNotification: async (id) => {
    const current = useStore.getState().notifications.find((n) => n.id === id);
    if (!current) return;
    const nextStarred = !current.starred;
    const prev = useStore.getState().notifications;
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, starred: nextStarred } : n)),
      starredNotifications: state.notifications.map((n) => (n.id === id ? { ...n, starred: nextStarred } : n)).filter((n) => n.starred).length,
    }));
    try {
      const res = await fetch(`${API_BASE}/admin/notifications?id=${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ starred: nextStarred }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json?.error?.message);
      if (json.data) set((state) => ({ notifications: state.notifications.map((n) => (n.id === id ? mapNotification(json.data) : n)) }));
    } catch (err) {
      set({ notifications: prev, starredNotifications: prev.filter((n) => n.starred).length });
      console.error('Failed to toggle star:', err);
      throw err;
    }
  },
  deleteNotification: async (id) => {
    const prev = useStore.getState().notifications;
    set((state) => {
      const updated = state.notifications.filter((n) => n.id !== id);
      return {
        notifications: updated,
        unreadNotifications: updated.filter((n: Notification) => !n.read).length,
        starredNotifications: updated.filter((n: Notification) => n.starred).length,
      };
    });
    try {
      const res = await fetch(`${API_BASE}/admin/notifications?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json?.error?.message);
    } catch (err) {
      set({ notifications: prev, unreadNotifications: prev.filter((n) => !n.read).length, starredNotifications: prev.filter((n) => n.starred).length });
      console.error('Failed to delete notification:', err);
      throw err;
    }
  },
  bulkDeleteNotifications: async (ids) => {
    if (!ids.length) return;
    const prev = useStore.getState().notifications;
    set((state) => {
      const setIds = new Set(ids);
      const updated = state.notifications.filter((n) => !setIds.has(n.id));
      return {
        notifications: updated,
        unreadNotifications: updated.filter((n: Notification) => !n.read).length,
        starredNotifications: updated.filter((n: Notification) => n.starred).length,
      };
    });
    try {
      const res = await fetch(`${API_BASE}/admin/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, action: 'delete' }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json?.error?.message);
    } catch (err) {
      set({ notifications: prev, unreadNotifications: prev.filter((n) => !n.read).length, starredNotifications: prev.filter((n) => n.starred).length });
      console.error('Failed bulk delete:', err);
      throw err;
    }
  },
  bulkMarkNotifications: async (ids, read) => {
    if (!ids.length) return;
    const prev = useStore.getState().notifications;
    set((state) => {
      const setIds = new Set(ids);
      const updated = state.notifications.map((n) => (setIds.has(n.id) ? { ...n, read } : n));
      return { notifications: updated, unreadNotifications: updated.filter((n) => !n.read).length };
    });
    try {
      const res = await fetch(`${API_BASE}/admin/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, action: read ? 'markRead' : 'markUnread' }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json?.error?.message);
    } catch (err) {
      set({ notifications: prev, unreadNotifications: prev.filter((n) => !n.read).length });
      console.error('Failed bulk mark:', err);
      throw err;
    }
  },
  loadMoreNotifications: async () => {
    const state = useStore.getState();
    if (state.isLoadingNotifications || !state.hasMoreNotifications) return;
    await state.fetchNotifications({ offset: state.notifications.length });
  },

  // Shipping Zones
  shippingZones: [],
  isLoadingShipping: false,
  shippingError: null,
  fetchShippingZones: async () => {
    set({ isLoadingShipping: true, shippingError: null });
    try {
      const res = await fetch(`${API_BASE}/shipping`);
      const json = await res.json();
      if (json.success) {
        const mapped = (json.data ?? []).map(mapZone);
        set({ shippingZones: mapped, isLoadingShipping: false });
      } else {
        set({
          shippingError: json.error?.message ?? 'Failed to fetch shipping zones',
          isLoadingShipping: false,
        });
      }
    } catch (err: unknown) {
      set({
        shippingError: err instanceof Error ? err.message : 'Unknown error',
        isLoadingShipping: false,
      });
    }
  },
  addShippingZone: async (zone) => {
    try {
      const res = await fetch(`${API_BASE}/shipping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'zone',
          name: zone.name,
          description: zone.description ?? '',
          city_ids: zone.city_ids ?? [],
        }),
      });
      const json = await res.json();
      if (json.success) {
        set((state) => ({ shippingZones: [...state.shippingZones, mapZone(json.data)] }));
        return { success: true };
      }
      return { success: false, error: json.error?.message ?? 'Failed to add shipping zone' };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to add shipping zone:', message);
      return { success: false, error: message };
    }
  },
  addCity: async (city) => {
    try {
      const res = await fetch(`${API_BASE}/shipping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'city',
          name: city.name,
          name_ar: city.name_ar ?? '',
          zone_id: city.zone_id,
          latitude: city.latitude,
          longitude: city.longitude,
        }),
      });
      const json = await res.json();
      if (json.success) {
        const newCity: ShippingCity = {
          id: String(json.data.id ?? ''),
          name: String(json.data.name ?? ''),
          nameAr: String(json.data.name_ar ?? ''),
          zoneId: String(json.data.zone_id ?? ''),
          latitude: Number(json.data.latitude ?? 0),
          longitude: Number(json.data.longitude ?? 0),
          isActive: Boolean(json.data.is_active ?? true),
          methods: [],
        };
        // Add city to the parent zone in the store
        set((state) => ({
          shippingZones: state.shippingZones.map((z) =>
            z.id === city.zone_id
              ? { ...z, cities: [...z.cities, newCity] }
              : z
          ),
        }));
        return { success: true, data: newCity };
      }
      return { success: false, error: json.error?.message ?? 'Failed to add city' };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to add city:', message);
      return { success: false, error: message };
    }
  },
  updateShippingZone: async (id, updates) => {
    try {
      const res = await fetch(`${API_BASE}/shipping/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: updates.name,
          description: updates.description,
          is_active: updates.isActive,
          city_ids: updates.city_ids,
          cities: updates.cities?.map((c) => ({
            id: c.id,
            name: c.name,
            name_ar: c.name_ar,
            latitude: c.latitude,
            longitude: c.longitude,
            methods: c.methods?.map((m) => ({
              id: m.id,
              city_id: m.city_id,
              name: m.name,
              slug: m.slug,
              price: m.price,
              estimated_days: m.estimated_days,
              estimated_hours: m.estimated_hours,
              description: m.description,
              isActive: m.isActive,
            })),
          })),
        }),
      });
      const json = await res.json();
      if (json.success) {
        set((state) => ({
          shippingZones: state.shippingZones.map((z) => (z.id === id ? mapZone(json.data) : z)),
        }));
      }
    } catch (err: unknown) {
      console.error('Failed to update shipping zone:', err);
    }
  },
  deleteShippingZone: async (id) => {
    try {
      const res = await fetch(`${API_BASE}/shipping/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        set((state) => ({ shippingZones: state.shippingZones.filter((z) => z.id !== id) }));
        return { success: true };
      }
      return { success: false, error: json.error?.message ?? 'Failed to delete shipping zone' };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to delete shipping zone:', message);
      return { success: false, error: message };
    }
  },

  // ─── Delivery Method CRUD ────────────────────────────────────────────────
  addDeliveryMethod: async (method) => {
    try {
      const res = await fetch(`${API_BASE}/shipping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'method', ...method }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const newMethod = mapMethod(json.data);
        set((state) => ({
          shippingZones: state.shippingZones.map((z) => {
            if (z.id !== method.zone_id) return z;
            return {
              ...z,
              cities: z.cities.map((c) => {
                if (c.id !== method.city_id) return c;
                return { ...c, methods: [...c.methods, newMethod] };
              }),
            };
          }),
        }));
        return { success: true, data: newMethod };
      }
      return { success: false, error: json.error?.message ?? 'Failed to create delivery method' };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to create delivery method:', message);
      return { success: false, error: message };
    }
  },

  updateDeliveryMethod: async (id, updates) => {
    try {
      const res = await fetch(`${API_BASE}/shipping/method/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const json = await res.json();
      if (json.success) {
        set((state) => ({
          shippingZones: state.shippingZones.map((z) => ({
            ...z,
            cities: z.cities.map((c) => ({
              ...c,
              methods: c.methods.map((m) =>
                m.id === id ? { ...m, ...updates, id: m.id, cityId: m.cityId, zoneId: m.zoneId } : m
              ),
            })),
          })),
        }));
        return { success: true };
      }
      return { success: false, error: json.error?.message ?? 'Failed to update delivery method' };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to update delivery method:', message);
      return { success: false, error: message };
    }
  },

  deleteDeliveryMethod: async (id) => {
    try {
      const res = await fetch(`${API_BASE}/shipping/method/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        set((state) => ({
          shippingZones: state.shippingZones.map((z) => ({
            ...z,
            cities: z.cities.map((c) => ({
              ...c,
              methods: c.methods.filter((m) => m.id !== id),
            })),
          })),
        }));
        return { success: true };
      }
      return { success: false, error: json.error?.message ?? 'Failed to delete delivery method' };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to delete delivery method:', message);
      return { success: false, error: message };
    }
  },
}));
