import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  X, 
  Building2, 
  Users, 
  Calendar, 
  MessageSquare, 
  CreditCard, 
  Star,
  CheckCircle,
  ArrowRight,
  Network,
  Gift,
  Clock
} from 'lucide-react'

interface BusinessOwnerModalProps {
  isOpen: boolean
  onClose: () => void
  onSignUp: () => void
}

export function BusinessOwnerModal({ isOpen, onClose, onSignUp }: BusinessOwnerModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-3 mb-2">
            <Building2 className="h-8 w-8" />
            <div>
              <CardTitle className="text-2xl">Are You a Business Owner?</CardTitle>
              <CardDescription className="text-blue-100">
                Discover how Chamber Connect transforms your business networking and growth
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Key Benefits */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">What You Get as a Member:</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <Users className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-900">Member Directory</h4>
                  <p className="text-sm text-gray-600">Connect with hundreds of local businesses, find partners, and discover new opportunities.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-900">Exclusive Events</h4>
                  <p className="text-sm text-gray-600">Access chamber events, networking mixers, and educational workshops.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-900">Direct Messaging</h4>
                  <p className="text-sm text-gray-600">Message other members directly, share opportunities, and build relationships.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Star className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-900">Business Spotlights</h4>
                  <p className="text-sm text-gray-600">Showcase your business to the entire chamber community and gain visibility.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Benefits */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center mb-3">
              <CreditCard className="h-5 w-5 text-green-600 mr-2" />
              <h3 className="font-semibold text-green-800">Easy Payment Options</h3>
            </div>
            <div className="space-y-2 text-sm text-green-700">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                <p><strong>No more large upfront payments</strong> - Pay your chamber dues monthly</p>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                <p><strong>Automatic payments</strong> - Never worry about missing renewal dates</p>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                <p><strong>Secure processing</strong> - Bank-level security for all transactions</p>
              </div>
            </div>
          </div>

          {/* Trial Offer */}
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-center mb-3">
              <Gift className="h-5 w-5 text-orange-600 mr-2" />
              <h3 className="font-semibold text-orange-800">Try Before You Join</h3>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-orange-700">
                <strong>Get a 1-month free trial</strong> to experience the platform and connect with chamber members before committing to full membership.
              </p>
              <div className="flex items-center space-x-2 text-xs text-orange-600">
                <Clock className="h-3 w-3" />
                <span>No credit card required • Full access • Connect immediately</span>
              </div>
            </div>
          </div>

          {/* Success Stories */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-900">What Other Businesses Say:</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <blockquote className="text-sm italic text-gray-700 mb-2">
                "Chamber Connect helped me find three new business partners in my first month. 
                The networking opportunities alone have paid for my membership several times over."
              </blockquote>
              <cite className="text-xs text-gray-600">— Sarah Johnson, TechFlow Solutions</cite>
            </div>
          </div>

          {/* Call to Action */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={onSignUp} 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
              size="lg"
            >
              Learn More
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            Join hundreds of businesses already growing through chamber connections
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default BusinessOwnerModal 