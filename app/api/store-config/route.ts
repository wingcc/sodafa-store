/**
 * Public Store Config API
 * GET /api/store-config — Returns site config from homepage_content table
 * No authentication required (public read access via RLS)
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { successResponse, internalServerError } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('homepage_content')
      .select('content')
      .eq('key', 'site_info')
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    const siteInfo = data?.content ?? null;
    return successResponse(siteInfo);
  } catch (err: unknown) {
    console.error('GET /api/store-config error:', err);
    return internalServerError('Failed to load store config');
  }
}
