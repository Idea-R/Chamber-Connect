import React from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Mail, CheckCircle, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/analytics-error-handler'

type ResetStatus = 'idle' | 'loading' | 'success' | 'error'

export function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<ResetStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setStatus('loading')
    setErrorMessage('')

    try {
      logger.info(
        'Password reset request initiated',
        'auth-password-reset',
        { email }
      )

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        logger.warn(
          'Password reset request failed',
          'auth-password-reset',
          { email, errorCode: error.message }
        )
        setErrorMessage(error.message)
        setStatus('error')
      } else {
        logger.info(
          'Password reset email sent successfully',
          'auth-password-reset',
          { email }
        )
        setStatus('success')
      }
    } catch (error) {
      console.error('Password reset error:', error)
      logger.error(
        'Password reset request failed',
        'auth-password-reset',
        { email, errorMessage: 'Unexpected error occurred' },
        error instanceof Error ? error : undefined
      )
      setErrorMessage('An unexpected error occurred. Please try again.')
      setStatus('error')
    }
  }

  // Success state
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900">Check Your Email</CardTitle>
              <CardDescription>
                We've sent a password reset link to your email address
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-green-800 text-sm">
                  <strong>Email sent to:</strong> {email}
                </p>
                <p className="text-green-700 text-sm mt-2">
                  Click the link in the email to reset your password. The link will expire in 24 hours.
                </p>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={() => {
                    setStatus('idle')
                    setEmail('')
                  }}
                  variant="outline" 
                  className="w-full"
                >
                  Send Another Email
                </Button>

                <div className="flex space-x-3">
                  <Button variant="ghost" asChild className="flex-1">
                    <Link to="/auth/chamber-login">Chamber Login</Link>
                  </Button>
                  <Button variant="ghost" asChild className="flex-1">
                    <Link to="/auth/business-login">Business Login</Link>
                  </Button>
                </div>
              </div>

              <div className="text-center pt-4">
                <p className="text-sm text-gray-600">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Main forgot password form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to login
          </Button>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-gray-900">Reset Your Password</CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a link to reset your password
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={status === 'loading'}
                  />
                </div>
              </div>

              {status === 'error' && (
                <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-red-800 text-sm font-medium">Reset Failed</p>
                    <p className="text-red-700 text-sm">{errorMessage}</p>
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={status === 'loading' || !email}
              >
                {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" asChild>
                  <Link to="/auth/chamber-login">Chamber Login</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/auth/business-login">Business Login</Link>
                </Button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Remember your password?{' '}
                <Link to="/auth/chamber-login" className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Having trouble? Contact our support team for assistance.
          </p>
        </div>
      </div>
    </div>
  )
} 