/**
 * Shared pricing utilities (single source of truth).
 *
 * Used by: Checkout UI, /api/checkout (order creation), Order Confirmation.
 * Formula: Subtotal + DeliveryFee − Discount = Final Total
 * All money rounded to 2 decimals.
 */

export interface PricedItem {
  price: number;
  qty: number;
}

export interface CouponDef {
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  minimum_order: number;
  maximum_discount: number | null;
}

export interface TotalsInput {
  subtotal: number;
  deliveryFee: number;
  discount: number;
}

export const roundMoney = (value: number): number =>
  Math.round((value + Number.EPSILON) * 100) / 100;

/** Subtotal = Σ unit_price × quantity. */
export const calcSubtotal = (items: PricedItem[]): number =>
  roundMoney(items.reduce((acc, i) => acc + i.price * i.qty, 0));

/**
 * Discount capped by maximum_discount, honoring minimum_order.
 * Never exceeds the subtotal itself.
 */
export const calcDiscount = (subtotal: number, coupon: CouponDef | null | undefined): number => {
  if (!coupon) return 0;
  if (subtotal < (coupon.minimum_order ?? 0)) return 0;

  let discount =
    coupon.discount_type === 'percentage'
      ? (subtotal * coupon.discount_value) / 100
      : coupon.discount_value;

  discount = Math.min(discount, subtotal);
  if (coupon.maximum_discount != null && coupon.maximum_discount > 0) {
    discount = Math.min(discount, coupon.maximum_discount);
  }
  return roundMoney(discount);
};

/** Final total = Subtotal + DeliveryFee − Discount (>= 0). */
export const calcFinalTotal = (input: TotalsInput): number =>
  roundMoney(Math.max(input.subtotal + input.deliveryFee - input.discount, 0));

export interface OrderTotals {
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
}

export interface DeliveryFeeInput {
  methodPrice: number;
  freeShippingThreshold: number | null;
  subtotal: number;
  globalThreshold?: number | null;
}

/**
 * Delivery fee: free when subtotal meets the method's own threshold
 * (or the global fallback threshold), otherwise the method price.
 * Matches the server-side `getDeliveryFee` in lib/server/shipping.ts.
 */
export const calcDeliveryFee = (input: DeliveryFeeInput): number => {
  const threshold =
    typeof input.freeShippingThreshold === 'number'
      ? input.freeShippingThreshold
      : input.globalThreshold ?? null;
  if (typeof threshold === 'number' && input.subtotal >= threshold) return 0;
  return input.methodPrice >= 0 ? roundMoney(input.methodPrice) : 0;
};

/** Full breakdown from items + delivery + coupon. */
export const calcOrderTotals = (
  items: PricedItem[],
  deliveryFee: number,
  coupon: CouponDef | null | undefined
): OrderTotals => {
  const subtotal = calcSubtotal(items);
  const discount = calcDiscount(subtotal, coupon);
  const total = calcFinalTotal({ subtotal, deliveryFee, discount });
  return { subtotal, discount, deliveryFee, total };
};
