/*
  # Fix infinite recursion in chamber_memberships RLS policies

  1. Policy Changes
    - Remove problematic self-referencing policies
    - Add simplified policies that avoid circular dependencies
    - Ensure users can read their own memberships
    - Allow chamber admins to manage memberships through direct user_id checks

  2. Security
    - Maintain security while avoiding recursion
    - Use auth.uid() for direct user access
    - Simplify admin access patterns
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Chamber admins can manage memberships" ON chamber_memberships;
DROP POLICY IF EXISTS "Chamber admins can read chamber memberships" ON chamber_memberships;
DROP POLICY IF EXISTS "Users can create their own membership" ON chamber_memberships;
DROP POLICY IF EXISTS "Users can read their own memberships" ON chamber_memberships;

-- Create new simplified policies that avoid recursion

-- Users can read their own memberships (no recursion)
CREATE POLICY "Users can read own memberships"
  ON chamber_memberships
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can create their own membership (no recursion)
CREATE POLICY "Users can create own membership"
  ON chamber_memberships
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own membership (no recursion)
CREATE POLICY "Users can update own membership"
  ON chamber_memberships
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own membership (no recursion)
CREATE POLICY "Users can delete own membership"
  ON chamber_memberships
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Chamber owners can manage all memberships for their chambers
-- This checks the chambers table directly instead of chamber_memberships
CREATE POLICY "Chamber owners can manage memberships"
  ON chamber_memberships
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chambers 
      WHERE chambers.id = chamber_memberships.chamber_id 
      AND chambers.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chambers 
      WHERE chambers.id = chamber_memberships.chamber_id 
      AND chambers.user_id = auth.uid()
    )
  );