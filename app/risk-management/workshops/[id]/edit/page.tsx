'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Icon from '@/app/components/Icon'
import { useToast } from '@/app/components/Toast'

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
    actionsTaken: string
    toDo: string
    outcome: string
  }>
  closure?: Array<{
    riskId: string
    actionsTaken: string
    toDo: string
    outcome: string
  }>
  newRisks?: Array<{
    riskId: string
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
    actionsTaken: string
    toDo: string
    outcome: string
  }>
  closure: Array<{
    riskId: string
    actionsTaken: string
    toDo: string
    outcome: string
  }>
  newRisks: Array<{
    riskId: string
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
              }).filter(p => p.length > 0)
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
      // Convert participants back to proper format for API
      const apiFormData = {
        ...formData,
        participants: convertParticipantsToAPIFormat(formData.participants)
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

            {/* Meeting Minutes Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Icon name="document-text" size={16} className="mr-2 text-green-500" />
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
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                              <span className="text-xs text-gray-500 uppercase tracking-wide">Risk ID</span>
                              <div className="mt-1 text-sm font-medium text-gray-900">
                                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-md font-mono text-xs">
                                  {item.riskId}
                                </span>
                              </div>
                            </div>
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
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                              <span className="text-xs text-gray-500 uppercase tracking-wide">Risk ID</span>
                              <div className="mt-1 text-sm font-medium text-gray-900">
                                <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-md font-mono text-xs">
                                  {item.riskId}
                                </span>
                              </div>
                            </div>
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
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                              <span className="text-xs text-gray-500 uppercase tracking-wide">Risk ID</span>
                              <div className="mt-1 text-sm font-medium text-gray-900">
                                <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 rounded-md font-mono text-xs">
                                  {item.riskId}
                                </span>
                              </div>
                            </div>
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
    </div>
  )
} 