/**
 * PATCH /api/inventory/stock — Atomically adjust product stock
 *
 * Body: { productId: string, adjustment: number }
 *   adjustment > 0 = restock (increase)
 *   adjustment < 0 = decrement (decrease)
 *
 * Uses the atomic decrement_stock RPC for decrements to prevent race conditions.
 * Uses direct update for restocks.
 */

import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { ProductRepository } from '@/lib/db';
import { notificationService } from '@/lib/services/notificationService';
import { successResponse, badRequest, internalServerError, notFound } from '@/lib/api';

const Schema = z.object({
  productId: z.string().uuid(),
  adjustment: z.number().int(),
});

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return badRequest('Invalid payload', { issues: parsed.error.issues });
    }

    const { productId, adjustment } = parsed.data;
    if (adjustment === 0) {
      return badRequest('Adjustment must be non-zero');
    }

    const admin = createAdminClient();
    const repo = new ProductRepository(admin);

    // Get current product
    const { data: product, error: findErr } = await repo.findById(productId);
    if (findErr || !product) return notFound('Product not found');

    if (adjustment < 0) {
      // Decrement: use atomic RPC (prevents race condition)
      const qty = Math.abs(adjustment);
      const { success, newStock } = await repo.decrementStock(productId, qty);
      if (!success) {
        return badRequest(`Insufficient stock. Current: ${product.stock}, requested removal: ${qty}`);
      }
      // Send stock alerts
      try {
        const threshold = Number(product.low_stock_threshold ?? 10);
        if (newStock !== undefined && newStock <= 0) {
          await notificationService.notifyOutOfStock(productId, product.name);
        } else if (newStock !== undefined && newStock <= threshold) {
          await notificationService.notifyLowStock(productId, product.name, newStock, threshold);
        }
      } catch (e) {
        console.error('Failed to send stock notification:', e);
      }
      return successResponse({
        id: productId,
        stock: newStock,
        previousStock: product.stock,
        adjustment,
      });
    } else {
      // Restock: direct update is safe (only increases)
      const { data: updated, error: updErr } = await repo.updateStock(productId, adjustment);
      if (updErr) throw updErr;
      return successResponse({
        id: productId,
        stock: updated ?? product.stock + adjustment,
        previousStock: product.stock,
        adjustment,
      });
    }
  } catch (err: any) {
    console.error('PATCH /api/inventory/stock error:', err);
    return internalServerError(err?.message ?? 'Failed to adjust stock');
  }
}
