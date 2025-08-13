'use client'

import { useState, useCallback } from 'react'
import { Toast, ToastProps } from '@/app/components/Toast'

export interface ToastOptions {
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const showToast = useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: ToastProps = {
      id,
      type: options.type,
      title: options.title,
      message: options.message,
      duration: options.duration || 5000,
      onClose: (toastId: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== toastId))
      }
    }
    
    setToasts(prev => [...prev, newToast])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  return {
    toasts,
    showToast,
    removeToast
  }
}
