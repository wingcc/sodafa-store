/**
 * Supabase Library Index
 *
 * Exports safe, reusable Supabase utilities.
 *
 * SECURITY: The admin client is intentionally NOT exported from this index
 * to prevent accidental client-side imports. Import it directly from
 * './admin' only in server-side code.
 */

// Configuration - safe for both client and server
export { publicConfig, serverConfig, validateEnv } from './config';

// Client-side Supabase instance factory
export { createClient, type SupabaseClient } from './client';

// Server-side Supabase client factory
export { createServerClient, type ServerSupabaseClient } from './server';

// Database types placeholder (to be generated from schema)
export type { Database } from './types';