import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, auth } from '@/lib/supabase'
import { logger } from '@/lib/analytics-error-handler'
import { 
  getChamberSubscription, 
  calculateUserPermissions,
  hasActiveSubscription,
  isInTrialPeriod,
  getTrialDaysRemaining
} from '@/lib/subscription-utils'
import type { 
  ChamberMembership, 
  UserProfile, 
  Chamber, 
  ChamberSubscription,
  Business
} from '@/lib/supabase-types'

interface UserPermissions {
  canManageChamber: boolean
  canManageMembers: boolean
  canCreateEvents: boolean
  canViewAnalytics: boolean
  canAccessCrossChamber: boolean
  canManageSubscription: boolean
}

interface AuthContextType {
  // Core auth state
  user: User | null
  session: Session | null
  userProfile: UserProfile | null
  loading: boolean

  // Chamber and business context
  currentBusiness: Business | null
  currentChamber: Chamber | null
  userChambers: ChamberMembership[]
  primaryMembership: ChamberMembership | null

  // Subscription and permissions
  subscription: ChamberSubscription | null
  permissions: UserPermissions
  isTrialing: boolean
  trialDaysRemaining: number
  hasActiveSubscription: boolean

  // Auth methods
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any; user: User | null }>
  signOut: () => Promise<void>
  
  // Chamber management
  createChamberProfile: (userId: string, chamberData: any) => Promise<{ error: any }>
  switchChamber: (chamberId: string) => Promise<void>
  
  // Utility methods
  isChamberAdmin: (chamberId: string) => Promise<boolean>
  isChamberMember: (chamberId: string) => Promise<boolean>
  refreshUserData: () => Promise<void>
}

