-- Fix HTTP 504 timeout on account creation
-- This drops any problematic triggers on auth.users that cause timeouts

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