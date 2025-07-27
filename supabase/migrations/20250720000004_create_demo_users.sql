-- Migration: Create Demo Users and Chamber Data
-- Purpose: Set up demo accounts for testing Chamber Connect functionality

-- Create demo chamber
INSERT INTO chambers (
  id,
  name, 
  slug, 
  description, 
  website, 
  address, 
  phone, 
  email,
  created_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Springfield Chamber of Commerce', 
  'springfield-demo',
  'Demo chamber for testing Chamber Connect features and functionality',
  'https://springfieldchamber.org',
  '123 Main St, Springfield, IL 62701',
  '(555) 123-4567',
  'info@springfieldchamber.org',
  now()
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = now();

-- Create demo business
INSERT INTO businesses (
  id,
  name,
  slug,
  description,
  website,
  address,
  phone,
  email,
  industry,
  chamber_id,
  created_at
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  'Demo Marketing Solutions',
  'demo-marketing',
  'A demo business showcasing Chamber Connect features',
  'https://demomarketing.com',
  '456 Business Ave, Springfield, IL 62701',
  '(555) 234-5678',
  'hello@demomarketing.com',
  'Marketing & Advertising',
  '00000000-0000-0000-0000-000000000001',
  now()
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = now();

-- Note: Demo users need to be created through Supabase Auth
-- This can be done via Supabase dashboard or auth API
-- Demo accounts to create:
-- 1. charles.r.sears@gmail.com (Chamber Admin) - password: demo123
-- 2. sarah.johnson@demomarketing.com (Business Owner) - password: demo123
-- 3. staff@demomarketing.com (Business Staff) - password: demo123

-- Create user profiles for demo accounts (to be run after users are created in auth)
-- These will be linked when the auth users are created

-- Demo chamber membership for Charles (Chamber Admin)
INSERT INTO chamber_memberships (
  id,
  user_id,
  chamber_id,
  role,
  status,
  joined_at,
  created_at
) VALUES (
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000010', -- Will be Charles's user ID
  '00000000-0000-0000-0000-000000000001',
  'admin',
  'active',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- Demo business membership for Sarah (Business Owner)
INSERT INTO business_memberships (
  id,
  user_id,
  business_id,
  role,
  status,
  created_at
) VALUES (
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000011', -- Will be Sarah's user ID
  '00000000-0000-0000-0000-000000000002',
  'owner',
  'active',
  now()
) ON CONFLICT (id) DO NOTHING;

-- Demo event
INSERT INTO events (
  id,
  title,
  description,
  event_date,
  start_time,
  end_time,
  location,
  event_type,
  registration_required,
  max_attendees,
  created_by,
  chamber_id,
  created_at
) VALUES (
  '00000000-0000-0000-0000-000000000005',
  'Monthly Business Networking Breakfast',
  'Join fellow chamber members for coffee, networking, and business development opportunities.',
  (CURRENT_DATE + INTERVAL '7 days'),
  '08:00:00',
  '10:00:00',
  'Springfield Convention Center, Main Hall',
  'networking',
  true,
  50,
  '00000000-0000-0000-0000-000000000010', -- Charles (Chamber Admin)
  '00000000-0000-0000-0000-000000000001',
  now()
) ON CONFLICT (id) DO NOTHING;

-- Demo subscription plan assignment
INSERT INTO chamber_subscriptions (
  id,
  chamber_id,
  plan_id,
  status,
  current_period_start,
  current_period_end,
  created_at
) VALUES (
  '00000000-0000-0000-0000-000000000006',
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM subscription_plans WHERE name = 'Professional' LIMIT 1),
  'active',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '1 month',
  now()
) ON CONFLICT (id) DO NOTHING; 