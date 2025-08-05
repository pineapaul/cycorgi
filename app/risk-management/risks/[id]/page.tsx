'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Icon from '@/app/components/Icon'
import { getCIAConfig, extractRiskNumber } from '@/lib/utils'
import { useBackNavigation } from '@/app/hooks/useBackNavigation'
import { useToast } from '@/app/components/Toast'

interface InformationAsset {
  id: string
  informationAsset: string
  category: string
}

interface Risk {
  riskId: string
  functionalUnit: string
  currentPhase: string
  jiraTicket: string
  dateRiskRaised: string
  raisedBy: string
  riskOwner: string
  affectedSites: string
  informationAsset: string | Array<{ id: string; name: string }> | string[]
  threat: string
  vulnerability: string
  riskStatement: string
  impactCIA: string
  currentControls: string
  currentControlsReference: string
  consequence: string
  likelihood: string
  currentRiskRating: string
  riskAction: string
  reasonForAcceptance: string
  dateOfSSCApproval: string
  dateRiskTreatmentsApproved: string
  residualConsequence: string
  residualLikelihood: string
  residualRiskRating: string
  residualRiskAcceptedByOwner: string
  dateResidualRiskAccepted: string
  treatmentCount: number
}

export default function RiskInformationPage() {
  const params = useParams()
  const router = useRouter()
  const { showToast } = useToast()
  const { goBack } = useBackNavigation({
    fallbackRoute: '/risk-management/register'
  })
  const [risk, setRisk] = useState<Risk | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedRisk, setEditedRisk] = useState<Risk | null>(null)
  const [saving, setSaving] = useState(false)
  const [informationAssets, setInformationAssets] = useState<InformationAsset[]>([])
  const [selectedInformationAssets, setSelectedInformationAssets] = useState<string[]>([])
  const [showAssetModal, setShowAssetModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [tempSelectedAssets, setTempSelectedAssets] = useState<string[]>([])
  const [selectedLetter, setSelectedLetter] = useState<string>('')

  useEffect(() => {
    if (params.id) {
      fetchRisk(params.id as string)
    }
  }, [params.id])

  // Fetch information assets for the multi-select
  useEffect(() => {
    const fetchInformationAssets = async () => {
      try {
        const response = await fetch('/api/information-assets')
        const result = await response.json()

        if (result.success) {
          setInformationAssets(result.data)
        } else {
          console.error('Failed to fetch information assets:', result.error)
        }
      } catch (error) {
        console.error('Error fetching information assets:', error)
      }
    }

    fetchInformationAssets()
  }, [])

  const fetchRisk = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/risks/${id}`)
      const result = await response.json()
      
      if (result.success) {
        // Debug: Log the raw API response
        console.log('Raw API response:', result.data)
        console.log('Current phase from API:', result.data.currentPhase)
        
        // Map the API data to our expected format
        const mappedRisk: Risk = {
          riskId: result.data.riskId || '',
          functionalUnit: result.data.functionalUnit || '',
          currentPhase: result.data.currentPhase || '',
          jiraTicket: result.data.jiraTicket || '',
          dateRiskRaised: result.data.dateRiskRaised || '',
          raisedBy: result.data.raisedBy || '',
          riskOwner: result.data.riskOwner || '',
          affectedSites: result.data.affectedSites || '',
          informationAsset: result.data.informationAsset || '',
          threat: result.data.threat || '',
          vulnerability: result.data.vulnerability || '',
          riskStatement: result.data.riskStatement || '',
          impactCIA: result.data.impactCIA || '',
          currentControls: result.data.currentControls || '',
          currentControlsReference: result.data.currentControlsReference || '',
          consequence: result.data.consequence || '',
          likelihood: result.data.likelihood || '',
          currentRiskRating: result.data.currentRiskRating || '',
          riskAction: result.data.riskAction || '',
          reasonForAcceptance: result.data.reasonForAcceptance || '',
          dateOfSSCApproval: result.data.dateOfSSCApproval || '',
          dateRiskTreatmentsApproved: result.data.dateRiskTreatmentsApproved || '',
          residualConsequence: result.data.residualConsequence || '',
          residualLikelihood: result.data.residualLikelihood || '',
          residualRiskRating: result.data.residualRiskRating || '',
          residualRiskAcceptedByOwner: result.data.residualRiskAcceptedByOwner || '',
          dateResidualRiskAccepted: result.data.dateResidualRiskAccepted || '',
          treatmentCount: result.data.treatmentCount || 0,
        }
        
        // Debug: Log the mapped risk
        console.log('Mapped risk:', mappedRisk)
        console.log('Mapped current phase:', mappedRisk.currentPhase)
        
        setRisk(mappedRisk)
        setEditedRisk(mappedRisk)
      } else {
        setError(result.error || 'Risk not found')
      }
    } catch (err) {
      setError('Failed to fetch risk details')
      console.error('Error fetching risk:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    
    // Initialize selected information assets from the current risk data
    if (risk?.informationAsset) {
      let selectedIds: string[] = []
      
      if (Array.isArray(risk.informationAsset)) {
        // Handle array format - extract only the ID from objects
        selectedIds = risk.informationAsset.map(asset => {
          if (typeof asset === 'object' && asset !== null) {
            return asset.id
          }
          return asset
        }).filter(Boolean) // Remove any undefined/null values
      } else if (typeof risk.informationAsset === 'string') {
        // Handle old string format
        selectedIds = risk.informationAsset.split(',').map(name => name.trim())
      }
      
      setSelectedInformationAssets(selectedIds)
    } else {
      setSelectedInformationAssets([])
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedRisk(risk)
    setSelectedInformationAssets([])
  }

  const handleSave = async () => {
    if (!editedRisk) return

    try {
      setSaving(true)
      
      // Prepare the data to save, including all necessary fields
      const updateData = {
        ...editedRisk,
        informationAsset: selectedInformationAssets
      }

      // Debug: Log what we're sending
      console.log('Sending update data:', updateData)
      console.log('Selected information assets:', selectedInformationAssets)

      const response = await fetch(`/api/risks/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      const result = await response.json()
      
      if (result.success) {
        setRisk(editedRisk)
        setIsEditing(false)
      } else {
        // Show detailed validation errors if available
        const errorMessage = result.details 
          ? `Validation failed: ${result.details.join(', ')}`
          : result.error || 'Failed to update risk'
        setError(errorMessage)
      }
    } catch (err) {
      setError('Failed to update risk')
      console.error('Error updating risk:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this risk? This action cannot be undone.')) {
      return
    }

    try {
      setSaving(true)
      const response = await fetch(`/api/risks/${params.id}`, {
        method: 'DELETE',
      })

      const result = await response.json()
      
      if (result.success) {
        router.push('/risk-management/register')
      } else {
        setError(result.error || 'Failed to delete risk')
      }
    } catch (err) {
      setError('Failed to delete risk')
      console.error('Error deleting risk:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleCopyLink = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url).then(() => {
      showToast({
        type: 'success',
        title: 'Link copied to clipboard!'
      })
    }).catch(() => {
      showToast({
        type: 'error',
        title: 'Failed to copy link to clipboard'
      })
    })
  }

  const handleFieldChange = (field: keyof Risk, value: string) => {
    if (!editedRisk) return
    setEditedRisk({
      ...editedRisk,
      [field]: value
    })
  }

  const handleInformationAssetsChange = (assetId: string, checked: boolean) => {
    setSelectedInformationAssets(prev => 
      checked 
        ? [...prev, assetId]
        : prev.filter(id => id !== assetId)
    )
  }

  const openAssetModal = () => {
    setTempSelectedAssets([...selectedInformationAssets])
    setSearchTerm('')
    setSelectedLetter('')
    setShowAssetModal(true)
  }

  const closeAssetModal = () => {
    setShowAssetModal(false)
    setSearchTerm('')
    setTempSelectedAssets([])
    setSelectedLetter('')
  }

  const handleAssetSelection = (assetId: string, checked: boolean) => {
    setTempSelectedAssets(prev => 
      checked 
        ? [...prev, assetId]
        : prev.filter(id => id !== assetId)
    )
  }

  const applyAssetSelection = () => {
    setSelectedInformationAssets([...tempSelectedAssets])
    closeAssetModal()
  }

  const filteredAssets = informationAssets
    .filter(asset =>
      asset.informationAsset.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(asset => {
      if (!selectedLetter) return true
      return asset.informationAsset.toLowerCase().startsWith(selectedLetter.toLowerCase())
    })
    .sort((a, b) => a.informationAsset.localeCompare(b.informationAsset))

  const getStatusColor = (status: string) => {
    if (!status) return 'bg-gray-100 text-gray-800'
    
    switch (status.toLowerCase()) {
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'identification':
        return 'bg-blue-100 text-blue-800'
      case 'analysis':
        return 'bg-yellow-100 text-yellow-800'
      case 'evaluation':
        return 'bg-purple-100 text-purple-800'
      case 'treatment':
        return 'bg-orange-100 text-orange-800'
      case 'monitoring':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiskLevelColor = (level: string) => {
    if (!level) return 'bg-gray-100 text-gray-800'
    
    switch (level.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Debug: Log current phase values
  console.log('Risk currentPhase:', risk?.currentPhase)
  console.log('EditedRisk currentPhase:', editedRisk?.currentPhase)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#898AC4' }}></div>
          <p className="mt-4" style={{ color: '#22223B' }}>Loading risk details...</p>
        </div>
      </div>
    )
  }

  if (error || !risk) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <Icon name="warning" size={48} />
        </div>
        <h3 className="text-lg font-semibold mb-2" style={{ color: '#22223B' }}>Error Loading Risk</h3>
        <p className="text-gray-600 mb-4" style={{ color: '#22223B' }}>{error || 'Risk not found'}</p>
        <button
          onClick={goBack}
          className="px-4 py-2 rounded-lg transition-colors"
          style={{ backgroundColor: '#898AC4', color: 'white' }}
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={goBack}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 hover:bg-gray-200 bg-white border border-gray-300"
            title="Go back to previous page"
          >
            <Icon name="arrow-left" size={16} />
          </button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#22223B' }}>
              {isEditing ? 'Edit Risk' : `${risk.riskId} - Risk Information`}
            </h1>
            <p className="text-gray-600" style={{ color: '#22223B' }}>
              Comprehensive risk details and management
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {!isEditing && (
            <>
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Copy link to risk"
              >
                <Icon name="link" size={16} className="mr-2" />
                Copy Link
              </button>
              <button
                onClick={handleEdit}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                style={{ backgroundColor: '#4C1D95' }}
                title="Edit risk"
              >
                <Icon name="pencil" size={16} className="mr-2" />
                Edit
              </button>
            </>
          )}
          {isEditing && (
            <>
              <button
                onClick={handleCancel}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50"
                style={{ backgroundColor: '#4C1D95' }}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Icon name="check" size={16} className="mr-2" />
                    Save
                  </>
                )}
              </button>
            </>
          )}
          <button
            onClick={handleDelete}
            disabled={saving}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
            title="Delete risk"
          >
            <Icon name="trash" size={16} className="mr-2" />
            Delete
          </button>
        </div>
      </div>

      {/* Risk Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2" style={{ color: '#22223B' }}>
              <Icon name="info-circle" size={20} className="mr-2 inline" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Risk ID</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedRisk?.riskId || ''}
                    onChange={(e) => handleFieldChange('riskId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 font-mono">{risk.riskId}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Phase</label>
                {isEditing ? (
                  <select
                    value={editedRisk?.currentPhase || ''}
                    onChange={(e) => handleFieldChange('currentPhase', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Identification">Identification</option>
                    <option value="Analysis">Analysis</option>
                    <option value="Evaluation">Evaluation</option>
                    <option value="Treatment">Treatment</option>
                    <option value="Monitoring">Monitoring</option>
                  </select>
                ) : (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(risk.currentPhase)}`}>
                    {risk.currentPhase}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Functional Unit</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedRisk?.functionalUnit || ''}
                    onChange={(e) => handleFieldChange('functionalUnit', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{risk.functionalUnit}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">JIRA Ticket</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedRisk?.jiraTicket || ''}
                    onChange={(e) => handleFieldChange('jiraTicket', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{risk.jiraTicket}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Functional Unit</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedRisk?.functionalUnit || ''}
                  onChange={(e) => handleFieldChange('functionalUnit', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{risk.functionalUnit}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">JIRA Ticket</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedRisk?.jiraTicket || ''}
                  onChange={(e) => handleFieldChange('jiraTicket', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{risk.jiraTicket}</p>
              )}
            </div>
          </div>

          {/* Risk Statement - Prominent Display */}
          <div className="mt-6">
            <label className="block text-lg font-semibold text-gray-800 mb-3">Risk Statement</label>
            {isEditing ? (
              <textarea
                value={editedRisk?.riskStatement || ''}
                onChange={(e) => handleFieldChange('riskStatement', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                placeholder="Describe the risk in detail..."
              />
            ) : (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <p className="text-gray-900 text-base leading-relaxed">{risk.riskStatement}</p>
              </div>
            )}
          </div>



          {/* Risk Assessment */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2" style={{ color: '#22223B' }}>
              <Icon name="chart-line" size={20} className="mr-2 inline" />
              Risk Assessment
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Risk Rating</label>
                {isEditing ? (
                  <select
                    value={editedRisk?.currentRiskRating || ''}
                    onChange={(e) => handleFieldChange('currentRiskRating', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                ) : (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelColor(risk.currentRiskRating)}`}>
                    {risk.currentRiskRating}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Likelihood</label>
                {isEditing ? (
                  <select
                    value={editedRisk?.likelihood || ''}
                    onChange={(e) => handleFieldChange('likelihood', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                ) : (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelColor(risk.likelihood)}`}>
                    {risk.likelihood}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Consequence</label>
                {isEditing ? (
                  <select
                    value={editedRisk?.consequence || ''}
                    onChange={(e) => handleFieldChange('consequence', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                ) : (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelColor(risk.consequence)}`}>
                    {risk.consequence}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Impact (CIA)</label>
                {isEditing ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 mb-3">Select which CIA components are affected by this risk:</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                       <label className="relative flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-red-300 hover:bg-red-50 transition-all duration-200 group">
                   <input
                     type="checkbox"
                     id="edit-confidentiality"
                     checked={editedRisk?.impactCIA?.includes('Confidentiality')}
                     onChange={(e) => {
                       const currentCIA = editedRisk?.impactCIA?.split(', ') || []
                       const newCIA = e.target.checked
                         ? [...currentCIA, 'Confidentiality']
                         : currentCIA.filter(item => item !== 'Confidentiality')
                       handleFieldChange('impactCIA', newCIA.join(', '))
                     }}
                     className="sr-only"
                   />
                   <div className={`flex items-center justify-center w-5 h-5 border-2 rounded mr-3 transition-all duration-200 ${
                     editedRisk?.impactCIA?.includes('Confidentiality')
                       ? 'bg-red-500 border-red-500'
                       : 'border-gray-300 group-hover:border-red-400'
                   }`}>
                     {editedRisk?.impactCIA?.includes('Confidentiality') && (
                       <Icon name="check" size={12} className="text-white" />
                     )}
                   </div>
                   <div>
                     <div className="font-medium text-gray-900">Confidentiality</div>
                     <div className="text-xs text-gray-500">Data privacy & access control</div>
                   </div>
                 </label>

                 <label className="relative flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 group">
                   <input
                     type="checkbox"
                     id="edit-integrity"
                     checked={editedRisk?.impactCIA?.includes('Integrity')}
                     onChange={(e) => {
                       const currentCIA = editedRisk?.impactCIA?.split(', ') || []
                       const newCIA = e.target.checked
                         ? [...currentCIA, 'Integrity']
                         : currentCIA.filter(item => item !== 'Integrity')
                       handleFieldChange('impactCIA', newCIA.join(', '))
                     }}
                     className="sr-only"
                   />
                   <div className={`flex items-center justify-center w-5 h-5 border-2 rounded mr-3 transition-all duration-200 ${
                     editedRisk?.impactCIA?.includes('Integrity')
                       ? 'bg-orange-500 border-orange-500'
                       : 'border-gray-300 group-hover:border-orange-400'
                   }`}>
                     {editedRisk?.impactCIA?.includes('Integrity') && (
                       <Icon name="check" size={12} className="text-white" />
                     )}
                   </div>
                   <div>
                     <div className="font-medium text-gray-900">Integrity</div>
                     <div className="text-xs text-gray-500">Data accuracy & consistency</div>
                   </div>
                 </label>

                 <label className="relative flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group">
                   <input
                     type="checkbox"
                     id="edit-availability"
                     checked={editedRisk?.impactCIA?.includes('Availability')}
                     onChange={(e) => {
                       const currentCIA = editedRisk?.impactCIA?.split(', ') || []
                       const newCIA = e.target.checked
                         ? [...currentCIA, 'Availability']
                         : currentCIA.filter(item => item !== 'Availability')
                       handleFieldChange('impactCIA', newCIA.join(', '))
                     }}
                     className="sr-only"
                   />
                   <div className={`flex items-center justify-center w-5 h-5 border-2 rounded mr-3 transition-all duration-200 ${
                     editedRisk?.impactCIA?.includes('Availability')
                       ? 'bg-blue-500 border-blue-500'
                       : 'border-gray-300 group-hover:border-blue-400'
                   }`}>
                     {editedRisk?.impactCIA?.includes('Availability') && (
                       <Icon name="check" size={12} className="text-white" />
                     )}
                   </div>
                   <div>
                     <div className="font-medium text-gray-900">Availability</div>
                     <div className="text-xs text-gray-500">System accessibility & uptime</div>
                   </div>
                 </label>
                    </div>
                  </div>
                ) : (
                                                         <div className="flex flex-wrap gap-1.5">
                    {risk.impactCIA ? (
                      (risk.impactCIA?.split(', ') || []).map((cia: string, index: number) => {
                        const config = getCIAConfig(cia)
                        return (
                          <span
                            key={index}
                            className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${config.bg} ${config.text} ${config.border} transition-all duration-200 hover:scale-105`}
                          >
                            {cia}
                          </span>
                        )
                      })
                    ) : (
                      <span className="text-sm text-gray-500 italic">Not specified</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Threat & Vulnerability */}
        <div className="mt-8 space-y-6">
          <h3 className="text-lg font-semibold border-b pb-2" style={{ color: '#22223B' }}>
            <Icon name="shield-exclamation" size={20} className="mr-2 inline" />
            Threat & Vulnerability
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Threat</label>
              {isEditing ? (
                <textarea
                  value={editedRisk?.threat || ''}
                  onChange={(e) => handleFieldChange('threat', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{risk.threat}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vulnerability</label>
              {isEditing ? (
                <textarea
                  value={editedRisk?.vulnerability || ''}
                  onChange={(e) => handleFieldChange('vulnerability', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{risk.vulnerability}</p>
              )}
            </div>
          </div>
        </div>

        {/* Current Controls */}
        <div className="mt-8 space-y-6">
          <h3 className="text-lg font-semibold border-b pb-2" style={{ color: '#22223B' }}>
            <Icon name="shield-check" size={20} className="mr-2 inline" />
            Current Controls
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Controls</label>
              {isEditing ? (
                <textarea
                  value={editedRisk?.currentControls || ''}
                  onChange={(e) => handleFieldChange('currentControls', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{risk.currentControls}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Controls Reference</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedRisk?.currentControlsReference || ''}
                  onChange={(e) => handleFieldChange('currentControlsReference', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{risk.currentControlsReference}</p>
              )}
            </div>
          </div>
        </div>

        {/* Ownership & Timeline */}
        <div className="mt-8 space-y-6">
          <h3 className="text-lg font-semibold border-b pb-2" style={{ color: '#22223B' }}>
            <Icon name="users" size={20} className="mr-2 inline" />
            Ownership & Timeline
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Raised By</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedRisk?.raisedBy || ''}
                  onChange={(e) => handleFieldChange('raisedBy', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{risk.raisedBy}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Risk Owner</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedRisk?.riskOwner || ''}
                  onChange={(e) => handleFieldChange('riskOwner', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{risk.riskOwner}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Risk Raised</label>
              {isEditing ? (
                <input
                  type="date"
                  value={editedRisk?.dateRiskRaised || ''}
                  onChange={(e) => handleFieldChange('dateRiskRaised', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{risk.dateRiskRaised}</p>
              )}
            </div>
          </div>
        </div>

        {/* Affected Assets & Sites */}
        <div className="mt-8 space-y-6">
          <h3 className="text-lg font-semibold border-b pb-2" style={{ color: '#22223B' }}>
            <Icon name="database" size={20} className="mr-2 inline" />
            Affected Assets & Sites
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Information Assets</label>
              {isEditing ? (
                <div>
                  <button
                    type="button"
                    onClick={openAssetModal}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        {selectedInformationAssets.length > 0 ? (
                          <div className="text-sm text-gray-900">
                            {selectedInformationAssets.length} asset{selectedInformationAssets.length !== 1 ? 's' : ''} selected
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">Click to select information assets</div>
                        )}
                      </div>
                      <Icon name="chevron-right" size={16} className="text-gray-400" />
                    </div>
                  </button>
                  {selectedInformationAssets.length > 0 && (
                    <div className="mt-2">
                      <div className="text-xs text-gray-600 mb-1">Selected assets:</div>
                      <div className="flex flex-wrap gap-1">
                        {selectedInformationAssets.map(assetId => {
                          const asset = informationAssets.find(a => a.id === assetId)
                          return (
                            <span
                              key={assetId}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-100 text-blue-800"
                            >
                              {asset?.informationAsset || assetId}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-900">{Array.isArray(risk.informationAsset) 
                  ? risk.informationAsset.map((asset: any) => {
                      if (typeof asset === 'object' && asset !== null) {
                        return asset.name || asset.id || JSON.stringify(asset)
                      }
                      return asset
                    }).join(', ')
                  : risk.informationAsset}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Affected Sites</label>
              {isEditing ? (
                <textarea
                  value={editedRisk?.affectedSites || ''}
                  onChange={(e) => handleFieldChange('affectedSites', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{risk.affectedSites}</p>
              )}
            </div>
          </div>
        </div>



        {/* Residual Risk */}
        <div className="mt-8 space-y-6">
          <h3 className="text-lg font-semibold border-b pb-2" style={{ color: '#22223B' }}>
            <Icon name="chart-line" size={20} className="mr-2 inline" />
            Residual Risk
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Residual Risk Rating</label>
              {isEditing ? (
                <select
                  value={editedRisk?.residualRiskRating || ''}
                  onChange={(e) => handleFieldChange('residualRiskRating', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              ) : (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelColor(risk.residualRiskRating)}`}>
                  {risk.residualRiskRating}
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Residual Likelihood</label>
              {isEditing ? (
                <select
                  value={editedRisk?.residualLikelihood || ''}
                  onChange={(e) => handleFieldChange('residualLikelihood', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              ) : (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelColor(risk.residualLikelihood)}`}>
                  {risk.residualLikelihood}
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Residual Consequence</label>
              {isEditing ? (
                <select
                  value={editedRisk?.residualConsequence || ''}
                  onChange={(e) => handleFieldChange('residualConsequence', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              ) : (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelColor(risk.residualConsequence)}`}>
                  {risk.residualConsequence}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Acceptance</label>
              {isEditing ? (
                <textarea
                  value={editedRisk?.reasonForAcceptance || ''}
                  onChange={(e) => handleFieldChange('reasonForAcceptance', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{risk.reasonForAcceptance}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Residual Risk Accepted By</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedRisk?.residualRiskAcceptedByOwner || ''}
                  onChange={(e) => handleFieldChange('residualRiskAcceptedByOwner', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{risk.residualRiskAcceptedByOwner}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Residual Risk Accepted</label>
              {isEditing ? (
                <input
                  type="date"
                  value={editedRisk?.dateResidualRiskAccepted || ''}
                  onChange={(e) => handleFieldChange('dateResidualRiskAccepted', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{risk.dateResidualRiskAccepted}</p>
              )}
            </div>
          </div>
        </div>

        {/* Approvals */}
        <div className="mt-8 space-y-6">
          <h3 className="text-lg font-semibold border-b pb-2" style={{ color: '#22223B' }}>
            <Icon name="check-circle" size={20} className="mr-2 inline" />
            Approvals
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of SSC Approval</label>
              {isEditing ? (
                <input
                  type="date"
                  value={editedRisk?.dateOfSSCApproval || ''}
                  onChange={(e) => handleFieldChange('dateOfSSCApproval', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{risk.dateOfSSCApproval}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Treatments Approved</label>
              {isEditing ? (
                <input
                  type="date"
                  value={editedRisk?.dateRiskTreatmentsApproved || ''}
                  onChange={(e) => handleFieldChange('dateRiskTreatmentsApproved', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{risk.dateRiskTreatmentsApproved}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Information Assets Selection Modal */}
      {showAssetModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Icon name="file" size={20} className="text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Select Information Assets</h3>
              </div>
              <button
                onClick={closeAssetModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="x" size={20} />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-6 border-b border-gray-200">
              <div className="relative">
                <Icon name="magnifying-glass" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search assets by name or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Alphabet Filter */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setSelectedLetter('')}
                  className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                    selectedLetter === '' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map((letter) => (
                  <button
                    key={letter}
                    onClick={() => setSelectedLetter(selectedLetter === letter ? '' : letter)}
                    className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                      selectedLetter === letter 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {letter}
                  </button>
                ))}
              </div>
            </div>

            {/* Assets List */}
            <div className="flex-1 overflow-y-auto p-6">
              {filteredAssets.length === 0 ? (
                <div className="text-center py-8">
                  <Icon name="search" size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">
                    {searchTerm ? 'No assets found matching your search.' : 'No information assets available.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredAssets.map((asset) => (
                    <label
                      key={asset.id}
                      className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={tempSelectedAssets.includes(asset.id)}
                        onChange={(e) => handleAssetSelection(asset.id, e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{asset.informationAsset}</div>
                        <div className="text-xs text-gray-500">{asset.category}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                {tempSelectedAssets.length} asset{tempSelectedAssets.length !== 1 ? 's' : ''} selected
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={closeAssetModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={applyAssetSelection}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Apply Selection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 