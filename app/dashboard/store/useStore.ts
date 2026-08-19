
import { create } from 'zustand';
import type {
  PageSection,
  Product,
  Order,
  Customer,
  Notification,
  ShippingZone,
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
  isLoadingNotifications: boolean;
  fetchNotifications: () => Promise<void>;
  markNotificationsRead: () => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;

  // Shipping Zones
  shippingZones: ShippingZone[];
  isLoadingShipping: boolean;
  shippingError: string | null;
  fetchShippingZones: () => Promise<void>;
  addShippingZone: (zone: ShippingZoneInput) => Promise<{ success: boolean; error?: string }>;
  updateShippingZone: (id: string, updates: Partial<ShippingZoneInput>) => Promise<void>;
  deleteShippingZone: (id: string) => Promise<{ success: boolean; error?: string }>;
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

function mapOrder(row: ApiRow): Order {
  return {
    id: String(row.id ?? ''),
    orderNumber: String(row.order_number ?? ''),
    customerId: String(row.customer_id ?? ''),
    customerName: String(row.customer_name ?? ''),
    customerEmail: String(row.customer_email ?? ''),
    customerPhone: String(row.customer_phone ?? ''),
    items: Array.isArray(row.items) ? row.items : [],
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
    createdAt: String(row.created_at ?? ''),
    updatedAt: String(row.updated_at ?? ''),
    timeline: Array.isArray(row.timeline) ? row.timeline : [],
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
  return {
    id: String(row.id ?? ''),
    type: (row.type ?? 'system') as Notification['type'],
    title: String(row.title ?? ''),
    message: String(row.message ?? ''),
    read: Boolean(row.read ?? false),
    timestamp: String(row.timestamp ?? new Date().toISOString()),
    actionUrl: row.action_url ? String(row.action_url) : undefined,
  };
}

// ─── Shipping input types (camelCase payloads sent to the API) ─────────
interface ShippingMethodInput {
  id?: string;
  name: string;
  price?: number;
  estimatedDays?: string;
  freeShippingThreshold?: number | null;
}

interface ShippingZoneInput {
  name: string;
  cities: string[];
  methods: ShippingMethodInput[];
}

// Helper to map a Supabase shipping method row to our method type
function mapMethod(row: ApiRow): ShippingMethod {
  return {
    id: String(row.id ?? ''),
    name: String(row.name ?? ''),
    price: Number(row.price ?? 0),
    estimatedDays: String(row.estimated_days ?? row.estimatedDays ?? '3-5 days'),
    freeShippingThreshold:
      row.free_shipping_threshold != null
        ? Number(row.free_shipping_threshold)
        : row.freeShippingThreshold != null
          ? Number(row.freeShippingThreshold)
          : undefined,
  };
}

// Helper to map a Supabase shipping zone row (with nested methods) to our type
function mapZone(row: ApiRow): ShippingZone {
  const methods = Array.isArray(row.methods) ? row.methods.map(mapMethod) : [];
  return {
    id: String(row.id ?? ''),
    name: String(row.name ?? ''),
    cities: Array.isArray(row.cities) ? (row.cities as string[]) : [],
    methods,
  };
}

export const useStore = create<AppState>((set) => ({
  // Navigation
  currentPage: 'dashboard',
  setCurrentPage: (page) => set({ currentPage: page }),
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  // Products
  products: [],
  isLoadingProducts: false,
  productsError: null,
  fetchProducts: async (status?: string) => {
    set({ isLoadingProducts: true, productsError: null });
    try {
      const url = status && status !== 'all' ? `${API_BASE}/products?status=${encodeURIComponent(status)}` : `${API_BASE}/products`;
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
  updateOrderStatus: async (id, status) => {
    try {
      const res = await fetch(`${API_BASE}/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: status }),
      });
      const json = await res.json();
      if (json.success) {
        set((state) => ({
          orders: state.orders.map((o) => (o.id === id ? mapOrder(json.data) : o)),
        }));
      }
    } catch (err: unknown) {
      console.error('Failed to update order status:', err);
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
  isLoadingNotifications: false,
  fetchNotifications: async () => {
    set({ isLoadingNotifications: true });
    try {
      const res = await fetch(`${API_BASE}/admin/notifications`);
      const json = await res.json();
      if (json.success) {
        const notifications = (json.data ?? []).map(mapNotification);
        set({
          notifications,
          unreadNotifications: notifications.filter((n: Notification) => !n.read).length,
          isLoadingNotifications: false,
        });
      } else {
        set({ isLoadingNotifications: false });
      }
    } catch (err: unknown) {
      set({ isLoadingNotifications: false });
    }
  },
  markNotificationsRead: async () => {
    try {
      await fetch(`${API_BASE}/admin/notifications`, { method: 'PUT' });
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        unreadNotifications: 0,
      }));
    } catch (err: unknown) {
      console.error('Failed to mark notifications as read:', err);
    }
  },
  markNotificationAsRead: async (id) => {
    try {
      set((state) => {
        const updated = state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
        return {
          notifications: updated,
          unreadNotifications: updated.filter((n) => !n.read).length,
        };
      });
    } catch (err: unknown) {
      console.error('Failed to mark notification as read:', err);
    }
  },
  deleteNotification: async (id) => {
    try {
      set((state) => {
        const updated = state.notifications.filter((n) => n.id !== id);
        return {
          notifications: updated,
          unreadNotifications: updated.filter((n: Notification) => !n.read).length,
        };
      });
    } catch (err: unknown) {
      console.error('Failed to delete notification:', err);
    }
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
          cities: zone.cities,
          methods: zone.methods.map((m) => ({
            id: m.id,
            name: m.name,
            price: m.price,
            estimatedDays: m.estimatedDays,
            freeShippingThreshold: m.freeShippingThreshold ?? null,
          })),
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
  updateShippingZone: async (id, updates) => {
    try {
      const res = await fetch(`${API_BASE}/shipping/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: updates.name,
          cities: updates.cities,
          methods: updates.methods?.map((m) => ({
            id: m.id,
            name: m.name,
            price: m.price,
            estimatedDays: m.estimatedDays,
            freeShippingThreshold: m.freeShippingThreshold ?? null,
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
}));
