/*
  # Event Management 2.0 Enhancement

  1. Enhanced Events Table
    - Add virtual/hybrid support with meeting links
    - Event status tracking (draft, published, cancelled, completed)
    - Enhanced pricing models (early bird, member/non-member)
    - Waitlist management
    - Custom registration fields

  2. New Tables
    - `event_sessions` - Multi-session events support
    - `event_check_ins` - Digital check-in/check-out tracking
    - `event_speakers` - Speaker management
    - `event_sponsors` - Event sponsorship tracking
    - `event_feedback` - Post-event surveys and feedback
    - `event_registrations` - Enhanced registration with custom fields

  3. Virtual Event Features
    - Zoom/Teams integration support
    - Virtual networking room management
    - Live streaming capabilities
    - Online attendance tracking

  4. Automation Features
    - Post-event follow-up workflows
    - Automated networking suggestions
    - Event reminder systems
*/

-- Add new columns to existing events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS event_format text CHECK (event_format IN ('in_person', 'virtual', 'hybrid')) DEFAULT 'in_person';
ALTER TABLE events ADD COLUMN IF NOT EXISTS status text CHECK (status IN ('draft', 'published', 'cancelled', 'completed')) DEFAULT 'draft';
ALTER TABLE events ADD COLUMN IF NOT EXISTS virtual_meeting_url text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS virtual_meeting_id text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS virtual_meeting_password text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS streaming_url text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'UTC';
ALTER TABLE events ADD COLUMN IF NOT EXISTS early_bird_price decimal(10,2);
ALTER TABLE events ADD COLUMN IF NOT EXISTS early_bird_deadline timestamptz;
ALTER TABLE events ADD COLUMN IF NOT EXISTS member_price decimal(10,2);
ALTER TABLE events ADD COLUMN IF NOT EXISTS non_member_price decimal(10,2);
ALTER TABLE events ADD COLUMN IF NOT EXISTS waitlist_enabled boolean DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS waitlist_capacity integer DEFAULT 0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS registration_fields jsonb DEFAULT '[]'::jsonb;
ALTER TABLE events ADD COLUMN IF NOT EXISTS end_date timestamptz;
ALTER TABLE events ADD COLUMN IF NOT EXISTS check_in_enabled boolean DEFAULT true;
ALTER TABLE events ADD COLUMN IF NOT EXISTS tags jsonb DEFAULT '[]'::jsonb;
ALTER TABLE events ADD COLUMN IF NOT EXISTS settings jsonb DEFAULT '{}'::jsonb;

-- Create event sessions table for multi-session events
CREATE TABLE IF NOT EXISTS event_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  location text DEFAULT '', -- Can be physical location or virtual room
  virtual_room_url text,
  speaker_ids jsonb DEFAULT '[]'::jsonb, -- Array of speaker IDs
  max_attendees integer,
  session_type text CHECK (session_type IN ('presentation', 'workshop', 'networking', 'break', 'panel', 'q_and_a')) DEFAULT 'presentation',
  is_mandatory boolean DEFAULT false,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS event_sessions_event_id_start_time_idx ON event_sessions (event_id, start_time);
CREATE INDEX IF NOT EXISTS event_sessions_event_id_order_index_idx ON event_sessions (event_id, order_index);

-- Create event speakers table
CREATE TABLE IF NOT EXISTS event_speakers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  name text NOT NULL,
  title text DEFAULT '',
  company text DEFAULT '',
  bio text DEFAULT '',
  avatar_url text,
  linkedin_url text,
  twitter_url text,
  website_url text,
  is_featured boolean DEFAULT false,
  contact_email text,
  speaking_fee decimal(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS event_speakers_event_id_is_featured_idx ON event_speakers (event_id, is_featured);

-- Create event check-ins table for attendance tracking
CREATE TABLE IF NOT EXISTS event_check_ins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  session_id uuid REFERENCES event_sessions(id) ON DELETE SET NULL,
  
  -- Check-in details
  check_in_time timestamptz DEFAULT now(),
  check_out_time timestamptz,
  check_in_method text CHECK (check_in_method IN ('qr_code', 'manual', 'app', 'virtual_join')) DEFAULT 'qr_code',
  
  -- Location and device info
  check_in_location jsonb, -- {lat, lng, address}
  device_info jsonb, -- {type, browser, os}
  ip_address inet,
  
  -- Virtual event specific
  virtual_attendance_duration integer DEFAULT 0, -- minutes attended virtually
  virtual_interaction_score integer DEFAULT 0, -- engagement score 0-100
  
  -- Notes and feedback
  notes text DEFAULT '',
  no_show boolean DEFAULT false,
  
  created_at timestamptz DEFAULT now(),
  
  -- Unique constraint to prevent duplicate check-ins
  UNIQUE(event_id, business_id, session_id)
);

