import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { LandingPage } from '@/pages/LandingPage'
import { ErrorBoundary, AsyncErrorBoundary } from '@/components/ui/error-boundary'
import { logger } from '@/lib/analytics-error-handler'

// Lazy load components for better code splitting
const ChamberLogin = lazy(() => import('@/pages/auth/ChamberLogin').then(m => ({ default: m.ChamberLogin })))
const ChamberSignup = lazy(() => import('@/pages/auth/ChamberSignup').then(m => ({ default: m.ChamberSignup })))
const BusinessLogin = lazy(() => import('@/pages/auth/BusinessLogin').then(m => ({ default: m.BusinessLogin })))
const BusinessSignup = lazy(() => import('@/pages/auth/BusinessSignup').then(m => ({ default: m.BusinessSignup })))
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword').then(m => ({ default: m.ForgotPassword })))
const MemberLogin = lazy(() => import('@/pages/auth/MemberLogin').then(m => ({ default: m.MemberLogin })))
const Dashboard = lazy(() => import('@/pages/Dashboard').then(m => ({ default: m.Dashboard })))
const Events = lazy(() => import('@/pages/Events').then(m => ({ default: m.Events })))
const Members = lazy(() => import('@/pages/Members').then(m => ({ default: m.Members })))
const Messages = lazy(() => import('@/pages/Messages').then(m => ({ default: m.Messages })))
const Spotlights = lazy(() => import('@/pages/Spotlights').then(m => ({ default: m.Spotlights })))
const ChamberPageManager = lazy(() => import('@/pages/ChamberPageManager').then(m => ({ default: m.ChamberPageManager })))
const PublicChamberPage = lazy(() => import('@/pages/PublicChamberPage').then(m => ({ default: m.PublicChamberPage })))
const FreeTrial = lazy(() => import('@/pages/pricing/FreeTrial').then(m => ({ default: m.FreeTrial })))
const Pricing = lazy(() => import('@/pages/pricing/Pricing').then(m => ({ default: m.Pricing })))
const Checkout = lazy(() => import('@/pages/pricing/Checkout').then(m => ({ default: m.Checkout })))
const Success = lazy(() => import('@/pages/pricing/Success').then(m => ({ default: m.Success })))
const AccountUpgrade = lazy(() => import('@/pages/pricing/AccountUpgrade').then(m => ({ default: m.AccountUpgrade })))

// Loading component with error boundary
function PageLoading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading...</p>
      </div>
    </div>
  )
}

function App() {
  // Log app initialization
  logger.info(
    'Chamber Connect application started',
    'app-init',
    {
      version: '1.0.0',
      environment: import.meta.env.MODE,
      timestamp: new Date().toISOString()
    }
  )

  return (
    <AsyncErrorBoundary operation="app-async-errors">
      <ErrorBoundary 
        operation="app-main" 
        retryable
        onError={(error, errorInfo) => {
          logger.error(
            'Critical application error',
            'app-error-boundary',
            {
              error: error.message,
              stack: error.stack,
              componentStack: errorInfo.componentStack
            }
          )
        }}
      >
        <Router>
          <ErrorBoundary operation="auth-provider">
            <AuthProvider>
              <Suspense 
                fallback={
                  <ErrorBoundary operation="page-loading">
                    <PageLoading />
                  </ErrorBoundary>
                }
              >
                <ErrorBoundary operation="routing-system" retryable>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={
                      <ErrorBoundary operation="landing-page">
                        <LandingPage />
                      </ErrorBoundary>
                    } />
                    <Route path="/pricing" element={
                      <ErrorBoundary operation="pricing-page">
                        <Pricing />
                      </ErrorBoundary>
                    } />
                    <Route path="/chamber/:chamberSlug" element={
                      <ErrorBoundary operation="public-chamber-page">
                        <PublicChamberPage />
                      </ErrorBoundary>
                    } />
                    
                    {/* Authentication Routes */}
                    <Route path="/auth/chamber-login" element={
                      <ErrorBoundary operation="chamber-login">
                        <ChamberLogin />
                      </ErrorBoundary>
                    } />
                    <Route path="/auth/chamber-signup" element={
                      <ErrorBoundary operation="chamber-signup">
                        <ChamberSignup />
                      </ErrorBoundary>
                    } />
                    <Route path="/auth/business-login" element={
                      <ErrorBoundary operation="business-login">
                        <BusinessLogin />
                      </ErrorBoundary>
                    } />
                    <Route path="/auth/business-signup" element={
                      <ErrorBoundary operation="business-signup">
                        <BusinessSignup />
                      </ErrorBoundary>
                    } />
                    <Route path="/auth/forgot-password" element={
                      <ErrorBoundary operation="forgot-password">
                        <ForgotPassword />
                      </ErrorBoundary>
                    } />
                    <Route path="/auth/member-login/:chamberSlug" element={
                      <ErrorBoundary operation="member-login">
                        <MemberLogin />
                      </ErrorBoundary>
                    } />
                    
                    {/* Protected Routes */}
                    <Route path="/dashboard" element={
                      <ErrorBoundary operation="dashboard" retryable>
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    } />
                    <Route path="/events" element={
                      <ErrorBoundary operation="events" retryable>
                        <ProtectedRoute>
                          <Events />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    } />
                    <Route path="/members" element={
                      <ErrorBoundary operation="members" retryable>
                        <ProtectedRoute>
                          <Members />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    } />
                    <Route path="/messages" element={
                      <ErrorBoundary operation="messages" retryable>
                        <ProtectedRoute>
                          <Messages />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    } />
                    <Route path="/spotlights" element={
                      <ErrorBoundary operation="spotlights" retryable>
                        <ProtectedRoute>
                          <Spotlights />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    } />
                    <Route path="/chamber-page-manager" element={
                      <ErrorBoundary operation="chamber-page-manager" retryable>
                        <ProtectedRoute>
                          <ChamberPageManager />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    } />
                    
                    {/* Pricing Routes */}
                    <Route path="/pricing/free-trial" element={
                      <ErrorBoundary operation="free-trial">
                        <FreeTrial />
                      </ErrorBoundary>
                    } />
                    <Route path="/pricing/checkout" element={
                      <ErrorBoundary operation="checkout">
                        <Checkout />
                      </ErrorBoundary>
                    } />
                    <Route path="/pricing/success" element={
                      <ErrorBoundary operation="success-page">
                        <Success />
                      </ErrorBoundary>
                    } />
                    <Route path="/free-trial" element={
                      <ErrorBoundary operation="free-trial-alt">
                        <FreeTrial />
                      </ErrorBoundary>
                    } />
                    <Route path="/checkout" element={
                      <ErrorBoundary operation="checkout-alt">
                        <Checkout />
                      </ErrorBoundary>
                    } />
                    <Route path="/success" element={
                      <ErrorBoundary operation="success-alt">
                        <Success />
                      </ErrorBoundary>
                    } />
                    <Route path="/account-upgrade" element={
                      <ErrorBoundary operation="account-upgrade">
                        <ProtectedRoute>
                          <AccountUpgrade />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    } />
                  </Routes>
                </ErrorBoundary>
              </Suspense>
            </AuthProvider>
          </ErrorBoundary>
        </Router>
      </ErrorBoundary>
    </AsyncErrorBoundary>
  )
}

export default App