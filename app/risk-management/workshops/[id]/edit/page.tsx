'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Icon from '@/app/components/Icon'
import { useToast } from '@/app/components/Toast'
import Tooltip from '@/app/components/Tooltip'
import { MeetingMinutesItem } from '@/lib/workshop-validation'

interface Participant {
  name: string
  position?: string
}

type ParticipantData = string | Participant

// Type guards for participant data
const isParticipantObject = (participant: ParticipantData): participant is Participant => {
  return typeof participant === 'object' && participant !== null && 'name' in participant
}

const isParticipantString = (participant: ParticipantData): participant is string => {
  return typeof participant === 'string'
}

interface Risk {
  riskId: string
  riskStatement: string
  informationAsset: string
  likelihood: string
  impact: string
  riskRating: string
}

interface TreatmentExtension {
  extendedDueDate: string
  approver: string
  dateApproved: string
  justification: string
}

interface Treatment {
  treatmentId: string
  treatmentJira?: string
  riskId: string
  riskTreatment: string
  riskTreatmentOwner: string
  dateRiskTreatmentDue: string
  extendedDueDate?: string
  numberOfExtensions: number
  completionDate?: string
  closureApproval: string
  closureApprovedBy?: string
  extensions: TreatmentExtension[]
  createdAt: string
  updatedAt: string
}

type RiskCategory = 'extensions' | 'closure' | 'newRisk'

interface RiskSelection {
  riskId: string
  riskStatement: string
  treatments: string[]
  category: RiskCategory
}

interface Workshop {
  _id: string
  id: string
  date: string
  status: 'Pending Agenda' | 'Planned' | 'Scheduled' | 'Finalising Meeting Minutes' | 'Completed'
  facilitator: string
  facilitatorPosition?: string
  participants: ParticipantData[]
  risks: string[]
  notes?: string
  // Meeting Minutes subsections
  extensions?: Array<{
    riskId: string
    selectedTreatments?: string[]
    actionsTaken: string
    toDo: string
    outcome: string
  }>
  closure?: Array<{
    riskId: string
    selectedTreatments?: string[]
    actionsTaken: string
    toDo: string
    outcome: string
  }>
  newRisks?: Array<{
    riskId: string
    selectedTreatments?: string[]
    actionsTaken: string
    toDo: string
    outcome: string
  }>
  createdAt?: string
  updatedAt?: string
}

interface WorkshopFormData {
  date: string
  facilitator: string
  participants: string[]
  notes: string
  status: Workshop['status']
  extensions: Array<{
    riskId: string
    selectedTreatments?: string[]
    actionsTaken: string
    toDo: string
    outcome: string
  }>
  closure: Array<{
    riskId: string
    selectedTreatments?: string[]
    actionsTaken: string
    toDo: string
    outcome: string
  }>
  newRisks: Array<{
    riskId: string
    selectedTreatments?: string[]
    actionsTaken: string
    toDo: string
    outcome: string
  }>
}

