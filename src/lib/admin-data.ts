import { supabase } from './supabase'
import { logger } from './analytics-error-handler'
import { Result, ok, err } from './errors'

export interface AdminDashboardStats {
  totalMembers: number
  activeMembers: number
  pendingMembers: number
  trialMembers: number
  totalEvents: number
  upcomingEvents: number
  totalRevenue: number
  monthlyRevenue: number
  memberGrowth: number
  eventAttendance: number
}

export interface MemberManagementData {
  id: string
  business_name: string
  contact_name: string
  email: string
  membership_status: 'member' | 'trial' | 'pending' | 'inactive'
  verification_status: 'pending' | 'verified' | 'rejected'
  tier_name?: string
  dues_status: 'current' | 'overdue' | 'exempt'
  trial_expires_at?: string
  last_active?: string
  joined_date: string
}

export interface StaffManagementData {
  id: string
  full_name: string
  email: string
  role: 'admin' | 'staff' | 'member'
  status: 'active' | 'pending' | 'inactive'
  last_login?: string
  joined_date: string
}

export interface RevenueData {
  month: string
  revenue: number
  members: number
  events: number
}

export interface PendingAction {
  id: string
  type: 'member_approval' | 'event_approval' | 'payment_overdue' | 'staff_invitation'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  created_at: string
  business_name?: string
  email?: string
}

/**
 * Get comprehensive dashboard statistics for chamber admin
 */
export async function getAdminDashboardStats(chamberId: string): Promise<Result<AdminDashboardStats>> {
  try {
    logger.info(
      'Fetching admin dashboard stats',
      'admin-dashboard-stats',
      { chamberId }
    )

    // Get member counts by status
    const { data: memberStats, error: memberError } = await supabase
      .from('chamber_memberships')
      .select(`
        status,
        businesses(membership_status, trial_expires_at),
        chamber_member_tiers(monthly_price)
      `)
      .eq('chamber_id', chamberId)

    if (memberError) {
      return err({ name: 'InfrastructureError', message: 'Failed to fetch member statistics' })
    }

    // Calculate member metrics
    const totalMembers = memberStats?.length || 0
    const activeMembers = memberStats?.filter(m => m.status === 'active').length || 0
    const pendingMembers = memberStats?.filter(m => m.status === 'pending').length || 0
    const trialMembers = memberStats?.filter(m => 
      m.businesses?.membership_status === 'trial' && 
      m.businesses?.trial_expires_at && 
      new Date(m.businesses.trial_expires_at) > new Date()
    ).length || 0

    // Get event statistics
    const { data: eventStats, error: eventError } = await supabase
      .from('events')
      .select('id, date, status')
      .eq('chamber_id', chamberId)

    if (eventError) {
      logger.warn('Failed to fetch event statistics', 'admin-dashboard-stats', { error: eventError.message })
    }

    const totalEvents = eventStats?.length || 0
    const upcomingEvents = eventStats?.filter(e => 
      new Date(e.date) > new Date() && e.status === 'published'
    ).length || 0

    // Calculate revenue (simplified - would integrate with actual payment data)
    const monthlyRevenue = memberStats?.reduce((total, member) => {
      if (member.status === 'active' && member.chamber_member_tiers?.monthly_price) {
        return total + member.chamber_member_tiers.monthly_price
      }
      return total
    }, 0) || 0

    // Get member growth (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const { data: recentMembers } = await supabase
      .from('chamber_memberships')
      .select('created_at')
      .eq('chamber_id', chamberId)
      .gte('created_at', thirtyDaysAgo)

    const memberGrowth = recentMembers?.length || 0

    // Calculate event attendance (average)
    const { data: attendanceData } = await supabase
      .from('event_attendees')
      .select('event_id, events!inner(chamber_id)')
      .eq('events.chamber_id', chamberId)

    const totalAttendees = attendanceData?.length || 0
    const eventAttendance = totalEvents > 0 ? Math.round(totalAttendees / totalEvents) : 0

    const stats: AdminDashboardStats = {
      totalMembers,
      activeMembers,
      pendingMembers,
      trialMembers,
      totalEvents,
      upcomingEvents,
      totalRevenue: monthlyRevenue * 12, // Annualized
      monthlyRevenue,
      memberGrowth,
      eventAttendance
    }

    logger.info(
      'Admin dashboard stats fetched successfully',
      'admin-dashboard-stats',
      { chamberId, memberCount: totalMembers, revenue: monthlyRevenue }
    )

    return ok(stats)
  } catch (error) {
    logger.error(
      'Failed to fetch admin dashboard stats',
      'admin-dashboard-stats',
      { chamberId, errorMessage: 'Unexpected error' },
      error instanceof Error ? error : undefined
    )
    return err({ name: 'InfrastructureError', message: 'Failed to fetch dashboard statistics' })
  }
}

