/**
 * Supabase Configuration
 * Centralized environment variable access
 */

import { z } from 'zod';

/**
 * Validates required Supabase environment variables exist
 * Returns validation result without throwing
 */
export function validateEnv() {
  const envSchema = z.object({
    NEXT_PUBLIC_SUPABASE_URL: z.string().url('https://vwlnxbrlcbjjcxznhvja.supabase.co'),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3bG54YnJsY2JqamN4em5odmphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyNzI3NDEsImV4cCI6MjEwMTg0ODc0MX0.M_2x9ViudhtwqUcSldJnsnQlplsZxFXuMgfWT4AhHms'),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3bG54YnJsY2JqamN4em5odmphIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjI3Mjc0MSwiZXhwIjoyMTAxODQ4NzQxfQ.pwlgv9uKvDwPc-gDU8jGXFo1-u_dZUcOjJaQnWKF5TM'),
  });

  return envSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });
}

/**
 * Public Supabase configuration (safe for client-side)
 */
export const publicConfig = {
  get url() {
    return process.env.NEXT_PUBLIC_SUPABASE_URL;
  },
  get anonKey() {
    return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  },
};

/**
 * Server-only configuration (never expose to client)
 */
export const serverConfig = {
  get serviceRoleKey() {
    return process.env.SUPABASE_SERVICE_ROLE_KEY;
  },
};

 