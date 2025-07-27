import React from 'react'
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { chamberApi, businessApi, eventApi, type Chamber, type Business, type Event } from '@/lib/supabase'
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  ExternalLink, 
  Users, 
  Calendar, 
  Star, 
  CheckCircle,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  ArrowRight
} from 'lucide-react'

export function PublicChamberPage() {
  const { chamberSlug } = useParams()
  const [chamber, setChamber] = useState<Chamber | null>(null)
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [featuredMembers, setFeaturedMembers] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchChamberData = async () => {
      if (!chamberSlug) return
      
      try {
        setLoading(true)
        
        // Fetch chamber data
        const chamberData = await chamberApi.getChamberBySlug(chamberSlug)
        if (!chamberData) {
          console.error('Chamber not found')
          return
        }
        setChamber(chamberData)
        
        // Fetch upcoming events
        const events = await eventApi.getEventsByChamber(chamberData.id)
        setUpcomingEvents(events.slice(0, 3)) // Show first 3 events
        
        // Fetch featured members
        const featured = await businessApi.getFeaturedBusinesses(chamberData.id)
        setFeaturedMembers(featured.slice(0, 2)) // Show first 2 featured members
        
      } catch (error) {
        console.error('Error fetching chamber data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchChamberData()
  }, [chamberSlug])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading chamber page...</p>
        </div>
      </div>
    )
  }

  if (!chamber) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Chamber Not Found</h1>
          <p className="text-gray-600">The chamber you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <img 
                src={chamber.logo_url} 
                alt={`${chamber.name} logo`}
                className="w-12 h-12 rounded-full object-cover shadow-sm"
              />
              <span className="text-2xl font-bold text-gray-900">{chamber.name}</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to={`/${chamberSlug}/member-login`}
                className="text-blue-600 hover:text-blue-700 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Member Login
              </Link>
              {chamber.settings.allowMemberSignup && (
                <Button className="px-6 py-2">
                  Join Chamber
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative">
        <div className="h-[500px] bg-gradient-to-r from-blue-600 to-indigo-600 overflow-hidden">
          <img 
            src={chamber.hero_image_url}
            alt="Chamber hero"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white max-w-5xl mx-auto px-6">
              <h1 className="text-6xl font-bold mb-6 leading-tight">{chamber.name}</h1>
              <p className="text-2xl mb-8 text-blue-100 font-medium">{chamber.tagline}</p>
              <p className="text-xl mb-12 max-w-3xl mx-auto leading-relaxed opacity-90">{chamber.description}</p>
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                {chamber.settings.allowMemberSignup && (
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-4 text-lg font-semibold shadow-lg">
                    Become a Member
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                )}
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold">
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-5xl font-bold text-blue-600 mb-4">{chamber.member_count}</div>
              <div className="text-gray-700 text-lg font-medium">Active Members</div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-5xl font-bold text-blue-600 mb-4">{chamber.events_per_month}</div>
              <div className="text-gray-700 text-lg font-medium">Events Per Month</div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-5xl font-bold text-blue-600 mb-4">{chamber.years_serving}+</div>
              <div className="text-gray-700 text-lg font-medium">Years Serving Community</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-8">About Our Chamber</h2>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">{chamber.about_section}</p>
              
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-gray-900">What We Offer</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {chamber.services_offered.map((service, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">{service}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="space-y-8">
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3 text-xl">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <span>Contact Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700 font-medium">{chamber.address}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700 font-medium">{chamber.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700 font-medium">{chamber.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <ExternalLink className="h-5 w-5 text-gray-400" />
                    <a href={chamber.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Visit Website
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* Social Media */}
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl">Follow Us</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex space-x-6">
                    {chamber.social_media.facebook && (
                      <a href={chamber.social_media.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                        <Facebook className="h-7 w-7" />
                      </a>
                    )}
                    {chamber.social_media.twitter && (
                      <a href={chamber.social_media.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-500 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                        <Twitter className="h-7 w-7" />
                      </a>
                    )}
                    {chamber.social_media.linkedin && (
                      <a href={chamber.social_media.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                        <Linkedin className="h-7 w-7" />
                      </a>
                    )}
                    {chamber.social_media.instagram && (
                      <a href={chamber.social_media.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-700 p-2 rounded-lg hover:bg-pink-50 transition-colors">
                        <Instagram className="h-7 w-7" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      {chamber.settings.showUpcomingEvents && upcomingEvents.length > 0 && (
        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Upcoming Events</h2>
              <p className="text-xl text-gray-600">Join us at our upcoming chamber events</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {upcomingEvents.map((event) => (
                <Card key={event.id} className="hover:shadow-xl transition-shadow shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl">{event.title}</CardTitle>
                    <CardDescription>
                      <div className="flex items-center space-x-2 text-sm mt-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(event.event_date).toLocaleDateString()}</span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        {event.location}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        {event.attendee_count || 0} attending
                      </div>
                    </div>
                    <Button className="w-full mt-6">
                      Learn More
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Member Spotlight */}
      {chamber.settings.showMemberSpotlight && featuredMembers.length > 0 && (
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Member Spotlight</h2>
              <p className="text-xl text-gray-600">Celebrating our outstanding chamber members</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {featuredMembers.map((member) => (
                <Card key={member.id} className="hover:shadow-xl transition-shadow shadow-lg">
                  <CardHeader>
                    <div className="flex items-center space-x-6">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={member.contact_avatar_url} />
                        <AvatarFallback>
                          {member.contact_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-2xl">{member.name}</CardTitle>
                        <CardDescription className="mt-2">
                          <Badge variant="secondary" className="text-sm">{member.category}</Badge>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-gray-600 mb-6 leading-relaxed">{member.description}</p>
                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="text-sm text-gray-500">Contact: {member.contact_name}</span>
                      <Button variant="outline">
                        Learn More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      {chamber.settings.allowMemberSignup && (
        <section className="py-24 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Join Our Chamber?</h2>
            <p className="text-2xl text-blue-100 mb-12 max-w-3xl mx-auto">
              Connect with local businesses and grow your network
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-4 text-lg font-semibold shadow-lg">
                <Building2 className="h-5 w-5 mr-2" />
                Become a Member
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold">
                Contact Us
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <img 
                  src={chamber.logo_url} 
                  alt={`${chamber.name} logo`}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="text-xl font-semibold">{chamber.name}</span>
              </div>
              <p className="text-gray-400 text-lg">{chamber.tagline}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-6 text-lg">Contact</h3>
              <div className="space-y-3 text-gray-400">
                <p>{chamber.address}</p>
                <p>{chamber.phone}</p>
                <p>{chamber.email}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-6 text-lg">Follow Us</h3>
              <div className="flex space-x-6">
                {chamber.social_media.facebook && (
                  <a href={chamber.social_media.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    <Facebook className="h-6 w-6" />
                  </a>
                )}
                {chamber.social_media.twitter && (
                  <a href={chamber.social_media.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    <Twitter className="h-6 w-6" />
                  </a>
                )}
                {chamber.social_media.linkedin && (
                  <a href={chamber.social_media.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    <Linkedin className="h-6 w-6" />
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 {chamber.name}. All rights reserved.</p>
            <p className="mt-3 text-sm">
              Powered by <span className="text-blue-400">Chamber Connect</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}