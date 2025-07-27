import { supabase } from './supabase'
import { generateTrackingQRCodeUrl } from './qr-analytics'

// Enhanced Event Types
export interface EnhancedEvent {
  id: string
  chamber_id: string
  organizer_id?: string
  title: string
  description: string
  event_date: string
  end_date?: string
  location: string
  type: 'networking' | 'workshop' | 'seminar' | 'social'
  event_format: 'in_person' | 'virtual' | 'hybrid'
  status: 'draft' | 'published' | 'cancelled' | 'completed'
  max_attendees: number
  price: number
  early_bird_price?: number
  early_bird_deadline?: string
  member_price?: number
  non_member_price?: number
  virtual_meeting_url?: string
  virtual_meeting_id?: string
  virtual_meeting_password?: string
  streaming_url?: string
  timezone: string
  waitlist_enabled: boolean
  waitlist_capacity: number
  registration_fields: CustomField[]
  check_in_enabled: boolean
  tags: string[]
  settings: EventSettings
  featured: boolean
  created_at: string
  updated_at: string
}

export interface CustomField {
  id: string
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox' | 'radio'
  label: string
  placeholder?: string
  required: boolean
  options?: string[] // For select, radio types
  validation?: string // Regex pattern
}

export interface EventSettings {
  enable_networking_matches: boolean
  enable_feedback_collection: boolean
  require_dietary_restrictions: boolean
  require_accessibility_needs: boolean
  enable_speaker_evaluations: boolean
  enable_session_ratings: boolean
  send_automatic_reminders: boolean
  enable_sponsor_booths: boolean
  enable_virtual_networking_rooms: boolean
  max_virtual_room_size: number
}

export interface EventSession {
  id: string
  event_id: string
  title: string
  description: string
  start_time: string
  end_time: string
  location: string
  virtual_room_url?: string
  speaker_ids: string[]
  max_attendees?: number
  session_type: 'presentation' | 'workshop' | 'networking' | 'break' | 'panel' | 'q_and_a'
  is_mandatory: boolean
  order_index: number
  created_at: string
  updated_at: string
}

export interface EventSpeaker {
  id: string
  event_id: string
  name: string
  title: string
  company: string
  bio: string
  avatar_url?: string
  linkedin_url?: string
  twitter_url?: string
  website_url?: string
  is_featured: boolean
  contact_email?: string
  speaking_fee: number
  created_at: string
}

export interface EventRegistration {
  id: string
  event_id: string
  business_id: string
  registration_type: 'regular' | 'early_bird' | 'member' | 'non_member' | 'waitlist' | 'comp'
  registration_status: 'pending' | 'confirmed' | 'cancelled' | 'waitlist' | 'no_show'
  ticket_price: number
  discount_applied: number
  total_paid: number
  payment_status: 'pending' | 'paid' | 'refunded' | 'comp'
  payment_method?: string
  custom_fields: Record<string, any>
  special_requirements: string
  waitlist_position?: number
  waitlist_notified: boolean
  email_reminders: boolean
  sms_reminders: boolean
  registered_at: string
  confirmed_at?: string
  cancelled_at?: string
}

export interface EventCheckIn {
  id: string
  event_id: string
  business_id: string
  session_id?: string
  check_in_time: string
  check_out_time?: string
  check_in_method: 'qr_code' | 'manual' | 'app' | 'virtual_join'
  check_in_location?: { lat: number; lng: number; address: string }
  device_info?: { type: string; browser: string; os: string }
  virtual_attendance_duration: number
  virtual_interaction_score: number
  notes: string
  no_show: boolean
}

export interface EventNetworkingMatch {
  id: string
  event_id: string
  business_a_id: string
  business_b_id: string
  match_score: number
  match_reasons: string[]
  status: 'suggested' | 'accepted' | 'declined' | 'connected' | 'expired'
  viewed_by_a: boolean
  viewed_by_b: boolean
  contacted: boolean
  meeting_scheduled: boolean
  expires_at: string
}

export interface EventFeedback {
  id: string
  event_id: string
  business_id: string
  overall_rating: number
  content_rating: number
  organization_rating: number
  networking_rating: number
  venue_rating: number
  technology_rating?: number
  virtual_networking_rating?: number
  favorite_aspect: string
  improvement_suggestions: string
  additional_comments: string
  would_recommend: boolean
  likely_to_attend_again: boolean
  preferred_event_format: 'in_person' | 'virtual' | 'hybrid' | 'no_preference'
  interested_in_follow_up: boolean
  preferred_contact_method: 'email' | 'phone' | 'linkedin' | 'none'
  submitted_at: string
}

