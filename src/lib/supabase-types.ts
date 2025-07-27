// Supabase Type Definitions
// Refactored from original supabase.ts for compliance with 500-line rule

export interface ChamberMembership {
  id: string
  user_id: string
  chamber_id: string
  role: 'admin' | 'staff' | 'member'
  permissions: Record<string, any>
  status: 'active' | 'inactive' | 'pending'
  joined_at: string
  created_at: string
  updated_at: string
  chamber?: Chamber // Joined chamber data
}

export interface Chamber {
  id: string
  user_id?: string
  name: string
  slug: string
  tagline: string
  description: string
  address: string
  phone: string
  email: string
  website: string
  logo_url: string
  hero_image_url: string
  member_count: number
  events_per_month: number
  years_serving: number
  about_section: string
  services_offered: string[]
  social_media: {
    facebook?: string
    twitter?: string
    linkedin?: string
    instagram?: string
  }
  settings: {
    showMemberCount?: boolean
    showUpcomingEvents?: boolean
    showMemberSpotlight?: boolean
    allowMemberSignup?: boolean
  }
  created_at: string
  updated_at: string
}

export interface Business {
  id: string
  user_id?: string
  chamber_id: string
  name: string
  description: string
  category: string
  address: string
  phone: string
  email: string
  website: string
  contact_name: string
  contact_avatar_url: string
  member_since: string
  featured: boolean
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role: 'chamber_admin' | 'business_owner' | 'staff'
  created_at: string
  updated_at: string
}

// New subscription and payment types
export interface SubscriptionPlan {
  id: string
  name: string
  description?: string
  price_monthly: number
  price_yearly?: number
  stripe_price_id?: string
  stripe_product_id?: string
  features: string[]
  max_members: number
  max_events_per_month: number
  analytics_enabled: boolean
  cross_chamber_networking: boolean
  priority_support: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ChamberSubscription {
  id: string
  chamber_id: string
  subscription_plan_id: string
  stripe_subscription_id?: string
  stripe_customer_id?: string
  status: 'active' | 'past_due' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'unpaid' | 'trialing'
  current_period_start?: string
  current_period_end?: string
  trial_end?: string
  billing_cycle: 'monthly' | 'yearly'
  created_at: string
  updated_at: string
  subscription_plan?: SubscriptionPlan
}

export interface PaymentTransaction {
  id: string
  chamber_subscription_id: string
  stripe_payment_intent_id?: string
  stripe_invoice_id?: string
  amount: number
  currency: string
  status: 'succeeded' | 'pending' | 'failed' | 'canceled' | 'refunded'
  payment_method?: string
  failure_reason?: string
  processed_at?: string
  created_at: string
}

// Enhanced user context for role-based access
export interface UserAuthContext {
  user: UserProfile | null
  chambers: ChamberMembership[]
  primaryChamber: Chamber | null
  subscription: ChamberSubscription | null
  permissions: {
    canManageChamber: boolean
    canManageMembers: boolean
    canCreateEvents: boolean
    canViewAnalytics: boolean
    canAccessCrossChamber: boolean
    canManageSubscription: boolean
  }
}

export interface Event {
  id: string
  chamber_id: string
  organizer_id: string | null
  title: string
  description: string
  event_date: string
  location: string
  type: 'networking' | 'workshop' | 'seminar' | 'social'
  max_attendees: number
  price: number
  featured: boolean
  created_at: string
  updated_at: string
  organizer?: Business
  attendee_count?: number
}

export interface Message {
  id: string
  chamber_id: string
  sender_id: string
  recipient_id: string
  content: string
  read: boolean
  created_at: string
  sender?: Business
  recipient?: Business
}

export interface Connection {
  id: string
  chamber_id: string
  business_a_id: string
  business_b_id: string
  status: 'pending' | 'connected' | 'declined'
  created_at: string
  business_a?: Business
  business_b?: Business
}

export interface Spotlight {
  id: string
  chamber_id: string
  business_id: string
  title: string
  description: string
  content: string
  featured: boolean
  views: number
  likes: number
  published_date: string
  created_at: string
  business?: Business
}

// Enhanced types for new features
export interface QRScan {
  id: string
  business_id: string
  chamber_id: string
  scanner_ip?: string
  scanner_user_agent?: string
  referrer_url?: string
  scan_source: 'event' | 'business_card' | 'website' | 'direct'
  device_type: 'mobile' | 'desktop' | 'tablet'
  city_name?: string
  country_code?: string
  created_at: string
}

export interface EventRegistration {
  id: string
  event_id: string
  business_id: string
  status: 'registered' | 'checked_in' | 'no_show' | 'cancelled'
  special_requirements?: string
  payment_status?: 'pending' | 'completed' | 'failed'
  registered_at: string
  checked_in_at?: string
}

export interface EventSession {
  id: string
  event_id: string
  title: string
  description?: string
  start_time: string
  end_time: string
  location?: string
  max_attendees?: number
  session_type: 'presentation' | 'workshop' | 'networking' | 'break'
  created_at: string
}

export interface Speaker {
  id: string
  name: string
  title?: string
  company?: string
  bio?: string
  avatar_url?: string
  linkedin_url?: string
  website_url?: string
  email?: string
  created_at: string
}

export interface EventSpeaker {
  id: string
  event_id: string
  session_id?: string
  speaker_id: string
  role: 'keynote' | 'presenter' | 'panelist' | 'moderator'
  created_at: string
  speaker?: Speaker
}

// Cross-chamber networking types
export interface ChamberPartnership {
  id: string
  chamber_a_id: string
  chamber_b_id: string
  partnership_type: 'basic' | 'premium' | 'strategic' | 'network'
  status: 'pending' | 'active' | 'suspended' | 'terminated'
  revenue_share_percentage?: number
  auto_renewal: boolean
  terms?: string
  start_date: string
  end_date?: string
  created_at: string
  updated_at: string
}

export interface CrossChamberConnection {
  id: string
  business_a_id: string
  business_b_id: string
  chamber_a_id: string
  chamber_b_id: string
  connection_type: 'professional' | 'vendor_client' | 'partnership' | 'mentorship'
  status: 'pending' | 'active' | 'completed'
  value_generated?: number
  facilitating_chamber_id: string
  created_at: string
  updated_at: string
}

export interface ChamberReferral {
  id: string
  referring_chamber_id: string
  receiving_chamber_id: string
  business_id?: string
  referral_type: 'member' | 'opportunity' | 'speaker' | 'vendor' | 'partnership'
  status: 'pending' | 'accepted' | 'completed' | 'declined'
  description: string
  estimated_value?: number
  actual_value?: number
  commission_rate?: number
  commission_paid?: boolean
  success_rating?: number
  created_at: string
  updated_at: string
}

// API Response types
export type SupabaseResponse<T> = {
  data: T | null
  error: Error | null
}

export type SupabaseListResponse<T> = {
  data: T[] | null
  error: Error | null
} 