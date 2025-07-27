import React from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Building2, Users, Mail, Lock, Eye, EyeOff, CheckCircle, Star } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

type BusinessType = 'chamber-member' | 'trial' | ''
type ChamberOption = {
  id: string
  name: string
  location: string
}

export function BusinessSignup() {
  const navigate = useNavigate()
  const auth = useAuth()
  const [businessType, setBusinessType] = useState<BusinessType>('')
  const [selectedChamber, setSelectedChamber] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Form data
  const [formData, setFormData] = useState({
    // Business Information
    businessName: '',
    email: '',
    password: '',
    confirmPassword: '',
    website: '',
    industry: '',
    description: '',
    
    // Contact Information  
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  })

  // Mock chamber data - would come from API
  const availableChambers: ChamberOption[] = [
    { id: '1', name: 'Springfield Chamber of Commerce', location: 'Springfield, IL' },
    { id: '2', name: 'Downtown Business Association', location: 'Chicago, IL' },
    { id: '3', name: 'Metro Chamber Alliance', location: 'Rockford, IL' },
  ]

  if (!auth) {
    return <div>Loading authentication...</div>
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match')
      return
    }

    setIsLoading(true)
    
    try {
      // TODO: Implement actual signup logic
      console.log('Business signup:', { businessType, selectedChamber, formData })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      alert(`Business registration successful! ${businessType === 'trial' ? 'Your trial account is now active.' : 'Pending chamber approval.'}`)
      navigate('/auth/business-login')
      
    } catch (error) {
      console.error('Signup error:', error)
      alert('Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Step 1: Choose Business Type
  if (!businessType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="mb-8">
            <Button variant="ghost" onClick={() => navigate('/auth/business-login')} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to login
            </Button>
          </div>

          <Card>
            <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
              <CardTitle className="text-2xl text-center">Register Your Business</CardTitle>
              <CardDescription className="text-green-100 text-center">
                Choose your membership type to get started
              </CardDescription>
            </CardHeader>

            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Chamber Member Option */}
                <div 
                  onClick={() => setBusinessType('chamber-member')}
                  className="p-6 border-2 border-green-200 rounded-lg cursor-pointer hover:border-green-400 hover:bg-green-50 transition-all"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <h3 className="text-xl font-semibold text-green-800">Chamber Member</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    I'm an official member of a local chamber of commerce
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Full platform access</li>
                    <li>• Verified member badge</li>
                    <li>• Event posting abilities</li>
                    <li>• Direct chamber networking</li>
                    <li>• Priority support</li>
                  </ul>
                </div>

                {/* Trial Account Option */}
                <div 
                  onClick={() => setBusinessType('trial')}
                  className="p-6 border-2 border-amber-200 rounded-lg cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-all"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <Star className="h-8 w-8 text-amber-600" />
                    <h3 className="text-xl font-semibold text-amber-800">1-Month Trial</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    I want to try the platform before joining a chamber
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• 30-day free trial</li>
                    <li>• Basic profile access</li>
                    <li>• Limited networking features</li>
                    <li>• No event posting</li>
                    <li>• Trial member badge</li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 text-center">
                <p className="text-gray-600">
                  Not sure which option is right for you? 
                  <Link to="/pricing" className="text-green-600 hover:text-green-700 ml-1">
                    View our pricing guide
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Step 2: Select Chamber (for both types)
  if (!selectedChamber) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="mb-8">
            <Button variant="ghost" onClick={() => setBusinessType('')} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to membership type
            </Button>
          </div>

          <Card>
            <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
              <CardTitle className="text-2xl text-center">Select Your Chamber</CardTitle>
              <CardDescription className="text-green-100 text-center">
                {businessType === 'chamber-member' 
                  ? 'Choose the chamber you\'re a member of'
                  : 'Choose a chamber to network with during your trial'
                }
              </CardDescription>
            </CardHeader>

            <CardContent className="p-8">
              <div className="space-y-4">
                {availableChambers.map((chamber) => (
                  <div
                    key={chamber.id}
                    onClick={() => setSelectedChamber(chamber.id)}
                    className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-green-400 hover:bg-green-50 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-800">{chamber.name}</h4>
                        <p className="text-gray-600 text-sm">{chamber.location}</p>
                      </div>
                      <Building2 className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-blue-800 text-sm">
                  <strong>Don't see your chamber?</strong> Contact us and we'll help get them set up on Chamber Connect.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Step 3: Business Information Form
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => setSelectedChamber('')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to chamber selection
          </Button>
        </div>

        <Card>
          <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl text-center">Business Information</CardTitle>
            <CardDescription className="text-green-100 text-center">
              Tell us about your business
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Business Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Business Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Business Name *</label>
                    <input
                      type="text"
                      value={formData.businessName}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Industry</label>
                    <select
                      value={formData.industry}
                      onChange={(e) => handleInputChange('industry', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select Industry</option>
                      <option value="technology">Technology</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="retail">Retail</option>
                      <option value="manufacturing">Manufacturing</option>
                      <option value="professional-services">Professional Services</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://yourbusiness.com"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Business Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    placeholder="Brief description of your business..."
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Contact Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name *</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name *</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Confirm Password *</label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700 py-3 text-lg" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 
                   businessType === 'trial' ? 'Start Free Trial' : 'Submit for Chamber Approval'}
                </Button>
                
                <p className="text-xs text-gray-600 mt-4 text-center">
                  By registering, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 