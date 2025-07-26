'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import Icon from './Icon'
import { useState } from 'react'

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
  // Program menu will be inserted here
  { name: 'Compliance', href: '/dashboard/compliance', icon: 'compliance' },
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

const riskManagementItems = [
  { name: 'Risk Register', href: '/dashboard/risk-management/register' },
  { name: 'Risk Assessments', href: '/dashboard/risk-management/assessments' },
  { name: 'Risk Exceptions', href: '/dashboard/risk-management/exceptions' },
]

const inventoryManagementItems = [
  { name: 'Information Assets', href: '/dashboard/inventory/assets' },
  { name: 'Third Parties', href: '/dashboard/inventory/third-parties' },
]

const complianceItems = [
  { name: 'Statement of Applicability', href: '/dashboard/compliance/soa' },
  { name: 'Corrective Actions', href: '/dashboard/compliance/corrective-actions' },
  { name: 'Improvements', href: '/dashboard/compliance/improvements' },
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
  const [programOpen, setProgramOpen] = useState(false)
  const [riskManagementOpen, setRiskManagementOpen] = useState(false)
  const [inventoryOpen, setInventoryOpen] = useState(false)
  const [complianceOpen, setComplianceOpen] = useState(false)
  const [ismsOperationsOpen, setIsmsOperationsOpen] = useState(false)

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
              programOpen ? 'bg-[#A2AADB] text-white shadow-lg' : 'text-white hover:text-white'
            )}
            style={{ backgroundColor: programOpen ? '#A2AADB' : 'transparent' }}
            onClick={() => setProgramOpen((open) => !open)}
          >
            <Icon name="cubes" size={20} />
            <span>Program</span>
            {/* Dropdown icon: show if expanded, or on hover */}
            <span
              className={cn(
                "ml-auto transition-opacity",
                programOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}
            >
              {programOpen ? '▲' : '▼'}
            </span>
          </button>
          {programOpen && (
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
              inventoryOpen ? 'bg-[#A2AADB] text-white shadow-lg' : 'text-white hover:text-white'
            )}
            style={{ backgroundColor: inventoryOpen ? '#A2AADB' : 'transparent' }}
            onClick={() => setInventoryOpen((open) => !open)}
          >
            <Icon name="warehouse" size={20} />
            <span>Inventories</span>
            <span
              className={cn(
                "ml-auto transition-opacity",
                inventoryOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}
            >
              {inventoryOpen ? '▲' : '▼'}
            </span>
          </button>
          {inventoryOpen && (
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

        {/* Risk Management Menu */}
        <div className="relative group">
          <button
            className={cn(
              'flex items-center w-full space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none',
              riskManagementOpen ? 'bg-[#A2AADB] text-white shadow-lg' : 'text-white hover:text-white'
            )}
            style={{ backgroundColor: riskManagementOpen ? '#A2AADB' : 'transparent' }}
            onClick={() => setRiskManagementOpen((open) => !open)}
          >
            <Icon name="risk" size={20} />
            <span>Risk Management</span>
            <span
              className={cn(
                "ml-auto transition-opacity",
                riskManagementOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}
            >
              {riskManagementOpen ? '▲' : '▼'}
            </span>
          </button>
          {riskManagementOpen && (
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
              complianceOpen ? 'bg-[#A2AADB] text-white shadow-lg' : 'text-white hover:text-white'
            )}
            style={{ backgroundColor: complianceOpen ? '#A2AADB' : 'transparent' }}
            onClick={() => setComplianceOpen((open) => !open)}
          >
            <Icon name="compliance" size={20} />
            <span>Compliance</span>
            <span
              className={cn(
                "ml-auto transition-opacity",
                complianceOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}
            >
              {complianceOpen ? '▲' : '▼'}
            </span>
          </button>
          {complianceOpen && (
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
              ismsOperationsOpen ? 'bg-[#A2AADB] text-white shadow-lg' : 'text-white hover:text-white'
            )}
            style={{ backgroundColor: ismsOperationsOpen ? '#A2AADB' : 'transparent' }}
            onClick={() => setIsmsOperationsOpen((open) => !open)}
          >
            <Icon name="briefcase" size={20} />
            <span>ISMS Operations</span>
            <span
              className={cn(
                "ml-auto transition-opacity",
                ismsOperationsOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}
            >
              {ismsOperationsOpen ? '▲' : '▼'}
            </span>
          </button>
          {ismsOperationsOpen && (
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
    </aside>
  )
}