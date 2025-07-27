// QR Analytics Metrics Cards Component
// Extracted from QRAnalyticsDashboard.tsx for file size compliance

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { BarChart3, TrendingUp, Users, MousePointer } from 'lucide-react'

interface ChamberQRAnalytics {
  totalScans: number
  uniqueVisitors: number
  totalBusinesses: number
  avgConversionRate: number
  topPerformingBusiness: {
    name: string
    scans: number
  }
  deviceBreakdown: {
    mobile: number
    desktop: number
    tablet: number
  }
  sourceBreakdown: {
    event: number
    direct: number
    businessCard: number
    website: number
  }
  dailyTrends: Array<{
    date: string
    scans: number
    visitors: number
  }>
  topCities: Array<{
    city: string
    scans: number
  }>
}

interface QRAnalyticsMetricsProps {
  analytics: ChamberQRAnalytics
}

export function QRAnalyticsMetrics({ analytics }: QRAnalyticsMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Scans</p>
              <p className="text-3xl font-bold text-blue-600">{analytics.totalScans.toLocaleString()}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unique Visitors</p>
              <p className="text-3xl font-bold text-green-600">{analytics.uniqueVisitors.toLocaleString()}</p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Businesses</p>
              <p className="text-3xl font-bold text-purple-600">{analytics.totalBusinesses}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Conversion</p>
              <p className="text-3xl font-bold text-orange-600">{analytics.avgConversionRate.toFixed(1)}%</p>
            </div>
            <MousePointer className="h-8 w-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 