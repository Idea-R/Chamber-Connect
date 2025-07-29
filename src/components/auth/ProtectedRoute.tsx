import React from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireBusiness?: boolean
  requireChamber?: boolean
}

export function ProtectedRoute({ 
  children, 
  requireBusiness = false, 
  requireChamber = false 
}: ProtectedRouteProps) {
  const auth = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // Handle case where auth context is not available
  if (!auth) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Initializing...</p>
        </div>
      </div>
    )
  }

  const { user, loading, currentBusiness, currentChamber, userChambers } = auth

  console.log('ProtectedRoute check:', { 
    user: user?.id, 
    loading, 
    hasCurrentBusiness: !!currentBusiness,
    hasCurrentChamber: !!currentChamber,
    currentBusinessId: currentBusiness?.id, 
    currentChamberName: currentChamber?.name,
    userChambersCount: userChambers.length,
    userRoles: userChambers.map(c => ({ chamber: c.chamber?.name, role: c.role })),
    requireBusiness,
    requireChamber
  })

  if (loading) {
    console.log('ProtectedRoute: Still loading auth state')
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    console.log('No user found, redirecting to login.')
    const redirectUrl = `/auth/chamber-login?redirect=${encodeURIComponent(location.pathname)}`
    return <Navigate to={redirectUrl} state={{ from: location }} replace />
  }

  // Check specific requirements
  if (requireChamber && (!currentChamber || userChambers.length === 0)) {
    console.log('Chamber required but not found:', { currentChamber: !!currentChamber, userChambersCount: userChambers.length })
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Chamber Admin Access Required</h2>
          <p className="text-gray-600 mb-4">You need chamber administrator privileges to access this page.</p>
          {userChambers.length === 0 && (
            <p className="text-gray-500 text-sm mb-4">
              You are not currently a member of any chamber. Contact your chamber administrator for access.
            </p>
          )}
          <Button className="mt-4" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  if (requireBusiness && !currentBusiness) {
    console.log('Business required but not found:', { currentBusiness: !!currentBusiness })
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Business Profile Required</h2>
          <p className="text-gray-600">You need a business profile to access this feature.</p>
          <Button className="mt-4" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  console.log('ProtectedRoute allowing access')
  return <>{children}</>
}

export default ProtectedRoute