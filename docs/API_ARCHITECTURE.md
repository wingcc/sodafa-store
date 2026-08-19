# API Architecture Documentation

This document describes the API architecture for this project.

## Supabase Clients

### Client (`@/lib/supabase`)

The client-side Supabase instance for use in Client Components.

```typescript
import { supabase } from '@/lib/supabase';
```

**Use for**: Client-side data fetching, real-time subscriptions, authentication state.

### Server (`@/lib/supabase`)

Factory function to create server-side Supabase clients.

```typescript
import { createServerClient } from '@/lib/supabase';

const supabase = createServerClient();
```

**Use for**: Server Components, Server Actions, Route Handlers, server-side data fetching.

### Admin (`@/lib/supabase/admin`)

Admin Supabase client using service-role key.

```typescript
import { createAdminClient } from '@/lib/supabase/admin';

const admin = createAdminClient();
```

**Use for**: Trusted server-side operations that require elevated privileges.

**SECURITY**: This client bypasses Row Level Security. Never use in client-side code.

## API Routes

### Structure

```
app/api/
├── health/
│   └── route.ts       # GET /api/health
├── auth/              # Future: Authentication endpoints
├── products/          # Future: Product CRUD
├── categories/        # Future: Category management
├── reviews/           # Future: Reviews and ratings
├── wishlist/          # Future: Wishlist management
├── suggestions/       # Future: Product suggestions
├── orders/            # Future: Order management
└── admin/             # Future: Admin endpoints
```

### Response Format

All API responses follow a consistent structure:

**Success Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... }
  }
}
```

### Error Codes

Common error codes used across the API:

- `BAD_REQUEST` (400)
- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `NOT_FOUND` (404)
- `VALIDATION_ERROR` (422)
- `INTERNAL_SERVER_ERROR` (500)
- `DATABASE_ERROR` (500)
- `RESOURCE_NOT_FOUND` (404)
- `OPERATION_NOT_ALLOWED` (403)

### Using API Utilities

```typescript
import { successResponse, errorResponse, ApiError } from '@/lib/api';

// Success response
export async function GET() {
  const data = await fetchData();
  return successResponse(data);
}

// Error handling
export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Process request
    return successResponse(result);
  } catch (error) {
    const apiError = toApiError(error);
    return errorResponse(apiError.code, apiError.message, apiError.statusCode);
  }
}
```

## Database Layer

### Repositories

Future database operations will be organized into repositories:

```
lib/db/
├── repositories/
│   ├── product.ts    # Product database operations
│   ├── user.ts       # User database operations
│   ├── order.ts      # Order database operations
│   └── ...
└── queries/          # Shared query builders
```

### Usage Pattern

```typescript
// In API routes or server components
import { ProductRepository } from '@/lib/db';

const repo = new ProductRepository(supabase);
const products = await repo.findAll();
```

## Validation

API input validation uses Zod schemas:

```typescript
import { z } from 'zod';
import { validators } from '@/lib/validation';

const createProductSchema = z.object({
  name: validators.string({ min: 1, max: 100 }),
  price: validators.positiveNumber(),
  description: validators.string({ max: 500 }).optional(),
});

// In API route
const validated = createProductSchema.parse(body);
```

## Security

### Environment Variables

**Public (Client-Safe):**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Server-Only:**
- `SUPABASE_SERVICE_ROLE_KEY`

### Best Practices

1. **Never** expose service-role key to client
2. **Never** use admin client in client components
3. **Never** trust client-provided IDs without validation
4. **Always** validate server-side inputs
5. **Always** use Row Level Security in Supabase
6. **Never** expose raw database errors to users
7. **Always** log errors server-side for debugging
8. **Keep** authorization logic server-side

### Error Handling

```typescript
try {
  // API logic
} catch (error) {
  // Log detailed error server-side
  console.error('Detailed error:', error);

  // Return safe error to client
  return internalServerError('An unexpected error occurred');
}
```

## Future Modules

The following modules will be added in future phases:

- **Authentication**: Login, register, password reset, session management
- **Products**: CRUD operations, search, filtering, categories
- **Categories**: Category management, hierarchy
- **Reviews**: Product reviews and ratings
- **Comments**: Product comments and discussions
- **Wishlist**: User wishlist management
- **Orders**: Order creation, tracking, history
- **Suggestions**: Product recommendations
- **Admin Dashboard**: Admin-only endpoints for management
- **Analytics**: Usage and sales analytics

Each module will follow the patterns established in this foundation.