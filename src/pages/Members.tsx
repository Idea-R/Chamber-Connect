import React from 'react'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Layout } from '@/components/layout/Layout'
import { BusinessCard } from '@/components/business/BusinessCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { businessApi, type Business } from '@/lib/supabase'
import { Users, Search, Filter, Star, X, Mail } from 'lucide-react'

export function Members() {
  const { currentBusiness, currentChamber } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [members, setMembers] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)

  // Get chamber ID from current user context
  const chamberId = currentChamber?.id || currentBusiness?.chamber_id

  useEffect(() => {
    const fetchMembers = async () => {
      if (!chamberId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const businessData = await businessApi.getBusinessesByChamber(chamberId)
        setMembers(businessData)
      } catch (error) {
        console.error('Error fetching members:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMembers()
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

  const memberStats = [
    { label: 'Total Members', value: members.length.toString(), description: 'active businesses' },
    { label: 'New This Month', value: '12', description: 'new members' },
    { label: 'Categories', value: new Set(members.map(m => m.category)).size.toString(), description: 'business types' },
    { label: 'Connections Made', value: '1,234', description: 'this quarter' }
  ]

  const categories = [
    'All Categories',
    ...Array.from(new Set(members.map(m => m.category))).filter(Boolean)
  ]

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.contact_name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All Categories' || member.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleInviteMember = () => {
    setShowInviteModal(true)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Search is handled by the filter effect above
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Members</h1>
            <p className="text-gray-600 mt-2">
              Connect with fellow chamber members and grow your business network
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button onClick={handleInviteMember}>
              <Users className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          </div>
        </div>

        {/* Member Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {memberStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-gray-400 mr-2" />
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

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Find Members</CardTitle>
            <CardDescription>Search and filter chamber members by category or business name</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <form onSubmit={handleSearch} className="relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search members..."
                      className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </form>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Featured Members */}
        {filteredMembers.filter(member => member.featured).length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Featured Members</h2>
              <Badge className="bg-yellow-100 text-yellow-800">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMembers.filter(member => member.featured).map((member) => (
                <BusinessCard 
                  key={member.id}
                  business={{
                    id: member.id,
                    name: member.name,
                    description: member.description,
                    category: member.category,
                    address: member.address,
                    phone: member.phone,
                    email: member.email,
                    website: member.website,
                    contactName: member.contact_name,
                    contactAvatar: member.contact_avatar_url,
                    memberSince: new Date(member.member_since).getFullYear().toString(),
                    featured: member.featured
                  }}
                  onConnect={() => console.log('Connect clicked for', member.name)}
                  onMessage={() => console.log('Message clicked for', member.name)}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Members */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading members...</p>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">All Members</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMembers.map((member) => (
                <BusinessCard 
                  key={member.id}
                  business={{
                    id: member.id,
                    name: member.name,
                    description: member.description,
                    category: member.category,
                    address: member.address,
                    phone: member.phone,
                    email: member.email,
                    website: member.website,
                    contactName: member.contact_name,
                    contactAvatar: member.contact_avatar_url,
                    memberSince: new Date(member.member_since).getFullYear().toString(),
                    featured: member.featured
                  }}
                  onConnect={() => console.log('Connect clicked for', member.name)}
                  onMessage={() => console.log('Message clicked for', member.name)}
                />
              ))}
            </div>
            {filteredMembers.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No members found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
              </div>
            )}
          </div>
        )}

        {/* Invite Member Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Invite New Member</h3>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter business name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="contact@business.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter contact name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Personal Message (Optional)</label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add a personal message to the invitation..."
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowInviteModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Invite
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}