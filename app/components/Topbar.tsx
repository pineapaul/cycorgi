'use client'

import { useState } from 'react'

export default function Topbar() {
  const [notifications] = useState(3)

  return (
    <header className="h-16 flex items-center justify-between px-6 shadow-sm" style={{ backgroundColor: '#FFF2E0', borderBottom: '1px solid #C0C9EE' }}>
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2">
        <span className="text-gray-500">Dashboard</span>
        <span className="text-gray-300">/</span>
        <span className="text-gray-900 font-medium">Overview</span>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="w-64 pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
            style={{ 
              borderColor: '#A2AADB'
            }}
          />
          <div className="absolute left-3 top-2.5" style={{ color: '#898AC4' }}>🔍</div>
        </div>

        {/* Notifications */}
        <button className="relative p-2 transition-colors" style={{ color: '#898AC4' }}>
          <span className="text-xl">🔔</span>
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
  