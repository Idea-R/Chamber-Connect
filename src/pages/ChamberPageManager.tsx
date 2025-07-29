import React, { useState } from 'react'
import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { chamberApi, type Chamber } from '@/lib/supabase'
import { Globe, Eye, Save, Upload, MapPin, Phone, Mail, ExternalLink, Users, Calendar, Star, Image as ImageIcon } from 'lucide-react'

export function ChamberPageManager() {
  const { currentChamber } = useAuth()
  const [chamber, setChamber] = useState<Chamber | null>(null)
  const [activeTab, setActiveTab] = useState('basic')
  const [isSaving, setIsSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  // Get chamber from current user context
  const chamberSlug = currentChamber?.slug

  useEffect(() => {
    const fetchChamberData = async () => {
      if (!chamberSlug) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const chamberData = await chamberApi.getChamberBySlug(chamberSlug)
        if (chamberData) {
          setChamber(chamberData)
        }
      } catch (error) {
        console.error('Error fetching chamber data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchChamberData()
  }, [chamberSlug])

  if (!currentChamber) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Chamber Admin Access Required</h2>
          <p className="text-gray-600">You need chamber administrator privileges to access this page.</p>
        </div>
      </Layout>
    )
  }

  const handleInputChange = (field: string, value: any) => {
    if (!chamber) return
    
    setChamber(prev => {
      if (!prev) return prev
      return {
        ...prev,
        [field]: value
      }
    })
  }

  const handleArrayChange = (field: string, index: number, value: string) => {
    if (!chamber) return
    
    setChamber(prev => {
      if (!prev) return prev
      const currentArray = prev[field as keyof Chamber] as string[]
      return {
        ...prev,
        [field]: currentArray.map((item: string, i: number) => 
          i === index ? value : item
        )
      }
    })
  }

  const addArrayItem = (field: string) => {
    if (!chamber) return
    
    setChamber(prev => {
      if (!prev) return prev
      const currentArray = prev[field as keyof Chamber] as string[]
      return {
        ...prev,
        [field]: [...currentArray, '']
      }
    })
  }

  const removeArrayItem = (field: string, index: number) => {
    if (!chamber) return
    
    setChamber(prev => {
      if (!prev) return prev
      const currentArray = prev[field as keyof Chamber] as string[]
      return {
        ...prev,
        [field]: currentArray.filter((_: any, i: number) => i !== index)
      }
    })
  }

  const handleSave = async () => {
    if (!chamber) return
    
    setIsSaving(true)
    try {
      const updatedChamber = await chamberApi.updateChamber(chamber.id, chamber)
      if (updatedChamber) {
        setChamber(updatedChamber)
        console.log('Chamber data saved successfully')
      }
    } catch (error) {
      console.error('Error saving chamber data:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const tabs = [
    { id: 'basic', name: 'Basic Info', icon: Globe },
    { id: 'content', name: 'Content', icon: Star },
    { id: 'images', name: 'Images', icon: ImageIcon },
    { id: 'settings', name: 'Settings', icon: Users }
  ]

  return (
    <Layout>
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading chamber data...</p>
        </div>
      ) : !chamber ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Chamber not found</p>
        </div>
      ) : (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Chamber Page</h1>
            <p className="text-gray-600 mt-1">
              Customize your chamber's public-facing page
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" asChild>
              <a href="/chambers/springfield-chamber" target="_blank" rel="noopener noreferrer">
                <Eye className="h-4 w-4 mr-2" />
                Preview Page
              </a>
            </Button>
            <Button onClick={handleSave} disabled={isSaving} size="sm">
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* Page URL Display */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Globe className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">Your Chamber Page URL</p>
                <p className="text-blue-700 mt-1">
                  <span className="font-mono">chamberconnect.com/chambers/{chamber.slug}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-white rounded-t-lg">
          <nav className="-mb-px flex space-x-8 px-6 pt-4">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          <div className="xl:col-span-3">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Basic Information</CardTitle>
                  <CardDescription>
                    Essential details about your chamber
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Chamber Name
                    </label>
                    <input
                      type="text"
                      value={chamber.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Tagline
                    </label>
                    <input
                      type="text"
                      value={chamber.tagline}
                      onChange={(e) => handleInputChange('tagline', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="A short, compelling tagline"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Description
                    </label>
                    <textarea
                      value={chamber.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                      placeholder="Brief description of your chamber"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Address
                      </label>
                      <input
                        type="text"
                        value={chamber.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={chamber.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Email
                      </label>
                      <input
                        type="email"
                        value={chamber.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Website
                      </label>
                      <input
                        type="url"
                        value={chamber.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Content Tab */}
            {activeTab === 'content' && (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Content Sections</CardTitle>
                  <CardDescription>
                    Customize the content displayed on your chamber page
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      About Section
                    </label>
                    <textarea
                      value={chamber.about_section}
                      onChange={(e) => handleInputChange('about_section', e.target.value)}
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                      placeholder="Tell visitors about your chamber's mission and history"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Services Offered
                    </label>
                    <div className="space-y-3">
                      {chamber.services_offered.map((service, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <input
                            type="text"
                            value={service}
                            onChange={(e) => handleArrayChange('services_offered', index, e.target.value)}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder="Service description"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeArrayItem('services_offered', index)}
                            className="px-3 py-2"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={() => addArrayItem('services_offered')}
                        className="w-full mt-2"
                      >
                        Add Service
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Member Count
                      </label>
                      <input
                        type="number"
                        value={chamber.member_count}
                        onChange={(e) => handleInputChange('member_count', parseInt(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Events/Month
                      </label>
                      <input
                        type="number"
                        value={chamber.events_per_month}
                        onChange={(e) => handleInputChange('events_per_month', parseInt(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Years Serving
                      </label>
                      <input
                        type="number"
                        value={chamber.years_serving}
                        onChange={(e) => handleInputChange('years_serving', parseInt(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Images Tab */}
            {activeTab === 'images' && (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Images & Branding</CardTitle>
                  <CardDescription>
                    Upload and manage images for your chamber page
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-4">
                      Hero Image
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-gray-400 transition-colors">
                      <div className="text-center">
                        <img
                          src={chamber.hero_image_url}
                          alt="Hero"
                          className="mx-auto h-40 w-full object-cover rounded-lg mb-6 shadow-sm"
                        />
                        <Button variant="outline" className="mb-3">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload New Hero Image
                        </Button>
                        <p className="text-sm text-gray-500">
                          Recommended: 1200x600px, JPG or PNG
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-4">
                      Chamber Logo
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-gray-400 transition-colors">
                      <div className="text-center">
                        <img
                          src={chamber.logo_url}
                          alt="Logo"
                          className="mx-auto h-24 w-24 object-cover rounded-full mb-6 shadow-sm"
                        />
                        <Button variant="outline" className="mb-3">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload New Logo
                        </Button>
                        <p className="text-sm text-gray-500">
                          Recommended: 400x400px, PNG with transparent background
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Page Settings</CardTitle>
                  <CardDescription>
                    Configure what appears on your public chamber page
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">Show Member Count</h4>
                        <p className="text-sm text-gray-500">Display the number of chamber members</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={chamber.settings.showMemberCount || false}
                        onChange={(e) => handleInputChange('settings', { ...chamber.settings, showMemberCount: e.target.checked })}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">Show Upcoming Events</h4>
                        <p className="text-sm text-gray-500">Display upcoming chamber events</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={chamber.settings.showUpcomingEvents || false}
                        onChange={(e) => handleInputChange('settings', { ...chamber.settings, showUpcomingEvents: e.target.checked })}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">Show Member Spotlight</h4>
                        <p className="text-sm text-gray-500">Feature highlighted chamber members</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={chamber.settings.showMemberSpotlight || false}
                        onChange={(e) => handleInputChange('settings', { ...chamber.settings, showMemberSpotlight: e.target.checked })}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">Allow Member Signup</h4>
                        <p className="text-sm text-gray-500">Show "Join Chamber" button for visitors</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={chamber.settings.allowMemberSignup || false}
                        onChange={(e) => handleInputChange('settings', { ...chamber.settings, allowMemberSignup: e.target.checked })}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-6">Social Media Links</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
                        <input
                          type="url"
                          value={chamber.social_media.facebook || ''}
                          onChange={(e) => handleInputChange('social_media', { ...chamber.social_media, facebook: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="https://facebook.com/yourchamber"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
                        <input
                          type="url"
                          value={chamber.social_media.twitter || ''}
                          onChange={(e) => handleInputChange('social_media', { ...chamber.social_media, twitter: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="https://twitter.com/yourchamber"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                        <input
                          type="url"
                          value={chamber.social_media.linkedin || ''}
                          onChange={(e) => handleInputChange('social_media', { ...chamber.social_media, linkedin: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="https://linkedin.com/company/yourchamber"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Preview Sidebar */}
          <div className="space-y-8">
            <Card className="shadow-lg sticky top-6">
              <CardHeader>
                <CardTitle className="text-xl">Live Preview</CardTitle>
                <CardDescription>
                  See how your changes will appear
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden shadow-sm">
                    <img
                      src={chamber.hero_image_url}
                      alt="Hero preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-center px-2">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{chamber.name}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{chamber.tagline}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center bg-gray-50 rounded-lg p-4">
                    <div className="space-y-1">
                      <p className="font-bold text-xl text-blue-600">{chamber.member_count}</p>
                      <p className="text-xs text-gray-600 font-medium">Members</p>
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-xl text-blue-600">{chamber.events_per_month}</p>
                      <p className="text-xs text-gray-600 font-medium">Events/Mo</p>
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-xl text-blue-600">{chamber.years_serving}</p>
                      <p className="text-xs text-gray-600 font-medium">Years</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Button variant="outline" className="w-full justify-start h-12" asChild>
                    <a href={`/chambers/${chamber.slug}`} target="_blank" rel="noopener noreferrer">
                      <Eye className="h-4 w-4 mr-2" />
                      View Public Page
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full justify-start h-12">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Share Page Link
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      )}
    </Layout>
  )
}

export default ChamberPageManager