// Event Management API
export class EventManagerAPI {
  // Enhanced Event CRUD
  async createEvent(eventData: Partial<EnhancedEvent>): Promise<EnhancedEvent | null> {
    const { data, error } = await supabase
      .from('events')
      .insert(eventData)
      .select()
      .single()

    if (error) {
      console.error('Error creating event:', error)
      return null
    }

    return data
  }

  async updateEvent(eventId: string, updates: Partial<EnhancedEvent>): Promise<EnhancedEvent | null> {
    const { data, error } = await supabase
      .from('events')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', eventId)
      .select()
      .single()

    if (error) {
      console.error('Error updating event:', error)
      return null
    }

    return data
  }

  async getEvent(eventId: string): Promise<EnhancedEvent | null> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (error) {
      console.error('Error fetching event:', error)
      return null
    }

    return data
  }

  async getEventsByChamber(chamberId: string, filters?: {
    status?: string
    format?: string
    type?: string
    startDate?: string
    endDate?: string
  }): Promise<EnhancedEvent[]> {
    let query = supabase
      .from('events')
      .select('*')
      .eq('chamber_id', chamberId)
      .order('event_date')

    if (filters?.status) query = query.eq('status', filters.status)
    if (filters?.format) query = query.eq('event_format', filters.format)
    if (filters?.type) query = query.eq('type', filters.type)
    if (filters?.startDate) query = query.gte('event_date', filters.startDate)
    if (filters?.endDate) query = query.lte('event_date', filters.endDate)

    const { data, error } = await query

    if (error) {
      console.error('Error fetching events:', error)
      return []
    }

    return data || []
  }

  // Session Management
  async createSession(sessionData: Omit<EventSession, 'id' | 'created_at' | 'updated_at'>): Promise<EventSession | null> {
    const { data, error } = await supabase
      .from('event_sessions')
      .insert(sessionData)
      .select()
      .single()

    if (error) {
      console.error('Error creating session:', error)
      return null
    }

    return data
  }

  async getEventSessions(eventId: string): Promise<EventSession[]> {
    const { data, error } = await supabase
      .from('event_sessions')
      .select('*')
      .eq('event_id', eventId)
      .order('order_index')

    if (error) {
      console.error('Error fetching sessions:', error)
      return []
    }

    return data || []
  }

  async updateSession(sessionId: string, updates: Partial<EventSession>): Promise<EventSession | null> {
    const { data, error } = await supabase
      .from('event_sessions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', sessionId)
      .select()
      .single()

    if (error) {
      console.error('Error updating session:', error)
      return null
    }

    return data
  }

  // Speaker Management
  async addSpeaker(speakerData: Omit<EventSpeaker, 'id' | 'created_at'>): Promise<EventSpeaker | null> {
    const { data, error } = await supabase
      .from('event_speakers')
      .insert(speakerData)
      .select()
      .single()

    if (error) {
      console.error('Error adding speaker:', error)
      return null
    }

    return data
  }

  async getEventSpeakers(eventId: string): Promise<EventSpeaker[]> {
    const { data, error } = await supabase
      .from('event_speakers')
      .select('*')
      .eq('event_id', eventId)
      .order('is_featured', { ascending: false })

    if (error) {
      console.error('Error fetching speakers:', error)
      return []
    }

    return data || []
  }

  // Registration Management
  async registerForEvent(registrationData: Omit<EventRegistration, 'id' | 'registered_at' | 'created_at' | 'updated_at'>): Promise<EventRegistration | null> {
    const { data, error } = await supabase
      .from('event_registrations')
      .insert(registrationData)
      .select()
      .single()

    if (error) {
      console.error('Error registering for event:', error)
      return null
    }

    // Check if we need to promote from waitlist
    if (registrationData.registration_status === 'confirmed') {
      await this.promoteFromWaitlist(registrationData.event_id)
    }

    return data
  }

  async getEventRegistrations(eventId: string): Promise<EventRegistration[]> {
    const { data, error } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', eventId)
      .order('registered_at')

    if (error) {
      console.error('Error fetching registrations:', error)
      return []
    }

    return data || []
  }

  async updateRegistration(registrationId: string, updates: Partial<EventRegistration>): Promise<EventRegistration | null> {
    const { data, error } = await supabase
      .from('event_registrations')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', registrationId)
      .select()
      .single()

    if (error) {
      console.error('Error updating registration:', error)
      return null
    }

    return data
  }

  // Check-in Management
  async checkInAttendee(checkInData: Omit<EventCheckIn, 'id' | 'check_in_time'>): Promise<EventCheckIn | null> {
    const { data, error } = await supabase
      .from('event_check_ins')
      .insert(checkInData)
      .select()
      .single()

    if (error) {
      console.error('Error checking in attendee:', error)
      return null
    }

    return data
  }

  async checkOutAttendee(eventId: string, businessId: string, sessionId?: string): Promise<boolean> {
    const { error } = await supabase
      .from('event_check_ins')
      .update({ check_out_time: new Date().toISOString() })
      .eq('event_id', eventId)
      .eq('business_id', businessId)
      .is('check_out_time', null)

    if (sessionId) {
      // Also apply to specific session
      await supabase
        .from('event_check_ins')
        .update({ check_out_time: new Date().toISOString() })
        .eq('session_id', sessionId)
        .eq('business_id', businessId)
        .is('check_out_time', null)
    }

    return !error
  }

  async getEventCheckIns(eventId: string): Promise<EventCheckIn[]> {
    const { data, error } = await supabase
      .from('event_check_ins')
      .select('*')
      .eq('event_id', eventId)
      .order('check_in_time')

    if (error) {
      console.error('Error fetching check-ins:', error)
      return []
    }

    return data || []
  }

  // Networking Matches
  async generateNetworkingMatches(eventId: string): Promise<EventNetworkingMatch[]> {
    // Get all event attendees
    const { data: attendees } = await supabase
      .from('event_registrations')
      .select(`
        business_id,
        businesses:business_id (
          id, name, category, description, address
        )
      `)
      .eq('event_id', eventId)
      .eq('registration_status', 'confirmed')

    if (!attendees || attendees.length < 2) return []

    const matches: Omit<EventNetworkingMatch, 'id'>[] = []

    // Simple matching algorithm - can be enhanced with AI/ML
    for (let i = 0; i < attendees.length; i++) {
      for (let j = i + 1; j < attendees.length; j++) {
        const businessA = attendees[i]?.businesses
        const businessB = attendees[j]?.businesses

        if (!businessA || !businessB || Array.isArray(businessA) || Array.isArray(businessB)) continue

        const score = this.calculateMatchScore(businessA, businessB)
        const reasons = this.getMatchReasons(businessA, businessB)

        if (score > 0.3) { // Only suggest matches above 30% compatibility
          matches.push({
            event_id: eventId,
            business_a_id: (businessA as Record<string, any>).id,
            business_b_id: (businessB as Record<string, any>).id,
            match_score: score,
            match_reasons: reasons,
            status: 'suggested',
            viewed_by_a: false,
            viewed_by_b: false,
            contacted: false,
            meeting_scheduled: false,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
          })
        }
      }
    }

    // Insert matches
    const { data, error } = await supabase
      .from('event_networking_matches')
      .insert(matches)
      .select()

    if (error) {
      console.error('Error generating networking matches:', error)
      return []
    }

    return data || []
  }

  private calculateMatchScore(businessA: Record<string, any>, businessB: Record<string, any>): number {
    let score = 0

    // Industry complementarity (different but related categories)
    if (businessA.category !== businessB.category) {
      score += 0.3
    }

    // Geographic proximity (if both have addresses)
    if (businessA.address && businessB.address) {
      // Simple city matching - could be enhanced with geocoding
      const cityA = businessA.address.split(',').slice(-2, -1)[0]?.trim()
      const cityB = businessB.address.split(',').slice(-2, -1)[0]?.trim()
      if (cityA === cityB) {
        score += 0.4
      }
    }

    // Description keyword matching
    if (businessA.description && businessB.description) {
      const wordsA = businessA.description.toLowerCase().split(' ')
      const wordsB = businessB.description.toLowerCase().split(' ')
      const commonWords = wordsA.filter((word: string) => wordsB.includes(word) && word.length > 4)
      score += Math.min(commonWords.length * 0.1, 0.3)
    }

    return Math.min(score, 1.0)
  }

  private getMatchReasons(businessA: Record<string, any>, businessB: Record<string, any>): string[] {
    const reasons: string[] = []

    if (businessA.category !== businessB.category) {
      reasons.push('industry_complement')
    }

    if (businessA.address && businessB.address) {
      const cityA = businessA.address.split(',').slice(-2, -1)[0]?.trim()
      const cityB = businessB.address.split(',').slice(-2, -1)[0]?.trim()
      if (cityA === cityB) {
        reasons.push('geographic_proximity')
      }
    }

    if (businessA.description && businessB.description) {
      const wordsA = businessA.description.toLowerCase().split(' ')
      const wordsB = businessB.description.toLowerCase().split(' ')
      const commonWords = wordsA.filter((word: string) => wordsB.includes(word) && word.length > 4)
      if (commonWords.length > 0) {
        reasons.push('shared_interests')
      }
    }

    return reasons
  }

  // Feedback Collection
  async submitFeedback(feedbackData: Omit<EventFeedback, 'id' | 'submitted_at'>): Promise<EventFeedback | null> {
    const { data, error } = await supabase
      .from('event_feedback')
      .insert(feedbackData)
      .select()
      .single()

    if (error) {
      console.error('Error submitting feedback:', error)
      return null
    }

    return data
  }

  async getEventFeedback(eventId: string): Promise<EventFeedback[]> {
    const { data, error } = await supabase
      .from('event_feedback')
      .select('*')
      .eq('event_id', eventId)
      .order('submitted_at', { ascending: false })

    if (error) {
      console.error('Error fetching feedback:', error)
      return []
    }

    return data || []
  }

  // Analytics and Reporting
  async getEventAttendanceStats(eventId: string): Promise<any> {
    const { data, error } = await supabase
      .rpc('get_event_attendance_stats', { p_event_id: eventId })

    if (error) {
      console.error('Error fetching attendance stats:', error)
      return null
    }

    return data
  }

  // Waitlist Management
  async promoteFromWaitlist(eventId: string): Promise<void> {
    const { error } = await supabase
      .rpc('promote_from_waitlist', { p_event_id: eventId })

    if (error) {
      console.error('Error promoting from waitlist:', error)
    }
  }

  // QR Code Generation for Events
  generateEventCheckInQRCode(eventId: string, businessId: string, sessionId?: string): string {
    const baseUrl = `${window.location.origin}/events/${eventId}/checkin`
    const params = new URLSearchParams({
      business_id: businessId,
      ...(sessionId && { session_id: sessionId }),
      timestamp: Date.now().toString()
    })

    const checkInUrl = `${baseUrl}?${params.toString()}`
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(checkInUrl)}`
  }

  // Virtual Event Support
  async generateVirtualMeetingRoom(eventId: string, sessionId?: string): Promise<string | null> {
    // This would integrate with Zoom, Teams, or other video conferencing APIs
    // For now, return a placeholder URL
    const roomId = Math.random().toString(36).substr(2, 9)
    return `https://meet.chamber-connect.com/${eventId}/${sessionId || 'main'}/${roomId}`
  }

  // Event Reminders (would be triggered by scheduled functions)
  async sendEventReminders(eventId: string, reminderType: string): Promise<boolean> {
    // This would integrate with email/SMS services
    // For now, just log the reminder
    console.log(`Sending ${reminderType} reminders for event ${eventId}`)
    return true
  }
}

