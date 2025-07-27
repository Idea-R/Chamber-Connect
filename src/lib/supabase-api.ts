// Supabase API Functions
// Refactored from original supabase.ts for compliance with 500-line rule

import { supabase } from './supabase-client'
import { logger } from './analytics-error-handler'
import { InfrastructureError, DomainError } from './errors'
import type { 
  Chamber, 
  ChamberMembership, 
  Business, 
  Event, 
  Message, 
  Connection, 
  Spotlight 
} from './supabase-types'

// Chamber API functions
export const chamberApi = {
  async getChamberBySlug(slug: string): Promise<Chamber | null> {
    try {
      const { data, error } = await supabase
        .from('chambers')
        .select('*')
        .eq('slug', slug)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') {
          logger.warn(
            'Chamber not found by slug',
            'chamber-api-get-by-slug',
            { slug }
          )
        } else {
          logger.error(
            'Error fetching chamber by slug',
            'chamber-api-get-by-slug',
            { slug, errorCode: error.code }
          )
        }
        return null
      }
      
      return data
    } catch (error) {
      logger.error(
        'Failed to get chamber by slug',
        'chamber-api-get-by-slug',
        { slug },
        error instanceof Error ? error : new Error(String(error))
      )
      return null
    }
  },

  async updateChamber(id: string, updates: Partial<Chamber>): Promise<Chamber | null> {
    try {
      const { data, error } = await supabase
        .from('chambers')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        logger.error(
          'Error updating chamber',
          'chamber-api-update',
          { chamberId: id, errorCode: error.code }
        )
        return null
      }
      
      logger.info(
        'Chamber updated successfully',
        'chamber-api-update',
        { chamberId: id }
      )
      
      return data
    } catch (error) {
      logger.error(
        'Failed to update chamber',
        'chamber-api-update',
        { chamberId: id },
        error instanceof Error ? error : new Error(String(error))
      )
      return null
    }
  }
}

// Membership API functions
export const membershipApi = {
  async createMembership(
    userId: string, 
    chamberId: string, 
    role: 'admin' | 'staff' | 'member' = 'member'
  ): Promise<ChamberMembership | null> {
    try {
      const { data, error } = await supabase
        .from('chamber_memberships')
        .insert({
          user_id: userId,
          chamber_id: chamberId,
          role,
          status: 'active'
        })
        .select()
        .single()

      if (error) {
        logger.error(
          'Error creating membership',
          'membership-api-create',
          { userId, chamberId, role, errorCode: error.code }
        )
        return null
      }

      logger.info(
        'Membership created successfully',
        'membership-api-create',
        { userId, chamberId, role, membershipId: data.id }
      )

      return data
    } catch (error) {
      logger.error(
        'Failed to create membership',
        'membership-api-create',
        { userId, chamberId, role },
        error instanceof Error ? error : new Error(String(error))
      )
      return null
    }
  },

  async updateMembership(
    membershipId: string, 
    updates: Partial<ChamberMembership>
  ): Promise<ChamberMembership | null> {
    try {
      const { data, error } = await supabase
        .from('chamber_memberships')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', membershipId)
        .select()
        .single()

      if (error) {
        logger.error(
          'Error updating membership',
          'membership-api-update',
          { membershipId, errorCode: error.code }
        )
        return null
      }

      return data
    } catch (error) {
      logger.error(
        'Failed to update membership',
        'membership-api-update',
        { membershipId },
        error instanceof Error ? error : new Error(String(error))
      )
      return null
    }
  },

  async removeMembership(membershipId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chamber_memberships')
        .delete()
        .eq('id', membershipId)

      if (error) {
        logger.error(
          'Error removing membership',
          'membership-api-remove',
          { membershipId, errorCode: error.code }
        )
        return false
      }

      logger.info(
        'Membership removed successfully',
        'membership-api-remove',
        { membershipId }
      )

      return true
    } catch (error) {
      logger.error(
        'Failed to remove membership',
        'membership-api-remove',
        { membershipId },
        error instanceof Error ? error : new Error(String(error))
      )
      return false
    }
  },

  async getChamberMembers(chamberId: string): Promise<ChamberMembership[]> {
    try {
      const { data, error } = await supabase
        .from('chamber_memberships')
        .select(`
          *,
          user:user_profiles(*),
          business:businesses(*)
        `)
        .eq('chamber_id', chamberId)
        .eq('status', 'active')
        .order('role', { ascending: true })
        .order('joined_at', { ascending: true })

      if (error) {
        logger.error(
          'Error fetching chamber members',
          'membership-api-get-members',
          { chamberId, errorCode: error.code }
        )
        return []
      }

      return data || []
    } catch (error) {
      logger.error(
        'Failed to get chamber members',
        'membership-api-get-members',
        { chamberId },
        error instanceof Error ? error : new Error(String(error))
      )
      return []
    }
  }
}

