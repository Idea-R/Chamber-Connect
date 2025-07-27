import { supabase } from './supabase'

// Types for QR analytics
export interface QRScanData {
  chamberId: string
  businessId: string
  eventId?: string
  scanSource: 'event' | 'business_card' | 'website' | 'direct' | 'unknown'
  referrerUrl?: string
  eventContext?: string
  userConsent?: boolean
}

export interface ProfileViewData {
  chamberId: string
  businessId: string
  qrScanId?: string
  viewDuration: number
  sectionsViewed: string[]
  actionsAtken: string[]
  scrollDepthPercentage: number
  clickedPhone?: boolean
  clickedEmail?: boolean
  clickedWebsite?: boolean
  clickedSocialMedia?: boolean
  downloadedVcf?: boolean
}

export interface QRAnalytics {
  totalScans: number
  uniqueVisitors: number
  conversionRate: number
  topSource: string
  peakDay: string
  growthRate: number
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
}

// Device detection utilities
export function detectDevice(): 'mobile' | 'tablet' | 'desktop' | 'unknown' {
  if (typeof window === 'undefined') return 'unknown'
  
  const userAgent = navigator.userAgent.toLowerCase()
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
  const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent)
  
  if (isTablet) return 'tablet'
  if (isMobile) return 'mobile'
  return 'desktop'
}

export function detectBrowser(): string {
  if (typeof window === 'undefined') return 'unknown'
  
  const userAgent = navigator.userAgent.toLowerCase()
  
  if (userAgent.includes('chrome')) return 'chrome'
  if (userAgent.includes('firefox')) return 'firefox'
  if (userAgent.includes('safari') && !userAgent.includes('chrome')) return 'safari'
  if (userAgent.includes('edge')) return 'edge'
  if (userAgent.includes('opera')) return 'opera'
  
  return 'unknown'
}

// Generate unique session ID
export function generateSessionId(): string {
  const stored = sessionStorage.getItem('chamber-connect-session')
  if (stored) return stored
  
  const sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  sessionStorage.setItem('chamber-connect-session', sessionId)
  return sessionId
}

// Check if this is a return scan for this business
export function isReturnScan(businessId: string): boolean {
  const key = `qr-scan-${businessId}`
  const lastScan = localStorage.getItem(key)
  
  if (lastScan) {
    const lastScanTime = parseInt(lastScan)
    const hoursSinceLastScan = (Date.now() - lastScanTime) / (1000 * 60 * 60)
    
    // Consider it a return scan if scanned within 7 days
    return hoursSinceLastScan < 168
  }
  
  localStorage.setItem(key, Date.now().toString())
  return false
}

