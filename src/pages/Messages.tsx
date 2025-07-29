import React from 'react'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { messageApi } from '@/lib/supabase'
import { MessageSquare, Send, Search, Plus, MoreHorizontal, X, Paperclip, Smile } from 'lucide-react'

export function Messages() {
  const { currentBusiness } = useAuth()
  const [selectedConversation, setSelectedConversation] = useState('1')
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewMessageModal, setShowNewMessageModal] = useState(false)
  const [conversations, setConversations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Get business ID from current user context
  const currentBusinessId = currentBusiness?.id

  useEffect(() => {
    const fetchConversations = async () => {
      if (!currentBusinessId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const conversationData = await messageApi.getConversations(currentBusinessId)
        setConversations(conversationData)
        if (conversationData.length > 0) {
          setSelectedConversation(conversationData[0].id)
        }
      } catch (error) {
        console.error('Error fetching conversations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchConversations()
  }, [currentBusinessId])

  if (!currentBusinessId) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Business Profile Required</h2>
          <p className="text-gray-600">You need a business profile to access messaging features.</p>
        </div>
      </Layout>
    )
  }

  const currentConversation = conversations.find(c => c.id === selectedConversation) || conversations[0] || null
  
  const messages = [
    {
      id: '1',
      sender: 'Sarah Johnson',
      content: 'Hi! I wanted to thank you for connecting me with that potential client.',
      timestamp: '10:30 AM',
      isOwn: false
    },
    {
      id: '2',
      sender: 'You',
      content: 'No problem! I thought you two would be a great match. Did you get a chance to speak with them?',
      timestamp: '10:35 AM',
      isOwn: true
    },
    {
      id: '3',
      sender: 'Sarah Johnson',
      content: 'Yes, we had a great conversation yesterday. They\'re very interested in our digital marketing services.',
      timestamp: '10:40 AM',
      isOwn: false
    },
    {
      id: '4',
      sender: 'You',
      content: 'That\'s fantastic! I knew you\'d be able to help them.',
      timestamp: '10:42 AM',
      isOwn: true
    },
    {
      id: '5',
      sender: 'Sarah Johnson',
      content: 'Thanks for the referral! I\'ll follow up with them tomorrow.',
      timestamp: '10:45 AM',
      isOwn: false
    }
  ]

  const filteredConversations = conversations.filter(conv =>
    conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.participant.business.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim()) {
      console.log('Sending message:', newMessage)
      // In a real app, this would send the message
      setNewMessage('')
    }
  }

  const handleNewMessage = () => {
    setShowNewMessageModal(true)
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600 mt-2">
              Communicate with chamber members and manage your business connections
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button onClick={handleNewMessage}>
              <Plus className="h-4 w-4 mr-2" />
              New Message
            </Button>
          </div>
        </div>

        {/* Messages Interface */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading conversations...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
            {/* Conversations List */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Conversations</span>
                  <Badge variant="secondary">{conversations.length}</Badge>
                </CardTitle>
                <CardDescription>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search conversations..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation.id)}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        conversation.id === selectedConversation ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={conversation.participant.avatar} />
                            <AvatarFallback>
                              {conversation.participant.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          {conversation.participant.online && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {conversation.participant.name}
                            </p>
                            <div className="flex items-center space-x-1">
                              {conversation.unread > 0 && (
                                <Badge variant="default" className="text-xs">
                                  {conversation.unread}
                                </Badge>
                              )}
                              <span className="text-xs text-gray-500">{conversation.timestamp}</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 truncate">{conversation.participant.business}</p>
                          <p className="text-sm text-gray-600 truncate mt-1">{conversation.lastMessage}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Current Conversation */}
            <Card className="lg:col-span-2">
              {currentConversation ? (
                <>
                  <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={currentConversation.participant.avatar} />
                          <AvatarFallback>
                            {currentConversation.participant.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium text-gray-900">{currentConversation.participant.name}</h3>
                          <p className="text-sm text-gray-500">{currentConversation.participant.business}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-64">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.isOwn
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${message.isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                              {message.timestamp}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Message Input */}
                    <div className="border-t p-4">
                      <form onSubmit={handleSendMessage}>
                        <div className="flex items-center space-x-2">
                          <Button type="button" variant="ghost" size="icon">
                            <Paperclip className="h-4 w-4" />
                          </Button>
                          <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <Button type="button" variant="ghost" size="icon">
                            <Smile className="h-4 w-4" />
                          </Button>
                          <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </form>
                    </div>
                  </CardContent>
                </>
              ) : (
                <CardContent className="p-8">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Conversations</h3>
                    <p className="text-gray-600 mb-4">
                      {conversations.length === 0 
                        ? "You don't have any conversations yet. Start by sending a message to a chamber member."
                        : "Select a conversation from the list to view messages."
                      }
                    </p>
                    <Button onClick={handleNewMessage}>
                      <Plus className="h-4 w-4 mr-2" />
                      Start New Conversation
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        )}

        {/* Message Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MessageSquare className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{conversations.length}</p>
                  <p className="text-sm text-gray-600">Total Conversations</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Badge className="bg-green-100 text-green-800 mr-3">Active</Badge>
                <div>
                  <p className="text-2xl font-bold text-gray-900">8</p>
                  <p className="text-sm text-gray-600">Active Conversations</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Badge className="bg-yellow-100 text-yellow-800 mr-3">Referrals</Badge>
                <div>
                  <p className="text-2xl font-bold text-gray-900">12</p>
                  <p className="text-sm text-gray-600">Referral Discussions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* New Message Modal */}
        {showNewMessageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">New Message</h3>
                <button
                  onClick={() => setShowNewMessageModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Select a member...</option>
                    {conversations.map(conv => (
                      <option key={conv.id} value={conv.participant.name}>
                        {conv.participant.name} - {conv.participant.business}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter subject"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Type your message..."
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewMessageModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
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

export default Messages