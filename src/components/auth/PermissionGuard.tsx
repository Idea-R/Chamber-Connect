// Permission Guard Component
// Conditionally renders content based on user permissions and subscription status

import React, { ReactNode } from 'react'
import { usePermissions } from '@/hooks/usePermissions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, Crown, Zap, AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'

interface PermissionGuardProps {
  children: ReactNode
  requiredPermission?: string
  requiredRole?: 'admin' | 'staff' | 'chamber_admin' | 'business_owner'
  requiredFeature?: string
  fallback?: ReactNode
  showUpgradePrompt?: boolean
  redirectTo?: string
}

interface UpgradePromptProps {
  feature?: string
  message?: string
  redirectTo?: string
}

function UpgradePrompt({ feature, message, redirectTo = '/pricing' }: UpgradePromptProps) {
  const { subscriptionPlan, isTrialing, trialDaysRemaining } = usePermissions()

  const getFeatureTitle = (featureName?: string) => {
    switch (featureName) {
      case 'analytics':
        return 'Advanced Analytics'
      case 'cross_chamber':
        return 'Cross-Chamber Networking'
      case 'unlimited_members':
        return 'Unlimited Members'
      case 'unlimited_events':
        return 'Unlimited Events'
      default:
        return 'Premium Feature'
    }
  }

  const getFeatureDescription = (featureName?: string) => {
    switch (featureName) {
      case 'analytics':
        return 'Get detailed insights into member engagement, event performance, and QR code analytics.'
      case 'cross_chamber':
        return 'Connect with members from partner chambers and expand your networking reach.'
      case 'unlimited_members':
        return 'Add unlimited members to your chamber without restrictions.'
      case 'unlimited_events':
        return 'Create unlimited events per month to keep your members engaged.'
      default:
        return 'Unlock premium features to get the most out of Chamber Connect.'
    }
  }

  return (
    <Card className="max-w-md mx-auto border-orange-200 bg-orange-50">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
          <Crown className="h-6 w-6 text-orange-600" />
        </div>
        <CardTitle className="text-orange-900">
          {getFeatureTitle(feature)}
        </CardTitle>
        <CardDescription className="text-orange-700">
          {message || getFeatureDescription(feature)}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        {isTrialing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-blue-700">
              <Zap className="h-4 w-4" />
              <span className="text-sm font-medium">
                Free trial: {trialDaysRemaining} days remaining
              </span>
            </div>
          </div>
        )}
        
        {subscriptionPlan && (
          <p className="text-sm text-gray-600">
            Current plan: <span className="font-medium">{subscriptionPlan}</span>
          </p>
        )}
        
        <div className="space-y-2">
          <Button asChild className="w-full">
            <Link to={redirectTo}>
              Upgrade Now
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/pricing">
              View All Plans
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function AccessDenied({ requiredRole, redirectTo }: { requiredRole?: string; redirectTo?: string }) {
  return (
    <Card className="max-w-md mx-auto border-red-200 bg-red-50">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <Shield className="h-6 w-6 text-red-600" />
        </div>
        <CardTitle className="text-red-900">
          Access Restricted
        </CardTitle>
        <CardDescription className="text-red-700">
          {requiredRole 
            ? `This feature requires ${requiredRole} access level.`
            : 'You do not have permission to access this feature.'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        {redirectTo ? (
          <Button variant="outline" asChild>
            <Link to={redirectTo}>
              Go Back
            </Link>
          </Button>
        ) : (
          <p className="text-sm text-gray-600">
            Contact your chamber administrator for access.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function SubscriptionAlert() {
  const { getSubscriptionMessage } = usePermissions()
  const message = getSubscriptionMessage()

  if (!message) return null

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-yellow-700 font-medium">
            Subscription Notice
          </p>
          <p className="text-sm text-yellow-600 mt-1">
            {message}
          </p>
        </div>
        <Button size="sm" variant="outline" asChild>
          <Link to="/pricing">
            Manage Subscription
          </Link>
        </Button>
      </div>
    </div>
  )
}

export function PermissionGuard({
  children,
  requiredPermission,
  requiredRole,
  requiredFeature,
  fallback,
  showUpgradePrompt = true,
  redirectTo
}: PermissionGuardProps) {
  const {
    canPerformAction,
    requiresUpgrade,
    isAdmin,
    isStaff,
    isChamberAdmin,
    isBusinessOwner,
    hasActiveSubscription,
    isTrialing
  } = usePermissions()

  // Check role-based access
  if (requiredRole) {
    let hasRequiredRole = false
    
    switch (requiredRole) {
      case 'admin':
        hasRequiredRole = isAdmin
        break
      case 'staff':
        hasRequiredRole = isStaff
        break
      case 'chamber_admin':
        hasRequiredRole = isChamberAdmin
        break
      case 'business_owner':
        hasRequiredRole = isBusinessOwner
        break
    }

    if (!hasRequiredRole) {
      if (fallback) return <>{fallback}</>
      return <AccessDenied requiredRole={requiredRole} redirectTo={redirectTo} />
    }
  }

  // Check permission-based access
  if (requiredPermission && !canPerformAction(requiredPermission)) {
    if (fallback) return <>{fallback}</>
    return <AccessDenied redirectTo={redirectTo} />
  }

  // Check feature-based access (subscription required)
  if (requiredFeature && requiresUpgrade(requiredFeature)) {
    if (fallback) return <>{fallback}</>
    if (showUpgradePrompt) {
      return <UpgradePrompt feature={requiredFeature} redirectTo={redirectTo} />
    }
    return <AccessDenied redirectTo={redirectTo} />
  }

  // User has access - render children with optional subscription alert
  return (
    <>
      <SubscriptionAlert />
      {children}
    </>
  )
}

// Convenience components for common use cases
export function AdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard requiredRole="admin" fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

export function StaffOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard requiredRole="staff" fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

export function ChamberAdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard requiredRole="chamber_admin" fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

export function PremiumFeature({ 
  children, 
  feature, 
  fallback 
}: { 
  children: ReactNode
  feature: string
  fallback?: ReactNode 
}) {
  return (
    <PermissionGuard requiredFeature={feature} fallback={fallback}>
      {children}
    </PermissionGuard>
  )
} 