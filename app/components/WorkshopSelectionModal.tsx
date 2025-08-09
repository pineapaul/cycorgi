'use client'

import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/app/components/Toast'
import Modal, { ModalBody, ModalFooter } from './Modal'
import Icon from './Icon'

interface Workshop {
  _id: string
  id: string
  date: string
  facilitator: string
  status: string
  securitySteeringCommittee?: string
}

interface Risk {
  riskId: string
  currentPhase: string
}

interface Treatment {
  _id: string
  treatmentId: string
  riskId: string
  riskTreatment: string
  riskTreatmentOwner: string
  dateRiskTreatmentDue: string
  closureApproval: string
}

interface WorkshopSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  risk: Risk | null
  treatment?: {
    treatmentId: string
    riskId: string
  }
}

type TopicType = 'extensions' | 'closure' | 'newRisks'

const TOPIC_OPTIONS = [
  { value: 'extensions' as TopicType, label: 'Extensions', description: 'Extend treatment timelines' },
  { value: 'closure' as TopicType, label: 'Closure', description: 'Close completed treatments' },
  { value: 'newRisks' as TopicType, label: 'New Risks', description: 'Discuss new risk identification' }
]

const SELECTABLE_STATUSES = ['Planned', 'Scheduled', 'Pending Agenda']

