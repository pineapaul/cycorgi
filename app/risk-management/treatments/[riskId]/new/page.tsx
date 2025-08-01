'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Icon from '../../../../components/Icon'
import { useToast } from '../../../../components/Toast'
import { TREATMENT_STATUS } from '../../../../../lib/constants'

interface TreatmentFormData {
  riskId: string
  treatmentJiraTicket: string
  riskTreatment: string
  riskTreatmentOwner: string
  dateRiskTreatmentDue: string
  extendedDueDate?: string
  numberOfExtensions?: number
  completionDate?: string
  closureApproval?: string
  closureApprovedBy?: string
  notes?: string
}

type TreatmentFormErrors = {
  [K in keyof TreatmentFormData]?: string
}

export default function AddTreatment() {
  const params = useParams()
  const router = useRouter()
  const { showToast } = useToast()
  const riskId = params.riskId as string
  
  const [formData, setFormData] = useState<TreatmentFormData>({
    riskId: riskId,
    treatmentJiraTicket: '',
    riskTreatment: '',
    riskTreatmentOwner: '',
    dateRiskTreatmentDue: '',
    extendedDueDate: '',
    numberOfExtensions: 0,
    completionDate: '',
    closureApproval: TREATMENT_STATUS.PENDING,
    closureApprovedBy: '',
    notes: ''
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<TreatmentFormErrors>({})
  const [riskDetails, setRiskDetails] = useState<any>(null)

  const mandatoryFields = ['treatmentJiraTicket', 'riskTreatment', 'riskTreatmentOwner', 'dateRiskTreatmentDue']

  // Fetch risk details to display context
  useEffect(() => {
    const fetchRiskDetails = async () => {
      try {
        const response = await fetch(`/api/risks/${riskId}`)
        const result = await response.json()
        
        if (result.success) {
          setRiskDetails(result.data)
        }
      } catch (error) {
        console.error('Error fetching risk details:', error)
      }
    }

    if (riskId) {
      fetchRiskDetails()
    }
  }, [riskId])

  const validateForm = (): boolean => {
    const newErrors: TreatmentFormErrors = {}

    mandatoryFields.forEach(field => {
      const value = formData[field as keyof TreatmentFormData]
      if (typeof value === 'string' && !value.trim()) {
        newErrors[field as keyof TreatmentFormErrors] = 'This field is required'
      }
    })

    // Validate due date is not in the past
    if (formData.dateRiskTreatmentDue) {
      const dueDate = new Date(formData.dateRiskTreatmentDue)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (dueDate < today) {
        newErrors.dateRiskTreatmentDue = 'Due date cannot be in the past'
      }
    }

    // Validate extended due date is after original due date
    if (formData.extendedDueDate && formData.dateRiskTreatmentDue) {
      const originalDueDate = new Date(formData.dateRiskTreatmentDue)
      const extendedDueDate = new Date(formData.extendedDueDate)
      
      if (extendedDueDate <= originalDueDate) {
        newErrors.extendedDueDate = 'Extended due date must be after the original due date'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof TreatmentFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      showToast({
        title: 'Validation Error',
        message: 'Please fill in all mandatory fields correctly',
        type: 'error'
      })
      return
    }

    setLoading(true)

    try {
      const treatmentData = {
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const response = await fetch('/api/treatments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(treatmentData),
      })

      const result = await response.json()

      if (result.success) {
        showToast({
          title: 'Success',
          message: 'Treatment created successfully!',
          type: 'success'
        })
        router.push(`/risk-management/register/${riskId}`)
      } else {
        showToast({
          title: 'Error',
          message: result.error || 'Failed to create treatment',
          type: 'error'
        })
      }
    } catch (error) {
      console.error('Error creating treatment:', error)
      showToast({
        title: 'Error',
        message: 'An error occurred while creating the treatment',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push(`/risk-management/register/${riskId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link
                href={`/risk-management/register/${riskId}`}
                className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Icon name="arrow-left" size={16} className="mr-2" />
                Back to Risk
              </Link>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Add New Treatment</h1>
          </div>
          <p className="mt-2 text-gray-600">Create a new treatment for risk {riskId}</p>
        </div>

        {/* Risk Context */}
        {riskDetails && (
          <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Icon name="info-circle" size={16} className="mr-2 text-blue-500" />
              Risk Context
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Risk Statement:</span>
                <p className="text-gray-600 mt-1">{riskDetails.riskStatement}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Information Asset:</span>
                <p className="text-gray-600 mt-1">{riskDetails.informationAsset}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Risk Rating:</span>
                <p className="text-gray-600 mt-1">{riskDetails.riskRating}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Risk Owner:</span>
                <p className="text-gray-600 mt-1">{riskDetails.riskOwner}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Mandatory Fields Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Icon name="exclamation-triangle" size={16} className="mr-2 text-red-500" />
                Treatment Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Treatment JIRA Ticket */}
                <div>
                  <label htmlFor="treatmentJiraTicket" className="block text-sm font-medium text-gray-700 mb-2">
                    Treatment JIRA Ticket <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="treatmentJiraTicket"
                    value={formData.treatmentJiraTicket}
                    onChange={(e) => handleInputChange('treatmentJiraTicket', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors ${
                      errors.treatmentJiraTicket 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                    }`}
                    placeholder="e.g., TREAT-001-01"
                  />
                  {errors.treatmentJiraTicket && (
                    <p className="mt-1 text-sm text-red-600">{errors.treatmentJiraTicket}</p>
                  )}
                </div>

                {/* Risk Treatment Owner */}
                <div>
                  <label htmlFor="riskTreatmentOwner" className="block text-sm font-medium text-gray-700 mb-2">
                    Treatment Owner <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="riskTreatmentOwner"
                    value={formData.riskTreatmentOwner}
                    onChange={(e) => handleInputChange('riskTreatmentOwner', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors ${
                      errors.riskTreatmentOwner 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                    }`}
                    placeholder="e.g., IT Security Team"
                  />
                  {errors.riskTreatmentOwner && (
                    <p className="mt-1 text-sm text-red-600">{errors.riskTreatmentOwner}</p>
                  )}
                </div>

                {/* Due Date */}
                <div>
                  <label htmlFor="dateRiskTreatmentDue" className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="dateRiskTreatmentDue"
                    value={formData.dateRiskTreatmentDue}
                    onChange={(e) => handleInputChange('dateRiskTreatmentDue', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors ${
                      errors.dateRiskTreatmentDue 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                    }`}
                  />
                  {errors.dateRiskTreatmentDue && (
                    <p className="mt-1 text-sm text-red-600">{errors.dateRiskTreatmentDue}</p>
                  )}
                </div>

                {/* Extended Due Date */}
                <div>
                  <label htmlFor="extendedDueDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Extended Due Date
                  </label>
                  <input
                    type="date"
                    id="extendedDueDate"
                    value={formData.extendedDueDate}
                    onChange={(e) => handleInputChange('extendedDueDate', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors ${
                      errors.extendedDueDate 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                    }`}
                  />
                  {errors.extendedDueDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.extendedDueDate}</p>
                  )}
                </div>
              </div>

              {/* Risk Treatment - Full Width */}
              <div className="mt-6">
                <label htmlFor="riskTreatment" className="block text-sm font-medium text-gray-700 mb-2">
                  Risk Treatment <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="riskTreatment"
                  rows={4}
                  value={formData.riskTreatment}
                  onChange={(e) => handleInputChange('riskTreatment', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors resize-none ${
                    errors.riskTreatment 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                  }`}
                  placeholder="Describe the treatment strategy and implementation plan..."
                />
                {errors.riskTreatment && (
                  <p className="mt-1 text-sm text-red-600">{errors.riskTreatment}</p>
                )}
              </div>
            </div>

            {/* Optional Fields Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Icon name="plus-circle" size={16} className="mr-2 text-gray-500" />
                Additional Information (Optional)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Completion Date */}
                <div>
                  <label htmlFor="completionDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Completion Date
                  </label>
                  <input
                    type="date"
                    id="completionDate"
                    value={formData.completionDate}
                    onChange={(e) => handleInputChange('completionDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  />
                </div>

                {/* Closure Approval */}
                <div>
                  <label htmlFor="closureApproval" className="block text-sm font-medium text-gray-700 mb-2">
                    Closure Approval
                  </label>
                  <select
                    id="closureApproval"
                    value={formData.closureApproval}
                    onChange={(e) => handleInputChange('closureApproval', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  >
                    <option value={TREATMENT_STATUS.PENDING}>{TREATMENT_STATUS.PENDING}</option>
                    <option value={TREATMENT_STATUS.APPROVED}>{TREATMENT_STATUS.APPROVED}</option>
                    <option value={TREATMENT_STATUS.REJECTED}>{TREATMENT_STATUS.REJECTED}</option>
                  </select>
                </div>

                {/* Closure Approved By */}
                <div>
                  <label htmlFor="closureApprovedBy" className="block text-sm font-medium text-gray-700 mb-2">
                    Closure Approved By
                  </label>
                  <input
                    type="text"
                    id="closureApprovedBy"
                    value={formData.closureApprovedBy}
                    onChange={(e) => handleInputChange('closureApprovedBy', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    placeholder="Enter approver name"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none"
                  placeholder="Additional notes or comments..."
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </div>
                ) : (
                  'Create Treatment'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 