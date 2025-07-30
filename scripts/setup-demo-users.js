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
  console.log('🚀 Setting up test accounts for all user roles...')
  console.log('📋 Creating demo users for DevToolsPanel testing')

  try {
    // Create test users for each role
    const testUsers = [
      {
        email: 'admin@chamber-connect.com',
        password: 'Admin123!@#',
        name: 'Chamber Connect Admin',
        role: 'chamber_admin',
        type: 'Super Admin'
      },
      {
        email: 'chamber.admin@test-chamber.com',
        password: 'Chamber123!@#',
        name: 'Test Chamber Admin',
        role: 'chamber_admin',
        type: 'Chamber Admin'
      },
      {
        email: 'business.owner@test-business.com',
        password: 'Business123!@#',
        name: 'Test Business Owner',
        role: 'business_owner',
        type: 'Business Owner'
      },
      {
        email: 'trial.user@test-trial.com',
        password: 'Trial123!@#',
        name: 'Test Trial User',
        role: 'staff',
        type: 'Trial User'
      }
    ]

    console.log('\n📋 Creating test user accounts...')
    
    for (const testUser of testUsers) {
      console.log(`\n👤 Creating ${testUser.type}...`)
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: testUser.email,
        password: testUser.password,
        options: {
          data: {
            full_name: testUser.name,
            user_type: testUser.role
          }
        }
      })

      if (authError && !authError.message.includes('User already registered')) {
        console.error(`❌ Failed to create ${testUser.type}:`, authError.message)
        continue
      }

      if (authError?.message.includes('User already registered')) {
        console.log(`⚠️  ${testUser.type} already exists`)
        continue
      }

      console.log(`✅ ${testUser.type} created:`, authData.user?.id)

      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: authData.user.id,
          email: testUser.email,
          full_name: testUser.name,
          role: testUser.role
        })

      if (profileError) {
        console.error(`❌ Failed to create ${testUser.type} profile:`, profileError.message)
      } else {
        console.log(`✅ ${testUser.type} profile created`)
      }
    }

    // Get the main admin user ID (first user created)
    const mainAdminUserId = testUsers[0].email === 'admin@chamber-connect.com' ? 
      (await supabase.auth.signInWithPassword({
        email: 'admin@chamber-connect.com',
        password: 'Admin123!@#'
      })).data?.user?.id : null

    console.log('\n🏢 Setting up demo chamber...')

    // Get demo chamber
    let { data: chamber, error: chamberError } = await supabase
      .from('chambers')
      .select('id')
      .eq('slug', 'springfield-demo')
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
        })
        .select('id')
        .single()

      if (createChamberError) {
        console.error('❌ Failed to create demo chamber:', createChamberError.message)
        return
      }
      
      chamber = newChamber
      console.log('✅ Demo chamber created')
    } else if (chamber) {
      console.log('⚠️  Demo chamber already exists')
    }

    // Create chamber memberships for test users
    if (mainAdminUserId && chamber) {
      const { error: membershipError } = await supabase
        .from('chamber_memberships')
        .upsert({
          user_id: mainAdminUserId,
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
          .update({ user_id: mainAdminUserId })
          .eq('id', business.id)

        if (businessUpdateError) {
          console.error('❌ Failed to link business to admin:', businessUpdateError.message)
        } else {
          console.log('✅ Demo business linked to admin')
        }
      }
    }

    console.log('\n🎉 Demo user setup complete!')
    console.log('\n👥 Test User Accounts Created:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    testUsers.forEach(user => {
      console.log(`🧑‍💼 ${user.type}:`)
      console.log(`   📧 Email: ${user.email}`)
      console.log(`   🔑 Password: ${user.password}`)
      console.log(`   🏷️  Role: ${user.role}`)
      console.log('')
    })
    console.log('\n🛠️  DevToolsPanel Integration:')
    console.log('   • Open your app at http://localhost:5173')
    console.log('   • Look for the orange "DEV" button in the top-right corner')
    console.log('   • Click it to open the Developer Tools Panel')
    console.log('   • Use "Quick Test Login" buttons to switch between users')
    console.log('\n🌐 Test URLs:')
    console.log('   • Main Dashboard: http://localhost:5173/dashboard')
    console.log('   • Pricing Page: http://localhost:5173/pricing')
    console.log('   • Chamber Login: http://localhost:5173/auth/chamber-login')
    console.log('   • Business Login: http://localhost:5173/auth/business-login')
    console.log('\n⚡ Authentication Options:')
    console.log('   1. 🚀 Google OAuth (primary - configure in Supabase dashboard)')
    console.log('   2. 🔧 DevToolsPanel Quick Login (for testing)')
    console.log('   3. 📝 Manual login via forms')
    console.log('\n📊 Next Steps:')
    console.log('   1. Test the DevToolsPanel quick login functionality')
    console.log('   2. Configure Google OAuth in Supabase dashboard')
    console.log('   3. Add Stripe publishable key to .env file')
    console.log('   4. Test role switching and permissions')
    console.log('   5. Test pricing and checkout flows')

  } catch (error) {
    console.error('❌ Setup failed:', error)
  }
}

setupAdminAccount() 