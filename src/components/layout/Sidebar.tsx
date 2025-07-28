import React from 'react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Building2, Calendar, Users, MessageSquare, Star, Settings, LogOut, Bell, Globe, ChevronDown, Shield } from 'lucide-react'

export function Sidebar() {
  const location = useLocation()
  const { user, signOut, currentBusiness, currentChamber, userChambers, userProfile, primaryMembership } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  // Check if user is admin
  const isAdmin = userProfile?.role === 'chamber_admin' || 
                  ['admin', 'staff'].includes(primaryMembership?.role || '')

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Building2 },
    { name: 'Page', href: '/page', icon: Globe },
    { name: 'Events', href: '/events', icon: Calendar },
    { name: 'Members', href: '/members', icon: Users },
    { name: 'Messages', href: '/messages', icon: MessageSquare },
    { name: 'Spotlights', href: '/spotlights', icon: Star },
    ...(isAdmin ? [{ name: 'Admin Dashboard', href: '/admin', icon: Shield }] : []),
  ]

  const handleLogout = () => {
    signOut()
  }

  const displayName = currentBusiness?.contact_name || currentChamber?.name || user?.email || 'User'
  const businessName = currentBusiness?.name || currentChamber?.name || 
                      (userChambers.length > 0 && userChambers[0]?.chamber?.name ? userChambers[0].chamber.name : 'Chamber Connect')
  const avatarUrl = currentBusiness?.contact_avatar_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400'

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center px-6 py-4 border-b border-gray-200">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900">Chamber Connect</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.href
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:text-blue-700 hover:bg-gray-50'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-blue-700' : 'text-gray-500'}`} />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-gray-200 p-4 space-y-4">
        {/* Settings */}
        <Link
          to="/settings"
          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-700 hover:bg-gray-50 transition-colors"
        >
          <Settings className="h-5 w-5 text-gray-500" />
          <span>Settings</span>
        </Link>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-3 px-3 py-2 w-full hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Avatar>
                <AvatarImage src={avatarUrl} />
                <AvatarFallback>{displayName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
              <p className="text-xs text-gray-500 truncate">{businessName}</p>
              {userChambers.length > 1 && (
                <p className="text-xs text-blue-600">+{userChambers.length - 1} more chambers</p>
              )}
            </div>
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>
          
          {showUserMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2">
              <Link
                to="/profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setShowUserMenu(false)}
              >
                View Profile
              </Link>
              <Link
                to="/settings"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setShowUserMenu(false)}
              >
                Account Settings
              </Link>
              <hr className="my-1" />
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 inline mr-2" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}