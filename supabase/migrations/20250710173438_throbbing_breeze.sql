/*
  # Fix Chamber RLS Policies

  1. Security Changes
    - Remove problematic RLS policies that cause infinite recursion
    - Simplify chamber access policies to prevent circular references
    - Ensure chamber memberships can be queried without recursion

  2. Policy Updates
    - Update chamber policies to avoid self-referencing joins
    - Maintain security while preventing infinite recursion
*/

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Users can read chambers they are members of" ON chambers;

-- Recreate a simpler policy that doesn't cause recursion
CREATE POLICY "Users can read chambers they are members of"
  ON chambers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM chamber_memberships 
      WHERE chamber_memberships.chamber_id = chambers.id 
        AND chamber_memberships.user_id = auth.uid() 
        AND chamber_memberships.status = 'active'
    )
  );

-- Ensure chamber_memberships policies don't reference chambers in a way that causes recursion
DROP POLICY IF EXISTS "Chamber owners can manage all memberships" ON chamber_memberships;
DROP POLICY IF EXISTS "Users can manage own membership" ON chamber_memberships;

-- Recreate chamber_memberships policies without circular references
CREATE POLICY "Chamber owners can manage all memberships"
  ON chamber_memberships
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM chambers
      WHERE chambers.id = chamber_memberships.chamber_id
        AND chambers.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM chambers
      WHERE chambers.id = chamber_memberships.chamber_id
        AND chambers.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own membership"
  ON chamber_memberships
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Add a policy for users to read their own memberships
CREATE POLICY "Users can read own memberships"
  ON chamber_memberships
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());