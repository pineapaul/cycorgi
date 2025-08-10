'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import Icon from './Icon'
import { useState, useRef, useEffect } from 'react'

export default function AuthButton() {
  const { data: session, status } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (status === 'loading') {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <button
        onClick={() => signIn('google')}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
      >
        <Icon name="login" className="w-4 h-4" />
        <span>Sign In</span>
      </button>
    )
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
      >
        {session.user?.image ? (
          <img
            src={session.user.image}
            alt={session.user.name || 'User'}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <Icon name="user" className="w-5 h-5 text-gray-600" />
          </div>
        )}
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
          <p className="text-xs text-gray-500">{session.user?.role}</p>
        </div>
        <Icon
          name="chevron-down"
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isMenuOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
            <p className="text-xs text-gray-500">{session.user?.email}</p>
            <div className="flex items-center space-x-2 mt-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                {session.user?.role}
              </span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                session.user?.status === 'Active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {session.user?.status}
              </span>
            </div>
          </div>
          
          <div className="py-1">
            <button
              onClick={() => {
                setIsMenuOpen(false)
                // Add profile navigation here when profile page is created
                console.log('Navigate to profile')
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Icon name="user" className="w-4 h-4 mr-3" />
              Profile
            </button>
            
            <button
              onClick={() => {
                setIsMenuOpen(false)
                // Add settings navigation here when settings page is created
                console.log('Navigate to settings')
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Icon name="settings" className="w-4 h-4 mr-3" />
              Settings
            </button>
          </div>
          
          <div className="border-t border-gray-100">
            <button
              onClick={() => {
                setIsMenuOpen(false)
                signOut({ callbackUrl: '/auth/signin' })
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
            >
              <Icon name="logout" className="w-4 h-4 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
