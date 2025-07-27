/*
  # Fix Demo Users and Authentication

  1. Updates
    - Add the actual user ID that's being used in authentication
    - Update demo data to match real authentication flow
    - Fix user profile creation

  2. Security
    - Maintain existing RLS policies
    - Ensure proper user relationships
*/

-- Add the actual user ID that's being used
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at
) VALUES 
(
  '843e8cdd-4153-47f1-bce5-13dbe9ec8b45',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'charles.r.sears@gmail.com',
  '$2a$10$rqiU7HKSzjhCnJfU8XOJuOKAiWLDRvtaH8p9fJQy5QJZqJQy5QJZq', -- demo123
  now(),
  null,
  '',
  null,
  '',
  null,
  '',
  '',
  null,
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Charles Sears"}',
  false,
  now(),
  now(),
  null,
  null,
  '',
  '',
  null,
  '',
  0,
  null,
  '',
  null
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  raw_user_meta_data = EXCLUDED.raw_user_meta_data,
  updated_at = now();

-- Add corresponding user profile
INSERT INTO user_profiles (id, email, full_name, role) VALUES 
('843e8cdd-4153-47f1-bce5-13dbe9ec8b45', 'charles.r.sears@gmail.com', 'Charles Sears', 'chamber_admin')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = now();

-- Update the chamber to be owned by this user
UPDATE chambers 
SET user_id = '843e8cdd-4153-47f1-bce5-13dbe9ec8b45'
WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- Create chamber membership for this user
INSERT INTO chamber_memberships (user_id, chamber_id, role, status)
VALUES ('843e8cdd-4153-47f1-bce5-13dbe9ec8b45', '550e8400-e29b-41d4-a716-446655440000', 'admin', 'active')
ON CONFLICT (user_id, chamber_id) DO UPDATE SET
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  updated_at = now();

-- Also create a business profile for this user for testing business features
INSERT INTO businesses (
  id,
  chamber_id,
  user_id,
  name,
  description,
  category,
  address,
  phone,
  email,
  website,
  contact_name,
  contact_avatar_url,
  member_since,
  featured
) VALUES (
  '843e8cdd-4153-47f1-bce5-13dbe9ec8b45',
  '550e8400-e29b-41d4-a716-446655440000',
  '843e8cdd-4153-47f1-bce5-13dbe9ec8b45',
  'Sears Consulting Group',
  'Strategic business consulting and digital transformation services for growing companies.',
  'Business Consulting',
  '789 Executive Plaza, Springfield, IL 62701',
  '(555) 987-6543',
  'charles.r.sears@gmail.com',
  'https://searsconsulting.com',
  'Charles Sears',
  'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
  '2024-01-01',
  true
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  contact_name = EXCLUDED.contact_name,
  email = EXCLUDED.email,
  updated_at = now();