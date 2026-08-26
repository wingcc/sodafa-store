/**
 * Categories API
 * GET  /api/categories        — List categories (public)
 * POST /api/categories        — Create category (admin)
 */

import { createServerClient } from '@/lib/supabase';
import { createAdminClient } from '@/lib/supabase/admin';
import { CategoryRepository } from '@/lib/db';
import { notificationService } from '@/lib/services/notificationService';
import { successResponse, internalServerError, badRequest } from '@/lib/api';

export async function GET(request: Request) {
  try {
    const supabase = createServerClient();
    const repo = new CategoryRepository(supabase);

    const { data, error } = await repo.findAll();
    if (error) throw error;
    return successResponse(data);
  } catch (err: any) {
    console.error('GET /api/categories error:', err);
    return internalServerError(err.message);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const admin = createAdminClient();
    const repo = new CategoryRepository(admin);

    if (!body.name) {
      return badRequest('Name is required');
    }

    const { data, error } = await repo.create({
      name: body.name,
      slug: body.slug ?? body.name.toLowerCase().replace(/\s+/g, '-'),
      description: body.description ?? '',
      image: body.image ?? '',
      parent_id: body.parentId ?? null,
      status: body.status ?? 'active',
      sort_order: body.sortOrder ?? 0,
    });

    if (error) throw error;

    // Send notification
    try {
      await notificationService.create({
        type: 'product',
        title: 'New category created',
        message: `Category "${body.name}" has been created.`,
        priority: 'low',
        metadata: { categoryId: data?.id, name: body.name },
      });
    } catch (e) {
      console.error('Failed to send category notification:', e);
    }

    return successResponse(data, 201);
  } catch (err: any) {
    console.error('POST /api/categories error:', err);
    return internalServerError(err.message);
  }
}