/**
 * Get member management data for chamber admin
 */
export async function getMemberManagementData(
  chamberId: string,
  filters?: {
    status?: string
    tier?: string
    search?: string
  }
): Promise<Result<MemberManagementData[]>> {
  try {
    logger.info(
      'Fetching member management data',
      'admin-member-management',
      { chamberId, filters }
    )

    let query = supabase
      .from('chamber_memberships')
      .select(`
        id,
        status,
        dues_status,
        created_at,
        user_id,
        chamber_member_tiers(name),
        businesses(
          name,
          membership_status,
          trial_expires_at,
          user_id,
          verification_status
        ),
        user_profiles(
          full_name,
          email,
          last_login_at
        )
      `)
      .eq('chamber_id', chamberId)
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    const { data: membersData, error } = await query

    if (error) {
      return err({ name: 'InfrastructureError', message: 'Failed to fetch member data' })
    }

    const members: MemberManagementData[] = (membersData || []).map(member => ({
      id: member.id,
      business_name: member.businesses?.name || 'Unknown Business',
      contact_name: member.user_profiles?.full_name || 'Unknown Contact',
      email: member.user_profiles?.email || '',
      membership_status: member.businesses?.membership_status || 'pending',
      verification_status: member.businesses?.verification_status || 'pending',
      tier_name: member.chamber_member_tiers?.name,
      dues_status: member.dues_status,
      trial_expires_at: member.businesses?.trial_expires_at,
      last_active: member.user_profiles?.last_login_at,
      joined_date: member.created_at
    }))

    // Apply search filter
    let filteredMembers = members
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase()
      filteredMembers = members.filter(member =>
        member.business_name.toLowerCase().includes(searchTerm) ||
        member.contact_name.toLowerCase().includes(searchTerm) ||
        member.email.toLowerCase().includes(searchTerm)
      )
    }

    logger.info(
      'Member management data fetched successfully',
      'admin-member-management',
      { chamberId, memberCount: filteredMembers.length }
    )

    return ok(filteredMembers)
  } catch (error) {
    logger.error(
      'Failed to fetch member management data',
      'admin-member-management',
      { chamberId, errorMessage: 'Unexpected error' },
      error instanceof Error ? error : undefined
    )
    return err({ name: 'InfrastructureError', message: 'Failed to fetch member data' })
  }
}

/**
 * Get staff management data for chamber admin
 */
export async function getStaffManagementData(chamberId: string): Promise<Result<StaffManagementData[]>> {
  try {
    const { data: staffData, error } = await supabase
      .from('chamber_memberships')
      .select(`
        id,
        role,
        status,
        created_at,
        user_profiles(
          full_name,
          email,
          last_login_at
        )
      `)
      .eq('chamber_id', chamberId)
      .in('role', ['admin', 'staff'])
      .order('created_at', { ascending: false })

    if (error) {
      return err({ name: 'InfrastructureError', message: 'Failed to fetch staff data' })
    }

    const staff: StaffManagementData[] = (staffData || []).map(member => ({
      id: member.id,
      full_name: member.user_profiles?.full_name || 'Unknown',
      email: member.user_profiles?.email || '',
      role: member.role,
      status: member.status,
      last_login: member.user_profiles?.last_login_at,
      joined_date: member.created_at
    }))

    return ok(staff)
  } catch (error) {
    logger.error(
      'Failed to fetch staff management data',
      'admin-staff-management',
      { chamberId, errorMessage: 'Unexpected error' },
      error instanceof Error ? error : undefined
    )
    return err({ name: 'InfrastructureError', message: 'Failed to fetch staff data' })
  }
}

/**
 * Get revenue data for charts (last 12 months)
 */
export async function getRevenueData(chamberId: string): Promise<Result<RevenueData[]>> {
  try {
    // This would integrate with actual payment/subscription data
    // For now, providing mock data structure
    const months = []
    const currentDate = new Date()
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: Math.floor(Math.random() * 5000) + 2000, // Mock data
        members: Math.floor(Math.random() * 20) + 30,      // Mock data  
        events: Math.floor(Math.random() * 5) + 2          // Mock data
      })
    }

    return ok(months)
  } catch (error) {
    return err({ name: 'InfrastructureError', message: 'Failed to fetch revenue data' })
  }
}

/**
 * Get pending actions requiring admin attention
 */
