/*
  # Chamber Connect Database Schema

  1. New Tables
    - `chambers` - Chamber information and settings
    - `businesses` - Member businesses with contact details  
    - `events` - Chamber events with RSVP tracking
    - `messages` - Direct messaging between members
    - `connections` - Business-to-business connections
    - `spotlights` - Featured member spotlights
    - `event_attendees` - Event RSVP tracking junction table

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access to chamber pages
    - Add policies for authenticated access to management features

  3. Sample Data
    - Springfield Chamber of Commerce with complete profile
    - Sample businesses, events, messages, connections, and spotlights
*/

-- Create chambers table
CREATE TABLE IF NOT EXISTS chambers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  tagline text DEFAULT '',
  description text DEFAULT '',
  address text DEFAULT '',
  phone text DEFAULT '',
  email text DEFAULT '',
  website text DEFAULT '',
  logo_url text DEFAULT '',
  hero_image_url text DEFAULT '',
  member_count integer DEFAULT 0,
  events_per_month integer DEFAULT 0,
  years_serving integer DEFAULT 0,
  about_section text DEFAULT '',
  services_offered jsonb DEFAULT '[]'::jsonb,
  social_media jsonb DEFAULT '{}'::jsonb,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create businesses table
CREATE TABLE IF NOT EXISTS businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chamber_id uuid REFERENCES chambers(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  category text DEFAULT '',
  address text DEFAULT '',
  phone text DEFAULT '',
  email text DEFAULT '',
  website text DEFAULT '',
  contact_name text DEFAULT '',
  contact_avatar_url text DEFAULT '',
  member_since date DEFAULT CURRENT_DATE,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chamber_id uuid REFERENCES chambers(id) ON DELETE CASCADE,
  organizer_id uuid REFERENCES businesses(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text DEFAULT '',
  event_date timestamptz NOT NULL,
  location text DEFAULT '',
  type text CHECK (type IN ('networking', 'workshop', 'seminar', 'social')) DEFAULT 'networking',
  max_attendees integer DEFAULT 50,
  price decimal(10,2) DEFAULT 0,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create event_attendees junction table
CREATE TABLE IF NOT EXISTS event_attendees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(event_id, business_id)
);

-- Create connections table
CREATE TABLE IF NOT EXISTS connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chamber_id uuid REFERENCES chambers(id) ON DELETE CASCADE,
  business_a_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  business_b_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  status text CHECK (status IN ('pending', 'connected', 'declined')) DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  UNIQUE(business_a_id, business_b_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chamber_id uuid REFERENCES chambers(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  recipient_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  content text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create spotlights table
CREATE TABLE IF NOT EXISTS spotlights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chamber_id uuid REFERENCES chambers(id) ON DELETE CASCADE,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  content text DEFAULT '',
  featured boolean DEFAULT false,
  views integer DEFAULT 0,
  likes integer DEFAULT 0,
  published_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE chambers ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE spotlights ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to chambers
CREATE POLICY "Chambers are publicly readable"
  ON chambers
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create policies for public read access to businesses
CREATE POLICY "Businesses are publicly readable"
  ON businesses
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create policies for public read access to events
CREATE POLICY "Events are publicly readable"
  ON events
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create policies for public read access to event attendees
CREATE POLICY "Event attendees are publicly readable"
  ON event_attendees
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create policies for public read access to spotlights
CREATE POLICY "Spotlights are publicly readable"
  ON spotlights
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create policies for authenticated access to connections
CREATE POLICY "Connections are readable by authenticated users"
  ON connections
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for authenticated access to messages
CREATE POLICY "Messages are readable by authenticated users"
  ON messages
  FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chambers_slug ON chambers(slug);
CREATE INDEX IF NOT EXISTS idx_businesses_chamber_id ON businesses(chamber_id);
CREATE INDEX IF NOT EXISTS idx_businesses_featured ON businesses(featured);
CREATE INDEX IF NOT EXISTS idx_events_chamber_id ON events(chamber_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_featured ON events(featured);
CREATE INDEX IF NOT EXISTS idx_event_attendees_event_id ON event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_connections_business_a ON connections(business_a_id);
CREATE INDEX IF NOT EXISTS idx_connections_business_b ON connections(business_b_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_spotlights_chamber_id ON spotlights(chamber_id);
CREATE INDEX IF NOT EXISTS idx_spotlights_featured ON spotlights(featured);

-- Insert sample chamber
INSERT INTO chambers (
  id,
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
  'Springfield Chamber of Commerce',
  'springfield-chamber',
  'Connecting businesses, building community',
  'The Springfield Chamber of Commerce has been the voice of business in our community for over 50 years. We connect local businesses, advocate for economic growth, and provide valuable resources to help our members thrive.',
  '123 Main Street, Springfield, IL 62701',
  '(555) 123-4567',
  'info@springfieldchamber.org',
  'https://springfieldchamber.org',
  'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200',
  247,
  8,
  50,
  'Our mission is to promote economic development, advocate for business interests, and provide networking opportunities that strengthen our local business community. We serve as the unified voice of business in Springfield and surrounding areas.',
  '["Business Networking Events", "Professional Development Workshops", "Government Advocacy", "Member Directory & Referrals", "Economic Development Support", "Community Event Coordination"]'::jsonb,
  '{"facebook": "https://facebook.com/springfieldchamber", "twitter": "https://twitter.com/springfieldchamber", "linkedin": "https://linkedin.com/company/springfield-chamber", "instagram": "https://instagram.com/springfieldchamber"}'::jsonb,
  '{"showMemberCount": true, "showUpcomingEvents": true, "showMemberSpotlight": true, "allowMemberSignup": true}'::jsonb
);

-- Insert sample businesses
INSERT INTO businesses (
  id,
  chamber_id,
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
) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440000',
  'TechFlow Solutions',
  'Full-service digital marketing agency specializing in B2B lead generation and conversion optimization.',
  'Digital Marketing',
  '123 Innovation Drive, Tech City, TC 12345',
  '(555) 123-4567',
  'hello@techflowsolutions.com',
  'https://techflowsolutions.com',
  'Sarah Johnson',
  'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
  '2023-01-15',
  true
),
(
  '550e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440000',
  'Green Valley Landscaping',
  'Professional landscaping services for residential and commercial properties. Sustainable and eco-friendly solutions.',
  'Landscaping',
  '456 Garden Lane, Green Valley, GV 67890',
  '(555) 234-5678',
  'info@greenvalley.com',
  'https://greenvalley.com',
  'Mike Rodriguez',
  'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
  '2022-03-20',
  false
),
(
  '550e8400-e29b-41d4-a716-446655440003',
  '550e8400-e29b-41d4-a716-446655440000',
  'Elite Financial Advisors',
  'Comprehensive financial planning and investment management services for individuals and businesses.',
  'Financial Services',
  '789 Money Street, Financial District, FD 13579',
  '(555) 345-6789',
  'contact@elitefinancial.com',
  'https://elitefinancial.com',
  'Jennifer Chen',
  'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=400',
  '2021-06-10',
  true
),
(
  '550e8400-e29b-41d4-a716-446655440004',
  '550e8400-e29b-41d4-a716-446655440000',
  'Artisan Coffee Co.',
  'Premium coffee roastery and café. We source ethically and roast locally for the perfect cup every time.',
  'Food & Beverage',
  '321 Coffee Street, Bean Town, BT 24680',
  '(555) 456-7890',
  'hello@artisancoffee.com',
  'https://artisancoffee.com',
  'David Thompson',
  'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
  '2023-02-28',
  false
),
(
  '550e8400-e29b-41d4-a716-446655440005',
  '550e8400-e29b-41d4-a716-446655440000',
  'Precision Manufacturing',
  'Custom metal fabrication and precision manufacturing services for aerospace and automotive industries.',
  'Manufacturing',
  '654 Industrial Blvd, Factory Town, FT 97531',
  '(555) 567-8901',
  'sales@precisionmfg.com',
  'https://precisionmfg.com',
  'Robert Martinez',
  'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=400',
  '2020-09-15',
  false
),
(
  '550e8400-e29b-41d4-a716-446655440006',
  '550e8400-e29b-41d4-a716-446655440000',
  'Wellness Center Plus',
  'Comprehensive health and wellness services including fitness training, nutrition counseling, and wellness coaching.',
  'Health & Wellness',
  '987 Health Way, Wellness City, WC 86420',
  '(555) 678-9012',
  'info@wellnessplus.com',
  'https://wellnessplus.com',
  'Amanda Foster',
  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
  '2022-11-05',
  true
);

-- Insert sample events
INSERT INTO events (
  id,
  chamber_id,
  organizer_id,
  title,
  description,
  event_date,
  location,
  type,
  max_attendees,
  price,
  featured
) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440010',
  '550e8400-e29b-41d4-a716-446655440000',
  NULL,
  'Monthly Business Networking Mixer',
  'Join us for our monthly networking event where local businesses connect, share ideas, and build partnerships. Great food, drinks, and conversations guaranteed!',
  '2024-02-15 18:00:00+00',
  'Chamber Conference Center, 456 Business Blvd',
  'networking',
  80,
  0,
  true
),
(
  '550e8400-e29b-41d4-a716-446655440011',
  '550e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440001',
  'Digital Marketing Workshop',
  'Learn the latest digital marketing strategies and tools to grow your business online. Includes hands-on exercises and real-world case studies.',
  '2024-02-22 14:00:00+00',
  'Business Development Center, 789 Innovation Way',
  'workshop',
  25,
  25,
  false
),
(
  '550e8400-e29b-41d4-a716-446655440012',
  '550e8400-e29b-41d4-a716-446655440000',
  NULL,
  'Leadership Excellence Seminar',
  'Develop your leadership skills with industry experts. Topics include team building, strategic thinking, and effective communication.',
  '2024-02-29 09:00:00+00',
  'Executive Training Center, 321 Leadership Lane',
  'seminar',
  40,
  50,
  false
),
(
  '550e8400-e29b-41d4-a716-446655440013',
  '550e8400-e29b-41d4-a716-446655440000',
  NULL,
  'Chamber Golf Tournament',
  'Annual golf tournament fundraiser. Join fellow chamber members for a day of golf, networking, and fun. All skill levels welcome!',
  '2024-03-05 08:00:00+00',
  'Greenwood Golf Club, 555 Fairway Drive',
  'social',
  100,
  75,
  true
),
(
  '550e8400-e29b-41d4-a716-446655440014',
  '550e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440003',
  'Small Business Finance Workshop',
  'Learn about funding options, financial planning, and cash flow management for small businesses. Expert financial advisors will be present.',
  '2024-03-12 16:00:00+00',
  'Financial Services Center, 888 Money Street',
  'workshop',
  30,
  15,
  false
),
(
  '550e8400-e29b-41d4-a716-446655440015',
  '550e8400-e29b-41d4-a716-446655440000',
  NULL,
  'Technology Innovation Summit',
  'Explore the latest technology trends and their impact on business. Featuring keynote speakers and interactive demonstrations.',
  '2024-03-19 10:00:00+00',
  'Tech Hub Convention Center, 999 Innovation Blvd',
  'seminar',
  150,
  100,
  true
);

-- Insert sample event attendees
INSERT INTO event_attendees (event_id, business_id) VALUES 
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440002'),
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440002'),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440004'),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440005'),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440006');

-- Insert sample connections
INSERT INTO connections (chamber_id, business_a_id, business_b_id, status) VALUES 
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'connected'),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'connected'),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', 'pending'),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005', 'connected');

