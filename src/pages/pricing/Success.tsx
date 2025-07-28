import React from 'react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, CheckCircle, ArrowRight, Mail, Calendar, Users } from 'lucide-react'

export function Success() {
  useEffect(() => {
    // Track successful conversion
    console.log('Payment successful - track conversion')
  }, [])

  const nextSteps = [
    {
      icon: Mail,
      title: 'Check Your Email',
      description: 'We\'ve sent you a welcome email with your login credentials and setup instructions.'
    },
    {
      icon: Building2,
      title: 'Set Up Your Chamber',
      description: 'Complete your chamber profile and customize your branding to match your organization.'
    },
    {
      icon: Users,
      title: 'Invite Members',
      description: 'Start inviting your chamber members to join your new digital platform.'
    },
    {
      icon: Calendar,
      title: 'Create Your First Event',
      description: 'Set up your first networking event and experience the QR code networking feature.'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Chamber Connect</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Success Message */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Chamber Connect!
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your subscription has been successfully activated. You're now ready to transform 
            your chamber's digital presence and member engagement.
          </p>
          
          <div className="bg-white rounded-lg shadow-lg p-8 mb-12 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your 14-Day Free Trial Has Started</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">14</div>
                <div className="text-sm text-gray-600">Days Free Trial</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">$0</div>
                <div className="text-sm text-gray-600">Charged Today</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
                <div className="text-sm text-gray-600">Support Available</div>
              </div>
            </div>
          </div>

          <Button size="lg" className="bg-blue-600 hover:bg-blue-700" asChild>
            <Link to="/dashboard">
              Access Your Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>

        {/* Next Steps */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Get Started in 4 Easy Steps
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {nextSteps.map((step, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <step.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{step.title}</CardTitle>
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {step.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Support Section */}
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Need Help Getting Started?</h3>
            <p className="text-blue-100 mb-6">
              Our team is here to help you make the most of Chamber Connect. 
              Schedule a free onboarding call or browse our help resources.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button variant="outline" className="bg-white text-blue-600 hover:bg-gray-50">
                Schedule Onboarding Call
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                Browse Help Center
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Questions? We're here to help!
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-8 text-sm text-gray-600">
            <a href="mailto:support@chamberconnect.com" className="hover:text-blue-600">
              support@chamberconnect.com
            </a>
            <a href="tel:+1-555-123-4567" className="hover:text-blue-600">
              (555) 123-4567
            </a>
            <a href="#" className="hover:text-blue-600">
              Live Chat Available
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

// Add default export to fix import error in App.tsx
export default Success