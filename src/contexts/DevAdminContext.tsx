import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { logger } from '@/lib/analytics-error-handler'

interface DevAdminState {
  isDevMode: boolean
  currentRole: string
  currentChamber: string | null
  impersonatedUserId: string | null
  debugMode: boolean
  testDataEnabled: boolean
}

interface DevAdminContextType {
  // State
  devState: DevAdminState
  
  // Role Management
  switchRole: (role: string) => void
  switchChamber: (chamberId: string) => void
  impersonateUser: (userId: string) => void
  stopImpersonation: () => void
  
  // Debug Tools
  toggleDebugMode: () => void
  toggleTestData: () => void
  resetToCleanState: () => void
  
  // Utilities
  hasPermission: (permission: string) => boolean
  getCurrentContext: () => { role: string; chamber: string | null; isImpersonating: boolean }
  
  // Test Data Management
  createTestProfile: (role: string, chamber?: string) => Promise<void>
  cleanupDemoData: () => Promise<void>
}

const DevAdminContext = createContext<DevAdminContextType | undefined>(undefined)

interface DevAdminProviderProps {
  children: ReactNode
}

const ROLE_PERMISSIONS = {
  super_admin: [
    'all_chambers',
    'user_impersonation', 
    'data_modification',
    'system_settings',
    'chamber_management',
    'member_approval',
    'event_management',
    'billing',
    'profile_management',
    'event_registration',
    'networking'
  ],
  chamber_admin: [
    'chamber_management',
    'member_approval', 
    'event_management',
    'billing',
    'profile_management',
    'event_registration',
    'networking'
  ],
  business_owner: [
    'profile_management',
    'event_registration',
    'networking'
  ],
  business_trial: [
    'limited_profile',
    'trial_events',
    'basic_networking'
  ]
}

