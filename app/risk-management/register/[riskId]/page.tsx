'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DataTable, { Column } from '../../../components/DataTable'
import Icon from '../../../components/Icon'
import { useToast } from '../../../components/Toast'

interface RiskDetails {
  riskId: string
  functionalUnit: string
  currentPhase: string
  jiraTicket: string
  dateRiskRaised: string
  raisedBy: string
  riskOwner: string
  affectedSites: string
  informationAssets: string
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

interface Treatment {
  riskTreatment: string
  treatmentJiraTicket: string
  riskTreatmentOwner: string
  dateRiskTreatmentDue: string
  extendedDueDate: string
  numberOfExtensions: number
  completionDate: string
  closureApproval: string
  closureApprovedBy: string
}

export default function RiskInformation() {
  const params = useParams()
  const router = useRouter()
  const { showToast } = useToast()
  const [riskDetails, setRiskDetails] = useState<RiskDetails | null>(null)

  // Validation utilities
  const validateRiskId = (riskId: string | string[] | undefined): string | null => {
    if (!riskId) return null
    
    // Ensure it's a string
    const id = Array.isArray(riskId) ? riskId[0] : riskId
    
    // Check if it's empty or whitespace
    if (!id || id.trim() === '') return null
    
    // Validate format (RISK-XXX where XXX is numeric)
    const riskIdPattern = /^RISK-\d+$/i
    if (!riskIdPattern.test(id.trim())) return null
    
    return id.trim()
  }

  const isValidRiskId = (riskId: string | string[] | undefined): riskId is string => {
    return validateRiskId(riskId) !== null
  }

  // Safe API URL construction
  const buildApiUrl = (endpoint: string, riskId?: string | string[] | undefined): string | null => {
    const validRiskId = validateRiskId(riskId || params.riskId)
    if (!validRiskId) return null
    return `${endpoint}/${validRiskId}`
  }
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedRisk, setEditedRisk] = useState<RiskDetails | null>(null)
  const [originalRisk, setOriginalRisk] = useState<RiskDetails | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      // Validate risk ID before making API calls
      const validRiskId = validateRiskId(params.riskId)
      if (!validRiskId) {
        setError('Invalid risk ID format. Expected format: RISK-XXX')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        
        // Build safe API URLs
        const riskApiUrl = buildApiUrl('/api/risks')
        const treatmentsApiUrl = buildApiUrl('/api/treatments')
        
        if (!riskApiUrl || !treatmentsApiUrl) {
          setError('Invalid risk ID format. Expected format: RISK-XXX')
          setLoading(false)
          return
        }
        
        // Fetch risk details
        const riskResponse = await fetch(riskApiUrl)
        const riskResult = await riskResponse.json()
        
        if (riskResult.success) {
          // Transform the data to match the expected format
          const risk = riskResult.data;
          const transformedRisk = {
            riskId: risk.riskId,
            functionalUnit: risk.functionalUnit,
            currentPhase: risk.currentPhase,
            jiraTicket: `RISK-${risk.riskId.split('-')[1]}`,
            dateRiskRaised: risk.createdAt ? toDateInputValue(risk.createdAt) : '2024-01-15',
            raisedBy: risk.riskOwner,
            riskOwner: risk.riskOwner,
            affectedSites: 'All Sites',
            informationAssets: risk.informationAsset,
            threat: risk.threat,
            vulnerability: risk.vulnerability,
            riskStatement: risk.riskStatement,
            impactCIA: risk.impact ? `C:${risk.impact.confidentiality} I:${risk.impact.integrity} A:${risk.impact.availability}` : 'Not specified',
            currentControls: risk.currentControls,
            currentControlsReference: `CTRL-${risk.riskId.split('-')[1]}`,
            consequence: risk.consequenceRating,
            likelihood: risk.likelihoodRating,
            currentRiskRating: risk.riskRating,
            riskAction: 'Requires treatment',
            reasonForAcceptance: risk.reasonForAcceptance || '',
            dateOfSSCApproval: risk.dateOfSSCApproval ? toDateInputValue(risk.dateOfSSCApproval) : '',
            dateRiskTreatmentsApproved: risk.dateRiskTreatmentsApproved ? toDateInputValue(risk.dateRiskTreatmentsApproved) : '',
            residualConsequence: risk.residualConsequence || '',
            residualLikelihood: risk.residualLikelihood || '',
            residualRiskRating: risk.residualRiskRating || '',
            residualRiskAcceptedByOwner: risk.residualRiskAcceptedByOwner || '',
            dateResidualRiskAccepted: risk.dateResidualRiskAccepted ? toDateInputValue(risk.dateResidualRiskAccepted) : '',
            treatmentCount: 4,
          };
          setRiskDetails(transformedRisk)
        } else {
          setError(riskResult.error || 'Failed to fetch risk details')
          setLoading(false)
          return
        }
        
        // Fetch treatments for this risk
        const treatmentsResponse = await fetch(treatmentsApiUrl)
        const treatmentsResult = await treatmentsResponse.json()
        
        if (treatmentsResult.success) {
          setTreatments(treatmentsResult.data)
        }
        
      } catch (err) {
        setError('Failed to fetch risk details')
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }

