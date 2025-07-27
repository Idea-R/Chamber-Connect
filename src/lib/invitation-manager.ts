import { supabase } from './supabase'
import { logger } from './analytics-error-handler'
import { Result, ok, err } from './errors'

export interface ChamberInvitation {
  id: string
  chamber_id: string
  inviter_id: string
  email: string
  role: 'admin' | 'staff' | 'member'
  status: 'pending' | 'accepted' | 'expired' | 'cancelled'
  invitation_token: string
  expires_at: string
  created_at: string
  updated_at: string
  chambers?: {
    id: string
    name: string
    slug: string
  }
}

export interface BusinessInvitation {
  id: string
  business_id: string
  inviter_id: string
  email: string
  role: 'owner' | 'manager' | 'staff'
  status: 'pending' | 'accepted' | 'expired' | 'cancelled'
  invitation_token: string
  expires_at: string
  created_at: string
  updated_at: string
  businesses?: {
    id: string
    name: string
  }
}

export interface CreateChamberInvitationData {
  chamber_id: string
  email: string
  role: 'admin' | 'staff' | 'member'
  message?: string
}

export interface CreateBusinessInvitationData {
  business_id: string
  email: string
  role: 'owner' | 'manager' | 'staff'
  message?: string
}

/**
 * Create a chamber invitation
 */
export async function createChamberInvitation(
  data: CreateChamberInvitationData,
  inviterId: string
): Promise<Result<ChamberInvitation>> {
  try {
    logger.info(
      'Creating chamber invitation',
      'invitation-chamber-create',
      { chamberId: data.chamber_id, inviterEmail: data.email, role: data.role }
    )

    // Check if user is authorized to send invitations for this chamber
    const { data: membership, error: membershipError } = await supabase
      .from('chamber_memberships')
      .select('role')
      .eq('chamber_id', data.chamber_id)
      .eq('user_id', inviterId)
      .eq('status', 'active')
      .single()

    if (membershipError || !membership || !['admin', 'staff'].includes(membership.role)) {
      return err({ 
        name: 'ValidationError', 
        message: 'You do not have permission to send invitations for this chamber' 
      })
    }

    // Check if there's already a pending invitation for this email
    const { data: existingInvitation } = await supabase
      .from('chamber_invitations')
      .select('id')
      .eq('chamber_id', data.chamber_id)
      .eq('email', data.email)
      .eq('status', 'pending')
      .single()

    if (existingInvitation) {
      return err({ 
        name: 'ValidationError', 
        message: 'There is already a pending invitation for this email address' 
      })
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('chamber_memberships')
      .select('id')
      .eq('chamber_id', data.chamber_id)
      .eq('user_id', inviterId)
      .single()

    if (existingMember) {
      return err({ 
        name: 'ValidationError', 
        message: 'This user is already a member of the chamber' 
      })
    }

    // Create the invitation
    const { data: invitation, error } = await supabase
      .from('chamber_invitations')
      .insert({
        chamber_id: data.chamber_id,
        inviter_id: inviterId,
        email: data.email,
        role: data.role
      })
      .select('*, chambers(id, name, slug)')
      .single()

    if (error) {
      logger.error(
        'Failed to create chamber invitation',
        'invitation-chamber-create',
        { chamberId: data.chamber_id, email: data.email, errorCode: error.message }
      )
      return err({ name: 'InfrastructureError', message: 'Failed to create invitation' })
    }

    logger.info(
      'Chamber invitation created successfully',
      'invitation-chamber-create',
      { invitationId: invitation.id, chamberId: data.chamber_id, email: data.email }
    )

    // TODO: Send invitation email
    // await sendChamberInvitationEmail(invitation, data.message)

    return ok(invitation)
  } catch (error) {
    logger.error(
      'Chamber invitation creation failed',
      'invitation-chamber-create',
      { chamberId: data.chamber_id, email: data.email, errorMessage: 'Unexpected error' },
      error instanceof Error ? error : undefined
    )
    return err({ name: 'InfrastructureError', message: 'Failed to create invitation' })
  }
}

/**
 * Create a business invitation
 */
export async function createBusinessInvitation(
  data: CreateBusinessInvitationData,
  inviterId: string
): Promise<Result<BusinessInvitation>> {
  try {
    logger.info(
      'Creating business invitation',
      'invitation-business-create',
      { businessId: data.business_id, inviterEmail: data.email, role: data.role }
    )

    // Check if user owns this business
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('user_id')
      .eq('id', data.business_id)
      .single()

    if (businessError || !business || business.user_id !== inviterId) {
      return err({ 
        name: 'ValidationError', 
        message: 'You do not have permission to send invitations for this business' 
      })
    }

    // Check for existing pending invitation
    const { data: existingInvitation } = await supabase
      .from('business_invitations')
      .select('id')
      .eq('business_id', data.business_id)
      .eq('email', data.email)
      .eq('status', 'pending')
      .single()

    if (existingInvitation) {
      return err({ 
        name: 'ValidationError', 
        message: 'There is already a pending invitation for this email address' 
      })
    }

    // Create the invitation
    const { data: invitation, error } = await supabase
      .from('business_invitations')
      .insert({
        business_id: data.business_id,
        inviter_id: inviterId,
        email: data.email,
        role: data.role
      })
      .select('*, businesses(id, name)')
      .single()

    if (error) {
      logger.error(
        'Failed to create business invitation',
        'invitation-business-create',
        { businessId: data.business_id, email: data.email, errorCode: error.message }
      )
      return err({ name: 'InfrastructureError', message: 'Failed to create invitation' })
    }

    logger.info(
      'Business invitation created successfully',
      'invitation-business-create',
      { invitationId: invitation.id, businessId: data.business_id, email: data.email }
    )

    // TODO: Send invitation email
    // await sendBusinessInvitationEmail(invitation, data.message)

    return ok(invitation)
  } catch (error) {
    logger.error(
      'Business invitation creation failed',
      'invitation-business-create',
      { businessId: data.business_id, email: data.email, errorMessage: 'Unexpected error' },
      error instanceof Error ? error : undefined
    )
    return err({ name: 'InfrastructureError', message: 'Failed to create invitation' })
  }
}

/**
 * Get pending chamber invitations for a user
 */
export async function getPendingChamberInvitations(email: string): Promise<Result<ChamberInvitation[]>> {
  try {
    const { data: invitations, error } = await supabase
      .from('chamber_invitations')
      .select('*, chambers(id, name, slug)')
      .eq('email', email)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      return err({ name: 'InfrastructureError', message: 'Failed to load invitations' })
    }

    return ok(invitations || [])
  } catch (error) {
    return err({ name: 'InfrastructureError', message: 'Failed to load invitations' })
  }
}

