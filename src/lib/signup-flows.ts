import { supabase } from './supabase'
import { logger } from './analytics-error-handler'
import { Result, ok, err } from './errors'
import type { Chamber, Business, UserProfile } from './supabase-types'

// Signup flow types
export type SignupUserType = 'chamber_creator' | 'business_member' | 'business_trial'

export interface ChamberCreatorSignup {
  // Chamber details
  chamberName: string
  chamberSlug: string
  chamberDescription: string
  chamberWebsite?: string
  chamberAddress: string
  chamberPhone: string
  chamberEmail: string
  
  // User details
  firstName: string
  lastName: string
  email: string
  password: string
  jobTitle?: string
  phone?: string
}

export interface BusinessMemberSignup {
  // Business details
  businessName: string
  website?: string
  industry: string
  description: string
  
  // User details
  firstName: string
  lastName: string
  email: string
  password: string
  phone?: string
  
  // Chamber selection
  chamberId: string
  membershipType: 'chamber_member' | 'trial'
}

export interface InvitationSignup {
  invitationToken: string
  firstName: string
  lastName: string
  password: string
  phone?: string
}

export interface SignupResult {
  user: any
  profile: UserProfile
  chamber?: Chamber
  business?: Business
  redirectPath: string
}

/**
 * Create a new chamber and chamber admin account
 */
export async function createChamberAccount(data: ChamberCreatorSignup): Promise<Result<SignupResult>> {
  try {
    logger.info(
      'Chamber creator signup initiated',
      'signup-chamber-creator',
      { email: data.email, chamberSlug: data.chamberSlug }
    )

    // 1. Create auth user
    const { data: authUser, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: `${data.firstName} ${data.lastName}`,
          user_type: 'chamber_creator'
        }
      }
    })

    if (authError) {
      logger.warn(
        'Chamber creator auth signup failed',
        'signup-chamber-creator',
        { email: data.email, errorCode: authError.message }
      )
      return err({ name: 'ValidationError', message: authError.message })
    }

    if (!authUser.user) {
      return err({ name: 'ValidationError', message: 'Failed to create user account' })
    }

    // 2. Create chamber
    const { data: chamber, error: chamberError } = await supabase
      .from('chambers')
      .insert({
        name: data.chamberName,
        slug: data.chamberSlug,
        description: data.chamberDescription,
        website: data.chamberWebsite,
        address: data.chamberAddress,
        phone: data.chamberPhone,
        email: data.chamberEmail
      })
      .select()
      .single()

    if (chamberError) {
      logger.error(
        'Chamber creation failed',
        'signup-chamber-creator',
        { email: data.email, chamberSlug: data.chamberSlug, errorCode: chamberError.message }
      )
      return err({ name: 'InfrastructureError', message: 'Failed to create chamber' })
    }

    // 3. Create user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authUser.user.id,
        email: data.email,
        full_name: `${data.firstName} ${data.lastName}`,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        job_title: data.jobTitle,
        role: 'chamber_admin',
        user_type: 'chamber_creator',
        onboarding_completed: false,
        signup_flow_completed: true
      })
      .select()
      .single()

    if (profileError) {
      logger.error(
        'User profile creation failed',
        'signup-chamber-creator',
        { email: data.email, errorCode: profileError.message }
      )
      return err({ name: 'InfrastructureError', message: 'Failed to create user profile' })
    }

    // 4. Create chamber membership for the creator
    const { error: membershipError } = await supabase
      .from('chamber_memberships')
      .insert({
        chamber_id: chamber.id,
        user_id: authUser.user.id,
        role: 'admin',
        status: 'active',
        dues_status: 'exempt'
      })

    if (membershipError) {
      logger.error(
        'Chamber membership creation failed',
        'signup-chamber-creator',
        { email: data.email, chamberId: chamber.id, errorCode: membershipError.message }
      )
      return err({ name: 'InfrastructureError', message: 'Failed to create chamber membership' })
    }

    logger.info(
      'Chamber creator signup completed successfully',
      'signup-chamber-creator',
      { email: data.email, chamberId: chamber.id, userId: authUser.user.id }
    )

    return ok({
      user: authUser.user,
      profile,
      chamber,
      redirectPath: '/dashboard'
    })

  } catch (error) {
    logger.error(
      'Chamber creator signup failed',
      'signup-chamber-creator',
      { email: data.email, errorMessage: 'Unexpected error' },
      error instanceof Error ? error : undefined
    )
    return err({ name: 'InfrastructureError', message: 'Signup failed. Please try again.' })
  }
}

