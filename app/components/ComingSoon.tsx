'use client'

import Link from 'next/link'
import Icon from './Icon'

interface ComingSoonProps {
  title: string
  description?: string
  icon?: string
  backHref?: string
}

export default function ComingSoon({ 
  title, 
  description = "This feature is currently under development and will be available soon.", 
  icon = "construction",
  backHref = "/dashboard"
}: ComingSoonProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-auto text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Icon */}
          <div className="mx-auto w-16 h-16 mb-6 rounded-full bg-purple-100 flex items-center justify-center">
            <Icon name={icon} size={32} className="text-purple-600" />
          </div>
          
          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {title}
          </h1>
          
          {/* Description */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            {description}
          </p>
          
          {/* Progress indicator */}
          <div className="mb-8">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Development in progress</p>
          </div>
          
          {/* Back button */}
          <Link
            href={backHref}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
          >
            <Icon name="arrow-left" size={16} className="mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
} 