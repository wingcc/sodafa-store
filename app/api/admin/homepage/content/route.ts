/**
 * Homepage Content Blocks API (singleton JSON blocks)
 * GET /api/admin/homepage/content?key=hero  — Get one block
 * GET /api/admin/homepage/content           — Get all blocks as {key: content}
 * PUT /api/admin/homepage/content           — Upsert { key, content }
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { successResponse, internalServerError, badRequest } from '@/lib/api';
import { toErrorMessage } from '../collections';

// Whitelist of allowed content block keys
const ALLOWED_KEYS = [
  'site_info',
  'hero',
  'pricing',
  'about',
  'video',
  'seo',
  'legal',
  'order_steps',
  'flash',
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    const admin = createAdminClient();

    if (key) {
      if (!ALLOWED_KEYS.includes(key)) return badRequest(`Unknown content key "${key}"`);
      const { data, error } = await admin
        .from('homepage_content')
        .select('content')
        .eq('key', key)
        .single();
      if (error && error.code !== 'PGRST116') throw error; // ignore "no rows"
      return successResponse(data?.content ?? null);
    }

    const { data, error } = await admin.from('homepage_content').select('key, content');
    if (error) throw error;

    const blocks: Record<string, unknown> = {};
    for (const row of data ?? []) blocks[row.key] = row.content;
    return successResponse(blocks);
  } catch (err: unknown) {
    console.error('GET /api/admin/homepage/content error:', err);
    return internalServerError(toErrorMessage(err));
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { key, content } = body ?? {};

    if (!key || !ALLOWED_KEYS.includes(key)) {
      return badRequest(`A valid content key is required (one of: ${ALLOWED_KEYS.join(', ')})`);
    }
    if (content === undefined || content === null || typeof content !== 'object') {
      return badRequest('content must be an object');
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from('homepage_content')
      .upsert({ key, content, updated_at: new Date().toISOString() }, { onConflict: 'key' })
      .select()
      .single();

    if (error) throw error;
    return successResponse(data);
  } catch (err: unknown) {
    console.error('PUT /api/admin/homepage/content error:', err);
    return internalServerError(toErrorMessage(err));
  }
}