/**
 * Create a business account (chamber member or trial)
 */
export async function createBusinessAccount(data: BusinessMemberSignup): Promise<Result<SignupResult>> {
  try {
    logger.info(
      'Business signup initiated',
      'signup-business',
      { email: data.email, chamberId: data.chamberId, membershipType: data.membershipType }
    )

    // 1. Verify chamber exists
    const { data: chamber, error: chamberError } = await supabase
      .from('chambers')
      .select('*')
      .eq('id', data.chamberId)
      .single()

    if (chamberError || !chamber) {
      return err({ name: 'ValidationError', message: 'Selected chamber not found' })
    }

    // 2. Create auth user
    const { data: authUser, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: `${data.firstName} ${data.lastName}`,
          user_type: 'business_owner'
        }
      }
    })

    if (authError) {
      logger.warn(
        'Business auth signup failed',
        'signup-business',
        { email: data.email, errorCode: authError.message }
      )
      return err({ name: 'ValidationError', message: authError.message })
    }

    if (!authUser.user) {
      return err({ name: 'ValidationError', message: 'Failed to create user account' })
    }

    // 3. Create user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authUser.user.id,
        email: data.email,
        full_name: `${data.firstName} ${data.lastName}`,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        role: 'business_owner',
        user_type: 'business_owner',
        onboarding_completed: false,
        signup_flow_completed: true
      })
      .select()
      .single()

    if (profileError) {
      logger.error(
        'Business user profile creation failed',
        'signup-business',
        { email: data.email, errorCode: profileError.message }
      )
      return err({ name: 'InfrastructureError', message: 'Failed to create user profile' })
    }

    // 4. Create business
    const membershipStatus = data.membershipType === 'chamber_member' ? 'member' : 'trial'
    const trialExpiresAt = data.membershipType === 'trial' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null

    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .insert({
        user_id: authUser.user.id,
        name: data.businessName,
        website: data.website,
        industry: data.industry,
        description: data.description,
        membership_status: membershipStatus,
        trial_expires_at: trialExpiresAt,
        verification_status: data.membershipType === 'chamber_member' ? 'pending' : 'verified'
      })
      .select()
      .single()

    if (businessError) {
      logger.error(
        'Business creation failed',
        'signup-business',
        { email: data.email, errorCode: businessError.message }
      )
      return err({ name: 'InfrastructureError', message: 'Failed to create business profile' })
    }

    // 5. Create chamber membership if they're a chamber member
    if (data.membershipType === 'chamber_member') {
      const { error: membershipError } = await supabase
        .from('chamber_memberships')
        .insert({
          chamber_id: data.chamberId,
          user_id: authUser.user.id,
          role: 'member',
          status: 'pending', // Requires chamber admin approval
          dues_status: 'current'
        })

      if (membershipError) {
        logger.warn(
          'Chamber membership creation failed',
          'signup-business',
          { email: data.email, chamberId: data.chamberId, errorCode: membershipError.message }
        )
        // Don't fail the signup, just log the warning
      }
    }

    const redirectPath = data.membershipType === 'trial' ? '/dashboard?trial=true' : '/dashboard?pending=true'

    logger.info(
      'Business signup completed successfully',
      'signup-business',
      { email: data.email, businessId: business.id, membershipType: data.membershipType }
    )

    return ok({
      user: authUser.user,
      profile,
      business,
      chamber,
      redirectPath
    })

  } catch (error) {
    logger.error(
      'Business signup failed',
      'signup-business',
      { email: data.email, errorMessage: 'Unexpected error' },
      error instanceof Error ? error : undefined
    )
    return err({ name: 'InfrastructureError', message: 'Signup failed. Please try again.' })
  }
}

/**
 * Accept an invitation and complete signup
 */
