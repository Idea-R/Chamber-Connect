// Supabase Client Configuration
// Refactored from original supabase.ts for compliance with 500-line rule

import { createClient } from '@supabase/supabase-js'
import { logger } from './analytics-error-handler'
import { InfrastructureError } from './errors'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  const error = new InfrastructureError(
    'Missing Supabase environment variables. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.',
    'supabase-client-init',
    {
      service: 'supabase'
    }
  )
  
  logger.error(
    'Supabase client initialization failed',
    'supabase-client-init',
    {
      missingUrl: !supabaseUrl,
      missingAnonKey: !supabaseAnonKey
    }
  )
  
  throw error
}

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Log successful connection
logger.info(
  'Chamber Connect connected to Supabase',
  'supabase-client-init',
  {
    url: supabaseUrl,
    clientConnected: true
  }
)

// Export environment variables for use in other modules
export const config = {
  url: supabaseUrl,
  anonKey: supabaseAnonKey,
  isProduction: import.meta.env.PROD
} as const 