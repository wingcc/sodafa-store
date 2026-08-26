// ═══════════════════════════════════════════════════════════════
// SODFA STORE - Auto-generated Database Types
// ═══════════════════════════════════════════════════════════════
// These match the SQL schema in supabase/migrations/001_initial_schema.sql
// Run `npx supabase gen types typescript --project-id <id> > lib/supabase/types.ts` to regenerate

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: CategoryRow;
        Insert: CategoryInsert;
        Update: CategoryUpdate;
      };
      products: {
        Row: ProductRow;
        Insert: ProductInsert;
        Update: ProductUpdate;
      };
      product_variants: {
        Row: ProductVariantRow;
        Insert: ProductVariantInsert;
        Update: ProductVariantUpdate;
      };
      customers: {
        Row: CustomerRow;
        Insert: CustomerInsert;
        Update: CustomerUpdate;
      };
      customer_addresses: {
        Row: CustomerAddressRow;
        Insert: CustomerAddressInsert;
        Update: CustomerAddressUpdate;
      };
      orders: {
        Row: OrderRow;
        Insert: OrderInsert;
        Update: OrderUpdate;
      };
      order_items: {
        Row: OrderItemRow;
        Insert: OrderItemInsert;
        Update: OrderItemUpdate;
      };
      order_timeline: {
        Row: OrderTimelineRow;
        Insert: OrderTimelineInsert;
        Update: OrderTimelineUpdate;
      };
      reviews: {
        Row: ReviewRow;
        Insert: ReviewInsert;
        Update: ReviewUpdate;
      };
      coupons: {
        Row: CouponRow;
        Insert: CouponInsert;
        Update: CouponUpdate;
      };
      notifications: {
        Row: NotificationRow;
        Insert: NotificationInsert;
        Update: NotificationUpdate;
      };
      admin_users: {
        Row: AdminUserRow;
        Insert: AdminUserInsert;
        Update: AdminUserUpdate;
      };
      delivery_zones: {
        Row: DeliveryZoneRow;
        Insert: DeliveryZoneInsert;
        Update: DeliveryZoneUpdate;
      };
      delivery_cities: {
        Row: DeliveryCityRow;
        Insert: DeliveryCityInsert;
        Update: DeliveryCityUpdate;
      };
      delivery_methods: {
        Row: DeliveryMethodRow;
        Insert: DeliveryMethodInsert;
        Update: DeliveryMethodUpdate;
      };
      store_settings: {
        Row: StoreSettingRow;
        Insert: StoreSettingInsert;
        Update: StoreSettingUpdate;
      };
      visitors: {
        Row: VisitorRow;
        Insert: VisitorInsert;
        Update: VisitorUpdate;
      };
      sessions: {
        Row: SessionRow;
        Insert: SessionInsert;
        Update: SessionUpdate;
      };
      page_views: {
        Row: PageViewRow;
        Insert: PageViewInsert;
        Update: PageViewUpdate;
      };
      visitor_events: {
        Row: VisitorEventRow;
        Insert: VisitorEventInsert;
        Update: VisitorEventUpdate;
      };
    };
    Enums: {
      product_status: 'active' | 'inactive' | 'draft';
      order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
      payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
      payment_method: 'cash_on_delivery' | 'credit_card' | 'bank_transfer' | 'mobile_payment';
      review_status: 'pending' | 'approved' | 'rejected';
      coupon_discount_type: 'percentage' | 'fixed' | 'free_shipping';
      coupon_applicable_to: 'all' | 'products' | 'categories' | 'customers';
      coupon_status: 'active' | 'inactive' | 'expired';
      notification_type: 'order' | 'customer' | 'stock' | 'review' | 'payment' | 'system' | 'product' | 'shipping' | 'promotion' | 'social' | 'inventory' | 'security' | 'account' | 'message' | 'achievement' | 'reminder' | 'subscription' | 'support' | 'analytics' | 'team' | 'event' | 'custom';
      notification_priority: 'low' | 'medium' | 'high' | 'urgent';
      admin_role: 'super_admin' | 'manager' | 'editor' | 'support';
      customer_status: 'active' | 'inactive' | 'blocked';
      category_status: 'active' | 'inactive';
      device_type: 'desktop' | 'mobile' | 'tablet' | 'other';
      visitor_type: 'new' | 'returning';
      event_type: 'page_view' | 'add_to_cart' | 'remove_from_cart' | 'begin_checkout' | 'purchase' | 'search' | 'scroll' | 'click' | 'wishlist_add' | 'wishlist_remove' | 'coupon_apply' | 'product_view' | 'category_view';
    };
  };
};

// ──────────────────────────────────────────────────────────────
// CATEGORIES
// ──────────────────────────────────────────────────────────────
export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  parent_id: string | null;
  product_count: number;
  status: Database['public']['Enums']['category_status'];
  sort_order: number;
  created_at: string;
  updated_at: string;
}
export interface CategoryInsert {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent_id?: string | null;
  product_count?: number;
  status?: Database['public']['Enums']['category_status'];
  sort_order?: number;
}
export type CategoryUpdate = Partial<CategoryInsert>;

// ──────────────────────────────────────────────────────────────
// PRODUCTS
// ──────────────────────────────────────────────────────────────
export interface ProductRow {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  full_description: string;
  sku: string;
  brand: string;
  category_id: string | null;
  subcategory: string | null;
  tags: string[];
  regular_price: number;
  sale_price: number | null;
  cost_price: number;
  currency: string;
  stock: number;
  low_stock_threshold: number;
  track_inventory: boolean;
  ADS: boolean;
  ShowInStor: boolean;
  images: Json;
  status: Database['public']['Enums']['product_status'];
  featured: boolean;
  seo_title: string | null;
  seo_description: string | null;
  seo_slug: string | null;
  seo_keywords: string[];
  total_sold: number;
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
}
export interface ProductInsert {
  id?: string;
  name: string;
  slug: string;
  short_description?: string;
  full_description?: string;
  sku: string;
  brand?: string;
  category_id?: string | null;
  subcategory?: string | null;
  tags?: string[];
  regular_price: number;
  sale_price?: number | null;
  cost_price?: number;
  currency?: string;
  stock?: number;
  low_stock_threshold?: number;
  track_inventory?: boolean;
  ADS?: boolean;
  ShowInStor?: boolean;
  images?: Json;
  status?: Database['public']['Enums']['product_status'];
  featured?: boolean;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_slug?: string | null;
  seo_keywords?: string[];
  total_sold?: number;
  rating?: number;
  review_count?: number;
}
export type ProductUpdate = Partial<ProductInsert>;

// ──────────────────────────────────────────────────────────────
// PRODUCT VARIANTS
// ──────────────────────────────────────────────────────────────
export interface ProductVariantRow {
  id: string;
  product_id: string;
  name: string;
  price: number;
  sku: string;
  stock: number;
  image: string | null;
  created_at: string;
}
export interface ProductVariantInsert {
  id?: string;
  product_id: string;
  name: string;
  price: number;
  sku: string;
  stock?: number;
  image?: string | null;
}
export type ProductVariantUpdate = Partial<ProductVariantInsert>;

// ──────────────────────────────────────────────────────────────
// CUSTOMERS
// ──────────────────────────────────────────────────────────────
export interface CustomerRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  avatar: string | null;
  total_orders: number;
  total_spent: number;
  currency: string;
  last_order_date: string | null;
  registered_at: string;
  status: Database['public']['Enums']['customer_status'];
  favorite_categories: string[];
}
export interface CustomerInsert {
  id?: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  avatar?: string | null;
  total_orders?: number;
  total_spent?: number;
  currency?: string;
  last_order_date?: string | null;
  status?: Database['public']['Enums']['customer_status'];
  favorite_categories?: string[];
}
export type CustomerUpdate = Partial<CustomerInsert>;

