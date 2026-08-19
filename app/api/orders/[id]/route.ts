/**
 * Single Order API
 * GET    /api/orders/[id]  — Get order with items + timeline
 * PUT    /api/orders/[id]  — Update order status (admin)
 * DELETE /api/orders/[id]  — Delete order (admin)
 */

import { createServerClient } from '@/lib/supabase';
import { createAdminClient } from '@/lib/supabase/admin';
import { OrderRepository } from '@/lib/db';
import { successResponse, internalServerError, notFound } from '@/lib/api';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = createAdminClient();
    const repo = new OrderRepository(admin);

    const { data: order, error } = await repo.findById(id);
    if (error || !order) return notFound('Order not found');

    const { data: items } = await repo.findItems(id);
    const { data: timeline } = await repo.findTimeline(id);

    return successResponse({ ...order, items: items ?? [], timeline: timeline ?? [] });
  } catch (err: any) {
    console.error('GET /api/orders/[id] error:', err);
    return internalServerError(err.message);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const admin = createAdminClient();
    const repo = new OrderRepository(admin);

    if (body.orderStatus) {
      const { data, error } = await repo.updateStatus(id, body.orderStatus, body.note);
      if (error) throw error;
      return successResponse(data);
    }

    const { data, error } = await repo.update(id, body);
    if (error) throw error;
    return successResponse(data);
  } catch (err: any) {
    console.error('PUT /api/orders/[id] error:', err);
    return internalServerError(err.message);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = createAdminClient();
    const repo = new OrderRepository(admin);

    const { error } = await repo.delete(id);
    if (error) throw error;
    return successResponse({ deleted: true });
  } catch (err: any) {
    console.error('DELETE /api/orders/[id] error:', err);
    return internalServerError(err.message);
  }
}