import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/analytics-error-handler'
import { QRAnalyticsMetrics } from './QRAnalyticsMetrics'
import { QRAnalyticsCharts } from './QRAnalyticsCharts'
import { ErrorBoundary } from '@/components/ui/error-boundary'

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

interface BusinessAnalytics {
  businessId: string
  businessName: string
  totalScans: number
  uniqueVisitors: number
  conversionRate: number
  growthRate: number
  lastScanDate: string
}

export function QRAnalyticsDashboard() {
  const { currentChamber } = useAuth()
  const [analytics, setAnalytics] = useState<ChamberQRAnalytics | null>(null)
  const [businessAnalytics, setBusinessAnalytics] = useState<BusinessAnalytics[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('30')
  const [selectedView, setSelectedView] = useState('overview')

  useEffect(() => {
    if (currentChamber) {
      loadAnalytics()
    }
  }, [currentChamber, selectedPeriod])

  const loadAnalytics = async () => {
    if (!currentChamber) return

    setLoading(true)
    try {
      const endDate = new Date().toISOString().split('T')[0]
      const startDate = new Date(Date.now() - parseInt(selectedPeriod) * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0]

      logger.info(
        'Loading QR analytics data',
        'qr-analytics-load',
        { 
          chamberId: currentChamber.id,
          period: selectedPeriod,
          startDate,
          endDate
        }
      )

      // Load chamber-wide analytics
      const { data: scansData, error: scansError } = await supabase
        .from('qr_analytics_summary')
        .select(`
          *,
          businesses:business_id (
            name,
            id
          )
        `)
        .eq('chamber_id', currentChamber.id)
        .gte('date', startDate)
        .lte('date', endDate)

      if (scansError) {
        logger.error(
          'Error loading QR analytics',
          'qr-analytics-load',
          { 
            chamberId: currentChamber.id,
            errorCode: scansError.code 
          }
        )
        throw scansError
      }

      // Aggregate chamber analytics
      const totalScans = scansData.reduce((sum, day) => sum + day.total_scans, 0)
      const uniqueVisitors = scansData.reduce((sum, day) => sum + day.unique_scans, 0)
      const totalConversions = scansData.reduce((sum, day) => sum + day.connections_made + day.messages_sent, 0)

      // Get business performance
      const businessPerformance = scansData.reduce((acc, day) => {
        const businessId = day.business_id
        if (!acc[businessId]) {
          acc[businessId] = {
            businessId,
            businessName: day.businesses?.name || 'Unknown',
            totalScans: 0,
            uniqueVisitors: 0,
            conversions: 0,
            lastScanDate: day.date
          }
        }
        acc[businessId].totalScans += day.total_scans
        acc[businessId].uniqueVisitors += day.unique_scans
        acc[businessId].conversions += day.connections_made + day.messages_sent
        if (day.date > acc[businessId].lastScanDate) {
          acc[businessId].lastScanDate = day.date
        }
        return acc
      }, {} as Record<string, any>)

      const topBusiness = Object.values(businessPerformance)
        .sort((a: any, b: any) => b.totalScans - a.totalScans)[0] as any

      // Device and source breakdown
      const deviceBreakdown = {
        mobile: scansData.reduce((sum, day) => sum + day.mobile_scans, 0),
        desktop: scansData.reduce((sum, day) => sum + day.desktop_scans, 0),
        tablet: scansData.reduce((sum, day) => sum + day.tablet_scans, 0)
      }

      const sourceBreakdown = {
        event: scansData.reduce((sum, day) => sum + day.event_scans, 0),
        direct: scansData.reduce((sum, day) => sum + day.direct_scans, 0),
        businessCard: scansData.reduce((sum, day) => sum + day.business_card_scans, 0),
        website: scansData.reduce((sum, day) => sum + (day.total_scans - day.event_scans - day.direct_scans - day.business_card_scans), 0)
      }

      // Daily trends (group by date)
      const dailyTrendsMap = scansData.reduce((acc, day) => {
        if (!acc[day.date]) {
          acc[day.date] = { date: day.date, scans: 0, visitors: 0 }
        }
        acc[day.date].scans += day.total_scans
        acc[day.date].visitors += day.unique_scans
        return acc
      }, {} as Record<string, any>)

      const dailyTrends = Object.values(dailyTrendsMap)
        .sort((a: any, b: any) => a.date.localeCompare(b.date)) as Array<{
          date: string
          scans: number
          visitors: number
        }>

      // Get geographic data
      const { data: geoData } = await supabase
        .from('qr_scans')
        .select('city_name')
        .eq('chamber_id', currentChamber.id)
        .gte('created_at', `${startDate}T00:00:00Z`)
        .lte('created_at', `${endDate}T23:59:59Z`)
        .not('city_name', 'is', null)

      const cityBreakdown = geoData?.reduce((acc, scan) => {
        const city = scan.city_name
        acc[city] = (acc[city] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      const topCities = Object.entries(cityBreakdown)
        .map(([city, scans]) => ({ city, scans }))
        .sort((a, b) => b.scans - a.scans)
        .slice(0, 5)

      setAnalytics({
        totalScans,
        uniqueVisitors,
        totalBusinesses: Object.keys(businessPerformance).length,
        avgConversionRate: uniqueVisitors > 0 ? (totalConversions / uniqueVisitors) * 100 : 0,
        topPerformingBusiness: {
          name: topBusiness?.businessName || 'No data',
          scans: topBusiness?.totalScans || 0
        },
        deviceBreakdown,
        sourceBreakdown,
        dailyTrends,
        topCities
      })

      // Set business analytics
      const businessAnalyticsArray = Object.values(businessPerformance).map((business: any) => ({
        businessId: business.businessId,
        businessName: business.businessName,
        totalScans: business.totalScans,
        uniqueVisitors: business.uniqueVisitors,
        conversionRate: business.uniqueVisitors > 0 ? (business.conversions / business.uniqueVisitors) * 100 : 0,
        growthRate: 0, // Would need previous period data
        lastScanDate: business.lastScanDate
      }))

      setBusinessAnalytics(businessAnalyticsArray.sort((a, b) => b.totalScans - a.totalScans))

      logger.info(
        'QR analytics loaded successfully',
        'qr-analytics-load',
        { 
          chamberId: currentChamber.id,
          totalScans,
          uniqueVisitors,
          businessCount: Object.keys(businessPerformance).length
        }
      )

    } catch (error) {
      logger.error(
        'Failed to load QR analytics',
        'qr-analytics-load',
        { chamberId: currentChamber?.id },
        error instanceof Error ? error : new Error(String(error))
      )
    } finally {
      setLoading(false)
    }
  }

  if (!currentChamber) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Chamber access required to view analytics</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-gray-200 rounded-lg"></div>
            <div className="h-24 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No analytics data available</p>
      </div>
    )
  }

  return (
    <ErrorBoundary operation="qr-analytics-dashboard" retryable>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">QR Code Analytics</h2>
            <p className="text-gray-600">Performance insights for {currentChamber.name}</p>
          </div>
          
          <div className="flex space-x-2">
            <select 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
            
            <select 
              value={selectedView} 
              onChange={(e) => setSelectedView(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="overview">Overview</option>
              <option value="businesses">By Business</option>
              <option value="geography">Geographic</option>
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        <QRAnalyticsMetrics analytics={analytics} />

        {/* Charts */}
        <QRAnalyticsCharts analytics={analytics} selectedView={selectedView} />

        {/* Business Performance View */}
        {selectedView === 'businesses' && (
          <Card>
            <CardHeader>
              <CardTitle>Business Performance</CardTitle>
              <CardDescription>QR code performance by chamber member</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {businessAnalytics.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No business data available</p>
                ) : (
                  businessAnalytics.map((business, index) => (
                    <div key={business.businessId} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                          #{index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{business.businessName}</h4>
                          <p className="text-sm text-gray-500">Last scan: {business.lastScanDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6 text-sm">
                        <div className="text-center">
                          <div className="font-medium text-blue-600">{business.totalScans}</div>
                          <div className="text-gray-500">Scans</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-green-600">{business.uniqueVisitors}</div>
                          <div className="text-gray-500">Visitors</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-purple-600">{business.conversionRate.toFixed(1)}%</div>
                          <div className="text-gray-500">Conversion</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ErrorBoundary>
  )
} 