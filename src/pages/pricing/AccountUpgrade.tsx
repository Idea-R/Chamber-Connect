import React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getSubscriptionPlans, type Plan } from '@/lib/stripe'
import { CheckCircle, Star, ArrowRight, TrendingUp, Users, Zap } from 'lucide-react'

export function AccountUpgrade() {
  const navigate = useNavigate()
  const [currentPlan] = useState<string>('starter') // This would come from user context
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])

  const handleUpgrade = async (planId: string) => {
    setIsLoading(planId)
    navigate(`/pricing/checkout?plan=${planId}`)
    setIsLoading(null)
  }

  // TODO: This component needs to be updated to use the new database-driven system
  // For now, using minimal changes to prevent build errors
  const currentPlanData = plans.find(p => p.id === currentPlan)
  const availableUpgrades = plans.filter(plan => 
    plan.price_monthly > (currentPlanData?.price_monthly || 0)
  )

  const usageStats = [
    { label: 'Current Members', value: '42', limit: '50', percentage: 84 },
    { label: 'Events This Month', value: '6', limit: '∞', percentage: 60 },
    { label: 'Storage Used', value: '2.1 GB', limit: '5 GB', percentage: 42 },
  ]

  const upgradeReasons = [
    {
      icon: Users,
      title: 'Member Limit Reached',
      description: 'You\'re approaching your member limit. Upgrade to accommodate more businesses.',
      urgent: true
    },
    {
      icon: TrendingUp,
      title: 'Advanced Analytics',
      description: 'Get detailed insights into member engagement and event performance.',
      urgent: false
    },
    {
      icon: Zap,
      title: 'Priority Support',
      description: 'Get faster response times and dedicated support for your chamber.',
      urgent: false
    }
  ]

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Account Upgrade</h1>
            <p className="text-gray-600 mt-2">
              Unlock more features and grow your chamber's potential
            </p>
          </div>
          <Badge className="bg-blue-100 text-blue-800 mt-4 sm:mt-0">
            Current Plan: {currentPlanData.name}
          </Badge>
        </div>

        {/* Current Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Current Usage</CardTitle>
            <CardDescription>See how you're using your current plan limits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {usageStats.map((stat, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{stat.label}</span>
                    <span className="font-medium">{stat.value} / {stat.limit}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        stat.percentage > 80 ? 'bg-red-500' : 
                        stat.percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>
                  {stat.percentage > 80 && (
                    <p className="text-xs text-red-600">Approaching limit</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upgrade Reasons */}
        <Card>
          <CardHeader>
            <CardTitle>Why Upgrade?</CardTitle>
            <CardDescription>Benefits you'll get with a higher plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upgradeReasons.map((reason, index) => (
                <div key={index} className={`flex items-start space-x-4 p-4 rounded-lg ${
                  reason.urgent ? 'bg-red-50 border border-red-200' : 'bg-gray-50'
                }`}>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    reason.urgent ? 'bg-red-100' : 'bg-blue-100'
                  }`}>
                    <reason.icon className={`h-5 w-5 ${
                      reason.urgent ? 'text-red-600' : 'text-blue-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{reason.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{reason.description}</p>
                  </div>
                  {reason.urgent && (
                    <Badge className="bg-red-100 text-red-800">Urgent</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Available Upgrades */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Upgrades</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableUpgrades.map((plan) => (
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
                      Recommended
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-600 mt-2">
                    {plan.description}
                  </CardDescription>
                  <div className="mt-6">
                    <span className="text-4xl font-bold text-gray-900">${plan.price_monthly}</span>
                    <span className="text-gray-600 ml-2">/ month</span>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={isLoading === plan.id}
                    className={`w-full py-3 ${
                      plan.popular 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-gray-900 hover:bg-gray-800'
                    }`}
                  >
                    {isLoading === plan.id ? (
                      'Loading...'
                    ) : (
                      <>
                        Upgrade to {plan.name}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                  
                  <p className="text-xs text-gray-500 text-center mt-3">
                    Prorated billing • Cancel anytime
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Billing Information */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Prorated Billing</h3>
                <p className="text-blue-800 text-sm">
                  When you upgrade, you'll only pay the difference for the remaining days in your current billing cycle. 
                  Your next full billing cycle will start at the new plan rate.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support */}
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold text-gray-900 mb-2">Need Help Choosing?</h3>
            <p className="text-gray-600 mb-4">
              Our team can help you select the right plan for your chamber's needs.
            </p>
            <Button variant="outline">
              Schedule a Consultation Call
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}