/** POST /api/checkout — create a real COD order (admin client, trusted). */
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { createOrder, type CheckoutPayload } from '@/lib/server/checkout';
import { successResponse, internalServerError, badRequest } from '@/lib/api';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const CheckoutSchema = z.object({
      fullName: z.string().min(1, 'Full name is required'),
      phone: z.string().min(8, 'Phone number is required'),
      email: z.string().email('Invalid email').optional(),
      address: z.string().min(1, 'Address is required'),
      city: z.string().min(1, 'City is required'),
      deliveryMethodId: z.string().min(1, 'Delivery method is required'),
      couponCode: z.string().optional(),
      notes: z.string().optional(),
      items: z.array(z.object({
        productId: z.string(), productName: z.string(), productImage: z.string(),
        qty: z.number().int().positive(), unitPrice: z.number().nonnegative(),
      })).min(1, 'Cart is empty'),
    });
    const parsed = CheckoutSchema.safeParse(body);
    if (!parsed.success) return badRequest('Validation failed', { issues: parsed.error.issues });
    const admin = createAdminClient();
    const { order, customer } = await createOrder(admin, parsed.data as CheckoutPayload);
    return successResponse({ order, customer }, 201);
  } catch (err: any) {
    console.error('POST /api/checkout error:', err);
    return internalServerError(err?.message ?? 'Failed to create order');
  }
}