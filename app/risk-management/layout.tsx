'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '../layouts/DashboardLayout'
import Icon from '../components/Icon'

export default function RiskManagementLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  const tabs = [
    {
      name: 'Register',
      href: '/risk-management/register'
    },
    {
      name: 'Draft Risks',
      href: '/risk-management/treatments'
    }
  ]

  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  )
} 