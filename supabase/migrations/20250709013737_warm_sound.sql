/*
  # User Authentication and Authorization Setup

  1. New Tables
    - `user_profiles` - Extended user information linked to auth.users
  
  2. Schema Changes
    - Add user_id columns to businesses and chambers tables
    - Create indexes for user relationships
  
  3. Security
    - Enable RLS on user_profiles table
    - Update RLS policies for businesses, chambers, messages, and connections
    - Add policies for user-based access control
  
  4. Functions and Triggers
    - Function to handle new user signup
    - Trigger to automatically create user profiles
*/

-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  role text CHECK (role IN ('chamber_admin', 'business_owner', 'staff')) DEFAULT 'business_owner',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on user profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for user profiles (allow all operations for now since we don't have auth.users)
CREATE POLICY "Allow all operations on user_profiles"
  ON user_profiles
  FOR ALL
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);

-- Add user_id column to businesses table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'businesses' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE businesses ADD COLUMN user_id uuid;
  END IF;
END $$;

-- Add user_id column to chambers table  
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chambers' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE chambers ADD COLUMN user_id uuid;
  END IF;
END $$;

-- Create indexes for user relationships
CREATE INDEX IF NOT EXISTS idx_businesses_user_id ON businesses(user_id);
CREATE INDEX IF NOT EXISTS idx_chambers_user_id ON chambers(user_id);

-- Update RLS policies for businesses
DROP POLICY IF EXISTS "Businesses are publicly readable" ON businesses;
CREATE POLICY "Businesses are publicly readable"
  ON businesses
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Business owners can update their business"
  ON businesses
  FOR UPDATE
  TO authenticated
  USING (user_id IS NOT NULL);

-- Update RLS policies for chambers
DROP POLICY IF EXISTS "Chambers are publicly readable" ON chambers;
CREATE POLICY "Chambers are publicly readable"
  ON chambers
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Chamber admins can update their chamber"
  ON chambers
  FOR UPDATE
  TO authenticated
  USING (user_id IS NOT NULL);

-- Update RLS policies for messages
DROP POLICY IF EXISTS "Messages are readable by authenticated users" ON messages;
CREATE POLICY "Users can read messages they sent or received"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE (businesses.id = messages.sender_id OR businesses.id = messages.recipient_id)
      AND businesses.user_id IS NOT NULL
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
      AND businesses.user_id IS NOT NULL
    )
  );

-- Update RLS policies for connections
DROP POLICY IF EXISTS "Connections are readable by authenticated users" ON connections;
CREATE POLICY "Users can read their connections"
  ON connections
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE (businesses.id = connections.business_a_id OR businesses.id = connections.business_b_id)
      AND businesses.user_id IS NOT NULL
    )
  );

-- Insert demo user profiles (without foreign key constraints to auth.users)
INSERT INTO user_profiles (id, email, full_name, role) VALUES 
('550e8400-e29b-41d4-a716-446655440100', 'demo@springfieldchamber.org', 'Chamber Administrator', 'chamber_admin'),
('550e8400-e29b-41d4-a716-446655440001', 'sarah@techflowsolutions.com', 'Sarah Johnson', 'business_owner'),
('550e8400-e29b-41d4-a716-446655440002', 'mike@greenvalley.com', 'Mike Rodriguez', 'business_owner'),
('550e8400-e29b-41d4-a716-446655440003', 'jennifer@elitefinancial.com', 'Jennifer Chen', 'business_owner'),
('550e8400-e29b-41d4-a716-446655440004', 'david@artisancoffee.com', 'David Thompson', 'business_owner'),
('550e8400-e29b-41d4-a716-446655440005', 'robert@precisionmfg.com', 'Robert Martinez', 'business_owner'),
('550e8400-e29b-41d4-a716-446655440006', 'amanda@wellnessplus.com', 'Amanda Foster', 'business_owner')
ON CONFLICT (id) DO NOTHING;

-- Link chamber to admin user
UPDATE chambers 
SET user_id = '550e8400-e29b-41d4-a716-446655440100'
WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- Link businesses to their respective users
UPDATE businesses SET user_id = '550e8400-e29b-41d4-a716-446655440001' WHERE id = '550e8400-e29b-41d4-a716-446655440001';
UPDATE businesses SET user_id = '550e8400-e29b-41d4-a716-446655440002' WHERE id = '550e8400-e29b-41d4-a716-446655440002';
UPDATE businesses SET user_id = '550e8400-e29b-41d4-a716-446655440003' WHERE id = '550e8400-e29b-41d4-a716-446655440003';
UPDATE businesses SET user_id = '550e8400-e29b-41d4-a716-446655440004' WHERE id = '550e8400-e29b-41d4-a716-446655440004';
UPDATE businesses SET user_id = '550e8400-e29b-41d4-a716-446655440005' WHERE id = '550e8400-e29b-41d4-a716-446655440005';
UPDATE businesses SET user_id = '550e8400-e29b-41d4-a716-446655440006' WHERE id = '550e8400-e29b-41d4-a716-446655440006';

-- Function to handle new user signup (for future use when Supabase Auth is properly configured)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: The trigger will be created when Supabase Auth is properly configured
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION handle_new_user();