'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Icon from '@/app/components/Icon'
import { useToast } from '@/app/components/Toast'

interface IncidentFormData {
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

type IncidentFormErrors = {
  [K in keyof IncidentFormData]?: string
}

const PRIORITY_OPTIONS = ['Critical', 'High', 'Medium', 'Low']
const STATUS_OPTIONS = ['Open', 'Under Investigation', 'Resolved', 'Closed']
const ROOT_CAUSE_CATEGORIES = [
  'Authentication',
  'Credential Theft',
  'Human Error',
  'Social Engineering',
  'Technical Vulnerability',
  'Malware',
  'Physical Security',
  'Network Security',
  'Data Breach',
  'Other'
]

export default function NewIncident() {
  const router = useRouter()
  const { showToast } = useToast()

  const [formData, setFormData] = useState<IncidentFormData>({
    functionalUnit: '',
    status: 'Open',
    dateRaised: new Date().toISOString().split('T')[0],
    raisedBy: '',
    location: '',
    priority: 'Medium',
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

  const validateForm = (): boolean => {
    const newErrors: IncidentFormErrors = {}

    if (!formData.functionalUnit.trim()) {
      newErrors.functionalUnit = 'Functional Unit is required'
    }
    if (!formData.raisedBy.trim()) {
      newErrors.raisedBy = 'Raised By is required'
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required'
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }
    if (!formData.assignedTo.trim()) {
      newErrors.assignedTo = 'Assigned To is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        showToast({ 
          type: 'success', 
          title: 'Incident Created Successfully',
          message: `Incident ${result.data.incidentId} has been created.`
        })
        router.push('/isms-operations/incidents')
      } else {
        showToast({ 
          type: 'error', 
          title: 'Failed to Create Incident',
          message: result.error || 'An error occurred while creating the incident.'
        })
      }
    } catch (error) {
      console.error('Error creating incident:', error)
      showToast({ 
        type: 'error', 
        title: 'Failed to Create Incident',
        message: 'An error occurred while creating the incident.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof IncidentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-3">
          <Link
            href="/isms-operations/incidents"
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md transition-colors"
          >
            <Icon name="arrow-left" className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              New Security Incident
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Report a new information security incident
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow">
          <form onSubmit={handleSubmit} className="space-y-8 p-8">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-6">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="functionalUnit" className="block text-sm font-medium text-gray-700 mb-2">
                    Functional Unit *
                  </label>
                  <input
                    type="text"
                    id="functionalUnit"
                    value={formData.functionalUnit}
                    onChange={(e) => handleInputChange('functionalUnit', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.functionalUnit ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., IT Security, Finance, HR"
                  />
                  {errors.functionalUnit && (
                    <p className="mt-1 text-sm text-red-600">{errors.functionalUnit}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {STATUS_OPTIONS.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="dateRaised" className="block text-sm font-medium text-gray-700 mb-2">
                    Date Raised
                  </label>
                  <input
                    type="date"
                    id="dateRaised"
                    value={formData.dateRaised}
                    onChange={(e) => handleInputChange('dateRaised', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
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
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.raisedBy ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Full name of person reporting"
                  />
                  {errors.raisedBy && (
                    <p className="mt-1 text-sm text-red-600">{errors.raisedBy}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.location ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Sydney Office, Melbourne Office"
                  />
                  {errors.location && (
                    <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {PRIORITY_OPTIONS.map(priority => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Incident Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-6">Incident Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="incidentJiraTicket" className="block text-sm font-medium text-gray-700 mb-2">
                    Incident JIRA Ticket
                  </label>
                  <input
                    type="text"
                    id="incidentJiraTicket"
                    value={formData.incidentJiraTicket}
                    onChange={(e) => handleInputChange('incidentJiraTicket', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., SEC-1234"
                  />
                </div>

                <div>
                  <label htmlFor="informationAsset" className="block text-sm font-medium text-gray-700 mb-2">
                    Information Asset
                  </label>
                  <input
                    type="text"
                    id="informationAsset"
                    value={formData.informationAsset}
                    onChange={(e) => handleInputChange('informationAsset', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Customer Database, Financial Systems"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
              <h3 className="text-lg font-medium text-gray-900 mb-6">Root Cause Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="rootCause" className="block text-sm font-medium text-gray-700 mb-2">
                    Root Cause
                  </label>
                  <input
                    type="text"
                    id="rootCause"
                    value={formData.rootCause}
                    onChange={(e) => handleInputChange('rootCause', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Weak password policy, Phishing email"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a category</option>
                    {ROOT_CAUSE_CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Assignment and Actions */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-6">Assignment and Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-2">
                    Assigned To *
                  </label>
                  <input
                    type="text"
                    id="assignedTo"
                    value={formData.assignedTo}
                    onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.assignedTo ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Full name of person assigned"
                  />
                  {errors.assignedTo && (
                    <p className="mt-1 text-sm text-red-600">{errors.assignedTo}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="actionTaken" className="block text-sm font-medium text-gray-700 mb-2">
                    Action Taken
                  </label>
                  <textarea
                    id="actionTaken"
                    rows={3}
                    value={formData.actionTaken}
                    onChange={(e) => handleInputChange('actionTaken', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe any immediate actions taken..."
                  />
                </div>
              </div>
            </div>

            {/* Completion Dates */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-6">Completion Dates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="completionDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Completion Date
                  </label>
                  <input
                    type="date"
                    id="completionDate"
                    value={formData.completionDate}
                    onChange={(e) => handleInputChange('completionDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link
                href="/isms-operations/incidents"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Icon name="plus" size={16} className="mr-2" />
                    Create Incident
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
