/*
  # Create Chamber Memberships System

  1. New Tables
    - `chamber_memberships` - Many-to-many relationship between users and chambers
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `chamber_id` (uuid, references chambers)
      - `role` (text, admin/staff/member)
      - `permissions` (jsonb, flexible permissions)
      - `joined_at` (timestamp)
      - `status` (text, active/inactive/pending)

  2. Security
    - Enable RLS on chamber_memberships table
    - Add policies for reading/managing memberships
    - Update existing policies to use membership system

  3. Changes
    - Remove direct user_id from chambers table (keep for backward compatibility)
    - Update businesses table to use chamber_memberships
    - Create helper functions for membership management
*/

-- Create chamber_memberships table
CREATE TABLE IF NOT EXISTS chamber_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  chamber_id uuid REFERENCES chambers(id) ON DELETE CASCADE,
  role text CHECK (role IN ('admin', 'staff', 'member')) DEFAULT 'member',
  permissions jsonb DEFAULT '{}',
  status text CHECK (status IN ('active', 'inactive', 'pending')) DEFAULT 'active',
  joined_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, chamber_id)
);

-- Enable RLS
ALTER TABLE chamber_memberships ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_chamber_memberships_user_id ON chamber_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_chamber_memberships_chamber_id ON chamber_memberships(chamber_id);
CREATE INDEX IF NOT EXISTS idx_chamber_memberships_role ON chamber_memberships(role);
CREATE INDEX IF NOT EXISTS idx_chamber_memberships_status ON chamber_memberships(status);

-- RLS Policies for chamber_memberships
CREATE POLICY "Users can read their own memberships"
  ON chamber_memberships
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Chamber admins can read chamber memberships"
  ON chamber_memberships
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chamber_memberships cm
      WHERE cm.chamber_id = chamber_memberships.chamber_id
      AND cm.user_id = auth.uid()
      AND cm.role IN ('admin', 'staff')
      AND cm.status = 'active'
    )
  );

CREATE POLICY "Chamber admins can manage memberships"
  ON chamber_memberships
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chamber_memberships cm
      WHERE cm.chamber_id = chamber_memberships.chamber_id
      AND cm.user_id = auth.uid()
      AND cm.role = 'admin'
      AND cm.status = 'active'
    )
  );

CREATE POLICY "Users can create their own membership"
  ON chamber_memberships
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Migrate existing chamber admin relationships
INSERT INTO chamber_memberships (user_id, chamber_id, role, status)
SELECT user_id, id, 'admin', 'active'
FROM chambers 
WHERE user_id IS NOT NULL
ON CONFLICT (user_id, chamber_id) DO NOTHING;

-- Migrate existing business owner relationships
INSERT INTO chamber_memberships (user_id, chamber_id, role, status)
SELECT user_id, chamber_id, 'member', 'active'
FROM businesses 
WHERE user_id IS NOT NULL AND chamber_id IS NOT NULL
ON CONFLICT (user_id, chamber_id) DO NOTHING;

-- Helper function to check if user is chamber admin
CREATE OR REPLACE FUNCTION is_chamber_admin(user_uuid uuid, chamber_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM chamber_memberships
    WHERE user_id = user_uuid
    AND chamber_id = chamber_uuid
    AND role = 'admin'
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is chamber member
CREATE OR REPLACE FUNCTION is_chamber_member(user_uuid uuid, chamber_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM chamber_memberships
    WHERE user_id = user_uuid
    AND chamber_id = chamber_uuid
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get user's chambers
CREATE OR REPLACE FUNCTION get_user_chambers(user_uuid uuid)
RETURNS TABLE(chamber_id uuid, chamber_name text, role text) AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.name, cm.role
  FROM chambers c
  JOIN chamber_memberships cm ON c.id = cm.chamber_id
  WHERE cm.user_id = user_uuid AND cm.status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update chambers policies to use membership system
DROP POLICY IF EXISTS "Chamber admins can update their chamber" ON chambers;
DROP POLICY IF EXISTS "Chamber admins can delete their chamber" ON chambers;

CREATE POLICY "Chamber admins can update their chamber"
  ON chambers
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chamber_memberships
      WHERE chamber_id = chambers.id
      AND user_id = auth.uid()
      AND role = 'admin'
      AND status = 'active'
    )
  );

