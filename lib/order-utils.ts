// lib/order-utils.ts

export interface TrackedOrderItem {
  productName: string;
  quantity: number;
  total: number;
  unitPrice?: number;
  productId?: string;
  image?: string;
}

export interface TrackedShippingAddress {
  city: string;
  address: string;
  name: string;
  phone?: string;
  email?: string | null;
}

export interface OrderTrackingData {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: TrackedOrderItem[];
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod?: string;
  deliveryMethod?: string;
  couponCode?: string | null;
  trackingNumber?: string | null;
  shippingProvider?: string | null;
  notes?: string | null;
  shippingAddress: TrackedShippingAddress;
  createdAt: string;
  timeline: Array<{ status: string; timestamp: string; note?: string }>;
}

/**
 * Fetch a single order by its order number.
 *
 * Delegates to the server-side /api/orders/track endpoint which uses the
 * service-role key so Row Level Security does NOT block anonymous (guest)
 * lookups.
 */
export async function fetchOrderByNumber(orderNumber: string): Promise<OrderTrackingData | null> {
  try {
    const response = await fetch(`/api/orders/track?orderNumber=${encodeURIComponent(orderNumber)}`);

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    return result.data as OrderTrackingData;
  } catch (err) {
    console.error('fetchOrderByNumber error:', err);
    return null;
  }
}
