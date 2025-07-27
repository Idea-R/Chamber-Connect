// Supabase Authentication Helpers
// Refactored from original supabase.ts for compliance with 500-line rule

import { supabase } from './supabase-client'
import { logger } from './analytics-error-handler'
import { InfrastructureError } from './errors'
import type { ChamberMembership, UserProfile, Chamber } from './supabase-types'

export const auth = {
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        logger.error(
          'Failed to get current user',
          'auth-get-current-user',
          { errorCode: error.message }
        )
        return null
      }
      
      return user
    } catch (error) {
      logger.error(
        'Error getting current user',
        'auth-get-current-user',
        {},
        error instanceof Error ? error : new Error(String(error))
      )
      return null
    }
  },

  async getCurrentUserProfile(): Promise<UserProfile | null> {
    try {
      const user = await this.getCurrentUser()
      if (!user) return null

      logger.debug(
        'Fetching user profile',
        'auth-get-user-profile',
        { userId: user.id }
      )

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          logger.info(
            'User profile not found, will be created by auth context',
            'auth-get-user-profile',
            { userId: user.id }
          )
        } else {
          logger.error(
            'Error fetching user profile',
            'auth-get-user-profile',
            { userId: user.id, errorCode: error.code }
          )
        }
        return null
      }

      return data
    } catch (error) {
      logger.error(
        'Failed to get user profile',
        'auth-get-user-profile',
        {},
        error instanceof Error ? error : new Error(String(error))
      )
      return null
    }
  },

  async getCurrentBusiness() {
    try {
      const user = await this.getCurrentUser()
      if (!user) return null

      logger.debug(
        'Fetching current business',
        'auth-get-current-business',
        { userId: user.id }
      )

      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        logger.error(
          'Error fetching current business',
          'auth-get-current-business',
          { userId: user.id, errorCode: error.code }
        )
        return null
      }
      
      if (!data) {
        logger.debug(
          'No business profile found for user',
          'auth-get-current-business',
          { userId: user.id }
        )
      }

      return data
    } catch (error) {
      logger.error(
        'Failed to get current business',
        'auth-get-current-business',
        {},
        error instanceof Error ? error : new Error(String(error))
      )
      return null
    }
  },

  async getCurrentChamber(): Promise<Chamber | null> {
    try {
      const user = await this.getCurrentUser()
      if (!user) return null

      logger.debug(
        'Fetching current chamber',
        'auth-get-current-chamber',
        { userId: user.id }
      )

      // Get the user's primary chamber through memberships
      const { data, error } = await supabase
        .from('chamber_memberships')
        .select(`
          *,
          chamber:chambers(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('role', { ascending: true }) // admin comes before member
        .order('joined_at', { ascending: true })
        .limit(1)
        .single()

      if (error) {
        logger.error(
          'Error fetching current chamber',
          'auth-get-current-chamber',
          { userId: user.id, errorCode: error.code }
        )
        return null
      }
      
      if (!data) {
        logger.debug(
          'No chamber found for user',
          'auth-get-current-chamber',
          { userId: user.id }
        )
        return null
      }

      logger.debug(
        'Found chamber membership',
        'auth-get-current-chamber',
        { 
          userId: user.id,
          chamberId: data.chamber_id,
          role: data.role
        }
      )
      
      return data.chamber
    } catch (error) {
      logger.error(
        'Failed to get current chamber',
        'auth-get-current-chamber',
        {},
        error instanceof Error ? error : new Error(String(error))
      )
      return null
    }
  },

  async getUserChambers(): Promise<ChamberMembership[]> {
    try {
      const user = await this.getCurrentUser()
      if (!user) return []

      logger.debug(
        'Fetching user chambers',
        'auth-get-user-chambers',
        { userId: user.id }
      )

      // Get chamber memberships with a simple join - RLS policies are now fixed
      const { data, error } = await supabase
        .from('chamber_memberships')
        .select(`
          *,
          chamber:chambers(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('role', { ascending: true })
        .order('joined_at', { ascending: true })

      if (error) {
        logger.error(
          'Error fetching user chambers',
          'auth-get-user-chambers',
          { userId: user.id, errorCode: error.code }
        )
        return []
      }
      
      const chamberCount = data?.length || 0
      logger.debug(
        `Found ${chamberCount} chamber memberships`,
        'auth-get-user-chambers',
        { 
          userId: user.id,
          chamberCount,
          chambers: data?.map(d => ({ 
            chamberId: d.chamber_id,
            chamberName: d.chamber?.name, 
            role: d.role, 
            status: d.status 
          }))
        }
      )

      return data || []
    } catch (error) {
      logger.error(
        'Failed to get user chambers',
        'auth-get-user-chambers',
        {},
        error instanceof Error ? error : new Error(String(error))
      )
      return []
    }
  },

  async isChamberAdmin(chamberId: string): Promise<boolean> {
    try {
      const user = await this.getCurrentUser()
      if (!user) return false

      const { data, error } = await supabase
        .from('chamber_memberships')
        .select('id')
        .eq('user_id', user.id)
        .eq('chamber_id', chamberId)
        .eq('role', 'admin')
        .eq('status', 'active')
        .maybeSingle()

      if (error) {
        logger.error(
          'Error checking chamber admin status',
          'auth-is-chamber-admin',
          { 
            userId: user.id, 
            chamberId,
            errorCode: error.code 
          }
        )
        return false
      }

      return !!data
    } catch (error) {
      logger.error(
        'Failed to check chamber admin status',
        'auth-is-chamber-admin',
        { chamberId },
        error instanceof Error ? error : new Error(String(error))
      )
      return false
    }
  },

  async isChamberMember(chamberId: string): Promise<boolean> {
    try {
      const user = await this.getCurrentUser()
      if (!user) return false

      const { data, error } = await supabase
        .from('chamber_memberships')
        .select('id')
        .eq('user_id', user.id)
        .eq('chamber_id', chamberId)
        .eq('status', 'active')
        .maybeSingle()

      if (error) {
        logger.error(
          'Error checking chamber member status',
          'auth-is-chamber-member',
          { 
            userId: user.id, 
            chamberId,
            errorCode: error.code 
          }
        )
        return false
      }

      return !!data
    } catch (error) {
      logger.error(
        'Failed to check chamber member status',
        'auth-is-chamber-member',
        { chamberId },
        error instanceof Error ? error : new Error(String(error))
      )
      return false
    }
  }
} 