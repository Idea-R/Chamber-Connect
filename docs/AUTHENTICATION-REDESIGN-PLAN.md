# Chamber Connect Authentication Redesign Plan

## Current Issues
- ❌ Demo login credentials don't exist
- ❌ 406 API errors on chamber endpoints  
- ❌ No differentiation between chamber vs business login
- ❌ Missing signup flows for different user types
- ❌ Dead links (blog, etc.)
- ❌ Missing Stripe configuration

## Required User Types & Authentication Flow

### 1. Chamber Authentication
**Chamber Creator/Admin:**
- Creates chamber profile → becomes chamber admin
- Can invite chamber members
- Manages member directory & dues
- Can export business directory
- Sets up member tiers (Silver/Gold/Platinum)

**Chamber Member (Staff):**
- Invited by chamber admin
- Can view member directory
- Limited admin access

### 2. Business Authentication  
**Business Owner (Chamber Member):**
- Selects chamber from database during signup
- Gets verified chamber member tag
- Full feature access
- Can invite business staff

**Business Owner (Trial Account):**
- 1-month trial period
- Limited features (no events, restricted profile)
- "Trial" tag displayed
- Can select chamber for trial networking

**Business Staff:**
- Invited by business owner
- Limited business profile access

### 3. Authentication UI Structure

#### Landing Page Navigation:
```
[Chamber Login] [Business Login] [View Demo]
```

#### Chamber Login Portal:
- Email/Password for chamber admins & staff
- "Create New Chamber" link
- Demo button for testing

#### Business Login Portal:  
- Email/Password for business owners & staff
- "Register Business" link
- Trial account option

## Implementation Phases

### Phase 1: Fix Critical Issues (Immediate)
- [ ] Add missing Stripe publishable key
- [ ] Create demo user accounts in database
- [ ] Fix 406 API errors (RLS policies)
- [ ] Update navigation to show Chamber vs Business login

### Phase 2: Authentication Redesign (Week 1)
- [ ] Create distinct signup flows:
  - Chamber creator signup
  - Business signup (chamber member)
  - Business signup (trial account)
- [ ] Implement user type differentiation in AuthContext
- [ ] Add member status tracking (chamber member, trial, staff)

### Phase 3: Member Management (Week 2)  
- [ ] Chamber admin invite system
- [ ] Business owner invite system
- [ ] Member directory with export functionality
- [ ] Dues tracking and status management
- [ ] Trial account restrictions

### Phase 4: Member Tiers & Features (Week 3)
- [ ] Customizable member tier system
- [ ] Verified member tags/badges
- [ ] Trial vs member feature restrictions
- [ ] Chamber member database integration

### Phase 5: Missing Pages & Polish (Week 4)
- [ ] Implement or remove dead links
- [ ] Blog system (if needed)
- [ ] Complete user onboarding flows
- [ ] Enhanced member profiles

## Database Schema Updates Required

### New Tables Needed:
```sql
-- Chamber invitations
CREATE TABLE chamber_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chamber_id uuid REFERENCES chambers(id),
  email text NOT NULL,
  role text NOT NULL, -- 'member', 'staff'
  invited_by uuid REFERENCES users(id),
  status text DEFAULT 'pending', -- 'pending', 'accepted', 'expired'
  expires_at timestamp WITH TIME ZONE,
  created_at timestamp WITH TIME ZONE DEFAULT now()
);

-- Business invitations  
CREATE TABLE business_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id),
  email text NOT NULL,
  role text NOT NULL, -- 'owner', 'staff'
  invited_by uuid REFERENCES users(id),
  status text DEFAULT 'pending',
  expires_at timestamp WITH TIME ZONE,
  created_at timestamp WITH TIME ZONE DEFAULT now()
);

-- Member tiers
CREATE TABLE chamber_member_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chamber_id uuid REFERENCES chambers(id),
  name text NOT NULL, -- 'Silver', 'Gold', 'Platinum'
  price_monthly numeric,
  benefits text[],
  created_at timestamp WITH TIME ZONE DEFAULT now()
);
```

### Updates to Existing Tables:
```sql
-- Add member tier tracking
ALTER TABLE chamber_memberships 
ADD COLUMN tier_id uuid REFERENCES chamber_member_tiers(id),
ADD COLUMN dues_status text DEFAULT 'current', -- 'current', 'overdue', 'trial'
ADD COLUMN trial_expires_at timestamp WITH TIME ZONE;

-- Add business member status
ALTER TABLE businesses
ADD COLUMN membership_status text DEFAULT 'trial', -- 'member', 'trial' 
ADD COLUMN trial_expires_at timestamp WITH TIME ZONE;
```

## Next Immediate Actions
1. **Fix demo login** - Create demo users in database
2. **Fix API errors** - Check RLS policies
3. **Update navigation** - Add Chamber vs Business login differentiation
4. **Create signup flow wireframes** - Design user experience

## Success Metrics
- ✅ Demo login works without errors
- ✅ Clear differentiation between user types
- ✅ Chamber admins can invite members
- ✅ Business owners can manage staff
- ✅ Trial accounts have proper restrictions
- ✅ Member directories are exportable
- ✅ No dead links in application 