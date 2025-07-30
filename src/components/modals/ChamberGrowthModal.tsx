import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  X, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target,
  CheckCircle,
  ArrowRight,
  Building2,
  Calendar,
  Gift,
  Network,
  Lightbulb,
  BarChart3
} from 'lucide-react'

interface ChamberGrowthModalProps {
  isOpen: boolean
  onClose: () => void
  onViewGrowthPage: () => void
}

export function ChamberGrowthModal({ isOpen, onClose, onViewGrowthPage }: ChamberGrowthModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-3 mb-2">
            <TrendingUp className="h-8 w-8" />
            <div>
              <CardTitle className="text-2xl">Chamber Growth & Revenue</CardTitle>
              <CardDescription className="text-green-100">
                See how Chamber Connect becomes your membership growth engine
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Growth Strategy Overview */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Transform Your Chamber with Strategic Growth:</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <Gift className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-900">Free Trial Memberships</h4>
                  <p className="text-sm text-gray-600">Offer 1-month trials to non-members. They experience the value and convert to paying members.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Network className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-900">Platform Networking</h4>
                  <p className="text-sm text-gray-600">Businesses connect with members, see community value, and naturally want to join.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-900">Event-Driven Growth</h4>
                  <p className="text-sm text-gray-600">Events become member acquisition tools with built-in follow-up automation.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Target className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-900">Member Retention</h4>
                  <p className="text-sm text-gray-600">Platform engagement significantly increases member satisfaction and reduces churn.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Growth Calculator Preview */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center mb-3">
              <BarChart3 className="h-5 w-5 text-green-600 mr-2" />
              <h3 className="font-semibold text-green-800">Growth Impact Calculator</h3>
            </div>
            
            {/* Sample Growth Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="bg-blue-100 rounded-lg p-3">
                  <div className="text-2xl font-bold text-blue-600">6</div>
                  <div className="text-xs text-blue-600">New Members/Month</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 rounded-lg p-3">
                  <div className="text-2xl font-bold text-purple-600">72</div>
                  <div className="text-xs text-purple-600">New Members/Year</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-green-100 rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-600">$43K</div>
                  <div className="text-xs text-green-600">Additional Revenue</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-emerald-100 rounded-lg p-3">
                  <div className="text-2xl font-bold text-emerald-600">$34K</div>
                  <div className="text-xs text-emerald-600">Net Growth</div>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-green-700 text-center">
              *Based on 150 current members, $50 monthly dues, 20 trials/month, 30% conversion rate
            </p>
          </div>

          {/* Revenue Benefits */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-900">How the Platform Pays for Itself:</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  <strong>Self-funding model:</strong> Just 8-12 new members annually covers your entire platform cost
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  <strong>Pure growth revenue:</strong> All additional members provide funding for chamber events and initiatives
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  <strong>Improved cash flow:</strong> Monthly payments provide steady, predictable revenue streams
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  <strong>Higher retention:</strong> Platform engagement reduces member churn by 40-60%
                </p>
              </div>
            </div>
          </div>

          {/* Pitch Points */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center mb-3">
              <Lightbulb className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="font-semibold text-blue-800">How to Pitch This Platform:</h3>
            </div>
            <div className="space-y-2 text-sm text-blue-700">
              <p><strong>"Experience chamber membership before you commit"</strong> - Free trial removes barriers</p>
              <p><strong>"No more large upfront payments"</strong> - Monthly dues are easier to budget</p>
              <p><strong>"Connect with members instantly"</strong> - Platform provides immediate networking value</p>
              <p><strong>"Your chamber is modern and tech-forward"</strong> - Platform demonstrates innovation</p>
              <p><strong>"See events and opportunities in real-time"</strong> - Never miss valuable connections</p>
            </div>
          </div>

          {/* Success Story */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Chamber Success Story:</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <blockquote className="text-sm italic text-gray-700 mb-2">
                "Chamber Connect transformed our membership strategy. We went from 150 to 230 members in 12 months, 
                with 80% of new members coming through the platform. The additional revenue funded three new 
                community programs and our largest annual event ever."
              </blockquote>
              <cite className="text-xs text-gray-600">— Springfield Chamber of Commerce</cite>
            </div>
          </div>

          {/* Call to Action */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={onViewGrowthPage} 
              className="flex-1 bg-green-600 hover:bg-green-700"
              size="lg"
            >
              See Growth Calculator <ArrowRight className="ml-2 h-4 w-4" />
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
            Join 200+ chambers already growing with Chamber Connect
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default ChamberGrowthModal 