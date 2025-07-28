import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  UserPlus, 
  Calendar, 
  Settings, 
  Download, 
  Upload,
  Mail,
  TrendingUp,
  Users,
  FileText,
  CreditCard
} from 'lucide-react'

interface QuickActionsCardProps {
  chamberId?: string
}

export function QuickActionsCard({ chamberId }: QuickActionsCardProps) {
  const quickActions = [
    {
      title: 'Invite New Member',
      description: 'Send invitation to join chamber',
      icon: UserPlus,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      action: () => {
        // TODO: Open invite member modal
        console.log('Open invite member modal')
      }
    },
    {
      title: 'Create Event',
      description: 'Schedule new chamber event',
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      action: () => {
        // TODO: Navigate to create event page
        console.log('Navigate to create event')
      }
    },
    {
      title: 'Send Newsletter',
      description: 'Email all chamber members',
      icon: Mail,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      action: () => {
        // TODO: Open newsletter composer
        console.log('Open newsletter composer')
      }
    },
    {
      title: 'Export Members',
      description: 'Download member directory',
      icon: Download,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      action: () => {
        // TODO: Export member data
        console.log('Export member data')
      }
    },
    {
      title: 'Import Members',
      description: 'Bulk import member data',
      icon: Upload,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      action: () => {
        // TODO: Open import modal
        console.log('Open import modal')
      }
    },
    {
      title: 'View Analytics',
      description: 'Chamber performance metrics',
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      action: () => {
        // TODO: Navigate to analytics page
        console.log('Navigate to analytics')
      }
    },
    {
      title: 'Manage Tiers',
      description: 'Edit membership tiers',
      icon: CreditCard,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
      action: () => {
        // TODO: Open tier management
        console.log('Open tier management')
      }
    },
    {
      title: 'Chamber Settings',
      description: 'Configure chamber profile',
      icon: Settings,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      action: () => {
        // TODO: Navigate to settings
        console.log('Navigate to settings')
      }
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>Quick Actions</span>
        </CardTitle>
        <CardDescription>
          Common administrative tasks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              onClick={action.action}
              className="justify-start h-auto p-3 hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3 w-full">
                <div className={`p-2 rounded-lg ${action.bgColor} border ${action.borderColor}`}>
                  <action.icon className={`h-4 w-4 ${action.color}`} />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900 text-sm">{action.title}</p>
                  <p className="text-gray-500 text-xs">{action.description}</p>
                </div>
              </div>
            </Button>
          ))}
        </div>

        {/* Separator */}
        <div className="my-4 border-t border-gray-200"></div>

        {/* Emergency Actions */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Reports & Data
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" variant="outline" className="text-xs">
              Monthly Report
            </Button>
            <Button size="sm" variant="outline" className="text-xs">
              Member Report
            </Button>
            <Button size="sm" variant="outline" className="text-xs">
              Event Report
            </Button>
            <Button size="sm" variant="outline" className="text-xs">
              Financial Report
            </Button>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-2">
            <div className="p-1 bg-blue-100 rounded">
              <FileText className="h-3 w-3 text-blue-600" />
            </div>
            <div>
              <h5 className="text-sm font-medium text-blue-900">Need Help?</h5>
              <p className="text-xs text-blue-700 mt-1">
                Check our admin guide for detailed instructions on managing your chamber.
              </p>
              <Button size="sm" variant="outline" className="mt-2 text-xs border-blue-300 text-blue-700 hover:bg-blue-100">
                View Admin Guide
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 