import React from 'react'
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Building, Users, Mail, Lock, Eye, EyeOff, Globe, MapPin, Phone, CheckCircle, AlertCircle } from 'lucide-react'
import { createChamberAccount, checkChamberSlugAvailable, type ChamberCreatorSignup } from '@/lib/signup-flows'
import { logger } from '@/lib/analytics-error-handler'

type FormStep = 'chamber-details' | 'contact-info' | 'account-setup'
type ValidationStatus = 'idle' | 'checking' | 'available' | 'taken'

export function ChamberSignup() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState<FormStep>('chamber-details')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [slugValidation, setSlugValidation] = useState<ValidationStatus>('idle')
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState<ChamberCreatorSignup>({
    // Chamber details
    chamberName: '',
    chamberSlug: '',
    chamberDescription: '',
    chamberWebsite: '',
    chamberAddress: '',
    chamberPhone: '',
    chamberEmail: '',
    
    // User details
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    jobTitle: '',
    phone: ''
  })

  // Auto-generate slug from chamber name
  useEffect(() => {
    if (formData.chamberName && !formData.chamberSlug) {
      const generatedSlug = formData.chamberName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      
      setFormData(prev => ({ ...prev, chamberSlug: generatedSlug }))
    }
  }, [formData.chamberName, formData.chamberSlug])

  // Validate slug availability when it changes
  useEffect(() => {
    if (formData.chamberSlug && formData.chamberSlug.length >= 3) {
      const timeoutId = setTimeout(async () => {
        setSlugValidation('checking')
        const result = await checkChamberSlugAvailable(formData.chamberSlug)
        
        if (result.success) {
          setSlugValidation(result.data ? 'available' : 'taken')
          if (!result.data) {
            setFormErrors(prev => ({ ...prev, chamberSlug: 'This chamber URL is already taken' }))
          } else {
            setFormErrors(prev => {
              const { chamberSlug, ...rest } = prev
              return rest
            })
          }
        }
      }, 500)

      return () => clearTimeout(timeoutId)
    }
  }, [formData.chamberSlug])

  const handleInputChange = (field: keyof ChamberCreatorSignup, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => {
        const { [field]: removed, ...rest } = prev
        return rest
      })
    }
  }

  const validateStep = (step: FormStep): boolean => {
    const errors: Record<string, string> = {}

    if (step === 'chamber-details') {
      if (!formData.chamberName.trim()) errors.chamberName = 'Chamber name is required'
      if (!formData.chamberSlug.trim()) errors.chamberSlug = 'Chamber URL is required'
      if (slugValidation === 'taken') errors.chamberSlug = 'This chamber URL is already taken'
      if (!formData.chamberDescription.trim()) errors.chamberDescription = 'Description is required'
      if (!formData.chamberAddress.trim()) errors.chamberAddress = 'Address is required'
      if (!formData.chamberPhone.trim()) errors.chamberPhone = 'Phone number is required'
      if (!formData.chamberEmail.trim()) errors.chamberEmail = 'Chamber email is required'
    }

    if (step === 'contact-info') {
      if (!formData.firstName.trim()) errors.firstName = 'First name is required'
      if (!formData.lastName.trim()) errors.lastName = 'Last name is required'
      if (!formData.phone?.trim()) errors.phone = 'Phone number is required'
    }

    if (step === 'account-setup') {
      if (!formData.email.trim()) errors.email = 'Email is required'
      if (!formData.password.trim()) errors.password = 'Password is required'
      if (formData.password.length < 8) errors.password = 'Password must be at least 8 characters'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleNext = () => {
    if (!validateStep(currentStep)) return

    if (currentStep === 'chamber-details') {
      setCurrentStep('contact-info')
    } else if (currentStep === 'contact-info') {
      setCurrentStep('account-setup')
    }
  }

  const handleBack = () => {
    if (currentStep === 'contact-info') {
      setCurrentStep('chamber-details')
    } else if (currentStep === 'account-setup') {
      setCurrentStep('contact-info')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep('account-setup')) return

    setIsLoading(true)
    
    try {
      logger.info(
        'Chamber signup form submitted',
        'chamber-signup',
        { chamberName: formData.chamberName, email: formData.email }
      )

      const result = await createChamberAccount(formData)
      
      if (result.success) {
        logger.info(
          'Chamber signup successful',
          'chamber-signup',
          { 
            chamberId: result.data.chamber?.id || 'unknown', 
            userId: result.data.user.id,
            email: formData.email 
          }
        )

        // Show success message and redirect
        alert(`Chamber "${formData.chamberName}" created successfully! Welcome to Chamber Connect.`)
        navigate(result.data.redirectPath)
      } else {
        logger.warn(
          'Chamber signup failed',
          'chamber-signup',
          { email: formData.email, errorMessage: result.error.message }
        )
        alert(`Signup failed: ${result.error.message}`)
      }
    } catch (error) {
      logger.error(
        'Chamber signup error',
        'chamber-signup',
        { email: formData.email, errorMessage: 'Unexpected error' },
        error instanceof Error ? error : undefined
      )
      alert('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getStepProgress = () => {
    switch (currentStep) {
      case 'chamber-details': return 33
      case 'contact-info': return 66
      case 'account-setup': return 100
      default: return 0
    }
  }

  // Step 1: Chamber Details
  if (currentStep === 'chamber-details') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="mb-8">
            <Button variant="ghost" onClick={() => navigate('/auth/chamber-login')} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to login
            </Button>
          </div>

          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Create Your Chamber</CardTitle>
                  <CardDescription className="text-blue-100">
                    Step 1 of 3: Chamber Information
                  </CardDescription>
                </div>
                <Building className="h-8 w-8" />
              </div>
              <div className="mt-4 bg-blue-700 rounded-full h-2">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getStepProgress()}%` }}
                />
              </div>
            </CardHeader>

            <CardContent className="p-8">
              <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Chamber Name *</label>
                    <input
                      type="text"
                      value={formData.chamberName}
                      onChange={(e) => handleInputChange('chamberName', e.target.value)}
                      placeholder="Springfield Chamber of Commerce"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                    {formErrors.chamberName && (
                      <p className="text-red-600 text-sm mt-1">{formErrors.chamberName}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Chamber URL *</label>
                    <div className="flex items-center">
                      <span className="px-3 py-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md text-gray-600">
                        chamberconnect.com/
                      </span>
                      <input
                        type="text"
                        value={formData.chamberSlug}
                        onChange={(e) => handleInputChange('chamberSlug', e.target.value)}
                        placeholder="springfield-chamber"
                        className="flex-1 p-3 border border-gray-300 rounded-r-md focus:ring-2 focus:ring-blue-500"
                      />
                      {slugValidation === 'checking' && (
                        <div className="ml-2 text-yellow-600">
                          <div className="animate-spin h-4 w-4 border-2 border-yellow-600 border-t-transparent rounded-full" />
                        </div>
                      )}
                      {slugValidation === 'available' && (
                        <CheckCircle className="ml-2 h-5 w-5 text-green-600" />
                      )}
                      {slugValidation === 'taken' && (
                        <AlertCircle className="ml-2 h-5 w-5 text-red-600" />
                      )}
                    </div>
                    {formErrors.chamberSlug && (
                      <p className="text-red-600 text-sm mt-1">{formErrors.chamberSlug}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Description *</label>
                    <textarea
                      value={formData.chamberDescription}
                      onChange={(e) => handleInputChange('chamberDescription', e.target.value)}
                      rows={3}
                      placeholder="Brief description of your chamber and its mission..."
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                    {formErrors.chamberDescription && (
                      <p className="text-red-600 text-sm mt-1">{formErrors.chamberDescription}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Website</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="url"
                        value={formData.chamberWebsite}
                        onChange={(e) => handleInputChange('chamberWebsite', e.target.value)}
                        placeholder="https://yourchamber.org"
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.chamberPhone}
                        onChange={(e) => handleInputChange('chamberPhone', e.target.value)}
                        placeholder="(555) 123-4567"
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    {formErrors.chamberPhone && (
                      <p className="text-red-600 text-sm mt-1">{formErrors.chamberPhone}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Chamber Address *</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.chamberAddress}
                        onChange={(e) => handleInputChange('chamberAddress', e.target.value)}
                        placeholder="123 Main St, Springfield, IL 62701"
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    {formErrors.chamberAddress && (
                      <p className="text-red-600 text-sm mt-1">{formErrors.chamberAddress}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Chamber Email *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        value={formData.chamberEmail}
                        onChange={(e) => handleInputChange('chamberEmail', e.target.value)}
                        placeholder="info@yourchamber.org"
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    {formErrors.chamberEmail && (
                      <p className="text-red-600 text-sm mt-1">{formErrors.chamberEmail}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between pt-6">
                  <div></div>
                  <Button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={slugValidation === 'checking' || slugValidation === 'taken'}
                  >
                    Continue to Contact Info
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Step 2: Contact Information
  if (currentStep === 'contact-info') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Your Contact Information</CardTitle>
                  <CardDescription className="text-blue-100">
                    Step 2 of 3: Chamber Administrator Details
                  </CardDescription>
                </div>
                <Users className="h-8 w-8" />
              </div>
              <div className="mt-4 bg-blue-700 rounded-full h-2">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getStepProgress()}%` }}
                />
              </div>
            </CardHeader>

            <CardContent className="p-8">
              <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name *</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                    {formErrors.firstName && (
                      <p className="text-red-600 text-sm mt-1">{formErrors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name *</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                    {formErrors.lastName && (
                      <p className="text-red-600 text-sm mt-1">{formErrors.lastName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Job Title</label>
                    <input
                      type="text"
                      value={formData.jobTitle}
                      onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                      placeholder="Executive Director"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="(555) 123-4567"
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    {formErrors.phone && (
                      <p className="text-red-600 text-sm mt-1">{formErrors.phone}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between pt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleBack}
                  >
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Continue to Account Setup
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Step 3: Account Setup
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Create Your Account</CardTitle>
                <CardDescription className="text-blue-100">
                  Step 3 of 3: Account Credentials
                </CardDescription>
              </div>
              <Lock className="h-8 w-8" />
            </div>
            <div className="mt-4 bg-blue-700 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${getStepProgress()}%` }}
              />
            </div>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Admin Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="admin@yourchamber.org"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {formErrors.email && (
                  <p className="text-red-600 text-sm mt-1">{formErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="text-red-600 text-sm mt-1">{formErrors.password}</p>
                )}
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2">What happens next?</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Your chamber will be created and you'll become the administrator</li>
                  <li>• You can invite chamber staff and set up member tiers</li>
                  <li>• Start connecting with local businesses and organizing events</li>
                  <li>• Customize your chamber's profile and settings</li>
                </ul>
              </div>

              <div className="flex justify-between pt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleBack}
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Chamber...' : 'Create Chamber'}
                </Button>
              </div>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/auth/chamber-login" className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ChamberSignup