CREATE INDEX IF NOT EXISTS event_check_ins_event_id_check_in_time_idx ON event_check_ins (event_id, check_in_time);
CREATE INDEX IF NOT EXISTS event_check_ins_business_id_check_in_time_idx ON event_check_ins (business_id, check_in_time);
CREATE INDEX IF NOT EXISTS event_check_ins_session_id_check_in_time_idx ON event_check_ins (session_id, check_in_time);

-- Create enhanced event registrations table
CREATE TABLE IF NOT EXISTS event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- Registration details
  registration_type text CHECK (registration_type IN ('regular', 'early_bird', 'member', 'non_member', 'waitlist', 'comp')) DEFAULT 'regular',
  registration_status text CHECK (registration_status IN ('pending', 'confirmed', 'cancelled', 'waitlist', 'no_show')) DEFAULT 'pending',
  
  -- Pricing
  ticket_price decimal(10,2) DEFAULT 0,
  discount_applied decimal(10,2) DEFAULT 0,
  total_paid decimal(10,2) DEFAULT 0,
  payment_status text CHECK (payment_status IN ('pending', 'paid', 'refunded', 'comp')) DEFAULT 'pending',
  payment_method text,
  
  -- Custom registration fields (dynamic based on event.registration_fields)
  custom_fields jsonb DEFAULT '{}'::jsonb,
  
  -- Dietary restrictions, accessibility needs, etc.
  special_requirements text DEFAULT '',
  
  -- Waitlist management
  waitlist_position integer,
  waitlist_notified boolean DEFAULT false,
  
  -- Communication preferences
  email_reminders boolean DEFAULT true,
  sms_reminders boolean DEFAULT false,
  
  -- Timestamps
  registered_at timestamptz DEFAULT now(),
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(event_id, business_id)
);

CREATE INDEX IF NOT EXISTS event_registrations_event_id_registration_status_idx ON event_registrations (event_id, registration_status);
CREATE INDEX IF NOT EXISTS event_registrations_business_id_registered_at_idx ON event_registrations (business_id, registered_at);
CREATE INDEX IF NOT EXISTS event_registrations_event_id_waitlist_position_idx ON event_registrations (event_id, waitlist_position);

-- Create event sponsors table
CREATE TABLE IF NOT EXISTS event_sponsors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  business_id uuid REFERENCES businesses(id) ON DELETE SET NULL,
  
  sponsor_name text NOT NULL,
  sponsor_tier text CHECK (sponsor_tier IN ('title', 'presenting', 'gold', 'silver', 'bronze', 'media', 'community')) DEFAULT 'bronze',
  sponsor_amount decimal(10,2) DEFAULT 0,
  
  -- Sponsor benefits and assets
  logo_url text,
  website_url text,
  description text DEFAULT '',
  booth_number text,
  
  -- Display settings
  display_order integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS event_sponsors_event_id_sponsor_tier_display_order_idx ON event_sponsors (event_id, sponsor_tier, display_order);

-- Create event feedback table for post-event surveys
CREATE TABLE IF NOT EXISTS event_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- Feedback ratings (1-5 scale)
  overall_rating integer CHECK (overall_rating BETWEEN 1 AND 5),
  content_rating integer CHECK (content_rating BETWEEN 1 AND 5),
  organization_rating integer CHECK (organization_rating BETWEEN 1 AND 5),
  networking_rating integer CHECK (networking_rating BETWEEN 1 AND 5),
  venue_rating integer CHECK (venue_rating BETWEEN 1 AND 5),
  
  -- Virtual event specific ratings
  technology_rating integer CHECK (technology_rating BETWEEN 1 AND 5),
  virtual_networking_rating integer CHECK (virtual_networking_rating BETWEEN 1 AND 5),
  
  -- Text feedback
  favorite_aspect text DEFAULT '',
  improvement_suggestions text DEFAULT '',
  additional_comments text DEFAULT '',
  
  -- Behavioral metrics
  would_recommend boolean,
  likely_to_attend_again boolean,
  preferred_event_format text CHECK (preferred_event_format IN ('in_person', 'virtual', 'hybrid', 'no_preference')) DEFAULT 'no_preference',
  
  -- Follow-up preferences
  interested_in_follow_up boolean DEFAULT false,
  preferred_contact_method text CHECK (preferred_contact_method IN ('email', 'phone', 'linkedin', 'none')) DEFAULT 'email',
  
  submitted_at timestamptz DEFAULT now(),
  
  UNIQUE(event_id, business_id)
);

