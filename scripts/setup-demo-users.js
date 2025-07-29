#!/usr/bin/env node

/**
 * Setup Admin Account for Chamber Connect MVP Testing
 * Creates single admin account with role switching capabilities via DevAdminPortal
 * Note: Primary auth will be Google OAuth - this is backup for testing
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupAdminAccount() {
  console.log('🚀 Setting up admin account for MVP testing...')
  console.log('📋 Primary auth will be Google OAuth - this creates backup admin account')

  try {
    // Create admin user account
    console.log('\n📋 Creating admin account...')
    
    const adminEmail = 'admin@chamber-connect.com'
    const { data: adminAuth, error: adminError } = await supabase.auth.signUp({
      email: adminEmail,
      password: 'Admin123!@#',
      options: {
        data: {
          full_name: 'Chamber Connect Admin',
          user_type: 'chamber_admin' // Use valid role value
        }
      }
    })

    if (adminError) {
      console.error('❌ Failed to create admin account:', adminError.message)
      return
    }

    console.log('✅ Admin account created:', adminAuth.user?.id)

    // Create user profile with valid role
    const { error: adminProfileError } = await supabase
      .from('user_profiles')
      .upsert({
        id: adminAuth.user.id,
        email: adminEmail,
        full_name: 'Chamber Connect Admin',
        role: 'chamber_admin' // Use constraint-compliant role
      })

    if (adminProfileError) {
      console.error('❌ Failed to create admin profile:', adminProfileError.message)
    } else {
      console.log('✅ Admin profile created')
    }

    // Get demo chamber
    let { data: chamber, error: chamberError } = await supabase
      .from('chambers')
      .select('id')
      .eq('slug', 'springfield-chamber')
      .single()

    if (chamberError && chamberError.code === 'PGRST116') {
      // Create demo chamber
      const { data: newChamber, error: createChamberError } = await supabase
        .from('chambers')
        .insert({
          name: 'Springfield Chamber of Commerce',
          slug: 'springfield-demo',
          description: 'Demo chamber for testing MVP features',
          email: 'info@springfieldchamber.org',
          phone: '(555) 123-4567',
          address: '123 Main St, Springfield, IL 62701'
          // Note: user_id will be set via chamber membership instead
        })
        .select('id')
        .single()

      if (createChamberError) {
        console.error('❌ Failed to create demo chamber:', createChamberError.message)
        return
      }
      
      chamber = newChamber
      console.log('✅ Demo chamber created')
    }

    // Create chamber membership for admin (this is the new way)
    const { error: membershipError } = await supabase
      .from('chamber_memberships')
      .upsert({
        user_id: adminAuth.user.id,
        chamber_id: chamber.id,
        role: 'admin',
        status: 'active'
      })

    if (membershipError) {
      console.error('❌ Failed to create admin chamber membership:', membershipError.message)
    } else {
      console.log('✅ Admin chamber membership created')
    }

    // Get demo business (if exists from previous migrations)
    let { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('slug', 'demo-marketing')
      .single()

    if (business) {
      // Link business to admin user
      const { error: businessUpdateError } = await supabase
        .from('businesses')
        .update({ user_id: adminAuth.user.id })
        .eq('id', business.id)

      if (businessUpdateError) {
        console.error('❌ Failed to link business to admin:', businessUpdateError.message)
      } else {
        console.log('✅ Demo business linked to admin')
      }
    }

    console.log('\n🎉 Admin account setup complete!')
    console.log('\n📋 Admin Credentials (Backup):')
    console.log('👨‍💼 Chamber Admin:')
    console.log('   Email: admin@chamber-connect.com')
    console.log('   Password: Admin123!@#')
    console.log('   Access: Chamber dashboard + DevAdminPortal role switching')
    console.log('\n🔄 Role Switching Available (via DevAdminPortal):')
    console.log('   - chamber_admin: Chamber administrator access')
    console.log('   - business_owner: Standard business member access')
    console.log('   - staff: Limited staff access')
    console.log('\n🌐 Test URLs:')
    console.log('   Main Dashboard: http://localhost:5173/dashboard')
    console.log('   Chamber Login: http://localhost:5173/chamber/login')
    console.log('   Business Login: http://localhost:5173/business/login')
    console.log('   Pricing Page: http://localhost:5173/pricing')
    console.log('\n⚡ Primary Auth: Google OAuth (configure in Supabase dashboard)')
    console.log('\n📊 Next Steps:')
    console.log('   1. Configure Google OAuth in Supabase dashboard')
    console.log('   2. Add Stripe publishable key to .env file')
    console.log('   3. Test OAuth login and role switching')
    console.log('   4. Test pricing and checkout flows')

  } catch (error) {
    console.error('❌ Setup failed:', error)
  }
}

setupAdminAccount() 