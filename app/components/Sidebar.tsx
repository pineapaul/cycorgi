'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import Icon from './Icon'
import { useState } from 'react'



const programItems = [
  { name: 'Scope', href: '/program/scope' },
  { name: 'Issues', href: '/program/issues' },
  { name: 'Objectives', href: '/program/objectives' },
  { name: 'Roles', href: '/program/roles' },
]

const inventoryManagementItems = [
  { name: 'Information Assets', href: '/inventory/information-assets' },
  { name: 'Third Parties', href: '/inventory/third-parties' },
  { name: 'Threat Library', href: '/inventory/threat-library' },
]

const governanceItems = [
  { name: 'Policies', href: '/governance/policies' },
  { name: 'Security Steering Committee', href: '/governance/security-steering-committee' },
]

const riskManagementItems = [
  { name: 'Risk Register', href: '/risk-management/register' },
  { name: 'Risk Assessments', href: '/risk-management/assessments' },
  { name: 'Risk Exceptions', href: '/risk-management/exceptions' },
]

const complianceItems = [
  { name: 'Statement of Applicability', href: '/compliance/statement-of-applicability' },
  { name: 'Corrective Actions', href: '/compliance/corrective-actions' },
  { name: 'Improvements', href: '/compliance/improvements' },
]

const ismsOperationsItems = [
  { name: 'Security Calendar', href: '/isms-operations/calendar' },
  { name: 'Information Security Incidents', href: '/isms-operations/incidents' },
  { name: 'Document Review Schedule', href: '/isms-operations/document-review' },
  { name: 'DR Drill Schedule', href: '/isms-operations/dr-drill' },
  { name: 'Measurements & Metrics', href: '/isms-operations/measurements' },
  { name: 'Training and Awareness', href: '/isms-operations/training' },
]

const reportsItems = [
  { name: 'Risk Reports', href: '/reports/risk' },
  { name: 'Compliance Reports', href: '/reports/compliance' },
  { name: 'Audit Reports', href: '/reports/audit' },
]

