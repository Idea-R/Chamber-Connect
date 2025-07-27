import { supabase } from './supabase'

// Cross-Chamber Networking Types
export interface ChamberPartnership {
  id: string
  chamber_a_id: string
  chamber_b_id: string
  partnership_type: 'basic' | 'premium' | 'strategic' | 'network'
  status: 'pending' | 'active' | 'suspended' | 'expired' | 'terminated'
  member_access_level: 'none' | 'directory_only' | 'events_only' | 'full_access'
  event_sharing_enabled: boolean
  referral_tracking_enabled: boolean
  resource_sharing_enabled: boolean
  revenue_share_percentage: number
  annual_partnership_fee: number
  start_date: string
  end_date?: string
  auto_renewal: boolean
  renewal_notice_days: number
  benefits: string[]
  restrictions: string[]
  member_interactions: number
  events_shared: number
  referrals_generated: number
  revenue_generated: number
  primary_contact_a_id?: string
  primary_contact_b_id?: string
  created_at: string
  updated_at: string
}

export interface ChamberNetwork {
  id: string
  name: string
  description: string
  network_type: 'regional' | 'industry' | 'size_based' | 'specialty' | 'international'
  membership_criteria: Record<string, any>
  benefits: string[]
  membership_fee: number
  governance_model: 'democratic' | 'rotating_lead' | 'designated_admin' | 'consortium'
  lead_chamber_id?: string
  admin_contact_id?: string
  member_count: number
  total_businesses: number
  joint_events_hosted: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SharedEvent {
  id: string
  event_id: string
  hosting_chamber_id: string
  sharing_type: 'open_to_all' | 'partner_only' | 'network_only' | 'selective'
  max_external_attendees?: number
  external_attendee_fee: number
  revenue_share_enabled: boolean
  revenue_share_formula: Record<string, any>
  allow_cross_promotion: boolean
  featured_in_partner_chambers: boolean
  require_partner_approval: boolean
  external_registration_deadline?: string
  external_registrations: number
  revenue_shared: number
  created_at: string
}

export interface CrossChamberConnection {
  id: string
  business_a_id: string
  business_b_id: string
  chamber_a_id: string
  chamber_b_id: string
  connection_source: 'event_meeting' | 'directory_search' | 'referral' | 'network_introduction' | 'partnership_facilitated'
  connection_type: 'professional' | 'vendor_client' | 'partnership' | 'referral' | 'mentorship' | 'collaboration'
  interaction_count: number
  last_interaction_date: string
  connection_strength: 'weak' | 'moderate' | 'strong' | 'strategic'
  referrals_given: number
  referrals_received: number
  deals_closed: number
  estimated_deal_value: number
  generates_partnership_value: boolean
  partnership_credit_a: number
  partnership_credit_b: number
  public_connection: boolean
  allow_chamber_credit: boolean
  created_at: string
  updated_at: string
}

export interface ChamberReferral {
  id: string
  referring_chamber_id: string
  receiving_chamber_id: string
  referring_business_id?: string
  referred_business_id?: string
  referral_type: 'new_member' | 'business_opportunity' | 'event_speaker' | 'vendor_service' | 'partnership'
  referral_description: string
  referral_value_estimate?: number
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'expired'
  response_deadline: string
  outcome_description: string
  actual_value: number
  success_rating?: number
  commission_percentage: number
  commission_amount: number
  commission_paid: boolean
  follow_up_required: boolean
  follow_up_date?: string
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface SharedResource {
  id: string
  owner_chamber_id: string
  resource_type: 'document' | 'template' | 'training' | 'vendor_list' | 'best_practice' | 'case_study' | 'tool' | 'contact_list'
  title: string
  description: string
  content_url?: string
  file_url?: string
  sharing_level: 'private' | 'partners_only' | 'network_only' | 'public'
  access_cost: number
  usage_terms: string
  attribution_required: boolean
  commercial_use_allowed: boolean
  modification_allowed: boolean
  view_count: number
  download_count: number
  revenue_generated: number
  category: string
  tags: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ChamberDiscoveryProfile {
  id: string
  chamber_id: string
  seeking_partnerships: boolean
  partnership_goals: string[]
  target_partnership_types: string[]
  primary_industries: string[]
  geographic_scope: 'local' | 'regional' | 'state' | 'national' | 'international'
  member_size_range: 'small' | 'medium' | 'large' | 'enterprise'
  preferred_chamber_sizes: string[]
  geographic_preferences: string[]
  industry_preferences: string[]
  max_active_partnerships: number
  current_active_partnerships: number
  partnership_bandwidth: 'low' | 'medium' | 'high'
  contact_method: 'email' | 'phone' | 'video_call' | 'in_person'
  response_time_expectation: 'immediate' | 'within_24h' | 'within_week' | 'flexible'
  public_profile: boolean
  featured_in_directory: boolean
  partnership_success_stories_public: boolean
  last_updated: string
}

export interface ChamberRecommendation {
  chamber_id: string
  chamber_name: string
  compatibility_score: number
  match_reasons: string[]
  member_count?: number
  primary_industries?: string[]
  geographic_scope?: string
  partnership_benefits?: string[]
}

// Cross-Chamber Networking API
export class CrossChamberNetworkingAPI {
  // Partnership Management
  async createPartnership(partnershipData: Omit<ChamberPartnership, 'id' | 'created_at' | 'updated_at'>): Promise<ChamberPartnership | null> {
    const { data, error } = await supabase
      .from('chamber_partnerships')
      .insert(partnershipData)
      .select()
      .single()

    if (error) {
      console.error('Error creating partnership:', error)
      return null
    }

    return data
  }

  async getPartnershipsByChamberId(chamberId: string): Promise<ChamberPartnership[]> {
    const { data, error } = await supabase
      .from('chamber_partnerships')
      .select(`
        *,
        chamber_a:chamber_a_id(name, slug, member_count),
        chamber_b:chamber_b_id(name, slug, member_count)
      `)
      .or(`chamber_a_id.eq.${chamberId},chamber_b_id.eq.${chamberId}`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching partnerships:', error)
      return []
    }

    return data || []
  }

  async updatePartnership(partnershipId: string, updates: Partial<ChamberPartnership>): Promise<ChamberPartnership | null> {
    const { data, error } = await supabase
      .from('chamber_partnerships')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', partnershipId)
      .select()
      .single()

    if (error) {
      console.error('Error updating partnership:', error)
      return null
    }

    return data
  }

  async getPartnershipRecommendations(chamberId: string, limit: number = 10): Promise<ChamberRecommendation[]> {
    const { data, error } = await supabase
      .rpc('recommend_chamber_partnerships', { 
        p_chamber_id: chamberId, 
        p_limit: limit 
      })

    if (error) {
      console.error('Error getting partnership recommendations:', error)
      return []
    }

    return data || []
  }

  // Network Management
  async createNetwork(networkData: Omit<ChamberNetwork, 'id' | 'member_count' | 'total_businesses' | 'joint_events_hosted' | 'created_at' | 'updated_at'>): Promise<ChamberNetwork | null> {
    const { data, error } = await supabase
      .from('chamber_networks')
      .insert(networkData)
      .select()
      .single()

    if (error) {
      console.error('Error creating network:', error)
      return null
    }

    return data
  }

  async getNetworks(filters?: { type?: string; active?: boolean }): Promise<ChamberNetwork[]> {
    let query = supabase
      .from('chamber_networks')
      .select('*')
      .order('member_count', { ascending: false })

    if (filters?.type) query = query.eq('network_type', filters.type)
    if (filters?.active !== undefined) query = query.eq('is_active', filters.active)

    const { data, error } = await query

    if (error) {
      console.error('Error fetching networks:', error)
      return []
    }

    return data || []
  }

  async joinNetwork(networkId: string, chamberId: string, membershipTier: string = 'basic'): Promise<boolean> {
    const { error } = await supabase
      .from('chamber_network_memberships')
      .insert({
        network_id: networkId,
        chamber_id: chamberId,
        membership_tier: membershipTier,
        membership_status: 'pending'
      })

    if (error) {
      console.error('Error joining network:', error)
      return false
    }

    return true
  }

  // Shared Events
  async shareEvent(eventId: string, hostingChamberId: string, sharingConfig: Omit<SharedEvent, 'id' | 'event_id' | 'hosting_chamber_id' | 'external_registrations' | 'revenue_shared' | 'created_at'>): Promise<SharedEvent | null> {
    const { data, error } = await supabase
      .from('shared_events')
      .insert({
        event_id: eventId,
        hosting_chamber_id: hostingChamberId,
        ...sharingConfig
      })
      .select()
      .single()

    if (error) {
      console.error('Error sharing event:', error)
      return null
    }

    return data
  }

  async getSharedEvents(chamberId: string, includeHosted: boolean = true): Promise<SharedEvent[]> {
    let query = supabase
      .from('shared_events')
      .select(`
        *,
        event:event_id(title, description, event_date, location, type),
        hosting_chamber:hosting_chamber_id(name, slug)
      `)

    if (includeHosted) {
      query = query.or(`hosting_chamber_id.eq.${chamberId},sharing_type.eq.open_to_all`)
    } else {
      query = query.neq('hosting_chamber_id', chamberId)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching shared events:', error)
      return []
    }

    return data || []
  }

  async inviteChambersToEvent(sharedEventId: string, chamberIds: string[], permissionType: string = 'register_members'): Promise<boolean> {
    const invitations = chamberIds.map(chamberId => ({
      shared_event_id: sharedEventId,
      chamber_id: chamberId,
      permission_type: permissionType
    }))

    const { error } = await supabase
      .from('shared_event_permissions')
      .insert(invitations)

    if (error) {
      console.error('Error inviting chambers to event:', error)
      return false
    }

    return true
  }

  // Cross-Chamber Connections
  async createCrossChamberConnection(connectionData: Omit<CrossChamberConnection, 'id' | 'interaction_count' | 'last_interaction_date' | 'created_at' | 'updated_at'>): Promise<CrossChamberConnection | null> {
    const { data, error } = await supabase
      .from('cross_chamber_connections')
      .insert({
        ...connectionData,
        interaction_count: 1,
        last_interaction_date: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating cross-chamber connection:', error)
      return null
    }

    return data
  }

  async getCrossChamberConnections(chamberId: string, filters?: {
    connectionType?: string
    connectionStrength?: string
    businessId?: string
  }): Promise<CrossChamberConnection[]> {
    let query = supabase
      .from('cross_chamber_connections')
      .select(`
        *,
        business_a:business_a_id(name, category, contact_name),
        business_b:business_b_id(name, category, contact_name),
        chamber_a:chamber_a_id(name, slug),
        chamber_b:chamber_b_id(name, slug)
      `)
      .or(`chamber_a_id.eq.${chamberId},chamber_b_id.eq.${chamberId}`)

    if (filters?.connectionType) query = query.eq('connection_type', filters.connectionType)
    if (filters?.connectionStrength) query = query.eq('connection_strength', filters.connectionStrength)
    if (filters?.businessId) query = query.or(`business_a_id.eq.${filters.businessId},business_b_id.eq.${filters.businessId}`)

    const { data, error } = await query.order('last_interaction_date', { ascending: false })

    if (error) {
      console.error('Error fetching cross-chamber connections:', error)
      return []
    }

    return data || []
  }

  async updateConnectionInteraction(connectionId: string, interactionData: {
    interaction_count?: number
    connection_strength?: string
    deals_closed?: number
    estimated_deal_value?: number
  }): Promise<boolean> {
    const { error } = await supabase
      .from('cross_chamber_connections')
      .update({
        ...interactionData,
        last_interaction_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', connectionId)

    if (error) {
      console.error('Error updating connection interaction:', error)
      return false
    }

    return true
  }

  // Chamber Referrals
  async createReferral(referralData: Omit<ChamberReferral, 'id' | 'created_at' | 'updated_at'>): Promise<ChamberReferral | null> {
    const { data, error } = await supabase
      .from('chamber_referrals')
      .insert(referralData)
      .select()
      .single()

    if (error) {
      console.error('Error creating referral:', error)
      return null
    }

    return data
  }

  async getReferrals(chamberId: string, type: 'sent' | 'received' | 'all' = 'all'): Promise<ChamberReferral[]> {
    let query = supabase
      .from('chamber_referrals')
      .select(`
        *,
        referring_chamber:referring_chamber_id(name, slug),
        receiving_chamber:receiving_chamber_id(name, slug),
        referring_business:referring_business_id(name, contact_name),
        referred_business:referred_business_id(name, contact_name)
      `)

    if (type === 'sent') {
      query = query.eq('referring_chamber_id', chamberId)
    } else if (type === 'received') {
      query = query.eq('receiving_chamber_id', chamberId)
    } else {
      query = query.or(`referring_chamber_id.eq.${chamberId},receiving_chamber_id.eq.${chamberId}`)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching referrals:', error)
      return []
    }

    return data || []
  }

  async updateReferralStatus(referralId: string, status: string, outcomeData?: {
    outcome_description?: string
    actual_value?: number
    success_rating?: number
  }): Promise<boolean> {
    const updateData: any = { 
      status, 
      updated_at: new Date().toISOString() 
    }

    if (status === 'completed' && outcomeData) {
      updateData.completed_at = new Date().toISOString()
      updateData.outcome_description = outcomeData.outcome_description
      updateData.actual_value = outcomeData.actual_value
      updateData.success_rating = outcomeData.success_rating
    }

    const { error } = await supabase
      .from('chamber_referrals')
      .update(updateData)
      .eq('id', referralId)

    if (error) {
      console.error('Error updating referral status:', error)
      return false
    }

    return true
  }

  // Shared Resources
  async createSharedResource(resourceData: Omit<SharedResource, 'id' | 'view_count' | 'download_count' | 'revenue_generated' | 'created_at' | 'updated_at'>): Promise<SharedResource | null> {
    const { data, error } = await supabase
      .from('shared_resources')
      .insert(resourceData)
      .select()
      .single()

    if (error) {
      console.error('Error creating shared resource:', error)
      return null
    }

    return data
  }

  async getSharedResources(chamberId: string, filters?: {
    resourceType?: string
    category?: string
    sharingLevel?: string
  }): Promise<SharedResource[]> {
    let query = supabase
      .from('shared_resources')
      .select(`
        *,
        owner_chamber:owner_chamber_id(name, slug)
      `)
      .eq('is_active', true)

    // Apply access level filtering based on chamber relationships
    query = query.or(`owner_chamber_id.eq.${chamberId},sharing_level.eq.public`)

    if (filters?.resourceType) query = query.eq('resource_type', filters.resourceType)
    if (filters?.category) query = query.eq('category', filters.category)
    if (filters?.sharingLevel) query = query.eq('sharing_level', filters.sharingLevel)

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching shared resources:', error)
      return []
    }

    return data || []
  }

  async accessResource(resourceId: string, accessingChamberId: string, accessType: string = 'view'): Promise<boolean> {
    // Log the access
    const { error: logError } = await supabase
      .from('resource_access_log')
      .insert({
        resource_id: resourceId,
        accessing_chamber_id: accessingChamberId,
        access_type: accessType
      })

    if (logError) {
      console.error('Error logging resource access:', logError)
      return false
    }

    // Update resource metrics
    const updateField = accessType === 'download' ? 'download_count' : 'view_count'
    const { error: updateError } = await supabase
      .rpc('increment_resource_metric', {
        resource_id: resourceId,
        metric_field: updateField
      })

    if (updateError) {
      console.error('Error updating resource metrics:', updateError)
    }

    return true
  }

  // Discovery and Matching
  async updateDiscoveryProfile(chamberId: string, profileData: Partial<ChamberDiscoveryProfile>): Promise<ChamberDiscoveryProfile | null> {
    const { data, error } = await supabase
      .from('chamber_discovery_profiles')
      .upsert({
        chamber_id: chamberId,
        ...profileData,
        last_updated: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error updating discovery profile:', error)
      return null
    }

    return data
  }

  async getDiscoveryProfile(chamberId: string): Promise<ChamberDiscoveryProfile | null> {
    const { data, error } = await supabase
      .from('chamber_discovery_profiles')
      .select('*')
      .eq('chamber_id', chamberId)
      .single()

    if (error) {
      console.error('Error fetching discovery profile:', error)
      return null
    }

    return data
  }

  async searchChambers(searchCriteria: {
    geographic_scope?: string
    member_size_range?: string
    primary_industries?: string[]
    partnership_types?: string[]
    seeking_partnerships?: boolean
  }): Promise<ChamberDiscoveryProfile[]> {
    let query = supabase
      .from('chamber_discovery_profiles')
      .select(`
        *,
        chamber:chamber_id(name, slug, member_count, description)
      `)
      .eq('public_profile', true)

    if (searchCriteria.geographic_scope) {
      query = query.eq('geographic_scope', searchCriteria.geographic_scope)
    }

    if (searchCriteria.member_size_range) {
      query = query.contains('preferred_chamber_sizes', [searchCriteria.member_size_range])
    }

    if (searchCriteria.seeking_partnerships !== undefined) {
      query = query.eq('seeking_partnerships', searchCriteria.seeking_partnerships)
    }

    const { data, error } = await query.order('last_updated', { ascending: false })

    if (error) {
      console.error('Error searching chambers:', error)
      return []
    }

    return data || []
  }

  // Analytics and Reporting
  async getCrossChamberNetworkingStats(chamberId: string): Promise<any> {
    const { data, error } = await supabase
      .rpc('get_cross_chamber_networking_stats', { p_chamber_id: chamberId })

    if (error) {
      console.error('Error fetching networking stats:', error)
      return null
    }

    return data
  }

  async getPartnershipPerformanceMetrics(partnershipId: string): Promise<any> {
    const { data, error } = await supabase
      .from('chamber_partnerships')
      .select(`
        *,
        connection_count:cross_chamber_connections(count),
        referral_count:chamber_referrals(count),
        shared_event_count:shared_events(count)
      `)
      .eq('id', partnershipId)
      .single()

    if (error) {
      console.error('Error fetching partnership metrics:', error)
      return null
    }

    return data
  }

  // Utility functions
  async trackPartnershipValue(partnershipId: string, valueType: string, amount: number): Promise<boolean> {
    const { error } = await supabase
      .rpc('track_partnership_value', {
        p_partnership_id: partnershipId,
        p_value_type: valueType,
        p_amount: amount
      })

    if (error) {
      console.error('Error tracking partnership value:', error)
      return false
    }

    return true
  }
}

// Singleton instance
export const crossChamberAPI = new CrossChamberNetworkingAPI()

// Utility functions
export function calculatePartnershipCompatibility(chamberA: any, chamberB: any): {
  score: number
  reasons: string[]
} {
  let score = 0
  const reasons: string[] = []

  // Geographic compatibility
  if (chamberA.geographic_scope === chamberB.geographic_scope) {
    score += 0.3
    reasons.push('Same geographic scope')
  }

  // Size compatibility (similar size chambers often work well together)
  const sizeA = chamberA.member_count || 0
  const sizeB = chamberB.member_count || 0
  const sizeDiff = Math.abs(sizeA - sizeB) / Math.max(sizeA, sizeB)
  if (sizeDiff < 0.5) {
    score += 0.2
    reasons.push('Similar size')
  }

  // Industry complementarity
  const industriesA = chamberA.primary_industries || []
  const industriesB = chamberB.primary_industries || []
  const commonIndustries = industriesA.filter((industry: string) => industriesB.includes(industry))
  const complementaryIndustries = industriesA.length + industriesB.length - commonIndustries.length

  if (commonIndustries.length > 0 && complementaryIndustries > commonIndustries.length) {
    score += 0.3
    reasons.push('Complementary industries')
  }

  // Partnership goals alignment
  const goalsA = chamberA.partnership_goals || []
  const goalsB = chamberB.partnership_goals || []
  const alignedGoals = goalsA.filter((goal: string) => goalsB.includes(goal))
  
  if (alignedGoals.length > 0) {
    score += 0.2
    reasons.push('Aligned partnership goals')
  }

  return { score: Math.min(score, 1.0), reasons }
}

export function getPartnershipTierBenefits(tier: string): string[] {
  switch (tier) {
    case 'basic':
      return ['Directory sharing', 'Basic event cross-promotion', 'Referral tracking']
    case 'premium':
      return ['All basic benefits', 'Shared event hosting', 'Member discounts', 'Resource sharing']
    case 'strategic':
      return ['All premium benefits', 'Joint marketing', 'Revenue sharing', 'Strategic planning sessions']
    case 'network':
      return ['Multi-chamber network access', 'Regional event calendar', 'Bulk purchasing power']
    default:
      return []
  }
}

export function formatPartnershipStatus(status: string): { color: string; label: string } {
  switch (status) {
    case 'pending':
      return { color: 'bg-yellow-100 text-yellow-800', label: 'Pending Approval' }
    case 'active':
      return { color: 'bg-green-100 text-green-800', label: 'Active Partnership' }
    case 'suspended':
      return { color: 'bg-orange-100 text-orange-800', label: 'Temporarily Suspended' }
    case 'expired':
      return { color: 'bg-gray-100 text-gray-800', label: 'Expired' }
    case 'terminated':
      return { color: 'bg-red-100 text-red-800', label: 'Terminated' }
    default:
      return { color: 'bg-gray-100 text-gray-800', label: 'Unknown' }
  }
} 