// Get user's geolocation (with consent)
export async function getLocation(consent: boolean = false): Promise<{ 
  latitude?: number
  longitude?: number
  city?: string
  country?: string 
} | null> {
  if (!consent || !navigator.geolocation) return null
  
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        
        try {
          // Use a geocoding service to get city/country (implement as needed)
          const locationData = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=YOUR_API_KEY`
          ).then(res => res.json())
          
          resolve({
            latitude,
            longitude,
            city: locationData.results?.[0]?.components?.city,
            country: locationData.results?.[0]?.components?.country_code
          })
        } catch (error) {
          resolve({ latitude, longitude })
        }
      },
      () => resolve(null),
      { timeout: 5000, enableHighAccuracy: false }
    )
  })
}

// Track QR code scan
export async function trackQRScan(data: QRScanData, userConsent: boolean = false): Promise<string | null> {
  try {
    const sessionId = generateSessionId()
    const isReturn = isReturnScan(data.businessId)
    const location = await getLocation(userConsent)
    
    const scanData = {
      chamber_id: data.chamberId,
      business_id: data.businessId,
      event_id: data.eventId,
      scan_source: data.scanSource,
      referrer_url: data.referrerUrl || window.location.href,
      event_context: data.eventContext,
      user_agent: navigator.userAgent,
      device_type: detectDevice(),
      browser_name: detectBrowser(),
      country_code: location?.country,
      city_name: location?.city,
      latitude: userConsent ? location?.latitude : null,
      longitude: userConsent ? location?.longitude : null,
      is_return_scan: isReturn,
      session_id: sessionId,
      user_consent_given: userConsent,
      gdpr_compliant: true
    }
    
    const { data: result, error } = await supabase
      .from('qr_scans')
      .insert(scanData)
      .select('id')
      .single()
    
    if (error) {
      console.error('Error tracking QR scan:', error)
      return null
    }
    
    return result.id
  } catch (error) {
    console.error('Error tracking QR scan:', error)
    return null
  }
}

// Track profile view with engagement metrics
export class ProfileViewTracker {
  private startTime: number
  private sectionsViewed: Set<string>
  private actionsAtken: Set<string>
  private maxScrollDepth: number
  private qrScanId: string | null
  private businessId: string
  private chamberId: string
  
  constructor(businessId: string, chamberId: string, qrScanId?: string) {
    this.startTime = Date.now()
    this.sectionsViewed = new Set()
    this.actionsAtken = new Set()
    this.maxScrollDepth = 0
    this.qrScanId = qrScanId || null
    this.businessId = businessId
    this.chamberId = chamberId
    
    // Track scroll depth
    this.setupScrollTracking()
  }
  
  private setupScrollTracking() {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0
      
      this.maxScrollDepth = Math.max(this.maxScrollDepth, scrollPercent)
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      window.removeEventListener('scroll', handleScroll)
      this.save()
    })
  }
  
  trackSection(section: string) {
    this.sectionsViewed.add(section)
  }
  
  trackAction(action: string) {
    this.actionsAtken.add(action)
  }
  
  trackPhoneClick() {
    this.trackAction('called')
    this.save({ clicked_phone: true })
  }
  
  trackEmailClick() {
    this.trackAction('emailed')
    this.save({ clicked_email: true })
  }
  
  trackWebsiteClick() {
    this.trackAction('website_visited')
    this.save({ clicked_website: true })
  }
  
  trackSocialMediaClick() {
    this.trackAction('social_visited')
    this.save({ clicked_social_media: true })
  }
  
  trackVCFDownload() {
    this.trackAction('vcf_downloaded')
    this.save({ downloaded_vcf: true })
  }
  
  trackConnectionRequest() {
    this.trackAction('connected')
    this.save({ connection_requested: true })
  }
  
  trackMessageSent() {
    this.trackAction('messaged')
    this.save({ message_sent: true })
  }
  
  async save(additionalData: Record<string, any> = {}) {
    const viewDuration = Math.round((Date.now() - this.startTime) / 1000)
    
    const profileViewData = {
      chamber_id: this.chamberId,
      business_id: this.businessId,
      qr_scan_id: this.qrScanId,
      view_duration: viewDuration,
      sections_viewed: Array.from(this.sectionsViewed),
      actions_taken: Array.from(this.actionsAtken),
      scroll_depth_percentage: this.maxScrollDepth,
      ...additionalData
    }
    
    try {
      const { error } = await supabase
        .from('profile_views')
        .upsert(profileViewData, {
          onConflict: 'qr_scan_id',
          ignoreDuplicates: false
        })
      
      if (error) {
        console.error('Error saving profile view:', error)
      }
    } catch (error) {
      console.error('Error saving profile view:', error)
    }
  }
}

// Get QR analytics for a business
export async function getBusinessQRAnalytics(
  businessId: string,
  startDate?: string,
  endDate?: string
): Promise<QRAnalytics | null> {
  try {
    const { data, error } = await supabase
      .rpc('get_business_qr_analytics', {
        business_uuid: businessId,
        start_date: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: endDate || new Date().toISOString().split('T')[0]
      })
    
    if (error) {
      console.error('Error fetching QR analytics:', error)
      return null
    }
    
    // Also get device and source breakdown
    const { data: breakdownData, error: breakdownError } = await supabase
      .from('qr_analytics_summary')
      .select('*')
      .eq('business_id', businessId)
      .gte('date', startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .lte('date', endDate || new Date().toISOString().split('T')[0])
    
    if (breakdownError) {
      console.error('Error fetching breakdown data:', breakdownError)
    }
    
    const result = data[0]
    const breakdown = breakdownData || []
    
    return {
      totalScans: result.total_scans || 0,
      uniqueVisitors: result.unique_visitors || 0,
      conversionRate: result.conversion_rate || 0,
      topSource: result.top_source || 'unknown',
      peakDay: result.peak_day || '',
      growthRate: result.growth_rate || 0,
      deviceBreakdown: {
        mobile: breakdown.reduce((sum, day) => sum + (day.mobile_scans || 0), 0),
        desktop: breakdown.reduce((sum, day) => sum + (day.desktop_scans || 0), 0),
        tablet: breakdown.reduce((sum, day) => sum + (day.tablet_scans || 0), 0)
      },
      sourceBreakdown: {
        event: breakdown.reduce((sum, day) => sum + (day.event_scans || 0), 0),
        direct: breakdown.reduce((sum, day) => sum + (day.direct_scans || 0), 0),
        businessCard: breakdown.reduce((sum, day) => sum + (day.business_card_scans || 0), 0),
        website: breakdown.reduce((sum, day) => sum + (day.website_scans || 0), 0)
      }
    }
  } catch (error) {
    console.error('Error fetching QR analytics:', error)
    return null
  }
}

// Generate QR code with tracking
export function generateTrackingQRCodeUrl(
  businessId: string,
  chamberSlug: string,
  source: string = 'direct',
  eventId?: string
): string {
  const baseUrl = `https://${chamberSlug}.chamberconnect.com/business/${businessId}`
  const trackingParams = new URLSearchParams({
    utm_source: 'qr_code',
    utm_medium: source,
    utm_campaign: 'networking',
    ...(eventId && { event_id: eventId }),
    tracking: 'true'
  })
  
  const trackedUrl = `${baseUrl}?${trackingParams.toString()}`
  
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(trackedUrl)}`
}

// Aggregate daily analytics (to be called by cron job or scheduled function)
export async function aggregateDailyAnalytics(targetDate?: string) {
  const date = targetDate || new Date().toISOString().split('T')[0]
  
  try {
    const { error } = await supabase.rpc('aggregate_daily_qr_analytics', {
      target_date: date
    })
    
    if (error) {
      console.error('Error aggregating daily analytics:', error)
    }
  } catch (error) {
    console.error('Error aggregating daily analytics:', error)
  }
} 