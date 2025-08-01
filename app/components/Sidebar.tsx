'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import Icon from './Icon'
import { useState } from 'react'

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
  // Program menu will be inserted here
  { name: 'Compliance', href: '/compliance', icon: 'compliance' },
  { name: 'ISMS Operations', href: '/dashboard/isms-operations', icon: 'settings' },
  { name: 'Reports', href: '/dashboard/reports', icon: 'reports' },
  { name: 'Settings', href: '/dashboard/settings', icon: 'settings' },
]

const programItems = [
  { name: 'Scope', href: '/dashboard/program/scope' },
  { name: 'Issues', href: '/dashboard/program/issues' },
  { name: 'Objectives', href: '/dashboard/program/objectives' },
  { name: 'Roles', href: '/dashboard/program/roles' },
]

const inventoryManagementItems = [
  { name: 'Information Assets', href: '/inventory/information-assets' },
  { name: 'Third Parties', href: '/inventory/third-parties' },
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
  { name: 'Security Calendar', href: '/dashboard/isms-operations/calendar' },
  { name: 'Information Security Incidents', href: '/dashboard/isms-operations/incidents' },
  { name: 'Document Review Schedule', href: '/dashboard/isms-operations/document-review' },
  { name: 'DR Drill Schedule', href: '/dashboard/isms-operations/dr-drill' },
  { name: 'Measurements & Metrics', href: '/dashboard/isms-operations/measurements' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const handleMenuToggle = (menuName: string) => {
    setOpenMenu(openMenu === menuName ? null : menuName)
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
        {/* Dashboard */}
        <Link
          key={navItems[0].href}
          href={navItems[0].href}
          className={cn(
            'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
            pathname === navItems[0].href
              ? 'text-white shadow-lg'
              : 'text-white hover:text-white'
          )}
          style={{
            backgroundColor: pathname === navItems[0].href ? '#A2AADB' : 'transparent'
          }}
        >
          <Icon name={navItems[0].icon} size={20} />
          <span>{navItems[0].name}</span>
        </Link>

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

        {/* Other nav items */}
        {navItems.slice(4).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              pathname === item.href
                ? 'text-white shadow-lg'
                : 'text-white hover:text-white'
            )}
            style={{
              backgroundColor: pathname === item.href ? '#A2AADB' : 'transparent'
            }}
          >
            <Icon name={item.icon} size={20} />
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* User Info */}
      <div className="p-2 md:p-4 border-t flex-shrink-0" style={{ borderColor: '#A2AADB' }}>
        <div className="flex items-center space-x-2 md:space-x-3">
          <div className="w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#C0C9EE' }}>
            <span className="text-white text-xs md:text-sm font-medium">P</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs md:text-sm font-medium truncate">Paul Admin</div>
            <div className="text-xs" style={{ color: '#C0C9EE' }}>Administrator</div>
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