/**
 * Reviews API
 * GET  /api/reviews        — List reviews
 * POST /api/reviews        — Create review
 */

import { createServerClient } from '@/lib/supabase';
import { createAdminClient } from '@/lib/supabase/admin';
import { ReviewRepository } from '@/lib/db';
import { notificationService } from '@/lib/services/notificationService';
import { successResponse, internalServerError, badRequest } from '@/lib/api';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const admin = createAdminClient();
    const repo = new ReviewRepository(admin);

    const { data, error } = await repo.findAll({
      status: searchParams.get('status') ?? undefined,
      productId: searchParams.get('productId') ?? undefined,
      search: searchParams.get('search') ?? undefined,
      limit: Number(searchParams.get('limit')) || undefined,
      offset: Number(searchParams.get('offset')) || undefined,
    });

    if (error) throw error;
    return successResponse(data);
  } catch (err: any) {
    console.error('GET /api/reviews error:', err);
    return internalServerError(err.message);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const admin = createAdminClient();
    const repo = new ReviewRepository(admin);

    if (!body.rating || !body.productId) {
      return badRequest('Rating and productId are required');
    }
    if (body.rating < 1 || body.rating > 5) {
      return badRequest('Rating must be between 1 and 5');
    }

    const { data, error } = await repo.create({
      customer_id: body.customerId ?? null,
      customer_name: body.customerName ?? 'Anonymous',
      product_id: body.productId,
      product_name: body.productName ?? '',
      rating: body.rating,
      comment: body.comment ?? '',
      status: body.status ?? 'pending',
    });

    if (error) throw error;

    // Create notification for new review
    if (data) {
      await notificationService.notifyNewReview(
        data.id,
        data.product_name,
        data.customer_name,
        data.rating
      );
    }

    return successResponse(data, 201);
  } catch (err: any) {
    console.error('POST /api/reviews error:', err);
    return internalServerError(err.message);
  }
}