/**
 * Get pending business invitations for a user
 */
export async function getPendingBusinessInvitations(email: string): Promise<Result<BusinessInvitation[]>> {
  try {
    const { data: invitations, error } = await supabase
      .from('business_invitations')
      .select('*, businesses(id, name)')
      .eq('email', email)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      return err({ name: 'InfrastructureError', message: 'Failed to load invitations' })
    }

    return ok(invitations || [])
  } catch (error) {
    return err({ name: 'InfrastructureError', message: 'Failed to load invitations' })
  }
}

/**
 * Get chamber invitations sent by a user
 */
export async function getChamberInvitationsBySender(
  chamberId: string, 
  senderId: string
): Promise<Result<ChamberInvitation[]>> {
  try {
    const { data: invitations, error } = await supabase
      .from('chamber_invitations')
      .select('*')
      .eq('chamber_id', chamberId)
      .eq('inviter_id', senderId)
      .order('created_at', { ascending: false })

    if (error) {
      return err({ name: 'InfrastructureError', message: 'Failed to load invitations' })
    }

    return ok(invitations || [])
  } catch (error) {
    return err({ name: 'InfrastructureError', message: 'Failed to load invitations' })
  }
}

/**
 * Get business invitations sent by a user
 */
export async function getBusinessInvitationsBySender(
  businessId: string, 
  senderId: string
): Promise<Result<BusinessInvitation[]>> {
  try {
    const { data: invitations, error } = await supabase
      .from('business_invitations')
      .select('*')
      .eq('business_id', businessId)
      .eq('inviter_id', senderId)
      .order('created_at', { ascending: false })

    if (error) {
      return err({ name: 'InfrastructureError', message: 'Failed to load invitations' })
    }

    return ok(invitations || [])
  } catch (error) {
    return err({ name: 'InfrastructureError', message: 'Failed to load invitations' })
  }
}

