/*
  # Cross-Chamber Networking & Partnerships

  1. Chamber Partnerships
    - `chamber_partnerships` - Formal partnerships between chambers
    - `chamber_networks` - Regional or industry-based chamber networks
    - `shared_events` - Events open to multiple chambers
    - `chamber_directories` - Cross-chamber member discovery

  2. Cross-Chamber Networking
    - `cross_chamber_connections` - Business connections across chambers
    - `chamber_referrals` - Inter-chamber business referrals
    - `shared_resources` - Resources shared between chamber partners
    - `joint_initiatives` - Collaborative projects between chambers

  3. Partnership Management
    - Partnership tiers (basic, premium, strategic)
    - Mutual member benefits and access levels
    - Shared event calendars and cross-promotion
    - Revenue sharing for joint events

  4. Discovery & Matching
    - Chamber discovery system
    - Member matching across chamber boundaries
    - Regional and industry-based clustering
    - Partnership recommendation engine
*/

-- Create chamber partnerships table
CREATE TABLE IF NOT EXISTS chamber_partnerships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chamber_a_id uuid REFERENCES chambers(id) ON DELETE CASCADE,
  chamber_b_id uuid REFERENCES chambers(id) ON DELETE CASCADE,
  
  -- Partnership details
  partnership_type text CHECK (partnership_type IN ('basic', 'premium', 'strategic', 'network')) DEFAULT 'basic',
  status text CHECK (status IN ('pending', 'active', 'suspended', 'expired', 'terminated')) DEFAULT 'pending',
  
  -- Partnership terms
  member_access_level text CHECK (member_access_level IN ('none', 'directory_only', 'events_only', 'full_access')) DEFAULT 'directory_only',
  event_sharing_enabled boolean DEFAULT false,
  referral_tracking_enabled boolean DEFAULT false,
  resource_sharing_enabled boolean DEFAULT false,
  
  -- Financial terms
  revenue_share_percentage decimal(5,2) DEFAULT 0, -- 0.00 to 100.00
  annual_partnership_fee decimal(10,2) DEFAULT 0,
  
  -- Duration and renewal
  start_date date DEFAULT CURRENT_DATE,
  end_date date,
  auto_renewal boolean DEFAULT false,
  renewal_notice_days integer DEFAULT 30,
  
  -- Partnership benefits
  benefits jsonb DEFAULT '[]'::jsonb, -- ["cross_promotion", "shared_events", "member_discounts"]
  restrictions jsonb DEFAULT '[]'::jsonb, -- ["geographic_limits", "industry_exclusions"]
  
  -- Partnership metrics
  member_interactions integer DEFAULT 0,
  events_shared integer DEFAULT 0,
  referrals_generated integer DEFAULT 0,
  revenue_generated decimal(10,2) DEFAULT 0,
  
  -- Contact and management
  primary_contact_a_id uuid REFERENCES businesses(id) ON DELETE SET NULL,
  primary_contact_b_id uuid REFERENCES businesses(id) ON DELETE SET NULL,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure no duplicate partnerships (bidirectional)
  CONSTRAINT unique_partnership UNIQUE (chamber_a_id, chamber_b_id),
  CONSTRAINT no_self_partnership CHECK (chamber_a_id != chamber_b_id),
  
  INDEX (chamber_a_id, status),
  INDEX (chamber_b_id, status),
  INDEX (partnership_type, status),
  INDEX (start_date, end_date)
);