// ──────────────────────────────────────────────────────────────
// CUSTOMER ADDRESSES
// ──────────────────────────────────────────────────────────────
export interface CustomerAddressRow {
  id: string;
  customer_id: string;
  label: string;
  name: string;
  address: string;
  city: string;
  region: string | null;
  phone: string | null;
  is_default: boolean;
  created_at: string;
}
export interface CustomerAddressInsert {
  id?: string;
  customer_id: string;
  label?: string;
  name: string;
  address: string;
  city: string;
  region?: string | null;
  phone?: string | null;
  is_default?: boolean;
}
export type CustomerAddressUpdate = Partial<CustomerAddressInsert>;

// ──────────────────────────────────────────────────────────────
// ORDERS
// ──────────────────────────────────────────────────────────────
export interface OrderRow {
  id: string;
  order_number: string;
  customer_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  subtotal: number;
  discount: number;
  shipping_cost: number;
  total: number;
  currency: string;
  payment_method: Database['public']['Enums']['payment_method'];
  payment_status: Database['public']['Enums']['payment_status'];
  order_status: Database['public']['Enums']['order_status'];
  shipping_address: Json;
  billing_address: Json;
  tracking_number: string | null;
  shipping_provider: string | null;
  notes: string | null;
  delivery_method: string | null;
  coupon_code: string | null;
  created_at: string;
  updated_at: string;
}
export interface OrderInsert {
  id?: string;
  order_number?: string;
  customer_id?: string | null;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  subtotal: number;
  discount?: number;
  shipping_cost?: number;
  total: number;
  currency?: string;
  payment_method?: Database['public']['Enums']['payment_method'];
  payment_status?: Database['public']['Enums']['payment_status'];
  order_status?: Database['public']['Enums']['order_status'];
  shipping_address?: Json;
  billing_address?: Json;
  tracking_number?: string | null;
  shipping_provider?: string | null;
  notes?: string | null;
  delivery_method?: string | null;
  coupon_code?: string | null;
}
export type OrderUpdate = Partial<OrderInsert>;

// ──────────────────────────────────────────────────────────────
// ORDER ITEMS
// ──────────────────────────────────────────────────────────────
export interface OrderItemRow {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string;
  variant: string | null;
  quantity: number;
  unit_price: number;
  total: number;
}
export interface OrderItemInsert {
  id?: string;
  order_id: string;
  product_id?: string | null;
  product_name: string;
  product_image?: string;
  variant?: string | null;
  quantity?: number;
  unit_price: number;
  total: number;
}
export type OrderItemUpdate = Partial<OrderItemInsert>;

// ──────────────────────────────────────────────────────────────
// ORDER TIMELINE
// ──────────────────────────────────────────────────────────────
export interface OrderTimelineRow {
  id: string;
  order_id: string;
  status: Database['public']['Enums']['order_status'];
  timestamp: string;
  note: string | null;
}
export interface OrderTimelineInsert {
  id?: string;
  order_id: string;
  status: Database['public']['Enums']['order_status'];
  timestamp?: string;
  note?: string | null;
}
export type OrderTimelineUpdate = Partial<OrderTimelineInsert>;

// ──────────────────────────────────────────────────────────────
// REVIEWS
// ──────────────────────────────────────────────────────────────
export interface ReviewRow {
  id: string;
  customer_id: string | null;
  customer_name: string;
  product_id: string;
  product_name: string;
  rating: number;
  comment: string;
  status: Database['public']['Enums']['review_status'];
  admin_reply: string | null;
  created_at: string;
}
export interface ReviewInsert {
  id?: string;
  customer_id?: string | null;
  customer_name?: string;
  product_id: string;
  product_name?: string;
  rating: number;
  comment?: string;
  status?: Database['public']['Enums']['review_status'];
  admin_reply?: string | null;
}
export type ReviewUpdate = Partial<ReviewInsert>;