export default function WorkshopSelectionModal({ isOpen, onClose, risk, treatment }: WorkshopSelectionModalProps) {
  const { showToast } = useToast()
  
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedWorkshop, setSelectedWorkshop] = useState<string>('')
  const [selectedTopic, setSelectedTopic] = useState<TopicType>('newRisks')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [selectedTreatments, setSelectedTreatments] = useState<Set<string>>(new Set())
  const [loadingTreatments, setLoadingTreatments] = useState(false)

  // Fetch workshops when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchWorkshops()
    }
  }, [isOpen])

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedWorkshop('')
      setSelectedTopic('newRisks')
      setSelectedTreatments(new Set())
      setTreatments([])
      setError(null)
    }
  }, [isOpen])

  const fetchWorkshops = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/workshops')
      const result = await response.json()
      
      if (result.success) {
        // Filter workshops to only show selectable ones with future dates
        const currentDate = new Date()
        currentDate.setHours(0, 0, 0, 0) // Set to start of today for comparison
        
        const selectableWorkshops = result.data.filter(
          (workshop: Workshop) => {
            // Check if status is selectable
            const hasValidStatus = SELECTABLE_STATUSES.includes(workshop.status)
            
            // Check if date is in the future
            const workshopDate = new Date(workshop.date)
            const isFutureDate = workshopDate >= currentDate
            
            return hasValidStatus && isFutureDate
          }
        )
        setWorkshops(selectableWorkshops)
      } else {
        setError(result.error || 'Failed to fetch workshops')
      }
    } catch (err) {
      setError('Network error: Failed to fetch workshops')
      console.error('Error fetching workshops:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchTreatments = useCallback(async () => {
    if (!risk) return
    
    setLoadingTreatments(true)
    
    try {
      const response = await fetch(`/api/treatments/${risk.riskId}`)
      const result = await response.json()
      
      if (result.success) {
        // Filter treatments to only show those with "Pending" closure approval
        const pendingTreatments = result.data.filter(
          (treatment: Treatment) => treatment.closureApproval === 'Pending'
        )
        setTreatments(pendingTreatments)
      } else {
        console.error('Failed to fetch treatments:', result.error)
      }
    } catch (err) {
      console.error('Error fetching treatments:', err)
    } finally {
      setLoadingTreatments(false)
    }
  }, [risk])

  // Fetch treatments when topic changes to extensions or closure
  useEffect(() => {
    if (isOpen && risk && (selectedTopic === 'extensions' || selectedTopic === 'closure')) {
      fetchTreatments()
    } else {
      setTreatments([])
      setSelectedTreatments(new Set())
    }
  }, [isOpen, risk, selectedTopic, fetchTreatments])

  const getAvailableTopics = (): TopicType[] => {
    if (!risk) return []
    
    const phase = risk.currentPhase.toLowerCase()
    
    // Risks in "Treatment" can be added to extensions and closure, but NOT as new risks
    if (phase === 'treatment') {
      return ['extensions', 'closure']
    }
    
    // Risks in "Monitoring" can be added to extensions and closure, but NOT as new risks
    if (phase === 'monitoring') {
      return ['extensions', 'closure']
    }
    
    // All other phases (Identification, Analysis, Evaluation, etc.) can only be added as new risks
    return ['newRisks']
  }

  const handleSubmit = async () => {
    if (!selectedWorkshop || !selectedTopic || !risk) {
      showToast({
        type: 'error',
        title: 'Please select both a workshop and topic'
      })
      return
    }

    // For extensions and closure, require treatment selection (unless we already have a specific treatment)
    if ((selectedTopic === 'extensions' || selectedTopic === 'closure') && !treatment && selectedTreatments.size === 0) {
      showToast({
        type: 'error',
        title: 'Please select at least one treatment',
        message: 'Treatments must be selected for extension or closure topics.'
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      const requestBody: any = {
        riskId: risk.riskId,
        topic: selectedTopic
      }

      // Add selected treatments for extensions/closure
      if (selectedTopic === 'extensions' || selectedTopic === 'closure') {
        if (treatment) {
          // When we have a specific treatment, use that treatment ID
          requestBody.selectedTreatments = [treatment.treatmentId]
        } else {
          // When selecting from multiple treatments, use the selected ones
          requestBody.selectedTreatments = Array.from(selectedTreatments)
        }
      }

      const response = await fetch(`/api/workshops/${selectedWorkshop}/agenda`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      const result = await response.json()
      
      if (result.success) {
        const entityType = treatment ? 'Treatment' : 'Risk'
        const entityId = treatment ? treatment.treatmentId : risk.riskId
        showToast({
          type: 'success',
          title: `${entityType} ${entityId} added to workshop agenda!`,
          message: `Added to ${selectedTopic} section of the workshop.`
        })
        onClose()
      } else {
        showToast({
          type: 'error',
          title: 'Failed to add risk to workshop',
          message: result.error || 'An error occurred'
        })
      }
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Failed to add risk to workshop',
        message: 'Network error occurred'
      })
      console.error('Error adding risk to workshop:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-AU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Planned':
        return 'bg-blue-100 text-blue-800'
      case 'Scheduled':
        return 'bg-green-100 text-green-800'
      case 'Pending Agenda':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const availableTopics = getAvailableTopics()

  const modalTitle = treatment ? "Add Treatment to Workshop Agenda" : "Add Risk to Workshop Agenda"
  const modalSubtitle = treatment 
    ? `Treatment ID: ${treatment.treatmentId} • Risk ID: ${treatment.riskId}`
    : risk 
      ? `Risk ID: ${risk.riskId} • Phase: ${risk.currentPhase}`
      : undefined

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      subtitle={modalSubtitle}
      maxWidth="2xl"
    >
      <ModalBody>
          {/* Topic Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Topic Category
            </label>
            <div className="space-y-2">
              {TOPIC_OPTIONS.map((option) => {
                const isAvailable = availableTopics.includes(option.value)
                return (
                  <label
                    key={option.value}
                    className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      isAvailable
                        ? selectedTopic === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <input
                      type="radio"
                      name="topic"
                      value={option.value}
                      checked={selectedTopic === option.value}
                      onChange={(e) => setSelectedTopic(e.target.value as TopicType)}
                      disabled={!isAvailable}
                      className="mt-1 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{option.label}</div>
                      <div className="text-sm text-gray-600">{option.description}</div>
                      {!isAvailable && (
                        <div className="text-xs text-red-600 mt-1">
                          Not available for {risk?.currentPhase} phase risks
                        </div>
                      )}
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Treatment Selection for Extensions/Closure */}
          {(selectedTopic === 'extensions' || selectedTopic === 'closure') && !treatment && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Treatments
              </label>
              
              {loadingTreatments && (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Loading treatments...</span>
                </div>
              )}

              {!loadingTreatments && treatments.length === 0 && (
                <div className="text-center py-4">
                  <div className="text-gray-400 mb-2">
                    <Icon name="exclamation-triangle" size={20} />
                  </div>
                  <p className="text-gray-600 text-sm">No pending treatments available.</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Only treatments with &quot;Pending&quot; closure approval can be selected.
                  </p>
                </div>
              )}

              {!loadingTreatments && treatments.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {treatments.map((treatment) => (
                    <label
                      key={treatment._id}
                      className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedTreatments.has(treatment.treatmentId)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedTreatments.has(treatment.treatmentId)}
                        onChange={(e) => {
                          const newSelected = new Set(selectedTreatments)
                          if (e.target.checked) {
                            newSelected.add(treatment.treatmentId)
                          } else {
                            newSelected.delete(treatment.treatmentId)
                          }
                          setSelectedTreatments(newSelected)
                        }}
                        className="mt-1 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900">{treatment.treatmentId}</div>
                        <div className="text-sm text-gray-600 mt-1">{treatment.riskTreatment}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Assigned to: {treatment.riskTreatmentOwner} | Due: {treatment.dateRiskTreatmentDue}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Workshop Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Workshop
            </label>
            
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading workshops...</span>
              </div>
            )}

            {error && (
              <div className="text-center py-8">
                <div className="text-red-500 mb-2">
                  <Icon name="exclamation-triangle" size={24} />
                </div>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={fetchWorkshops}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {!loading && !error && (
              <>
                {workshops.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-2">
                      <Icon name="calendar" size={24} />
                    </div>
                    <p className="text-gray-600">No workshops available for selection.</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Only workshops with status &quot;Planned&quot;, &quot;Scheduled&quot;, or &quot;Pending Agenda&quot; and future dates can be selected.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {workshops.map((workshop) => (
                      <label
                        key={workshop._id}
                        className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                          selectedWorkshop === workshop._id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="workshop"
                          value={workshop._id}
                          checked={selectedWorkshop === workshop._id}
                          onChange={(e) => setSelectedWorkshop(e.target.value)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-900">
                                Workshop {workshop.id}
                              </div>
                              <div className="text-sm text-gray-600">
                                {formatDate(workshop.date)}
                                {workshop.facilitator && (
                                  <span className="mx-2">•</span>
                                )}
                                {workshop.facilitator && (
                                  <span>Facilitator: {workshop.facilitator}</span>
                                )}
                              </div>
                              {workshop.securitySteeringCommittee && (
                                <div className="text-xs text-gray-500 mt-1">
                                  SSC: {workshop.securitySteeringCommittee}
                                </div>
                              )}
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(workshop.status)}`}>
                              {workshop.status}
                            </span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </ModalBody>

        <ModalFooter>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              !selectedWorkshop || 
              !selectedTopic || 
              isSubmitting || 
              workshops.length === 0 ||
              ((selectedTopic === 'extensions' || selectedTopic === 'closure') && !treatment && selectedTreatments.size === 0)
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSubmitting && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            )}
            {isSubmitting ? 'Adding...' : 'Add to Workshop'}
          </button>
        </ModalFooter>
    </Modal>
  )
}
