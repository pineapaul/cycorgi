'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Toast, ToastProps } from '@/app/components/Toast'

export interface ToastOptions {
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Cleanup function to clear all timeouts
  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    timeoutsRef.current.clear()
  }, [])

  // Auto-remove toast after duration
  const scheduleToastRemoval = useCallback((id: string, duration: number) => {
    const timeout = setTimeout(() => {
      removeToast(id)
    }, duration)
    
    timeoutsRef.current.set(id, timeout)
  }, [])

  const showToast = useCallback((options: ToastOptions) => {
    const id = crypto.randomUUID()
    const newToast: ToastProps = {
      id,
      type: options.type,
      title: options.title,
      message: options.message,
      duration: options.duration || 5000,
      onClose: (toastId: string) => {
        removeToast(toastId)
      }
    }
    
    setToasts(prev => [...prev, newToast])
    
    // Schedule auto-removal
    scheduleToastRemoval(id, newToast.duration || 5000)
  }, [scheduleToastRemoval])

  const removeToast = useCallback((id: string) => {
    // Clear the timeout if it exists
    const timeout = timeoutsRef.current.get(id)
    if (timeout) {
      clearTimeout(timeout)
      timeoutsRef.current.delete(id)
    }
    
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllTimeouts()
    }
  }, [clearAllTimeouts])

  return {
    toasts,
    showToast,
    removeToast
  }
}
