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
 * Creates a dummy client that never throws during `next build` prerender.
 * It is thenable / chainable so queries like
 *   supabase.from('x').select('*').order(...).eq(...)
 * still return a promise that resolves to {data:null, error}.
 */
function createDummyClient() {
  const err = new Error('Supabase not configured');
  const queryStub: any = {
    select: () => queryStub,
    insert: () => queryStub,
    update: () => queryStub,
    delete: () => queryStub,
    upsert: () => queryStub,
    eq: () => queryStub,
    neq: () => queryStub,
    gt: () => queryStub,
    gte: () => queryStub,
    lt: () => queryStub,
    lte: () => queryStub,
    in: () => queryStub,
    ilike: () => queryStub,
    like: () => queryStub,
    or: () => queryStub,
    and: () => queryStub,
    order: () => queryStub,
    limit: () => queryStub,
    range: () => queryStub,
    single: () => Promise.resolve({ data: null, error: err }),
    maybeSingle: () => Promise.resolve({ data: null, error: err }),
    then: (resolve: any) => resolve({ data: null, error: err }),
    catch: (reject: any) => Promise.resolve({ data: null, error: err }).catch(reject),
  };
  const dummy = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: err }),
      getUser: () => Promise.resolve({ data: { user: null }, error: err }),
      signInWithPassword: () => Promise.resolve({ data: null, error: err }),
      signUp: () => Promise.resolve({ data: null, error: err }),
      signOut: () => Promise.resolve({ error: err }),
      resend: () => Promise.resolve({ data: null, error: err }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } }, error: null }),
    },
    from: () => queryStub,
  };
  return dummy as unknown as SupabaseClient;
}

let browserClient: SupabaseClient | null = null;

function isValidSupabaseUrl(url: string | undefined): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) return false;
  try {
    const u = new URL(trimmed);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Returns the single shared browser-side Supabase instance.
 * All components share the same auth state, so signOut() clears the session for everyone.
 */
export const createClient = (): SupabaseClient => {
  if (browserClient) return browserClient;

  const url = publicConfig.url;
  const anonKey = publicConfig.anonKey;

  if (!url || !anonKey || !isValidSupabaseUrl(url)) {
    browserClient = createDummyClient();
  } else {
    try {
      browserClient = createSupabaseClient(url, anonKey);
    } catch {
      browserClient = createDummyClient();
    }
  }

  return browserClient;
};
