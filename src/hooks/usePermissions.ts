// Permission and Role-Based Access Control Hook
// Provides easy access to user permissions and subscription status

import { useAuth } from '@/contexts/AuthContext'
import { useMemo } from 'react'

export interface PermissionCheck {
  // Core permissions
  canManageChamber: boolean
  canManageMembers: boolean
  canCreateEvents: boolean
  canViewAnalytics: boolean
  canAccessCrossChamber: boolean
  canManageSubscription: boolean

  // Role checks
  isAdmin: boolean
  isStaff: boolean
  isMember: boolean
  isChamberAdmin: boolean
  isBusinessOwner: boolean

  // Subscription status
  hasActiveSubscription: boolean
  isTrialing: boolean
  trialDaysRemaining: number
  subscriptionStatus: string | null
  subscriptionPlan: string | null

  // Feature availability
  hasAnalyticsAccess: boolean
  hasCrossChamberAccess: boolean
  hasUnlimitedMembers: boolean
  hasUnlimitedEvents: boolean

  // Quick actions
  requiresUpgrade: (feature: string) => boolean
  canPerformAction: (action: string) => boolean
  getSubscriptionMessage: () => string | null
}

export function usePermissions(): PermissionCheck {
  const {
    permissions,
    userProfile,
    primaryMembership,
    subscription,
    isTrialing,
    trialDaysRemaining,
    hasActiveSubscription
  } = useAuth()

  return useMemo(() => {
    // Role checks
    const isAdmin = primaryMembership?.role === 'admin'
    const isStaff = primaryMembership?.role === 'staff' || isAdmin
    const isMember = !!primaryMembership
    const isChamberAdmin = userProfile?.role === 'chamber_admin'
    const isBusinessOwner = userProfile?.role === 'business_owner'

    // Subscription info
    const subscriptionStatus = subscription?.status || null
    const subscriptionPlan = subscription?.subscription_plan?.name || null

    // Feature availability
    const hasAnalyticsAccess = subscription?.subscription_plan?.analytics_enabled || false
    const hasCrossChamberAccess = subscription?.subscription_plan?.cross_chamber_networking || false
    const hasUnlimitedMembers = subscription?.subscription_plan?.max_members === -1
    const hasUnlimitedEvents = subscription?.subscription_plan?.max_events_per_month === -1

    // Feature requirement checks
    const requiresUpgrade = (feature: string): boolean => {
      if (!hasActiveSubscription && !isTrialing) return true

      switch (feature) {
        case 'analytics':
          return !hasAnalyticsAccess
        case 'cross_chamber':
          return !hasCrossChamberAccess
        case 'unlimited_members':
          return !hasUnlimitedMembers
        case 'unlimited_events':
          return !hasUnlimitedEvents
        default:
          return false
      }
    }

    // Action permission checks
    const canPerformAction = (action: string): boolean => {
      switch (action) {
        case 'create_event':
          return permissions.canCreateEvents
        case 'manage_members':
          return permissions.canManageMembers
        case 'view_analytics':
          return permissions.canViewAnalytics
        case 'manage_chamber':
          return permissions.canManageChamber
        case 'access_cross_chamber':
          return permissions.canAccessCrossChamber
        case 'manage_subscription':
          return permissions.canManageSubscription
        default:
          return false
      }
    }

    // Subscription status messages
    const getSubscriptionMessage = (): string | null => {
      if (!subscription) {
        return 'No active subscription. Upgrade to access premium features.'
      }

      if (isTrialing && trialDaysRemaining > 0) {
        return `Free trial ends in ${trialDaysRemaining} day${trialDaysRemaining === 1 ? '' : 's'}.`
      }

      if (isTrialing && trialDaysRemaining <= 0) {
        return 'Free trial has expired. Please upgrade to continue using premium features.'
      }

      switch (subscriptionStatus) {
        case 'past_due':
          return 'Payment is past due. Please update your payment method.'
        case 'canceled':
          return 'Subscription has been canceled. Upgrade to regain access.'
        case 'incomplete':
          return 'Payment is incomplete. Please complete your payment.'
        case 'unpaid':
          return 'Payment failed. Please update your payment method.'
        case 'active':
          return null // No message needed for active subscriptions
        default:
          return null
      }
    }

    return {
      // Core permissions (from AuthContext)
      canManageChamber: permissions.canManageChamber,
      canManageMembers: permissions.canManageMembers,
      canCreateEvents: permissions.canCreateEvents,
      canViewAnalytics: permissions.canViewAnalytics,
      canAccessCrossChamber: permissions.canAccessCrossChamber,
      canManageSubscription: permissions.canManageSubscription,

      // Role checks
      isAdmin,
      isStaff,
      isMember,
      isChamberAdmin,
      isBusinessOwner,

      // Subscription status
      hasActiveSubscription,
      isTrialing,
      trialDaysRemaining,
      subscriptionStatus,
      subscriptionPlan,

      // Feature availability
      hasAnalyticsAccess,
      hasCrossChamberAccess,
      hasUnlimitedMembers,
      hasUnlimitedEvents,

      // Quick actions
      requiresUpgrade,
      canPerformAction,
      getSubscriptionMessage
    }
  }, [
    permissions,
    userProfile,
    primaryMembership,
    subscription,
    isTrialing,
    trialDaysRemaining,
    hasActiveSubscription
  ])
}

// Convenience hooks for specific checks
export function useIsAdmin(): boolean {
  const { isAdmin } = usePermissions()
  return isAdmin
}

export function useCanManageMembers(): boolean {
  const { canManageMembers } = usePermissions()
  return canManageMembers
}

export function useCanCreateEvents(): boolean {
  const { canCreateEvents } = usePermissions()
  return canCreateEvents
}

export function useCanViewAnalytics(): boolean {
  const { canViewAnalytics } = usePermissions()
  return canViewAnalytics
}

export function useSubscriptionStatus(): {
  hasActiveSubscription: boolean
  isTrialing: boolean
  requiresUpgrade: boolean
  message: string | null
} {
  const { 
    hasActiveSubscription, 
    isTrialing, 
    getSubscriptionMessage 
  } = usePermissions()

  return {
    hasActiveSubscription,
    isTrialing,
    requiresUpgrade: !hasActiveSubscription && !isTrialing,
    message: getSubscriptionMessage()
  }
} 