export async function acceptInvitation(data: InvitationSignup): Promise<Result<SignupResult>> {
  try {
    logger.info(
      'Invitation acceptance initiated',
      'signup-invitation',
      { token: data.invitationToken.substring(0, 8) }
    )

    // 1. Validate invitation token (check both chamber and business invitations)
    const { data: chamberInvitation } = await supabase
      .from('chamber_invitations')
      .select('*, chambers(*)')
      .eq('invitation_token', data.invitationToken)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .single()

    const { data: businessInvitation } = await supabase
      .from('business_invitations')
      .select('*, businesses(*)')
      .eq('invitation_token', data.invitationToken)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .single()

    const invitation = chamberInvitation || businessInvitation
    const invitationType = chamberInvitation ? 'chamber' : 'business'

    if (!invitation) {
      return err({ name: 'ValidationError', message: 'Invalid or expired invitation' })
    }

    // 2. Create auth user
    const { data: authUser, error: authError } = await supabase.auth.signUp({
      email: invitation.email,
      password: data.password,
      options: {
        data: {
          full_name: `${data.firstName} ${data.lastName}`,
          user_type: invitationType === 'chamber' ? 'chamber_staff' : 'business_staff'
        }
      }
    })

    if (authError) {
      return err({ name: 'ValidationError', message: authError.message })
    }

    if (!authUser.user) {
      return err({ name: 'ValidationError', message: 'Failed to create user account' })
    }

    // 3. Create user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authUser.user.id,
        email: invitation.email,
        full_name: `${data.firstName} ${data.lastName}`,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        role: invitation.role,
        user_type: invitationType === 'chamber' ? 'chamber_staff' : 'business_staff',
        onboarding_completed: false,
        signup_flow_completed: true
      })
      .select()
      .single()

    if (profileError) {
      return err({ name: 'InfrastructureError', message: 'Failed to create user profile' })
    }

    // 4. Create appropriate membership and mark invitation as accepted
    if (invitationType === 'chamber') {
      await supabase
        .from('chamber_memberships')
        .insert({
          chamber_id: chamberInvitation!.chamber_id,
          user_id: authUser.user.id,
          role: invitation.role,
          status: 'active'
        })

      await supabase
        .from('chamber_invitations')
        .update({ status: 'accepted' })
        .eq('invitation_token', data.invitationToken)
    } else {
      // Business invitation - this would typically be handled differently
      // For now, just mark the invitation as accepted
      await supabase
        .from('business_invitations')
        .update({ status: 'accepted' })
        .eq('invitation_token', data.invitationToken)
    }

    logger.info(
      'Invitation accepted successfully',
      'signup-invitation',
      { 
        email: invitation.email, 
        invitationType, 
        userId: authUser.user.id 
      }
    )

    return ok({
      user: authUser.user,
      profile,
      chamber: invitationType === 'chamber' ? chamberInvitation!.chambers : undefined,
      business: invitationType === 'business' ? businessInvitation!.businesses : undefined,
      redirectPath: '/dashboard'
    })

  } catch (error) {
    logger.error(
      'Invitation acceptance failed',
      'signup-invitation',
      { token: data.invitationToken.substring(0, 8), errorMessage: 'Unexpected error' },
      error instanceof Error ? error : undefined
    )
    return err({ name: 'InfrastructureError', message: 'Failed to accept invitation' })
  }
}

/**
 * Get available chambers for business signup
 */
export async function getAvailableChambers(): Promise<Result<Chamber[]>> {
  try {
    const { data: chambers, error } = await supabase
      .from('chambers')
      .select('*')
      .order('name')

    if (error) {
      return err({ name: 'InfrastructureError', message: 'Failed to load chambers' })
    }

    return ok(chambers || [])
  } catch (error) {
    return err({ name: 'InfrastructureError', message: 'Failed to load chambers' })
  }
}

/**
 * Check if a chamber slug is available
 */
export async function checkChamberSlugAvailable(slug: string): Promise<Result<boolean>> {
  try {
    const { data, error } = await supabase
      .from('chambers')
      .select('id')
      .eq('slug', slug)
      .single()

    if (error && error.code === 'PGRST116') {
      // No rows returned - slug is available
      return ok(true)
    }

    if (error) {
      return err({ name: 'InfrastructureError', message: 'Failed to check slug availability' })
    }

    // Slug is taken
    return ok(false)
  } catch (error) {
    return err({ name: 'InfrastructureError', message: 'Failed to check slug availability' })
  }
} 