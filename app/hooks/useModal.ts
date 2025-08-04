import { useState, useEffect, useCallback } from 'react'

interface UseModalProps {
  isOpen: boolean
  onClose: () => void
}

export function useModal({ isOpen, onClose }: UseModalProps) {
  const [modalRef, setModalRef] = useState<HTMLDivElement | null>(null)

  // Focus management for modal
  useEffect(() => {
    if (!isOpen) return

    const timer = setTimeout(() => {
      // Focus the first focusable element in the modal
      const firstFocusableElement = modalRef?.querySelector(
        'input, textarea, button, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement
      firstFocusableElement?.focus()
    }, 100)

    return () => clearTimeout(timer)
  }, [isOpen, modalRef])

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscapeKey)
    return () => document.removeEventListener('keydown', handleEscapeKey)
  }, [isOpen, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Handle tab key to trap focus within modal
  const handleTabKey = useCallback((event: React.KeyboardEvent) => {
    if (event.key !== 'Tab') return

    if (!modalRef) return

    const focusableElements = modalRef.querySelectorAll(
      'input, textarea, button, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }
  }, [modalRef])

  // Handle backdrop click to close modal
  const handleBackdropClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }, [onClose])

  return {
    modalRef: setModalRef,
    handleTabKey,
    handleBackdropClick
  }
} 