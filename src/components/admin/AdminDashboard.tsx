import React from 'react'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  UserPlus,
  Building,
  Settings
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { 
  getAdminDashboardStats, 
  getPendingActions,
  type AdminDashboardStats,
  type PendingAction 
} from '@/lib/admin-data'
import { logger } from '@/lib/analytics-error-handler'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { AdminStatsCards } from './AdminStatsCards'
import { PendingActionsCard } from './PendingActionsCard'
import { QuickActionsCard } from './QuickActionsCard'

export function AdminDashboard() {
  const auth = useAuth()
  const [stats, setStats] = useState<AdminDashboardStats | null>(null)
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get current chamber ID from auth context
  const chamberId = auth?.primaryMembership?.chamber_id

  useEffect(() => {
    async function loadDashboardData() {
      if (!chamberId) {
        setError('No chamber access found')
        setIsLoading(false)
        return
      }

      try {
        logger.info(
          'Loading admin dashboard',
          'admin-dashboard-load',
          { chamberId, userRole: auth?.userProfile?.role }
        )

        // Load stats and pending actions in parallel
        const [statsResult, actionsResult] = await Promise.all([
          getAdminDashboardStats(chamberId),
          getPendingActions(chamberId)
        ])

        if (statsResult.success) {
          setStats(statsResult.data)
        } else {
          logger.warn('Failed to load dashboard stats', 'admin-dashboard-load', { 
            error: statsResult.error.message 
          })
        }

        if (actionsResult.success) {
          setPendingActions(actionsResult.data)
        } else {
          logger.warn('Failed to load pending actions', 'admin-dashboard-load', { 
            error: actionsResult.error.message 
          })
        }

        setIsLoading(false)
      } catch (error) {
        logger.error(
          'Admin dashboard load failed',
          'admin-dashboard-load',
          { chamberId, errorMessage: 'Unexpected error' },
          error instanceof Error ? error : undefined
        )
        setError('Failed to load dashboard data')
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [chamberId, auth?.userProfile?.role])

  if (!auth || !auth.userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading authentication...</p>
        </div>
      </div>
    )
  }

  // Check if user has admin permissions
  if (!['chamber_admin', 'chamber_creator'].includes(auth.userProfile.user_type || '') && 
      !['admin', 'staff'].includes(auth.primaryMembership?.role || '')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>Access Denied</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              You don't have permission to access the admin dashboard. 
              Contact your chamber administrator for access.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>Error</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const chamberName = auth?.primaryMembership?.chambers?.name || 'Your Chamber'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome back! Here's what's happening at {chamberName}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {auth.userProfile.user_type === 'chamber_creator' ? 'Chamber Creator' : 'Admin'}
              </Badge>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <ErrorBoundary operation="admin-stats-cards">
          <AdminStatsCards stats={stats} />
        </ErrorBoundary>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Left Column - Pending Actions */}
          <div className="lg:col-span-2 space-y-6">
            <ErrorBoundary operation="pending-actions-card">
              <PendingActionsCard 
                actions={pendingActions} 
                onActionComplete={() => {
                  // Refresh data when action is completed
                  window.location.reload()
                }}
              />
            </ErrorBoundary>

            {/* Recent Activity Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Recent Activity</span>
                </CardTitle>
                <CardDescription>
                  Latest member and event activity in your chamber
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats && stats.memberGrowth > 0 ? (
                    <>
                      <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                        <UserPlus className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-green-900">New Members</p>
                          <p className="text-green-700 text-sm">
                            {stats.memberGrowth} new members joined in the last 30 days
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-blue-900">Upcoming Events</p>
                          <p className="text-blue-700 text-sm">
                            {stats.upcomingEvents} events scheduled this month
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="h-8 w-8 mx-auto mb-2" />
                      <p>No recent activity</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-6">
            <ErrorBoundary operation="quick-actions-card">
              <QuickActionsCard chamberId={chamberId} />
            </ErrorBoundary>

            {/* Chamber Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="h-5 w-5" />
                  <span>Chamber Info</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Chamber Name</p>
                    <p className="text-gray-900">{chamberName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Your Role</p>
                    <Badge variant="outline">
                      {auth.userProfile.user_type === 'chamber_creator' ? 'Creator' : 'Administrator'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Member Since</p>
                    <p className="text-gray-900">
                      {auth.primaryMembership?.created_at ? 
                        new Date(auth.primaryMembership.created_at).toLocaleDateString() : 
                        'Unknown'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Help & Support Card */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
                <CardDescription>
                  Get support and learn more about managing your chamber
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Member Management Guide
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Event Planning Tips
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Revenue Optimization
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 