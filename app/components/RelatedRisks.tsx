'use client'

import { useState, useEffect } from 'react'
import Icon from './Icon'
import Link from 'next/link'

interface RelatedRisk {
  riskId: string
}

interface RelatedRisksProps {
  controlId: string
  className?: string
}

export function RelatedRisks({ controlId, className = '' }: RelatedRisksProps) {
  const [relatedRisks, setRelatedRisks] = useState<RelatedRisk[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRelatedRisks = async () => {
      if (!controlId) return
      
      setLoading(true)
      setError(null)
      
      try {
        const response = await fetch(`/api/compliance/soa/${controlId}/related-risks`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        
        if (result.success) {
          setRelatedRisks(result.data)
        } else {
          setError(result.error || 'Failed to fetch related risks')
        }
      } catch (err) {
        setError('Failed to fetch related risks')
        console.error('Error fetching related risks:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRelatedRisks()
  }, [controlId])

  if (loading) {
    return (
      <div className={`bg-purple-50 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-2 mb-3">
          <Icon name="exclamation-triangle" size={16} className="text-purple-500" />
          <span className="text-sm font-medium text-purple-700">Related Risks</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
          <span className="text-sm text-purple-600">Loading...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-red-50 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-2 mb-3">
          <Icon name="exclamation-triangle" size={16} className="text-red-500" />
          <span className="text-sm font-medium text-red-700">Related Risks</span>
        </div>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    )
  }

  if (relatedRisks.length === 0) {
    return (
      <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-2 mb-3">
          <Icon name="exclamation-triangle" size={16} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Related Risks</span>
        </div>
        <p className="text-sm text-gray-600">No related risks found</p>
      </div>
    )
  }

  return (
    <div className={`bg-purple-50 rounded-lg p-4 ${className}`}>
      <div className="flex items-center space-x-2 mb-3">
        <Icon name="exclamation-triangle" size={16} className="text-purple-500" />
        <span className="text-sm font-medium text-purple-700">Related Risks</span>
        <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
          {relatedRisks.length}
        </span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {relatedRisks.map((risk) => (
          <Link
            key={risk.riskId}
            href={`/risk-management/risks/${risk.riskId}`}
            className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 rounded-md text-xs font-medium hover:bg-purple-200 transition-colors"
          >
            <Icon name="link" size={12} className="mr-1" />
            {risk.riskId}
          </Link>
        ))}
      </div>
    </div>
  )
}

// Compact version for use in compact views
export function RelatedRisksCompact({ controlId }: { controlId: string }) {
  const [relatedRisks, setRelatedRisks] = useState<RelatedRisk[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchRelatedRisks = async () => {
      if (!controlId) return
      
      setLoading(true)
      
      try {
        const response = await fetch(`/api/compliance/soa/${controlId}/related-risks`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        
        if (result.success) {
          setRelatedRisks(result.data)
        }
      } catch (err) {
        console.error('Error fetching related risks:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRelatedRisks()
  }, [controlId])

  if (loading || relatedRisks.length === 0) {
    return null
  }

  return (
    <div className="flex items-center space-x-1" title={`${relatedRisks.length} related risk${relatedRisks.length !== 1 ? 's' : ''}`}>
      <Icon name="exclamation-triangle" size={12} className="text-purple-500" />
      <span className="text-xs text-purple-600 font-medium">{relatedRisks.length}</span>
    </div>
  )
}
