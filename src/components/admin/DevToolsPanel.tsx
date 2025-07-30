import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Settings, 
  X, 
  Minimize2, 
  Maximize2,
  Bug,
  Database,
  Users,
  Shield,
  LogIn,
  LogOut,
  User
} from 'lucide-react'
import { useDevAdmin } from '@/contexts/DevAdminContext'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { DevAdminPortal } from './DevAdminPortal'

// Test user accounts for each role
const TEST_USERS = {
  super_admin: {
    email: 'admin@chamber-connect.com',
    password: 'Admin123!@#',
    name: 'Super Admin',
    description: 'Full system access'
  },
  chamber_admin: {
    email: 'chamber.admin@test-chamber.com',
    password: 'Chamber123!@#',
    name: 'Chamber Admin',
    description: 'Chamber management'
  },
  business_owner: {
    email: 'business.owner@test-business.com',
    password: 'Business123!@#',
    name: 'Business Owner',
    description: 'Business profile management'
  },
  staff: {
    email: 'trial.user@test-trial.com',
    password: 'Trial123!@#',
    name: 'Staff User',
    description: 'Limited staff access'
  }
} as const

export function DevToolsPanel() {
  const devAdminContext = useDevAdmin()
  const { user, signIn, signOut } = useAuth()
  const navigate = useNavigate()
  const [isMinimized, setIsMinimized] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [loginLoading, setLoginLoading] = useState<string | null>(null)

  // Handle case where context is not available
  if (!devAdminContext) {
    return null
  }

  const { devState, switchRole, switchChamber, toggleDebugMode, resetToCleanState } = devAdminContext

  if (!devState.isDevMode || !isVisible) {
    return null
  }

  const handleTestLogin = async (userType: keyof typeof TEST_USERS) => {
    const testUser = TEST_USERS[userType]
    setLoginLoading(userType)
    
    try {
      const result = await signIn(testUser.email, testUser.password)
      if (!result.error) {
        // Switch to the appropriate role after login
        setTimeout(() => {
          switchRole(userType)
        }, 500)
        // Navigate to dashboard after successful login
        setTimeout(() => {
          navigate('/dashboard')
        }, 1000)
      } else {
        throw new Error(result.error.message)
      }
    } catch (error) {
      console.error(`Failed to login as ${userType}:`, error)
      alert(`Failed to login as ${testUser.name}. Make sure demo users are set up.`)
    } finally {
      setLoginLoading(null)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Failed to logout:', error)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isMinimized ? (
        // Minimized state - floating button
        <Card className="w-auto">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2">
              <Badge variant="destructive" className="animate-pulse">DEV</Badge>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsMinimized(false)}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsVisible(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Expanded state - full panel
        <Card className="w-96 max-h-[80vh] overflow-y-auto shadow-2xl border-2 border-orange-200">
          <CardHeader className="bg-orange-50 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-orange-600" />
                <CardTitle className="text-orange-800">Dev Tools</CardTitle>
                <Badge variant="destructive" className="animate-pulse">LIVE</Badge>
              </div>
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsMinimized(true)}
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsVisible(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-4 space-y-4">
            {/* Authentication Status */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm flex items-center">
                <User className="h-4 w-4 mr-1" />
                Authentication
              </h4>
              <div className="p-2 bg-gray-50 rounded border">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs">
                        <div className="font-medium">{user.email}</div>
                        <div className="text-gray-500">Logged in</div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleLogout}
                        className="h-6 text-xs"
                      >
                        <LogOut className="h-3 w-3 mr-1" />
                        Logout
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-gray-500">Not logged in</div>
                )}
              </div>
            </div>

            {/* Quick Test Login */}
            {!user && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm flex items-center">
                  <LogIn className="h-4 w-4 mr-1" />
                  Quick Test Login
                </h4>
                <div className="space-y-1">
                  {Object.entries(TEST_USERS).map(([userType, userData]) => (
                    <Button
                      key={userType}
                      size="sm"
                      variant="outline"
                      onClick={() => handleTestLogin(userType as keyof typeof TEST_USERS)}
                      disabled={loginLoading === userType}
                      className="w-full h-8 text-xs justify-start"
                    >
                      {loginLoading === userType ? (
                        <>
                          <div className="animate-spin h-3 w-3 mr-2 border border-gray-300 border-t-gray-600 rounded-full" />
                          Logging in...
                        </>
                      ) : (
                        <>
                          <LogIn className="h-3 w-3 mr-2" />
                          {userData.name}
                          <Badge variant="secondary" className="ml-auto text-xs">
                            {userType}
                          </Badge>
                        </>
                      )}
                    </Button>
                  ))}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  💡 Tip: Run <code>npm run setup-demo</code> to create test accounts
                </div>
              </div>
            )}

            {/* Current State */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Current State</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Role:</span>
                  <Badge variant="outline" className="ml-1 text-xs">
                    {devState.currentRole}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-500">Chamber:</span>
                  <Badge variant="outline" className="ml-1 text-xs">
                    {devState.currentChamber?.split('-')[0] || 'None'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Quick Role Switch */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Quick Switch</h4>
              <div className="grid grid-cols-2 gap-1">
                <Button
                  size="sm"
                  variant={devState.currentRole === 'super_admin' ? 'default' : 'outline'}
                  onClick={() => switchRole('super_admin')}
                  className="h-8 text-xs"
                >
                  <Shield className="h-3 w-3 mr-1" />
                  Admin
                </Button>
                <Button
                  size="sm"
                  variant={devState.currentRole === 'chamber_admin' ? 'default' : 'outline'}
                  onClick={() => switchRole('chamber_admin')}
                  className="h-8 text-xs"
                >
                  <Settings className="h-3 w-3 mr-1" />
                  Chamber
                </Button>
                <Button
                  size="sm"
                  variant={devState.currentRole === 'business_owner' ? 'default' : 'outline'}
                  onClick={() => switchRole('business_owner')}
                  className="h-8 text-xs"
                >
                  <Users className="h-3 w-3 mr-1" />
                  Business
                </Button>
                <Button
                  size="sm"
                  variant={devState.currentRole === 'staff' ? 'default' : 'outline'}
                  onClick={() => switchRole('staff')}
                  className="h-8 text-xs"
                >
                  <Database className="h-3 w-3 mr-1" />
                  Staff
                </Button>
              </div>
            </div>

            {/* Debug Tools */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Debug Tools</h4>
              <div className="flex flex-wrap gap-1">
                <Button
                  size="sm"
                  variant={devState.debugMode ? 'default' : 'outline'}
                  onClick={toggleDebugMode}
                  className="h-7 text-xs"
                >
                  <Bug className="h-3 w-3 mr-1" />
                  Debug {devState.debugMode ? 'ON' : 'OFF'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={resetToCleanState}
                  className="h-7 text-xs"
                >
                  Reset
                </Button>
              </div>
            </div>

            {/* Impersonation Status */}
            {devState.impersonatedUserId && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                <div className="flex items-center space-x-2">
                  <Badge variant="destructive">IMPERSONATING</Badge>
                  <span className="text-xs text-yellow-800">
                    User: {devState.impersonatedUserId.substring(0, 8)}...
                  </span>
                </div>
              </div>
            )}

            {/* Environment Info */}
            <div className="text-xs text-gray-500 pt-2 border-t">
              <div>Env: {import.meta.env.MODE}</div>
              <div>Build: 1.0.0-dev</div>
              <div>Time: {new Date().toLocaleTimeString()}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Component to toggle dev tools visibility
export function DevToolsToggle() {
  const { devState, switchRole, switchChamber } = useDevAdmin()
  const [showPanel, setShowPanel] = useState(false)

  if (!devState.isDevMode) {
    return null
  }

  return (
    <>
      {/* Toggle button in corner if panel isn't showing */}
      {!showPanel && (
        <div className="fixed top-4 right-4 z-40">
          <Button
            size="sm"
            onClick={() => setShowPanel(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Settings className="h-4 w-4 mr-1" />
            DEV
          </Button>
        </div>
      )}

      {/* Dev Panel */}
      {showPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b bg-orange-50 flex items-center justify-between">
              <h2 className="text-xl font-bold text-orange-800">Developer Admin Portal</h2>
              <Button
                variant="ghost"
                onClick={() => setShowPanel(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-6">
              <DevAdminPortal
                onRoleSwitch={switchRole}
                onChamberSwitch={switchChamber}
                currentRole={devState.currentRole}
                currentChamber={devState.currentChamber}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
} 