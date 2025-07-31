'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Icon from '../../../components/Icon'
import { getCIAConfig, extractRiskNumber } from '../../../../lib/utils'

interface Risk {
  riskId: string
  functionalUnit: string
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
  riskTreatments: string
  dateRiskTreatmentsApproved: string
  riskTreatmentAssignedTo: string
  residualConsequence: string
  residualLikelihood: string
  residualRiskRating: string
  residualRiskAcceptedByOwner: string
  dateResidualRiskAccepted: string
  dateRiskTreatmentCompleted: string
  currentPhase: string
}

export default function RiskInformationPage() {
  const params = useParams()
  const router = useRouter()
  const [risk, setRisk] = useState<Risk | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedRisk, setEditedRisk] = useState<Risk | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchRisk(params.id as string)
    }
  }, [params.id])

  const fetchRisk = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/risks/${id}`)
      const result = await response.json()
      
      if (result.success) {
        // Map the API data to our expected format
        const mappedRisk: Risk = {
          riskId: result.data.riskId || '',
          functionalUnit: result.data.functionalUnit || '',
          jiraTicket: result.data.jiraTicket || `RISK-${extractRiskNumber(id)}`,
          dateRiskRaised: result.data.dateRiskRaised || result.data.createdAt ? new Date(result.data.createdAt).toISOString().split('T')[0] : '',
          raisedBy: result.data.raisedBy || result.data.riskOwner || '',
          riskOwner: result.data.riskOwner || '',
          affectedSites: result.data.affectedSites || 'All Sites',
          informationAssets: result.data.informationAssets || result.data.informationAsset || '',
          threat: result.data.threat || '',
          vulnerability: result.data.vulnerability || '',
          riskStatement: result.data.riskStatement || '',
          impactCIA: result.data.impactCIA || (result.data.impact ? (Array.isArray(result.data.impact) ? result.data.impact.join(', ') : 'Not specified') : ''),
          currentControls: result.data.currentControls || '',
          currentControlsReference: result.data.currentControlsReference || `CTRL-${extractRiskNumber(id)}`,
          consequence: result.data.consequence || result.data.consequenceRating || '',
          likelihood: result.data.likelihood || result.data.likelihoodRating || '',
          currentRiskRating: result.data.currentRiskRating || result.data.riskRating || '',
          riskAction: result.data.riskAction || 'Requires treatment',
          reasonForAcceptance: result.data.reasonForAcceptance || '',
          dateOfSSCApproval: result.data.dateOfSSCApproval ? new Date(result.data.dateOfSSCApproval).toISOString().split('T')[0] : '',
          riskTreatments: result.data.riskTreatments || '',
          dateRiskTreatmentsApproved: result.data.dateRiskTreatmentsApproved ? new Date(result.data.dateRiskTreatmentsApproved).toISOString().split('T')[0] : '',
          riskTreatmentAssignedTo: result.data.riskTreatmentAssignedTo || '',
          residualConsequence: result.data.residualConsequence || '',
          residualLikelihood: result.data.residualLikelihood || '',
          residualRiskRating: result.data.residualRiskRating || '',
          residualRiskAcceptedByOwner: result.data.residualRiskAcceptedByOwner || '',
          dateResidualRiskAccepted: result.data.dateResidualRiskAccepted ? new Date(result.data.dateResidualRiskAccepted).toISOString().split('T')[0] : '',
          dateRiskTreatmentCompleted: result.data.dateRiskTreatmentCompleted ? new Date(result.data.dateRiskTreatmentCompleted).toISOString().split('T')[0] : '',
          currentPhase: result.data.currentPhase || 'Identification',
        }
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
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedRisk(risk)
  }

  const handleSave = async () => {
    if (!editedRisk) return

    try {
      setSaving(true)
      
      // Map the edited data back to the database format
      const updateData = {
        riskId: editedRisk.riskId,
        functionalUnit: editedRisk.functionalUnit,
        currentPhase: editedRisk.currentPhase,
        jiraTicket: editedRisk.jiraTicket,
        dateRiskRaised: editedRisk.dateRiskRaised,
        raisedBy: editedRisk.raisedBy,
        riskOwner: editedRisk.riskOwner,
        affectedSites: editedRisk.affectedSites,
        informationAssets: editedRisk.informationAssets,
        threat: editedRisk.threat,
        vulnerability: editedRisk.vulnerability,
        riskStatement: editedRisk.riskStatement,
        impactCIA: editedRisk.impactCIA,
        currentControls: editedRisk.currentControls,
        currentControlsReference: editedRisk.currentControlsReference,
        consequence: editedRisk.consequence,
        likelihood: editedRisk.likelihood,
        currentRiskRating: editedRisk.currentRiskRating,
        riskAction: editedRisk.riskAction,
        reasonForAcceptance: editedRisk.reasonForAcceptance,
        dateOfSSCApproval: editedRisk.dateOfSSCApproval,
        riskTreatments: editedRisk.riskTreatments,
        dateRiskTreatmentsApproved: editedRisk.dateRiskTreatmentsApproved,
        riskTreatmentAssignedTo: editedRisk.riskTreatmentAssignedTo,
        residualConsequence: editedRisk.residualConsequence,
        residualLikelihood: editedRisk.residualLikelihood,
        residualRiskRating: editedRisk.residualRiskRating,
        residualRiskAcceptedByOwner: editedRisk.residualRiskAcceptedByOwner,
        dateResidualRiskAccepted: editedRisk.dateResidualRiskAccepted,
        dateRiskTreatmentCompleted: editedRisk.dateRiskTreatmentCompleted,
      }

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
        setError(result.error || 'Failed to update risk')
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
      alert('Link copied to clipboard!')
    })
  }

  const handleFieldChange = (field: keyof Risk, value: string) => {
    if (!editedRisk) return
    setEditedRisk({
      ...editedRisk,
      [field]: value
    })
  }

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
          onClick={() => router.push('/risk-management/register')}
          className="px-4 py-2 rounded-lg transition-colors"
          style={{ backgroundColor: '#898AC4', color: 'white' }}
        >
          Back to Risk Register
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
            onClick={() => router.push('/risk-management/register')}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 hover:bg-gray-200 bg-white border border-gray-300"
            title="Back to Risk Register"
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
                <textarea
                  value={editedRisk?.informationAssets || ''}
                  onChange={(e) => handleFieldChange('informationAssets', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{risk.informationAssets}</p>
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
    </div>
  )
} 