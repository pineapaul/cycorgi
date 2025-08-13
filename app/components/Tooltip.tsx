'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

type Position = 'top' | 'bottom' | 'left' | 'right'
type Theme = 'purple' | 'dark' | 'light'

interface TooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  position?: Position
  theme?: Theme
  className?: string
  /** If you expect super-long tokens (e.g., SHA strings), set true to force hard breaks */
  hardWrap?: boolean
}

export default function Tooltip({
  content,
  children,
  position = 'top',
  theme = 'purple',
  className = '',
  hardWrap = false,
}: TooltipProps) {
  const [open, setOpen] = useState(false)
  const [tooltipStyle, setTooltipStyle] = useState({})
  const triggerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft
      
      let top, left
      switch (position) {
        case 'top':
          top = rect.top + scrollTop - 8
          left = rect.left + scrollLeft + rect.width / 2
          break
        case 'bottom':
          top = rect.bottom + scrollTop + 8
          left = rect.left + scrollLeft + rect.width / 2
          break
        case 'left':
          top = rect.top + scrollTop + rect.height / 2
          left = rect.left + scrollLeft - 8
          break
        case 'right':
          top = rect.top + scrollTop + rect.height / 2
          left = rect.right + scrollLeft + 8
          break
        default:
          top = rect.top + scrollTop - 8
          left = rect.left + scrollLeft + rect.width / 2
      }
      
      setTooltipStyle({
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        transform: 'translate(-50%, -50%)',
        zIndex: 9999999,
      })
    }
  }, [open, position])

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2'
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-2'
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-2'
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-2'
      default:
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2'
    }
  }

  const getArrowClass = () => {
    // We keep borders transparent in className and set ONLY the needed side color via inline style below.
    switch (position) {
      case 'top':
        return 'absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent'
      case 'bottom':
        return 'absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-b-6 border-transparent'
      case 'left':
        return 'absolute top-1/2 -translate-y-1/2 left-full w-0 h-0 border-t-6 border-b-6 border-l-6 border-transparent'
      case 'right':
        return 'absolute top-1/2 -translate-y-1/2 right-full w-0 h-0 border-t-6 border-b-6 border-r-6 border-transparent'
      default:
        return ''
    }
  }

  // Background + text colours (no border colour here except for light theme outline)
  const bg =
    theme === 'purple' ? '#4C1D95' :
    theme === 'dark' ? '#1F2937' :
    '#FFFFFF'

  const textColor = theme === 'light' ? '#374151' : '#FFFFFF'
  const boxBorder = theme === 'light' ? '1px solid #E5E7EB' : 'none'

  // Arrow needs ONE coloured border side that matches background
  const arrowSideStyle = (() => {
    switch (position) {
      case 'top': return { borderTopColor: bg }
      case 'bottom': return { borderBottomColor: bg }
      case 'left': return { borderLeftColor: bg }
      case 'right': return { borderRightColor: bg }
    }
  })()

  return (
    <>
      <div
        ref={triggerRef}
        className={`relative inline-flex ${className}`}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        {children}
      </div>

      {open && typeof document !== 'undefined' && createPortal(
        <div
          className="pointer-events-none fixed"
          style={tooltipStyle}
        >
          <div
            className={[
              // sizing & wrapping — these fix long-text rendering
              'max-w-[32rem] px-3 py-2 text-sm leading-relaxed rounded-lg shadow-lg',
              hardWrap ? 'break-all whitespace-pre-wrap' : 'break-words whitespace-pre-wrap',
              // ensure tooltip content isn't clipped
              'overflow-visible',
            ].join(' ')}
            style={{ backgroundColor: bg, color: textColor, border: boxBorder }}
          >
            {content}
            <div className={getArrowClass()} style={arrowSideStyle} />
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
