/*
  # Fix chamber access policies

  1. Security
    - Update RLS policies to properly handle chamber admin access
    - Ensure chamber creation works correctly
    - Fix user authentication flow

  2. Changes
    - Update chamber policies for proper access control
    - Add missing INSERT policy for chambers
    - Fix authentication context issues
*/

-- Drop existing policies and recreate them properly
DROP POLICY IF EXISTS "Chambers are publicly readable" ON chambers;
DROP POLICY IF EXISTS "Chamber admins can update their chamber" ON chambers;
DROP POLICY IF EXISTS "Users can create their own chamber" ON chambers;

-- Create comprehensive policies for chambers
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

CREATE POLICY "Chamber admins can update their chamber"
  ON chambers
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Chamber admins can delete their chamber"
  ON chambers
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Ensure the user_id column is properly set for existing demo chamber
UPDATE chambers 
SET user_id = '550e8400-e29b-41d4-a716-446655440100'
WHERE id = '550e8400-e29b-41d4-a716-446655440000' AND user_id IS NULL;

-- Add similar comprehensive policies for businesses
DROP POLICY IF EXISTS "Businesses are publicly readable" ON businesses;
DROP POLICY IF EXISTS "Business owners can update their business" ON businesses;

CREATE POLICY "Businesses are publicly readable"
  ON businesses
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can create their own business"
  ON businesses
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Business owners can update their business"
  ON businesses
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Business owners can delete their business"
  ON businesses
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());