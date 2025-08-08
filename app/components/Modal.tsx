'use client'

import { ReactNode } from 'react'
import { useModal } from '@/app/hooks/useModal'
import Icon from './Icon'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  children: ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl'
  showCloseButton?: boolean
  closeOnBackdropClick?: boolean
  className?: string
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md', 
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl'
}

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = '2xl',
  showCloseButton = true,
  closeOnBackdropClick = true,
  className = ''
}: ModalProps) {
  const { modalRef, handleTabKey, handleBackdropClick } = useModal({ isOpen, onClose })

  const handleBackdropClickWrapper = (event: React.MouseEvent) => {
    if (closeOnBackdropClick) {
      handleBackdropClick(event)
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClickWrapper}
    >
      <div 
        ref={modalRef}
        className={`bg-white rounded-lg shadow-xl w-full ${maxWidthClasses[maxWidth]} max-h-[90vh] overflow-hidden ${className}`}
        onKeyDown={handleTabKey}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              {title && (
                <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <Icon name="x-mark" size={20} className="text-gray-500" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          {children}
        </div>
      </div>
    </div>
  )
}

// Convenience components for modal sections
export function ModalBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  )
}

export function ModalFooter({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex items-center justify-end space-x-3 p-6 border-t border-gray-200 ${className}`}>
      {children}
    </div>
  )
}