export default function EditWorkshop() {
  const params = useParams()
  const router = useRouter()
  const { showToast } = useToast()
  const [workshop, setWorkshop] = useState<Workshop | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Risk selection state
  const [risks, setRisks] = useState<Risk[]>([])
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [selectedRiskId, setSelectedRiskId] = useState<string>('')
  const [selectedTreatments, setSelectedTreatments] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<RiskCategory>('extensions')
  const [loadingRisks, setLoadingRisks] = useState(false)
  const [loadingTreatments, setLoadingTreatments] = useState(false)
  const [showRiskModal, setShowRiskModal] = useState(false)
  const [selectedRisks, setSelectedRisks] = useState<RiskSelection[]>([])
  
  const [formData, setFormData] = useState<WorkshopFormData>({
    date: '',
    facilitator: '',
    participants: [],
    notes: '',
    status: 'Planned',
    extensions: [],
    closure: [],
    newRisks: []
  })

  // Helper function to truncate text
  const truncateText = (text: string, maxLength: number = 80) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  // Helper function to get category display name
  const getCategoryDisplayName = (category: RiskCategory) => {
    switch (category) {
      case 'extensions':
        return 'Extensions'
      case 'closure':
        return 'Closure'
      case 'newRisk':
        return 'New Risk'
      default:
        return category
    }
  }

  // Helper function to get category color
  const getCategoryColor = (category: RiskCategory) => {
    switch (category) {
      case 'extensions':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'closure':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'newRisk':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Helper function to get category icon
  const getCategoryIcon = (category: RiskCategory) => {
    switch (category) {
      case 'extensions':
        return 'hourglass-half'
      case 'closure':
        return 'check-circle'
      case 'newRisk':
        return 'exclamation-triangle'
      default:
        return 'exclamation-circle'
    }
  }

  useEffect(() => {
    const fetchWorkshop = async () => {
      try {
        const response = await fetch(`/api/workshops/${params.id}`)
        const result = await response.json()
        
        if (result.success) {
          const workshopData = result.data
          setWorkshop(workshopData)
          
          // Convert participants to string array if needed
          const participants = Array.isArray(workshopData.participants) 
            ? workshopData.participants.map((p: ParticipantData) => {
                if (isParticipantString(p)) {
                  return p
                } else if (isParticipantObject(p)) {
                  return `${p.name}${p.position ? `, ${p.position}` : ''}`
                }
                return ''
              }).filter((p: string) => p.length > 0)
            : []
          
          setFormData({
            date: workshopData.date || '',
            facilitator: workshopData.facilitator || '',
            participants: participants,
            notes: workshopData.notes || '',
            status: workshopData.status || 'Planned',
            extensions: workshopData.extensions || [],
            closure: workshopData.closure || [],
            newRisks: workshopData.newRisks || []
          })
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

  // Fetch risks on component mount
  useEffect(() => {
    const fetchRisks = async () => {
      setLoadingRisks(true)
      try {
        const response = await fetch('/api/risks')
        const result = await response.json()
        
        if (result.success) {
          setRisks(result.data)
        } else {
          showToast({
            type: 'error',
            title: 'Error',
            message: 'Failed to fetch risks'
          })
        }
      } catch (error) {
        console.error('Error fetching risks:', error)
        showToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to fetch risks'
        })
      } finally {
        setLoadingRisks(false)
      }
    }

    fetchRisks()
  }, [showToast])

  // Fetch treatments when a risk is selected
  useEffect(() => {
    const fetchTreatments = async () => {
      if (!selectedRiskId) {
        setTreatments([])
        return
      }

      setLoadingTreatments(true)
      try {
        const response = await fetch(`/api/treatments?riskId=${selectedRiskId}`)
        const result = await response.json()
        
        if (result.success) {
          setTreatments(result.data)
        } else {
          setTreatments([])
        }
      } catch (error) {
        console.error('Error fetching treatments:', error)
        setTreatments([])
      } finally {
        setLoadingTreatments(false)
      }
    }

    fetchTreatments()
  }, [selectedRiskId])

  const handleInputChange = (field: keyof WorkshopFormData, value: string | string[] | Workshop['status']) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleArrayInputChange = (field: 'participants', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item.length > 0)
    setFormData(prev => ({
      ...prev,
      [field]: items
    }))
  }

  const handleMeetingMinutesChange = (
    section: 'extensions' | 'closure' | 'newRisks',
    index: number,
    field: 'actionsTaken' | 'toDo' | 'outcome',
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  // Risk selection handlers
  const handleRiskSelection = (riskId: string) => {
    setSelectedRiskId(riskId)
    setSelectedTreatments([])
  }

  const handleTreatmentSelection = (treatmentId: string, checked: boolean) => {
    setSelectedTreatments(prev => 
      checked 
        ? [...prev, treatmentId]
        : prev.filter(t => t !== treatmentId)
    )
  }

  const addSelectedRiskToWorkshop = () => {
    if (!selectedRiskId || selectedTreatments.length === 0) {
      showToast({
        type: 'error',
        title: 'Selection Required',
        message: 'Please select a risk and at least one treatment'
      })
      return
    }

    const selectedRisk = risks.find(r => r.riskId === selectedRiskId)
    if (!selectedRisk) return

    const newRiskSelection: RiskSelection = {
      riskId: selectedRisk.riskId,
      riskStatement: selectedRisk.riskStatement,
      treatments: selectedTreatments,
      category: selectedCategory
    }

    setSelectedRisks(prev => [...prev, newRiskSelection])
    
    // Reset selection
    setSelectedRiskId('')
    setSelectedTreatments([])
    setSelectedCategory('extensions')
    
    showToast({
      type: 'success',
      title: 'Risk Added',
      message: `${selectedRisk.riskId} has been added to the workshop agenda`
    })
  }

  const removeRiskFromWorkshop = (index: number) => {
    const riskToRemove = selectedRisks[index]
    setSelectedRisks(prev => prev.filter((_, i) => i !== index))
    
    showToast({
      type: 'success',
      title: 'Risk Removed',
      message: `${riskToRemove.riskId} has been removed from the workshop agenda`
    })
  }

  const isValidRiskSelection = (obj: unknown): obj is RiskSelection => {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'riskId' in obj &&
      'riskStatement' in obj &&
      'treatments' in obj &&
      'category' in obj &&
      typeof (obj as RiskSelection).riskId === 'string' &&
      typeof (obj as RiskSelection).riskStatement === 'string' &&
      Array.isArray((obj as RiskSelection).treatments) &&
      typeof (obj as RiskSelection).category === 'string'
    )
  }

  const removeMeetingMinutesItem = (section: 'extensions' | 'closure' | 'newRisks', index: number) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }))
    
    showToast({
      type: 'success',
      title: 'Item Removed',
      message: 'Risk has been removed from the meeting minutes'
    })
  }

  const validateForm = (): boolean => {
    if (!formData.date || !formData.facilitator) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Date and facilitator are required fields'
      })
      return false
    }
    return true
  }

  // Helper function to convert string participants back to proper format
  const convertParticipantsToAPIFormat = (participants: string[]): ParticipantData[] => {
    return participants.map(participant => {
      const parts = participant.split(', ')
      if (parts.length > 1) {
        return {
          name: parts[0].trim(),
          position: parts.slice(1).join(', ').trim()
        }
      }
      return participant.trim()
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setSaving(true)

    try {
      // Process selected risks into meeting minutes format
      const extensions: MeetingMinutesItem[] = []
      const closure: MeetingMinutesItem[] = []
      const newRisks: MeetingMinutesItem[] = []

      selectedRisks.forEach(riskSelection => {
        const riskData: MeetingMinutesItem = {
          riskId: riskSelection.riskId,
          actionsTaken: '',
          toDo: '',
          outcome: ''
        }

        switch (riskSelection.category) {
          case 'extensions':
            extensions.push(riskData)
            break
          case 'closure':
            closure.push(riskData)
            break
          case 'newRisk':
            newRisks.push(riskData)
            break
        }
      })

      // Merge with existing meeting minutes data
      const mergedExtensions = [...formData.extensions, ...extensions]
      const mergedClosure = [...formData.closure, ...closure]
      const mergedNewRisks = [...formData.newRisks, ...newRisks]

      // Convert participants back to proper format for API
      const apiFormData = {
        ...formData,
        participants: convertParticipantsToAPIFormat(formData.participants),
        extensions: mergedExtensions,
        closure: mergedClosure,
        newRisks: mergedNewRisks
      }

      const response = await fetch(`/api/workshops/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiFormData),
      })

      const result = await response.json()

      if (result.success) {
        showToast({
          type: 'success',
          title: 'Workshop Updated',
          message: `Workshop ${workshop?.id} has been updated successfully`
        })
        
        // Navigate immediately back to the workshop details page
        router.push(`/risk-management/workshops/${workshop?.id}`)
      } else {
        showToast({
          type: 'error',
          title: 'Update Failed',
          message: result.error || 'Failed to update workshop. Please try again.'
        })
      }
    } catch (error) {
      console.error('Error updating workshop:', error)
      showToast({
        type: 'error',
        title: 'Network Error',
        message: 'An error occurred while updating the workshop. Please check your connection and try again.'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.push(`/risk-management/workshops/${workshop?.id}`)
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link
                href={`/risk-management/workshops/${workshop.id}`}
                className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Icon name="arrow-left" size={16} className="mr-2" />
                Back to Workshop
              </Link>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Edit Workshop {workshop.id}</h1>
          </div>
          <p className="mt-2 text-gray-600">Update workshop details and meeting minutes</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Basic Information Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Icon name="information-circle" size={16} className="mr-2 text-blue-500" />
                Basic Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date */}
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                    Workshop Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-purple-500 focus:ring-purple-500 transition-colors"
                  />
                </div>

                {/* Facilitator */}
                <div>
                  <label htmlFor="facilitator" className="block text-sm font-medium text-gray-700 mb-2">
                    Facilitator <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="facilitator"
                    value={formData.facilitator}
                    onChange={(e) => handleInputChange('facilitator', e.target.value)}
                    placeholder="Enter facilitator name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-purple-500 focus:ring-purple-500 transition-colors"
                  />
                </div>

                {/* Status */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-purple-500 focus:ring-purple-500 transition-colors"
                  >
                    <option value="Pending Agenda">Pending Agenda</option>
                    <option value="Planned">Planned</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Finalising Meeting Minutes">Finalising Meeting Minutes</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                {/* Participants */}
                <div>
                  <label htmlFor="participants" className="block text-sm font-medium text-gray-700 mb-2">
                    Participants
                  </label>
                  <input
                    type="text"
                    id="participants"
                    value={formData.participants.join(', ')}
                    onChange={(e) => handleArrayInputChange('participants', e.target.value)}
                    placeholder="Enter participant names separated by commas"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-purple-500 focus:ring-purple-500 transition-colors"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="mt-6">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional notes or observations about the workshop"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-purple-500 focus:ring-purple-500 transition-colors resize-none"
                />
              </div>
            </div>

            {/* Risk Selection Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Icon name="exclamation-triangle" size={16} className="mr-2 text-orange-500" />
                Add Risks to Agenda
              </h2>
              
              {/* Risk Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Select a risk to add to the agenda:
                </label>
                <button
                  type="button"
                  onClick={() => setShowRiskModal(true)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-left focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-purple-500 focus:ring-purple-500 transition-colors hover:bg-gray-50"
                >
                  {selectedRiskId ? (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-900">
                        {risks.find(r => r.riskId === selectedRiskId)?.riskId} - {truncateText(risks.find(r => r.riskId === selectedRiskId)?.riskStatement || '')}
                      </span>
                      <Icon name="chevron-right" size={16} className="text-gray-400" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Choose a risk...</span>
                      <Icon name="chevron-right" size={16} className="text-gray-400" />
                    </div>
                  )}
                </button>
              </div>

              {/* Treatment Selection */}
              {selectedRiskId && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Treatments for selected risk:
                  </h3>
                  {loadingTreatments ? (
                    <div className="flex items-center text-sm text-gray-600">
                      <Icon name="arrow-clockwise" size={14} className="mr-2 animate-spin" />
                      Loading treatments...
                    </div>
                  ) : treatments.length === 0 ? (
                    <p className="text-sm text-gray-500">No treatments found for this risk.</p>
                  ) : (
                    <div className="space-y-2">
                      {treatments.map(treatment => (
                        <div key={treatment.treatmentId} className="flex items-start">
                          <input
                            type="checkbox"
                            id={`treatment-${selectedRiskId}-${treatment.treatmentId}`}
                            checked={selectedTreatments.includes(treatment.treatmentId)}
                            onChange={(e) => handleTreatmentSelection(treatment.treatmentId, e.target.checked)}
                            className="mt-1 mr-3"
                          />
                          <div className="flex-1">
                            <label htmlFor={`treatment-${selectedRiskId}-${treatment.treatmentId}`} className="text-sm text-gray-700 cursor-pointer">
                              <div className="font-medium text-gray-900">{treatment.treatmentId}</div>
                              <div className="text-gray-700">{treatment.riskTreatment}</div>
                            </label>
                            <div className="flex items-center mt-1 space-x-4 text-xs text-gray-500">
                              <span>Owner: {treatment.riskTreatmentOwner}</span>
                              <span>Status: {treatment.closureApproval}</span>
                              <span>Due: {treatment.extendedDueDate || treatment.dateRiskTreatmentDue}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Category Selection */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category for this risk:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['extensions', 'closure', 'newRisk'] as RiskCategory[]).map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => setSelectedCategory(category)}
                          className={`flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                            selectedCategory === category
                              ? getCategoryColor(category)
                              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <Icon name={getCategoryIcon(category)} size={14} className="mr-2" />
                          {getCategoryDisplayName(category)}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={addSelectedRiskToWorkshop}
                    disabled={selectedTreatments.length === 0}
                    className="mt-4 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Icon name="plus" size={14} className="mr-2" />
                    Add Risk to Agenda
                  </button>
                </div>
              )}

              {/* Selected Risks Display */}
              {selectedRisks.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Risks added to agenda:
                  </h3>
                  <div className="space-y-2">
                    {selectedRisks.map((risk, index) => (
                      <div key={`${risk.riskId}-${index}`} className="flex items-start justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            <span className="text-sm font-medium text-gray-900">{risk.riskId}</span>
                            <span className="ml-2 text-xs text-gray-500">({risk.treatments.length} treatments)</span>
                            <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(risk.category)}`}>
                              <Icon name={getCategoryIcon(risk.category)} size={10} className="mr-1" />
                              {getCategoryDisplayName(risk.category)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{risk.riskStatement}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeRiskFromWorkshop(index)}
                          className="ml-3 text-red-500 hover:text-red-700 transition-colors"
                          title="Remove risk from agenda"
                        >
                          <Icon name="x-mark" size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

                         {/* Meeting Minutes Section */}
             <div>
               <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                 <Icon name="people-group" size={16} className="mr-2 text-green-500" />
                 Meeting Minutes
               </h2>
              
              <div className="space-y-8">
                {/* Extensions */}
                <div>
                  <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                    <Icon name="hourglass-half" size={14} className="mr-2 text-blue-500" />
                    Extensions
                  </h3>
                  {formData.extensions.length > 0 ? (
                    <div className="space-y-4">
                      {formData.extensions.map((item, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-start justify-between mb-3">
                            <span className="text-xs text-gray-500 uppercase tracking-wide">Risk ID: {item.riskId}</span>
                            <button
                              type="button"
                              onClick={() => removeMeetingMinutesItem('extensions', index)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                              title="Remove from extensions"
                            >
                              <Icon name="x-mark" size={16} />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                              <label className="text-xs text-gray-500 uppercase tracking-wide">Actions Taken</label>
                              <textarea
                                value={item.actionsTaken}
                                onChange={(e) => handleMeetingMinutesChange('extensions', index, 'actionsTaken', e.target.value)}
                                className="mt-1 w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                rows={2}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 uppercase tracking-wide">To Do</label>
                              <textarea
                                value={item.toDo}
                                onChange={(e) => handleMeetingMinutesChange('extensions', index, 'toDo', e.target.value)}
                                className="mt-1 w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                rows={2}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 uppercase tracking-wide">Outcome</label>
                              <textarea
                                value={item.outcome}
                                onChange={(e) => handleMeetingMinutesChange('extensions', index, 'outcome', e.target.value)}
                                className="mt-1 w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                rows={2}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-sm text-gray-500 italic text-center">No extensions recorded</p>
                    </div>
                  )}
                </div>

                {/* Closure */}
                <div>
                  <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                    <Icon name="check-circle" size={14} className="mr-2 text-green-500" />
                    Closure
                  </h3>
                  {formData.closure.length > 0 ? (
                    <div className="space-y-4">
                      {formData.closure.map((item, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-start justify-between mb-3">
                            <span className="text-xs text-gray-500 uppercase tracking-wide">Risk ID: {item.riskId}</span>
                            <button
                              type="button"
                              onClick={() => removeMeetingMinutesItem('closure', index)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                              title="Remove from closure"
                            >
                              <Icon name="x-mark" size={16} />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                              <label className="text-xs text-gray-500 uppercase tracking-wide">Actions Taken</label>
                              <textarea
                                value={item.actionsTaken}
                                onChange={(e) => handleMeetingMinutesChange('closure', index, 'actionsTaken', e.target.value)}
                                className="mt-1 w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                                rows={2}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 uppercase tracking-wide">To Do</label>
                              <textarea
                                value={item.toDo}
                                onChange={(e) => handleMeetingMinutesChange('closure', index, 'toDo', e.target.value)}
                                className="mt-1 w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                                rows={2}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 uppercase tracking-wide">Outcome</label>
                              <textarea
                                value={item.outcome}
                                onChange={(e) => handleMeetingMinutesChange('closure', index, 'outcome', e.target.value)}
                                className="mt-1 w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                                rows={2}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-sm text-gray-500 italic text-center">No closures recorded</p>
                    </div>
                  )}
                </div>

                {/* New Risks */}
                <div>
                  <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                    <Icon name="exclamation-triangle" size={14} className="mr-2 text-orange-500" />
                    New Risks
                  </h3>
                  {formData.newRisks.length > 0 ? (
                    <div className="space-y-4">
                      {formData.newRisks.map((item, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-start justify-between mb-3">
                            <span className="text-xs text-gray-500 uppercase tracking-wide">Risk ID: {item.riskId}</span>
                            <button
                              type="button"
                              onClick={() => removeMeetingMinutesItem('newRisks', index)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                              title="Remove from new risks"
                            >
                              <Icon name="x-mark" size={16} />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                              <label className="text-xs text-gray-500 uppercase tracking-wide">Actions Taken</label>
                              <textarea
                                value={item.actionsTaken}
                                onChange={(e) => handleMeetingMinutesChange('newRisks', index, 'actionsTaken', e.target.value)}
                                className="mt-1 w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                                rows={2}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 uppercase tracking-wide">To Do</label>
                              <textarea
                                value={item.toDo}
                                onChange={(e) => handleMeetingMinutesChange('newRisks', index, 'toDo', e.target.value)}
                                className="mt-1 w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                                rows={2}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 uppercase tracking-wide">Outcome</label>
                              <textarea
                                value={item.outcome}
                                onChange={(e) => handleMeetingMinutesChange('newRisks', index, 'outcome', e.target.value)}
                                className="mt-1 w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                                rows={2}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-sm text-gray-500 italic text-center">No new risks recorded</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? (
                  <div className="flex items-center">
                    <Icon name="arrow-clockwise" size={14} className="mr-2 animate-spin" />
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Icon name="check" size={14} className="mr-2" />
                    Save Changes
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Risk Selection Modal */}
      {showRiskModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden border border-gray-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Select Risk to Add to Agenda</h2>
              <button
                type="button"
                onClick={() => setShowRiskModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="x-mark" size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {loadingRisks ? (
                <div className="flex items-center justify-center py-8">
                  <Icon name="arrow-clockwise" size={20} className="mr-3 animate-spin" />
                  <span className="text-gray-600">Loading risks...</span>
                </div>
              ) : risks.length === 0 ? (
                <div className="text-center py-8">
                  <Icon name="exclamation-triangle" size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No risks available. Add some risks in the risk management section.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {risks.map(risk => (
                    <div
                      key={risk.riskId}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedRiskId === risk.riskId
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        handleRiskSelection(risk.riskId)
                        setShowRiskModal(false)
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className="text-sm font-semibold text-gray-900 mr-3">{risk.riskId}</span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              risk.riskRating === 'High' ? 'bg-red-100 text-red-800' :
                              risk.riskRating === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {risk.riskRating}
                            </span>
                          </div>
                          <Tooltip content={risk.riskStatement}>
                            <p className="text-sm text-gray-700 mb-2">
                              {truncateText(risk.riskStatement, 100)}
                            </p>
                          </Tooltip>
                          <div className="flex items-center text-xs text-gray-500 space-x-4">
                            <span>Asset: {Array.isArray(risk.informationAsset) 
                  ? risk.informationAsset.map((asset: any) => asset.name || asset.id || asset).join(', ')
                  : risk.informationAsset}</span>
                            <span>Likelihood: {risk.likelihood}</span>
                            <span>Impact: {risk.impact}</span>
                          </div>
                        </div>
                        <Icon 
                          name="chevron-right" 
                          size={16} 
                          className={`ml-3 transition-colors ${
                            selectedRiskId === risk.riskId ? 'text-purple-600' : 'text-gray-400'
                          }`} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowRiskModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 