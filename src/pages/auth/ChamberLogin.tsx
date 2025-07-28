import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Mail, Lock, ArrowLeft, Shield } from 'lucide-react'

export function ChamberLogin() {
  const navigate = useNavigate()
  const auth = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isOAuthLoading, setIsOAuthLoading] = useState(false)

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

  const handleGoogleLogin = async () => {
    setIsOAuthLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      })
      
      if (error) {
        console.error('OAuth error:', error)
        alert('Google login failed. Please try again.')
        setIsOAuthLoading(false)
      }
      // Don't reset loading here - user will be redirected
    } catch (error) {
      console.error('Unexpected OAuth error:', error)
      alert('An unexpected error occurred with Google login.')
      setIsOAuthLoading(false)
    }
  }

  // Demo login removed - use DevAdminPortal for testing

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
        console.log('Login successful, checking redirect destination')
        // Check if user came from admin route or should go to admin
        const urlParams = new URLSearchParams(window.location.search)
        const redirectTo = urlParams.get('redirect') || '/dashboard'
        
        // Give auth context more time to update
        setTimeout(() => navigate(redirectTo), 1000)
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

            {/* OAuth Section */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <Button
                onClick={handleGoogleLogin}
                disabled={isOAuthLoading}
                variant="outline"
                className="w-full mt-4 py-3 text-base border-gray-300 hover:bg-gray-50"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {isOAuthLoading ? 'Connecting...' : 'Continue with Google'}
              </Button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                New to Chamber Connect?{' '}
                <Link to="/pricing/free-trial" className="text-blue-600 hover:text-blue-500 font-medium">
                  Start your free trial
                </Link>
              </p>
              {/* Demo removed - use DevAdminPortal for testing */}
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