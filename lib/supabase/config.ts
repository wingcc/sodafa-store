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

function isValidHttpUrl(value: string | undefined): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  // Reject obvious placeholder / garbage values (the repo had " process.env.NEXT_PUBLIC_SUPABASE_URL;")
  if (trimmed.includes('process.env')) return false;
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) return false;
  try {
    const u = new URL(trimmed);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Public Supabase configuration (safe for client-side)
 * Returns undefined when not configured or when value is an invalid placeholder.
 * This prevents "Invalid supabaseUrl" crashes during `next build` prerender.
 */
export const publicConfig = {
  get url(): string | undefined {
    const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    if (!raw || raw.includes('process.env')) return undefined;
    if (!isValidHttpUrl(raw)) return undefined;
    return raw;
  },
  get anonKey(): string | undefined {
    const raw = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
    if (!raw || raw.includes('process.env')) return undefined;
    // anon key is a JWT — basic sanity check
    if (raw.length < 20) return undefined;
    return raw;
  },
};

/**
 * Server-only configuration (never expose to client)
 */
export const serverConfig = {
  get serviceRoleKey(): string | undefined {
    const raw = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    if (!raw || raw.includes('process.env')) return undefined;
    if (raw.length < 20) return undefined;
    return raw;
  },
};

 