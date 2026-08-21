/**
 * Homepage Collection Item API
 * PATCH  /api/admin/homepage/[collection]/[id]  — Update item fields
 * DELETE /api/admin/homepage/[collection]/[id]  — Delete item
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { successResponse, internalServerError, badRequest, notFound } from '@/lib/api';
import { COLLECTIONS, pickColumns, toErrorMessage } from '../../collections';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ collection: string; id: string }> }
) {
  try {
    const { collection, id } = await params;
    const config = COLLECTIONS[collection];
    if (!config) return notFound(`Unknown collection "${collection}"`);

    const body = await request.json();
    if (!body || typeof body !== 'object') return badRequest('Request body is required');

    const values = pickColumns(config, body);
    if (Object.keys(values).length === 0) return badRequest('No valid fields provided');

    const admin = createAdminClient();
    const { data, error } = await admin
      .from(config.table)
      .update(values)
      .eq(config.pkColumn, id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return notFound('Item not found');
    return successResponse(data);
  } catch (err: unknown) {
    console.error(`PATCH /api/admin/homepage/[collection]/[id] error:`, err);
    return internalServerError(toErrorMessage(err));
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ collection: string; id: string }> }
) {
  try {
    const { collection, id } = await params;
    const config = COLLECTIONS[collection];
    if (!config) return notFound(`Unknown collection "${collection}"`);

    const admin = createAdminClient();
    const { error } = await admin.from(config.table).delete().eq(config.pkColumn, id);
    if (error) throw error;

    return successResponse({ deleted: true });
  } catch (err: unknown) {
    console.error(`DELETE /api/admin/homepage/[collection]/[id] error:`, err);
    return internalServerError(toErrorMessage(err));
  }
}
