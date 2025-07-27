import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Heart, 
  Share2, 
  Video,
  Globe,
  Building,
  QrCode,
  CheckCircle,
  UserCheck,
  Star,
  DollarSign,
  Clock3,
  Wifi
} from 'lucide-react'
import { 
  EnhancedEvent, 
  EventSession, 
  EventSpeaker,
  eventManager,
  formatEventDateTime,
  getEventStatusColor,
  getEventFormatIcon,
  calculateEventPrice
} from '@/lib/event-management'
import { formatDate } from '@/lib/utils'

interface EnhancedEventCardProps {
  event: EnhancedEvent
  onRegister?: (event: EnhancedEvent) => void
  onCheckIn?: (event: EnhancedEvent) => void
  showSessions?: boolean
  showSpeakers?: boolean
  compact?: boolean
}

export function EnhancedEventCard({ 
  event, 
  onRegister, 
  onCheckIn, 
  showSessions = false, 
  showSpeakers = false,
  compact = false 
}: EnhancedEventCardProps) {
  const { currentBusiness } = useAuth()
  const [isRegistered, setIsRegistered] = useState(false)
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [sessions, setSessions] = useState<EventSession[]>([])
  const [speakers, setSpeakers] = useState<EventSpeaker[]>([])
  const [loading, setLoading] = useState(false)
  const [registrationStatus, setRegistrationStatus] = useState<'none' | 'pending' | 'confirmed' | 'waitlist'>('none')

  useEffect(() => {
    if (showSessions) {
      loadEventSessions()
    }
    if (showSpeakers) {
      loadEventSpeakers()
    }
    checkRegistrationStatus()
  }, [event.id, showSessions, showSpeakers])

  const loadEventSessions = async () => {
    const eventSessions = await eventManager.getEventSessions(event.id)
    setSessions(eventSessions)
  }

  const loadEventSpeakers = async () => {
    const eventSpeakers = await eventManager.getEventSpeakers(event.id)
    setSpeakers(eventSpeakers)
  }

  const checkRegistrationStatus = async () => {
    if (!currentBusiness) return

    const registrations = await eventManager.getEventRegistrations(event.id)
    const userRegistration = registrations.find(r => r.business_id === currentBusiness.id)
    
    if (userRegistration) {
      setRegistrationStatus(userRegistration.registration_status as any)
      setIsRegistered(userRegistration.registration_status === 'confirmed')
    }

    // Check if already checked in
    const checkIns = await eventManager.getEventCheckIns(event.id)
    const userCheckIn = checkIns.find(c => c.business_id === currentBusiness.id)
    setIsCheckedIn(!!userCheckIn)
  }

  const handleRegister = async () => {
    if (!currentBusiness || !onRegister) return

    setLoading(true)
    try {
      const price = calculateEventPrice(event, 'member', new Date()) // Assume member for now
      
      const registration = await eventManager.registerForEvent({
        event_id: event.id,
        business_id: currentBusiness.id,
        registration_type: price === event.early_bird_price ? 'early_bird' : 'regular',
        registration_status: event.max_attendees && getCurrentAttendeeCount() >= event.max_attendees ? 'waitlist' : 'confirmed',
        ticket_price: price,
        discount_applied: 0,
        total_paid: price,
        payment_status: price === 0 ? 'comp' : 'pending',
        custom_fields: {},
        special_requirements: '',
        email_reminders: true,
        sms_reminders: false,
        waitlist_notified: false
      })

      if (registration) {
        setIsRegistered(registration.registration_status === 'confirmed')
        setRegistrationStatus(registration.registration_status as any)
        onRegister(event)
      }
    } catch (error) {
      console.error('Registration failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckIn = async () => {
    if (!currentBusiness || !onCheckIn) return

    setLoading(true)
    try {
      const checkIn = await eventManager.checkInAttendee({
        event_id: event.id,
        business_id: currentBusiness.id,
        check_in_method: 'app',
        virtual_attendance_duration: 0,
        virtual_interaction_score: 0,
        notes: '',
        no_show: false
      })

      if (checkIn) {
        setIsCheckedIn(true)
        onCheckIn?.(event)
      }
    } catch (error) {
      console.error('Check-in failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
  }

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/events/${event.id}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: shareUrl
        })
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      navigator.clipboard.writeText(shareUrl)
      alert('Event link copied to clipboard!')
    }
  }

  const getCurrentAttendeeCount = (): number => {
    // This would be fetched from the API in a real implementation
    return 0 // Placeholder
  }

  const getEventTypeColor = (type: string): string => {
    switch (type) {
      case 'networking': return 'bg-blue-100 text-blue-800'
      case 'workshop': return 'bg-green-100 text-green-800'
      case 'seminar': return 'bg-purple-100 text-purple-800'
      case 'social': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getFormatIcon = () => {
    switch (event.event_format) {
      case 'virtual': return <Video className="h-4 w-4" />
      case 'hybrid': return <Globe className="h-4 w-4" />
      case 'in_person': return <Building className="h-4 w-4" />
      default: return <Calendar className="h-4 w-4" />
    }
  }

  const getEventPrice = (): string => {
    if (event.price === 0) return 'Free'
    
    const memberPrice = event.member_price ?? event.price
    const earlyBirdPrice = event.early_bird_price
    const earlyBirdDeadline = event.early_bird_deadline ? new Date(event.early_bird_deadline) : null
    const now = new Date()

    if (earlyBirdPrice && earlyBirdDeadline && now <= earlyBirdDeadline) {
      return `$${earlyBirdPrice} (Early Bird)`
    }

    if (memberPrice < event.price) {
      return `$${memberPrice} (Member) / $${event.price}`
    }

    return `$${event.price}`
  }

  const renderFormatBadge = () => (
    <Badge variant="outline" className="flex items-center space-x-1">
      {getFormatIcon()}
      <span className="capitalize">{event.event_format.replace('_', ' ')}</span>
    </Badge>
  )

  const renderStatusBadge = () => (
    <Badge className={getEventStatusColor(event.status)}>
      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
    </Badge>
  )

  const renderTypeBadge = () => (
    <Badge className={getEventTypeColor(event.type)}>
      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
    </Badge>
  )

  const renderRegistrationButton = () => {
    if (!currentBusiness) {
      return (
        <Button size="sm" disabled>
          Login to Register
        </Button>
      )
    }

    if (isCheckedIn) {
      return (
        <Button size="sm" variant="secondary" disabled>
          <CheckCircle className="h-4 w-4 mr-1" />
          Checked In
        </Button>
      )
    }

    if (registrationStatus === 'confirmed') {
      const currentDate = new Date()
      const eventDate = new Date(event.event_date)
      const canCheckIn = Math.abs(currentDate.getTime() - eventDate.getTime()) <= 2 * 60 * 60 * 1000 // 2 hours window

      if (canCheckIn && event.check_in_enabled) {
        return (
          <Button size="sm" onClick={handleCheckIn} disabled={loading}>
            <UserCheck className="h-4 w-4 mr-1" />
            Check In
          </Button>
        )
      }

      return (
        <Button size="sm" variant="secondary" disabled>
          <CheckCircle className="h-4 w-4 mr-1" />
          Registered
        </Button>
      )
    }

    if (registrationStatus === 'waitlist') {
      return (
        <Button size="sm" variant="outline" disabled>
          <Clock3 className="h-4 w-4 mr-1" />
          Waitlisted
        </Button>
      )
    }

    if (registrationStatus === 'pending') {
      return (
        <Button size="sm" variant="outline" disabled>
          <Clock className="h-4 w-4 mr-1" />
          Pending
        </Button>
      )
    }

    const currentAttendees = getCurrentAttendeeCount()
    const isEventFull = event.max_attendees && currentAttendees >= event.max_attendees

    if (isEventFull && !event.waitlist_enabled) {
      return (
        <Button size="sm" disabled>
          Event Full
        </Button>
      )
    }

    return (
      <Button size="sm" onClick={handleRegister} disabled={loading}>
        {isEventFull ? 'Join Waitlist' : 'Register'}
      </Button>
    )
  }

  const renderSessions = () => {
    if (!showSessions || sessions.length === 0) return null

    return (
      <div className="mt-4">
        <h4 className="font-medium text-sm text-gray-700 mb-2">Sessions</h4>
        <div className="space-y-2">
          {sessions.slice(0, compact ? 2 : sessions.length).map((session) => (
            <div key={session.id} className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 p-2 rounded">
              <div>
                <div className="font-medium">{session.title}</div>
                <div className="text-gray-500">
                  {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                  {new Date(session.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                {session.session_type.replace('_', ' ')}
              </Badge>
            </div>
          ))}
          {compact && sessions.length > 2 && (
            <div className="text-xs text-gray-500 text-center">
              +{sessions.length - 2} more sessions
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderSpeakers = () => {
    if (!showSpeakers || speakers.length === 0) return null

    return (
      <div className="mt-4">
        <h4 className="font-medium text-sm text-gray-700 mb-2">Featured Speakers</h4>
        <div className="flex -space-x-2 overflow-hidden">
          {speakers.slice(0, compact ? 3 : 5).map((speaker) => (
            <div
              key={speaker.id}
              className="relative inline-block h-8 w-8 rounded-full ring-2 ring-white"
              title={`${speaker.name} - ${speaker.title} at ${speaker.company}`}
            >
              {speaker.avatar_url ? (
                <img
                  className="h-8 w-8 rounded-full object-cover"
                  src={speaker.avatar_url}
                  alt={speaker.name}
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-700">
                  {speaker.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
              )}
              {speaker.is_featured && (
                <Star className="absolute -top-1 -right-1 h-3 w-3 text-yellow-400 fill-current" />
              )}
            </div>
          ))}
          {speakers.length > (compact ? 3 : 5) && (
            <div className="h-8 w-8 rounded-full bg-gray-100 ring-2 ring-white flex items-center justify-center text-xs font-medium text-gray-600">
              +{speakers.length - (compact ? 3 : 5)}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <Card className={`${compact ? 'p-4' : ''} ${event.featured ? 'ring-2 ring-blue-200' : ''} hover:shadow-lg transition-shadow`}>
      <CardHeader className={`${compact ? 'pb-2' : ''}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              {renderTypeBadge()}
              {renderFormatBadge()}
              {renderStatusBadge()}
              {event.featured && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
            <CardTitle className={`${compact ? 'text-lg' : 'text-xl'}`}>{event.title}</CardTitle>
            {!compact && (
              <CardDescription className="mt-1">{event.description}</CardDescription>
            )}
          </div>
          {event.featured && (
            <div className="ml-2">
              <Star className="h-5 w-5 text-yellow-400 fill-current" />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className={`${compact ? 'pt-0' : ''}`}>
        <div className="space-y-3">
          {/* Event Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              {formatEventDateTime(event.event_date, event.end_date, event.timezone)}
            </div>
            
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              {event.event_format === 'virtual' ? 'Virtual Event' : 
               event.event_format === 'hybrid' ? `${event.location} + Virtual` : 
               event.location}
            </div>

            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              {getCurrentAttendeeCount()} / {event.max_attendees || '∞'} attendees
            </div>

            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              {getEventPrice()}
            </div>

            {event.event_format !== 'in_person' && (
              <div className="flex items-center">
                <Wifi className="h-4 w-4 mr-2" />
                {event.event_format === 'virtual' ? 'Online only' : 'In-person + Online'}
              </div>
            )}

            {event.tags && event.tags.length > 0 && (
              <div className="col-span-full">
                <div className="flex flex-wrap gap-1">
                  {event.tags.slice(0, compact ? 3 : event.tags.length).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {compact && event.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{event.tags.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Waitlist Info */}
          {event.waitlist_enabled && getCurrentAttendeeCount() >= event.max_attendees && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-center">
                <Clock3 className="h-4 w-4 text-orange-600 mr-2" />
                <span className="text-sm text-orange-800">
                  Event is full. Join the waitlist to be notified if spots become available.
                </span>
              </div>
            </div>
          )}

          {/* Virtual Event Info */}
          {event.event_format !== 'in_person' && event.virtual_meeting_url && isRegistered && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Video className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-sm text-blue-800">Virtual meeting details available</span>
                </div>
                <Button size="sm" variant="outline" onClick={() => window.open(event.virtual_meeting_url, '_blank')}>
                  Join Meeting
                </Button>
              </div>
            </div>
          )}

          {/* Sessions */}
          {renderSessions()}

          {/* Speakers */}
          {renderSpeakers()}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="ghost" onClick={handleLike}>
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button size="sm" variant="ghost" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
              {event.check_in_enabled && (
                <Button size="sm" variant="ghost" title="Generate Check-in QR">
                  <QrCode className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {event.max_attendees && getCurrentAttendeeCount() >= event.max_attendees && !event.waitlist_enabled ? (
                <span className="text-sm text-gray-500">Event Full</span>
              ) : (
                <span className="text-sm text-gray-500">
                  {event.max_attendees ? event.max_attendees - getCurrentAttendeeCount() : '∞'} spots remaining
                </span>
              )}
              {renderRegistrationButton()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 