'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Icon from '../../../../components/Icon'
import { useToast } from '../../../../components/Toast'
import { mapAssetIdsToNames } from '../../../../../lib/utils'

interface TreatmentFormData {
  riskId: string
  treatmentId: string
  treatmentJira: string
  riskTreatment: string
  riskTreatmentOwner: string
  dateRiskTreatmentDue: string
  notes: string
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
    riskId: riskId || '',
    treatmentId: '',
    treatmentJira: '',
    riskTreatment: '',
    riskTreatmentOwner: '',
    dateRiskTreatmentDue: '',
    notes: ''
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<TreatmentFormErrors>({})
  const [riskDetails, setRiskDetails] = useState<any>(null)
  const [generatingTreatmentId, setGeneratingTreatmentId] = useState(false)

  const mandatoryFields = ['treatmentId', 'riskTreatment', 'riskTreatmentOwner', 'dateRiskTreatmentDue']

  // Generate next treatment ID
  const generateNextTreatmentId = async (riskId: string): Promise<string> => {
    try {
      // Validate riskId format (should be RISK-XXX)
      const riskIdMatch = riskId.match(/^RISK-(\d+)$/)
      if (!riskIdMatch) {
        console.error('Invalid riskId format:', riskId)
        throw new Error(`Invalid risk ID format: ${riskId}. Expected format: RISK-XXX`)
      }
      
      const riskNumber = riskIdMatch[1]
      
      const response = await fetch(`/api/treatments/${riskId}`)
      const result = await response.json()
      
      if (result.success && result.data.length > 0) {
        // Extract treatment numbers and find the highest one
        const treatmentNumbers = result.data
          .filter((treatment: any) => treatment.treatmentId && typeof treatment.treatmentId === 'string')
          .map((treatment: any) => {
            const expectedPrefix = `TREAT-${riskNumber}-`
            
            if (treatment.treatmentId.startsWith(expectedPrefix)) {
              const match = treatment.treatmentId.match(/TREAT-\d+-(\d+)$/)
              return match ? parseInt(match[1], 10) : 0
            }
            return 0
          })
          .filter((num: number) => !isNaN(num) && num > 0)
        
        const maxNumber = treatmentNumbers.length > 0 ? Math.max(...treatmentNumbers) : 0
        const nextNumber = (maxNumber + 1).toString().padStart(2, '0')
        return `TREAT-${riskNumber}-${nextNumber}`
      } else {
        // First treatment for this risk
        return `TREAT-${riskNumber}-01`
      }
    } catch (error) {
      console.error('Error generating treatment ID:', error)
      // Fallback to a safe default - use the original riskId if it's not in expected format
      const fallbackNumber = riskId.replace(/\D/g, '') || '001'
      return `TREAT-${fallbackNumber}-01`
    }
  }

  // Fetch risk details and generate treatment ID
  useEffect(() => {
    const fetchRiskDetailsAndGenerateId = async () => {
      if (!riskId) return

      try {
        // Fetch risk details
        const response = await fetch(`/api/risks/${riskId}`)
        const result = await response.json()
        
        if (result.success) {
          setRiskDetails(result.data)
        }

        // Generate treatment ID
        setGeneratingTreatmentId(true)
        const newTreatmentId = await generateNextTreatmentId(riskId)
        setFormData(prev => ({
          ...prev,
          treatmentId: newTreatmentId
        }))
      } catch (error) {
        console.error('Error fetching risk details or generating treatment ID:', error)
      } finally {
        setGeneratingTreatmentId(false)
      }
    }

    fetchRiskDetailsAndGenerateId()
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
        router.push(`/risk-management/risks/${riskId}`)
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
            router.push(`/risk-management/risks/${riskId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link
                href={`/risk-management/risks/${riskId}`}
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
                  <p className="text-gray-600 mt-1">
                    {mapAssetIdsToNames(riskDetails.informationAsset, riskDetails.informationAssetDetails || [])}
                  </p>
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
                {/* Treatment ID */}
                <div>
                  <label htmlFor="treatmentId" className="block text-sm font-medium text-gray-700 mb-2">
                    Treatment ID <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500 ml-2">(Auto-generated)</span>
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      id="treatmentId"
                      value={formData.treatmentId}
                      readOnly
                      className={`flex-1 px-3 py-2 border rounded-md shadow-sm bg-gray-50 text-gray-600 cursor-not-allowed ${
                        errors.treatmentId 
                          ? 'border-red-300' 
                          : 'border-gray-300'
                      }`}
                      placeholder={generatingTreatmentId ? "Generating..." : "e.g., TREAT-001-05"}
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        setGeneratingTreatmentId(true)
                        const newTreatmentId = await generateNextTreatmentId(riskId)
                        setFormData(prev => ({ ...prev, treatmentId: newTreatmentId }))
                        setGeneratingTreatmentId(false)
                      }}
                      disabled={generatingTreatmentId}
                      className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Regenerate Treatment ID"
                    >
                      <Icon name="arrow-clockwise" size={14} />
                    </button>
                  </div>
                  {errors.treatmentId && (
                    <p className="mt-1 text-sm text-red-600">{errors.treatmentId}</p>
                  )}
                  {generatingTreatmentId && (
                    <div className="mt-1 text-xs text-blue-600 flex items-center">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
                      Generating treatment ID...
                    </div>
                  )}
                </div>

                {/* Treatment JIRA Ticket */}
                <div>
                  <label htmlFor="treatmentJira" className="block text-sm font-medium text-gray-700 mb-2">
                    Treatment JIRA URL
                  </label>
                  <input
                    type="url"
                    id="treatmentJira"
                    value={formData.treatmentJira}
                    onChange={(e) => handleInputChange('treatmentJira', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors ${
                      errors.treatmentJira 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                    }`}
                    placeholder="https://jira.company.com/browse/TREAT-001-05"
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

              {/* Notes */}
              <div>
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