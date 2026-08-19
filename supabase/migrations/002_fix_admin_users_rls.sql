-- Fix infinite recursion in admin_users RLS policy

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Admin users access" ON admin_users;

-- Create a new policy that doesn't cause recursion
-- Since admin operations should use service_role key (which bypasses RLS),
-- we can allow authenticated users to read admin_users for permission checks
CREATE POLICY "Authenticated users can read admin_users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (true);

-- Allow admins to manage admin_users (this uses service_role in practice)
CREATE POLICY "Admin full access to admin_users"
  ON admin_users FOR ALL
  USING (auth.uid() = id);