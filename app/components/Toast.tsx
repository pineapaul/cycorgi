'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Icon from './Icon'

export interface ToastProps {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  onClose: (id: string) => void
}

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  const handleClose = useCallback(() => {
    setIsExiting(true)
    setTimeout(() => {
      onClose(id)
    }, 300) // Match the exit animation duration
  }, [id, onClose])

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100)
    
    // Auto dismiss
    const dismissTimer = setTimeout(() => {
      handleClose()
    }, duration)

    return () => {
      clearTimeout(timer)
      clearTimeout(dismissTimer)
    }
  }, [duration, handleClose])

  const getToastStyles = () => {
    const baseStyles = "relative flex items-start p-4 rounded-lg shadow-lg border-l-4 transform transition-all duration-300 ease-in-out"
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-50 border-green-400 text-green-800`
      case 'error':
        return `${baseStyles} bg-red-50 border-red-400 text-red-800`
      case 'warning':
        return `${baseStyles} bg-yellow-50 border-yellow-400 text-yellow-800`
      case 'info':
        return `${baseStyles} bg-blue-50 border-blue-400 text-blue-800`
      default:
        return `${baseStyles} bg-gray-50 border-gray-400 text-gray-800`
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return { name: 'check-circle', className: 'text-green-500' }
      case 'error':
        return { name: 'exclamation-circle', className: 'text-red-500' }
      case 'warning':
        return { name: 'exclamation-triangle', className: 'text-yellow-500' }
      case 'info':
        return { name: 'information-circle', className: 'text-blue-500' }
      default:
        return { name: 'information-circle', className: 'text-gray-500' }
    }
  }

  const icon = getIcon()

  return (
    <div
      className={`${getToastStyles()} ${
        isVisible && !isExiting 
          ? 'translate-x-0 opacity-100' 
          : 'translate-x-full opacity-0'
      }`}
      style={{ minWidth: '320px', maxWidth: '480px' }}
    >
      <div className="flex-shrink-0 mr-3 mt-0.5">
        <Icon name={icon.name} size={20} className={icon.className} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium">{title}</p>
            {message && (
              <p className="text-sm mt-1 opacity-90">{message}</p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="flex-shrink-0 ml-3 p-1 rounded-md hover:bg-black hover:bg-opacity-10 transition-colors"
            aria-label="Close notification"
          >
            <Icon name="x-mark" size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export interface ToastContextType {
  showToast: (toast: Omit<ToastProps, 'id' | 'onClose'>) => void
  hideToast: (id: string) => void
}

export const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const showToast = (toast: Omit<ToastProps, 'id' | 'onClose'>) => {
    // Use crypto.randomUUID() for cryptographically secure, collision-resistant ID generation
    // Fallback to timestamp + random for older browsers that don't support crypto.randomUUID()
    const id = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const newToast: ToastProps = {
      ...toast,
      id,
      onClose: hideToast
    }
    
    setToasts(prev => [...prev, newToast])
  }

  const hideToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-3 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast {...toast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = React.useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
} 