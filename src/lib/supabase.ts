// Supabase Main Module - Clean Facade
// Re-exports from modular structure for backward compatibility
// Total: ~50 lines (compliant with 500-line rule)

// Core client and configuration
export { supabase, config } from './supabase-client'

// Type definitions
export type {
  ChamberMembership,
  Chamber,
  Business,
  UserProfile,
  Event,
  Message,
  Connection,
  Spotlight,
  QRScan,
  EventRegistration,
  EventSession,
  Speaker,
  EventSpeaker,
  ChamberPartnership,
  CrossChamberConnection,
  ChamberReferral,
  SupabaseResponse,
  SupabaseListResponse
} from './supabase-types'

// Authentication helpers
export { auth } from './supabase-auth'

// API functions
export {
  chamberApi,
  membershipApi,
  businessApi,
  eventApi,
  messageApi,
  connectionApi,
  spotlightApi
} from './supabase-api'

// Legacy compatibility - maintain the same interface as before
import { logger } from './analytics-error-handler'

logger.info(
  'Supabase facade module loaded',
  'supabase-facade-init',
  {
    modularStructure: true,
    rulesCompliant: true
  }
)