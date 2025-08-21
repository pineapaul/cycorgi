'use client'

import { useState, useEffect, useRef } from 'react'
import Icon from './Icon'
import { useToast } from './Toast'

interface IncidentFormData {
  incidentId: string
  functionalUnit: string
  status: string
  dateRaised: string
  raisedBy: string
  location: string
  priority: string
  incidentJiraTicket: string
  informationAsset: string
  description: string
  rootCause: string
  rootCauseCategory: string
  assignedTo: string
  actionTaken: string
  completionDate: string
  dateApprovedForClosure: string
}

interface IncidentFormErrors {
  [key: string]: string
}

interface Incident {
  id: string
  incidentId: string
  functionalUnit: string
  status: string
  dateRaised: string
  raisedBy: string
  location: string
  priority: string
  incidentJiraTicket: string
  informationAsset: string
  description: string
  rootCause: string
  rootCauseCategory: string
  assignedTo: string
  actionTaken: string
  completionDate: string
  dateApprovedForClosure: string
}

const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Critical']
const STATUS_OPTIONS = ['Open', 'Under Investigation', 'Resolved', 'Closed']
const ROOT_CAUSE_CATEGORIES = [
  'Human Error',
  'System Failure',
  'Malicious Activity',
  'Natural Disaster',
  'Third Party',
  'Other'
]

interface EditIncidentModalProps {
  isOpen: boolean
  onClose: () => void
  incident: Incident | null
  onIncidentUpdated?: () => void
}

