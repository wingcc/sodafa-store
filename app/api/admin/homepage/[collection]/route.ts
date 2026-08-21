/**
 * Homepage Collection API (list content: testimonials, faqs, benefits, ...)
 * GET  /api/admin/homepage/[collection]            — List items ordered by sort_order
 * POST /api/admin/homepage/[collection]            — Create item
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { successResponse, internalServerError, badRequest, notFound } from '@/lib/api';
import { COLLECTIONS, pickColumns, toErrorMessage } from '../collections';

function resolveCollection(collection: string) {
  const config = COLLECTIONS[collection];
  if (!config) return null;
  return config;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ collection: string }> }
) {
  try {
    const { collection } = await params;
    const config = resolveCollection(collection);
    if (!config) return notFound(`Unknown collection "${collection}"`);

    const admin = createAdminClient();
    const { data, error } = await admin
      .from(config.table)
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return successResponse(data);
  } catch (err: unknown) {
    console.error(`GET /api/admin/homepage/[collection] error:`, err);
    return internalServerError(toErrorMessage(err));
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ collection: string }> }
) {
  try {
    const { collection } = await params;
    const config = resolveCollection(collection);
    if (!config) return notFound(`Unknown collection "${collection}"`);

    const body = await request.json();
    if (!body || typeof body !== 'object') return badRequest('Request body is required');

    // For key-based tables (page_features / floating_buttons), the PK must be provided.
    if (config.pkColumn !== 'id' && !body[config.pkColumn]) {
      return badRequest(`${config.pkColumn} is required`);
    }

    const values = pickColumns(config, body);
    if (Object.keys(values).length === 0) return badRequest('No valid fields provided');

    const admin = createAdminClient();
    const { data, error } = await admin.from(config.table).insert(values).select().single();
    if (error) throw error;

    return successResponse(data, 201);
  } catch (err: unknown) {
    console.error(`POST /api/admin/homepage/[collection] error:`, err);
    return internalServerError(toErrorMessage(err));
  }
}
