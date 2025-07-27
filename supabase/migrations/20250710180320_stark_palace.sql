/*
  # Fix Chamber Authentication and Data Access

  1. Security Policies
    - Drop and recreate policies for chamber_memberships to ensure users can read their own memberships
    - Drop and recreate policies for chambers to allow reading chambers where user has membership
    - Drop and recreate policies for businesses to allow reading businesses in user's chambers

  2. Performance Indexes
    - Add indexes for chamber membership queries used in authentication
    - Add composite indexes for user_id, role, and status combinations

  3. Demo Data Setup
    - Create demo chamber and admin membership for testing user
    - Ensures authentication flow works properly for development
*/

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Users can read own chamber memberships" ON chamber_memberships;
DROP POLICY IF EXISTS "Users can read chambers where they are members" ON chambers;
DROP POLICY IF EXISTS "Users can read businesses in their chambers" ON businesses;

-- Ensure chamber_memberships can be read by users for their own memberships
-- This is critical for the authentication system to work
CREATE POLICY "Users can read own chamber memberships"
  ON chamber_memberships
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Ensure chambers can be read when user has membership
-- This allows the join in getUserChambers to work
CREATE POLICY "Users can read chambers where they are members"
  ON chambers
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT chamber_id 
      FROM chamber_memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    ) OR
    user_id = auth.uid()  -- Chamber owners can always read their chambers
  );

-- Ensure businesses table has proper access for chamber members
CREATE POLICY "Users can read businesses in their chambers"
  ON businesses
  FOR SELECT
  TO authenticated
  USING (
    chamber_id IN (
      SELECT chamber_id 
      FROM chamber_memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    ) OR
    user_id = auth.uid()  -- Business owners can always read their own business
  );

-- Add indexes for better performance on auth queries
CREATE INDEX IF NOT EXISTS idx_chamber_memberships_user_status 
  ON chamber_memberships(user_id, status);

CREATE INDEX IF NOT EXISTS idx_chamber_memberships_user_role_status 
  ON chamber_memberships(user_id, role, status);

-- Add some test data if the user doesn't have any chamber memberships
-- This ensures the demo user has proper access
DO $$
DECLARE
    demo_user_id uuid := '843e8cdd-4153-47f1-bce5-13dbe9ec8b45';
    demo_chamber_id uuid;
    membership_exists boolean;
BEGIN
    -- Check if the demo user already has chamber memberships
    SELECT EXISTS(
        SELECT 1 FROM chamber_memberships 
        WHERE user_id = demo_user_id AND status = 'active'
    ) INTO membership_exists;
    
    -- If no memberships exist, create a demo chamber and membership
    IF NOT membership_exists THEN
        -- Get or create a demo chamber
        SELECT id INTO demo_chamber_id 
        FROM chambers 
        WHERE slug = 'springfield-chamber' 
        LIMIT 1;
        
        -- If no demo chamber exists, create one
        IF demo_chamber_id IS NULL THEN
            INSERT INTO chambers (
                id,
                user_id,
                name,
                slug,
                tagline,
                description,
                address,
                phone,
                email,
                website,
                logo_url,
                hero_image_url,
                member_count,
                events_per_month,
                years_serving,
                about_section,
                services_offered,
                social_media,
                settings
            ) VALUES (
                '550e8400-e29b-41d4-a716-446655440000',
                demo_user_id,
                'Springfield Chamber of Commerce',
                'springfield-chamber',
                'Building Business, Building Community',
                'The premier business organization serving Springfield and surrounding areas.',
                '123 Main Street, Springfield, IL 62701',
                '(555) 123-4567',
                'info@springfieldchamber.org',
                'https://springfieldchamber.org',
                'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400',
                'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=1200',
                247,
                8,
                25,
                'The Springfield Chamber of Commerce has been the voice of business in our community for over 25 years. We are dedicated to promoting economic growth, supporting local businesses, and fostering connections that drive success.',
                '["Business Networking", "Economic Development", "Advocacy", "Professional Development", "Community Events", "Member Benefits"]',
                '{"facebook": "https://facebook.com/springfieldchamber", "twitter": "https://twitter.com/springfieldcoc", "linkedin": "https://linkedin.com/company/springfield-chamber"}',
                '{"showMemberCount": true, "showUpcomingEvents": true, "showMemberSpotlight": true, "allowMemberSignup": true}'
            )
            RETURNING id INTO demo_chamber_id;
        END IF;
        
        -- Create admin membership for the demo user
        INSERT INTO chamber_memberships (
            user_id,
            chamber_id,
            role,
            status,
            permissions,
            joined_at
        ) VALUES (
            demo_user_id,
            demo_chamber_id,
            'admin',
            'active',
            '{"manage_members": true, "manage_events": true, "manage_content": true}',
            NOW()
        ) ON CONFLICT (user_id, chamber_id) DO NOTHING;
        
        RAISE NOTICE 'Created demo chamber membership for user %', demo_user_id;
    END IF;
END $$;