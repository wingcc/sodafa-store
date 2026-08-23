/**
 * Single Review API
 * PUT    /api/reviews/[id]  — Moderate review (admin)
 * DELETE /api/reviews/[id]  — Delete review (admin)
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { ReviewRepository } from '@/lib/db';
import { successResponse, internalServerError } from '@/lib/api';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const admin = createAdminClient();
    const repo = new ReviewRepository(admin);

    // Full update (edit review content)
    if (body.customerName !== undefined || body.rating !== undefined || body.comment !== undefined) {
      const updates: Record<string, any> = {};
      if (body.customerName !== undefined) updates.customer_name = body.customerName;
      if (body.rating !== undefined) updates.rating = body.rating;
      if (body.comment !== undefined) updates.comment = body.comment;
      const { data, error } = await repo.update(id, updates);
      if (error) throw error;
      return successResponse(data);
    }

    // Moderate (status + admin reply)
    const { data, error } = await repo.moderate(
      id,
      body.status,
      body.adminReply
    );

    if (error) throw error;
    return successResponse(data);
  } catch (err: any) {
    console.error('PUT /api/reviews/[id] error:', err);
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
    const repo = new ReviewRepository(admin);

    const { error } = await repo.delete(id);
    if (error) throw error;
    return successResponse({ deleted: true });
  } catch (err: any) {
    console.error('DELETE /api/reviews/[id] error:', err);
    return internalServerError(err.message);
  }
}