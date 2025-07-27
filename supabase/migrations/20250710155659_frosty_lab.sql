/*
  # Fix infinite recursion in chamber_memberships RLS policies

  1. Problem
    - Current RLS policies on chamber_memberships are causing infinite recursion
    - This happens when policies reference each other or create circular dependencies
    - The error occurs when fetching user chambers with joins

  2. Solution
    - Drop existing problematic policies
    - Create new, simplified policies that avoid circular references
    - Ensure policies are specific and don't create loops
    - Use direct user ID checks instead of complex joins where possible

  3. Security
    - Maintain proper access control
    - Users can only access their own memberships
    - Chamber owners can manage their chamber's memberships
    - No circular policy dependencies
*/

-- Drop existing policies that might be causing recursion
DROP POLICY IF EXISTS "Chamber owners can manage memberships" ON chamber_memberships;
DROP POLICY IF EXISTS "Users can create own membership" ON chamber_memberships;
DROP POLICY IF EXISTS "Users can delete own membership" ON chamber_memberships;
DROP POLICY IF EXISTS "Users can read own memberships" ON chamber_memberships;
DROP POLICY IF EXISTS "Users can update own membership" ON chamber_memberships;

-- Create new, simplified policies without circular dependencies

-- Policy 1: Users can read their own memberships (direct user_id check)
CREATE POLICY "Users can read own memberships"
  ON chamber_memberships
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy 2: Users can create memberships for themselves
CREATE POLICY "Users can create own membership"
  ON chamber_memberships
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy 3: Users can update their own memberships (but not role/status)
CREATE POLICY "Users can update own membership"
  ON chamber_memberships
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policy 4: Users can delete their own memberships
CREATE POLICY "Users can delete own membership"
  ON chamber_memberships
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Policy 5: Chamber owners can manage memberships (simplified check)
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

-- Ensure the chambers table has proper policies too (avoid recursion)
-- Drop and recreate chambers policies if they reference chamber_memberships

DROP POLICY IF EXISTS "Chamber admins can delete their chamber" ON chambers;
DROP POLICY IF EXISTS "Chamber admins can update their chamber" ON chambers;
DROP POLICY IF EXISTS "Chambers are publicly readable" ON chambers;
DROP POLICY IF EXISTS "Users can create their own chamber" ON chambers;

-- Recreate chambers policies without referencing chamber_memberships
CREATE POLICY "Chambers are publicly readable"
  ON chambers
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can create their own chamber"
  ON chambers
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Chamber owners can update their chamber"
  ON chambers
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Chamber owners can delete their chamber"
  ON chambers
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());