import React from 'react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Layout } from '@/components/layout/Layout'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { BusinessCard } from '@/components/business/BusinessCard'
import { EventCard } from '@/components/events/EventCard'
import { QRCodeDisplay } from '@/components/qr/QRCodeDisplay'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { businessApi, eventApi, spotlightApi, type Business, type Event, type Spotlight } from '@/lib/supabase'
import { Users, Calendar, MessageSquare, TrendingUp, Star, Plus } from 'lucide-react'

export function Dashboard() {
  const navigate = useNavigate()
  const { currentBusiness, currentChamber, userChambers } = useAuth()
  const [selectedTimeframe, setSelectedTimeframe] = useState('month')
  const [featuredBusiness, setFeaturedBusiness] = useState<Business | null>(null)
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  // Get chamber ID from current user context
  const chamberId = currentChamber?.id || currentBusiness?.chamber_id || userChambers[0]?.chamber_id

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!chamberId) {
        console.log('No chamber ID available, skipping data fetch')
        setLoading(false)
        return
      }

      console.log('Fetching dashboard data for chamber:', chamberId)
      
      try {
        setLoading(true)
        
        // Fetch featured businesses
        const featuredBusinesses = await businessApi.getFeaturedBusinesses(chamberId)
        console.log('Featured businesses:', featuredBusinesses)
        if (featuredBusinesses.length > 0) {
          setFeaturedBusiness(featuredBusinesses[0])
        }
        
        // Fetch upcoming events
        const events = await eventApi.getEventsByChamber(chamberId)
        console.log('Events:', events)
        setUpcomingEvents(events.slice(0, 2)) // Show first 2 events
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [chamberId])

  // Show loading if no chamber context yet
  if (!chamberId && !loading && userChambers.length === 0) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Chamber Connect</h2>
          <p className="text-gray-600 mb-4">Please complete your profile setup to access the dashboard.</p>
          <p className="text-gray-500 text-sm">
            You need to be a member of a chamber or create your own chamber to get started.
          </p>
        </div>
      </Layout>
    )
  }

  const stats = [
    {
      title: 'Total Members',
      value: '247',
      description: 'from last month',
      icon: Users,
      trend: '+12%'
    },
    {
      title: 'Upcoming Events',
      value: '8',
      description: 'this month',
      icon: Calendar,
      trend: '+3'
    },
    {
      title: 'New Connections',
      value: '34',
      description: 'this week',
      icon: MessageSquare,
      trend: '+18%'
    },
    {
      title: 'Active Referrals',
      value: '16',
      description: 'in progress',
      icon: TrendingUp,
      trend: '+4'
    }
  ]

  const recentActivity = [
    {
      id: '1',
      type: 'connection',
      message: 'John Smith connected with Sarah Johnson',
      time: '2 hours ago',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: '2',
      type: 'event',
      message: 'New event: Digital Marketing Workshop',
      time: '4 hours ago',
      avatar: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: '3',
      type: 'referral',
      message: 'Mike Davis referred a customer to TechFlow Solutions',
      time: '1 day ago',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ]

  const handleCreateEvent = () => {
    navigate('/events')
  }

  const handleViewAllEvents = () => {
    navigate('/events')
  }

  const handleBrowseMembers = () => {
    navigate('/members')
  }

  const handleSendMessage = () => {
    navigate('/messages')
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                Welcome back, {currentBusiness?.contact_name || currentChamber?.name || 'User'}!
              </h1>
              <p className="text-blue-100">
                Here's what's happening in {currentChamber?.name || userChambers[0]?.chamber?.name || 'your chamber'} today
              </p>
              {userChambers.length > 1 && (
                <p className="text-blue-200 text-sm mt-1">
                  You're a member of {userChambers.length} chambers
                </p>
              )}
            </div>
            <div className="hidden md:block">
              <Button 
                variant="outline" 
                className="bg-white text-blue-600 hover:bg-gray-50"
                onClick={handleCreateEvent}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Analytics Overview</h2>
          <select 
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="xl:col-span-2 space-y-8">
            {/* Featured Business */}
            {featuredBusiness && (
              <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Business Spotlight</h2>
                <Badge className="bg-yellow-100 text-yellow-800">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              </div>
              <BusinessCard 
                business={{
                  id: featuredBusiness.id,
                  name: featuredBusiness.name,
                  description: featuredBusiness.description,
                  category: featuredBusiness.category,
                  address: featuredBusiness.address,
                  phone: featuredBusiness.phone,
                  email: featuredBusiness.email,
                  website: featuredBusiness.website,
                  contactName: featuredBusiness.contact_name,
                  contactAvatar: featuredBusiness.contact_avatar_url,
                  memberSince: new Date(featuredBusiness.member_since).getFullYear().toString(),
                  featured: featuredBusiness.featured
                }}
                onConnect={() => console.log('Connect clicked')}
                onMessage={() => console.log('Message clicked')}
              />
            </div>
            )}

            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
              <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
                <Button variant="outline" size="sm" onClick={handleViewAllEvents}>
                  View All Events
                </Button>
              </div>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <EventCard 
                    key={event.id}
                    event={{
                      id: event.id,
                      title: event.title,
                      description: event.description,
                      date: new Date(event.event_date),
                      location: event.location,
                      type: event.type,
                      attendees: event.attendee_count || 0,
                      maxAttendees: event.max_attendees,
                      price: event.price,
                      organizer: event.organizer?.name || 'Chamber of Commerce',
                      featured: event.featured
                    }}
                    onRSVP={() => console.log('RSVP clicked')}
                  />
                ))}
              </div>
            </div>
            )}

            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading dashboard data...</p>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* QR Code */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Your QR Code</h2>
              <QRCodeDisplay />
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <CardDescription>Latest chamber networking activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <img 
                        src={activity.avatar} 
                        alt=""
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full justify-start" onClick={handleBrowseMembers}>
                    <Users className="h-4 w-4 mr-2" />
                    Browse Members
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={handleCreateEvent}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Create Event
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={handleSendMessage}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}