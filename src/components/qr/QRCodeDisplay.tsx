import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { QrCode, Download, Share2, BarChart3, Eye, MousePointer } from 'lucide-react'
import { generateTrackingQRCodeUrl, getBusinessQRAnalytics, type QRAnalytics } from '@/lib/qr-analytics'

export function QRCodeDisplay() {
  const { currentBusiness, currentChamber } = useAuth()
  const [analytics, setAnalytics] = useState<QRAnalytics | null>(null)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [loadingAnalytics, setLoadingAnalytics] = useState(false)
  
  if (!currentBusiness || !currentChamber) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <p className="text-gray-600">Business profile required for QR code</p>
        </CardContent>
      </Card>
    )
  }

  const qrCodeUrl = generateTrackingQRCodeUrl(currentBusiness.id, currentChamber.slug, 'direct')

  const loadAnalytics = async () => {
    setLoadingAnalytics(true)
    try {
      const analyticsData = await getBusinessQRAnalytics(currentBusiness.id)
      setAnalytics(analyticsData)
      setShowAnalytics(true)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoadingAnalytics(false)
    }
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = qrCodeUrl
    link.download = `${currentBusiness.name}-qr-code.png`
    link.click()
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${currentBusiness.name} - Chamber Connect`,
          text: `Connect with ${currentBusiness.name} on Chamber Connect`,
          url: `https://${currentChamber.slug}.chamberconnect.com/business/${currentBusiness.id}`
        })
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(`https://${currentChamber.slug}.chamberconnect.com/business/${currentBusiness.id}`)
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2">
          <QrCode className="h-5 w-5" />
          <span>Your QR Code</span>
        </CardTitle>
        <CardDescription>
          Share this QR code at networking events for instant profile sharing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
            <img 
              src={qrCodeUrl} 
              alt={`QR Code for ${currentBusiness.name}`}
              className="w-48 h-48"
            />
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            When scanned, this QR code will display your business profile to other Chamber Connect members
          </p>
          
          <div className="grid grid-cols-3 gap-2 mb-4">
            <Button size="sm" variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
            <Button size="sm" variant="outline" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={loadAnalytics}
              disabled={loadingAnalytics}
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              {loadingAnalytics ? 'Loading...' : 'Analytics'}
            </Button>
          </div>

          {/* Analytics Display */}
          {showAnalytics && analytics && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <BarChart3 className="h-4 w-4 mr-2" />
                QR Code Performance (Last 30 Days)
              </h4>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{analytics.totalScans}</div>
                  <div className="text-xs text-gray-500">Total Scans</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{analytics.uniqueVisitors}</div>
                  <div className="text-xs text-gray-500">Unique Visitors</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">{analytics.conversionRate}%</div>
                  <div className="text-xs text-gray-500">Conversion Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">
                    {analytics.growthRate > 0 ? '+' : ''}{analytics.growthRate}%
                  </div>
                  <div className="text-xs text-gray-500">Growth Rate</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Top Source:</span>
                  <Badge variant="secondary" className="text-xs">
                    {analytics.topSource}
                  </Badge>
                </div>
                
                <div className="text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Mobile Scans:</span>
                    <span className="font-medium">{analytics.deviceBreakdown.mobile}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Desktop Scans:</span>
                    <span className="font-medium">{analytics.deviceBreakdown.desktop}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Event Scans:</span>
                    <span className="font-medium">{analytics.sourceBreakdown.event}</span>
                  </div>
                </div>
              </div>

              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setShowAnalytics(false)}
                className="w-full mt-3 text-xs"
              >
                Hide Analytics
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}