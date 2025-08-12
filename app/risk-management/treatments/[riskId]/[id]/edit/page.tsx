'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Icon from '../../../../../components/Icon'
import { useToast } from '../../../../../components/Toast'
import { validateRiskId } from '../../../../../../lib/utils'
import { TREATMENT_STATUS } from '../../../../../../lib/constants'
import { useBackNavigation } from '../../../../../hooks/useBackNavigation'

interface TreatmentFormData {
  riskId: string
  treatmentId: string
  treatmentJira?: string
  riskTreatment: string
  riskTreatmentOwner: string
  numberOfExtensions?: number
  completionDate?: string
  closureApproval?: string
  closureApprovedBy?: string
  notes?: string
}

type TreatmentFormErrors = {
  [K in keyof TreatmentFormData]?: string
}

export default function EditTreatment() {
  const params = useParams()
  const router = useRouter()
  const { showToast } = useToast()
  const riskId = validateRiskId(params.riskId as string)
  const treatmentId = params.id as string
  const { goBack } = useBackNavigation({
    fallbackRoute: `/risk-management/treatments/${riskId}/${treatmentId}`
  })
  
  const [formData, setFormData] = useState<TreatmentFormData>({
    riskId: riskId || '',
    treatmentId: '',
    treatmentJira: '',
    riskTreatment: '',
    riskTreatmentOwner: '',
    numberOfExtensions: 0,
    completionDate: '',
    closureApproval: TREATMENT_STATUS.PENDING,
    closureApprovedBy: '',
    notes: ''
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<TreatmentFormErrors>({})
  const [, setRiskDetails] = useState<any>(null)
  const [treatmentDetails, setTreatmentDetails] = useState<any>(null)

  const mandatoryFields = ['treatmentId', 'riskTreatment', 'riskTreatmentOwner']

  // Fetch treatment and risk details
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch treatment details
        const treatmentResponse = await fetch(`/api/treatments/${riskId}/${treatmentId}`)
        if (!treatmentResponse.ok) {
          throw new Error('Failed to fetch treatment details')
        }
        const treatmentData = await treatmentResponse.json()
        setTreatmentDetails(treatmentData)

        // Populate form with existing data
        setFormData({
          riskId: treatmentData.riskId || riskId || '',
          treatmentId: treatmentData.treatmentId || '',
          treatmentJira: treatmentData.treatmentJira || '',
          riskTreatment: treatmentData.riskTreatment || '',
          riskTreatmentOwner: treatmentData.riskTreatmentOwner || '',
          numberOfExtensions: treatmentData.numberOfExtensions || 0,
          completionDate: treatmentData.completionDate ? new Date(treatmentData.completionDate).toISOString().split('T')[0] : '',
          closureApproval: treatmentData.closureApproval || TREATMENT_STATUS.PENDING,
          closureApprovedBy: treatmentData.closureApprovedBy || '',
          notes: treatmentData.notes || ''
        })

        // Fetch risk details
        const riskResponse = await fetch(`/api/risks/${riskId}`)
        if (riskResponse.ok) {
          const riskData = await riskResponse.json()
          setRiskDetails(riskData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        showToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to load treatment details'
        })
      } finally {
        setLoading(false)
      }
    }

    if (riskId && treatmentId) {
      fetchData()
    }
  }, [riskId, treatmentId, showToast])

  const validateForm = (): boolean => {
    const newErrors: TreatmentFormErrors = {}

    mandatoryFields.forEach(field => {
      const value = formData[field as keyof TreatmentFormData]
      if (typeof value === 'string' && !value.trim()) {
        newErrors[field as keyof TreatmentFormErrors] = 'This field is required'
      }
    })

    // Validate completion date is from today onwards
    if (formData.completionDate) {
      const completionDate = new Date(formData.completionDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (completionDate < today) {
        newErrors.completionDate = 'Completion date cannot be in the past'
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
        type: 'error',
        title: 'Validation Error',
        message: 'Please fix the errors in the form'
      })
      return
    }

    // Check if treatmentDetails exists before proceeding
    if (!treatmentDetails || !treatmentDetails._id) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Treatment details not available. Please refresh the page and try again.'
      })
      return
    }

    try {
      setSaving(true)

      const response = await fetch(`/api/treatments/treatment/${treatmentDetails._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        showToast({
          type: 'success',
          title: 'Success',
          message: 'Treatment updated successfully'
        })
        
        // Navigate back to treatment details page
        router.push(`/risk-management/treatments/${riskId}/${treatmentId}`)
      } else {
        throw new Error(result.error || 'Failed to update treatment')
      }
    } catch (error) {
      console.error('Error updating treatment:', error)
      showToast({
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to update treatment'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.push(`/risk-management/treatments/${riskId}/${treatmentId}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading treatment details...</p>
        </div>
      </div>
    )
  }

  if (!treatmentDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Icon name="exclamation-triangle" size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Treatment Not Found</h2>
          <p className="text-gray-600 mb-4">The treatment could not be found.</p>
          <button
            onClick={goBack}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ 
              backgroundColor: '#4C1D95',
              '--tw-ring-color': '#4C1D95'
            } as React.CSSProperties}
          >
            <Icon name="arrow-left" size={16} className="mr-2" />
            Go Back
          </button>
        </div>
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
                href={`/risk-management/treatments/${riskId}/${treatmentId}`}
                className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Icon name="arrow-left" size={16} className="mr-2" />
                Back to Treatment
              </Link>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Edit Treatment</h1>
          </div>
          <p className="mt-2 text-gray-600">Update treatment details for {treatmentDetails.treatmentJiraTicket}</p>
        </div>



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
                    value={formData.treatmentJira}
                    onChange={(e) => handleInputChange('treatmentJira', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors ${
                                              errors.treatmentJira 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                    }`}
                    placeholder="e.g., TREAT-001-01"
                  />
                  {errors.treatmentJira && (
                    <p className="mt-1 text-sm text-red-600">{errors.treatmentJira}</p>
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
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors ${
                      errors.completionDate 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                    }`}
                  />
                  {errors.completionDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.completionDate}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">Only today and future dates can be selected</p>
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
                disabled={saving}
                className="px-6 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </div>
                ) : (
                  'Update Treatment'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 