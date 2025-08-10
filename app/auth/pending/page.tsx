'use client'

import { signOut, useSession } from 'next-auth/react'
import Icon from '@/app/components/Icon'

export default function PendingPage() {
  const { data: session } = useSession()

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-100">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
              <Icon name="clock" className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Account Pending</h2>
          <p className="mt-2 text-sm text-gray-600">
            Your account is awaiting administrator approval
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Welcome, {session?.user?.name}!</h3>
            <div className="space-y-4 text-gray-600">
              <p>
                Your account has been created successfully, but it requires approval from a system administrator before you can access the platform.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Icon name="exclamation-triangle" className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800">Account Status: Pending</p>
                    <p className="text-yellow-700 mt-1">
                      Please contact your system administrator to activate your account.
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-sm">
                You will receive an email notification once your account has been approved.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <Icon name="refresh" className="w-4 h-4 mr-2" />
              Check Status
            </button>
            
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center px-4 py-2 border border-red-300 rounded-lg shadow-sm bg-red-50 text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
            >
              <Icon name="logout" className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>

        <div className="text-center text-sm text-gray-600">
          <p>Questions? Contact your system administrator for assistance.</p>
        </div>
      </div>
    </div>
  )
}
