'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Icon from '@/app/components/Icon'
import { useToast } from '@/app/components/Toast'
import { formatDate, escapeHtml, decodeHtmlEntities } from '@/lib/utils'

interface Threat {
  id: string
  name: string
  description: string
  category: string
  severity: 'Low' | 'Medium' | 'High' | 'Critical'
  mitreId?: string
  mitreTactic?: string
  mitreTechnique?: string
  source: 'Custom' | 'MITRE ATTACK'
  tags: string[]
  informationAssets?: InformationAsset[]
  createdAt: string
  updatedAt: string
  status: 'Active' | 'Inactive' | 'Deprecated'
  createdBy?: string
}

interface InformationAsset {
  id: string
  informationAsset: string
  category: string
  type: string
  criticality: string
}

export default function ThreatDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { showToast } = useToast()
  const [threat, setThreat] = useState<Threat | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const threatId = params.id as string

  useEffect(() => {
    if (threatId) {
      fetchThreatDetails()
    }
  }, [threatId])

  const fetchThreatDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/threats/${threatId}`)
      const result = await response.json()
      
      if (result.success) {
        setThreat(result.data)
      } else {
        setError(result.error || 'Failed to fetch threat details')
        showToast({
          type: 'error',
          title: 'Error',
          message: result.error || 'Failed to fetch threat details'
        })
      }
    } catch (error) {
      console.error('Error fetching threat details:', error)
      setError('Failed to fetch threat details')
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch threat details'
      })
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'deprecated':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCriticalityColor = (criticality: string) => {
    switch (criticality.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleBackToLibrary = () => {
    router.push('/inventory/threat-library')
  }

  const handleEditThreat = () => {
    // TODO: Implement edit functionality
    showToast({
      type: 'info',
      title: 'Coming Soon',
      message: 'Edit functionality will be available in a future update'
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBackToLibrary}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Icon name="arrow-left" size={20} />
            <span>Back to Threat Library</span>
          </button>
        </div>
        
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading threat details...</p>
        </div>
      </div>
    )
  }

  if (error || !threat) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBackToLibrary}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Icon name="arrow-left" size={20} />
            <span>Back to Threat Library</span>
          </button>
        </div>
        
        <div className="text-center py-12">
          <Icon name="exclamation-triangle" size={48} className="mx-auto mb-4 text-red-400" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Threat Not Found</h2>
          <p className="text-gray-600 mb-4">
            {error || 'The requested threat could not be found or loaded.'}
          </p>
          <button
            onClick={handleBackToLibrary}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Return to Threat Library
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBackToLibrary}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Icon name="arrow-left" size={20} />
            <span>Back to Threat Library</span>
          </button>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleEditThreat}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <Icon name="edit" size={16} />
            <span>Edit Threat</span>
          </button>
        </div>
      </div>

      {/* Threat Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{escapeHtml(decodeHtmlEntities(threat.name))}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(threat.severity)}`}>
                {escapeHtml(threat.severity)}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(threat.status)}`}>
                {escapeHtml(threat.status)}
              </span>
            </div>
            
                       <div className="flex items-center space-x-4 text-sm text-gray-600">
             <span className="flex items-center space-x-1">
               <Icon name="calendar" size={16} />
               <span>Created: {formatDate(threat.createdAt)}</span>
             </span>
             <span className="flex items-center space-x-1">
               <Icon name="clock" size={16} />
               <span>Updated: {formatDate(threat.updatedAt)}</span>
             </span>
             {threat.createdBy && (
               <span className="flex items-center space-x-1">
                 <Icon name="user" size={16} />
                 <span>Created by: {escapeHtml(decodeHtmlEntities(threat.createdBy))}</span>
               </span>
             )}
           </div>
          </div>
          
          <div className="text-right">
            <span className={`px-3 py-2 rounded-lg text-sm font-medium ${
              threat.source === 'MITRE ATTACK' 
                ? 'bg-purple-100 text-purple-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              <Icon name={threat.source === 'MITRE ATTACK' ? 'shield-virus' : 'user-secret'} size={16} className="inline mr-2" />
              {escapeHtml(threat.source)}
            </span>
          </div>
        </div>

                 <div className="mb-4">
           <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
           <p className="text-gray-700 leading-relaxed">{decodeHtmlEntities(threat.description)}</p>
         </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div>
             <h4 className="text-sm font-medium text-gray-500 mb-1">Category</h4>
             <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
               {escapeHtml(decodeHtmlEntities(threat.category))}
             </span>
           </div>
          
          {threat.mitreId && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">MITRE ID</h4>
              <span className="font-mono text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                {escapeHtml(threat.mitreId)}
              </span>
            </div>
          )}
          
          {threat.mitreTactic && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">MITRE Tactic</h4>
              <span className="text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded">
                {escapeHtml(decodeHtmlEntities(threat.mitreTactic))}
              </span>
            </div>
          )}
          
          {threat.mitreTechnique && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">MITRE Technique</h4>
              <span className="text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded">
                {escapeHtml(decodeHtmlEntities(threat.mitreTechnique))}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Tags Section */}
      {threat.tags && threat.tags.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
                         {threat.tags.map((tag, index) => (
               <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                 {escapeHtml(decodeHtmlEntities(tag))}
               </span>
             ))}
          </div>
        </div>
      )}

      {/* Information Assets Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Linked Information Assets</h3>
          <span className="text-sm text-gray-500">
            {threat.informationAssets?.length || 0} asset{(threat.informationAssets?.length || 0) !== 1 ? 's' : ''} linked
          </span>
        </div>
        
        {!threat.informationAssets || threat.informationAssets.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Icon name="database" size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No information assets are currently linked to this threat.</p>
            <p className="text-sm mt-1">Use the edit function to link assets when available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {threat.informationAssets.map((asset, index) => (
              <div key={asset.id} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                                 <div className="flex items-start justify-between mb-3">
                   <h4 className="font-medium text-gray-900 text-sm leading-tight">
                     {escapeHtml(decodeHtmlEntities(asset.informationAsset))}
                   </h4>
                   <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCriticalityColor(asset.criticality)}`}>
                     {escapeHtml(decodeHtmlEntities(asset.criticality))}
                   </span>
                 </div>
                 
                 <div className="space-y-2 text-xs text-gray-600">
                   <div className="flex items-center space-x-2">
                     <Icon name="tag" size={12} />
                     <span>{escapeHtml(decodeHtmlEntities(asset.category))}</span>
                   </div>
                   <div className="flex items-center space-x-2">
                     <Icon name="cog" size={12} />
                     <span>{escapeHtml(decodeHtmlEntities(asset.type))}</span>
                   </div>
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MITRE ATTACK Details (if applicable) */}
      {threat.source === 'MITRE ATTACK' && (threat.mitreId || threat.mitreTactic || threat.mitreTechnique) && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Icon name="shield-virus" size={20} className="text-purple-600" />
            <span>MITRE ATTACK Framework Details</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {threat.mitreId && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Technique ID</h4>
                <span className="font-mono text-sm text-purple-600 bg-purple-50 px-3 py-2 rounded border border-purple-200">
                  {escapeHtml(threat.mitreId)}
                </span>
              </div>
            )}
            
            {threat.mitreTactic && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Tactic</h4>
                <span className="text-sm text-gray-700 bg-gray-100 px-3 py-2 rounded border border-gray-200">
                  {escapeHtml(decodeHtmlEntities(threat.mitreTactic))}
                </span>
              </div>
            )}
            
            {threat.mitreTechnique && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Technique</h4>
                <span className="text-sm text-gray-700 bg-gray-100 px-3 py-2 rounded border border-gray-200">
                  {escapeHtml(decodeHtmlEntities(threat.mitreTechnique))}
                </span>
              </div>
            )}
          </div>
          
          <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <Icon name="info-circle" size={20} className="text-purple-600 mt-0.5" />
              <div className="text-sm text-purple-800">
                <p className="font-medium mb-1">MITRE ATTACK Framework Integration</p>
                <p>
                  This threat is based on the MITRE ATTACK framework, providing standardized threat intelligence 
                  and categorization. The framework helps security teams understand, categorize, and respond to 
                  cyber threats consistently.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Risk Assessment Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Assessment</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Severity Level</h4>
            <div className="flex items-center space-x-3">
                             <span className={`px-4 py-2 rounded-lg text-sm font-medium border ${getSeverityColor(threat.severity)}`}>
                 {escapeHtml(decodeHtmlEntities(threat.severity))}
               </span>
              <div className="text-sm text-gray-600">
                {threat.severity === 'Critical' && 'Immediate action required'}
                {threat.severity === 'High' && 'High priority response needed'}
                {threat.severity === 'Medium' && 'Moderate risk level'}
                {threat.severity === 'Low' && 'Low risk, monitor closely'}
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Threat Status</h4>
            <div className="flex items-center space-x-3">
                             <span className={`px-4 py-2 rounded-lg text-sm font-medium ${getStatusColor(threat.status)}`}>
                 {escapeHtml(decodeHtmlEntities(threat.status))}
               </span>
              <div className="text-sm text-gray-600">
                {threat.status === 'Active' && 'Currently active threat'}
                {threat.status === 'Inactive' && 'Threat not currently active'}
                {threat.status === 'Deprecated' && 'Threat no longer relevant'}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <Icon name="exclamation-triangle" size={20} className="text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Risk Management Recommendations</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Regularly review and update threat assessments</li>
                <li>Implement appropriate security controls based on severity</li>
                <li>Monitor linked information assets for vulnerabilities</li>
                <li>Update threat status as new intelligence becomes available</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-6">
        <div className="text-sm text-gray-600">
          <p>Last updated: {formatDate(threat.updatedAt)}</p>
          {threat.createdBy && <p>Created by: {escapeHtml(threat.createdBy)}</p>}
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleBackToLibrary}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Back to Library
          </button>
          <button
            onClick={handleEditThreat}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Edit Threat
          </button>
        </div>
      </div>
    </div>
  )
}