export function DevAdminProvider({ children }: DevAdminProviderProps) {
  const { user } = useAuth()
  const [devState, setDevState] = useState<DevAdminState>({
    isDevMode: import.meta.env.MODE === 'development',
    currentRole: 'super_admin',
    currentChamber: 'dev-chamber-1',
    impersonatedUserId: null,
    debugMode: true,
    testDataEnabled: true
  })

  // Initialize dev mode based on environment and user
  useEffect(() => {
    const isDev = import.meta.env.MODE === 'development' || 
                  user?.email?.includes('@admin.chamber-connect.com') ||
                  localStorage.getItem('chamber-connect-dev-mode') === 'true'
    
    setDevState(prev => ({
      ...prev,
      isDevMode: isDev
    }))

    if (isDev) {
      logger.info('Developer admin mode activated', 'dev-admin-init', {
        userId: user?.id,
        environment: import.meta.env.MODE
      })
    }
  }, [user])

  const switchRole = (role: string) => {
    logger.info('Role switched', 'dev-admin-role-switch', {
      from: devState.currentRole,
      to: role,
      userId: user?.id
    })

    setDevState(prev => ({
      ...prev,
      currentRole: role
    }))

    // Store in localStorage for persistence
    localStorage.setItem('chamber-connect-dev-role', role)
  }

  const switchChamber = (chamberId: string) => {
    logger.info('Chamber context switched', 'dev-admin-chamber-switch', {
      from: devState.currentChamber,
      to: chamberId,
      userId: user?.id
    })

    setDevState(prev => ({
      ...prev,
      currentChamber: chamberId
    }))

    localStorage.setItem('chamber-connect-dev-chamber', chamberId)
  }

  const impersonateUser = (userId: string) => {
    logger.info('User impersonation started', 'dev-admin-impersonate', {
      targetUserId: userId,
      adminUserId: user?.id
    })

    setDevState(prev => ({
      ...prev,
      impersonatedUserId: userId
    }))
  }

  const stopImpersonation = () => {
    logger.info('User impersonation stopped', 'dev-admin-stop-impersonate', {
      wasImpersonating: devState.impersonatedUserId,
      adminUserId: user?.id
    })

    setDevState(prev => ({
      ...prev,
      impersonatedUserId: null
    }))
  }

  const toggleDebugMode = () => {
    setDevState(prev => ({
      ...prev,
      debugMode: !prev.debugMode
    }))
  }

  const toggleTestData = () => {
    setDevState(prev => ({
      ...prev,
      testDataEnabled: !prev.testDataEnabled
    }))
  }

  const resetToCleanState = () => {
    logger.info('Resetting to clean dev state', 'dev-admin-reset')
    
    setDevState(prev => ({
      ...prev,
      currentRole: 'super_admin',
      currentChamber: 'dev-chamber-1',
      impersonatedUserId: null,
      debugMode: true,
      testDataEnabled: true
    }))

    // Clear localStorage
    localStorage.removeItem('chamber-connect-dev-role')
    localStorage.removeItem('chamber-connect-dev-chamber')
  }

  const hasPermission = (permission: string): boolean => {
    const rolePermissions = ROLE_PERMISSIONS[devState.currentRole as keyof typeof ROLE_PERMISSIONS] || []
    return rolePermissions.includes(permission)
  }

  const getCurrentContext = () => ({
    role: devState.currentRole,
    chamber: devState.currentChamber,
    isImpersonating: !!devState.impersonatedUserId
  })

  const createTestProfile = async (role: string, chamber?: string) => {
    try {
      logger.info('Creating test profile', 'dev-admin-create-test', {
        role,
        chamber,
        adminUserId: user?.id
      })

      // TODO: Implement test profile creation logic
      // This would create users in Supabase with the specified role and chamber
      const testProfile = {
        role,
        chamber: chamber || devState.currentChamber,
        created_by: user?.id,
        created_at: new Date().toISOString()
      }

      console.log('Test profile would be created:', testProfile)
      
      // For now, just log the action
      alert(`Test profile creation logged for role: ${role}`)
    } catch (error) {
      logger.error('Failed to create test profile', 'dev-admin-create-test-error', {
        role,
        chamber,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  const cleanupDemoData = async () => {
    try {
      logger.info('Cleaning up demo data', 'dev-admin-cleanup-demo', {
        adminUserId: user?.id
      })

      // TODO: Implement demo data cleanup
      // This would remove all demo/test accounts and data
      console.log('Demo data cleanup would be performed')
      
      alert('Demo data cleanup logged - would remove all demo accounts and test data')
    } catch (error) {
      logger.error('Failed to cleanup demo data', 'dev-admin-cleanup-error', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  // Load persisted state on mount
  useEffect(() => {
    const savedRole = localStorage.getItem('chamber-connect-dev-role')
    const savedChamber = localStorage.getItem('chamber-connect-dev-chamber')

    if (savedRole) {
      setDevState(prev => ({ ...prev, currentRole: savedRole }))
    }
    if (savedChamber) {
      setDevState(prev => ({ ...prev, currentChamber: savedChamber }))
    }
  }, [])

  const value: DevAdminContextType = {
    devState,
    switchRole,
    switchChamber,
    impersonateUser,
    stopImpersonation,
    toggleDebugMode,
    toggleTestData,
    resetToCleanState,
    hasPermission,
    getCurrentContext,
    createTestProfile,
    cleanupDemoData
  }

  return (
    <DevAdminContext.Provider value={value}>
      {children}
    </DevAdminContext.Provider>
  )
}

export const useDevAdmin = () => {
  const context = useContext(DevAdminContext)
  if (context === undefined) {
    throw new Error('useDevAdmin must be used within a DevAdminProvider')
  }
  return context
}

// Hook to conditionally show dev features
export const useIsDevMode = () => {
  const { devState } = useDevAdmin()
  return devState.isDevMode
}

// Hook to check permissions
export const useDevPermissions = () => {
  const { hasPermission, getCurrentContext } = useDevAdmin()
  return { hasPermission, getCurrentContext }
} 