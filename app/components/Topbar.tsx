'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Icon from './Icon'

export default function Topbar() {
  const [notifications] = useState(3)
  const pathname = usePathname()

  // Get tabs based on current page
  const getTabs = () => {
    if (pathname.includes('/inventory/information-assets')) {
      return [
        { name: 'Information Assets', href: '/inventory/information-assets', active: true },
        { name: 'Third Parties', href: '/inventory/third-parties', active: false }
      ]
    }
    
    if (pathname.includes('/inventory/third-parties')) {
      return [
        { name: 'Information Assets', href: '/inventory/information-assets', active: false },
        { name: 'Third Parties', href: '/inventory/third-parties', active: true }
      ]
    }
    
    if (pathname.includes('/risk-management')) {
      return [
        { name: 'Register', href: '/risk-management/register', active: pathname.includes('/register') },
        { name: 'Draft Risks', href: '/risk-management/draft-risks', active: pathname.includes('/draft-risks') }
      ]
    }
    
    if (pathname.includes('/compliance')) {
      return [
        { name: 'SOA', href: '/dashboard/compliance/soa', active: pathname.includes('/soa') },
        { name: 'Actions', href: '/dashboard/compliance/corrective-actions', active: pathname.includes('/corrective-actions') },
        { name: 'Improvements', href: '/dashboard/compliance/improvements', active: pathname.includes('/improvements') }
      ]
    }
    
    if (pathname.includes('/isms-operations')) {
      return [
        { name: 'Calendar', href: '/dashboard/isms-operations/calendar', active: pathname.includes('/calendar') },
        { name: 'Incidents', href: '/dashboard/isms-operations/incidents', active: pathname.includes('/incidents') },
        { name: 'Documents', href: '/dashboard/isms-operations/document-review', active: pathname.includes('/document-review') },
        { name: 'Drills', href: '/dashboard/isms-operations/dr-drill', active: pathname.includes('/dr-drill') },
        { name: 'Metrics', href: '/dashboard/isms-operations/measurements', active: pathname.includes('/measurements') }
      ]
    }
    
    // Default dashboard tabs
    return [
      { name: 'Overview', href: '/dashboard', active: true },
      { name: 'Activity', href: '/dashboard/activity', active: false }
    ]
  }

  const tabs = getTabs()

  return (
    <header className="h-16 flex items-center justify-between px-3 md:px-6 shadow-sm overflow-hidden" style={{ backgroundColor: '#FFF2E0', borderBottom: '1px solid #C0C9EE' }}>
      {/* Tabs */}
      <div className="flex items-center space-x-1 md:space-x-2 overflow-x-auto">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
              tab.active 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            {tab.name}
          </Link>
        ))}
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
        {/* Notifications */}
        <button className="relative p-1 md:p-2 transition-colors hover:bg-white/50 rounded-lg" style={{ color: '#898AC4' }}>
          <Icon name="bell" size={16} className="md:w-5" />
          {notifications > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 text-white text-xs rounded-full flex items-center justify-center" style={{ backgroundColor: '#A2AADB' }}>
              {notifications}
            </span>
          )}
        </button>

        {/* User Menu */}
        <div className="flex items-center space-x-2 md:space-x-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs md:text-sm font-medium text-gray-900 truncate">Paul Admin</div>
            <div className="text-xs text-gray-500 truncate">admin@cycorgi.org</div>
          </div>
          <div className="w-6 h-6 md:w-8 md:h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-gray-600 text-xs md:text-sm font-medium">P</span>
          </div>
        </div>
      </div>
    </header>
  )
}
  