// ──────────────────────────────────────────────────────────────
// COUPONS
// ──────────────────────────────────────────────────────────────
export interface CouponRow {
  id: string;
  code: string;
  description: string;
  discount_type: Database['public']['Enums']['coupon_discount_type'];
  discount_value: number;
  minimum_order: number;
  maximum_discount: number | null;
  applicable_to: Database['public']['Enums']['coupon_applicable_to'];
  applicable_ids: string[];
  start_date: string;
  end_date: string;
  usage_limit: number;
  used_count: number;
  customer_usage_limit: number;
  status: Database['public']['Enums']['coupon_status'];
  created_at: string;
}
export interface CouponInsert {
  id?: string;
  code: string;
  description?: string;
  discount_type?: Database['public']['Enums']['coupon_discount_type'];
  discount_value: number;
  minimum_order?: number;
  maximum_discount?: number | null;
  applicable_to?: Database['public']['Enums']['coupon_applicable_to'];
  applicable_ids?: string[];
  start_date?: string;
  end_date: string;
  usage_limit?: number;
  used_count?: number;
  customer_usage_limit?: number;
  status?: Database['public']['Enums']['coupon_status'];
}
export type CouponUpdate = Partial<CouponInsert>;

// ──────────────────────────────────────────────────────────────
// NOTIFICATIONS
// ──────────────────────────────────────────────────────────────
export interface NotificationRow {
  id: string;
  type: Database['public']['Enums']['notification_type'];
  title: string;
  message: string;
  read: boolean;
  starred: boolean;
  priority: Database['public']['Enums']['notification_priority'];
  metadata: Json;
  action_url: string | null;
  timestamp: string;
}
export interface NotificationInsert {
  id?: string;
  type?: Database['public']['Enums']['notification_type'];
  title: string;
  message?: string;
  read?: boolean;
  starred?: boolean;
  priority?: Database['public']['Enums']['notification_priority'];
  metadata?: Json;
  action_url?: string | null;
}
export type NotificationUpdate = Partial<NotificationInsert>;

// ──────────────────────────────────────────────────────────────
// ADMIN USERS
// ──────────────────────────────────────────────────────────────
export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: Database['public']['Enums']['admin_role'];
  avatar: string | null;
  last_login: string | null;
  status: Database['public']['Enums']['customer_status'];
  created_at: string;
}
export interface AdminUserInsert {
  id?: string;
  name: string;
  email: string;
  role?: Database['public']['Enums']['admin_role'];
  avatar?: string | null;
  last_login?: string | null;
  status?: Database['public']['Enums']['customer_status'];
}
export type AdminUserUpdate = Partial<AdminUserInsert>;

