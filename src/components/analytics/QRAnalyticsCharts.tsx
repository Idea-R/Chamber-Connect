// QR Analytics Charts Component
// Extracted from QRAnalyticsDashboard.tsx for file size compliance

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Smartphone, Calendar, MapPin } from 'lucide-react'

interface ChamberQRAnalytics {
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
  topCities: Array<{
    city: string
    scans: number
  }>
  totalScans: number
}

interface QRAnalyticsChartsProps {
  analytics: ChamberQRAnalytics
  selectedView: string
}

export function QRAnalyticsCharts({ analytics, selectedView }: QRAnalyticsChartsProps) {
  if (selectedView === 'overview') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Smartphone className="h-5 w-5" />
              <span>Device Types</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Mobile</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ 
                        width: `${(analytics.deviceBreakdown.mobile / analytics.totalScans) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{analytics.deviceBreakdown.mobile}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Desktop</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ 
                        width: `${(analytics.deviceBreakdown.desktop / analytics.totalScans) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{analytics.deviceBreakdown.desktop}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tablet</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ 
                        width: `${(analytics.deviceBreakdown.tablet / analytics.totalScans) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{analytics.deviceBreakdown.tablet}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Source Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Scan Sources</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Events</span>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{analytics.sourceBreakdown.event}</Badge>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Direct</span>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{analytics.sourceBreakdown.direct}</Badge>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Business Cards</span>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{analytics.sourceBreakdown.businessCard}</Badge>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Website</span>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{analytics.sourceBreakdown.website}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (selectedView === 'geography') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Top Cities</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.topCities.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No geographic data available</p>
            ) : (
              analytics.topCities.map((city, index) => (
                <div key={city.city} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-900">{city.city}</span>
                  </div>
                  <Badge variant="secondary">{city.scans} scans</Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
} 