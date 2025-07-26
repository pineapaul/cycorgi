'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Risk Register', href: '/dashboard/risk-register', icon: '⚠️' },
  { name: 'Audits', href: '/dashboard/audits', icon: '🔍' },
  { name: 'Policies', href: '/dashboard/policies', icon: '📋' },
  { name: 'Compliance', href: '/dashboard/compliance', icon: '✅' },
  { name: 'Reports', href: '/dashboard/reports', icon: '📈' },
  { name: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
]

export default function Sidebar() {
  const pathname = usePathname()

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
        {navItems.map((item) => (
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
            <span className="text-lg">{item.icon}</span>
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