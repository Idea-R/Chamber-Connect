/*
  # Subscription Plans and Payment System

  1. New Tables
    - `subscription_plans` - Available subscription tiers
    - `chamber_subscriptions` - Active chamber subscriptions
    - `payment_transactions` - Payment history tracking

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access to plans
    - Add policies for authenticated access to subscriptions

  3. Seed Data
    - Create Starter, Professional, Enterprise subscription plans
    - Include Stripe price IDs for integration
*/

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price_monthly numeric(10,2) NOT NULL,
  price_yearly numeric(10,2),
  stripe_price_id text,
  stripe_product_id text,
  features text[] DEFAULT '{}',
  max_members integer DEFAULT -1, -- -1 for unlimited
  max_events_per_month integer DEFAULT -1, -- -1 for unlimited
  analytics_enabled boolean DEFAULT true,
  cross_chamber_networking boolean DEFAULT false,
  priority_support boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create chamber_subscriptions table
CREATE TABLE IF NOT EXISTS chamber_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chamber_id uuid REFERENCES chambers(id) ON DELETE CASCADE,
  subscription_plan_id uuid REFERENCES subscription_plans(id),
  stripe_subscription_id text,
  stripe_customer_id text,
  status text CHECK (status IN ('active', 'past_due', 'canceled', 'incomplete', 'incomplete_expired', 'unpaid', 'trialing')) DEFAULT 'trialing',
  current_period_start timestamptz,
  current_period_end timestamptz,
  trial_end timestamptz DEFAULT (now() + interval '14 days'),
  billing_cycle text CHECK (billing_cycle IN ('monthly', 'yearly')) DEFAULT 'monthly',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(chamber_id)
);

-- Create payment_transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chamber_subscription_id uuid REFERENCES chamber_subscriptions(id),
  stripe_payment_intent_id text,
  amount numeric(10,2) NOT NULL,
  currency text DEFAULT 'usd',
  status text CHECK (status IN ('pending', 'succeeded', 'failed', 'canceled')) DEFAULT 'pending',
  description text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE chamber_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_chamber_subscriptions_chamber ON chamber_subscriptions(chamber_id);
CREATE INDEX IF NOT EXISTS idx_chamber_subscriptions_status ON chamber_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_subscription ON payment_transactions(chamber_subscription_id);

-- RLS Policies for subscription_plans (public read)
CREATE POLICY "Subscription plans are publicly readable"
  ON subscription_plans
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- RLS Policies for chamber_subscriptions
CREATE POLICY "Chamber admins can read their subscription"
  ON chamber_subscriptions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chamber_memberships
      WHERE chamber_id = chamber_subscriptions.chamber_id
      AND user_id = auth.uid()
      AND role IN ('admin', 'staff')
      AND status = 'active'
    )
  );

CREATE POLICY "Chamber admins can manage their subscription"
  ON chamber_subscriptions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chamber_memberships
      WHERE chamber_id = chamber_subscriptions.chamber_id
      AND user_id = auth.uid()
      AND role = 'admin'
      AND status = 'active'
    )
  );

-- RLS Policies for payment_transactions
CREATE POLICY "Chamber admins can read their payment transactions"
  ON payment_transactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chamber_subscriptions cs
      JOIN chamber_memberships cm ON cs.chamber_id = cm.chamber_id
      WHERE cs.id = payment_transactions.chamber_subscription_id
      AND cm.user_id = auth.uid()
      AND cm.role IN ('admin', 'staff')
      AND cm.status = 'active'
    )
  );

-- Seed subscription plans
INSERT INTO subscription_plans (
  id,
  name,
  description,
  price_monthly,
  price_yearly,
  features,
  max_members,
  max_events_per_month,
  analytics_enabled,
  cross_chamber_networking,
  priority_support
) VALUES 
(
  '00000000-0000-0000-0000-000000000001',
  'Starter',
  'Perfect for small chambers getting started with digital networking',
  49.00,
  470.40, -- 20% discount for yearly
  ARRAY[
    'Up to 50 chamber members',
    'Basic event management',
    'Member directory',
    'QR code networking',
    'Email support',
    'Mobile-responsive design'
  ],
  50,
  5,
  false,
  false,
  false
),
(
  '00000000-0000-0000-0000-000000000002',
  'Professional', 
  'Ideal for growing chambers with advanced networking needs',
  99.00,
  950.40, -- 20% discount for yearly
  ARRAY[
    'Up to 200 chamber members',
    'Advanced event management',
    'Member directory with search',
    'QR code networking',
    'Analytics dashboard',
    'Priority email support',
    'Custom branding',
    'Event RSVP tracking'
  ],
  200,
  15,
  true,
  false,
  true
),
(
  '00000000-0000-0000-0000-000000000003',
  'Enterprise',
  'Complete solution for large chambers with cross-chamber networking',
  199.00,
  1910.40, -- 20% discount for yearly
  ARRAY[
    'Unlimited chamber members',
    'Complete event management suite',
    'Advanced member directory',
    'QR code networking',
    'Advanced analytics & reporting',
    'Priority phone & email support',
    'Custom branding & domains',
    'Cross-chamber networking',
    'API access',
    'Dedicated account manager'
  ],
  -1, -- unlimited
  -1, -- unlimited
  true,
  true,
  true
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  features = EXCLUDED.features,
  max_members = EXCLUDED.max_members,
  max_events_per_month = EXCLUDED.max_events_per_month,
  analytics_enabled = EXCLUDED.analytics_enabled,
  cross_chamber_networking = EXCLUDED.cross_chamber_networking,
  priority_support = EXCLUDED.priority_support,
  updated_at = now();

-- Create default trial subscription for existing chambers
INSERT INTO chamber_subscriptions (
  chamber_id,
  subscription_plan_id,
  status,
  trial_end
)
SELECT 
  c.id,
  '00000000-0000-0000-0000-000000000002', -- Professional plan for trial
  'trialing',
  now() + interval '14 days'
FROM chambers c
WHERE NOT EXISTS (
  SELECT 1 FROM chamber_subscriptions cs 
  WHERE cs.chamber_id = c.id
)
ON CONFLICT (chamber_id) DO NOTHING;

-- Helper function to get chamber subscription
CREATE OR REPLACE FUNCTION get_chamber_subscription(chamber_uuid uuid)
RETURNS TABLE(
  subscription_id uuid,
  plan_name text,
  status text,
  trial_end timestamptz,
  current_period_end timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cs.id,
    sp.name,
    cs.status,
    cs.trial_end,
    cs.current_period_end
  FROM chamber_subscriptions cs
  JOIN subscription_plans sp ON cs.subscription_plan_id = sp.id
  WHERE cs.chamber_id = chamber_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check subscription limits
CREATE OR REPLACE FUNCTION check_subscription_limit(
  chamber_uuid uuid,
  limit_type text,
  current_count integer
)
RETURNS boolean AS $$
DECLARE
  plan_limit integer;
BEGIN
  SELECT 
    CASE 
      WHEN limit_type = 'members' THEN sp.max_members
      WHEN limit_type = 'events' THEN sp.max_events_per_month
      ELSE -1
    END INTO plan_limit
  FROM chamber_subscriptions cs
  JOIN subscription_plans sp ON cs.subscription_plan_id = sp.id
  WHERE cs.chamber_id = chamber_uuid
  AND cs.status IN ('active', 'trialing');
  
  -- -1 means unlimited
  RETURN (plan_limit = -1 OR current_count < plan_limit);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;