-- Create chamber networks table for regional/industry groupings
CREATE TABLE IF NOT EXISTS chamber_networks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  network_type text CHECK (network_type IN ('regional', 'industry', 'size_based', 'specialty', 'international')) DEFAULT 'regional',
  
  -- Network settings
  membership_criteria jsonb DEFAULT '{}'::jsonb, -- {"region": "US-West", "min_members": 50}
  benefits jsonb DEFAULT '[]'::jsonb, -- ["shared_directory", "joint_events", "bulk_purchasing"]
  membership_fee decimal(10,2) DEFAULT 0,
  
  -- Network governance
  governance_model text CHECK (governance_model IN ('democratic', 'rotating_lead', 'designated_admin', 'consortium')) DEFAULT 'democratic',
  lead_chamber_id uuid REFERENCES chambers(id) ON DELETE SET NULL,
  admin_contact_id uuid REFERENCES businesses(id) ON DELETE SET NULL,
  
  -- Network metrics
  member_count integer DEFAULT 0,
  total_businesses integer DEFAULT 0,
  joint_events_hosted integer DEFAULT 0,
  
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  INDEX (network_type, is_active),
  INDEX (member_count DESC)
);

-- Create chamber network memberships
CREATE TABLE IF NOT EXISTS chamber_network_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  network_id uuid REFERENCES chamber_networks(id) ON DELETE CASCADE,
  chamber_id uuid REFERENCES chambers(id) ON DELETE CASCADE,
  
  -- Membership details
  membership_status text CHECK (membership_status IN ('active', 'pending', 'suspended', 'terminated')) DEFAULT 'pending',
  membership_tier text CHECK (membership_tier IN ('basic', 'premium', 'founding', 'lead')) DEFAULT 'basic',
  
  -- Dates and fees
  joined_date date DEFAULT CURRENT_DATE,
  fee_paid decimal(10,2) DEFAULT 0,
  next_payment_due date,
  
  -- Permissions within network
  can_host_events boolean DEFAULT false,
  can_invite_members boolean DEFAULT false,
  can_access_analytics boolean DEFAULT false,
  voting_power integer DEFAULT 1,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(network_id, chamber_id),
  INDEX (network_id, membership_status),
  INDEX (chamber_id, membership_status)
);

-- Create shared events table for cross-chamber events
CREATE TABLE IF NOT EXISTS shared_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  hosting_chamber_id uuid REFERENCES chambers(id) ON DELETE CASCADE,
  
  -- Sharing configuration
  sharing_type text CHECK (sharing_type IN ('open_to_all', 'partner_only', 'network_only', 'selective')) DEFAULT 'partner_only',
  max_external_attendees integer, -- Limit on non-hosting chamber attendees
  external_attendee_fee decimal(10,2) DEFAULT 0, -- Extra fee for external attendees
  
  -- Revenue sharing
  revenue_share_enabled boolean DEFAULT false,
  revenue_share_formula jsonb DEFAULT '{}'::jsonb, -- {"type": "percentage", "value": 20}
  
  -- Event visibility and promotion
  allow_cross_promotion boolean DEFAULT true,
  featured_in_partner_chambers boolean DEFAULT false,
  
  -- Registration management
  require_partner_approval boolean DEFAULT false,
  external_registration_deadline timestamptz,
  
  -- Metrics
  external_registrations integer DEFAULT 0,
  revenue_shared decimal(10,2) DEFAULT 0,
  
  created_at timestamptz DEFAULT now(),
  
  INDEX (hosting_chamber_id, sharing_type),
  INDEX (event_id)
);

-- Create shared event permissions for specific chambers
CREATE TABLE IF NOT EXISTS shared_event_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shared_event_id uuid REFERENCES shared_events(id) ON DELETE CASCADE,
  chamber_id uuid REFERENCES chambers(id) ON DELETE CASCADE,
  
  -- Permission details
  permission_type text CHECK (permission_type IN ('view_only', 'register_members', 'co_host', 'promote')) DEFAULT 'register_members',
  member_discount_percentage decimal(5,2) DEFAULT 0, -- 0-100
  registration_quota integer, -- Max registrations for this chamber
  
  -- Status
  invitation_status text CHECK (invitation_status IN ('pending', 'accepted', 'declined', 'revoked')) DEFAULT 'pending',
  invited_at timestamptz DEFAULT now(),
  responded_at timestamptz,
  
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(shared_event_id, chamber_id),
  INDEX (chamber_id, permission_type)
);

