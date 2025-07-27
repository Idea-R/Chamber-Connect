/*
  # Fix RLS infinite recursion policies

  This migration fixes the infinite recursion issue in RLS policies by:
  1. Dropping and recreating problematic policies on businesses table
  2. Simplifying chamber_memberships policies to avoid circular dependencies
  3. Fixing messages and connections policies to prevent recursion
  4. Ensuring all policies use direct checks without complex nested queries
*/

-- Drop ALL existing policies on businesses table first
DROP POLICY IF EXISTS "Users can read businesses in their chambers" ON businesses;
DROP POLICY IF EXISTS "Business owners can update their business" ON businesses;
DROP POLICY IF EXISTS "Business owners can delete their business" ON businesses;
DROP POLICY IF EXISTS "Businesses are publicly readable" ON businesses;
DROP POLICY IF EXISTS "Users can create their own business" ON businesses;

-- Create simplified policies for businesses table
CREATE POLICY "Business owners can manage their business"
  ON businesses
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Businesses are publicly readable"
  ON businesses
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Drop ALL existing policies on chamber_memberships table
DROP POLICY IF EXISTS "Chamber owners can manage memberships" ON chamber_memberships;
DROP POLICY IF EXISTS "Users can create own membership" ON chamber_memberships;
DROP POLICY IF EXISTS "Users can delete own membership" ON chamber_memberships;
DROP POLICY IF EXISTS "Users can read own memberships" ON chamber_memberships;
DROP POLICY IF EXISTS "Users can update own membership" ON chamber_memberships;

-- Recreate chamber membership policies without circular dependencies
CREATE POLICY "Users can manage own membership"
  ON chamber_memberships
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Chamber owners can manage all memberships"
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

-- Drop ALL existing policies on messages table
DROP POLICY IF EXISTS "Users can read messages they sent or received" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;

-- Create simplified messages policies
CREATE POLICY "Users can read their messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    sender_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    ) OR
    recipient_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages from their business"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

-- Drop ALL existing policies on connections table
DROP POLICY IF EXISTS "Users can read their connections" ON connections;

-- Create simplified connections policy
CREATE POLICY "Users can read their connections"
  ON connections
  FOR SELECT
  TO authenticated
  USING (
    business_a_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    ) OR
    business_b_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );