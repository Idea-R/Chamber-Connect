import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Settings, 
  Users, 
  Building2, 
  Shield, 
  Eye, 
  Database,
  Wrench,
  UserCog,
  Globe,
  RotateCcw,
  Bug
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface DevAdminPortalProps {
  onRoleSwitch: (role: string) => void
  onChamberSwitch: (chamberId: string) => void
  currentRole: string
  currentChamber: string | null
}

interface ChamberOption {
  id: string
  name: string
  location: string
  memberCount: number
  status: 'active' | 'demo' | 'test'
}

interface RoleOption {
  id: string
  name: string
  description: string
  permissions: string[]
  icon: React.ReactNode
}

export function DevAdminPortal({ 
  onRoleSwitch, 
  onChamberSwitch, 
  currentRole, 
  currentChamber 
}: DevAdminPortalProps) {
  const { user } = useAuth()
  const [chambers, setChambers] = useState<ChamberOption[]>([])
  const [isDevMode, setIsDevMode] = useState(true)
  const [debugInfo, setDebugInfo] = useState<any>({})

  const roles: RoleOption[] = [
    {
      id: 'super_admin',
      name: 'Super Admin',
      description: 'Ultimate developer access - can do everything',
      permissions: ['all_chambers', 'user_impersonation', 'data_modification', 'system_settings'],
      icon: <Shield className="h-4 w-4" />
    },
    {
      id: 'chamber_admin', 
      name: 'Chamber Admin',
      description: 'Chamber administrator with full chamber management',
      permissions: ['chamber_management', 'member_approval', 'event_management', 'billing'],
      icon: <Building2 className="h-4 w-4" />
    },
    {
      id: 'business_owner',
      name: 'Business Owner',
      description: 'Business member with standard access',
      permissions: ['profile_management', 'event_registration', 'networking'],
      icon: <Users className="h-4 w-4" />
    },
    {
      id: 'staff',
      name: 'Staff Member',
      description: 'Staff member with limited access',
      permissions: ['limited_profile', 'trial_events', 'basic_networking'],
      icon: <Eye className="h-4 w-4" />
    }
  ]

  const testChambers: ChamberOption[] = [
    {
      id: 'dev-chamber-1',
      name: 'Dev Test Chamber',
      location: 'Development Environment',
      memberCount: 25,
      status: 'demo'
    },
    {
      id: 'chamber-seattle',
      name: 'Seattle Chamber of Commerce',
      location: 'Seattle, WA',
      memberCount: 150,
      status: 'active'
    },
    {
      id: 'chamber-austin',
      name: 'Austin Business Network',
      location: 'Austin, TX',
      memberCount: 89,
      status: 'active'
    },
    {
      id: 'test-chamber-beta',
      name: 'Beta Testing Chamber',
      location: 'Test Environment',
      memberCount: 5,
      status: 'test'
    }
  ]

  useEffect(() => {
    setChambers(testChambers)
    loadDebugInfo()
  }, [])

  const loadDebugInfo = () => {
    setDebugInfo({
      environment: import.meta.env.MODE,
      userId: user?.id,
      userEmail: user?.email,
      sessionStarted: new Date().toISOString(),
      buildVersion: '1.0.0-dev',
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL?.substring(0, 30) + '...',
      apiCalls: 0,
      lastSync: new Date().toISOString()
    })
  }

  const handleQuickSwitch = (role: string, chamberId?: string) => {
    onRoleSwitch(role)
    if (chamberId) {
      onChamberSwitch(chamberId)
    }
  }

  const createTestProfile = async (role: string) => {
    // TODO: Implement test profile creation
    console.log(`Creating test profile for role: ${role}`)
  }

  const resetToCleanState = () => {
    onRoleSwitch('super_admin')
    onChamberSwitch('dev-chamber-1')
    loadDebugInfo()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wrench className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-orange-800">Developer Admin Portal</CardTitle>
              <Badge variant="destructive">DEV MODE</Badge>
            </div>
            <Button 
              onClick={resetToCleanState}
              variant="outline"
              size="sm"
              className="text-orange-600 border-orange-300"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Clean State
            </Button>
          </div>
          <CardDescription className="text-orange-700">
            Switch between roles and chambers to test all functionality. You have godmode access.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role Switching */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserCog className="h-5 w-5" />
              <span>Role Switching</span>
            </CardTitle>
            <CardDescription>
              Switch between different user roles to test permissions and functionality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {roles.map((role) => (
              <div 
                key={role.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  currentRole === role.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => onRoleSwitch(role.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {role.icon}
                    <span className="font-medium">{role.name}</span>
                    {currentRole === role.id && (
                      <Badge variant="secondary">ACTIVE</Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {role.permissions.map((permission) => (
                    <Badge key={permission} variant="outline" className="text-xs">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Chamber Switching */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>Chamber Context</span>
            </CardTitle>
            <CardDescription>
              Switch between different chambers to test functionality across contexts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {chambers.map((chamber) => (
              <div 
                key={chamber.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  currentChamber === chamber.id 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => onChamberSwitch(chamber.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{chamber.name}</span>
                      {currentChamber === chamber.id && (
                        <Badge variant="secondary">ACTIVE</Badge>
                      )}
                      <Badge 
                        variant={chamber.status === 'active' ? 'default' : 'outline'}
                        className={chamber.status === 'demo' ? 'bg-orange-100 text-orange-800' : ''}
                      >
                        {chamber.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{chamber.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{chamber.memberCount}</p>
                    <p className="text-xs text-gray-500">members</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Quick Developer Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button 
              onClick={() => handleQuickSwitch('chamber_admin', 'dev-chamber-1')}
              variant="outline"
              className="h-auto p-3 flex flex-col items-center space-y-1"
            >
              <Building2 className="h-4 w-4" />
              <span className="text-xs">Chamber Admin</span>
            </Button>
            
            <Button 
              onClick={() => handleQuickSwitch('business_owner', 'chamber-seattle')}
              variant="outline"
              className="h-auto p-3 flex flex-col items-center space-y-1"
            >
              <Users className="h-4 w-4" />
              <span className="text-xs">Business Owner</span>
            </Button>
            
            <Button 
              onClick={() => handleQuickSwitch('staff', 'chamber-austin')}
              variant="outline"
              className="h-auto p-3 flex flex-col items-center space-y-1"
            >
              <Eye className="h-4 w-4" />
              <span className="text-xs">Staff User</span>
            </Button>
            
            <Button 
              onClick={() => createTestProfile('business_owner')}
              variant="outline"
              className="h-auto p-3 flex flex-col items-center space-y-1"
            >
              <Database className="h-4 w-4" />
              <span className="text-xs">Create Test Profile</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Debug Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bug className="h-5 w-5" />
            <span>Debug Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-500">Environment</p>
              <p className="font-mono">{debugInfo.environment}</p>
            </div>
            <div>
              <p className="font-medium text-gray-500">User ID</p>
              <p className="font-mono text-xs">{debugInfo.userId?.substring(0, 8)}...</p>
            </div>
            <div>
              <p className="font-medium text-gray-500">Current Role</p>
              <Badge variant="outline">{currentRole}</Badge>
            </div>
            <div>
              <p className="font-medium text-gray-500">Build Version</p>
              <p className="font-mono">{debugInfo.buildVersion}</p>
            </div>
            <div>
              <p className="font-medium text-gray-500">Session Started</p>
              <p className="font-mono text-xs">{new Date(debugInfo.sessionStarted).toLocaleTimeString()}</p>
            </div>
            <div>
              <p className="font-medium text-gray-500">Supabase URL</p>
              <p className="font-mono text-xs">{debugInfo.supabaseUrl}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 