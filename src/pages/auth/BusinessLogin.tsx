import React from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Building2, Users, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export function BusinessLogin() {
  const navigate = useNavigate()
  const auth = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDemoLoading, setIsDemoLoading] = useState(false)

  if (!auth) {
    return <div>Loading authentication...</div>
  }

  const { signIn } = auth

  const handleDemoLogin = async () => {
    setIsDemoLoading(true)
    
    try {
      console.log('Demo business login attempt for sarah.johnson@demomarketing.com')
      const result = await signIn('sarah.johnson@demomarketing.com', 'demo123')
      
      if (result.error) {
        console.error('Demo business login error:', result.error)
        
        // Better error messaging for demo users
        if (result.error.message.includes('Invalid login credentials')) {
          alert(`Demo business account not yet configured. Please contact your administrator to set up demo data.
          
Expected demo account: sarah.johnson@demomarketing.com
Error: ${result.error.message}`)
        } else {
          alert(`Demo login failed: ${result.error.message || 'Unknown error'}`)
        }
      } else {
        console.log('Demo business login successful')
        // Give auth context time to update
        setTimeout(() => navigate('/dashboard'), 1000)
      }
    } catch (error) {
      console.error('Demo business login error:', error)
      alert('Demo login failed. Please try again or contact support.')
    } finally {
      setTimeout(() => setIsDemoLoading(false), 2000)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return

    setIsLoading(true)
    
    try {
      const result = await signIn(email, password)
      
      if (result.error) {
        alert(`Login failed: ${result.error.message}`)
      } else {
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Login error:', error)
      alert('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to home
          </Button>
        </div>

        <Card>
          <CardHeader className="space-y-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Building2 className="h-8 w-8" />
              <CardTitle className="text-2xl text-center">Business Owner Login</CardTitle>
            </div>
            <CardDescription className="text-green-100 text-center">
              Access your business profile and networking tools
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Business Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    placeholder="your@business.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <Link to="/auth/forgot-password" className="text-sm text-green-600 hover:text-green-700">
                  Forgot password?
                </Link>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700" 
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In to Business Portal'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">New to Chamber Connect?</span>
              </div>
            </div>

            <Link to="/auth/business-signup">
              <Button variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-50">
                Register Your Business
              </Button>
            </Link>

            <Button 
              onClick={handleDemoLogin} 
              variant="outline" 
              className="w-full border-amber-200 text-amber-700 hover:bg-amber-50"
              disabled={isDemoLoading}
            >
              {isDemoLoading ? 'Loading Demo...' : 'Try Business Demo'}
            </Button>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-start space-x-2">
                <Users className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-800">Business Owner Access</h4>
                  <p className="text-sm text-green-700 mt-1">
                    This portal is for business owners and staff. Access your business profile, 
                    connect with chamber members, and manage your team.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 