-- Insert sample messages
INSERT INTO messages (chamber_id, sender_id, recipient_id, content, read) VALUES 
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Hi Sarah! I wanted to thank you for connecting me with that potential client.', true),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'No problem! I thought you two would be a great match. Did you get a chance to speak with them?', true),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Yes, we had a great conversation yesterday. They are very interested in our digital marketing services.', true),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'That is fantastic! I knew you would be able to help them.', true),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Thanks for the referral! I will follow up with them tomorrow.', false),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004', 'I have a client who might be interested in your services.', false),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440005', 'Would you be interested in partnering for the next chamber event?', false);

-- Insert sample spotlights
INSERT INTO spotlights (
  id,
  chamber_id,
  business_id,
  title,
  description,
  content,
  featured,
  views,
  likes,
  published_date
) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440020',
  '550e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440001',
  'Helping Local Businesses Thrive in the Digital Age',
  'TechFlow Solutions has been instrumental in helping over 50 local businesses establish their online presence and generate quality leads through digital marketing strategies.',
  'Since joining the chamber in 2023, Sarah Johnson and her team at TechFlow Solutions have become invaluable members of our business community. Their expertise in digital marketing has helped numerous chamber members increase their online visibility and revenue.',
  true,
  245,
  18,
  '2024-01-10 10:00:00+00'
),
(
  '550e8400-e29b-41d4-a716-446655440021',
  '550e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440002',
  'Sustainable Landscaping Solutions for Our Community',
  'Green Valley Landscaping has transformed dozens of local properties with their eco-friendly landscaping approach.',
  'Mike Rodriguez brings over 15 years of experience in sustainable landscaping to our chamber community. His commitment to environmental responsibility while delivering beautiful results has made him a trusted partner for both residential and commercial projects.',
  false,
  189,
  12,
  '2024-01-05 14:00:00+00'
),
(
  '550e8400-e29b-41d4-a716-446655440022',
  '550e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440003',
  'Securing Financial Futures for Chamber Members',
  'Elite Financial Advisors has helped chamber members plan for retirement and business growth with personalized financial strategies.',
  'Jennifer Chen''s expertise in financial planning has been a tremendous asset to our chamber members. She regularly hosts workshops on business financial planning and has helped numerous members secure their financial futures.',
  true,
  312,
  24,
  '2023-12-28 09:00:00+00'
);