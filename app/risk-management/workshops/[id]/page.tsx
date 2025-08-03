'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Icon from '@/app/components/Icon'
import Tooltip from '@/app/components/Tooltip'
import { useToast } from '@/app/components/Toast'

interface Risk {
  riskId: string
  riskStatement: string
  informationAsset: string
  likelihood: string
  impact: string
  riskLevel: string
}

interface Treatment {
  _id: string
  riskId: string
  treatmentId: string
  treatmentJira?: string
  riskTreatment: string
  riskTreatmentOwner: string
  dateRiskTreatmentDue: string
  extendedDueDate?: string
  numberOfExtensions: number
  completionDate?: string
  closureApproval: string
  closureApprovedBy?: string
  extensions: Array<{
    extendedDueDate: string
    approver: string
    dateApproved: string
    justification: string
  }>
  createdAt: string
  updatedAt: string
}

// Discriminated union for selectedTreatments
interface TreatmentMinutes {
  treatmentId: string
  treatmentJira?: string
  actionsTaken?: string
  toDo?: string
  outcome?: string
}

type SelectedTreatments = string[] | TreatmentMinutes[]

// Type guards for discriminated union
const isStringArray = (selectedTreatments: SelectedTreatments): selectedTreatments is string[] => {
  return selectedTreatments.length > 0 && 
         selectedTreatments[0] !== undefined && 
         selectedTreatments[0] !== null &&
         typeof selectedTreatments[0] === 'string'
}

const isTreatmentMinutesArray = (selectedTreatments: SelectedTreatments): selectedTreatments is TreatmentMinutes[] => {
  return selectedTreatments.length > 0 && 
         selectedTreatments[0] !== undefined && 
         selectedTreatments[0] !== null &&
         typeof selectedTreatments[0] === 'object' && 
         'treatmentId' in selectedTreatments[0]
}

// Helper function to safely check if array is empty or can be treated as TreatmentMinutes
const isEmptyOrTreatmentMinutesArray = (selectedTreatments: SelectedTreatments): boolean => {
  return selectedTreatments.length === 0 || isTreatmentMinutesArray(selectedTreatments)
}

interface Workshop {
  _id: string
  id: string
  date: string
  status: 'Pending Agenda' | 'Planned' | 'Scheduled' | 'Finalising Meeting Minutes' | 'Completed'
  facilitator: string
  facilitatorPosition?: string
  participants: Array<string | {
    name: string
    position?: string
  }>
  risks: string[]
  outcomes?: string
  securitySteeringCommittee: 'Core Systems Engineering' | 'Software Engineering' | 'IP Engineering'
  actionsTaken?: string
  toDo?: string
  notes?: string
  // Meeting Minutes subsections
  extensions?: Array<{
    riskId: string
    selectedTreatments?: SelectedTreatments
    actionsTaken: string
    toDo: string
    outcome: string
  }>
  closure?: Array<{
    riskId: string
    selectedTreatments?: SelectedTreatments
    actionsTaken: string
    toDo: string
    outcome: string
  }>
  newRisks?: Array<{
    riskId: string
    selectedTreatments?: SelectedTreatments
    actionsTaken: string
    toDo: string
    outcome: string
  }>
  createdAt?: string
  updatedAt?: string
}

// Inline Editable Field Component
interface EditableFieldProps {
  value: string
  placeholder: string
  onSave: (value: string) => Promise<void>
  className?: string
}

