import React from 'react'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MapPin, Phone, Mail, ExternalLink, MessageSquare, Heart, Share2 } from 'lucide-react'

interface BusinessCardProps {
  business: {
    id: string
    name: string
    description: string
    category: string
    address: string
    phone: string
    email: string
    website: string
    contactName: string
    contactAvatar: string
    memberSince: string
    featured: boolean
  }
  onConnect?: () => void
  onMessage?: () => void
}

export function BusinessCard({ business, onConnect, onMessage }: BusinessCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  const handleConnect = () => {
    setIsConnected(!isConnected)
    onConnect?.()
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: business.name,
          text: business.description,
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
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={business.contactAvatar} />
              <AvatarFallback>{business.contactName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{business.name}</CardTitle>
              <CardDescription className="text-sm text-gray-600">{business.contactName}</CardDescription>
            </div>
          </div>
          {business.featured && (
            <Badge variant="default" className="bg-yellow-500">Featured</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Badge variant="secondary">{business.category}</Badge>
            <p className="text-sm text-gray-600 mt-2">{business.description}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              {business.address}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="h-4 w-4 mr-2" />
              {business.phone}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="h-4 w-4 mr-2" />
              {business.email}
            </div>
            {business.website && (
              <div className="flex items-center text-sm text-gray-600">
                <ExternalLink className="h-4 w-4 mr-2" />
                <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Visit Website
                </a>
              </div>
            )}
          </div>

          <div className="flex space-x-2 pt-4">
            <Button 
              size="sm" 
              onClick={handleConnect} 
              className="flex-1"
              variant={isConnected ? "secondary" : "default"}
            >
              {isConnected ? 'Connected' : 'Connect'}
            </Button>
            <Button size="sm" variant="outline" onClick={onMessage}>
              <MessageSquare className="h-4 w-4 mr-1" />
              Message
            </Button>
            <Button size="sm" variant="ghost" onClick={handleLike}>
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button size="sm" variant="ghost" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}