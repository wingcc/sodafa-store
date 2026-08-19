/**
 * Admin Supabase client
 * SERVER-ONLY - For trusted server-side operations
 *
 * SECURITY: Uses service-role key which bypasses Row Level Security
 * - Never import this file into Client Components
 * - Never expose the service-role key to the browser
 * - Never return the service-role key through an API response
 * - Never use this client in client-side code
 */

import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';
import { publicConfig, serverConfig } from './config';

export type AdminSupabaseClient = SupabaseClient;

/**
 * Creates a dummy client that throws when used
 */
function createDummyClient() {
  const dummy = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: new Error('Supabase admin not configured') }),
    },
    from: () => ({
      select: () => ({ data: null, error: new Error('Supabase admin not configured') }),
      insert: () => ({ data: null, error: new Error('Supabase admin not configured') }),
      update: () => ({ data: null, error: new Error('Supabase admin not configured') }),
      delete: () => ({ data: null, error: new Error('Supabase admin not configured') }),
    }),
  };
  return dummy as unknown as AdminSupabaseClient;
}

/**
 * Admin Supabase instance
 * Uses SUPABASE_SERVICE_ROLE_KEY (server-only)
 *
 * WARNING: This client bypasses Row Level Security.
 * Only use for operations that require elevated privileges,
 * such as admin operations or server-side maintenance tasks.
 */
export const createAdminClient = (): AdminSupabaseClient => {
  const url = publicConfig.url;
  const serviceRoleKey = serverConfig.serviceRoleKey;

  if (!url || !serviceRoleKey) {
    return createDummyClient();
  }

  return createSupabaseClient(url, serviceRoleKey);
};