import React from 'react'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { spotlightApi, type Spotlight } from '@/lib/supabase'
import { Star, Calendar, Eye, ThumbsUp, Share2, Plus } from 'lucide-react'

export function Spotlights() {
  const { currentBusiness, currentChamber } = useAuth()
  const [spotlights, setSpotlights] = useState<Spotlight[]>([])
  const [loading, setLoading] = useState(true)

  // Get chamber ID from current user context
  const chamberId = currentChamber?.id || currentBusiness?.chamber_id

  useEffect(() => {
    const fetchSpotlights = async () => {
      if (!chamberId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const spotlightData = await spotlightApi.getSpotlightsByChamber(chamberId)
        setSpotlights(spotlightData)
      } catch (error) {
        console.error('Error fetching spotlights:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSpotlights()
  }, [chamberId])

  if (!chamberId) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Chamber Access</h2>
          <p className="text-gray-600">Please contact your chamber administrator for access.</p>
        </div>
      </Layout>
    )
  }

  const spotlightStats = [
    { label: 'Total Spotlights', value: spotlights.length.toString(), description: 'published' },
    { label: 'Total Views', value: spotlights.reduce((sum, s) => sum + s.views, 0).toString(), description: 'across all spotlights' },
    { label: 'Average Engagement', value: '85%', description: 'member interaction rate' },
    { label: 'Total Likes', value: spotlights.reduce((sum, s) => sum + s.likes, 0).toString(), description: 'total likes' }
  ]

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Business Spotlights</h1>
            <p className="text-gray-600 mt-2">
              Celebrating our chamber members and their success stories
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Spotlight
            </Button>
          </div>
        </div>

        {/* Spotlight Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {spotlightStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-2" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-xs text-gray-500">{stat.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Featured Spotlights */}
        {spotlights.filter(spotlight => spotlight.featured).length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Featured Spotlights</h2>
              <Badge className="bg-yellow-100 text-yellow-800">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {spotlights.filter(spotlight => spotlight.featured).map((spotlight) => (
                <Card key={spotlight.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={spotlight.business.avatar} />
                          <AvatarFallback>
                            {spotlight.business.contactName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{spotlight.title}</CardTitle>
                          <CardDescription>
                            <span className="font-medium">{spotlight.business?.name}</span>
                            <span className="text-gray-400 mx-2">•</span>
                            <span>{spotlight.business?.category}</span>
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{spotlight.description}</p>
                    <p className="text-sm text-gray-700 mb-4 line-clamp-3">{spotlight.content}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(spotlight.published_date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          {spotlight.views}
                        </div>
                        <div className="flex items-center">
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          {spotlight.likes}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Share2 className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                        <Button size="sm">
                          Read More
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Spotlights */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading spotlights...</p>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">All Spotlights</h2>
            <div className="space-y-6">
              {spotlights.map((spotlight) => (
                <Card key={spotlight.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={spotlight.business?.contact_avatar_url} />
                        <AvatarFallback>
                          {spotlight.business?.contact_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{spotlight.title}</h3>
                            <div className="flex items-center space-x-2 mb-3">
                              <span className="font-medium text-gray-700">{spotlight.business?.name}</span>
                              <span className="text-gray-400">•</span>
                              <Badge variant="secondary">{spotlight.business?.category}</Badge>
                              {spotlight.featured && (
                                <>
                                  <span className="text-gray-400">•</span>
                                  <Badge className="bg-yellow-100 text-yellow-800">
                                    <Star className="h-3 w-3 mr-1" />
                                    Featured
                                  </Badge>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-600 mb-4">{spotlight.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-6 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(spotlight.published_date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center">
                              <Eye className="h-4 w-4 mr-1" />
                              {spotlight.views} views
                            </div>
                            <div className="flex items-center">
                              <ThumbsUp className="h-4 w-4 mr-1" />
                              {spotlight.likes} likes
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <Share2 className="h-4 w-4 mr-1" />
                              Share
                            </Button>
                            <Button size="sm">
                              Read More
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}