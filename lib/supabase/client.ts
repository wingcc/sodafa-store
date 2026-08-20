/**
 * Browser/client Supabase client
 * Safe to use from Client Components
 *
 * SECURITY: Uses only public anon key, never service-role key
 */

import { createClient as createSupabaseClient, type SupabaseClient as SupabaseClientType } from '@supabase/supabase-js';
import { publicConfig } from './config';

export type SupabaseClient = SupabaseClientType;

/**
 * Creates a dummy client that throws when used
 */
function createDummyClient() {
  const dummy = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: new Error('Supabase not configured') }),
      getUser: () => Promise.resolve({ data: { user: null }, error: new Error('Supabase not configured') }),
      signInWithPassword: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      signUp: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      signOut: () => Promise.resolve({ error: new Error('Supabase not configured') }),
      resend: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } }, error: null }),
    },
    from: () => ({
      select: () => ({ data: null, error: new Error('Supabase not configured') }),
      insert: () => ({ data: null, error: new Error('Supabase not configured') }),
      update: () => ({ data: null, error: new Error('Supabase not configured') }),
      delete: () => ({ data: null, error: new Error('Supabase not configured') }),
    }),
  };
  return dummy as unknown as SupabaseClient;
}

/**
 * Creates a new client-side Supabase instance
 * Uses NEXT_PUBLIC_* environment variables
 * Safe to expose to browser
 */
export const createClient = (): SupabaseClient => {
  const url = publicConfig.url;
  const anonKey = publicConfig.anonKey;

  if (!url || !anonKey) {
    return createDummyClient();
  }

  return createSupabaseClient(url, anonKey);
};
