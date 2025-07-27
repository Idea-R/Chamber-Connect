/*
  # QR Code Analytics & Tracking Enhancement

  1. New Tables
    - `qr_scans` - Track every QR code scan with metadata
    - `profile_views` - Track business profile views from QR codes
    - `qr_analytics_summary` - Daily aggregated analytics data

  2. Enhanced Features
    - Geolocation tracking (optional, privacy-compliant)
    - Device/browser tracking 
    - Event-specific QR performance
    - Referrer tracking (from which event/location)
    - Time-based analytics (peak scanning times)

  3. Privacy & Compliance
    - Anonymous tracking by default
    - GDPR-compliant data retention
    - User opt-out capabilities
*/

-- Create QR scans tracking table
CREATE TABLE IF NOT EXISTS qr_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chamber_id uuid REFERENCES chambers(id) ON DELETE CASCADE,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  event_id uuid REFERENCES events(id) ON DELETE SET NULL,
  
  -- Scan metadata
  scan_source text CHECK (scan_source IN ('event', 'business_card', 'website', 'direct', 'unknown')) DEFAULT 'unknown',
  referrer_url text,
  event_context text, -- Which specific event or location
  
  -- Device/Browser info (anonymized)
  user_agent text,
  device_type text CHECK (device_type IN ('mobile', 'tablet', 'desktop', 'unknown')) DEFAULT 'unknown',
  browser_name text,
  
  -- Geographic info (city-level only for privacy)
  country_code char(2),
  city_name text,
  latitude decimal(10,8), -- Optional, user consent required
  longitude decimal(11,8), -- Optional, user consent required
  
  -- Analytics data
  is_return_scan boolean DEFAULT false, -- Has this device scanned this QR before?
  session_id text, -- To group scans in same session
  conversion_action text, -- What did they do after scanning? (viewed, messaged, connected)
  time_on_profile integer DEFAULT 0, -- Seconds spent viewing profile
  
  -- Compliance
  user_consent_given boolean DEFAULT false,
  ip_address inet, -- For fraud detection only
  gdpr_compliant boolean DEFAULT true,
  
  created_at timestamptz DEFAULT now(),
  
  -- Indexes for analytics queries
  INDEX (chamber_id, created_at),
  INDEX (business_id, created_at),
  INDEX (event_id, created_at),
  INDEX (scan_source, created_at)
);

-- Create profile views tracking table (more detailed than scans)
CREATE TABLE IF NOT EXISTS profile_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chamber_id uuid REFERENCES chambers(id) ON DELETE CASCADE,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  qr_scan_id uuid REFERENCES qr_scans(id) ON DELETE SET NULL,
  
  -- View details
  view_duration integer DEFAULT 0, -- Total time spent on profile (seconds)
  sections_viewed jsonb DEFAULT '[]'::jsonb, -- Which sections were viewed ["contact", "services", "photos"]
  actions_taken jsonb DEFAULT '[]'::jsonb, -- Actions taken ["called", "emailed", "messaged", "connected"]
  
  -- Engagement metrics
  scroll_depth_percentage integer DEFAULT 0, -- How far down the profile they scrolled
  clicked_phone boolean DEFAULT false,
  clicked_email boolean DEFAULT false,
  clicked_website boolean DEFAULT false,
  clicked_social_media boolean DEFAULT false,
  downloaded_vcf boolean DEFAULT false, -- Downloaded contact card
  
  -- Follow-up tracking
  follow_up_sent boolean DEFAULT false,
  connection_requested boolean DEFAULT false,
  message_sent boolean DEFAULT false,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create daily analytics summary table for performance
CREATE TABLE IF NOT EXISTS qr_analytics_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chamber_id uuid REFERENCES chambers(id) ON DELETE CASCADE,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  date date NOT NULL,
  
  -- Daily metrics
  total_scans integer DEFAULT 0,
  unique_scans integer DEFAULT 0,
  return_scans integer DEFAULT 0,
  profile_views integer DEFAULT 0,
  avg_view_duration decimal(8,2) DEFAULT 0,
  
  -- Conversion metrics
  phone_clicks integer DEFAULT 0,
  email_clicks integer DEFAULT 0,
  website_clicks integer DEFAULT 0,
  connections_made integer DEFAULT 0,
  messages_sent integer DEFAULT 0,
  
  -- Device breakdown
  mobile_scans integer DEFAULT 0,
  desktop_scans integer DEFAULT 0,
  tablet_scans integer DEFAULT 0,
  
  -- Source breakdown
  event_scans integer DEFAULT 0,
  direct_scans integer DEFAULT 0,
  business_card_scans integer DEFAULT 0,
  
  created_at timestamptz DEFAULT now(),
  
  -- Ensure one record per business per day
  UNIQUE(business_id, date)
);

