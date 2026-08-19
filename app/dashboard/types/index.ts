// SODFA MARKETPLACE - Type Definitions

export type Currency = 'MAD';

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  sku: string;
  stock: number;
  image?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  sku: string;
  brand: string;
  categoryId: string;
  categoryName: string;
  subcategory?: string;
  tags: string[];
  regularPrice: number;
  salePrice?: number;
  costPrice: number;
  currency: Currency;
  stock: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  ADS?: boolean;
  ShowInStor?: boolean;
  images: string[];
  variants: ProductVariant[];
  status: 'active' | 'inactive' | 'draft';
  featured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoSlug?: string;
  seoKeywords?: string[];
  createdAt: string;
  updatedAt: string;
  totalSold: number;
  rating: number;
  reviewCount: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  parentId?: string;
  children?: Category[];
  productCount: number;
  status: 'active' | 'inactive';
  order: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'cash_on_delivery' | 'credit_card' | 'bank_transfer' | 'mobile_payment';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  variant?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  currency: Currency;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    region: string;
    phone: string;
  };
  billingAddress: {
    name: string;
    address: string;
    city: string;
    region: string;
  };
  trackingNumber?: string;
  shippingProvider?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  timeline: OrderTimelineEvent[];
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  totalOrders: number;
  totalSpent: number;
  currency: Currency;
  lastOrderDate: string;
  registeredAt: string;
  status: 'active' | 'inactive' | 'blocked';
  addresses: CustomerAddress[];
  favoriteCategories: string[];
}

export interface CustomerAddress {
  id: string;
  label: string;
  name: string;
  address: string;
  city: string;
  region: string;
  isDefault: boolean;
}

export interface Review {
  id: string;
  customerId: string;
  customerName: string;
  productId: string;
  productName: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  adminReply?: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumOrder: number;
  maximumDiscount?: number;
  applicableTo: 'all' | 'products' | 'categories' | 'customers';
  applicableIds?: string[];
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
  customerUsageLimit: number;
  status: 'active' | 'inactive' | 'expired';
}

export interface Notification {
  id: string;
  type: 'order' | 'customer' | 'stock' | 'review' | 'payment' | 'system';
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  actionUrl?: string;
}

export interface SalesData {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
}

export interface CategorySales {
  name: string;
  value: number;
  color: string;
}

export interface TopProduct {
  id: string;
  name: string;
  category: string;
  image: string;
  unitsSold: number;
  revenue: number;
  stock: number;
}

export interface DashboardStats {
  totalRevenue: number;
  todayRevenue: number;
  monthlyRevenue: number;
  revenueChange: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  ordersChange: number;
  totalCustomers: number;
  newCustomers: number;
  customersChange: number;
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  productsChange: number;
}

export interface ShippingZone {
  id: string;
  name: string;
  cities: string[];
  methods: ShippingMethod[];
}

export interface ShippingMethod {
  id: string;
  name: string;
  price: number;
  estimatedDays: string;
  freeShippingThreshold?: number;
}

export interface StoreSettings {
  storeName: string;
  storeDescription: string;
  logo: string;
  favicon: string;
  contactEmail: string;
  contactPhone: string;
  currency: Currency;
  language: string;
  taxRate: number;
  freeShippingThreshold: number;
}

export type PageSection =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'orders'
  | 'customers'
  | 'inventory'
  | 'reviews'
  | 'coupons'
  | 'shipping'
  | 'payments'
  | 'analytics'
  | 'notifications'
  | 'store'              // ← الصفحة الرئيسية لإدارة المتجر
  | 'store-homepage'     // ← إدارة أقسام الصفحة الرئيسية
  | 'store-banners'      // ← إدارة البانرات
  | 'store-featured'     // ← إدارة المنتجات المميزة
  | 'store-content'      // ← إدارة صفحات المحتوى
  | 'settings';
