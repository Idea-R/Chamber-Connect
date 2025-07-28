import React from 'react'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  AlertCircle, 
  CheckCircle, 
  X, 
  Mail, 
  DollarSign, 
  UserPlus,
  Calendar,
  Clock,
  ChevronRight
} from 'lucide-react'
import { approveMember, rejectMember } from '@/lib/admin-data'
import { logger } from '@/lib/analytics-error-handler'
import type { PendingAction } from '@/lib/admin-data'

interface PendingActionsCardProps {
  actions: PendingAction[]
  onActionComplete: () => void
}

export function PendingActionsCard({ actions, onActionComplete }: PendingActionsCardProps) {
  const [processingActions, setProcessingActions] = useState<Set<string>>(new Set())

  const getActionIcon = (type: PendingAction['type']) => {
    switch (type) {
      case 'member_approval':
        return UserPlus
      case 'event_approval':
        return Calendar
      case 'payment_overdue':
        return DollarSign
      case 'staff_invitation':
        return Mail
      default:
        return AlertCircle
    }
  }

  const getActionColor = (priority: PendingAction['priority']) => {
    switch (priority) {
      case 'high':
        return {
          badge: 'bg-red-100 text-red-800',
          border: 'border-red-200',
          icon: 'text-red-600'
        }
      case 'medium':
        return {
          badge: 'bg-yellow-100 text-yellow-800',
          border: 'border-yellow-200',
          icon: 'text-yellow-600'
        }
      case 'low':
        return {
          badge: 'bg-blue-100 text-blue-800',
          border: 'border-blue-200',
          icon: 'text-blue-600'
        }
    }
  }

  const handleApproveMember = async (actionId: string) => {
    setProcessingActions(prev => new Set(prev).add(actionId))
    
    try {
      logger.info(
        'Admin approving member',
        'admin-approve-member-action',
        { actionId }
      )

      const result = await approveMember(actionId)
      
      if (result.success) {
        logger.info(
          'Member approved successfully',
          'admin-approve-member-action',
          { actionId }
        )
        onActionComplete()
      } else {
        logger.warn(
          'Failed to approve member',
          'admin-approve-member-action',
          { actionId, error: result.error.message }
        )
        alert(`Failed to approve member: ${result.error.message}`)
      }
    } catch (error) {
      logger.error(
        'Error approving member',
        'admin-approve-member-action',
        { actionId, errorMessage: 'Unexpected error' },
        error instanceof Error ? error : undefined
      )
      alert('An unexpected error occurred. Please try again.')
    } finally {
      setProcessingActions(prev => {
        const newSet = new Set(prev)
        newSet.delete(actionId)
        return newSet
      })
    }
  }

  const handleRejectMember = async (actionId: string) => {
    if (!confirm('Are you sure you want to reject this member application?')) {
      return
    }

    setProcessingActions(prev => new Set(prev).add(actionId))
    
    try {
      logger.info(
        'Admin rejecting member',
        'admin-reject-member-action',
        { actionId }
      )

      const result = await rejectMember(actionId, 'Rejected by admin')
      
      if (result.success) {
        logger.info(
          'Member rejected successfully',
          'admin-reject-member-action',
          { actionId }
        )
        onActionComplete()
      } else {
        logger.warn(
          'Failed to reject member',
          'admin-reject-member-action',
          { actionId, error: result.error.message }
        )
        alert(`Failed to reject member: ${result.error.message}`)
      }
    } catch (error) {
      logger.error(
        'Error rejecting member',
        'admin-reject-member-action',
        { actionId, errorMessage: 'Unexpected error' },
        error instanceof Error ? error : undefined
      )
      alert('An unexpected error occurred. Please try again.')
    } finally {
      setProcessingActions(prev => {
        const newSet = new Set(prev)
        newSet.delete(actionId)
        return newSet
      })
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    const diffInWeeks = Math.floor(diffInDays / 7)
    return `${diffInWeeks}w ago`
  }

  if (actions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>Pending Actions</span>
          </CardTitle>
          <CardDescription>
            Actions that require your attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
            <p className="text-gray-600">No pending actions require your attention.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <span>Pending Actions</span>
          </div>
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            {actions.length}
          </Badge>
        </CardTitle>
        <CardDescription>
          Actions that require your immediate attention
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {actions.slice(0, 5).map((action) => {
            const Icon = getActionIcon(action.type)
            const colors = getActionColor(action.priority)
            const isProcessing = processingActions.has(action.id)

            return (
              <div
                key={action.id}
                className={`p-4 rounded-lg border ${colors.border} bg-white hover:shadow-sm transition-shadow`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className={`p-2 rounded-lg bg-gray-50`}>
                      <Icon className={`h-4 w-4 ${colors.icon}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900 text-sm">{action.title}</h4>
                        <Badge variant="secondary" className={`${colors.badge} text-xs px-2 py-0.5`}>
                          {action.priority}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm">{action.description}</p>
                      {action.email && (
                        <p className="text-gray-500 text-xs mt-1 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {action.email}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTimeAgo(action.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {action.type === 'member_approval' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectMember(action.id)}
                          disabled={isProcessing}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApproveMember(action.id)}
                          disabled={isProcessing}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isProcessing ? (
                            <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full mr-1" />
                          ) : (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          )}
                          Approve
                        </Button>
                      </>
                    )}
                    {action.type === 'payment_overdue' && (
                      <Button size="sm" variant="outline">
                        <Mail className="h-3 w-3 mr-1" />
                        Send Reminder
                      </Button>
                    )}
                    {action.type === 'staff_invitation' && (
                      <Button size="sm" variant="outline">
                        <Mail className="h-3 w-3 mr-1" />
                        Resend
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
          
          {actions.length > 5 && (
            <div className="pt-4 border-t">
              <Button variant="ghost" className="w-full">
                View All {actions.length} Actions
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 