CREATE INDEX IF NOT EXISTS event_feedback_event_id_overall_rating_idx ON event_feedback (event_id, overall_rating);
CREATE INDEX IF NOT EXISTS event_feedback_event_id_submitted_at_idx ON event_feedback (event_id, submitted_at);

-- Create event networking matches table for automated networking suggestions
CREATE TABLE IF NOT EXISTS event_networking_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  business_a_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  business_b_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- Match scoring and reasoning
  match_score decimal(3,2) CHECK (match_score BETWEEN 0 AND 1), -- 0.0 to 1.0
  match_reasons jsonb DEFAULT '[]'::jsonb, -- ["industry_complement", "geographic_proximity", "mutual_connections"]
  
  -- Match status
  status text CHECK (status IN ('suggested', 'accepted', 'declined', 'connected', 'expired')) DEFAULT 'suggested',
  
  -- Interaction tracking
  viewed_by_a boolean DEFAULT false,
  viewed_by_b boolean DEFAULT false,
  contacted boolean DEFAULT false,
  meeting_scheduled boolean DEFAULT false,
  
  -- Expiration
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(event_id, business_a_id, business_b_id)
);

CREATE INDEX IF NOT EXISTS event_networking_matches_event_id_match_score_idx ON event_networking_matches (event_id, match_score DESC);
CREATE INDEX IF NOT EXISTS event_networking_matches_business_a_id_status_idx ON event_networking_matches (business_a_id, status);
CREATE INDEX IF NOT EXISTS event_networking_matches_business_b_id_status_idx ON event_networking_matches (business_b_id, status);

-- Create event reminders table for automated communication
CREATE TABLE IF NOT EXISTS event_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  
  -- Reminder configuration
  reminder_type text CHECK (reminder_type IN ('registration_confirmation', 'event_reminder', 'day_before', 'day_of', 'check_in', 'post_event_followup')) NOT NULL,
  send_time_offset interval NOT NULL, -- e.g., '-1 day', '-2 hours', '+1 day'
  
  -- Message content
  subject text NOT NULL,
  message_template text NOT NULL,
  
  -- Delivery settings
  delivery_method text CHECK (delivery_method IN ('email', 'sms', 'push', 'in_app')) DEFAULT 'email',
  is_enabled boolean DEFAULT true,
  
  -- Targeting
  target_audience text CHECK (target_audience IN ('all_registrants', 'confirmed_only', 'speakers', 'sponsors', 'no_shows')) DEFAULT 'confirmed_only',
  
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS event_reminders_event_id_send_time_offset_idx ON event_reminders (event_id, send_time_offset);

-- Enable RLS on all new tables
ALTER TABLE event_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_networking_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_reminders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Event Sessions: Public read, authenticated write
CREATE POLICY "Event sessions are publicly readable"
  ON event_sessions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Chamber admins can manage event sessions"
  ON event_sessions FOR ALL
  TO authenticated
  USING (
    event_id IN (
      SELECT id FROM events 
      WHERE chamber_id IN (
        SELECT chamber_id FROM chamber_memberships 
        WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
      )
    )
  );

-- Event Speakers: Public read, authenticated write
CREATE POLICY "Event speakers are publicly readable"
  ON event_speakers FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Chamber admins can manage event speakers"
  ON event_speakers FOR ALL
  TO authenticated
  USING (
    event_id IN (
      SELECT id FROM events 
      WHERE chamber_id IN (
        SELECT chamber_id FROM chamber_memberships 
        WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
      )
    )
  );

-- Event Check-ins: Authenticated access only
CREATE POLICY "Users can view their own check-ins"
  ON event_check_ins FOR SELECT
  TO authenticated
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    ) OR
    event_id IN (
      SELECT id FROM events 
      WHERE chamber_id IN (
        SELECT chamber_id FROM chamber_memberships 
        WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
      )
    )
  );

CREATE POLICY "Users can check themselves in"
  ON event_check_ins FOR INSERT
  TO authenticated
  WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Chamber admins can manage all check-ins"
  ON event_check_ins FOR ALL
  TO authenticated
  USING (
    event_id IN (
      SELECT id FROM events 
      WHERE chamber_id IN (
        SELECT chamber_id FROM chamber_memberships 
        WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
      )
    )
  );

-- Event Registrations: Authenticated access
CREATE POLICY "Users can view their own registrations"
  ON event_registrations FOR SELECT
  TO authenticated
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    ) OR
    event_id IN (
      SELECT id FROM events 
      WHERE chamber_id IN (
        SELECT chamber_id FROM chamber_memberships 
        WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
      )
    )
  );

CREATE POLICY "Users can register for events"
  ON event_registrations FOR INSERT
  TO authenticated
  WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own registrations"
  ON event_registrations FOR UPDATE
  TO authenticated
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