-- Create cross-chamber connections table
CREATE TABLE IF NOT EXISTS cross_chamber_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_a_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  business_b_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  chamber_a_id uuid REFERENCES chambers(id) ON DELETE CASCADE,
  chamber_b_id uuid REFERENCES chambers(id) ON DELETE CASCADE,
  
  -- Connection context
  connection_source text CHECK (connection_source IN ('event_meeting', 'directory_search', 'referral', 'network_introduction', 'partnership_facilitated')) DEFAULT 'directory_search',
  connection_type text CHECK (connection_type IN ('professional', 'vendor_client', 'partnership', 'referral', 'mentorship', 'collaboration')) DEFAULT 'professional',
  
  -- Connection strength and tracking
  interaction_count integer DEFAULT 0,
  last_interaction_date timestamptz DEFAULT now(),
  connection_strength text CHECK (connection_strength IN ('weak', 'moderate', 'strong', 'strategic')) DEFAULT 'weak',
  
  -- Business outcomes
  referrals_given integer DEFAULT 0,
  referrals_received integer DEFAULT 0,
  deals_closed integer DEFAULT 0,
  estimated_deal_value decimal(12,2) DEFAULT 0,
  
  -- Partnership metrics (for chambers)
  generates_partnership_value boolean DEFAULT false,
  partnership_credit_a decimal(8,2) DEFAULT 0, -- Credit to chamber A for facilitating
  partnership_credit_b decimal(8,2) DEFAULT 0, -- Credit to chamber B for facilitating
  
  -- Privacy and consent
  public_connection boolean DEFAULT false, -- Can be displayed in success stories
  allow_chamber_credit boolean DEFAULT true, -- Chambers can claim facilitation credit
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(business_a_id, business_b_id),
  CONSTRAINT no_self_connection CHECK (business_a_id != business_b_id),
  CONSTRAINT different_chambers CHECK (chamber_a_id != chamber_b_id),
  
  INDEX (chamber_a_id, connection_type),
  INDEX (chamber_b_id, connection_type),
  INDEX (connection_source, connection_strength),
  INDEX (created_at DESC)
);

-- Create chamber referrals table
CREATE TABLE IF NOT EXISTS chamber_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referring_chamber_id uuid REFERENCES chambers(id) ON DELETE CASCADE,
  receiving_chamber_id uuid REFERENCES chambers(id) ON DELETE CASCADE,
  referring_business_id uuid REFERENCES businesses(id) ON DELETE SET NULL,
  referred_business_id uuid REFERENCES businesses(id) ON DELETE SET NULL,
  
  -- Referral details
  referral_type text CHECK (referral_type IN ('new_member', 'business_opportunity', 'event_speaker', 'vendor_service', 'partnership')) DEFAULT 'business_opportunity',
  referral_description text NOT NULL,
  referral_value_estimate decimal(10,2),
  
  -- Status tracking
  status text CHECK (status IN ('pending', 'accepted', 'declined', 'completed', 'expired')) DEFAULT 'pending',
  response_deadline timestamptz DEFAULT (now() + interval '30 days'),
  
  -- Outcome tracking
  outcome_description text DEFAULT '',
  actual_value decimal(10,2) DEFAULT 0,
  success_rating integer CHECK (success_rating BETWEEN 1 AND 5),
  
  -- Commission and rewards
  commission_percentage decimal(5,2) DEFAULT 0,
  commission_amount decimal(10,2) DEFAULT 0,
  commission_paid boolean DEFAULT false,
  
  -- Follow-up
  follow_up_required boolean DEFAULT true,
  follow_up_date timestamptz,
  completed_at timestamptz,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  INDEX (referring_chamber_id, status),
  INDEX (receiving_chamber_id, status),
  INDEX (referral_type, status),
  INDEX (response_deadline)
);