// Singleton instance
export const eventManager = new EventManagerAPI()

// Utility functions
export function calculateEventPrice(
  event: EnhancedEvent,
  businessType: 'member' | 'non_member',
  registrationDate: Date
): number {
  const now = new Date()
  const eventDate = new Date(event.event_date)
  const earlyBirdDeadline = event.early_bird_deadline ? new Date(event.early_bird_deadline) : null

  // Check if early bird pricing applies
  if (earlyBirdDeadline && registrationDate <= earlyBirdDeadline && event.early_bird_price !== undefined) {
    return event.early_bird_price
  }

  // Member vs non-member pricing
  if (businessType === 'member' && event.member_price !== undefined) {
    return event.member_price
  }

  if (businessType === 'non_member' && event.non_member_price !== undefined) {
    return event.non_member_price
  }

  // Default price
  return event.price
}

export function formatEventDateTime(startDate: string, endDate?: string, timezone: string = 'UTC'): string {
  const start = new Date(startDate)
  const end = endDate ? new Date(endDate) : null

  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone
  }

  const startFormatted = start.toLocaleDateString('en-US', options)

  if (end) {
    const endFormatted = end.toLocaleDateString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: timezone
    })
    return `${startFormatted} - ${endFormatted}`
  }

  return startFormatted
}

export function getEventStatusColor(status: string): string {
  switch (status) {
    case 'draft': return 'bg-gray-100 text-gray-800'
    case 'published': return 'bg-green-100 text-green-800'
    case 'cancelled': return 'bg-red-100 text-red-800'
    case 'completed': return 'bg-blue-100 text-blue-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export function getEventFormatIcon(format: string): string {
  switch (format) {
    case 'virtual': return '💻'
    case 'hybrid': return '🌐'
    case 'in_person': return '🏢'
    default: return '📅'
  }
} 