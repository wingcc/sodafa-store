/**
 * Single Category API
 * GET    /api/categories/[id]  — Get category
 * PUT    /api/categories/[id]  — Update category (admin)
 * DELETE /api/categories/[id]  — Delete category (admin)
 */

import { createServerClient } from '@/lib/supabase';
import { createAdminClient } from '@/lib/supabase/admin';
import { CategoryRepository } from '@/lib/db';
import { successResponse, internalServerError, notFound } from '@/lib/api';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServerClient();
    const repo = new CategoryRepository(supabase);

    const { data, error } = await repo.findById(id);
    if (error) return notFound('Category not found');
    return successResponse(data);
  } catch (err: any) {
    console.error('GET /api/categories/[id] error:', err);
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
    const repo = new CategoryRepository(admin);

    const updates: Record<string, any> = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.slug !== undefined) updates.slug = body.slug;
    if (body.description !== undefined) updates.description = body.description;
    if (body.image !== undefined) updates.image = body.image;
    if (body.parentId !== undefined) updates.parent_id = body.parentId;
    if (body.status !== undefined) updates.status = body.status;
    if (body.sortOrder !== undefined) updates.sort_order = body.sortOrder;

    const { data, error } = await repo.update(id, updates);
    if (error) throw error;
    return successResponse(data);
  } catch (err: any) {
    console.error('PUT /api/categories/[id] error:', err);
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
    const repo = new CategoryRepository(admin);

    const { error } = await repo.delete(id);
    if (error) throw error;
    return successResponse({ deleted: true });
  } catch (err: any) {
    console.error('DELETE /api/categories/[id] error:', err);
    return internalServerError(err.message);
  }
}