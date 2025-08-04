'use client'

import React from 'react'

interface TooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  theme?: 'purple' | 'dark' | 'light'
  className?: string
}

export default function Tooltip({ 
  content, 
  children, 
  position = 'top', 
  theme = 'purple',
  className = ''
}: TooltipProps) {
  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-0 mb-2'
      case 'bottom':
        return 'top-full left-0 mt-2'
      case 'left':
        return 'right-full top-0 mr-2'
      case 'right':
        return 'left-full top-0 ml-2'
      default:
        return 'bottom-full left-0 mb-2'
    }
  }

  const getArrowPosition = () => {
    switch (position) {
      case 'top':
        return 'absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent'
      case 'bottom':
        return 'absolute bottom-full left-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent'
      case 'left':
        return 'absolute top-4 left-full w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent'
      case 'right':
        return 'absolute top-4 right-full w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent'
      default:
        return 'absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent'
    }
  }

  const getThemeStyles = () => {
    switch (theme) {
      case 'purple':
        return {
          backgroundColor: '#4C1D95',
          borderTopColor: '#4C1D95',
          borderBottomColor: '#4C1D95',
          borderLeftColor: '#4C1D95',
          borderRightColor: '#4C1D95'
        }
      case 'dark':
        return {
          backgroundColor: '#1F2937',
          borderTopColor: '#1F2937',
          borderBottomColor: '#1F2937',
          borderLeftColor: '#1F2937',
          borderRightColor: '#1F2937'
        }
      case 'light':
        return {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#FFFFFF',
          borderBottomColor: '#FFFFFF',
          borderLeftColor: '#FFFFFF',
          borderRightColor: '#FFFFFF',
          color: '#374151',
          border: '1px solid #E5E7EB'
        }
      default:
        return {
          backgroundColor: '#4C1D95',
          borderTopColor: '#4C1D95',
          borderBottomColor: '#4C1D95',
          borderLeftColor: '#4C1D95',
          borderRightColor: '#4C1D95'
        }
    }
  }

  const themeStyles = getThemeStyles()

  return (
    <div className={`relative group ${className}`}>
      {children}
      <div className={`absolute ${getPositionClasses()} hidden group-hover:block z-10`}>
        <div 
          className="text-white text-xs rounded-lg p-2 shadow-lg max-w-xs break-words"
          style={themeStyles}
        >
          {content}
          <div 
            className={getArrowPosition()}
            style={themeStyles}
          />
        </div>
      </div>
    </div>
  )
} 