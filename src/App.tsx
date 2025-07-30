import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { DevAdminProvider } from './contexts/DevAdminContext'
import { DevToolsToggle } from './components/admin/DevToolsPanel'

// Layout
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/auth/ProtectedRoute'

// Pages
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import Members from './pages/Members'
import Events from './pages/Events'
import Messages from './pages/Messages'
import Spotlights from './pages/Spotlights'

// Auth Pages
import ChamberLogin from './pages/auth/ChamberLogin'
import ChamberSignup from './pages/auth/ChamberSignup'
import BusinessLogin from './pages/auth/BusinessLogin'
import BusinessSignup from './pages/auth/BusinessSignup'
import MemberLogin from './pages/auth/MemberLogin'
import ForgotPassword from './pages/auth/ForgotPassword'

// Pricing Pages
import Pricing from './pages/pricing/Pricing'
import FreeTrial from './pages/pricing/FreeTrial'
import Checkout from './pages/pricing/Checkout'
import Success from './pages/pricing/Success'
import AccountUpgrade from './pages/pricing/AccountUpgrade'

// Public Pages
import PublicChamberPage from './pages/PublicChamberPage'
import ChamberPageManager from './pages/ChamberPageManager'

// Error Boundary
import ErrorBoundary from './components/ui/error-boundary'

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <DevAdminProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              {/* Dev Tools - only shows in development mode */}
              <DevToolsToggle />
              
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/pricing/free-trial" element={<FreeTrial />} />
                <Route path="/pricing/checkout" element={<Checkout />} />
                <Route path="/pricing/success" element={<Success />} />
                <Route path="/pricing/account-upgrade" element={<AccountUpgrade />} />
                
                {/* Auth Routes */}
                <Route path="/auth/chamber-login" element={<ChamberLogin />} />
                <Route path="/auth/chamber-signup" element={<ChamberSignup />} />
                <Route path="/auth/business-login" element={<BusinessLogin />} />
                <Route path="/auth/business-signup" element={<BusinessSignup />} />
                <Route path="/auth/member-login" element={<MemberLogin />} />
                <Route path="/auth/forgot-password" element={<ForgotPassword />} />
                
                {/* Legacy Auth Routes (backward compatibility) */}
                <Route path="/chamber/login" element={<ChamberLogin />} />
                <Route path="/chamber/signup" element={<ChamberSignup />} />
                <Route path="/business/login" element={<BusinessLogin />} />
                <Route path="/business/signup" element={<BusinessSignup />} />
                <Route path="/member/login" element={<MemberLogin />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                
                {/* Legacy Pricing Routes (backward compatibility) */}
                <Route path="/trial" element={<FreeTrial />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/success" element={<Success />} />
                <Route path="/upgrade" element={<AccountUpgrade />} />
                
                {/* Public Chamber Pages */}
                <Route path="/chambers/:chamberSlug" element={<PublicChamberPage />} />
                <Route path="/chamber/:chamberSlug" element={<PublicChamberPage />} />
                
                {/* Protected Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/members" element={
                  <ProtectedRoute>
                    <Layout>
                      <Members />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/events" element={
                  <ProtectedRoute>
                    <Layout>
                      <Events />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/messages" element={
                  <ProtectedRoute>
                    <Layout>
                      <Messages />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/spotlights" element={
                  <ProtectedRoute>
                    <Layout>
                      <Spotlights />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/chamber-page-manager" element={
                  <ProtectedRoute>
                    <Layout>
                      <ChamberPageManager />
                    </Layout>
                  </ProtectedRoute>
                } />
              </Routes>
            </div>
          </Router>
        </DevAdminProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App