CREATE POLICY "Chamber admins can delete their chamber"
  ON chambers
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chamber_memberships
      WHERE chamber_id = chambers.id
      AND user_id = auth.uid()
      AND role = 'admin'
      AND status = 'active'
    )
  );

-- Update businesses policies to use membership system
DROP POLICY IF EXISTS "Business owners can update their business" ON businesses;
DROP POLICY IF EXISTS "Business owners can delete their business" ON businesses;

CREATE POLICY "Business owners can update their business"
  ON businesses
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM chamber_memberships
      WHERE chamber_id = businesses.chamber_id
      AND user_id = auth.uid()
      AND role IN ('admin', 'staff')
      AND status = 'active'
    )
  );

CREATE POLICY "Business owners can delete their business"
  ON businesses
  FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM chamber_memberships
      WHERE chamber_id = businesses.chamber_id
      AND user_id = auth.uid()
      AND role = 'admin'
      AND status = 'active'
    )
  );

-- Update messages policies to use membership system
DROP POLICY IF EXISTS "Users can read messages they sent or received" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;

CREATE POLICY "Users can read messages they sent or received"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE (businesses.id = messages.sender_id OR businesses.id = messages.recipient_id)
      AND businesses.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM chamber_memberships
      WHERE chamber_id = messages.chamber_id
      AND user_id = auth.uid()
      AND role IN ('admin', 'staff')
      AND status = 'active'
    )
  );

CREATE POLICY "Users can send messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE businesses.id = messages.sender_id
      AND businesses.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM chamber_memberships
      WHERE chamber_id = messages.chamber_id
      AND user_id = auth.uid()
      AND status = 'active'
    )
  );

-- Update connections policies to use membership system
DROP POLICY IF EXISTS "Users can read their connections" ON connections;

CREATE POLICY "Users can read their connections"
  ON connections
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE (businesses.id = connections.business_a_id OR businesses.id = connections.business_b_id)
      AND businesses.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM chamber_memberships
      WHERE chamber_id = connections.chamber_id
      AND user_id = auth.uid()
      AND role IN ('admin', 'staff')
      AND status = 'active'
    )
  );

-- Function to automatically create chamber membership when chamber is created
CREATE OR REPLACE FUNCTION create_chamber_admin_membership()
RETURNS trigger AS $$
BEGIN
  -- Create admin membership for the chamber creator
  INSERT INTO chamber_memberships (user_id, chamber_id, role, status)
  VALUES (NEW.user_id, NEW.id, 'admin', 'active');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic membership creation
DROP TRIGGER IF EXISTS on_chamber_created ON chambers;
CREATE TRIGGER on_chamber_created
  AFTER INSERT ON chambers
  FOR EACH ROW 
  WHEN (NEW.user_id IS NOT NULL)
  EXECUTE FUNCTION create_chamber_admin_membership();

-- Function to automatically create chamber membership when business is created
CREATE OR REPLACE FUNCTION create_business_membership()
RETURNS trigger AS $$
BEGIN
  -- Create member membership for the business owner if they're not already a member
  INSERT INTO chamber_memberships (user_id, chamber_id, role, status)
  VALUES (NEW.user_id, NEW.chamber_id, 'member', 'active')
  ON CONFLICT (user_id, chamber_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic business membership creation
DROP TRIGGER IF EXISTS on_business_created ON businesses;
CREATE TRIGGER on_business_created
  AFTER INSERT ON businesses
  FOR EACH ROW 
  WHEN (NEW.user_id IS NOT NULL AND NEW.chamber_id IS NOT NULL)
  EXECUTE FUNCTION create_business_membership();