const defaultPermissions: UserPermissions = {
  canManageChamber: false,
  canManageMembers: false,
  canCreateEvents: false,
  canViewAnalytics: false,
  canAccessCrossChamber: false,
  canManageSubscription: false
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Core auth state
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Chamber and business context
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null)
  const [currentChamber, setCurrentChamber] = useState<Chamber | null>(null)
  const [userChambers, setUserChambers] = useState<ChamberMembership[]>([])
  const [primaryMembership, setPrimaryMembership] = useState<ChamberMembership | null>(null)

  // Subscription and permissions
  const [subscription, setSubscription] = useState<ChamberSubscription | null>(null)
  const [permissions, setPermissions] = useState<UserPermissions>(defaultPermissions)

  // Computed subscription status
  const isTrialing = isInTrialPeriod(subscription)
  const trialDaysRemaining = getTrialDaysRemaining(subscription)
  const hasActiveSubscriptionStatus = hasActiveSubscription(subscription)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchUserData(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logger.info(
          `Auth state changed: ${event}`,
          'auth-state-change',
          { event, userId: session?.user?.id }
        )

        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchUserData(session.user.id)
        } else {
          clearUserData()
        }
        setLoading(false)
      }
    )

    return () => authSubscription.unsubscribe()
  }, [])

  const clearUserData = () => {
    setUserProfile(null)
    setCurrentBusiness(null)
    setCurrentChamber(null)
    setUserChambers([])
    setPrimaryMembership(null)
    setSubscription(null)
    setPermissions(defaultPermissions)
  }

  const fetchUserData = async (userId: string) => {
    try {
      logger.debug(
        'Fetching comprehensive user data',
        'auth-fetch-user-data',
        { userId }
      )
      
      // Get user profile
      const profile = await getUserProfile(userId)
      setUserProfile(profile)
      
      // Get all user chambers through memberships
      const chambers = await auth.getUserChambers()
      setUserChambers(chambers)
      
      // Determine primary chamber and membership
      const primary = determinePrimaryChamber(chambers)
      setPrimaryMembership(primary)
      setCurrentChamber(primary?.chamber || null)
      
      // Get user's business profile
      const business = await auth.getCurrentBusiness()
      setCurrentBusiness(business)
      
      // Get subscription for primary chamber
      let chamberSubscription = null
      if (primary?.chamber_id) {
        chamberSubscription = await getChamberSubscription(primary.chamber_id)
        setSubscription(chamberSubscription)
      }
      
      // Calculate permissions
      if (profile && primary) {
        const userPermissions = calculateUserPermissions(
          profile.role,
          primary,
          chamberSubscription
        )
        setPermissions(userPermissions)
      } else {
        setPermissions(defaultPermissions)
      }
      
      logger.info(
        'User data fetch completed',
        'auth-fetch-user-data',
        { 
          userId,
          chambersCount: chambers.length,
          hasSubscription: !!chamberSubscription,
          userRole: profile?.role,
          primaryChamberRole: primary?.role
        }
      )
      
    } catch (error) {
      logger.error(
        'Error fetching user data',
        'auth-fetch-user-data',
        { userId },
        error instanceof Error ? error : new Error(String(error))
      )
      clearUserData()
    }
  }

  const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create it
          return await createUserProfile(userId)
        }
        throw error
      }

      return data
    } catch (error) {
      logger.error(
        'Error fetching user profile',
        'auth-get-user-profile',
        { userId },
        error instanceof Error ? error : new Error(String(error))
      )
      return null
    }
  }

  const createUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const profileData = {
        id: userId,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
        role: 'business_owner' as const,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .insert(profileData)
        .select()
        .single()

      if (error) throw error

      logger.info(
        'User profile created',
        'auth-create-user-profile',
        { userId, role: profileData.role }
      )

      return data
    } catch (error) {
      logger.error(
        'Error creating user profile',
        'auth-create-user-profile',
        { userId },
        error instanceof Error ? error : new Error(String(error))
      )
      return null
    }
  }

  const determinePrimaryChamber = (chambers: ChamberMembership[]): ChamberMembership | null => {
    if (chambers.length === 0) return null
    
    // Prioritize: admin > staff > member, then by join date
    const adminChamber = chambers.find(c => c.role === 'admin')
    if (adminChamber) return adminChamber
    
    const staffChamber = chambers.find(c => c.role === 'staff')
    if (staffChamber) return staffChamber
    
    // Return earliest joined member chamber
    return chambers.sort((a, b) => 
      new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime()
    )[0]
  }

  const switchChamber = async (chamberId: string) => {
    try {
      const targetMembership = userChambers.find(c => c.chamber_id === chamberId)
      if (!targetMembership) {
        throw new Error('User is not a member of the specified chamber')
      }

      setPrimaryMembership(targetMembership)
      setCurrentChamber(targetMembership.chamber || null)

      // Update subscription and permissions for new chamber
      const chamberSubscription = await getChamberSubscription(chamberId)
      setSubscription(chamberSubscription)

      if (userProfile && targetMembership) {
        const userPermissions = calculateUserPermissions(
          userProfile.role,
          targetMembership,
          chamberSubscription
        )
        setPermissions(userPermissions)
      }

      logger.info(
        'Switched chamber context',
        'auth-switch-chamber',
        { 
          userId: user?.id, 
          chamberId, 
          newRole: targetMembership.role 
        }
      )
    } catch (error) {
      logger.error(
        'Error switching chamber',
        'auth-switch-chamber',
        { userId: user?.id, chamberId },
        error instanceof Error ? error : new Error(String(error))
      )
    }
  }

  const refreshUserData = async () => {
    if (user) {
      await fetchUserData(user.id)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      logger.info(
        'Sign in attempt',
        'auth-sign-in',
        { email }
      )
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        logger.warn(
          'Sign in failed',
          'auth-sign-in',
          { email, errorCode: error.message }
        )
        return { error }
      }
      
      if (!data.user) {
        return { error: { message: 'No user returned from authentication' } }
      }
      
      logger.info(
        'Sign in successful',
        'auth-sign-in',
        { userId: data.user.id }
      )
      
      return { error: null }
    } catch (error) {
      logger.error(
        'Sign in error',
        'auth-sign-in',
        { email },
        error instanceof Error ? error : new Error(String(error))
      )
      return { error: { message: 'An unexpected error occurred during sign in' } }
    }
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      logger.info(
        'Sign up attempt',
        'auth-sign-up',
        { email }
      )
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })
      
      if (error) {
        logger.warn(
          'Sign up failed',
          'auth-sign-up',
          { email, errorCode: error.message }
        )
        return { error, user: null }
      }
      
      if (!data.user) {
        return { error: { message: 'No user returned from signup' }, user: null }
      }
      
      logger.info(
        'Sign up successful',
        'auth-sign-up',
        { userId: data.user.id }
      )
      
      return { error: null, user: data.user }
    } catch (error) {
      logger.error(
        'Sign up error',
        'auth-sign-up',
        { email },
        error instanceof Error ? error : new Error(String(error))
      )
      return { error: { message: 'An unexpected error occurred during sign up' }, user: null }
    }
  }

  const createChamberProfile = async (userId: string, chamberData: any) => {
    try {
      logger.info(
        'Creating chamber profile',
        'auth-create-chamber',
        { userId, chamberName: chamberData.name }
      )
      
      if (!chamberData.name || !chamberData.slug) {
        return { error: { message: 'Chamber name and slug are required' } }
      }
      
      const { data: chamber, error } = await supabase
        .from('chambers')
        .insert({
          name: chamberData.name,
          slug: chamberData.slug,
          tagline: chamberData.tagline || '',
          description: chamberData.description || '',
          address: chamberData.address || '',
          phone: chamberData.phone || '',
          email: chamberData.email || '',
          website: chamberData.website || '',
          about_section: chamberData.about_section || '',
          settings: chamberData.settings || {}
        })
        .select()
        .single()

      if (error) {
        logger.error(
          'Error creating chamber',
          'auth-create-chamber',
          { userId, errorCode: error.code }
        )
        return { error }
      }
      
      // Create chamber membership for the user as admin
      const { error: membershipError } = await supabase
        .from('chamber_memberships')
        .insert({
          user_id: userId,
          chamber_id: chamber.id,
          role: 'admin',
          status: 'active'
        })

      if (membershipError) {
        logger.error(
          'Error creating chamber membership',
          'auth-create-chamber',
          { userId, chamberId: chamber.id, errorCode: membershipError.code }
        )
        return { error: membershipError }
      }

      // Update user profile role to chamber_admin
      await supabase
        .from('user_profiles')
        .update({ role: 'chamber_admin' })
        .eq('id', userId)

      logger.info(
        'Chamber created successfully',
        'auth-create-chamber',
        { userId, chamberId: chamber.id }
      )
      
      // Refresh user data to include new chamber
      await refreshUserData()
      
      return { error: null }
    } catch (error) {
      logger.error(
        'Error creating chamber profile',
        'auth-create-chamber',
        { userId },
        error instanceof Error ? error : new Error(String(error))
      )
      return { error }
    }
  }

  const signOut = async () => {
    try {
      logger.info(
        'Signing out user',
        'auth-sign-out',
        { userId: user?.id }
      )
      
      clearUserData()
      await supabase.auth.signOut()
    } catch (error) {
      logger.error(
        'Sign out error',
        'auth-sign-out',
        { userId: user?.id },
        error instanceof Error ? error : new Error(String(error))
      )
    }
  }

  const value: AuthContextType = {
    // Core auth state
    user,
    session,
    userProfile,
    loading,

    // Chamber and business context
    currentBusiness,
    currentChamber,
    userChambers,
    primaryMembership,

    // Subscription and permissions
    subscription,
    permissions,
    isTrialing,
    trialDaysRemaining,
    hasActiveSubscription: hasActiveSubscriptionStatus,

    // Auth methods
    signIn,
    signUp,
    signOut,

    // Chamber management
    createChamberProfile,
    switchChamber,

    // Utility methods
    isChamberAdmin: auth.isChamberAdmin,
    isChamberMember: auth.isChamberMember,
    refreshUserData
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    logger.error(
      'useAuth hook used outside AuthProvider',
      'auth-context-error',
      {}
    )
    
    // Return a safe default context to prevent crashes
    return {
      user: null,
      session: null,
      userProfile: null,
      loading: true,
      currentBusiness: null,
      currentChamber: null,
      userChambers: [],
      primaryMembership: null,
      subscription: null,
      permissions: defaultPermissions,
      isTrialing: false,
      trialDaysRemaining: 0,
      hasActiveSubscription: false,
      signIn: async () => ({ error: { message: 'Auth not initialized' } }),
      signUp: async () => ({ error: { message: 'Auth not initialized' }, user: null }),
      signOut: async () => {},
      createChamberProfile: async () => ({ error: { message: 'Auth not initialized' } }),
      switchChamber: async () => {},
      isChamberAdmin: async () => false,
      isChamberMember: async () => false,
      refreshUserData: async () => {}
    } as AuthContextType
  }
  return context
}