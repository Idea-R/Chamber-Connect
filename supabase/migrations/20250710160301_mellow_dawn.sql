/*
  # Fix RLS policies for user data access

  This migration adds missing RLS policies to prevent timeout errors when fetching user data.
  The timeout occurs because authenticated users cannot access their own data due to missing
  or incorrect RLS policies.

  ## New Policies Added

  1. **user_profiles table**
     - Allow authenticated users to read their own profile data
     - Allow authenticated users to insert their own profile data
     - Allow authenticated users to update their own profile data

  2. **chamber_memberships table** 
     - Allow authenticated users to read chambers they are members of (via memberships)

  3. **businesses table**
     - Allow authenticated users to read businesses in chambers they are members of

  4. **chambers table**
     - Allow authenticated users to read chambers they are members of

  ## Security
  - All policies use auth.uid() to ensure users can only access their own data
  - Policies follow the principle of least privilege
  - No changes to existing working policies
*/

-- Enable RLS on user_profiles if not already enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing overly permissive policy on user_profiles
DROP POLICY IF EXISTS "Allow all operations on user_profiles" ON user_profiles;

-- Add specific policies for user_profiles
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Add policy for chamber_memberships to allow reading chambers user is member of
CREATE POLICY "Users can read chambers they are members of"
  ON chambers
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT chamber_id 
      FROM chamber_memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Add policy for businesses to allow reading businesses in chambers user is member of
CREATE POLICY "Users can read businesses in their chambers"
  ON businesses
  FOR SELECT
  TO authenticated
  USING (
    chamber_id IN (
      SELECT chamber_id 
      FROM chamber_memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Ensure chamber_memberships has proper read policy for user's own memberships
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'chamber_memberships' 
    AND policyname = 'Users can read own memberships'
  ) THEN
    CREATE POLICY "Users can read own memberships"
      ON chamber_memberships
      FOR SELECT
      TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;