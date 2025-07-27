import React from 'react'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Users, Clock, Heart, Share2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface EventCardProps {
  event: {
    id: string
    title: string
    description: string
    date: Date
    location: string
    type: 'networking' | 'workshop' | 'seminar' | 'social'
    attendees: number
    maxAttendees: number
    price: number
    organizer: string
    featured: boolean
  }
  onRSVP?: () => void
}

export function EventCard({ event, onRSVP }: EventCardProps) {
  const [isRSVPed, setIsRSVPed] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  const typeColors = {
    networking: 'bg-blue-100 text-blue-800',
    workshop: 'bg-green-100 text-green-800',
    seminar: 'bg-purple-100 text-purple-800',
    social: 'bg-orange-100 text-orange-800'
  }

  const handleRSVP = () => {
    setIsRSVPed(!isRSVPed)
    onRSVP?.()
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: window.location.href
        })
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{event.title}</CardTitle>
            <CardDescription className="text-sm text-gray-600 mt-1">
              Organized by {event.organizer}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <Badge className={typeColors[event.type]}>
              {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
            </Badge>
            {event.featured && (
              <Badge variant="default" className="bg-yellow-500">Featured</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">{event.description}</p>
          
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              {formatDate(event.date)}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              {event.location}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Users className="h-4 w-4 mr-2" />
              {event.attendees} / {event.maxAttendees} attendees
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              {event.price === 0 ? 'Free' : `$${event.price}`}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-gray-500">
              {event.maxAttendees - event.attendees} spots remaining
            </div>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="ghost" onClick={handleLike}>
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button size="sm" variant="ghost" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                onClick={handleRSVP}
                variant={isRSVPed ? "secondary" : "default"}
              >
                {isRSVPed ? 'RSVP\'d' : 'RSVP'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}