-- Event Sponsors: Public read
CREATE POLICY "Event sponsors are publicly readable"
  ON event_sponsors FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Chamber admins can manage event sponsors"
  ON event_sponsors FOR ALL
  TO authenticated
  USING (
    event_id IN (
      SELECT id FROM events 
      WHERE chamber_id IN (
        SELECT chamber_id FROM chamber_memberships 
        WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
      )
    )
  );

-- Event Feedback: Private access
CREATE POLICY "Users can view their own feedback"
  ON event_feedback FOR SELECT
  TO authenticated
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    ) OR
    event_id IN (
      SELECT id FROM events 
      WHERE chamber_id IN (
        SELECT chamber_id FROM chamber_memberships 
        WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
      )
    )
  );

CREATE POLICY "Users can submit feedback"
  ON event_feedback FOR INSERT
  TO authenticated
  WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

-- Event Networking Matches: Private access
CREATE POLICY "Users can view their own networking matches"
  ON event_networking_matches FOR SELECT
  TO authenticated
  USING (
    business_a_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    ) OR
    business_b_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    ) OR
    event_id IN (
      SELECT id FROM events 
      WHERE chamber_id IN (
        SELECT chamber_id FROM chamber_memberships 
        WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
      )
    )
  );

-- Event Reminders: Admin only
CREATE POLICY "Chamber admins can manage event reminders"
  ON event_reminders FOR ALL
  TO authenticated
  USING (
    event_id IN (
      SELECT id FROM events 
      WHERE chamber_id IN (
        SELECT chamber_id FROM chamber_memberships 
        WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
      )
    )
  );

-- Create useful functions

-- Function to generate event check-in QR code data
CREATE OR REPLACE FUNCTION generate_event_checkin_qr_data(
  p_event_id uuid,
  p_business_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN jsonb_build_object(
    'type', 'event_checkin',
    'event_id', p_event_id,
    'business_id', p_business_id,
    'timestamp', extract(epoch from now()),
    'hash', md5(p_event_id::text || p_business_id::text || extract(epoch from now())::text)
  );
END;
$$;

-- Function to calculate event attendance statistics
CREATE OR REPLACE FUNCTION get_event_attendance_stats(p_event_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_registered', COUNT(r.id),
    'confirmed_attendees', COUNT(r.id) FILTER (WHERE r.registration_status = 'confirmed'),
    'checked_in', COUNT(c.id),
    'no_shows', COUNT(r.id) FILTER (WHERE r.registration_status = 'no_show'),
    'attendance_rate', CASE 
      WHEN COUNT(r.id) FILTER (WHERE r.registration_status = 'confirmed') > 0 
      THEN ROUND((COUNT(c.id)::decimal / COUNT(r.id) FILTER (WHERE r.registration_status = 'confirmed')) * 100, 2)
      ELSE 0 
    END,
    'average_session_attendance', (
      SELECT COALESCE(AVG(session_attendance), 0)
      FROM (
        SELECT COUNT(*) as session_attendance
        FROM event_check_ins ci
        WHERE ci.event_id = p_event_id AND ci.session_id IS NOT NULL
        GROUP BY ci.session_id
      ) session_stats
    )
  ) INTO result
  FROM event_registrations r
  LEFT JOIN event_check_ins c ON r.event_id = c.event_id AND r.business_id = c.business_id
  WHERE r.event_id = p_event_id;
  
  RETURN result;
END;
$$;

-- Function to auto-assign waitlist when spots become available
CREATE OR REPLACE FUNCTION promote_from_waitlist(p_event_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  available_spots integer;
  next_in_line record;
BEGIN
  -- Calculate available spots
  SELECT 
    e.max_attendees - COUNT(r.id) FILTER (WHERE r.registration_status = 'confirmed')
  INTO available_spots
  FROM events e
  LEFT JOIN event_registrations r ON e.id = r.event_id
  WHERE e.id = p_event_id
  GROUP BY e.max_attendees;
  
  -- Promote from waitlist if spots available
  WHILE available_spots > 0 LOOP
    SELECT * INTO next_in_line
    FROM event_registrations
    WHERE event_id = p_event_id 
      AND registration_status = 'waitlist'
    ORDER BY waitlist_position ASC
    LIMIT 1;
    
    EXIT WHEN next_in_line IS NULL;
    
    -- Promote the next person
    UPDATE event_registrations
    SET 
      registration_status = 'confirmed',
      confirmed_at = now(),
      waitlist_notified = true
    WHERE id = next_in_line.id;
    
    available_spots := available_spots - 1;
  END LOOP;
END;
$$; 