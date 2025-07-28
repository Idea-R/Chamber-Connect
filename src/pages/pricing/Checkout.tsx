import React from 'react'
import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getSubscriptionPlan, createCheckoutSession, type Plan } from '@/lib/stripe'
import { useAuth } from '@/contexts/AuthContext'
import { logger } from '@/lib/analytics-error-handler'
import { Building2, CheckCircle, ArrowLeft, CreditCard, Shield, Clock, Users, Loader2, X } from 'lucide-react'

export function Checkout() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, primaryMembership } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [plan, setPlan] = useState<Plan | null>(null)
  const [planLoading, setPlanLoading] = useState(true)
  const [planError, setPlanError] = useState<string | null>(null)
  
  const planId = searchParams.get('plan')
  const billingPeriod = (searchParams.get('billing') as 'monthly' | 'yearly') || 'monthly'

  // Fetch the selected plan
  useEffect(() => {
    const fetchPlan = async () => {
      if (!planId) {
        navigate('/pricing')
        return
      }

      try {
        setPlanLoading(true)
        setPlanError(null)
        const fetchedPlan = await getSubscriptionPlan(planId)
        
        if (!fetchedPlan) {
          logger.warn('Plan not found in checkout', 'checkout-plan-fetch', { planId })
          navigate('/pricing')
          return
        }

        setPlan(fetchedPlan)
        logger.info('Plan loaded in checkout', 'checkout-plan-fetch', { 
          planId: fetchedPlan.id,
          planName: fetchedPlan.name
        })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load plan'
        setPlanError(errorMessage)
        logger.error('Failed to load plan in checkout', 'checkout-plan-fetch', {
          planId,
          errorMessage
        }, error instanceof Error ? error : undefined)
      } finally {
        setPlanLoading(false)
      }
    }

    fetchPlan()
  }, [planId, navigate])

  // Redirect if user not authenticated or no chamber membership
  useEffect(() => {
    if (!planLoading && (!user || !primaryMembership)) {
      logger.warn('Unauthenticated user accessing checkout', 'checkout-auth-check')
      navigate('/chamber/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search))
    }
  }, [user, primaryMembership, planLoading, navigate])

  const handleCheckout = async () => {
    if (!plan?.stripe_price_id || !primaryMembership) {
      logger.error('Checkout attempted without valid plan or chamber', 'checkout-attempt', {
        planId: plan?.id,
        hasStripePrice: !!plan?.stripe_price_id,
        hasChamber: !!primaryMembership
      })
      return
    }

    setIsLoading(true)
    
    try {
      logger.info('Starting checkout process', 'checkout-start', {
        planId: plan.id,
        chamberId: primaryMembership.chamber_id,
        billingPeriod
      })

      const { url } = await createCheckoutSession(
        plan.stripe_price_id,
        primaryMembership.chamber_id,
        billingPeriod,
        `${window.location.origin}/pricing/success`,
        `${window.location.origin}/pricing?checkout=cancelled`
      )

      // Redirect to Stripe Checkout
      window.location.href = url

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Checkout failed'
      logger.error('Checkout failed', 'checkout-failed', {
        planId: plan.id,
        errorMessage
      }, error instanceof Error ? error : undefined)
      alert('Failed to start checkout. Please try again.')
      setIsLoading(false)
    }
  }

  const calculatePrice = () => {
    if (!plan) return 0
    return billingPeriod === 'yearly' 
      ? (plan.price_yearly || Math.round(plan.price_monthly * 12 * 0.8))
      : plan.price_monthly
  }

  const calculateSavings = () => {
    if (!plan || billingPeriod !== 'yearly') return 0
    const monthlyTotal = plan.price_monthly * 12
    const yearlyPrice = calculatePrice()
    return monthlyTotal - yearlyPrice
  }

  // Loading state
  if (planLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (planError || !plan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <X className="h-8 w-8 mx-auto mb-4 text-red-600" />
          <p className="text-gray-900 font-medium mb-2">Unable to load checkout</p>
          <p className="text-gray-600 mb-4">{planError || 'Plan not found'}</p>
          <Button asChild>
            <Link to="/pricing">Back to Pricing</Link>
          </Button>
        </div>
      </div>
    )
  }

  const features = [
    ...plan.features,
    plan.max_members === -1 ? 'Unlimited members' : `Up to ${plan.max_members} members`,
    plan.max_events_per_month === -1 ? 'Unlimited events' : `${plan.max_events_per_month} events per month`,
    ...(plan.analytics_enabled ? ['Analytics dashboard'] : []),
    ...(plan.cross_chamber_networking ? ['Cross-chamber networking'] : []),
    ...(plan.priority_support ? ['Priority support'] : [])
  ]

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
                Back to Pricing
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Plan Details */}
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Complete Your {plan.name} Subscription
              </h1>
              <p className="text-lg text-gray-600">
                You're just one step away from transforming your chamber's digital presence.
              </p>
            </div>

            {/* Plan Summary */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{plan.name} Plan</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </div>
                  {plan.popular && (
                    <Badge className="bg-blue-600">Most Popular</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Plan Price</span>
                    <span className="font-semibold">${calculatePrice()}/{billingPeriod === 'yearly' ? 'year' : 'month'}</span>
                  </div>
                  {billingPeriod === 'yearly' && (
                    <div className="flex items-center justify-between text-green-600">
                      <span>Yearly Discount (20%)</span>
                      <span>-${calculateSavings()}</span>
                    </div>
                  )}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>${calculatePrice()}/{billingPeriod === 'yearly' ? 'year' : 'month'}</span>
                    </div>
                    {calculateSavings() > 0 && (
                      <p className="text-sm text-green-600 mt-1">
                        You save ${calculateSavings()} per year with yearly billing
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Billing Summary */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-lg">Selected Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium">{plan.name} - {billingPeriod === 'yearly' ? 'Yearly' : 'Monthly'} Billing</p>
                    <p className="text-sm text-gray-600">
                      {billingPeriod === 'yearly' ? 'Pay yearly, save more' : 'Pay monthly, cancel anytime'}
                    </p>
                    {billingPeriod === 'yearly' && calculateSavings() > 0 && (
                      <Badge className="bg-green-100 text-green-800 mt-1">Save ${calculateSavings()}/year</Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">${calculatePrice()}/{billingPeriod === 'yearly' ? 'year' : 'month'}</p>
                    {billingPeriod === 'yearly' && (
                      <p className="text-sm text-gray-500">Equivalent to ${Math.round(calculatePrice() / 12)}/month</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* What's Included */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What's Included</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Checkout */}
          <div>
            <Card className="shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                <CardTitle className="text-center text-2xl">Secure Checkout</CardTitle>
                <CardDescription className="text-center text-blue-100">
                  Start your 14-day free trial today
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-6">
                  {/* Trial Notice */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-900">14-Day Free Trial</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      You won't be charged until your trial ends. Cancel anytime during the trial period.
                    </p>
                  </div>

                  {/* Security Features */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Shield className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-600">256-bit SSL encryption</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CreditCard className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-600">Secure payment processing by Stripe</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-600">Trusted by 500+ chambers</span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <Button
                    onClick={handleCheckout}
                    disabled={isLoading}
                    className="w-full py-4 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    {isLoading ? (
                      'Processing...'
                    ) : (
                      `Start Free Trial - $${calculatePrice()}/${billingPeriod === 'yearly' ? 'year' : 'month'} after trial`
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    By clicking "Start Free Trial", you agree to our Terms of Service and Privacy Policy. 
                    You can cancel your subscription at any time.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Money Back Guarantee */}
            <div className="mt-8 p-6 bg-white rounded-lg shadow-lg">
              <div className="text-center">
                <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">30-Day Money-Back Guarantee</h3>
                <p className="text-sm text-gray-600">
                  Not satisfied? Get a full refund within 30 days of your first payment. No questions asked.
                </p>
              </div>
            </div>

            {/* Support */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Need help? <a href="mailto:support@chamberconnect.com" className="text-blue-600 hover:underline">Contact our support team</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Add default export to fix import error in App.tsx
export default Checkout