-- Create shared resources table
CREATE TABLE IF NOT EXISTS shared_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_chamber_id uuid REFERENCES chambers(id) ON DELETE CASCADE,
  
  -- Resource details
  resource_type text CHECK (resource_type IN ('document', 'template', 'training', 'vendor_list', 'best_practice', 'case_study', 'tool', 'contact_list')) NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  content_url text,
  file_url text,
  
  -- Sharing permissions
  sharing_level text CHECK (sharing_level IN ('private', 'partners_only', 'network_only', 'public')) DEFAULT 'partners_only',
  access_cost decimal(8,2) DEFAULT 0,
  
  -- Usage terms
  usage_terms text DEFAULT '',
  attribution_required boolean DEFAULT true,
  commercial_use_allowed boolean DEFAULT false,
  modification_allowed boolean DEFAULT false,
  
  -- Metrics
  view_count integer DEFAULT 0,
  download_count integer DEFAULT 0,
  revenue_generated decimal(10,2) DEFAULT 0,
  
  -- Categories and tags
  category text DEFAULT '',
  tags jsonb DEFAULT '[]'::jsonb,
  
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  INDEX (owner_chamber_id, resource_type),
  INDEX (sharing_level, is_active),
  INDEX (category, resource_type)
);

-- Create resource access log
CREATE TABLE IF NOT EXISTS resource_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id uuid REFERENCES shared_resources(id) ON DELETE CASCADE,
  accessing_chamber_id uuid REFERENCES chambers(id) ON DELETE CASCADE,
  accessing_business_id uuid REFERENCES businesses(id) ON DELETE SET NULL,
  
  access_type text CHECK (access_type IN ('view', 'download', 'share', 'modify')) DEFAULT 'view',
  access_granted boolean DEFAULT true,
  denial_reason text,
  
  -- Payment for paid resources
  payment_required decimal(8,2) DEFAULT 0,
  payment_status text CHECK (payment_status IN ('not_required', 'pending', 'paid', 'failed')) DEFAULT 'not_required',
  
  accessed_at timestamptz DEFAULT now(),
  
  INDEX (resource_id, access_type),
  INDEX (accessing_chamber_id, accessed_at),
  INDEX (accessed_at DESC)
);

-- Create chamber discovery table for partnership recommendations
CREATE TABLE IF NOT EXISTS chamber_discovery_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chamber_id uuid REFERENCES chambers(id) ON DELETE CASCADE,
  
  -- Discovery preferences
  seeking_partnerships boolean DEFAULT true,
  partnership_goals jsonb DEFAULT '[]'::jsonb, -- ["member_growth", "event_collaboration", "resource_sharing"]
  target_partnership_types jsonb DEFAULT '["basic"]'::jsonb,
  
  -- Chamber characteristics
  primary_industries jsonb DEFAULT '[]'::jsonb, -- ["technology", "healthcare", "manufacturing"]
  geographic_scope text CHECK (geographic_scope IN ('local', 'regional', 'state', 'national', 'international')) DEFAULT 'local',
  member_size_range text CHECK (member_size_range IN ('small', 'medium', 'large', 'enterprise')) DEFAULT 'medium',
  
  -- Partnership criteria
  preferred_chamber_sizes jsonb DEFAULT '["medium", "large"]'::jsonb,
  geographic_preferences jsonb DEFAULT '[]'::jsonb, -- ["same_state", "adjacent_regions"]
  industry_preferences jsonb DEFAULT '[]'::jsonb,
  
  -- Partnership capacity
  max_active_partnerships integer DEFAULT 10,
  current_active_partnerships integer DEFAULT 0,
  partnership_bandwidth text CHECK (partnership_bandwidth IN ('low', 'medium', 'high')) DEFAULT 'medium',
  
  -- Communication preferences
  contact_method text CHECK (contact_method IN ('email', 'phone', 'video_call', 'in_person')) DEFAULT 'email',
  response_time_expectation text CHECK (response_time_expectation IN ('immediate', 'within_24h', 'within_week', 'flexible')) DEFAULT 'within_24h',
  
  -- Marketing and visibility
  public_profile boolean DEFAULT true,
  featured_in_directory boolean DEFAULT false,
  partnership_success_stories_public boolean DEFAULT true,
  
  last_updated timestamptz DEFAULT now(),
  
  UNIQUE(chamber_id),
  INDEX (seeking_partnerships, public_profile),
  INDEX (geographic_scope, member_size_range)
);

