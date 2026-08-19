# Fix for HTTP 504 Timeout on Account Creation

## Problem
When creating a new account, users experience an HTTP 504 (Gateway Timeout) error.

## Root Cause
The `supabase/migrations/003_auto_create_admin_users.sql` migration created a database trigger on `auth.users` that caused timeouts due to:
1. RLS policy conflicts with `admin_users` table
2. Synchronous execution blocking the authentication flow
3. Infinite recursion in the original RLS policy

## Solution
Created a new migration `supabase/migrations/003_fix_504_timeout.sql` that:
1. **Drops the problematic trigger** on `auth.users` that caused timeouts
2. **Creates a safe RPC function** `create_admin_user()` that can be called after registration
3. **Grants proper permissions** for authenticated users to execute the function

## How to Apply the Fix

### Option 1: Using Supabase CLI (Recommended)
```bash
cd c:\Users\Readcode\Desktop\my-beauty-store\sodafa-store
supabase db reset
```

### Option 2: Using Supabase Dashboard SQL Editor
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the contents of `supabase/migrations/003_fix_504_timeout.sql`:
```sql
-- Drop ALL triggers on auth.users to prevent timeouts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the problematic function if it exists
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Ensure the safe function exists
CREATE OR REPLACE FUNCTION public.create_admin_user(user_id UUID, user_email TEXT, user_name TEXT DEFAULT NULL)
RETURNS void AS $$
BEGIN
  INSERT INTO public.admin_users (id, email, name, role, status)
  VALUES (
    user_id,
    user_email,
    COALESCE(user_name, user_email),
    'super_admin',
    'active'
  )
  ON CONFLICT (id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_admin_user(UUID, TEXT, TEXT) TO authenticated;
```

4. Also apply the RLS fix from migration `002_fix_admin_users_rls.sql`:
```sql
-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Admin users access" ON admin_users;

-- Create new safe policies
CREATE POLICY "Authenticated users can read admin_users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin full access to admin_users"
  ON admin_users FOR ALL
  USING (auth.uid() = id);
```

## How It Works Now

1. **User registers** → Authentication succeeds (no timeout)
2. **Register page calls** `create_admin_user` RPC function
3. **Function creates** admin_users record with `super_admin` role
4. **User is redirected** to dashboard

## If Admin User Creation Fails
The registration will still succeed. The admin_users record can be created later:
- Manually via Supabase SQL Editor
- Through the Users Management page in the dashboard
- By running the RPC function manually

## Verification
After applying the migration:
1. Try creating a new account at `/register`
2. The account should be created without timeout
3. Check browser console for any errors
4. Verify the user appears in Users Management page

## Files Modified
- `supabase/migrations/003_fix_504_timeout.sql` - New migration to fix timeout
- `app/register/page.tsx` - Calls create_admin_user after registration
- `supabase/migrations/003_auto_create_admin_users.sql` - Deprecated (replaced)

## Important Notes
- The 504 error will **continue** until you apply the migration to your database
- The register page works without the migration, but won't auto-create admin_users
- Admin users can be added manually via the dashboard Users Management page