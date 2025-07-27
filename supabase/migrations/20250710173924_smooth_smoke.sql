/*
  # Fix All RLS Policy Infinite Recursion Issues

  This migration completely removes all problematic RLS policies and recreates them
  with simple, non-recursive logic to prevent infinite recursion errors.

  ## Changes Made:
  1. Drop all existing policies on all tables
  2. Recreate simple, non-recursive policies
  3. Ensure no circular dependencies between tables
  4. Use direct auth.uid() checks where possible
*/

-- =====================================================
-- DISABLE RLS TEMPORARILY TO CLEAN UP
-- =====================================================

-- Temporarily disable RLS to clean up policies
ALTER TABLE chambers DISABLE ROW LEVEL SECURITY;
ALTER TABLE chamber_memberships DISABLE ROW LEVEL SECURITY;
ALTER TABLE businesses DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE connections DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees DISABLE ROW LEVEL SECURITY;
ALTER TABLE spotlights DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- DROP ALL EXISTING POLICIES
-- =====================================================

-- Drop all chamber policies
DROP POLICY IF EXISTS "Chambers are publicly readable" ON chambers;
DROP POLICY IF EXISTS "Users can create their own chamber" ON chambers;
DROP POLICY IF EXISTS "Chamber owners can update their chamber" ON chambers;
DROP POLICY IF EXISTS "Chamber owners can delete their chamber" ON chambers;
DROP POLICY IF EXISTS "Users can read chambers they are members of" ON chambers;
DROP POLICY IF EXISTS "Chamber owners can delete their chamber" ON chambers;
DROP POLICY IF EXISTS "Chamber owners can update their chamber" ON chambers;

-- Drop all chamber_memberships policies
DROP POLICY IF EXISTS "Users can manage own membership" ON chamber_memberships;
DROP POLICY IF EXISTS "Chamber owners can manage all memberships" ON chamber_memberships;
DROP POLICY IF EXISTS "Users can read own memberships" ON chamber_memberships;
DROP POLICY IF EXISTS "Users can create own membership" ON chamber_memberships;
DROP POLICY IF EXISTS "Users can update own membership" ON chamber_memberships;
DROP POLICY IF EXISTS "Users can delete own membership" ON chamber_memberships;
DROP POLICY IF EXISTS "Chamber owners can manage memberships" ON chamber_memberships;

-- Drop all business policies
DROP POLICY IF EXISTS "Business owners can manage their business" ON businesses;
DROP POLICY IF EXISTS "Businesses are publicly readable" ON businesses;
DROP POLICY IF EXISTS "Users can read businesses in their chambers" ON businesses;
DROP POLICY IF EXISTS "Business owners can update their business" ON businesses;
DROP POLICY IF EXISTS "Business owners can delete their business" ON businesses;
DROP POLICY IF EXISTS "Users can create their own business" ON businesses;

-- Drop all user_profiles policies
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Drop all messages policies
DROP POLICY IF EXISTS "Users can read their messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages from their business" ON messages;
DROP POLICY IF EXISTS "Users can read messages they sent or received" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;

-- Drop all connections policies
DROP POLICY IF EXISTS "Users can read their connections" ON connections;

-- Drop all events policies
DROP POLICY IF EXISTS "Events are publicly readable" ON events;

-- Drop all event_attendees policies
DROP POLICY IF EXISTS "Event attendees are publicly readable" ON event_attendees;

-- Drop all spotlights policies
DROP POLICY IF EXISTS "Spotlights are publicly readable" ON spotlights;

-- =====================================================
-- RE-ENABLE RLS
-- =====================================================

ALTER TABLE chambers ENABLE ROW LEVEL SECURITY;
ALTER TABLE chamber_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE spotlights ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREATE SIMPLE, NON-RECURSIVE POLICIES
-- =====================================================

-- USER_PROFILES: Simple policies based on auth.uid()
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

-- CHAMBERS: Simple policies based on user_id
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

-- CHAMBER_MEMBERSHIPS: Simple policies based on user_id only
CREATE POLICY "Users can read own memberships"
  ON chamber_memberships
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own membership"
  ON chamber_memberships
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own membership"
  ON chamber_memberships
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own membership"
  ON chamber_memberships
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- BUSINESSES: Simple policies based on user_id
CREATE POLICY "Businesses are publicly readable"
  ON businesses
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Business owners can manage their business"
  ON businesses
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- MESSAGES: Simple policies using direct business ownership check
CREATE POLICY "Users can read their messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    sender_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()) OR
    recipient_id IN (SELECT id FROM businesses WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can send messages from their business"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id IN (SELECT id FROM businesses WHERE user_id = auth.uid())
  );

-- CONNECTIONS: Simple policies using direct business ownership check
CREATE POLICY "Users can read their connections"
  ON connections
  FOR SELECT
  TO authenticated
  USING (
    business_a_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()) OR
    business_b_id IN (SELECT id FROM businesses WHERE user_id = auth.uid())
  );

-- EVENTS: Public read access
CREATE POLICY "Events are publicly readable"
  ON events
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- EVENT_ATTENDEES: Public read access
CREATE POLICY "Event attendees are publicly readable"
  ON event_attendees
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- SPOTLIGHTS: Public read access
CREATE POLICY "Spotlights are publicly readable"
  ON spotlights
  FOR SELECT
  TO anon, authenticated
  USING (true);