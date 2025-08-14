'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import Icon from './Icon'
import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function AuthButton() {
  const { data: session, status } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const anchorRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close on outside click & ESC
  useEffect(() => {
    if (!isMenuOpen) return

    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node | null
      if (!t) return
      if (
        menuRef.current?.contains(t) ||
        anchorRef.current?.contains(t)
      ) return
      setIsMenuOpen(false)
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isMenuOpen])

  // Loading state with skeleton animation
  if (status === 'loading') {
    return (
      <div className="flex items-center space-x-3 px-3 py-2">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
        <div className="hidden md:block space-y-1">
          <div className="w-20 h-3 bg-gray-200 rounded animate-pulse" />
          <div className="w-16 h-2 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  // Sign in button - modern and inviting
  if (!session) {
    return (
      <button
        onClick={() => signIn('google')}
        className="group flex items-center space-x-2 px-4 py-2.5 bg-white text-gray-700 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md border border-gray-200 hover:border-purple-200"
        style={{ color: '#898AC4' }}
      >
        <Icon name="login" className="w-4 h-4 transition-transform group-hover:scale-110" />
        <span className="font-medium">Sign In</span>
      </button>
    )
  }

  // Compute anchor rect for portal positioning
  const anchorRect = anchorRef.current?.getBoundingClientRect()

  // Fallback position if anchor rect is not available
  const menuPosition = anchorRect ? {
    top: anchorRect.bottom + 16, // Increased from 8 to 16 for better spacing
    left: Math.max(8, Math.min(anchorRect.left, window.innerWidth - 8 - 288))
  } : {
    top: 80, // Fallback position below topbar
    left: window.innerWidth - 300 // Right-aligned fallback
  }

  return (
    <div className="relative">
      {/* User button - clean and interactive */}
      <button
        ref={anchorRef}
        onClick={() => setIsMenuOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={isMenuOpen}
        className="group flex items-center space-x-3 p-2.5 rounded-xl hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:ring-offset-2 transition-all duration-200 border border-transparent hover:border-purple-100"
      >
        {/* User avatar */}
        {session.user?.image ? (
          <img
            src={session.user.image}
            alt={session.user.name || 'User'}
            className="w-9 h-9 rounded-full ring-2 ring-white shadow-sm group-hover:ring-purple-100 transition-all duration-200"
          />
        ) : (
          <div className="w-9 h-9 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center ring-2 ring-white shadow-sm group-hover:ring-purple-100 transition-all duration-200">
            <Icon name="user" className="w-5 h-5 text-purple-600" />
          </div>
        )}
        
        {/* User info - responsive */}
        <div className="hidden md:block text-left">
          <p className="text-sm font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
            {session.user?.name}
          </p>
          <p className="text-xs font-medium" style={{ color: '#898AC4' }}>
            {session.user?.roles?.[0] || 'No role'}
          </p>
        </div>
        
        {/* Dropdown arrow */}
        <Icon
          name="chevron-down"
          className={`w-4 h-4 transition-all duration-200 ${isMenuOpen ? 'rotate-180 text-purple-500' : 'text-gray-400 group-hover:text-gray-600'}`}
        />
      </button>

      {/* Dropdown menu in portal */}
      {isMenuOpen && typeof window !== 'undefined' &&
        createPortal(
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-[9998] bg-black/20"
              onClick={() => setIsMenuOpen(false)}
            />
            <div
              ref={menuRef}
              role="menu"
              className="fixed z-[9999] w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 py-4 transition-all duration-200 ease-out"
              style={{
                top: menuPosition.top,
                left: menuPosition.left,
              }}
            >
            {/* User header section */}
            <div className="px-4 py-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    className="w-12 h-12 rounded-full ring-2 ring-purple-100"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center ring-2 ring-purple-100">
                    <Icon name="user" className="w-6 h-6 text-purple-600" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {session.user?.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {session.user?.email}
                  </p>
                </div>
              </div>
              
              {/* Role and status badges */}
              <div className="flex items-center gap-2 mt-4">
                {session.user?.roles && session.user.roles.length > 0 && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                    {session.user.roles.join(', ')}
                  </span>
                )}
                {session.user?.status && (
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                      session.user.status === 'Active'
                        ? 'bg-green-50 text-green-700 border-green-100'
                        : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                    }`}
                  >
                    {session.user.status}
                  </span>
                )}
              </div>
            </div>

            {/* Menu items */}
            <div className="py-3">
              <button
                onClick={() => {
                  setIsMenuOpen(false)
                  console.log('Navigate to profile')
                }}
                className="group flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors duration-150"
              >
                <Icon name="user" className="w-4 h-4 mr-3 text-gray-400 group-hover:text-purple-500 transition-colors" />
                Profile
              </button>
              <button
                onClick={() => {
                  setIsMenuOpen(false)
                  console.log('Navigate to settings')
                }}
                className="group flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors duration-150"
              >
                <Icon name="settings" className="w-4 h-4 mr-3 text-gray-400 group-hover:text-purple-500 transition-colors" />
                Settings
              </button>
            </div>

            {/* Sign out section */}
            <div className="border-t border-gray-100 pt-3 pb-1">
              <button
                onClick={() => {
                  setIsMenuOpen(false)
                  signOut({ callbackUrl: '/auth/signin' })
                }}
                className="group flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-150"
              >
                <Icon name="logout" className="w-4 h-4 mr-3 text-red-400 group-hover:text-red-500 transition-colors" />
                Sign Out
              </button>
            </div>
          </div>
          </>,
          document.body
        )
      }
    </div>
  )
}