    const validRiskId = validateRiskId(params.riskId)
    if (validRiskId) {
      fetchData()
    } else if (params.riskId) {
      // Only set error if params.riskId exists but is invalid
      setError('Invalid risk ID format. Expected format: RISK-XXX')
      setLoading(false)
    }
  }, [params.riskId])

  const getStatusColor = (status: string) => {
    if (!status) return 'bg-gray-100 text-gray-800'
    
    switch (status.toLowerCase()) {
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

  const getPriorityColor = (priority: string) => {
    if (!priority) return 'bg-gray-100 text-gray-800'
    
    switch (priority.toLowerCase()) {
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

  const getTreatmentStatusColor = (status: string) => {
    if (!status) return 'bg-gray-100 text-gray-800'
    
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Robust date parsing utility
  const parseDate = (dateString: string | null | undefined): Date | null => {
    if (!dateString || dateString === 'Not specified' || dateString === '') {
      return null
    }
    
    try {
      // Try parsing as ISO string first
      const date = new Date(dateString)
      if (!isNaN(date.getTime())) {
        return date
      }
      
      // Try parsing common date formats
      const formats = [
        /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
        /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
        /^\d{2}-\d{2}-\d{4}$/, // MM-DD-YYYY
        /^\d{4}\/\d{2}\/\d{2}$/, // YYYY/MM/DD
      ]
      
      for (const format of formats) {
        if (format.test(dateString)) {
          const parsed = new Date(dateString)
          if (!isNaN(parsed.getTime())) {
            return parsed
          }
        }
      }
      
      return null
    } catch (error) {
      return null
    }
  }

  // Convert date to YYYY-MM-DD format for HTML date inputs
  const toDateInputValue = (dateString: string | null | undefined): string => {
    const date = parseDate(dateString)
    if (!date) return ''
    
    try {
      return date.toISOString().split('T')[0]
    } catch (error) {
      return ''
    }
  }

  // Format date to dd MMM yyyy format
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString || dateString === 'Not specified') return 'Not specified'
    
    const date = parseDate(dateString)
    if (!date) return 'Invalid date'
    
    try {
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    } catch (error) {
      return 'Invalid date'
    }
  }

  // Get relative time (e.g., "2 days ago", "1 week ago")
  const getRelativeTime = (dateString: string | null | undefined): string => {
    if (!dateString || dateString === 'Not specified') return ''
    
    const date = parseDate(dateString)
    if (!date) return ''
    
    try {
      const now = new Date()
      const diffTime = Math.abs(now.getTime() - date.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 1) return '1 day ago'
      if (diffDays < 7) return `${diffDays} days ago`
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
      if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`
      return `${Math.ceil(diffDays / 365)} years ago`
    } catch (error) {
      return ''
    }
  }

  const handleRowClick = (row: any) => {
    // TODO: Navigate to treatment detail page
  }

  const handleExportCSV = (selectedRows: Set<number>) => {
    // TODO: Implement CSV export
  }

  const handleCopyLink = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url).then(() => {
      showToast({
        type: 'success',
        title: 'Link Copied',
        message: 'Risk page link has been copied to your clipboard.',
        duration: 3000
      })
    }).catch(err => {
      console.error('Failed to copy link: ', err)
      showToast({
        type: 'error',
        title: 'Copy Failed',
        message: 'Failed to copy link to clipboard.',
        duration: 4000
      })
    })
  }

  const handleEdit = () => {
    setIsEditing(true)
    setOriginalRisk(riskDetails) // Store the original values when entering edit mode
    setEditedRisk(riskDetails)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedRisk(originalRisk) // Reset to the original values when canceling
    setOriginalRisk(null) // Clear the original values
  }

  const handleSave = async () => {
    if (!editedRisk) return

    // Build safe API URL
    const riskApiUrl = buildApiUrl('/api/risks')
    if (!riskApiUrl) {
      showToast({
        type: 'error',
        title: 'Invalid Risk ID',
        message: 'The risk ID format is invalid. Expected format: RISK-XXX',
        duration: 5000
      })
      return
    }

    try {
      setSaving(true)
      const response = await fetch(riskApiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedRisk),
      })

      const result = await response.json()
      
      if (result.success) {
        setRiskDetails(editedRisk)
        setIsEditing(false)
        setOriginalRisk(null) // Clear the original values after successful save
        showToast({
          type: 'success',
          title: 'Risk Updated Successfully',
          message: 'The risk information has been saved successfully.',
          duration: 4000
        })
      } else {
        showToast({
          type: 'error',
          title: 'Update Failed',
          message: result.error || 'An unknown error occurred while updating the risk.',
          duration: 6000
        })
      }
    } catch (error) {
      console.error('Error updating risk:', error)
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update risk. Please try again.',
        duration: 6000
      })
    } finally {
      setSaving(false)
    }
  }

  // Type utilities for safe field change handling
  type StringFields = {
    [K in keyof RiskDetails]: RiskDetails[K] extends string ? K : never
  }[keyof RiskDetails]

  type NumberFields = {
    [K in keyof RiskDetails]: RiskDetails[K] extends number ? K : never
  }[keyof RiskDetails]

  // Type-safe field change handler that accepts appropriate value types for each field
  const handleFieldChange = <K extends keyof RiskDetails>(
    field: K, 
    value: RiskDetails[K]
  ) => {
    if (!editedRisk) return
    setEditedRisk({
      ...editedRisk,
      [field]: value
    })
  }

  // Type-safe string field change handler
  const handleStringFieldChange = (field: StringFields, value: string) => {
    handleFieldChange(field, value)
  }

  // Type-safe number field change handler
  const handleNumberFieldChange = (field: NumberFields, value: number) => {
    handleFieldChange(field, value)
  }

  // Type-safe date field change handler (dates are stored as strings)
  const handleDateFieldChange = (field: StringFields, value: string) => {
    // Ensure date is in proper format for storage
    const formattedDate = value ? value : ''
    handleFieldChange(field, formattedDate)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading risk details...</p>
        </div>
      </div>
    )
  }

  if (error || !riskDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Icon name="exclamation-triangle" size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Risk Not Found</h2>
          <p className="text-gray-600 mb-4">
            {error || 'The risk with ID "' + validateRiskId(params.riskId) + '" could not be found.'}
          </p>
          <button
            onClick={() => router.push('/risk-management/register')}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ 
              backgroundColor: '#4C1D95',
              '--tw-ring-color': '#4C1D95'
            } as React.CSSProperties}
          >
            <Icon name="arrow-left" size={16} className="mr-2" />
            Back to Register
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Risk Information Container */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/risk-management/register')}
              className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 hover:bg-gray-200 bg-white border border-gray-300"
              title="Back to Register"
            >
              <Icon name="arrow-left" size={16} />
            </button>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#22223B' }}>
                {isEditing ? 'Edit Risk' : `${riskDetails.riskId} - Risk Information`}
              </h1>
              <p className="text-gray-600" style={{ color: '#22223B' }}>
                Risk Profile
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
                <button
                  onClick={() => {
                    // TODO: Implement PDF export functionality
                    console.log('Export to PDF clicked')
                  }}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                  style={{ backgroundColor: '#4C1D95' }}
                  title="Export to PDF"
                >
                  <Icon name="file-pdf" size={16} className="mr-2" />
                  Export PDF
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
          </div>
        </div>
        
        {/* Risk Statement - Prominent Display */}
        <div className="bg-gray-50 rounded-lg p-6 border-l-4 mb-8" style={{ borderLeftColor: '#4C1D95' }}>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Risk Statement</label>
          {isEditing ? (
            <textarea
              value={editedRisk?.riskStatement || ''}
              onChange={(e) => handleFieldChange('riskStatement', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={4}
              placeholder="Enter risk statement..."
            />
          ) : (
            <p className="text-gray-900 leading-relaxed text-base">{riskDetails.riskStatement}</p>
          )}
        </div>

        {/* Risk Assessment Section */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <div className="w-1 h-6 bg-purple-600 rounded-full mr-3"></div>
            <h3 className="text-lg font-semibold text-gray-900">Risk Assessment</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Current Risk Status */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-4">Current Status</h4>
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Current Phase</span>
                  <div className="mt-1">
                    {isEditing ? (
                      <select
                        value={editedRisk?.currentPhase || ''}
                        onChange={(e) => handleFieldChange('currentPhase', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="identification">Identification</option>
                        <option value="analysis">Analysis</option>
                        <option value="evaluation">Evaluation</option>
                        <option value="treatment">Treatment</option>
                        <option value="monitoring">Monitoring</option>
                      </select>
                    ) : (
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(riskDetails.currentPhase)}`}>
                        {riskDetails.currentPhase}
                      </span>
                    )}
                  </div>
                </div>

                <div className="relative group">
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Current Risk Rating</span>
                  <div className="mt-1">
                    {isEditing ? (
                      <select
                        value={editedRisk?.currentRiskRating || ''}
                        onChange={(e) => handleFieldChange('currentRiskRating', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    ) : (
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium cursor-help ${getRiskLevelColor(riskDetails.currentRiskRating)}`}>
                        {riskDetails.currentRiskRating}
                      </span>
                    )}
                  </div>
                  {!isEditing && (
                    <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10">
                      <div className="text-white text-xs rounded-lg p-3 shadow-lg" style={{ backgroundColor: '#4C1D95' }}>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>Consequence:</span>
                            <span className={`ml-2 px-1 py-0.5 rounded text-xs ${getPriorityColor(riskDetails.consequence)}`}>
                              {riskDetails.consequence}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Likelihood:</span>
                            <span className={`ml-2 px-1 py-0.5 rounded text-xs ${getPriorityColor(riskDetails.likelihood)}`}>
                              {riskDetails.likelihood}
                            </span>
                          </div>
                        </div>
                        <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent" style={{ borderTopColor: '#4C1D95' }}></div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Impact (CIA)</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedRisk?.impactCIA || ''}
                      onChange={(e) => handleFieldChange('impactCIA', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., C:High I:Medium A:Low"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 mt-1">{riskDetails.impactCIA}</p>
                  )}
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Risk Action</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedRisk?.riskAction || ''}
                      onChange={(e) => handleFieldChange('riskAction', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., Requires treatment"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 mt-1">{riskDetails.riskAction}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Risk Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-4">Risk Details</h4>
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Threat</span>
                  {isEditing ? (
                    <textarea
                      value={editedRisk?.threat || ''}
                      onChange={(e) => handleFieldChange('threat', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      rows={3}
                      placeholder="Enter threat description..."
                    />
                  ) : (
                    <p className="text-sm text-gray-900 mt-1">{riskDetails.threat}</p>
                  )}
                </div>

                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Vulnerability</span>
                  {isEditing ? (
                    <textarea
                      value={editedRisk?.vulnerability || ''}
                      onChange={(e) => handleFieldChange('vulnerability', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      rows={3}
                      placeholder="Enter vulnerability description..."
                    />
                  ) : (
                    <p className="text-sm text-gray-900 mt-1">{riskDetails.vulnerability}</p>
                  )}
                </div>

                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Current Controls</span>
                  {isEditing ? (
                    <textarea
                      value={editedRisk?.currentControls || ''}
                      onChange={(e) => handleFieldChange('currentControls', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      rows={3}
                      placeholder="Enter current controls..."
                    />
                  ) : (
                    <p className="text-sm text-gray-900 mt-1">{riskDetails.currentControls}</p>
                  )}
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Raised By</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedRisk?.raisedBy || ''}
                      onChange={(e) => handleFieldChange('raisedBy', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter who raised the risk"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 mt-1">{riskDetails.raisedBy}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ownership & Asset Section */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <div className="w-1 h-6 bg-blue-600 rounded-full mr-3"></div>
            <h3 className="text-lg font-semibold text-gray-900">Ownership & Asset</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Primary Contact</h4>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Risk Owner</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedRisk?.riskOwner || ''}
                      onChange={(e) => handleFieldChange('riskOwner', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter risk owner"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 mt-1 font-medium">{riskDetails.riskOwner}</p>
                  )}
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Functional Unit</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedRisk?.functionalUnit || ''}
                      onChange={(e) => handleFieldChange('functionalUnit', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter functional unit"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 mt-1">{riskDetails.functionalUnit}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Affected Assets</h4>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Information Assets</span>
                  {isEditing ? (
                    <textarea
                      value={editedRisk?.informationAssets || ''}
                      onChange={(e) => handleFieldChange('informationAssets', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      rows={3}
                      placeholder="Enter information assets..."
                    />
                  ) : (
                    <p className="text-sm text-gray-900 mt-1">{riskDetails.informationAssets}</p>
                  )}
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Affected Sites</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedRisk?.affectedSites || ''}
                      onChange={(e) => handleFieldChange('affectedSites', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter affected sites"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 mt-1">{riskDetails.affectedSites}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Tracking</h4>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">JIRA Ticket</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedRisk?.jiraTicket || ''}
                      onChange={(e) => handleFieldChange('jiraTicket', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
                      placeholder="e.g., RISK-123"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 mt-1 font-mono">{riskDetails.jiraTicket}</p>
                  )}
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Date Risk Raised</span>
                  {isEditing ? (
                    <input
                      type="date"
                      value={toDateInputValue(editedRisk?.dateRiskRaised)}
                      onChange={(e) => handleDateFieldChange('dateRiskRaised', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="mt-1">
                      <span className="text-sm font-medium text-gray-900">{formatDate(riskDetails.dateRiskRaised)}</span>
                      {getRelativeTime(riskDetails.dateRiskRaised) && (
                        <p className="text-xs text-gray-500 mt-1">{getRelativeTime(riskDetails.dateRiskRaised)}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Residual Risk Assessment Section */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <div className="w-1 h-6 bg-orange-600 rounded-full mr-3"></div>
            <h3 className="text-lg font-semibold text-gray-900">Residual Risk Assessment</h3>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <span className="text-xs text-gray-500 uppercase tracking-wide block mb-2">Residual Consequence</span>
                {isEditing ? (
                  <select
                    value={editedRisk?.residualConsequence || ''}
                    onChange={(e) => handleFieldChange('residualConsequence', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select...</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                ) : (
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(riskDetails.residualConsequence)}`}>
                    {riskDetails.residualConsequence}
                  </span>
                )}
              </div>
              <div className="text-center">
                <span className="text-xs text-gray-500 uppercase tracking-wide block mb-2">Residual Likelihood</span>
                {isEditing ? (
                  <select
                    value={editedRisk?.residualLikelihood || ''}
                    onChange={(e) => handleFieldChange('residualLikelihood', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select...</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                ) : (
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(riskDetails.residualLikelihood)}`}>
                    {riskDetails.residualLikelihood}
                  </span>
                )}
              </div>
              <div className="text-center">
                <span className="text-xs text-gray-500 uppercase tracking-wide block mb-2">Residual Risk Rating</span>
                {isEditing ? (
                  <select
                    value={editedRisk?.residualRiskRating || ''}
                    onChange={(e) => handleFieldChange('residualRiskRating', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select...</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                ) : (
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelColor(riskDetails.residualRiskRating)}`}>
                    {riskDetails.residualRiskRating}
                  </span>
                )}
              </div>
              <div className="text-center">
                <span className="text-xs text-gray-500 uppercase tracking-wide block mb-2">Accepted By</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedRisk?.residualRiskAcceptedByOwner || ''}
                    onChange={(e) => handleFieldChange('residualRiskAcceptedByOwner', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter name"
                  />
                ) : (
                  <p className="text-sm text-gray-900">{riskDetails.residualRiskAcceptedByOwner}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Approvals & Dates Section */}
        <div>
          <div className="flex items-center mb-6">
            <div className="w-1 h-6 bg-green-600 rounded-full mr-3"></div>
            <h3 className="text-lg font-semibold text-gray-900">Approvals & Dates</h3>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide block mb-2">Date of SSC Approval</span>
                {isEditing ? (
                  <input
                    type="date"
                    value={toDateInputValue(editedRisk?.dateOfSSCApproval)}
                    onChange={(e) => handleDateFieldChange('dateOfSSCApproval', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-900">{formatDate(riskDetails.dateOfSSCApproval)}</p>
                    {getRelativeTime(riskDetails.dateOfSSCApproval) && (
                      <p className="text-xs text-gray-500 mt-1">{getRelativeTime(riskDetails.dateOfSSCApproval)}</p>
                    )}
                  </>
                )}
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide block mb-2">Date Risk Treatments Approved</span>
                {isEditing ? (
                  <input
                    type="date"
                    value={toDateInputValue(editedRisk?.dateRiskTreatmentsApproved)}
                    onChange={(e) => handleDateFieldChange('dateRiskTreatmentsApproved', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-900">{formatDate(riskDetails.dateRiskTreatmentsApproved)}</p>
                    {getRelativeTime(riskDetails.dateRiskTreatmentsApproved) && (
                      <p className="text-xs text-gray-500 mt-1">{getRelativeTime(riskDetails.dateRiskTreatmentsApproved)}</p>
                    )}
                  </>
                )}
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide block mb-2">Date Residual Risk Accepted</span>
                {isEditing ? (
                                                        <input
                    type="date"
                    value={toDateInputValue(editedRisk?.dateResidualRiskAccepted)}
                    onChange={(e) => handleDateFieldChange('dateResidualRiskAccepted', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-900">{formatDate(riskDetails.dateResidualRiskAccepted)}</p>
                    {getRelativeTime(riskDetails.dateResidualRiskAccepted) && (
                      <p className="text-xs text-gray-500 mt-1">{getRelativeTime(riskDetails.dateResidualRiskAccepted)}</p>
                    )}
                  </>
                )}
              </div>
            </div>
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wide block mb-2">Reason for Acceptance</span>
              {isEditing ? (
                <textarea
                  value={editedRisk?.reasonForAcceptance || ''}
                  onChange={(e) => handleFieldChange('reasonForAcceptance', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Enter reason for acceptance..."
                />
              ) : (
                <p className="text-sm text-gray-900">{riskDetails.reasonForAcceptance || 'Not specified'}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Risk Treatments DataTable */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
              <Icon name="bandage" size={20} className="text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Risk Treatments</h3>
              <p className="text-sm text-gray-500">
                {treatments.length} treatment{treatments.length !== 1 ? 's' : ''} for this risk
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 rounded-lg">
              <Icon name="check-circle" size={16} className="text-green-500" />
              <span className="text-sm font-medium text-green-700">
                {treatments.filter(t => t.completionDate).length} completed
              </span>
            </div>
            <div className="flex items-center space-x-2 px-3 py-2 bg-orange-50 rounded-lg">
              <Icon name="hourglass-half" size={16} className="text-orange-500" />
              <span className="text-sm font-medium text-orange-700">
                {treatments.filter(t => !t.completionDate).length} pending
              </span>
            </div>
            <button
              onClick={() => {
                // TODO: Implement add new treatment functionality
                console.log('Add new treatment clicked')
              }}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{ 
                backgroundColor: '#4C1D95',
                '--tw-ring-color': '#4C1D95'
              } as React.CSSProperties}
            >
              <Icon name="plus" size={16} className="mr-2" />
              Add Treatment
            </button>
          </div>
        </div>
        
        {treatments.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="list-check" size={48} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No treatments found for this risk</p>
            <p className="text-sm text-gray-400 mt-1">Treatments will appear here once they are added</p>
          </div>
        ) : (
          <DataTable
            data={treatments}
            columns={[
              { key: 'riskTreatment', label: 'Risk Treatment', sortable: true },
              { key: 'treatmentJiraTicket', label: 'Treatment Jira Ticket', sortable: true },
              { key: 'riskTreatmentOwner', label: 'Risk Treatment Owner', sortable: true },
              { key: 'dateRiskTreatmentDue', label: 'Date Risk Treatment Due', sortable: true },
              { key: 'extendedDueDate', label: 'Extended Due Date', sortable: true },
              { key: 'numberOfExtensions', label: 'Number of Extensions', sortable: true },
              { key: 'completionDate', label: 'Completion Date', sortable: true },
              { key: 'closureApproval', label: 'Closure Approval', sortable: true },
              { key: 'closureApprovedBy', label: 'Closure Approved by', sortable: true },
            ].map(col => ({
              ...col,
              render: (value: any, row: any) => {
                if (col.key === 'treatmentJiraTicket') {
                  return (
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {value}
                    </span>
                  )
                }
                if (col.key === 'numberOfExtensions') {
                  return (
                    <span className="font-medium text-blue-600">
                      {value}
                    </span>
                  )
                }
                if (col.key === 'closureApproval') {
                  return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTreatmentStatusColor(value)}`}>
                      {value}
                    </span>
                  )
                }
                if (col.key === 'dateRiskTreatmentDue' || col.key === 'extendedDueDate' || col.key === 'completionDate') {
                  if (!value) return <span className="text-gray-400">-</span>
                  return <span className="text-sm font-medium">{formatDate(value)}</span>
                }
                // Implement tooltip rendering for all content
                const cellValue = value ? String(value) : '-'
                return (
                  <div className="relative group">
                    <span className="truncate block max-w-full">
                      {cellValue}
                    </span>
                    <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 max-w-xs break-words">
                      {cellValue}
                      <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                )
              }
            }))}
            onRowClick={handleRowClick}
            onExportCSV={handleExportCSV}
            selectable={true}
          />
        )}
      </div>
    </div>
  )
} 