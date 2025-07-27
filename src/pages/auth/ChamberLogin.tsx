import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Mail, Lock, ArrowLeft, Shield } from 'lucide-react'

export function ChamberLogin() {
  const navigate = useNavigate()
  const auth = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Handle case where auth context is not available
  if (!auth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  const { signIn } = auth

  const handleDemoLogin = async () => {
    setIsLoading(true)
    
    try {
      console.log('Demo login attempt for charles.r.sears@gmail.com')
      const result = await signIn('charles.r.sears@gmail.com', 'demo123')
      
      if (result.error) {
        console.error('Demo login error:', result.error)
        
        // Better error messaging for demo users
        if (result.error.message.includes('Invalid login credentials')) {
          alert(`Demo account not yet configured. Please contact your administrator to set up demo data.
          
Expected demo account: charles.r.sears@gmail.com
Error: ${result.error.message}`)
        } else {
          alert(`Demo login failed: ${result.error.message || 'Unknown error'}`)
        }
      } else {
        console.log('Demo login successful')
        // Give auth context time to update
        setTimeout(() => navigate('/dashboard'), 1000)
      }
    } catch (error) {
      console.error('Demo login error:', error)
      alert('Demo login failed. Please try again or contact support.')
    } finally {
      setTimeout(() => setIsLoading(false), 2000)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      console.log('Starting login process...')
      const result = await signIn(email, password)
      
      if (result.error) {
        console.error('Login error:', result.error.message)
        
        setIsLoading(false)
        
        // Show more user-friendly error messages
        let errorMessage = 'Login failed. Please check your credentials.'
        if (result.error.message?.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.'
        } else if (result.error.message?.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and click the confirmation link before signing in.'
        } else if (result.error.message?.includes('Too many requests')) {
          errorMessage = 'Too many login attempts. Please wait a few minutes before trying again.'
        }
        
        alert(errorMessage)
      } else {
        console.log('Login successful, redirecting to dashboard')
        // Give auth context more time to update
        setTimeout(() => navigate('/dashboard'), 1000)
      }
    } catch (error) {
      console.error('Unexpected login error:', error)
      setIsLoading(false)
      alert('An unexpected error occurred. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 text-indigo-600 hover:text-indigo-700">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to home</span>
          </Link>
        </div>

        <Card className="shadow-xl border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardTitle className="text-center text-2xl">Chamber Executive Login</CardTitle>
            <CardDescription className="text-center text-blue-100">
              Access your chamber management dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Chamber Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="your@email.com"
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
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <Link
                  to="/chamber/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full py-3 text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In to Chamber Portal'}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                New to Chamber Connect?{' '}
                <Link to="/pricing/free-trial" className="text-blue-600 hover:text-blue-500 font-medium">
                  Start your free trial
                </Link>
              </p>
              
              {/* Demo Login Button */}
              <div className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDemoLogin}
                  disabled={isLoading}
                  className="w-full"
                >
                  Try Demo Login
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  Use demo credentials to test the platform
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Chamber Executive Access</p>
                    <p className="text-sm text-blue-700 mt-1">
                      This portal is for chamber executives and staff only. Members should use their chamber-specific login page.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}