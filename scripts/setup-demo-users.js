#!/usr/bin/env node

/**
 * Setup Demo Users for Chamber Connect MVP Testing
 * Creates properly authenticated demo users via Supabase auth system
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

async function setupDemoUsers() {
  console.log('🚀 Setting up demo users for MVP testing...')

  try {
    // 1. Create Chamber Admin Demo User (Charles)
    console.log('\n📋 Creating chamber admin demo user...')
    
    // Note: Cannot delete existing auth users with anon key, using different email if needed
    
    // Create new chamber admin user with stronger password
    // Use slightly different email to avoid conflicts with existing broken users
    const charlesEmail = 'charles.demo@gmail.com'
    const { data: charlesAuth, error: charlesError } = await supabase.auth.signUp({
      email: charlesEmail,
      password: 'Demo123!@#',
      options: {
        data: {
          full_name: 'Charles R. Sears',
          user_type: 'chamber_creator'
        }
      }
    })

    if (charlesError) {
      console.error('❌ Failed to create Charles:', charlesError.message)
      return
    }

    console.log('✅ Charles R. Sears created:', charlesAuth.user?.id)

    // Create user profile
    const { error: charlesProfileError } = await supabase
      .from('user_profiles')
      .upsert({
        id: charlesAuth.user.id,
        email: charlesEmail,
        full_name: 'Charles R. Sears',
        role: 'chamber_admin'
      })

    if (charlesProfileError) {
      console.error('❌ Failed to create Charles profile:', charlesProfileError.message)
    } else {
      console.log('✅ Charles profile created')
    }

    // Get demo chamber
    let { data: chamber, error: chamberError } = await supabase
      .from('chambers')
      .select('id')
      .eq('name', 'Demo Chamber of Commerce')
      .single()

    if (chamberError && chamberError.code === 'PGRST116') {
      // Create demo chamber
      const { data: newChamber, error: createChamberError } = await supabase
        .from('chambers')
        .insert({
          name: 'Demo Chamber of Commerce',
          slug: 'demo-chamber',
          description: 'Demo chamber for testing MVP features',
          email: 'info@demochamber.org',
          phone: '(555) 123-4567',
          address: '123 Demo St, Demo City, DC 12345',
          user_id: charlesAuth.user.id
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

    // Create chamber membership for Charles
    const { error: membershipError } = await supabase
      .from('chamber_memberships')
      .upsert({
        user_id: charlesAuth.user.id,
        chamber_id: chamber.id,
        role: 'admin',
        status: 'active'
      })

    if (membershipError) {
      console.error('❌ Failed to create Charles membership:', membershipError.message)
    } else {
      console.log('✅ Charles chamber membership created')
    }

    // 2. Create Business Demo User (Sarah)
    console.log('\n📋 Creating business demo user...')
    
    const { data: sarahAuth, error: sarahError } = await supabase.auth.signUp({
      email: 'sarah.demo@demomarketing.com',
      password: 'Demo123!@#',
      options: {
        data: {
          full_name: 'Sarah Johnson',
          user_type: 'business_owner'
        }
      }
    })

    if (sarahError) {
      console.error('❌ Failed to create Sarah:', sarahError.message)
    } else {
      console.log('✅ Sarah Johnson created:', sarahAuth.user?.id)

      // Create user profile for Sarah
      const { error: sarahProfileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: sarahAuth.user.id,
          email: 'sarah.demo@demomarketing.com',
          full_name: 'Sarah Johnson',
          role: 'business_owner'
        })

      if (sarahProfileError) {
        console.error('❌ Failed to create Sarah profile:', sarahProfileError.message)
      } else {
        console.log('✅ Sarah profile created')
      }

      // Create chamber membership for Sarah as regular member
      const { error: sarahMembershipError } = await supabase
        .from('chamber_memberships')
        .upsert({
          user_id: sarahAuth.user.id,
          chamber_id: chamber.id,
          role: 'member',
          status: 'active'
        })

      if (sarahMembershipError) {
        console.error('❌ Failed to create Sarah membership:', sarahMembershipError.message)
      } else {
        console.log('✅ Sarah chamber membership created')
      }
    }

    console.log('\n🎉 Demo users setup complete!')
    console.log('\n📋 Demo Credentials:')
    console.log('👨‍💼 Chamber Admin:')
    console.log('   Email: charles.demo@gmail.com')
    console.log('   Password: Demo123!@#')
    console.log('   Access: /admin dashboard')
    console.log('\n👩‍💼 Business Member:')
    console.log('   Email: sarah.demo@demomarketing.com') 
    console.log('   Password: Demo123!@#')
    console.log('   Access: /dashboard')
    console.log('\n🌐 Test URLs:')
    console.log('   Chamber Login: http://localhost:5173/auth/chamber-login')
    console.log('   Business Login: http://localhost:5173/auth/business-login')

  } catch (error) {
    console.error('❌ Setup failed:', error)
  }
}

setupDemoUsers() 