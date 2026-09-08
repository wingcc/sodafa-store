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
 * Creates a dummy client that never throws during `next build` prerender.
 * Chainable thenable stub so `from().select().order()` still works.
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
    },
    from: () => queryStub,
  };
  return dummy as unknown as ServerSupabaseClient;
}

/**
 * Server-side Supabase instance
 * Uses NEXT_PUBLIC_* environment variables
 * Safe for server-side data fetching
 */
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

export const createServerClient = (): ServerSupabaseClient => {
  const url = publicConfig.url;
  const anonKey = publicConfig.anonKey;

  if (!url || !anonKey || !isValidSupabaseUrl(url)) {
    return createDummyClient();
  }

  try {
    return createSupabaseClient(url, anonKey);
  } catch {
    return createDummyClient();
  }
};