function EditableField({ value, placeholder, onSave, className = '' }: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const [isSaving, setIsSaving] = useState(false)
  const [isCanceling, setIsCanceling] = useState(false)

  const handleSave = async () => {
    if (editValue.trim() !== value) {
      setIsSaving(true)
      try {
        await onSave(editValue.trim())
        setIsEditing(false)
      } catch (error) {
        console.error('Error saving:', error)
      } finally {
        setIsSaving(false)
      }
    } else {
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setIsCanceling(true)
    setEditValue(value)
    setIsEditing(false)
    // Reset canceling flag after a brief delay to prevent onBlur from triggering
    setTimeout(() => setIsCanceling(false), 100)
  }

  const handleBlur = (e: React.FocusEvent) => {
    // Only save on blur if we're not canceling and the focus is not moving to the cancel button
    if (!isCanceling && !e.relatedTarget?.closest('button')) {
      handleSave()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  if (isEditing) {
    return (
      <div className={`relative ${className}`}>
        <textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="w-full p-2 text-sm border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={3}
          autoFocus
        />
        <div className="absolute top-1 right-1 flex space-x-1">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="p-1 text-green-600 hover:text-green-800 disabled:opacity-50"
            title="Save"
          >
            {isSaving ? (
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600"></div>
            ) : (
              <Icon name="check" size={14} />
            )}
          </button>
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="p-1 text-red-600 hover:text-red-800 disabled:opacity-50"
            title="Cancel"
          >
            <Icon name="x" size={14} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`group cursor-pointer p-2 rounded-md hover:bg-gray-50 transition-colors ${className}`}
      onClick={() => setIsEditing(true)}
    >
      <div className="text-sm text-gray-700 whitespace-pre-wrap">
        {value || <span className="text-gray-500 italic">{placeholder}</span>}
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-1">
        <Icon name="pencil" size={12} className="text-gray-400" />
      </div>
    </div>
  )
}

// Helper functions (moved outside components)
const getFilteredTreatments = (allRiskTreatments: Treatment[], selectedTreatments?: SelectedTreatments): Treatment[] => {
  if (!selectedTreatments || selectedTreatments.length === 0) {
    return allRiskTreatments
  }

  if (isStringArray(selectedTreatments)) {
    return allRiskTreatments.filter(treatment => 
      selectedTreatments.includes(treatment.treatmentId)
    )
  }

  if (isTreatmentMinutesArray(selectedTreatments)) {
    return allRiskTreatments.filter(treatment => 
      selectedTreatments.some(st => st.treatmentId === treatment.treatmentId)
    )
  }

  return allRiskTreatments
}

const getTreatmentMinutes = (
  treatmentId: string,
  selectedTreatments?: SelectedTreatments
): TreatmentMinutes | undefined => {
  if (!selectedTreatments || selectedTreatments.length === 0) return undefined
  
  if (isTreatmentMinutesArray(selectedTreatments)) {
    return selectedTreatments.find(st => st.treatmentId === treatmentId)
  }
  
  return undefined
}

// Risk Card Component
interface RiskCardProps {
  item: {
    riskId: string
    selectedTreatments?: SelectedTreatments
    actionsTaken: string
    toDo: string
    outcome: string
  }
  risk: Risk | undefined
  treatments: Treatment[]
  sectionType: 'extensions' | 'closure' | 'newRisks'
  onUpdate: (field: 'actionsTaken' | 'toDo' | 'outcome', value: string) => Promise<void>
  onUpdateTreatment: (treatmentId: string, field: 'actionsTaken' | 'toDo' | 'outcome', value: string) => Promise<void>
}

function RiskCard({ item, risk, treatments, sectionType, onUpdate, onUpdateTreatment }: RiskCardProps) {
  const riskTreatments = getFilteredTreatments(treatments, item.selectedTreatments)
  
  const getSectionColor = () => {
    switch (sectionType) {
      case 'extensions': return 'border-l-blue-500 bg-blue-50'
      case 'closure': return 'border-l-green-500 bg-green-50'
      case 'newRisks': return 'border-l-orange-500 bg-orange-50'
      default: return 'border-l-gray-500 bg-gray-50'
    }
  }

  const getRiskLevelColor = () => {
    if (!risk?.riskLevel) return 'bg-gray-100 text-gray-800'
    switch (risk.riskLevel.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className={`border-l-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 ${getSectionColor()}`}>
      <div className="p-6">
        {/* Risk Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-sm font-medium text-gray-900">Risk ID: {item.riskId}</span>
              {risk?.riskLevel && (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskLevelColor()}`}>
                  {risk.riskLevel}
                </span>
              )}
            </div>
            {risk && (
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Risk Statement</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">{risk.riskStatement}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Information Asset</h4>
                  <p className="text-sm text-gray-700">{risk.informationAsset}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Risk Treatments */}
        {riskTreatments.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Risk Treatments</h4>
            <div className="space-y-4">
              {riskTreatments.map((treatment: Treatment, treatmentIndex: number) => {
                const treatmentMinutes = getTreatmentMinutes(treatment.treatmentId, item.selectedTreatments)
                return (
                  <div key={treatmentIndex} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h5 className="text-sm font-medium text-gray-900 mb-1">Treatment Description</h5>
                        <p className="text-sm text-gray-700">{treatment.riskTreatment}</p>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-gray-900 mb-1">Owner</h5>
                        <p className="text-sm text-gray-700">{treatment.riskTreatmentOwner}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                      <div>
                        <h6 className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">Actions Taken</h6>
                        <EditableField
                          value={treatmentMinutes?.actionsTaken || ''}
                          placeholder="Add actions taken..."
                          onSave={(value) => onUpdateTreatment(treatment.treatmentId, 'actionsTaken', value)}
                        />
                      </div>
                      <div>
                        <h6 className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">To Do</h6>
                        <EditableField
                          value={treatmentMinutes?.toDo || ''}
                          placeholder="Add to do items..."
                          onSave={(value) => onUpdateTreatment(treatment.treatmentId, 'toDo', value)}
                        />
                      </div>
                      <div>
                        <h6 className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">Outcome</h6>
                        <EditableField
                          value={treatmentMinutes?.outcome || ''}
                          placeholder="Add outcome..."
                          onSave={(value) => onUpdateTreatment(treatment.treatmentId, 'outcome', value)}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Risk-level Meeting Minutes */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Risk-level Meeting Minutes</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h6 className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">Actions Taken</h6>
              <EditableField
                value={item.actionsTaken}
                placeholder="Add risk-level actions taken..."
                onSave={(value) => onUpdate('actionsTaken', value)}
              />
            </div>
            <div>
              <h6 className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">To Do</h6>
              <EditableField
                value={item.toDo}
                placeholder="Add risk-level to do items..."
                onSave={(value) => onUpdate('toDo', value)}
              />
            </div>
            <div>
              <h6 className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">Outcome</h6>
              <EditableField
                value={item.outcome}
                placeholder="Add risk-level outcome..."
                onSave={(value) => onUpdate('outcome', value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function WorkshopDetails() {
  const params = useParams()
  const router = useRouter()
  const { showToast } = useToast()
  const [workshop, setWorkshop] = useState<Workshop | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [risks, setRisks] = useState<Record<string, Risk>>({})
  const [treatments, setTreatments] = useState<Record<string, Treatment[]>>({})
  // Per-field saving states
  const [savingFields, setSavingFields] = useState<Set<string>>(new Set())

  // Update risk-level meeting minutes
  const updateRiskMinutes = async (section: 'extensions' | 'closure' | 'newRisks', index: number, field: 'actionsTaken' | 'toDo' | 'outcome', value: string) => {
    if (!workshop) return

    const fieldKey = `${section}-${index}-${field}`
    setSavingFields(prev => new Set(prev).add(fieldKey))
    
    try {
      const updatedWorkshop = { ...workshop }
      if (updatedWorkshop[section]) {
        updatedWorkshop[section]![index] = {
          ...updatedWorkshop[section]![index],
          [field]: value
        }
      }

      const response = await fetch(`/api/workshops/${workshop.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedWorkshop),
      })

      const result = await response.json()
      if (result.success) {
        setWorkshop(updatedWorkshop)
        showToast({
          type: 'success',
          title: 'Updated',
          message: 'Meeting minutes updated successfully'
        })
      } else {
        throw new Error(result.error || 'Failed to update')
      }
    } catch (error) {
      console.error('Error updating risk minutes:', error)
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update meeting minutes. Please try again.'
      })
    } finally {
      setSavingFields(prev => {
        const newSet = new Set(prev)
        newSet.delete(fieldKey)
        return newSet
      })
    }
  }

  // Update treatment-level meeting minutes
  const updateTreatmentMinutes = async (section: 'extensions' | 'closure' | 'newRisks', index: number, treatmentId: string, field: 'actionsTaken' | 'toDo' | 'outcome', value: string) => {
    if (!workshop) return

    const fieldKey = `${section}-${index}-treatment-${treatmentId}-${field}`
    setSavingFields(prev => new Set(prev).add(fieldKey))
    
    try {
      const updatedWorkshop = { ...workshop }
      if (updatedWorkshop[section]) {
        const item = updatedWorkshop[section]![index]
        
        // Initialize selectedTreatments as TreatmentMinutes array if it doesn't exist
        if (!item.selectedTreatments) {
          item.selectedTreatments = []
        }
        
        // Convert string array to TreatmentMinutes array if needed
        if (isStringArray(item.selectedTreatments)) {
          item.selectedTreatments = item.selectedTreatments.map(treatmentIdStr => ({
            treatmentId: treatmentIdStr,
            treatmentJira: `https://jira.company.com/browse/${treatmentIdStr}`,
            actionsTaken: '',
            toDo: '',
            outcome: ''
          }))
        }
        
        // Handle empty array or ensure it's a TreatmentMinutes array
        if (isEmptyOrTreatmentMinutesArray(item.selectedTreatments)) {
          // If it's empty, ensure it's typed as TreatmentMinutes[]
          if (item.selectedTreatments.length === 0) {
            item.selectedTreatments = [] as TreatmentMinutes[]
          }
          
          let treatmentIndex = (item.selectedTreatments as TreatmentMinutes[]).findIndex(t => t.treatmentId === treatmentId)
          
          // If treatment not found, add it
          if (treatmentIndex === -1) {
            (item.selectedTreatments as TreatmentMinutes[]).push({
              treatmentId,
              treatmentJira: `https://jira.company.com/browse/${treatmentId}`,
              actionsTaken: '',
              toDo: '',
              outcome: ''
            })
            treatmentIndex = (item.selectedTreatments as TreatmentMinutes[]).length - 1
          }
          
          // Update the treatment
          (item.selectedTreatments as TreatmentMinutes[])[treatmentIndex] = {
            ...(item.selectedTreatments as TreatmentMinutes[])[treatmentIndex],
            [field]: value
          }
        }
      }

      const response = await fetch(`/api/workshops/${workshop.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedWorkshop),
      })

      const result = await response.json()
      
      if (result.success) {
        setWorkshop(updatedWorkshop)
        showToast({
          type: 'success',
          title: 'Updated',
          message: 'Treatment minutes updated successfully'
        })
      } else {
        throw new Error(result.error || 'Failed to update')
      }
    } catch (error) {
      console.error('Error updating treatment minutes:', error)
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update treatment minutes. Please try again.'
      })
    } finally {
      setSavingFields(prev => {
        const newSet = new Set(prev)
        newSet.delete(fieldKey)
        return newSet
      })
    }
  }

  useEffect(() => {
    const fetchWorkshop = async () => {
      try {
        const response = await fetch(`/api/workshops/${params.id}`)
        const result = await response.json()
        
        if (result.success) {
          setWorkshop(result.data)
        } else {
          setError(result.error || 'Failed to fetch workshop')
        }
      } catch (error) {
        setError('Error fetching workshop details')
        console.error('Error fetching workshop:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchWorkshop()
    }
  }, [params.id])

  // Fetch risk and treatment data for meeting minutes items
  useEffect(() => {
    const fetchRiskAndTreatmentData = async () => {
      if (!workshop) return

      try {
        // Get all unique risk IDs from meeting minutes
        const riskIds = new Set<string>()
        ;(workshop.extensions || []).forEach(item => riskIds.add(item.riskId))
        ;(workshop.closure || []).forEach(item => riskIds.add(item.riskId))
        ;(workshop.newRisks || []).forEach(item => riskIds.add(item.riskId))

        if (riskIds.size === 0) return

        // Fetch risks data
        const risksResponse = await fetch('/api/risks')
        const risksResult = await risksResponse.json()
        
        if (risksResult.success) {
          const risksMap: Record<string, Risk> = {}
          risksResult.data.forEach((risk: Risk) => {
            if (riskIds.has(risk.riskId)) {
              risksMap[risk.riskId] = risk
            }
          })
          setRisks(risksMap)
        }

        // Fetch treatments data
        const treatmentsResponse = await fetch('/api/treatments')
        const treatmentsResult = await treatmentsResponse.json()
        
        if (treatmentsResult.success) {
          const treatmentsMap: Record<string, Treatment[]> = {}
          treatmentsResult.data.forEach((treatment: Treatment) => {
            if (riskIds.has(treatment.riskId)) {
              if (!treatmentsMap[treatment.riskId]) {
                treatmentsMap[treatment.riskId] = []
              }
              treatmentsMap[treatment.riskId].push(treatment)
            }
          })
          setTreatments(treatmentsMap)
        }
      } catch (error) {
        console.error('Error fetching risk and treatment data:', error)
      }
    }

    fetchRiskAndTreatmentData()
  }, [workshop])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800'
      case 'Finalising Meeting Minutes':
        return 'bg-blue-100 text-blue-800'
      case 'Scheduled':
        return 'bg-yellow-100 text-yellow-800'
      case 'Planned':
        return 'bg-purple-100 text-purple-800'
      case 'Pending Agenda':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    
    const day = date.getDate().toString().padStart(2, '0')
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    const year = date.getFullYear()
    return `${day} ${month} ${year}`
  }

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    
    const day = date.getDate().toString().padStart(2, '0')
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    const year = date.getFullYear()
    const time = date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
    return `${day} ${month} ${year} at ${time}`
  }

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/risk-management/workshops/${workshop?.id}`
    
    try {
      // Check if clipboard API is available
      if (!navigator.clipboard) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = url
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        showToast({
          type: 'success',
          title: 'Link copied!',
          message: 'Workshop link has been copied to clipboard'
        })
        return
      }

      await navigator.clipboard.writeText(url)
      showToast({
        type: 'success',
        title: 'Link copied!',
        message: 'Workshop link has been copied to clipboard'
      })
    } catch (error) {
      console.error('Failed to copy link:', error)
      showToast({
        type: 'error',
        title: 'Copy failed',
        message: 'Unable to copy link to clipboard. Please try again.'
      })
    }
  }

  const handleEdit = () => {
    router.push(`/risk-management/workshops/${workshop?.id}/edit`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#898AC4' }}></div>
          <p className="mt-4" style={{ color: '#22223B' }}>Loading workshop details...</p>
        </div>
      </div>
    )
  }

  if (error || !workshop) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <Icon name="alert-circle" className="w-5 h-5 text-red-400 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error || 'Workshop not found'}</p>
            </div>
          </div>
        </div>
        <Link
          href="/risk-management/workshops"
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          <Icon name="arrow-left" className="w-4 h-4 mr-2" />
          Back to Workshops
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Workshop Information Container */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/risk-management/workshops')}
              className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 hover:bg-gray-200 bg-white border border-gray-300"
              title="Back to Workshops"
            >
              <Icon name="arrow-left" size={16} />
            </button>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#22223B' }}>
                Risk Workshop - {workshop.id}
              </h1>
              <p className="text-gray-600" style={{ color: '#22223B' }}>
                {formatDate(workshop.date)} Meeting Minutes
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Copy link to workshop"
            >
              <Icon name="link" size={16} className="mr-2" />
              Copy Link
            </button>
            <button
              onClick={handleEdit}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-white rounded-lg transition-colors"
              style={{ backgroundColor: '#4C1D95' }}
              title="Edit workshop"
            >
              <Icon name="pencil" size={16} className="mr-2" />
              Edit
            </button>
          </div>
        </div>

        {/* Workshop Overview Section */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <div className="w-1 h-6 bg-purple-600 rounded-full mr-3"></div>
            <h3 className="text-lg font-semibold text-gray-900">Workshop Overview</h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-3 ${getStatusColor(workshop.status)}`}>
              {workshop.status}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium text-gray-900">Facilitator:</span>
                  <span className="text-gray-700 ml-1">
                    {workshop.facilitator}
                    {workshop.facilitatorPosition && (
                      <span className="text-gray-500 ml-1">({workshop.facilitatorPosition})</span>
                    )}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-gray-900">Participants:</span>
                  {workshop.participants.length > 0 ? (
                    <div className="mt-1 space-y-1">
                      {workshop.participants.map((participant, index) => {
                        // Handle both old string format and new object format
                        if (typeof participant === 'string') {
                          // Old format: "Name, Position" or just "Name"
                          const parts = participant.split(', ')
                          const name = parts[0]
                          const position = parts[1]
                          return (
                            <div key={index} className="text-gray-700 pl-2 border-l-2 border-gray-300">
                              {name}
                              {position && (
                                <span className="text-gray-500 ml-1">({position})</span>
                              )}
                            </div>
                          )
                        } else {
                          // New format: { name: string, position?: string }
                          return (
                            <div key={index} className="text-gray-700 pl-2 border-l-2 border-gray-300">
                              {participant.name}
                              {participant.position && (
                                <span className="text-gray-500 ml-1">({participant.position})</span>
                              )}
                            </div>
                          )
                        }
                      })}
                    </div>
                  ) : (
                    <span className="text-gray-500 italic ml-1">No participants listed</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Agenda</span>
              <div className="mt-2 space-y-2">
                <div className="text-sm text-gray-700">• Extensions of risk treatment due dates</div>
                <div className="text-sm text-gray-700">• Closure of risks and treatments</div>
                <div className="text-sm text-gray-700">• Discussion of newly identified risks</div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Summary</span>
              <div className="mt-1 text-sm font-medium text-gray-900">
                {workshop.extensions?.length || 0} extensions, {workshop.closure?.length || 0} closures, {workshop.newRisks?.length || 0} new risks
              </div>
            </div>
          </div>
        </div>

        {/* Meeting Minutes Section */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <div className="w-1 h-6 bg-purple-600 rounded-full mr-3"></div>
            <h3 className="text-lg font-semibold text-gray-900">Meeting Minutes</h3>
          </div>
          
          <div className="space-y-8">
            {/* Extensions Subsection */}
            <div>
              <h4 className="text-md font-semibold text-gray-800 mb-4">
                Extensions
              </h4>
              {workshop.extensions && workshop.extensions.length > 0 ? (
                <div className="space-y-4">
                  {workshop.extensions.map((item, index) => {
                    const risk = risks[item.riskId]
                    const allRiskTreatments = treatments[item.riskId] || []
                    
                    return (
                      <RiskCard
                        key={index}
                        item={item}
                        risk={risk}
                        treatments={allRiskTreatments}
                        sectionType="extensions"
                        onUpdate={(field, value) => updateRiskMinutes('extensions', index, field, value)}
                        onUpdateTreatment={(treatmentId, field, value) => updateTreatmentMinutes('extensions', index, treatmentId, field, value)}
                      />
                    )
                  })}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-500 italic text-center">No extensions recorded</p>
                </div>
              )}
            </div>

            {/* Closure Subsection */}
            <div>
              <h4 className="text-md font-semibold text-gray-800 mb-4">
                Closure
              </h4>
              {workshop.closure && workshop.closure.length > 0 ? (
                <div className="space-y-4">
                  {workshop.closure.map((item, index) => {
                    const risk = risks[item.riskId]
                    const allRiskTreatments = treatments[item.riskId] || []
                    
                    return (
                      <RiskCard
                        key={index}
                        item={item}
                        risk={risk}
                        treatments={allRiskTreatments}
                        sectionType="closure"
                        onUpdate={(field, value) => updateRiskMinutes('closure', index, field, value)}
                        onUpdateTreatment={(treatmentId, field, value) => updateTreatmentMinutes('closure', index, treatmentId, field, value)}
                      />
                    )
                  })}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-500 italic text-center">No closures recorded</p>
                </div>
              )}
            </div>

            {/* New Risks Subsection */}
            <div>
              <h4 className="text-md font-semibold text-gray-800 mb-4">
                New Risks
              </h4>
              {workshop.newRisks && workshop.newRisks.length > 0 ? (
                <div className="space-y-4">
                  {workshop.newRisks.map((item, index) => {
                    const risk = risks[item.riskId]
                    const allRiskTreatments = treatments[item.riskId] || []
                    
                    return (
                      <RiskCard
                        key={index}
                        item={item}
                        risk={risk}
                        treatments={allRiskTreatments}
                        sectionType="newRisks"
                        onUpdate={(field, value) => updateRiskMinutes('newRisks', index, field, value)}
                        onUpdateTreatment={(treatmentId, field, value) => updateTreatmentMinutes('newRisks', index, treatmentId, field, value)}
                      />
                    )
                  })}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-500 italic text-center">No new risks recorded</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Metadata Section */}
        <div>
          <div className="flex items-center mb-6">
            <div className="w-1 h-6 bg-purple-600 rounded-full mr-3"></div>
            <h3 className="text-lg font-semibold text-gray-900">Metadata</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Created</span>
              <div className="mt-1 text-sm font-medium text-gray-900">
                {workshop.createdAt ? formatDateTime(workshop.createdAt) : '-'}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Last Updated</span>
              <div className="mt-1 text-sm font-medium text-gray-900">
                {workshop.updatedAt ? formatDateTime(workshop.updatedAt) : '-'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Footer */}
      <div className="flex justify-between items-center pt-6">
        <Link
          href="/risk-management/workshops"
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          <Icon name="arrow-left" className="w-4 h-4 mr-2" />
          Back to Workshops
        </Link>
        
        <div className="flex space-x-3">
          <button
            onClick={handleEdit}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
            style={{ backgroundColor: '#4C1D95' }}
          >
            <Icon name="pencil" className="w-4 h-4 mr-2" />
            Edit Workshop
          </button>
        </div>
      </div>
    </div>
  )
} 