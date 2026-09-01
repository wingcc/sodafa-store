/**
 * Public homepage sections API
 * GET /api/homepage-sections — returns active homepage sections
 * Uses admin client to bypass RLS, so unauthenticated (incognito) users
 * still see Flash Sale and Products sections.
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { successResponse, internalServerError } from '@/lib/api';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('homepage_sections')
      .select('*')
      .order('order', { ascending: true });

    if (error) throw error;
    return successResponse(data ?? []);
  } catch (err: any) {
    console.error('GET /api/homepage-sections error:', err);
    return internalServerError(err.message ?? 'Failed to fetch homepage sections');
  }
}
