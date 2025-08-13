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

  if (status === 'loading') {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
        <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
        <div className="text-xs text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return (
      <button
        onClick={() => signIn('google')}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      >
        <Icon name="login" className="w-4 h-4" />
        <span>Sign In</span>
      </button>
    )
  }

  // Compute anchor rect for portal positioning
  const anchorRect = anchorRef.current?.getBoundingClientRect()

  return (
    <div className="relative">
      {/* Tiny debug pill; remove later */}
      <div className="absolute -top-8 left-0 bg-yellow-100 text-xs text-yellow-800 px-2 py-1 rounded border border-yellow-300 z-[60] whitespace-nowrap">
        Session: {status} | Menu: {isMenuOpen ? 'Open' : 'Closed'}
      </div>

      <button
        ref={anchorRef}
        onClick={() => setIsMenuOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={isMenuOpen}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      >
        {session.user?.image ? (
          // Prefer next/image in your app; <img> is fine for debugging
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
          className={`w-4 h-4 text-gray-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* MENU IN A PORTAL */}
      {isMenuOpen && typeof window !== 'undefined' && anchorRect &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            // Fixed + viewport coords avoids clipping; z-[999] beats most headers
            className="fixed z-[999] w-64 bg-white rounded-lg shadow-lg border py-2"
            style={{
              top: anchorRect.bottom + 8,
              left: Math.max(8, Math.min(anchorRect.left, window.innerWidth - 8 - 256)), // keep on-screen
            }}
          >
            <div className="px-4 py-2 border-b">
              <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
              <p className="text-xs text-gray-500">{session.user?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                {session.user?.role && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    {session.user.role}
                  </span>
                )}
                {session.user?.status && (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      session.user.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {session.user.status}
                  </span>
                )}
              </div>
            </div>

            <div className="py-1">
              <button
                onClick={() => {
                  setIsMenuOpen(false)
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
                  console.log('Navigate to settings')
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Icon name="settings" className="w-4 h-4 mr-3" />
                Settings
              </button>
            </div>

            <div className="border-t">
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
          </div>,
          document.body
        )
      }
    </div>
  )
}
