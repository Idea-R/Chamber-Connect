import React from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, CheckCircle, Calculator, Star, ArrowRight, Users, Zap, Shield, TrendingUp, DollarSign } from 'lucide-react'

export function Pricing() {
  const navigate = useNavigate()
  const [duesAmount, setDuesAmount] = useState(400)
  const [memberCount, setMemberCount] = useState(250)
  const [adoptionRate, setAdoptionRate] = useState(50)

  // Calculate platform costs
  const activeMemberCount = Math.round(memberCount * (adoptionRate / 100))
  const annualPlatformFee = activeMemberCount * duesAmount * 0.10
  const monthlyPlatformFee = annualPlatformFee / 12

  const handleGetStarted = () => {
    navigate('/auth/chamber-signup')
  }

  const handleContactSales = () => {
    navigate('/contact')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Chamber Connect</span>
            </Link>
            <div className="flex space-x-4">
              <Link to="/auth/chamber-login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Button onClick={handleGetStarted}>Get Started</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Simple, Transparent Pricing
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Pay only for active members. 10% of your chamber dues. No hidden fees, no surprises.
          </p>
          
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-4">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                <TrendingUp className="h-5 w-5 mr-2" />
                Only Pay for Active Platform Members
              </Badge>
            </div>
          </div>
        </div>

        {/* Interactive Calculator */}
        <div className="mt-16">
          <Card className="max-w-4xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl flex items-center justify-center">
                <Calculator className="h-6 w-6 mr-2" />
                Calculate Your Platform Cost
              </CardTitle>
              <CardDescription>
                Adjust the sliders to see what Chamber Connect would cost for your chamber
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Input Controls */}
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Annual Dues per Business
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500">$</span>
                    <input
                      type="number"
                      value={duesAmount}
                      onChange={(e) => setDuesAmount(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="100"
                      max="1000"
                      step="50"
                    />
                  </div>
                  <div className="mt-2 space-x-2">
                    {[300, 400, 500].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setDuesAmount(amount)}
                        className={`px-3 py-1 rounded text-sm ${
                          duesAmount === amount 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        ${amount}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Chamber Members
                  </label>
                  <input
                    type="number"
                    value={memberCount}
                    onChange={(e) => setMemberCount(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="10"
                    max="2000"
                    step="10"
                  />
                  <div className="mt-2 space-x-2">
                    {[100, 250, 500].map((count) => (
                      <button
                        key={count}
                        onClick={() => setMemberCount(count)}
                        className={`px-3 py-1 rounded text-sm ${
                          memberCount === count 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform Adoption Rate
                  </label>
                  <div className="relative">
                    <input
                      type="range"
                      value={adoptionRate}
                      onChange={(e) => setAdoptionRate(Number(e.target.value))}
                      className="w-full"
                      min="10"
                      max="100"
                      step="5"
                    />
                    <div className="text-center mt-1 text-lg font-semibold text-blue-600">
                      {adoptionRate}%
                    </div>
                  </div>
                  <div className="mt-2 space-x-2">
                    {[25, 50, 75].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => setAdoptionRate(rate)}
                        className={`px-3 py-1 rounded text-sm ${
                          adoptionRate === rate 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {rate}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                <div className="grid md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{activeMemberCount}</div>
                    <div className="text-sm text-gray-600">Active Members</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">${(duesAmount * 0.10).toFixed(0)}</div>
                    <div className="text-sm text-gray-600">Per Member/Year</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">${monthlyPlatformFee.toFixed(0)}</div>
                    <div className="text-sm text-gray-600">Monthly Cost</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-indigo-600">${annualPlatformFee.toFixed(0)}</div>
                    <div className="text-sm text-gray-600">Annual Cost</div>
                  </div>
                </div>
                
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    You only pay for the <strong>{activeMemberCount} active members</strong> who actually use the platform.
                    Non-active members cost you nothing.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Value Proposition */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-blue-600 mb-4" />
              <CardTitle>Fair & Transparent</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Only pay for members who actually join and use the platform. No charges for inactive members.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <DollarSign className="h-10 w-10 text-green-600 mb-4" />
              <CardTitle>Predictable Costs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                10% of your existing dues structure. No hidden fees, no surprises, no complex pricing tiers.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="h-10 w-10 text-purple-600 mb-4" />
              <CardTitle>Scales With Success</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                As your chamber grows and more members join the platform, your ROI increases automatically.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Add-on Services */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Optional Add-On Services</h2>
            <p className="mt-4 text-lg text-gray-600">Enhance your chamber's digital presence with these premium features</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Event Management Pro</CardTitle>
                <Badge variant="secondary">$1/ticket or 3%</Badge>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Branded event microsites</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />RSVP & ticketing system</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Payment processing</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Business Profile Concierge</CardTitle>
                <Badge variant="secondary">$99 - $299</Badge>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Professional profile setup</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Content optimization</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Photo & asset upload</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Marketing & Analytics Pro</CardTitle>
                <Badge variant="secondary">$9 - $49/month</Badge>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Featured listings</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Advanced analytics</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />CRM integrations</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Transform Your Chamber?</h3>
              <p className="text-gray-600 mb-6">
                Join forward-thinking chambers who are modernizing their member experience with Chamber Connect.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={handleGetStarted} className="bg-blue-600 hover:bg-blue-700">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" onClick={handleContactSales}>
                  Schedule Demo
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                No setup fees • No long-term contracts • Cancel anytime
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}