// ──────────────────────────────────────────────────────────────
// DELIVERY ZONES
// ──────────────────────────────────────────────────────────────
export interface DeliveryZoneRow {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
export interface DeliveryZoneInsert {
  id?: string;
  name: string;
  description?: string;
  is_active?: boolean;
}
export type DeliveryZoneUpdate = Partial<DeliveryZoneInsert>;

// ──────────────────────────────────────────────────────────────
// DELIVERY CITIES
// ──────────────────────────────────────────────────────────────
export interface DeliveryCityRow {
  id: string;
  name: string;
  name_ar: string;
  zone_id: string;
  latitude: number;
  longitude: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
export interface DeliveryCityInsert {
  id?: string;
  name: string;
  name_ar?: string;
  zone_id: string;
  latitude?: number;
  longitude?: number;
  is_active?: boolean;
}
export type DeliveryCityUpdate = Partial<DeliveryCityInsert>;

// ──────────────────────────────────────────────────────────────
// DELIVERY METHODS
// ──────────────────────────────────────────────────────────────
export interface DeliveryMethodRow {
  id: string;
  city_id: string;
  zone_id: string;
  name: string;
  slug: string;
  price: number;
  estimated_days: number;
  estimated_hours: number | null;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
export interface DeliveryMethodInsert {
  id?: string;
  city_id: string;
  zone_id: string;
  name: string;
  slug?: string;
  price?: number;
  estimated_days?: number;
  estimated_hours?: number | null;
  description?: string;
  is_active?: boolean;
}
export type DeliveryMethodUpdate = Partial<DeliveryMethodInsert>;

// ──────────────────────────────────────────────────────────────
// STORE SETTINGS
// ──────────────────────────────────────────────────────────────
export interface StoreSettingRow {
  id: string;
  key: string;
  value: string;
  updated_at: string;
}
export interface StoreSettingInsert {
  id?: string;
  key: string;
  value?: string;
}
export type StoreSettingUpdate = Partial<StoreSettingInsert>;

// ──────────────────────────────────────────────────────────────
// VISITOR ANALYTICS (013_visitor_analytics)
// ──────────────────────────────────────────────────────────────
export type DeviceType = 'desktop' | 'mobile' | 'tablet' | 'other';
export type VisitorType = 'new' | 'returning';
export type EventType =
  | 'page_view' | 'add_to_cart' | 'remove_from_cart' | 'begin_checkout'
  | 'purchase' | 'search' | 'scroll' | 'click' | 'wishlist_add'
  | 'wishlist_remove' | 'coupon_apply' | 'product_view' | 'category_view';

export interface VisitorRow {
  id: string;
  fingerprint: string;
  visitor_type: VisitorType;
  country: string | null;
  city: string | null;
  region: string | null;
  language: string | null;
  consent_analytics: boolean;
  consent_marketing: boolean;
  first_seen_at: string;
  last_seen_at: string;
  page_views_count: number;
  sessions_count: number;
  created_at: string;
  updated_at: string;
}
export interface VisitorInsert {
  id?: string;
  fingerprint: string;
  visitor_type?: VisitorType;
  country?: string | null;
  city?: string | null;
  region?: string | null;
  language?: string | null;
  consent_analytics?: boolean;
  consent_marketing?: boolean;
  first_seen_at?: string;
  last_seen_at?: string;
  page_views_count?: number;
  sessions_count?: number;
}
export type VisitorUpdate = Partial<VisitorInsert>;

export interface SessionRow {
  id: string;
  visitor_id: string;
  session_token: string;
  device: DeviceType;
  device_brand: string | null;
  browser: string | null;
  browser_version: string | null;
  os: string | null;
  os_version: string | null;
  screen_width: number | null;
  screen_height: number | null;
  referrer_url: string | null;
  referrer_domain: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  landing_page: string | null;
  exit_page: string | null;
  page_views: number;
  events_count: number;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  is_bounce: boolean;
  created_at: string;
}
export interface SessionInsert {
  id?: string;
  visitor_id: string;
  session_token: string;
  device?: DeviceType;
  device_brand?: string | null;
  browser?: string | null;
  browser_version?: string | null;
  os?: string | null;
  os_version?: string | null;
  screen_width?: number | null;
  screen_height?: number | null;
  referrer_url?: string | null;
  referrer_domain?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  landing_page?: string | null;
  exit_page?: string | null;
  page_views?: number;
  events_count?: number;
  started_at?: string;
  ended_at?: string | null;
  duration_seconds?: number | null;
  is_bounce?: boolean;
}
export type SessionUpdate = Partial<SessionInsert>;

export interface PageViewRow {
  id: string;
  session_id: string;
  visitor_id: string;
  page_url: string;
  page_path: string;
  page_title: string | null;
  page_type: string;
  product_id: string | null;
  category_id: string | null;
  referrer: string | null;
  time_on_page: number | null;
  scroll_depth: number | null;
  created_at: string;
}
export interface PageViewInsert {
  id?: string;
  session_id: string;
  visitor_id: string;
  page_url: string;
  page_path: string;
  page_title?: string | null;
  page_type?: string;
  product_id?: string | null;
  category_id?: string | null;
  referrer?: string | null;
  time_on_page?: number | null;
  scroll_depth?: number | null;
}
export type PageViewUpdate = Partial<PageViewInsert>;

export interface VisitorEventRow {
  id: string;
  session_id: string;
  visitor_id: string;
  page_view_id: string | null;
  event_type: EventType;
  event_name: string | null;
  event_data: Json | null;
  page_url: string | null;
  created_at: string;
}
export interface VisitorEventInsert {
  id?: string;
  session_id: string;
  visitor_id: string;
  page_view_id?: string | null;
  event_type: EventType;
  event_name?: string | null;
  event_data?: Json | null;
  page_url?: string | null;
}
export type VisitorEventUpdate = Partial<VisitorEventInsert>;