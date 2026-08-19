c# Supabase Setup Guide

This document explains how to configure and use Supabase in this project.

## Environment Variables

Create a `.env.local` file in the root directory (do not commit this file):

```env
# Public variables - safe to expose to the browser
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Server-only variable - NEVER expose to the client
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Public Variables (Client-Side)

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon/public key

These are prefixed with `NEXT_PUBLIC_` and can be safely used in client components.

### Server-Only Variables

- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

**NEVER** expose this key to the client. It bypasses Row Level Security and should only be used in server-side code.

## Supabase Client Usage

### Client-Side (Browser)

```typescript
'use client';

import { supabase } from '@/lib/supabase';

// Use in Client Components
const { data, error } = await supabase.from('products').select('*');
```

### Server-Side (Server Components, Server Actions, Route Handlers)

```typescript
import { createServerClient } from '@/lib/supabase';

// Create a new instance for each request
const supabase = createServerClient();
const { data, error } = await supabase.from('products').select('*');
```

### Admin (Server-Only, Trusted Operations)

```typescript
import { createAdminClient } from '@/lib/supabase/admin';

// Only use for operations requiring elevated privileges
const admin = createAdminClient();
// WARNING: This bypasses Row Level Security
```

**SECURITY**: Never import the admin client in client components.

## Generating Database Types

After creating your database schema, generate TypeScript types:

```bash
# Generate types from your Supabase project
npx supabase gen types typescript --project-id <your-project-id> > lib/supabase/types.ts
```

This will populate `lib/supabase/types.ts` with full type safety for:
- Database tables
- Table columns and types
- Database functions
- Enums
- Views

## Project Structure

```
lib/supabase/
├── client.ts       # Browser client (uses public anon key)
├── server.ts       # Server client factory (uses public anon key)
├── admin.ts        # Admin client (uses service-role key, server-only)
├── config.ts       # Environment variable validation
├── types.ts        # Generated database types
└── index.ts        # Public exports
```

## Security Best Practices

1. **Never** expose `SUPABASE_SERVICE_ROLE_KEY` to the client
2. **Never** use the admin client in client-side code
3. **Never** store secrets in source code
4. Use environment variables for all sensitive data
5. Validate server-side inputs
6. Do not trust client-provided IDs or permissions
7. Keep authorization server-side
8. Do not expose raw database errors to users
9. Use Row Level Security (RLS) in Supabase
10. The admin client should only be used for trusted server-side operations

## Next Steps

1. Set up your `.env.local` file with your Supabase credentials
2. Create your database schema
3. Generate database types using the command above
4. Start building your features!