/**
 * Cancel an invitation
 */
export async function cancelInvitation(
  invitationId: string, 
  type: 'chamber' | 'business'
): Promise<Result<boolean>> {
  try {
    const table = type === 'chamber' ? 'chamber_invitations' : 'business_invitations'
    
    const { error } = await supabase
      .from(table)
      .update({ status: 'cancelled' })
      .eq('id', invitationId)

    if (error) {
      return err({ name: 'InfrastructureError', message: 'Failed to cancel invitation' })
    }

    logger.info(
      'Invitation cancelled',
      `invitation-${type}-cancel`,
      { invitationId }
    )

    return ok(true)
  } catch (error) {
    return err({ name: 'InfrastructureError', message: 'Failed to cancel invitation' })
  }
}

/**
 * Resend an invitation (updates expiry date)
 */
export async function resendInvitation(
  invitationId: string, 
  type: 'chamber' | 'business'
): Promise<Result<boolean>> {
  try {
    const table = type === 'chamber' ? 'chamber_invitations' : 'business_invitations'
    const newExpiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    
    const { error } = await supabase
      .from(table)
      .update({ 
        expires_at: newExpiryDate.toISOString(),
        status: 'pending'
      })
      .eq('id', invitationId)

    if (error) {
      return err({ name: 'InfrastructureError', message: 'Failed to resend invitation' })
    }

    logger.info(
      'Invitation resent',
      `invitation-${type}-resend`,
      { invitationId }
    )

    // TODO: Send new invitation email
    
    return ok(true)
  } catch (error) {
    return err({ name: 'InfrastructureError', message: 'Failed to resend invitation' })
  }
}

/**
 * Validate an invitation token
 */
export async function validateInvitationToken(token: string): Promise<Result<{
  type: 'chamber' | 'business'
  invitation: ChamberInvitation | BusinessInvitation
}>> {
  try {
    // Check chamber invitations first
    const { data: chamberInvitation } = await supabase
      .from('chamber_invitations')
      .select('*, chambers(id, name, slug)')
      .eq('invitation_token', token)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .single()

    if (chamberInvitation) {
      return ok({
        type: 'chamber',
        invitation: chamberInvitation
      })
    }

    // Check business invitations
    const { data: businessInvitation } = await supabase
      .from('business_invitations')
      .select('*, businesses(id, name)')
      .eq('invitation_token', token)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .single()

    if (businessInvitation) {
      return ok({
        type: 'business',
        invitation: businessInvitation
      })
    }

    return err({ name: 'ValidationError', message: 'Invalid or expired invitation token' })
  } catch (error) {
    return err({ name: 'InfrastructureError', message: 'Failed to validate invitation' })
  }
}

/**
 * Clean up expired invitations (utility function for background jobs)
 */
export async function cleanupExpiredInvitations(): Promise<Result<{ 
  chamberInvitations: number, 
  businessInvitations: number 
}>> {
  try {
    const now = new Date().toISOString()
    
    // Update expired chamber invitations
    const { count: chamberCount, error: chamberError } = await supabase
      .from('chamber_invitations')
      .update({ status: 'expired' })
      .eq('status', 'pending')
      .lt('expires_at', now)

    if (chamberError) {
      logger.warn('Failed to cleanup expired chamber invitations', 'invitation-cleanup', { error: chamberError.message })
    }

    // Update expired business invitations
    const { count: businessCount, error: businessError } = await supabase
      .from('business_invitations')
      .update({ status: 'expired' })
      .eq('status', 'pending')
      .lt('expires_at', now)

    if (businessError) {
      logger.warn('Failed to cleanup expired business invitations', 'invitation-cleanup', { error: businessError.message })
    }

    logger.info(
      'Expired invitations cleaned up',
      'invitation-cleanup',
      { chamberInvitations: chamberCount || 0, businessInvitations: businessCount || 0 }
    )

    return ok({
      chamberInvitations: chamberCount || 0,
      businessInvitations: businessCount || 0
    })
  } catch (error) {
    return err({ name: 'InfrastructureError', message: 'Failed to cleanup expired invitations' })
  }
} 