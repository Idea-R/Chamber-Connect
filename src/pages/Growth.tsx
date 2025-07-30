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
  const [yearlyDues, setYearlyDues] = useState(600)
  const [trialConversionRate, setTrialConversionRate] = useState(30)
  const [trialsPerMonth, setTrialsPerMonth] = useState(20)
  const [billingMode, setBillingMode] = useState<'monthly' | 'yearly'>('monthly')
  const [yearlyDiscount, setYearlyDiscount] = useState(10) // 0-20% configurable discount
  const [showTieredOptions, setShowTieredOptions] = useState(false)

  // Calculate growth metrics based on billing mode
  const newMembersPerMonth = Math.round(trialsPerMonth * (trialConversionRate / 100))
  const newMembersPerYear = newMembersPerMonth * 12
  
  let effectiveMonthlyRate: number
  let effectiveYearlyRate: number
  let annualRevenuePerMember: number
  
  if (billingMode === 'monthly') {
    effectiveMonthlyRate = monthlyDues
    effectiveYearlyRate = monthlyDues * 12
    annualRevenuePerMember = monthlyDues * 12
  } else {
    // Yearly mode with configurable discount
    const discountedYearlyDues = yearlyDues * (1 - yearlyDiscount / 100)
    effectiveYearlyRate = discountedYearlyDues
    effectiveMonthlyRate = discountedYearlyDues / 12
    annualRevenuePerMember = discountedYearlyDues
  }
  
  const additionalRevenue = newMembersPerYear * annualRevenuePerMember
  const platformCost = currentMembers * annualRevenuePerMember * 0.10
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

                  {/* Dues Input - Changes based on billing mode */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {billingMode === 'monthly' ? 'Monthly Dues per Member' : 'Yearly Dues per Member'}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={billingMode === 'monthly' ? monthlyDues : yearlyDues}
                        onChange={(e) => {
                          const value = Number(e.target.value)
                          if (billingMode === 'monthly') {
                            setMonthlyDues(value)
                          } else {
                            setYearlyDues(value)
                          }
                        }}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div className="flex space-x-2 mt-2">
                      {billingMode === 'monthly' ? (
                        [30, 50, 75, 100].map(amount => (
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
                        ))
                      ) : (
                        [360, 600, 900, 1200].map(amount => (
                          <button
                            key={amount}
                            onClick={() => setYearlyDues(amount)}
                            className={`px-3 py-1 text-xs rounded ${
                              yearlyDues === amount 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            ${amount}
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Billing Mode Toggle */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Billing Mode
                    </label>
                    <div className="flex bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setBillingMode('monthly')}
                        className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                          billingMode === 'monthly'
                            ? 'bg-green-600 text-white'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Monthly
                      </button>
                      <button
                        onClick={() => setBillingMode('yearly')}
                        className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                          billingMode === 'yearly'
                            ? 'bg-green-600 text-white'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Yearly
                      </button>
                    </div>
                  </div>

                  {/* Yearly Discount Slider - Only shown in yearly mode */}
                  {billingMode === 'yearly' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Yearly Discount: {yearlyDiscount}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        value={yearlyDiscount}
                        onChange={(e) => setYearlyDiscount(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0%</span>
                        <span>10%</span>
                        <span>20%</span>
                      </div>
                      <p className="text-xs text-green-600 mt-2">
                        Effective yearly rate: ${effectiveYearlyRate.toFixed(0)} 
                        (${(yearlyDues * yearlyDiscount / 100).toFixed(0)} total savings)
                      </p>
                      <p className="text-xs text-gray-500">
                        Monthly equivalent: ${effectiveMonthlyRate.toFixed(0)}/month
                      </p>
                    </div>
                  )}
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
                       ${annualRevenuePerMember.toLocaleString()} in annual revenue
                       {billingMode === 'yearly' && (
                         <span className="text-xs"> (with {yearlyDiscount}% yearly discount)</span>
                       )}
                     </p>
                   </div>
                   <div className="flex items-start space-x-2">
                     <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                     <p className="text-green-700">
                       <strong>Platform pays for itself:</strong> Growth revenue covers all platform costs 
                       with ${netGrowthRevenue.toLocaleString()} extra annually
                       {billingMode === 'yearly' && (
                         <span className="text-xs"> (including ${yearlyDiscount}% yearly savings)</span>
                       )}
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

        {/* Tiered Membership Options */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Flexible Membership Tiers</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Create customized membership levels for your chamber. Offer premium features to sponsors 
              and major contributors while providing value at every level.
            </p>
            <Button 
              variant="outline" 
              onClick={() => setShowTieredOptions(!showTieredOptions)}
              className="mt-4"
            >
              {showTieredOptions ? 'Hide' : 'Show'} Tiered Options
            </Button>
          </div>

          {showTieredOptions && (
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {/* Silver Tier */}
              <Card className="border-gray-300 hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gray-50 rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl text-gray-700">Silver Membership</CardTitle>
                    <Badge variant="outline" className="bg-gray-100">Standard</Badge>
                  </div>
                  <CardDescription>Perfect for small businesses and startups</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    {billingMode === 'monthly' ? (
                      <>
                        <div className="text-3xl font-bold text-gray-700">${monthlyDues}</div>
                        <div className="text-sm text-gray-500">per month</div>
                      </>
                    ) : (
                      <>
                        <div className="text-3xl font-bold text-gray-700">${effectiveYearlyRate.toFixed(0)}</div>
                        <div className="text-sm text-gray-500">per year</div>
                        <div className="text-xs text-green-600">
                          ${effectiveMonthlyRate.toFixed(0)}/month equivalent
                        </div>
                      </>
                    )}
                  </div>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      Member directory access
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      Event registration
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      Basic networking tools
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      Monthly newsletter
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Gold Tier */}
              <Card className="border-yellow-300 hover:shadow-lg transition-shadow relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-yellow-500 text-white">Most Popular</Badge>
                </div>
                <CardHeader className="bg-yellow-50 rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl text-yellow-700">Gold Membership</CardTitle>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-700">Enhanced</Badge>
                  </div>
                  <CardDescription>Ideal for growing businesses and active networkers</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    {billingMode === 'monthly' ? (
                      <>
                        <div className="text-3xl font-bold text-yellow-700">${Math.round(monthlyDues * 1.5)}</div>
                        <div className="text-sm text-gray-500">per month</div>
                      </>
                    ) : (
                      <>
                        <div className="text-3xl font-bold text-yellow-700">${Math.round(effectiveYearlyRate * 1.5)}</div>
                        <div className="text-sm text-gray-500">per year</div>
                        <div className="text-xs text-green-600">
                          ${Math.round(effectiveMonthlyRate * 1.5)}/month equivalent
                        </div>
                      </>
                    )}
                  </div>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      Everything in Silver
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      Priority event access
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      Business spotlight opportunities
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      Quarterly networking mixers
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      Enhanced profile features
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Platinum Tier */}
              <Card className="border-purple-300 hover:shadow-lg transition-shadow">
                <CardHeader className="bg-purple-50 rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl text-purple-700">Platinum Membership</CardTitle>
                    <Badge variant="outline" className="bg-purple-100 text-purple-700">Premium</Badge>
                  </div>
                  <CardDescription>For sponsors and major chamber contributors</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    {billingMode === 'monthly' ? (
                      <>
                        <div className="text-3xl font-bold text-purple-700">${Math.round(monthlyDues * 2.5)}</div>
                        <div className="text-sm text-gray-500">per month</div>
                      </>
                    ) : (
                      <>
                        <div className="text-3xl font-bold text-purple-700">${Math.round(effectiveYearlyRate * 2.5)}</div>
                        <div className="text-sm text-gray-500">per year</div>
                        <div className="text-xs text-green-600">
                          ${Math.round(effectiveMonthlyRate * 2.5)}/month equivalent
                        </div>
                      </>
                    )}
                  </div>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      Everything in Gold
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      Exclusive sponsor events
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      Premium business listings
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      Board meeting participation
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      Custom sponsorship opportunities
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      Dedicated chamber liaison
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Pricing Flexibility Info */}
          <div className="mt-12 max-w-4xl mx-auto">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-blue-900 mb-2">Complete Pricing Flexibility</h3>
                  <p className="text-blue-700">
                    Chamber Connect adapts to your chamber's unique pricing strategy
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-3">Billing Options</h4>
                    <ul className="space-y-2 text-sm text-blue-700">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                        Monthly or yearly billing cycles
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                        Custom yearly discounts (5-25%)
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                        Automatic recurring payments
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                        Prorated upgrades/downgrades
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-3">Membership Tiers</h4>
                    <ul className="space-y-2 text-sm text-blue-700">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                        Unlimited custom membership levels
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                        Tailored features per tier
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                        Sponsor-exclusive benefits
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                        Easy tier management dashboard
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="text-center mt-6">
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => navigate('/auth/chamber-signup')}
                  >
                    Set Up Your Pricing Structure
                  </Button>
                </div>
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