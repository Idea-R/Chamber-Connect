import React, { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Mail, Lock, ArrowLeft, Users, MapPin, Phone } from 'lucide-react'

export function MemberLogin() {
  const navigate = useNavigate()
  const { chamberSlug } = useParams()
  const auth = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Mock chamber data - in real app, this would be fetched based on chamberSlug
  const chamberInfo = {
    name: 'Springfield Chamber of Commerce',
    city: 'Springfield',
    state: 'IL',
    logo: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400',
    phone: '(555) 123-4567',
    website: 'springfieldchamber.org',
    memberCount: 247,
    primaryColor: '#2563eb'
  }

  // Handle case where auth context is not available
  if (!auth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  const { signIn } = auth

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const result = await signIn(email, password)
      
      if (result.error) {
        console.error('Login error:', result.error)
        alert(result.error.message || 'Login failed. Please check your credentials.')
        setIsLoading(false)
      } else {
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Login error:', error)
      alert('An unexpected error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setIsLoading(true)
    try {
      // Demo login with sample business data
      const result = await signIn('sarah@techflowsolutions.com', 'demo123')
      
      if (result.error) {
        console.error('Demo login error:', result.error)
        alert('Demo login failed. Please try the regular login.')
        setIsLoading(false)
      } else {
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Demo login error:', error)
      alert('Demo login failed. Please try the regular login.')
      setIsLoading(false)
    }
  }

  const handleSignupRequest = () => {
    // In real app, this would open a modal or redirect to a signup request form
    alert('Signup request sent to chamber administrators!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chamber Info */}
          <div className="flex flex-col justify-center">
            <div className="text-center lg:text-left mb-8">
              <Link to="/" className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-6">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Chamber Connect</span>
              </Link>
              
              <div className="flex items-center justify-center lg:justify-start mb-6">
                <img 
                  src={chamberInfo.logo} 
                  alt={`${chamberInfo.name} logo`}
                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                />
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{chamberInfo.name}</h1>
              <p className="text-gray-600 text-lg mb-6">Member Portal</p>
              
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center justify-center lg:justify-start space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>{chamberInfo.city}, {chamberInfo.state}</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>{chamberInfo.phone}</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start space-x-2">
                  <Users className="h-4 w-4" />
                  <span>{chamberInfo.memberCount} active members</span>
                </div>
              </div>
            </div>

            <Card className="shadow-lg bg-blue-50 border-blue-200 lg:block hidden">
              <CardContent className="p-6">
                <h3 className="font-semibold text-blue-900 mb-3">Chamber Connect Benefits</h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                    <span>Network with local business owners</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                    <span>QR code networking at events</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                    <span>Direct messaging and referrals</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                    <span>Business spotlight opportunities</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Login Form */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-center text-2xl">Member Sign In</CardTitle>
              <CardDescription className="text-center">
                Access your {chamberInfo.name} member portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="your@business.com"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-600">Remember me</span>
                  </label>
                  <Link
                    to={`/${chamberSlug}/forgot-password`}
                    className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full py-3 text-base"
                  disabled={isLoading}
                  style={{ backgroundColor: chamberInfo.primaryColor }}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              <div className="mt-8 space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    Not a member yet?
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleSignupRequest}
                    className="w-full"
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    Request Chamber Membership
                  </Button>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                    <p className="text-sm text-amber-800 text-center">
                      <strong>Members Only:</strong> This portal is exclusively for {chamberInfo.name} members. 
                      Contact the chamber office to join.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}