export async function getPendingActions(chamberId: string): Promise<Result<PendingAction[]>> {
  try {
    const actions: PendingAction[] = []

    // Get pending member approvals
    const { data: pendingMembers } = await supabase
      .from('chamber_memberships')
      .select(`
        id,
        created_at,
        businesses(name),
        user_profiles(email)
      `)
      .eq('chamber_id', chamberId)
      .eq('status', 'pending')

    pendingMembers?.forEach(member => {
      actions.push({
        id: member.id,
        type: 'member_approval',
        title: 'New Member Application',
        description: `${member.businesses?.name} is waiting for approval`,
        priority: 'high',
        created_at: member.created_at,
        business_name: member.businesses?.name,
        email: member.user_profiles?.email
      })
    })

    // Get overdue payments
    const { data: overdueMembers } = await supabase
      .from('chamber_memberships')
      .select(`
        id,
        businesses(name),
        user_profiles(email)
      `)
      .eq('chamber_id', chamberId)
      .eq('dues_status', 'overdue')

    overdueMembers?.forEach(member => {
      actions.push({
        id: `payment-${member.id}`,
        type: 'payment_overdue',
        title: 'Overdue Payment',
        description: `${member.businesses?.name} has overdue dues`,
        priority: 'medium',
        created_at: new Date().toISOString(),
        business_name: member.businesses?.name,
        email: member.user_profiles?.email
      })
    })

    // Get pending invitations
    const { data: pendingInvitations } = await supabase
      .from('chamber_invitations')
      .select('id, email, created_at')
      .eq('chamber_id', chamberId)
      .eq('status', 'pending')

    pendingInvitations?.forEach(invitation => {
      actions.push({
        id: `invitation-${invitation.id}`,
        type: 'staff_invitation',
        title: 'Pending Staff Invitation',
        description: `Invitation to ${invitation.email} is pending`,
        priority: 'low',
        created_at: invitation.created_at,
        email: invitation.email
      })
    })

    // Sort by priority and date
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    actions.sort((a, b) => {
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    return ok(actions)
  } catch (error) {
    logger.error(
      'Failed to fetch pending actions',
      'admin-pending-actions',
      { chamberId, errorMessage: 'Unexpected error' },
      error instanceof Error ? error : undefined
    )
    return err({ name: 'InfrastructureError', message: 'Failed to fetch pending actions' })
  }
}

/**
 * Approve a member application
 */
export async function approveMember(
  membershipId: string, 
  tierId?: string
): Promise<Result<boolean>> {
  try {
    const updateData: any = { status: 'active' }
    if (tierId) {
      updateData.tier_id = tierId
    }

    const { error } = await supabase
      .from('chamber_memberships')
      .update(updateData)
      .eq('id', membershipId)

    if (error) {
      return err({ name: 'InfrastructureError', message: 'Failed to approve member' })
    }

    // Also update business verification status
    const { error: businessError } = await supabase
      .from('businesses')
      .update({ 
        verification_status: 'verified',
        membership_status: 'member' 
      })
      .in('user_id', [
        supabase
          .from('chamber_memberships')
          .select('user_id')
          .eq('id', membershipId)
          .single()
      ])

    if (businessError) {
      logger.warn('Failed to update business verification status', 'admin-approve-member', { 
        membershipId, 
        error: businessError.message 
      })
    }

    logger.info(
      'Member approved successfully',
      'admin-approve-member',
      { membershipId, tierId }
    )

    return ok(true)
  } catch (error) {
    logger.error(
      'Failed to approve member',
      'admin-approve-member',
      { membershipId, errorMessage: 'Unexpected error' },
      error instanceof Error ? error : undefined
    )
    return err({ name: 'InfrastructureError', message: 'Failed to approve member' })
  }
}

/**
 * Reject a member application
 */
export async function rejectMember(
  membershipId: string, 
  reason?: string
): Promise<Result<boolean>> {
  try {
    const { error } = await supabase
      .from('chamber_memberships')
      .update({ status: 'inactive' })
      .eq('id', membershipId)

    if (error) {
      return err({ name: 'InfrastructureError', message: 'Failed to reject member' })
    }

    // Update business verification status
    const { error: businessError } = await supabase
      .from('businesses')
      .update({ verification_status: 'rejected' })
      .in('user_id', [
        supabase
          .from('chamber_memberships')
          .select('user_id')
          .eq('id', membershipId)
          .single()
      ])

    if (businessError) {
      logger.warn('Failed to update business verification status', 'admin-reject-member', { 
        membershipId, 
        error: businessError.message 
      })
    }

    logger.info(
      'Member rejected',
      'admin-reject-member',
      { membershipId, reason }
    )

    return ok(true)
  } catch (error) {
    logger.error(
      'Failed to reject member',
      'admin-reject-member',
      { membershipId, errorMessage: 'Unexpected error' },
      error instanceof Error ? error : undefined
    )
    return err({ name: 'InfrastructureError', message: 'Failed to reject member' })
  }
} 