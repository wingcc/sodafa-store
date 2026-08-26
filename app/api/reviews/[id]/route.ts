/**
 * Single Review API
 * PUT    /api/reviews/[id]  — Moderate review (admin)
 * DELETE /api/reviews/[id]  — Delete review (admin)
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { ReviewRepository } from '@/lib/db';
import { notificationService } from '@/lib/services/notificationService';
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

    // Send notification for moderation actions
    if (data && body.status) {
      try {
        const review = data as any;
        if (body.status === 'approved') {
          await notificationService.create({
            type: 'review',
            title: 'Review approved',
            message: `Review for "${review.product_name ?? 'product'}" has been approved.`,
            priority: 'medium',
            metadata: { reviewId: id, productName: review.product_name, customerName: review.customer_name },
          });
        } else if (body.status === 'rejected') {
          await notificationService.create({
            type: 'review',
            title: 'Review rejected',
            message: `Review for "${review.product_name ?? 'product'}" has been rejected.`,
            priority: 'medium',
            metadata: { reviewId: id, productName: review.product_name, customerName: review.customer_name },
          });
        }
        if (body.adminReply) {
          await notificationService.create({
            type: 'review',
            title: 'Admin reply sent',
            message: `Admin replied to review by "${review.customer_name ?? 'customer'}".`,
            priority: 'low',
            metadata: { reviewId: id, productName: review.product_name, customerName: review.customer_name },
          });
        }
      } catch (e) {
        console.error('Failed to send review notification:', e);
      }
    }

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