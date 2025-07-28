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
          user_type: 'super_admin'
        }
      }
    })

    if (adminError) {
      console.error('❌ Failed to create admin account:', adminError.message)
      return
    }

    console.log('✅ Admin account created:', adminAuth.user?.id)

    // Create user profile
    const { error: adminProfileError } = await supabase
      .from('user_profiles')
      .upsert({
        id: adminAuth.user.id,
        email: adminEmail,
        full_name: 'Chamber Connect Admin',
        role: 'super_admin'
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
      .eq('name', 'Springfield Chamber of Commerce')
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
          address: '123 Main St, Springfield, IL 62701',
          user_id: adminAuth.user.id
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

    // Create chamber membership for admin
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

    // Get demo business
    let { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id')
      .eq('name', 'Demo Marketing Solutions')
      .single()

    if (business) {
      // Create business membership for admin (enables business role testing)
      const { error: businessMembershipError } = await supabase
        .from('business_memberships')
        .upsert({
          user_id: adminAuth.user.id,
          business_id: business.id,
          role: 'owner',
          status: 'active'
        })

      if (businessMembershipError) {
        console.error('❌ Failed to create admin business membership:', businessMembershipError.message)
      } else {
        console.log('✅ Admin business membership created')
      }
    }

    console.log('\n🎉 Admin account setup complete!')
    console.log('\n📋 Admin Credentials (Backup):')
    console.log('👨‍💼 Super Admin:')
    console.log('   Email: admin@chamber-connect.com')
    console.log('   Password: Admin123!@#')
    console.log('   Access: All dashboards + DevAdminPortal role switching')
    console.log('\n🔄 Role Switching Available:')
    console.log('   - super_admin: Ultimate developer access')
    console.log('   - chamber_admin: Chamber administrator')
    console.log('   - business_owner: Standard business member')
    console.log('   - business_trial: Limited trial access')
    console.log('\n🌐 Test URLs:')
    console.log('   Main Dashboard: http://localhost:5173/dashboard')
    console.log('   Admin Dashboard: http://localhost:5173/admin')
    console.log('   Dev Tools: Available in development mode')
    console.log('\n⚡ Primary Auth: Google OAuth (configure in Supabase + Cloudflare)')

  } catch (error) {
    console.error('❌ Setup failed:', error)
  }
}

setupAdminAccount() 