const settingsItems = [
  { name: 'User Management', href: '/settings/users' },
  { name: 'System Configuration', href: '/settings/system' },
  { name: 'Preferences', href: '/settings/preferences' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const { data: session } = useSession()

  const handleMenuToggle = (menuName: string) => {
    setOpenMenu(openMenu === menuName ? null : menuName)
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (session?.user?.name) {
      return session.user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return 'U'
  }

  // Get user display name
  const getUserDisplayName = () => {
    return session?.user?.name || 'Guest User'
  }

  // Get user role display
  const getUserRole = () => {
    if (session?.user?.roles && session.user.roles.length > 0) {
      // Capitalize first letter and replace underscores with spaces
      return session.user.roles[0]
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (l: string) => l.toUpperCase())
    }
    return 'User'
  }

  return (
    <aside className="h-full w-64 text-white flex flex-col flex-shrink-0" style={{ backgroundColor: '#898AC4' }}>
      {/* Logo */}
      <div className="p-4 md:p-6 border-b" style={{ borderColor: '#A2AADB' }}>
        <div className="flex items-center space-x-2 md:space-x-3">
          <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#C0C9EE' }}>
            <img src="/angry-corgi.png" alt="Cycorgi Logo" className="w-4 h-4 md:w-6 md:h-6" />
          </div>
          <div>
            <div className="font-bold text-sm md:text-lg">Cycorgi</div>
            <div className="text-xs" style={{ color: '#C0C9EE' }}>GRC Platform</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 md:p-4 space-y-1 overflow-y-auto">
        {/* Dashboard Menu */}
        <div className="relative group">
          <button
            className={cn(
              'flex items-center w-full space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none',
              openMenu === 'dashboard' ? 'bg-[#A2AADB] text-white shadow-lg' : 'text-white hover:text-white'
            )}
            style={{ backgroundColor: openMenu === 'dashboard' ? '#A2AADB' : 'transparent' }}
            onClick={() => handleMenuToggle('dashboard')}
          >
            <Icon name="dashboard" size={20} />
            <span>Dashboard</span>
            <span
              className={cn(
                "ml-auto transition-opacity",
                openMenu === 'dashboard' ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}
            >
              {openMenu === 'dashboard' ? '▲' : '▼'}
            </span>
          </button>
          {openMenu === 'dashboard' && (
            <div className="ml-7 mt-1 space-y-1">
              <Link
                href="/dashboard"
                className={cn(
                  'block px-3 py-1 rounded text-sm transition-all',
                  pathname === '/dashboard'
                    ? 'bg-white text-[#898AC4] font-semibold'
                    : 'text-white hover:bg-[#A2AADB] hover:text-white'
                )}
              >
                Overview
              </Link>
              <Link
                href="/dashboard/approvals"
                className={cn(
                  'block px-3 py-1 rounded text-sm transition-all',
                  pathname === '/dashboard/approvals'
                    ? 'bg-white text-[#898AC4] font-semibold'
                    : 'text-white hover:bg-[#A2AADB] hover:text-white'
                )}
              >
                Approvals
              </Link>
            </div>
          )}
        </div>

        {/* Program Menu */}
        <div className="relative group">
          <button
            className={cn(
              'flex items-center w-full space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none',
              openMenu === 'program' ? 'bg-[#A2AADB] text-white shadow-lg' : 'text-white hover:text-white'
            )}
            style={{ backgroundColor: openMenu === 'program' ? '#A2AADB' : 'transparent' }}
            onClick={() => handleMenuToggle('program')}
          >
            <Icon name="cubes" size={20} />
            <span>Program</span>
            {/* Dropdown icon: show if expanded, or on hover */}
            <span
              className={cn(
                "ml-auto transition-opacity",
                openMenu === 'program' ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}
            >
              {openMenu === 'program' ? '▲' : '▼'}
            </span>
          </button>
          {openMenu === 'program' && (
            <div className="ml-7 mt-1 space-y-1">
              {programItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'block px-3 py-1 rounded text-sm transition-all',
                    pathname === item.href
                      ? 'bg-white text-[#898AC4] font-semibold'
                      : 'text-white hover:bg-[#A2AADB] hover:text-white'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Inventories Menu */}
        <div className="relative group">
          <button
            className={cn(
              'flex items-center w-full space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none',
              openMenu === 'inventory' ? 'bg-[#A2AADB] text-white shadow-lg' : 'text-white hover:text-white'
            )}
            style={{ backgroundColor: openMenu === 'inventory' ? '#A2AADB' : 'transparent' }}
            onClick={() => handleMenuToggle('inventory')}
          >
            <Icon name="warehouse" size={20} />
            <span>Inventories</span>
            <span
              className={cn(
                "ml-auto transition-opacity",
                openMenu === 'inventory' ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}
            >
              {openMenu === 'inventory' ? '▲' : '▼'}
            </span>
          </button>
          {openMenu === 'inventory' && (
            <div className="ml-7 mt-1 space-y-1">
              {inventoryManagementItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'block px-3 py-1 rounded text-sm transition-all',
                    pathname === item.href
                      ? 'bg-white text-[#898AC4] font-semibold'
                      : 'text-white hover:bg-[#A2AADB] hover:text-white'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Governance Menu */}
        <div className="relative group">
          <button
            className={cn(
              'flex items-center w-full space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none',
              openMenu === 'governance' ? 'bg-[#A2AADB] text-white shadow-lg' : 'text-white hover:text-white'
            )}
            style={{ backgroundColor: openMenu === 'governance' ? '#A2AADB' : 'transparent' }}
            onClick={() => handleMenuToggle('governance')}
          >
            <Icon name="building-columns" size={20} />
            <span>Governance</span>
            <span
              className={cn(
                "ml-auto transition-opacity",
                openMenu === 'governance' ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}
            >
              {openMenu === 'governance' ? '▲' : '▼'}
            </span>
          </button>
          {openMenu === 'governance' && (
            <div className="ml-7 mt-1 space-y-1">
              {governanceItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'block px-3 py-1 rounded text-sm transition-all',
                    pathname === item.href
                      ? 'bg-white text-[#898AC4] font-semibold'
                      : 'text-white hover:bg-[#A2AADB] hover:text-white'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Risk Management Menu */}
        <div className="relative group">
          <button
            className={cn(
              'flex items-center w-full space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none',
              openMenu === 'riskManagement' ? 'bg-[#A2AADB] text-white shadow-lg' : 'text-white hover:text-white'
            )}
            style={{ backgroundColor: openMenu === 'riskManagement' ? '#A2AADB' : 'transparent' }}
            onClick={() => handleMenuToggle('riskManagement')}
          >
            <Icon name="risk" size={20} />
            <span>Risk Management</span>
            <span
              className={cn(
                "ml-auto transition-opacity",
                openMenu === 'riskManagement' ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}
            >
              {openMenu === 'riskManagement' ? '▲' : '▼'}
            </span>
          </button>
          {openMenu === 'riskManagement' && (
            <div className="ml-7 mt-1 space-y-1">
              {riskManagementItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'block px-3 py-1 rounded text-sm transition-all',
                    pathname === item.href
                      ? 'bg-white text-[#898AC4] font-semibold'
                      : 'text-white hover:bg-[#A2AADB] hover:text-white'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Compliance Menu */}
        <div className="relative group">
          <button
            className={cn(
              'flex items-center w-full space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none',
              openMenu === 'compliance' ? 'bg-[#A2AADB] text-white shadow-lg' : 'text-white hover:text-white'
            )}
            style={{ backgroundColor: openMenu === 'compliance' ? '#A2AADB' : 'transparent' }}
            onClick={() => handleMenuToggle('compliance')}
          >
            <Icon name="compliance" size={20} />
            <span>Compliance</span>
            <span
              className={cn(
                "ml-auto transition-opacity",
                openMenu === 'compliance' ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}
            >
              {openMenu === 'compliance' ? '▲' : '▼'}
            </span>
          </button>
          {openMenu === 'compliance' && (
            <div className="ml-7 mt-1 space-y-1">
              {complianceItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'block px-3 py-1 rounded text-sm transition-all',
                    pathname === item.href
                      ? 'bg-white text-[#898AC4] font-semibold'
                      : 'text-white hover:bg-[#A2AADB] hover:text-white'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ISMS Operations Menu */}
        <div className="relative group">
          <button
            className={cn(
              'flex items-center w-full space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none',
              openMenu === 'ismsOperations' ? 'bg-[#A2AADB] text-white shadow-lg' : 'text-white hover:text-white'
            )}
            style={{ backgroundColor: openMenu === 'ismsOperations' ? '#A2AADB' : 'transparent' }}
            onClick={() => handleMenuToggle('ismsOperations')}
          >
            <Icon name="briefcase" size={20} />
            <span>ISMS Operations</span>
            <span
              className={cn(
                "ml-auto transition-opacity",
                openMenu === 'ismsOperations' ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}
            >
              {openMenu === 'ismsOperations' ? '▲' : '▼'}
            </span>
          </button>
          {openMenu === 'ismsOperations' && (
            <div className="ml-7 mt-1 space-y-1">
              {ismsOperationsItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'block px-3 py-1 rounded text-sm transition-all',
                    pathname === item.href
                      ? 'bg-white text-[#898AC4] font-semibold'
                      : 'text-white hover:bg-[#A2AADB] hover:text-white'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Reports Menu */}
        <div className="relative group">
          <button
            className={cn(
              'flex items-center w-full space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none',
              openMenu === 'reports' ? 'bg-[#A2AADB] text-white shadow-lg' : 'text-white hover:text-white'
            )}
            style={{ backgroundColor: openMenu === 'reports' ? '#A2AADB' : 'transparent' }}
            onClick={() => handleMenuToggle('reports')}
          >
            <Icon name="chart-bar" size={20} />
            <span>Reports</span>
            <span
              className={cn(
                "ml-auto transition-opacity",
                openMenu === 'reports' ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}
            >
              {openMenu === 'reports' ? '▲' : '▼'}
            </span>
          </button>
          {openMenu === 'reports' && (
            <div className="ml-7 mt-1 space-y-1">
              {reportsItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'block px-3 py-1 rounded text-sm transition-all',
                    pathname === item.href
                      ? 'bg-white text-[#898AC4] font-semibold'
                      : 'text-white hover:bg-[#A2AADB] hover:text-white'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Settings Menu */}
        <div className="relative group">
          <button
            className={cn(
              'flex items-center w-full space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none',
              openMenu === 'settings' ? 'bg-[#A2AADB] text-white shadow-lg' : 'text-white hover:text-white'
            )}
            style={{ backgroundColor: openMenu === 'settings' ? '#A2AADB' : 'transparent' }}
            onClick={() => handleMenuToggle('settings')}
          >
            <Icon name="cog" size={20} />
            <span>Settings</span>
            <span
              className={cn(
                "ml-auto transition-opacity",
                openMenu === 'settings' ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}
            >
              {openMenu === 'settings' ? '▲' : '▼'}
            </span>
          </button>
          {openMenu === 'settings' && (
            <div className="ml-7 mt-1 space-y-1">
              {settingsItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'block px-3 py-1 rounded text-sm transition-all',
                    pathname === item.href
                      ? 'bg-white text-[#898AC4] font-semibold'
                      : 'text-white hover:bg-[#A2AADB] hover:text-white'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          )}
        </div>

      </nav>

      {/* User Info */}
      <div className="p-2 md:p-4 border-t flex-shrink-0" style={{ borderColor: '#A2AADB' }}>
        <div className="flex items-center space-x-2 md:space-x-3">
          <div className="w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#C0C9EE' }}>
            {session?.user?.image ? (
              <img 
                src={session.user.image} 
                alt={session.user.name || 'User'} 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-white text-xs md:text-sm font-medium">{getUserInitials()}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs md:text-sm font-medium truncate">{getUserDisplayName()}</div>
            <div className="text-xs" style={{ color: '#C0C9EE' }}>{getUserRole()}</div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="p-2 md:p-4 border-t flex-shrink-0" style={{ borderColor: '#A2AADB' }}>
        <div className="text-center">
          <div className="text-xs" style={{ color: '#C0C9EE' }}>
            © 2025 Cycorgi. All rights reserved.
          </div>
        </div>
      </div>
    </aside>
  )
}