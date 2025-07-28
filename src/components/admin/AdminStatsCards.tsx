import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  UserCheck,
  Clock,
  AlertTriangle,
  Star
} from 'lucide-react'
import type { AdminDashboardStats } from '@/lib/admin-data'

interface AdminStatsCardsProps {
  stats: AdminDashboardStats | null
}

export function AdminStatsCards({ stats }: AdminStatsCardsProps) {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const statsCards = [
    {
      title: 'Total Members',
      value: stats.totalMembers.toLocaleString(),
      subtext: `${stats.activeMembers} active`,
      icon: Users,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: stats.memberGrowth > 0 ? `+${stats.memberGrowth}` : null,
      trendColor: 'text-green-600'
    },
    {
      title: 'Monthly Revenue',
      value: `$${stats.monthlyRevenue.toLocaleString()}`,
      subtext: `$${stats.totalRevenue.toLocaleString()} annual`,
      icon: DollarSign,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: '+12%',
      trendColor: 'text-green-600'
    },
    {
      title: 'Total Events',
      value: stats.totalEvents.toLocaleString(),
      subtext: `${stats.upcomingEvents} upcoming`,
      icon: Calendar,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      trend: stats.upcomingEvents > 0 ? `${stats.upcomingEvents} planned` : null,
      trendColor: 'text-purple-600'
    },
    {
      title: 'Avg Attendance',
      value: stats.eventAttendance.toString(),
      subtext: 'per event',
      icon: UserCheck,
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      trend: stats.eventAttendance > 10 ? 'Good' : 'Low',
      trendColor: stats.eventAttendance > 10 ? 'text-green-600' : 'text-yellow-600'
    },
    {
      title: 'Pending Members',
      value: stats.pendingMembers.toLocaleString(),
      subtext: 'awaiting approval',
      icon: Clock,
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      trend: stats.pendingMembers > 0 ? 'Action needed' : 'All clear',
      trendColor: stats.pendingMembers > 0 ? 'text-red-600' : 'text-green-600'
    },
    {
      title: 'Trial Members',
      value: stats.trialMembers.toLocaleString(),
      subtext: 'on trial period',
      icon: Star,
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
      trend: stats.trialMembers > 0 ? 'Convert them!' : null,
      trendColor: 'text-orange-600'
    },
    {
      title: 'Member Growth',
      value: `+${stats.memberGrowth}`,
      subtext: 'last 30 days',
      icon: TrendingUp,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      trend: stats.memberGrowth > 0 ? 'Growing' : 'Stable',
      trendColor: stats.memberGrowth > 0 ? 'text-green-600' : 'text-gray-600'
    },
    {
      title: 'Health Score',
      value: calculateHealthScore(stats),
      subtext: 'chamber health',
      icon: AlertTriangle,
      iconColor: getHealthScoreColor(calculateHealthScore(stats)).iconColor,
      bgColor: getHealthScoreColor(calculateHealthScore(stats)).bgColor,
      trend: getHealthScoreDescription(calculateHealthScore(stats)),
      trendColor: getHealthScoreColor(calculateHealthScore(stats)).trendColor
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsCards.map((card, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
              {card.title}
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.iconColor}`} />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                <p className="text-xs text-gray-500">{card.subtext}</p>
              </div>
              {card.trend && (
                <Badge variant="secondary" className={`${card.trendColor} bg-transparent text-xs`}>
                  {card.trend}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/**
 * Calculate an overall health score for the chamber based on various metrics
 */
function calculateHealthScore(stats: AdminDashboardStats): string {
  let score = 0
  let maxScore = 100

  // Member metrics (40 points)
  if (stats.totalMembers > 50) score += 15
  else if (stats.totalMembers > 20) score += 10
  else if (stats.totalMembers > 10) score += 5

  if (stats.memberGrowth > 5) score += 15
  else if (stats.memberGrowth > 2) score += 10
  else if (stats.memberGrowth > 0) score += 5

  if (stats.pendingMembers === 0) score += 10
  else if (stats.pendingMembers < 5) score += 5

  // Revenue metrics (30 points)
  if (stats.monthlyRevenue > 5000) score += 20
  else if (stats.monthlyRevenue > 2000) score += 15
  else if (stats.monthlyRevenue > 1000) score += 10
  else if (stats.monthlyRevenue > 500) score += 5

  if (stats.totalRevenue > 50000) score += 10
  else if (stats.totalRevenue > 20000) score += 5

  // Event metrics (30 points)
  if (stats.totalEvents > 20) score += 10
  else if (stats.totalEvents > 10) score += 8
  else if (stats.totalEvents > 5) score += 5

  if (stats.upcomingEvents > 5) score += 10
  else if (stats.upcomingEvents > 2) score += 8
  else if (stats.upcomingEvents > 0) score += 5

  if (stats.eventAttendance > 20) score += 10
  else if (stats.eventAttendance > 10) score += 8
  else if (stats.eventAttendance > 5) score += 5

  const percentage = Math.round((score / maxScore) * 100)
  return `${percentage}%`
}

/**
 * Get color scheme based on health score
 */
function getHealthScoreColor(score: string) {
  const numScore = parseInt(score.replace('%', ''))
  
  if (numScore >= 80) {
    return {
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
      trendColor: 'text-green-600'
    }
  } else if (numScore >= 60) {
    return {
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      trendColor: 'text-yellow-600'
    }
  } else {
    return {
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50',
      trendColor: 'text-red-600'
    }
  }
}

/**
 * Get health score description
 */
function getHealthScoreDescription(score: string): string {
  const numScore = parseInt(score.replace('%', ''))
  
  if (numScore >= 90) return 'Excellent'
  if (numScore >= 80) return 'Very Good'
  if (numScore >= 70) return 'Good'
  if (numScore >= 60) return 'Fair'
  if (numScore >= 40) return 'Needs Work'
  return 'Critical'
} 