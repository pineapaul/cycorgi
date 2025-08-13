'use client'

import { SessionProvider } from 'next-auth/react'
import { ToastProvider } from './Toast'
import RoleMismatchAlert from './RoleMismatchAlert'

interface ProvidersProps {
  children: React.ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ToastProvider>
        <RoleMismatchAlert />
        {children}
      </ToastProvider>
    </SessionProvider>
  )
}
