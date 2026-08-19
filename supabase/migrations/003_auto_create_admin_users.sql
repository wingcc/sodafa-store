-- Auto-create admin_users record when a new user signs up
-- Note: Database triggers on auth.users can cause 504 timeouts
-- This migration is disabled - user creation is handled in application code instead
-- See app/register/page.tsx for the implementation

-- Create a simple function that can be called manually if needed
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
  ON CONFLICT (id) DO NOTHING; -- Avoid errors if user already exists
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