-- Enable RLS on all new tables
ALTER TABLE chamber_partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE chamber_networks ENABLE ROW LEVEL SECURITY;
ALTER TABLE chamber_network_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_event_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cross_chamber_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE chamber_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_access_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE chamber_discovery_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Chamber Partnerships: Chambers can view their own partnerships
CREATE POLICY "Chamber partnerships are viewable by partner chambers"
  ON chamber_partnerships FOR SELECT
  TO authenticated
  USING (
    chamber_a_id IN (
      SELECT chamber_id FROM chamber_memberships 
      WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
    ) OR
    chamber_b_id IN (
      SELECT chamber_id FROM chamber_memberships 
      WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Chamber admins can manage partnerships"
  ON chamber_partnerships FOR ALL
  TO authenticated
  USING (
    chamber_a_id IN (
      SELECT chamber_id FROM chamber_memberships 
      WHERE user_id = auth.uid() AND role = 'admin'
    ) OR
    chamber_b_id IN (
      SELECT chamber_id FROM chamber_memberships 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Chamber Networks: Public read, member chamber write
CREATE POLICY "Chamber networks are publicly readable"
  ON chamber_networks FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Chamber admins can manage networks"
  ON chamber_networks FOR ALL
  TO authenticated
  USING (
    lead_chamber_id IN (
      SELECT chamber_id FROM chamber_memberships 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Shared Events: Accessible to partner chambers
CREATE POLICY "Shared events are viewable by partner chambers"
  ON shared_events FOR SELECT
  TO authenticated
  USING (
    hosting_chamber_id IN (
      SELECT chamber_id FROM chamber_memberships 
      WHERE user_id = auth.uid()
    ) OR
    sharing_type = 'open_to_all' OR
    hosting_chamber_id IN (
      SELECT CASE 
        WHEN chamber_a_id = (SELECT chamber_id FROM chamber_memberships WHERE user_id = auth.uid() LIMIT 1) 
        THEN chamber_b_id 
        ELSE chamber_a_id 
      END
      FROM chamber_partnerships 
      WHERE status = 'active' AND event_sharing_enabled = true
    )
  );

-- Cross-Chamber Connections: Users can view their own connections
CREATE POLICY "Users can view their cross-chamber connections"
  ON cross_chamber_connections FOR SELECT
  TO authenticated
  USING (
    business_a_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    ) OR
    business_b_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    ) OR
    chamber_a_id IN (
      SELECT chamber_id FROM chamber_memberships 
      WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
    ) OR
    chamber_b_id IN (
      SELECT chamber_id FROM chamber_memberships 
      WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- Shared Resources: Based on sharing level
CREATE POLICY "Shared resources access based on sharing level"
  ON shared_resources FOR SELECT
  TO authenticated
  USING (
    sharing_level = 'public' OR
    (sharing_level = 'partners_only' AND owner_chamber_id IN (
      SELECT CASE 
        WHEN chamber_a_id = (SELECT chamber_id FROM chamber_memberships WHERE user_id = auth.uid() LIMIT 1) 
        THEN chamber_b_id 
        ELSE chamber_a_id 
      END
      FROM chamber_partnerships 
      WHERE status = 'active' AND resource_sharing_enabled = true
    )) OR
    owner_chamber_id IN (
      SELECT chamber_id FROM chamber_memberships 
      WHERE user_id = auth.uid()
    )
  );

-- Create useful functions

-- Function to recommend chamber partnerships
CREATE OR REPLACE FUNCTION recommend_chamber_partnerships(
  p_chamber_id uuid,
  p_limit integer DEFAULT 10
)
RETURNS TABLE (
  chamber_id uuid,
  chamber_name text,
  compatibility_score decimal,
  match_reasons jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    CAST(0.5 + (
      CASE WHEN cdp.geographic_scope = my_profile.geographic_scope THEN 0.2 ELSE 0 END +
      CASE WHEN c.member_count BETWEEN my_chamber.member_count * 0.5 AND my_chamber.member_count * 2 THEN 0.2 ELSE 0 END +
      CASE WHEN array_length(
        array(SELECT jsonb_array_elements_text(cdp.primary_industries) 
              INTERSECT 
              SELECT jsonb_array_elements_text(my_profile.primary_industries)), 1
      ) > 0 THEN 0.1 ELSE 0 END
    ) AS decimal),
    jsonb_build_array(
      CASE WHEN cdp.geographic_scope = my_profile.geographic_scope THEN 'same_geographic_scope' END,
      CASE WHEN c.member_count BETWEEN my_chamber.member_count * 0.5 AND my_chamber.member_count * 2 THEN 'similar_size' END
    ) - 'null'::jsonb
  FROM chambers c
  JOIN chamber_discovery_profiles cdp ON c.id = cdp.chamber_id
  JOIN chambers my_chamber ON my_chamber.id = p_chamber_id
  JOIN chamber_discovery_profiles my_profile ON my_profile.chamber_id = p_chamber_id
  WHERE c.id != p_chamber_id
    AND cdp.seeking_partnerships = true
    AND cdp.public_profile = true
    AND c.id NOT IN (
      SELECT CASE 
        WHEN chamber_a_id = p_chamber_id THEN chamber_b_id 
        ELSE chamber_a_id 
      END
      FROM chamber_partnerships 
      WHERE (chamber_a_id = p_chamber_id OR chamber_b_id = p_chamber_id)
        AND status IN ('active', 'pending')
    )
  ORDER BY compatibility_score DESC
  LIMIT p_limit;
END;
$$;

-- Function to get cross-chamber networking statistics
CREATE OR REPLACE FUNCTION get_cross_chamber_networking_stats(p_chamber_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'active_partnerships', COUNT(cp.id) FILTER (WHERE cp.status = 'active'),
    'total_cross_chamber_connections', COUNT(ccc.id),
    'successful_referrals', COUNT(cr.id) FILTER (WHERE cr.status = 'completed'),
    'shared_events_hosted', COUNT(se.id),
    'total_partnership_revenue', COALESCE(SUM(cp.revenue_generated), 0),
    'member_interaction_count', COALESCE(SUM(cp.member_interactions), 0),
    'network_memberships', COUNT(cnm.id) FILTER (WHERE cnm.membership_status = 'active')
  ) INTO result
  FROM chambers c
  LEFT JOIN chamber_partnerships cp ON (cp.chamber_a_id = c.id OR cp.chamber_b_id = c.id)
  LEFT JOIN cross_chamber_connections ccc ON (ccc.chamber_a_id = c.id OR ccc.chamber_b_id = c.id)
  LEFT JOIN chamber_referrals cr ON (cr.referring_chamber_id = c.id OR cr.receiving_chamber_id = c.id)
  LEFT JOIN shared_events se ON se.hosting_chamber_id = c.id
  LEFT JOIN chamber_network_memberships cnm ON cnm.chamber_id = c.id
  WHERE c.id = p_chamber_id
  GROUP BY c.id;
  
  RETURN result;
END;
$$;

-- Function to track partnership value creation
CREATE OR REPLACE FUNCTION track_partnership_value(
  p_partnership_id uuid,
  p_value_type text,
  p_amount decimal
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE chamber_partnerships 
  SET 
    revenue_generated = revenue_generated + p_amount,
    updated_at = now()
  WHERE id = p_partnership_id;
  
  -- Log the value creation
  INSERT INTO partnership_value_log (partnership_id, value_type, amount, created_at)
  VALUES (p_partnership_id, p_value_type, p_amount, now());
END;
$$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chamber_partnerships_active ON chamber_partnerships(chamber_a_id, chamber_b_id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_cross_chamber_connections_strength ON cross_chamber_connections(connection_strength, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shared_events_date ON shared_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chamber_referrals_pending ON chamber_referrals(receiving_chamber_id, response_deadline) WHERE status = 'pending'; 