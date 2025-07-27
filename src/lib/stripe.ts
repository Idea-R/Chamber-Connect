import { loadStripe } from '@stripe/stripe-js'
import { supabase } from './supabase'
import { logger } from './analytics-error-handler'
import type { SubscriptionPlan } from './supabase-types'

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

if (!stripePublishableKey) {
  throw new Error('Missing Stripe publishable key')
}

export const stripe = loadStripe(stripePublishableKey)

// Interface for frontend plan display
export interface Plan {
  id: string
  name: string
  description: string
  price_monthly: number
  price_yearly?: number
  features: string[]
  max_members: number
  max_events_per_month: number
  analytics_enabled: boolean
  cross_chamber_networking: boolean
  priority_support: boolean
  stripe_price_id: string | null
  stripe_product_id: string | null
  popular?: boolean
}

/**
 * Fetch active subscription plans from the database
 */
export const getSubscriptionPlans = async (): Promise<Plan[]> => {
  logger.info('Fetching subscription plans from database', { operation: 'get-subscription-plans' })
  
  try {
    const { data: plans, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_monthly', { ascending: true })

    if (error) {
      logger.error('Failed to fetch subscription plans', { 
        operation: 'get-subscription-plans',
        error: error.message 
      })
      throw error
    }

    if (!plans || plans.length === 0) {
      logger.warn('No active subscription plans found', { operation: 'get-subscription-plans' })
      return []
    }

    // Transform database plans to frontend format
    const transformedPlans: Plan[] = plans.map((plan: SubscriptionPlan, index: number) => ({
      id: plan.id,
      name: plan.name,
      description: plan.description || '',
      price_monthly: Number(plan.price_monthly),
      price_yearly: plan.price_yearly ? Number(plan.price_yearly) : undefined,
      features: plan.features || [],
      max_members: plan.max_members,
      max_events_per_month: plan.max_events_per_month,
      analytics_enabled: plan.analytics_enabled,
      cross_chamber_networking: plan.cross_chamber_networking,
      priority_support: plan.priority_support,
      stripe_price_id: plan.stripe_price_id,
      stripe_product_id: plan.stripe_product_id,
      // Mark the middle plan as popular (Professional/Agency tier)
      popular: index === 1 && plans.length >= 3
    }))

    logger.info('Successfully fetched subscription plans', { 
      operation: 'get-subscription-plans',
      planCount: transformedPlans.length 
    })

    return transformedPlans

  } catch (error) {
    logger.error('Error fetching subscription plans', { 
      operation: 'get-subscription-plans',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    throw error
  }
}

/**
 * Get a specific subscription plan by ID
 */
export const getSubscriptionPlan = async (planId: string): Promise<Plan | null> => {
  logger.info('Fetching subscription plan by ID', { 
    operation: 'get-subscription-plan',
    planId 
  })
  
  try {
    const { data: plan, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .eq('is_active', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        logger.warn('Subscription plan not found', { 
          operation: 'get-subscription-plan',
          planId 
        })
        return null
      }
      throw error
    }

    return {
      id: plan.id,
      name: plan.name,
      description: plan.description || '',
      price_monthly: Number(plan.price_monthly),
      price_yearly: plan.price_yearly ? Number(plan.price_yearly) : undefined,
      features: plan.features || [],
      max_members: plan.max_members,
      max_events_per_month: plan.max_events_per_month,
      analytics_enabled: plan.analytics_enabled,
      cross_chamber_networking: plan.cross_chamber_networking,
      priority_support: plan.priority_support,
      stripe_price_id: plan.stripe_price_id,
      stripe_product_id: plan.stripe_product_id
    }

  } catch (error) {
    logger.error('Error fetching subscription plan', { 
      operation: 'get-subscription-plan',
      planId,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    throw error
  }
}

/**
 * Create a checkout session using the Supabase Edge Function
 */
export const createCheckoutSession = async (
  priceId: string, 
  chamberId: string,
  billingCycle: 'monthly' | 'yearly' = 'monthly',
  successUrl?: string, 
  cancelUrl?: string
) => {
  logger.info('Creating checkout session', { 
    operation: 'create-checkout-session',
    priceId,
    chamberId,
    billingCycle
  })

  try {
    // Get the current session
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      throw new Error('User not authenticated')
    }

    // Default URLs if not provided
    const baseUrl = window.location.origin
    const defaultSuccessUrl = successUrl || `${baseUrl}/dashboard?checkout=success`
    const defaultCancelUrl = cancelUrl || `${baseUrl}/pricing?checkout=cancelled`

    // Call our Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: {
        priceId,
        chamberId,
        billingCycle,
        successUrl: defaultSuccessUrl,
        cancelUrl: defaultCancelUrl
      }
    })

    if (error) {
      logger.error('Checkout session creation failed', { 
        operation: 'create-checkout-session',
        error: error.message,
        priceId,
        chamberId
      })
      throw error
    }

    if (!data?.url) {
      throw new Error('No checkout URL returned')
    }

    logger.info('Checkout session created successfully', { 
      operation: 'create-checkout-session',
      sessionId: data.sessionId,
      chamberId
    })

    return {
      url: data.url,
      sessionId: data.sessionId
    }

  } catch (error) {
    logger.error('Error creating checkout session', { 
      operation: 'create-checkout-session',
      error: error instanceof Error ? error.message : 'Unknown error',
      priceId,
      chamberId
    })
    throw error
  }
}

export type { Plan as PlanType }