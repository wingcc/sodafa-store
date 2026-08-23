/**
 * Browser/client Supabase client — singleton
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

let browserClient: SupabaseClient | null = null;

/**
 * Returns the single shared browser-side Supabase instance.
 * All components share the same auth state, so signOut() clears the session for everyone.
 */
export const createClient = (): SupabaseClient => {
  if (browserClient) return browserClient;

  const url = publicConfig.url;
  const anonKey = publicConfig.anonKey;

  if (!url || !anonKey) {
    browserClient = createDummyClient();
  } else {
    browserClient = createSupabaseClient(url, anonKey);
  }

  return browserClient;
};