// Business API functions
export const businessApi = {
  async getBusinessesByChamber(chamberId: string): Promise<Business[]> {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('chamber_id', chamberId)
        .order('featured', { ascending: false })
        .order('name')
      
      if (error) {
        logger.error(
          'Error fetching businesses',
          'business-api-get-by-chamber',
          { chamberId, errorCode: error.code }
        )
        return []
      }
      
      return data || []
    } catch (error) {
      logger.error(
        'Failed to get businesses by chamber',
        'business-api-get-by-chamber',
        { chamberId },
        error instanceof Error ? error : new Error(String(error))
      )
      return []
    }
  },

  async getFeaturedBusinesses(chamberId: string): Promise<Business[]> {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('chamber_id', chamberId)
        .eq('featured', true)
        .order('name')
      
      if (error) {
        logger.error(
          'Error fetching featured businesses',
          'business-api-get-featured',
          { chamberId, errorCode: error.code }
        )
        return []
      }
      
      return data || []
    } catch (error) {
      logger.error(
        'Failed to get featured businesses',
        'business-api-get-featured',
        { chamberId },
        error instanceof Error ? error : new Error(String(error))
      )
      return []
    }
  }
}

// Event API functions  
export const eventApi = {
  async getEventsByChamber(chamberId: string): Promise<Event[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          organizer:businesses(name),
          attendee_count:event_attendees(count)
        `)
        .eq('chamber_id', chamberId)
        .gte('event_date', new Date().toISOString())
        .order('event_date')
      
      if (error) {
        logger.error(
          'Error fetching events',
          'event-api-get-by-chamber',
          { chamberId, errorCode: error.code }
        )
        return []
      }
      
      return data?.map(event => ({
        ...event,
        attendee_count: event.attendee_count?.[0]?.count || 0
      })) || []
    } catch (error) {
      logger.error(
        'Failed to get events by chamber',
        'event-api-get-by-chamber',
        { chamberId },
        error instanceof Error ? error : new Error(String(error))
      )
      return []
    }
  },

  async getFeaturedEvents(chamberId: string): Promise<Event[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          organizer:businesses(name),
          attendee_count:event_attendees(count)
        `)
        .eq('chamber_id', chamberId)
        .eq('featured', true)
        .gte('event_date', new Date().toISOString())
        .order('event_date')
      
      if (error) {
        logger.error(
          'Error fetching featured events',
          'event-api-get-featured',
          { chamberId, errorCode: error.code }
        )
        return []
      }
      
      return data?.map(event => ({
        ...event,
        attendee_count: event.attendee_count?.[0]?.count || 0
      })) || []
    } catch (error) {
      logger.error(
        'Failed to get featured events',
        'event-api-get-featured',
        { chamberId },
        error instanceof Error ? error : new Error(String(error))
      )
      return []
    }
  },

  async rsvpToEvent(eventId: string, businessId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('event_attendees')
        .insert({ event_id: eventId, business_id: businessId })
      
      if (error) {
        logger.error(
          'Error RSVPing to event',
          'event-api-rsvp',
          { eventId, businessId, errorCode: error.code }
        )
        return false
      }
      
      logger.info(
        'RSVP successful',
        'event-api-rsvp',
        { eventId, businessId }
      )
      
      return true
    } catch (error) {
      logger.error(
        'Failed to RSVP to event',
        'event-api-rsvp',
        { eventId, businessId },
        error instanceof Error ? error : new Error(String(error))
      )
      return false
    }
  },

  async cancelRsvp(eventId: string, businessId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('event_attendees')
        .delete()
        .eq('event_id', eventId)
        .eq('business_id', businessId)
      
      if (error) {
        logger.error(
          'Error canceling RSVP',
          'event-api-cancel-rsvp',
          { eventId, businessId, errorCode: error.code }
        )
        return false
      }
      
      return true
    } catch (error) {
      logger.error(
        'Failed to cancel RSVP',
        'event-api-cancel-rsvp',
        { eventId, businessId },
        error instanceof Error ? error : new Error(String(error))
      )
      return false
    }
  }
}

