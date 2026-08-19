/**
 * Server-side Supabase client
 * For use in Server Components, Server Actions, and Route Handlers
 *
 * SECURITY: Uses public anon key only
 */

import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';
import { publicConfig } from './config';

export type ServerSupabaseClient = SupabaseClient;

/**
 * Creates a dummy client that throws when used
 */
function createDummyClient() {
  const dummy = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: new Error('Supabase not configured') }),
    },
    from: () => ({
      select: () => ({ data: null, error: new Error('Supabase not configured') }),
      insert: () => ({ data: null, error: new Error('Supabase not configured') }),
      update: () => ({ data: null, error: new Error('Supabase not configured') }),
      delete: () => ({ data: null, error: new Error('Supabase not configured') }),
    }),
  };
  return dummy as unknown as ServerSupabaseClient;
}

/**
 * Server-side Supabase instance
 * Uses NEXT_PUBLIC_* environment variables
 * Safe for server-side data fetching
 */
export const createServerClient = (): ServerSupabaseClient => {
  const url = publicConfig.url;
  const anonKey = publicConfig.anonKey;

  if (!url || !anonKey) {
    return createDummyClient();
  }

  return createSupabaseClient(url, anonKey);
};