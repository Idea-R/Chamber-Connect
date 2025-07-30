import React from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Users, Calendar, MessageSquare, QrCode, Star, ArrowRight, CheckCircle, Menu, X } from 'lucide-react'

export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const features = [
    {
      icon: Building2,
      title: 'Multi-Tenant Platform',
      description: 'Each chamber gets their own branded portal with custom URLs and branding'
    },
    {
      icon: QrCode,
      title: 'QR Code Networking',
      description: 'Instant profile sharing at events - just like scanning a Venmo QR code'
    },
    {
      icon: Calendar,
      title: 'Event Management',
      description: 'RSVP system, ticketing, and attendance tracking for all chamber events'
    },
    {
      icon: Users,
      title: 'Member Directory',
      description: 'Searchable business directory with detailed profiles and contact information'
    },
    {
      icon: MessageSquare,
      title: 'Direct Messaging',
      description: 'Business-to-business communication and referral tracking'
    },
    {
      icon: Star,
      title: 'Business Spotlights',
      description: 'Chamber-curated member highlights to showcase local businesses'
    }
  ]

  const benefits = [
    'Increase member engagement and retention',
    'Provide modern networking tools',
    'Generate new revenue streams',
    'Attract new chamber members',
    'Streamline event management',
    'Facilitate meaningful business connections'
  ]

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Chamber Connect</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-4">
                <Button variant="ghost" asChild>
                  <Link to="/pricing">Pricing</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link to="/growth">Growth</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link to="/auth/chamber-login">Chamber Login</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link to="/auth/business-login">Business Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/dashboard">View Demo</Link>
                </Button>
              </div>
              <div className="md:hidden">
                <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <div className="flex flex-col space-y-2">
                <Link
                  to="/pricing"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link
                  to="/growth"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Growth
                </Link>
                <Link
                  to="/auth/chamber-login"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Chamber Login
                </Link>
                <Link
                  to="/auth/business-login"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Business Login
                </Link>
                <Link
                  to="/dashboard"
                  className="block px-4 py-2 bg-blue-600 text-white rounded-md text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  View Demo
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Modern B2B Networking for
              <span className="text-blue-600 block">Chambers of Commerce</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Empower your chamber members with QR code networking, event management, 
              and referral tracking. Increase membership value and attract new businesses.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button size="lg" asChild>
                <Link to="/dashboard">
                  Explore Platform
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/pricing/free-trial">Start Free Trial</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything Your Chamber Needs
            </h2>
            <p className="text-lg text-gray-600">
              Comprehensive features designed specifically for chamber networking
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why Chamber Connect?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                ROI justified by attracting just a few new members per month. The platform 
                pays for itself while providing modern tools that dramatically increase 
                engagement, retention, and revenue.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Button variant="outline" asChild>
                  <Link to="/growth">See Growth Calculator <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Pricing That Scales
              </h3>
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h4 className="font-medium text-gray-900">Chamber Subscription</h4>
                  <p className="text-sm text-gray-600">Pay only for active platform members</p>
                </div>
                <div className="border-b pb-4">
                  <h4 className="font-medium text-gray-900">Member Pricing</h4>
                  <p className="text-sm text-gray-600">10% of your chamber dues</p>
                  <p className="text-sm text-gray-600">Only pay for active users</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Free Trial</h4>
                  <p className="text-sm text-gray-600">Full platform access for chamber testing</p>
                </div>
              </div>
              <div className="space-y-3 mt-6">
                <Button className="w-full" asChild>
                  <Link to="/pricing">View Pricing Calculator</Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/auth/chamber-signup">Start Free Trial</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Chamber?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join chambers already using Chamber Connect to provide exceptional value to their members
          </p>
          <Button size="lg" variant="outline" className="bg-white text-blue-600 hover:bg-gray-50" asChild>
            <Link to="/pricing/free-trial">Start Free Trial</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Building2 className="h-6 w-6" />
                <span className="text-lg font-semibold">Chamber Connect</span>
              </div>
              <p className="text-gray-400">
                Modern B2B networking platform for Chambers of Commerce
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link to="/growth" className="hover:text-white">Growth</Link></li>
                <li><Link to="/pricing/free-trial" className="hover:text-white">Free Trial</Link></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Chamber Connect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage