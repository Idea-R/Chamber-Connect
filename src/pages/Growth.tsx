import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  Network,
  Gift,
  ArrowRight,
  CheckCircle,
  Star,
  Target,
  Lightbulb,
  Clock,
  CreditCard,
  Calculator
} from 'lucide-react'

export default function Growth() {
  const navigate = useNavigate()
  const [currentMembers, setCurrentMembers] = useState(150)
  const [monthlyDues, setMonthlyDues] = useState(50)
  const [trialConversionRate, setTrialConversionRate] = useState(30)
  const [trialsPerMonth, setTrialsPerMonth] = useState(20)

  // Calculate growth metrics
  const newMembersPerMonth = Math.round(trialsPerMonth * (trialConversionRate / 100))
  const newMembersPerYear = newMembersPerMonth * 12
  const additionalRevenue = newMembersPerYear * monthlyDues * 12
  const platformCost = currentMembers * monthlyDues * 12 * 0.10
  const netGrowthRevenue = additionalRevenue - platformCost

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-green-600" />
              <span className="text-xl font-bold text-gray-900">Chamber Connect</span>
            </Link>
            <div className="flex space-x-4">
              <Link to="/pricing">
                <Button variant="ghost">Pricing</Button>
              </Link>
              <Link to="/auth/chamber-login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Button onClick={() => navigate('/auth/chamber-signup')}>Get Started</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <Badge className="bg-green-100 text-green-800 mb-4">
            <TrendingUp className="h-4 w-4 mr-1" />
            Member Growth & Revenue
          </Badge>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Turn Your Platform Into a 
            <span className="text-green-600"> Growth Engine</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how Chamber Connect drives membership growth, increases retention, and generates 
            new revenue streams for your chamber through our trial membership program.
          </p>
        </div>

        {/* Growth Calculator */}
        <div className="mt-16">
          <Card className="max-w-4xl mx-auto">
            <CardHeader className="text-center bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Calculator className="h-8 w-8" />
                <CardTitle className="text-2xl">Growth Impact Calculator</CardTitle>
              </div>
              <CardDescription className="text-green-100">
                Adjust the sliders to see how trial memberships drive chamber growth
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-8">
              {/* Input Controls */}
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Members
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={currentMembers}
                        onChange={(e) => setCurrentMembers(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div className="flex space-x-2 mt-2">
                      {[100, 150, 250, 500].map(amount => (
                        <button
                          key={amount}
                          onClick={() => setCurrentMembers(amount)}
                          className={`px-3 py-1 text-xs rounded ${
                            currentMembers === amount 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {amount}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monthly Dues per Member
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={monthlyDues}
                        onChange={(e) => setMonthlyDues(Number(e.target.value))}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div className="flex space-x-2 mt-2">
                      {[30, 50, 75, 100].map(amount => (
                        <button
                          key={amount}
                          onClick={() => setMonthlyDues(amount)}
                          className={`px-3 py-1 text-xs rounded ${
                            monthlyDues === amount 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          ${amount}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trial Memberships per Month
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="50"
                      value={trialsPerMonth}
                      onChange={(e) => setTrialsPerMonth(Number(e.target.value))}
                      className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-sm text-gray-600 mt-1">
                      <span>5</span>
                      <span className="font-medium text-green-600">{trialsPerMonth}</span>
                      <span>50</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trial to Member Conversion Rate
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="50"
                      value={trialConversionRate}
                      onChange={(e) => setTrialConversionRate(Number(e.target.value))}
                      className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-sm text-gray-600 mt-1">
                      <span>10%</span>
                      <span className="font-medium text-green-600">{trialConversionRate}%</span>
                      <span>50%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Results Grid */}
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div className="text-center">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-3xl font-bold text-blue-600">{newMembersPerMonth}</div>
                    <div className="text-sm text-blue-600 font-medium">New Members</div>
                    <div className="text-xs text-gray-500">per month</div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-3xl font-bold text-purple-600">{newMembersPerYear}</div>
                    <div className="text-sm text-purple-600 font-medium">New Members</div>
                    <div className="text-xs text-gray-500">per year</div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-3xl font-bold text-green-600">${additionalRevenue.toLocaleString()}</div>
                    <div className="text-sm text-green-600 font-medium">Additional Revenue</div>
                    <div className="text-xs text-gray-500">annually</div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="bg-emerald-50 rounded-lg p-4">
                    <div className="text-3xl font-bold text-emerald-600">${netGrowthRevenue.toLocaleString()}</div>
                    <div className="text-sm text-emerald-600 font-medium">Net Growth</div>
                    <div className="text-xs text-gray-500">after platform costs</div>
                  </div>
                </div>
              </div>

              {/* Growth Insights */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <Lightbulb className="h-6 w-6 text-green-600 mr-2" />
                  <h3 className="text-lg font-semibold text-green-800">Growth Insights</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-green-700">
                      <strong>ROI:</strong> Every trial member who converts generates 
                      ${(monthlyDues * 12).toLocaleString()} in annual revenue
                    </p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-green-700">
                      <strong>Platform pays for itself:</strong> Growth revenue covers all platform costs 
                      with ${netGrowthRevenue.toLocaleString()} extra annually
                    </p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-green-700">
                      <strong>Membership growth:</strong> {Math.round((newMembersPerYear / currentMembers) * 100)}% 
                      annual growth from trial conversions alone
                    </p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-green-700">
                      <strong>Member retention:</strong> Platform engagement increases retention 
                      and reduces churn significantly
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-4">How the Platform Drives Growth</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Chamber Connect isn't just a platform—it's a comprehensive growth strategy that 
            attracts new members, retains existing ones, and generates additional revenue.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-green-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Gift className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle className="text-green-800">Free Trial Memberships</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Offer 1-month free trial memberships to non-chamber businesses. They experience 
                  the value of networking and community before committing to full membership.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    No upfront costs for trials
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Easy conversion to paid membership
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Automated follow-up sequences
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-green-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Network className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle className="text-green-800">Networking & Connections</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Businesses connect with members, see the community value, and naturally want 
                  to join. The platform becomes a preview of chamber membership benefits.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Member directory access
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Event participation
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Business messaging
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-green-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CreditCard className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle className="text-green-800">Easy Monthly Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Remove payment friction with automated monthly billing. Members never worry 
                  about renewal dates or large annual payments.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Automatic recurring payments
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    No large upfront fees
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Improved cash flow for chamber
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-green-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Calendar className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle className="text-green-800">Event-Driven Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Events become member acquisition tools. Non-members attend, network with 
                  existing members, and see the community value firsthand.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Guest event access
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Follow-up automation
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Conversion tracking
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-green-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Target className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle className="text-green-800">Member Retention</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Active platform engagement increases member satisfaction and retention. 
                  Members who use the platform are significantly less likely to leave.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Higher engagement rates
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Reduced member churn
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Increased member satisfaction
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-green-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <DollarSign className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle className="text-green-800">Revenue Optimization</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Generate multiple revenue streams through membership growth, event attendance, 
                  and additional chamber services promoted through the platform.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Membership dues growth
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Event revenue increase
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Sponsorship opportunities
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-green-600 to-emerald-600 text-white">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Ready to Grow Your Chamber?</h3>
              <p className="mb-6 text-green-100">
                Join chambers that are already using Chamber Connect to drive membership 
                growth and increase revenue. Start your journey to sustainable growth today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-white text-green-600 hover:bg-gray-100"
                  onClick={() => navigate('/auth/chamber-signup')}
                >
                  Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-green-600"
                  onClick={() => navigate('/pricing')}
                >
                  View Pricing
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 