export function EditIncidentModal({ isOpen, onClose, incident, onIncidentUpdated }: EditIncidentModalProps) {
  const [formData, setFormData] = useState<IncidentFormData>({
    incidentId: '',
    functionalUnit: '',
    status: '',
    dateRaised: '',
    raisedBy: '',
    location: '',
    priority: '',
    incidentJiraTicket: '',
    informationAsset: '',
    description: '',
    rootCause: '',
    rootCauseCategory: '',
    assignedTo: '',
    actionTaken: '',
    completionDate: '',
    dateApprovedForClosure: ''
  })
  const [errors, setErrors] = useState<IncidentFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const { showToast } = useToast()

  useEffect(() => {
    if (incident && isOpen) {
      setFormData({
        incidentId: incident.incidentId || '',
        functionalUnit: incident.functionalUnit || '',
        status: incident.status || '',
        dateRaised: incident.dateRaised || '',
        raisedBy: incident.raisedBy || '',
        location: incident.location || '',
        priority: incident.priority || '',
        incidentJiraTicket: incident.incidentJiraTicket || '',
        informationAsset: incident.informationAsset || '',
        description: incident.description || '',
        rootCause: incident.rootCause || '',
        rootCauseCategory: incident.rootCauseCategory || '',
        assignedTo: incident.assignedTo || '',
        actionTaken: incident.actionTaken || '',
        completionDate: incident.completionDate || '',
        dateApprovedForClosure: incident.dateApprovedForClosure || ''
      })
      setErrors({})
    }
  }, [incident, isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const validateForm = (): boolean => {
    const newErrors: IncidentFormErrors = {}

    if (!formData.incidentId.trim()) {
      newErrors.incidentId = 'Incident ID is required'
    }
    if (!formData.functionalUnit.trim()) {
      newErrors.functionalUnit = 'Functional Unit is required'
    }
    if (!formData.status.trim()) {
      newErrors.status = 'Status is required'
    }
    if (!formData.dateRaised.trim()) {
      newErrors.dateRaised = 'Date Raised is required'
    }
    if (!formData.raisedBy.trim()) {
      newErrors.raisedBy = 'Raised By is required'
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required'
    }
    if (!formData.priority.trim()) {
      newErrors.priority = 'Priority is required'
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof IncidentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !incident) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/incidents/${incident.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        showToast({
          type: 'success',
          title: 'Incident Updated',
          message: 'The incident has been successfully updated.'
        })
        onIncidentUpdated?.()
        onClose()
      } else {
        throw new Error('Failed to update incident')
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update the incident. Please try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleTabKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      
      if (focusableElements) {
        const firstElement = focusableElements[0] as HTMLElement
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }
    }
  }

  if (!isOpen || !incident) return null

  return (
    <div
      className="fixed inset-0 backdrop-blur-lg flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onKeyDown={handleTabKey}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
              Edit Incident {incident.incidentId}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Update information security incident details
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors"
            title="Close"
            aria-label="Close edit incident form"
          >
            <Icon name="close" size={16} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-4">Basic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="incidentId" className="block text-sm font-medium text-gray-700 mb-2">
                  Incident ID *
                </label>
                <input
                  type="text"
                  id="incidentId"
                  value={formData.incidentId}
                  onChange={(e) => handleInputChange('incidentId', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.incidentId ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., INC-2024-001"
                />
                {errors.incidentId && (
                  <p className="mt-1 text-sm text-red-600">{errors.incidentId}</p>
                )}
              </div>

              <div>
                <label htmlFor="functionalUnit" className="block text-sm font-medium text-gray-700 mb-2">
                  Functional Unit *
                </label>
                <input
                  type="text"
                  id="functionalUnit"
                  value={formData.functionalUnit}
                  onChange={(e) => handleInputChange('functionalUnit', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.functionalUnit ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., IT, HR, Finance"
                />
                {errors.functionalUnit && (
                  <p className="mt-1 text-sm text-red-600">{errors.functionalUnit}</p>
                )}
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.status ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select status</option>
                  {STATUS_OPTIONS.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                )}
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                  Priority *
                </label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.priority ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select priority</option>
                  {PRIORITY_OPTIONS.map(priority => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
                {errors.priority && (
                  <p className="mt-1 text-sm text-red-600">{errors.priority}</p>
                )}
              </div>

              <div>
                <label htmlFor="dateRaised" className="block text-sm font-medium text-gray-700 mb-2">
                  Date Raised *
                </label>
                <input
                  type="date"
                  id="dateRaised"
                  value={formData.dateRaised}
                  onChange={(e) => handleInputChange('dateRaised', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.dateRaised ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.dateRaised && (
                  <p className="mt-1 text-sm text-red-600">{errors.dateRaised}</p>
                )}
              </div>

              <div>
                <label htmlFor="raisedBy" className="block text-sm font-medium text-gray-700 mb-2">
                  Raised By *
                </label>
                <input
                  type="text"
                  id="raisedBy"
                  value={formData.raisedBy}
                  onChange={(e) => handleInputChange('raisedBy', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.raisedBy ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Full name of person who raised"
                />
                {errors.raisedBy && (
                  <p className="mt-1 text-sm text-red-600">{errors.raisedBy}</p>
                )}
              </div>
            </div>
          </div>

          {/* Location and Tracking */}
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-4">Location and Tracking</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.location ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Sydney Office, Remote"
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                )}
              </div>

              <div>
                <label htmlFor="incidentJiraTicket" className="block text-sm font-medium text-gray-700 mb-2">
                  Incident JIRA Ticket
                </label>
                <input
                  type="text"
                  id="incidentJiraTicket"
                  value={formData.incidentJiraTicket}
                  onChange={(e) => handleInputChange('incidentJiraTicket', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., JIRA-1234"
                />
              </div>
            </div>
          </div>

          {/* Asset and Description */}
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-4">Asset and Description</h4>
            <div className="space-y-4">
              <div>
                <label htmlFor="informationAsset" className="block text-sm font-medium text-gray-700 mb-2">
                  Information Asset
                </label>
                <input
                  type="text"
                  id="informationAsset"
                  value={formData.informationAsset}
                  onChange={(e) => handleInputChange('informationAsset', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Customer Database, Email System"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Provide a detailed description of the incident..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Root Cause Analysis */}
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-4">Root Cause Analysis</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="rootCause" className="block text-sm font-medium text-gray-700 mb-2">
                  Root Cause
                </label>
                <textarea
                  id="rootCause"
                  rows={2}
                  value={formData.rootCause}
                  onChange={(e) => handleInputChange('rootCause', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Describe the root cause of the incident..."
                />
              </div>

              <div>
                <label htmlFor="rootCauseCategory" className="block text-sm font-medium text-gray-700 mb-2">
                  Root Cause Category
                </label>
                <select
                  id="rootCauseCategory"
                  value={formData.rootCauseCategory}
                  onChange={(e) => handleInputChange('rootCauseCategory', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select category</option>
                  {ROOT_CAUSE_CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Assignment and Actions */}
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-4">Assignment and Actions</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned To
                </label>
                <input
                  type="text"
                  id="assignedTo"
                  value={formData.assignedTo}
                  onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Full name of person assigned"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="actionTaken" className="block text-sm font-medium text-gray-700 mb-2">
                  Action Taken
                </label>
                <textarea
                  id="actionTaken"
                  rows={2}
                  value={formData.actionTaken}
                  onChange={(e) => handleInputChange('actionTaken', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Describe any immediate actions taken..."
                />
              </div>
            </div>
          </div>

          {/* Completion Dates */}
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-4">Completion Dates</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="completionDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Completion Date
                </label>
                <input
                  type="date"
                  id="completionDate"
                  value={formData.completionDate}
                  onChange={(e) => handleInputChange('completionDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="dateApprovedForClosure" className="block text-sm font-medium text-gray-700 mb-2">
                  Date Approved for Closure
                </label>
                <input
                  type="date"
                  id="dateApprovedForClosure"
                  value={formData.dateApprovedForClosure}
                  onChange={(e) => handleInputChange('dateApprovedForClosure', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
              aria-label="Cancel edit incident"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={isSubmitting}
              aria-label="Save incident changes"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                  Updating...
                </>
              ) : (
                'Update Incident'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
