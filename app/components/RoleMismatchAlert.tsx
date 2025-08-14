'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

export default function RoleMismatchAlert() {
  const { data: session } = useSession()
  const [showAlert, setShowAlert] = useState(false)
  const [dbRole, setDbRole] = useState<string | null>(null)

  useEffect(() => {
    const checkRoleMismatch = async () => {
      if (!session?.user?.email) return

      try {
        // Check if there's a role mismatch by fetching current user data from system-settings debug endpoint
        const response = await fetch('/api/system-settings', { method: 'POST' })
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data) {
            const currentDbRoles = data.data.databaseRole
            setDbRole(currentDbRoles)
            
            // Show alert if there's a mismatch
            const sessionRoles = session.user.roles || []
            const dbRolesArray = currentDbRoles !== 'No roles' ? currentDbRoles.split(', ') : []
            
            // Check if there's any mismatch between session and database roles
            const hasMismatch = sessionRoles.length !== dbRolesArray.length || 
              !sessionRoles.every(role => dbRolesArray.includes(role))
            
            if (hasMismatch) {
              setShowAlert(true)
            } else {
              setShowAlert(false)
            }
          }
        }
      } catch (error) {
        console.error('Error checking role mismatch:', error)
      }
    }

    // Check for role mismatch when session changes
    if (session?.user) {
      checkRoleMismatch()
    }
  }, [session])

  if (!showAlert) return null

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg max-w-md">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Role Mismatch Detected
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>Your session shows: <strong>{session?.user?.roles?.join(', ') || 'No roles'}</strong></p>
            <p>Database shows: <strong>{dbRole}</strong></p>
            <p className="mt-2">Your session will automatically sync shortly.</p>
          </div>
          <div className="mt-3">
            <button
              onClick={() => setShowAlert(false)}
              className="bg-yellow-100 text-yellow-800 px-3 py-1.5 text-xs font-medium rounded hover:bg-yellow-200"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