// Message API functions
export const messageApi = {
  async getConversations(businessId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:businesses!messages_sender_id_fkey(name, contact_name, contact_avatar_url),
          recipient:businesses!messages_recipient_id_fkey(name, contact_name, contact_avatar_url)
        `)
        .or(`sender_id.eq.${businessId},recipient_id.eq.${businessId}`)
        .order('created_at', { ascending: false })
      
      if (error) {
        logger.error(
          'Error fetching conversations',
          'message-api-get-conversations',
          { businessId, errorCode: error.code }
        )
        return []
      }
      
      // Group messages by conversation
      const conversations = new Map()
      
      data?.forEach(message => {
        const otherParty = message.sender_id === businessId ? message.recipient : message.sender
        const conversationKey = message.sender_id === businessId ? message.recipient_id : message.sender_id
        
        if (!conversations.has(conversationKey)) {
          conversations.set(conversationKey, {
            id: conversationKey,
            participant: {
              name: otherParty.contact_name,
              business: otherParty.name,
              avatar: otherParty.contact_avatar_url,
              online: Math.random() > 0.5 // Mock online status
            },
            lastMessage: message.content,
            timestamp: new Date(message.created_at).toLocaleString(),
            unread: !message.read && message.recipient_id === businessId ? 1 : 0,
            type: 'general'
          })
        }
      })
      
      return Array.from(conversations.values())
    } catch (error) {
      logger.error(
        'Failed to get conversations',
        'message-api-get-conversations',
        { businessId },
        error instanceof Error ? error : new Error(String(error))
      )
      return []
    }
  },

  async sendMessage(
    senderId: string, 
    recipientId: string, 
    content: string, 
    chamberId: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          chamber_id: chamberId,
          sender_id: senderId,
          recipient_id: recipientId,
          content
        })
      
      if (error) {
        logger.error(
          'Error sending message',
          'message-api-send',
          { senderId, recipientId, chamberId, errorCode: error.code }
        )
        return false
      }
      
      return true
    } catch (error) {
      logger.error(
        'Failed to send message',
        'message-api-send',
        { senderId, recipientId, chamberId },
        error instanceof Error ? error : new Error(String(error))
      )
      return false
    }
  }
}

// Connection API functions
export const connectionApi = {
  async getConnections(businessId: string): Promise<Connection[]> {
    try {
      const { data, error } = await supabase
        .from('connections')
        .select(`
          *,
          business_a:businesses!connections_business_a_id_fkey(*),
          business_b:businesses!connections_business_b_id_fkey(*)
        `)
        .or(`business_a_id.eq.${businessId},business_b_id.eq.${businessId}`)
        .eq('status', 'connected')
      
      if (error) {
        logger.error(
          'Error fetching connections',
          'connection-api-get',
          { businessId, errorCode: error.code }
        )
        return []
      }
      
      return data || []
    } catch (error) {
      logger.error(
        'Failed to get connections',
        'connection-api-get',
        { businessId },
        error instanceof Error ? error : new Error(String(error))
      )
      return []
    }
  },

  async createConnection(
    businessAId: string, 
    businessBId: string, 
    chamberId: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('connections')
        .insert({
          chamber_id: chamberId,
          business_a_id: businessAId,
          business_b_id: businessBId,
          status: 'connected'
        })
      
      if (error) {
        logger.error(
          'Error creating connection',
          'connection-api-create',
          { businessAId, businessBId, chamberId, errorCode: error.code }
        )
        return false
      }
      
      return true
    } catch (error) {
      logger.error(
        'Failed to create connection',
        'connection-api-create',
        { businessAId, businessBId, chamberId },
        error instanceof Error ? error : new Error(String(error))
      )
      return false
    }
  }
}

// Spotlight API functions
export const spotlightApi = {
  async getSpotlightsByChamber(chamberId: string): Promise<Spotlight[]> {
    try {
      const { data, error } = await supabase
        .from('spotlights')
        .select(`
          *,
          business:businesses(name, contact_name, contact_avatar_url, category)
        `)
        .eq('chamber_id', chamberId)
        .order('featured', { ascending: false })
        .order('published_date', { ascending: false })
      
      if (error) {
        logger.error(
          'Error fetching spotlights',
          'spotlight-api-get-by-chamber',
          { chamberId, errorCode: error.code }
        )
        return []
      }
      
      return data || []
    } catch (error) {
      logger.error(
        'Failed to get spotlights by chamber',
        'spotlight-api-get-by-chamber',
        { chamberId },
        error instanceof Error ? error : new Error(String(error))
      )
      return []
    }
  },

  async getFeaturedSpotlights(chamberId: string): Promise<Spotlight[]> {
    try {
      const { data, error } = await supabase
        .from('spotlights')
        .select(`
          *,
          business:businesses(name, contact_name, contact_avatar_url, category)
        `)
        .eq('chamber_id', chamberId)
        .eq('featured', true)
        .order('published_date', { ascending: false })
      
      if (error) {
        logger.error(
          'Error fetching featured spotlights',
          'spotlight-api-get-featured',
          { chamberId, errorCode: error.code }
        )
        return []
      }
      
      return data || []
    } catch (error) {
      logger.error(
        'Failed to get featured spotlights',
        'spotlight-api-get-featured',
        { chamberId },
        error instanceof Error ? error : new Error(String(error))
      )
      return []
    }
  }
} 