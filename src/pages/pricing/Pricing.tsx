import React from 'react'
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getSubscriptionPlans, type Plan } from '@/lib/stripe'
import { logger } from '@/lib/analytics-error-handler'
import { Building2, CheckCircle, X, Star, ArrowRight, Users, Zap, Shield, Loader2 } from 'lucide-react'

export function Pricing() {
  const navigate = useNavigate()
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [plansLoading, setPlansLoading] = useState(true)
  const [plansError, setPlansError] = useState<string | null>(null)

  // Fetch subscription plans on component mount
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setPlansLoading(true)
        setPlansError(null)
        const fetchedPlans = await getSubscriptionPlans()
        setPlans(fetchedPlans)
        logger.info('Subscription plans loaded in pricing page', {
          operation: 'pricing-page-load',
          planCount: fetchedPlans.length
        })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load pricing plans'
        setPlansError(errorMessage)
        logger.error('Failed to load subscription plans in pricing page', {
          operation: 'pricing-page-load',
          error: errorMessage
        })
      } finally {
        setPlansLoading(false)
      }
    }

    fetchPlans()
  }, [])

  const handleSelectPlan = async (plan: Plan) => {
    if (!plan.stripe_price_id) {
      logger.warn('Plan selected without Stripe price ID', {
        operation: 'select-plan',
        planId: plan.id,
        planName: plan.name
      })
      return
    }

    setIsLoading(plan.id)
    logger.info('Plan selected', {
      operation: 'select-plan',
      planId: plan.id,
      planName: plan.name,
      billingPeriod
    })

    // For paid plans, redirect to checkout
    navigate(`/pricing/checkout?plan=${plan.id}&billing=${billingPeriod}`)
    setIsLoading(null)
  }

  const formatPlanFeatures = (plan: Plan): string[] => {
    const features = [...plan.features]
    
    // Add dynamic features based on plan limits
    if (plan.max_members === -1) {
      features.unshift('Unlimited members')
    } else {
      features.unshift(`Up to ${plan.max_members} members`)
    }

    if (plan.max_events_per_month === -1) {
      features.push('Unlimited events')
    } else {
      features.push(`${plan.max_events_per_month} events per month`)
    }

    if (plan.analytics_enabled) {
      features.push('Analytics dashboard')
    }

    if (plan.cross_chamber_networking) {
      features.push('Cross-chamber networking')
    }

    if (plan.priority_support) {
      features.push('Priority support')
    }

    return features
  }

  const calculateYearlyPrice = (monthlyPrice: number, yearlyPrice?: number) => {
    return yearlyPrice || Math.round(monthlyPrice * 12 * 0.8) // 20% discount if no yearly price set
  }

  const testimonials = [
    {
      quote: "Chamber Connect increased our member engagement by 60% in just 3 months.",
      author: "Jennifer Martinez",
      title: "Executive Director",
      organization: "Metro Business Chamber",
      avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      quote: "The QR code networking feature revolutionized our events. Members love it!",
      author: "David Chen",
      title: "Chamber President",
      organization: "Tech Valley Chamber",
      avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      quote: "ROI was immediate. We attracted 15 new members in the first month alone.",
      author: "Sarah Thompson",
      title: "Membership Director",
      organization: "Downtown Chamber Alliance",
      avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400"
    }
  ]

  // Loading state
  if (plansLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading pricing plans...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (plansError) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <X className="h-8 w-8 mx-auto mb-4 text-red-600" />
          <p className="text-gray-900 font-medium mb-2">Failed to load pricing plans</p>
          <p className="text-gray-600 mb-4">{plansError}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Chamber Connect</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/chamber/login" className="text-gray-600 hover:text-gray-900">
                Sign In
              </Link>
              <Button asChild>
                <Link to="/pricing/free-trial">Start Free Trial</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Choose Your Chamber's Growth Plan
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            From small chambers to large organizations, we have a plan that scales with your needs. 
            Start with our free trial and upgrade as you grow.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-12">
            <span className={`text-sm ${billingPeriod === 'monthly' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingPeriod === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm ${billingPeriod === 'yearly' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              Yearly
            </span>
            {billingPeriod === 'yearly' && (
              <Badge className="bg-green-100 text-green-800 ml-2">Save 20%</Badge>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`grid gap-8 ${plans.length <= 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
                         {plans.map((plan) => {
               const features = formatPlanFeatures(plan)
               const displayPrice = billingPeriod === 'yearly' ? calculateYearlyPrice(plan.price_monthly, plan.price_yearly) : plan.price_monthly
              
              return (
                <Card 
                  key={plan.id} 
                  className={`relative hover:shadow-xl transition-all duration-300 ${
                    plan.popular ? 'ring-2 ring-blue-500 scale-105' : 'hover:scale-105'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-600 text-white px-4 py-1">
                        <Star className="h-3 w-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-8">
                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                    <CardDescription className="text-gray-600 mt-2">
                      {plan.description}
                    </CardDescription>
                    <div className="mt-6">
                      <div>
                        <span className="text-4xl font-bold text-gray-900">
                          ${displayPrice}
                        </span>
                        <span className="text-gray-600 ml-2">
                          / {billingPeriod === 'yearly' ? 'year' : 'month'}
                        </span>
                        {billingPeriod === 'yearly' && (
                          <div className="text-sm text-green-600 mt-1">
                            Save ${Math.round(plan.price_monthly * 12 - displayPrice)} per year
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <ul className="space-y-3 mb-8">
                      {features.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button
                      onClick={() => handleSelectPlan(plan)}
                      disabled={isLoading === plan.id || !plan.stripe_price_id}
                      className={`w-full py-3 ${
                        plan.popular 
                          ? 'bg-blue-600 hover:bg-blue-700' 
                          : 'bg-gray-900 hover:bg-gray-800'
                      }`}
                    >
                      {isLoading === plan.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Loading...
                        </>
                      ) : !plan.stripe_price_id ? (
                        'Coming Soon'
                      ) : (
                        `Choose ${plan.name}`
                      )}
                    </Button>
                    
                    <p className="text-xs text-gray-500 text-center mt-3">
                      14-day free trial included
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted by Chambers Nationwide</h2>
            <p className="text-lg text-gray-600">See what chamber leaders are saying about Chamber Connect</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="shadow-lg">
                <CardContent className="p-8">
                  <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center space-x-4">
                    <img 
                      src={testimonial.avatar}
                      alt={testimonial.author}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.author}</p>
                      <p className="text-sm text-gray-600">{testimonial.title}</p>
                      <p className="text-sm text-gray-500">{testimonial.organization}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Chamber?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of chambers already using Chamber Connect to engage members and grow their communities.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50" asChild>
              <Link to="/pricing/free-trial">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              Schedule Demo
            </Button>
          </div>
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
                <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link to="/pricing/free-trial" className="hover:text-white">Free Trial</Link></li>
                <li><a href="#" className="hover:text-white">Features</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Documentation</a></li>
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