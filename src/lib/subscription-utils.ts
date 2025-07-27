// Subscription and Permission Utilities
// Handles subscription status checking and role-based permissions

import { supabase } from './supabase-client'
import { logger } from './analytics-error-handler'
import { ValidationError, DomainError } from './errors'
import type { 
  ChamberMembership, 
  ChamberSubscription, 
  SubscriptionPlan, 
  UserProfile,
  Chamber
} from './supabase-types'

/**
 * Get chamber subscription with plan details
 */
export async function getChamberSubscription(chamberId: string): Promise<ChamberSubscription | null> {
  try {
    const { data, error } = await supabase
      .from('chamber_subscriptions')
      .select(`
        *,
        subscription_plan:subscription_plans(*)
      `)
      .eq('chamber_id', chamberId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No subscription found - chamber might be on free tier
        logger.info(
          'No subscription found for chamber',
          'subscription-get-chamber-subscription',
          { chamberId }
        )
        return null
      }
      
      logger.error(
        'Error fetching chamber subscription',
        'subscription-get-chamber-subscription',
        { chamberId, errorCode: error.code },
        error
      )
      return null
    }

    return data
  } catch (error) {
    logger.error(
      'Failed to get chamber subscription',
      'subscription-get-chamber-subscription',
      { chamberId },
      error instanceof Error ? error : new Error(String(error))
    )
    return null
  }
}

/**
 * Check if chamber has active subscription
 */
export function hasActiveSubscription(subscription: ChamberSubscription | null): boolean {
  if (!subscription) return false
  
  const activeStatuses = ['active', 'trialing']
  return activeStatuses.includes(subscription.status)
}

/**
 * Check if chamber is in trial period
 */
export function isInTrialPeriod(subscription: ChamberSubscription | null): boolean {
  if (!subscription || subscription.status !== 'trialing') return false
  
  if (!subscription.trial_end) return false
  
  const trialEnd = new Date(subscription.trial_end)
  const now = new Date()
  
  return trialEnd > now
}

/**
 * Get days remaining in trial
 */
export function getTrialDaysRemaining(subscription: ChamberSubscription | null): number {
  if (!isInTrialPeriod(subscription) || !subscription?.trial_end) return 0
  
  const trialEnd = new Date(subscription.trial_end)
  const now = new Date()
  const msPerDay = 24 * 60 * 60 * 1000
  
  return Math.ceil((trialEnd.getTime() - now.getTime()) / msPerDay)
}

/**
 * Calculate user permissions based on chamber membership and subscription
 */
export function calculateUserPermissions(
  userRole: 'chamber_admin' | 'business_owner' | 'staff',
  chamberMembership: ChamberMembership | null,
  subscription: ChamberSubscription | null
): {
  canManageChamber: boolean
  canManageMembers: boolean
  canCreateEvents: boolean
  canViewAnalytics: boolean
  canAccessCrossChamber: boolean
  canManageSubscription: boolean
} {
  const hasActiveSub = hasActiveSubscription(subscription)
  const isAdmin = chamberMembership?.role === 'admin'
  const isStaff = chamberMembership?.role === 'staff' || chamberMembership?.role === 'admin'
  const isChamberAdmin = userRole === 'chamber_admin'
  
  // Analytics access based on subscription plan
  const hasAnalyticsAccess = subscription?.subscription_plan?.analytics_enabled || false
  
  // Cross-chamber access based on subscription plan
  const hasCrossChamberAccess = subscription?.subscription_plan?.cross_chamber_networking || false

  return {
    canManageChamber: isChamberAdmin || isAdmin,
    canManageMembers: (isChamberAdmin || isAdmin) && hasActiveSub,
    canCreateEvents: (isStaff || isChamberAdmin) && hasActiveSub,
    canViewAnalytics: (isStaff || isChamberAdmin) && hasActiveSub && hasAnalyticsAccess,
    canAccessCrossChamber: hasActiveSub && hasCrossChamberAccess,
    canManageSubscription: isChamberAdmin || isAdmin
  }
}

/**
 * Check if chamber has reached member limit
 */
export async function hasChamberReachedMemberLimit(
  chamberId: string,
  subscription: ChamberSubscription | null
): Promise<boolean> {
  try {
    // Get current member count
    const { count, error } = await supabase
      .from('chamber_memberships')
      .select('*', { count: 'exact', head: true })
      .eq('chamber_id', chamberId)
      .eq('status', 'active')

    if (error) {
      logger.error(
        'Error checking member count',
        'subscription-check-member-limit',
        { chamberId, errorCode: error.code }
      )
      return false // Allow if we can't check
    }

    const currentMembers = count || 0
    const maxMembers = subscription?.subscription_plan?.max_members || 50 // Default limit
    
    // -1 means unlimited
    if (maxMembers === -1) return false
    
    return currentMembers >= maxMembers
  } catch (error) {
    logger.error(
      'Failed to check member limit',
      'subscription-check-member-limit',
      { chamberId },
      error instanceof Error ? error : new Error(String(error))
    )
    return false
  }
}

/**
 * Check if chamber has reached event limit for current month
 */
export async function hasChamberReachedEventLimit(
  chamberId: string,
  subscription: ChamberSubscription | null
): Promise<boolean> {
  try {
    // Get events created this month
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const { count, error } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('chamber_id', chamberId)
      .gte('created_at', startOfMonth.toISOString())
      .lte('created_at', endOfMonth.toISOString())

    if (error) {
      logger.error(
        'Error checking event count',
        'subscription-check-event-limit',
        { chamberId, errorCode: error.code }
      )
      return false // Allow if we can't check
    }

    const currentEvents = count || 0
    const maxEvents = subscription?.subscription_plan?.max_events_per_month || 10 // Default limit
    
    // -1 means unlimited
    if (maxEvents === -1) return false
    
    return currentEvents >= maxEvents
  } catch (error) {
    logger.error(
      'Failed to check event limit',
      'subscription-check-event-limit',
      { chamberId },
      error instanceof Error ? error : new Error(String(error))
    )
    return false
  }
}

/**
 * Get subscription plan by name
 */
export async function getSubscriptionPlanByName(planName: string): Promise<SubscriptionPlan | null> {
  try {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('name', planName)
      .eq('is_active', true)
      .single()

    if (error) {
      logger.error(
        'Error fetching subscription plan',
        'subscription-get-plan-by-name',
        { planName, errorCode: error.code }
      )
      return null
    }

    return data
  } catch (error) {
    logger.error(
      'Failed to get subscription plan',
      'subscription-get-plan-by-name',
      { planName },
      error instanceof Error ? error : new Error(String(error))
    )
    return null
  }
}

/**
 * Get all active subscription plans
 */
export async function getActiveSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  try {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_monthly', { ascending: true })

    if (error) {
      logger.error(
        'Error fetching subscription plans',
        'subscription-get-active-plans',
        { errorCode: error.code }
      )
      return []
    }

    return data || []
  } catch (error) {
    logger.error(
      'Failed to get subscription plans',
      'subscription-get-active-plans',
      {},
      error instanceof Error ? error : new Error(String(error))
    )
    return []
  }
} 