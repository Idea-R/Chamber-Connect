import React from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, CheckCircle, ArrowLeft, Star, Users, Calendar, MessageSquare, Shield } from 'lucide-react'

export function FreeTrial() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const trialFeatures = [
    { icon: Users, text: 'Up to 25 chamber members' },
    { icon: Calendar, text: 'Basic event management' },
    { icon: MessageSquare, text: 'Member messaging system' },
    { icon: Building2, text: 'Custom chamber page' },
    { icon: Shield, text: 'QR code networking' },
    { icon: Star, text: 'Member directory' }
  ]

  const handleStartTrial = async () => {
    setIsLoading(true)
    // Simulate trial signup process
    setTimeout(() => {
      navigate('/chamber/signup')
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Chamber Connect</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/pricing" className="text-gray-600 hover:text-gray-900">
                View All Plans
              </Link>
              <Link to="/chamber/login" className="text-blue-600 hover:text-blue-700">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Back Link */}
        <Link to="/pricing" className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-8">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to pricing</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Trial Info */}
          <div>
            <div className="mb-8">
              <Badge className="bg-green-100 text-green-800 mb-4">
                Free 14-Day Trial
              </Badge>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Try Chamber Connect Free
              </h1>
              <p className="text-xl text-gray-600 mb-6">
                Experience the full power of modern chamber management with our 14-day free trial. 
                No credit card required.
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900">What's included:</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {trialFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <feature.icon className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-gray-700">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Trial Benefits</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span>Full access to all trial features</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span>No credit card required</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span>Cancel anytime during trial</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span>Email support included</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column - Trial Signup */}
          <div>
            <Card className="shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                <CardTitle className="text-center text-2xl">Start Your Free Trial</CardTitle>
                <CardDescription className="text-center text-blue-100">
                  Get started in less than 2 minutes
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <div className="text-5xl font-bold text-gray-900 mb-2">Free</div>
                  <div className="text-gray-600">for 14 days</div>
                  <div className="text-sm text-gray-500 mt-2">Then $49/month</div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Trial Duration</span>
                    <span className="font-medium">14 days</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Member Limit</span>
                    <span className="font-medium">25 members</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Support</span>
                    <span className="font-medium">Email support</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Setup Time</span>
                    <span className="font-medium">&lt; 5 minutes</span>
                  </div>
                </div>

                <Button
                  onClick={handleStartTrial}
                  disabled={isLoading}
                  className="w-full py-4 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {isLoading ? 'Setting up your trial...' : 'Start Free Trial'}
                </Button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  By starting your trial, you agree to our Terms of Service and Privacy Policy
                </p>
              </CardContent>
            </Card>

            {/* Testimonial */}
            <div className="mt-8 p-6 bg-white rounded-lg shadow-lg">
              <div className="flex items-start space-x-4">
                <img 
                  src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400"
                  alt="Chamber Director"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="text-gray-700 text-sm italic mb-2">
                    "Chamber Connect transformed how we engage with our members. 
                    The trial convinced us immediately - we saw 40% more event attendance in the first month."
                  </p>
                  <p className="text-sm font-medium text-gray-900">Sarah Mitchell</p>
                  <p className="text-xs text-gray-500">Executive Director, Downtown Chamber</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What happens after the trial ends?</h3>
              <p className="text-gray-600 text-sm">
                After 14 days, you can choose to upgrade to a paid plan or your account will be paused. 
                Your data is safely stored for 30 days if you decide to return.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I cancel during the trial?</h3>
              <p className="text-gray-600 text-sm">
                Yes, you can cancel anytime during the trial period with no charges. 
                Simply contact our support team or cancel from your dashboard.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Is my data secure during the trial?</h3>
              <p className="text-gray-600 text-sm">
                Absolutely. We use enterprise-grade security and encryption to protect your chamber's data. 
                Your information is never shared with third parties.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I upgrade during the trial?</h3>
              <p className="text-gray-600 text-sm">
                Yes, you can upgrade to any paid plan at any time during your trial. 
                You'll only be charged for the remaining days in your billing cycle.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Add default export to fix import error in App.tsx
export default FreeTrial