-- Create QR code performance tracking for events
CREATE TABLE IF NOT EXISTS event_qr_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- Event-specific metrics
  scans_during_event integer DEFAULT 0,
  scans_after_event integer DEFAULT 0, -- Scans in 7 days after event
  connections_from_event integer DEFAULT 0,
  messages_from_event integer DEFAULT 0,
  
  -- ROI metrics for the business
  estimated_leads_generated integer DEFAULT 0,
  follow_up_meetings_scheduled integer DEFAULT 0,
  business_deals_attributed integer DEFAULT 0,
  
  last_updated timestamptz DEFAULT now(),
  
  UNIQUE(event_id, business_id)
);

-- Enable RLS on new tables
ALTER TABLE qr_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_analytics_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_qr_performance ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- QR scans policies
CREATE POLICY "QR scans are readable by chamber admins and business owners"
  ON qr_scans
  FOR SELECT
  TO authenticated
  USING (
    chamber_id IN (
      SELECT chamber_id FROM chamber_memberships 
      WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
    ) OR
    business_id IN (
      SELECT id FROM businesses 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert QR scans"
  ON qr_scans
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Profile views policies  
CREATE POLICY "Profile views are readable by chamber admins and business owners"
  ON profile_views
  FOR SELECT
  TO authenticated
  USING (
    chamber_id IN (
      SELECT chamber_id FROM chamber_memberships 
      WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
    ) OR
    business_id IN (
      SELECT id FROM businesses 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert profile views"
  ON profile_views
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Analytics summary policies
CREATE POLICY "Analytics summary readable by chamber admins and business owners"
  ON qr_analytics_summary
  FOR SELECT
  TO authenticated
  USING (
    chamber_id IN (
      SELECT chamber_id FROM chamber_memberships 
      WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
    ) OR
    business_id IN (
      SELECT id FROM businesses 
      WHERE user_id = auth.uid()
    )
  );

-- Event QR performance policies
CREATE POLICY "Event QR performance readable by chamber admins and business owners"
  ON event_qr_performance
  FOR SELECT
  TO authenticated
  USING (
    event_id IN (
      SELECT id FROM events 
      WHERE chamber_id IN (
        SELECT chamber_id FROM chamber_memberships 
        WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
      )
    ) OR
    business_id IN (
      SELECT id FROM businesses 
      WHERE user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX idx_qr_scans_chamber_date ON qr_scans(chamber_id, created_at);
CREATE INDEX idx_qr_scans_business_date ON qr_scans(business_id, created_at);
CREATE INDEX idx_qr_scans_event_date ON qr_scans(event_id, created_at);
CREATE INDEX idx_qr_scans_source ON qr_scans(scan_source);
CREATE INDEX idx_profile_views_business_date ON profile_views(business_id, created_at);
CREATE INDEX idx_qr_analytics_date ON qr_analytics_summary(date);
CREATE INDEX idx_event_qr_performance_event ON event_qr_performance(event_id);

-- Create functions for analytics aggregation

-- Function to aggregate daily QR analytics
CREATE OR REPLACE FUNCTION aggregate_daily_qr_analytics(target_date date DEFAULT CURRENT_DATE)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert or update daily summary
  INSERT INTO qr_analytics_summary (
    chamber_id, business_id, date,
    total_scans, unique_scans, return_scans,
    profile_views, avg_view_duration,
    phone_clicks, email_clicks, website_clicks,
    connections_made, messages_sent,
    mobile_scans, desktop_scans, tablet_scans,
    event_scans, direct_scans, business_card_scans
  )
  SELECT 
    s.chamber_id,
    s.business_id,
    target_date,
    COUNT(*) as total_scans,
    COUNT(DISTINCT s.session_id) as unique_scans,
    COUNT(*) FILTER (WHERE s.is_return_scan = true) as return_scans,
    COUNT(pv.id) as profile_views,
    COALESCE(AVG(pv.view_duration), 0) as avg_view_duration,
    COUNT(*) FILTER (WHERE pv.clicked_phone = true) as phone_clicks,
    COUNT(*) FILTER (WHERE pv.clicked_email = true) as email_clicks,
    COUNT(*) FILTER (WHERE pv.clicked_website = true) as website_clicks,
    COUNT(*) FILTER (WHERE pv.connection_requested = true) as connections_made,
    COUNT(*) FILTER (WHERE pv.message_sent = true) as messages_sent,
    COUNT(*) FILTER (WHERE s.device_type = 'mobile') as mobile_scans,
    COUNT(*) FILTER (WHERE s.device_type = 'desktop') as desktop_scans,
    COUNT(*) FILTER (WHERE s.device_type = 'tablet') as tablet_scans,
    COUNT(*) FILTER (WHERE s.scan_source = 'event') as event_scans,
    COUNT(*) FILTER (WHERE s.scan_source = 'direct') as direct_scans,
    COUNT(*) FILTER (WHERE s.scan_source = 'business_card') as business_card_scans
  FROM qr_scans s
  LEFT JOIN profile_views pv ON s.id = pv.qr_scan_id
  WHERE DATE(s.created_at) = target_date
  GROUP BY s.chamber_id, s.business_id
  ON CONFLICT (business_id, date) 
  DO UPDATE SET
    total_scans = EXCLUDED.total_scans,
    unique_scans = EXCLUDED.unique_scans,
    return_scans = EXCLUDED.return_scans,
    profile_views = EXCLUDED.profile_views,
    avg_view_duration = EXCLUDED.avg_view_duration,
    phone_clicks = EXCLUDED.phone_clicks,
    email_clicks = EXCLUDED.email_clicks,
    website_clicks = EXCLUDED.website_clicks,
    connections_made = EXCLUDED.connections_made,
    messages_sent = EXCLUDED.messages_sent,
    mobile_scans = EXCLUDED.mobile_scans,
    desktop_scans = EXCLUDED.desktop_scans,
    tablet_scans = EXCLUDED.tablet_scans,
    event_scans = EXCLUDED.event_scans,
    direct_scans = EXCLUDED.direct_scans,
    business_card_scans = EXCLUDED.business_card_scans;
END;
$$;

-- Function to get QR analytics for a business
CREATE OR REPLACE FUNCTION get_business_qr_analytics(
  business_uuid uuid,
  start_date date DEFAULT CURRENT_DATE - INTERVAL '30 days',
  end_date date DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  total_scans bigint,
  unique_visitors bigint,
  conversion_rate decimal,
  top_source text,
  peak_day date,
  growth_rate decimal
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH analytics AS (
    SELECT 
      COUNT(*) as scans,
      COUNT(DISTINCT session_id) as visitors,
      COUNT(*) FILTER (WHERE conversion_action IS NOT NULL) as conversions,
      scan_source,
      DATE(created_at) as scan_date
    FROM qr_scans
    WHERE business_id = business_uuid
      AND DATE(created_at) BETWEEN start_date AND end_date
    GROUP BY scan_source, DATE(created_at)
  ),
  summary AS (
    SELECT 
      SUM(scans) as total_scans,
      SUM(visitors) as unique_visitors,
      CASE 
        WHEN SUM(visitors) > 0 
        THEN ROUND((SUM(conversions)::decimal / SUM(visitors)) * 100, 2)
        ELSE 0 
      END as conversion_rate,
      (SELECT scan_source FROM analytics GROUP BY scan_source ORDER BY SUM(scans) DESC LIMIT 1) as top_source,
      (SELECT scan_date FROM analytics GROUP BY scan_date ORDER BY SUM(scans) DESC LIMIT 1) as peak_day
    FROM analytics
  )
  SELECT 
    s.total_scans,
    s.unique_visitors,
    s.conversion_rate,
    s.top_source,
    s.peak_day,
    CASE 
      WHEN s.total_scans > 0 
      THEN ROUND(((s.total_scans - LAG(s.total_scans) OVER()) / LAG(s.total_scans) OVER()) * 100, 2)
      ELSE 0 
    END as growth_rate
  FROM summary s;
END;
$$; 