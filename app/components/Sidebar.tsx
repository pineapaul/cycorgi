'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import Icon from './Icon'
import { useState } from 'react'

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
  // Program menu will be inserted here
  { name: 'Risk Register', href: '/dashboard/risk-register', icon: 'risk' },
  { name: 'Audits', href: '/dashboard/audits', icon: 'audit' },
  { name: 'Policies', href: '/dashboard/policies', icon: 'policies' },
  { name: 'Compliance', href: '/dashboard/compliance', icon: 'compliance' },
  { name: 'Reports', href: '/dashboard/reports', icon: 'reports' },
  { name: 'Settings', href: '/dashboard/settings', icon: 'settings' },
]

const programItems = [
  { name: 'Scope', href: '/dashboard/program/scope' },
  { name: 'Issues', href: '/dashboard/program/issues' },
  { name: 'Objectives', href: '/dashboard/program/objectives' },
  { name: 'Roles', href: '/dashboard/program/roles' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [programOpen, setProgramOpen] = useState(false)

  return (
    <aside className="h-full w-64 text-white flex flex-col" style={{ backgroundColor: '#898AC4' }}>
      {/* Logo */}
      <div className="p-6 border-b" style={{ borderColor: '#A2AADB' }}>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#C0C9EE' }}>
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <div>
            <div className="font-bold text-lg">Cycorgi</div>
            <div className="text-xs" style={{ color: '#C0C9EE' }}>GRC Platform</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
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

        {/* Other nav items */}
        {navItems.slice(1).map((item) => (
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
      <div className="p-4 border-t" style={{ borderColor: '#A2AADB' }}>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#C0C9EE' }}>
            <span className="text-white text-sm font-medium">P</span>
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">Paul Admin</div>
            <div className="text-xs" style={{ color: '#C0C9EE' }}>Administrator</div>
          </div>
        </div>
      </div>
    </aside>
  )
}