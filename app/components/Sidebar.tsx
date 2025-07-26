'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils' // Optional helper for classNames

const navItems = [
  { name: 'Overview', href: '/dashboard' },
  { name: 'Risk Register', href: '/dashboard/risk-register' },
  { name: 'Audits', href: '/dashboard/audits' },
  { name: 'Policies', href: '/dashboard/policies' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="h-full w-64 bg-white border-r px-4 py-6 shadow-sm">
      <div className="text-2xl font-bold mb-6">GRC Platform</div>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'block px-3 py-2 rounded-md text-sm font-medium transition',
              pathname === item.href
                ? 'bg-blue-500 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            )}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
