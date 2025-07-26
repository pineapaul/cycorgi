'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Icon from './Icon'

export default function Topbar() {
  const [notifications] = useState(3)
  const pathname = usePathname()

  // Generate breadcrumbs based on current path
  const generateBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs = []
    
    // Always start with Dashboard
    breadcrumbs.push({ name: 'Dashboard', href: '/dashboard', icon: 'dashboard' })
    
    // Add other segments
    for (let i = 1; i < segments.length; i++) {
      const segment = segments[i]
      const href = '/' + segments.slice(0, i + 1).join('/')
      
      // Convert segment to readable name
      const name = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      
      breadcrumbs.push({ name, href, icon: getIconForSegment(segment) })
    }
    
    return breadcrumbs
  }

  const getIconForSegment = (segment: string) => {
    const iconMap: Record<string, string> = {
      'risk-register': 'risk',
      'audits': 'audit',
      'policies': 'policies',
      'compliance': 'compliance',
      'reports': 'reports',
      'settings': 'settings',
      'program': 'cubes',
      'scope': 'audit',
      'issues': 'risk',
      'objectives': 'compliance',
      'roles': 'settings'
    }
    return iconMap[segment] || 'dashboard'
  }

  const breadcrumbs = generateBreadcrumbs()

  return (
    <header className="h-16 flex items-center justify-between px-6 shadow-sm" style={{ backgroundColor: '#FFF2E0', borderBottom: '1px solid #C0C9EE' }}>
      {/* Enhanced Breadcrumb */}
      <div className="flex items-center space-x-2">
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.href} className="flex items-center space-x-2">
            {index > 0 && (
              <Icon name="audit" size={12} className="text-[#898AC4] opacity-50" />
            )}
            <div className="flex items-center space-x-2 px-3 py-1 rounded-lg transition-all duration-200 hover:bg-white/50">
              <Icon name={crumb.icon} size={16} className="text-[#898AC4]" />
              <span className={`text-sm font-medium ${
                index === breadcrumbs.length - 1 
                  ? 'text-gray-900' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}>
                {crumb.name}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button className="relative p-2 transition-colors hover:bg-white/50 rounded-lg" style={{ color: '#898AC4' }}>
          <Icon name="bell" size={20} />
          {notifications > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 text-white text-xs rounded-full flex items-center justify-center" style={{ backgroundColor: '#A2AADB' }}>
              {notifications}
            </span>
          )}
        </button>

        {/* User Menu */}
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">Paul Admin</div>
            <div className="text-xs text-gray-500">paul@company.com</div>
          </div>
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-gray-600 text-sm font-medium">P</span>
          </div>
        </div>
      </div>
    </header>
  )
}
  