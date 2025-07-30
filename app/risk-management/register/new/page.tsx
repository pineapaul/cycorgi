'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Icon from '../../../components/Icon'
import { useToast } from '../../../components/Toast'

interface RiskFormData {
  riskId: string
  raisedBy: string
  informationAssets: string
  threat: string
  vulnerability: string
  riskStatement: string
  functionalUnit?: string
  riskOwner?: string
  affectedSites?: string
  currentControls?: string
  currentControlsReference?: string
  consequenceRating?: string
  likelihoodRating?: string
  riskRating?: string
  impact?: {
    confidentiality: string
    integrity: string
    availability: string
  }
}

export default function NewRisk() {
  const router = useRouter()
  const { showToast } = useToast()
  
  const [formData, setFormData] = useState<RiskFormData>({
    riskId: '',
    raisedBy: '',
    informationAssets: '',
    threat: '',
    vulnerability: '',
    riskStatement: '',
    functionalUnit: '',
    riskOwner: '',
    affectedSites: '',
    currentControls: '',
    currentControlsReference: '',
    consequenceRating: '',
    likelihoodRating: '',
    riskRating: '',
    impact: {
      confidentiality: '',
      integrity: '',
      availability: ''
    }
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<RiskFormData>>({})

  const mandatoryFields = ['riskId', 'raisedBy', 'informationAssets', 'threat', 'vulnerability', 'riskStatement']

  const validateForm = (): boolean => {
    const newErrors: Partial<RiskFormData> = {}

    mandatoryFields.forEach(field => {
      if (!formData[field as keyof RiskFormData]?.toString().trim()) {
        newErrors[field as keyof RiskFormData] = 'This field is required'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof RiskFormData, value: string) => {
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

  const handleImpactChange = (field: keyof RiskFormData['impact'], value: string) => {
    setFormData(prev => ({
      ...prev,
      impact: {
        ...prev.impact!,
        [field]: value
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      showToast('Please fill in all mandatory fields', 'error')
      return
    }

    setLoading(true)

    try {
      const riskData = {
        ...formData,
        currentPhase: 'Draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const response = await fetch('/api/risks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(riskData),
      })

      const result = await response.json()

      if (result.success) {
        showToast('Risk created successfully!', 'success')
        router.push('/risk-management/register')
      } else {
        showToast(result.error || 'Failed to create risk', 'error')
      }
    } catch (error) {
      console.error('Error creating risk:', error)
      showToast('An error occurred while creating the risk', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/risk-management/register')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link
                href="/risk-management/register"
                className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Icon name="arrow-left" size={16} className="mr-2" />
                Back to Register
              </Link>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Add New Risk</h1>
          </div>
          <p className="mt-2 text-gray-600">Create a new risk entry with the required information</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Mandatory Fields Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Icon name="exclamation-triangle" size={16} className="mr-2 text-red-500" />
                Mandatory Fields
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Risk ID */}
                <div>
                  <label htmlFor="riskId" className="block text-sm font-medium text-gray-700 mb-2">
                    Risk ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="riskId"
                    value={formData.riskId}
                    onChange={(e) => handleInputChange('riskId', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors ${
                      errors.riskId 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                    }`}
                    placeholder="e.g., RISK-001"
                  />
                  {errors.riskId && (
                    <p className="mt-1 text-sm text-red-600">{errors.riskId}</p>
                  )}
                </div>

                {/* Raised By */}
                <div>
                  <label htmlFor="raisedBy" className="block text-sm font-medium text-gray-700 mb-2">
                    Raised By <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="raisedBy"
                    value={formData.raisedBy}
                    onChange={(e) => handleInputChange('raisedBy', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors ${
                      errors.raisedBy 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                    }`}
                    placeholder="Enter name"
                  />
                  {errors.raisedBy && (
                    <p className="mt-1 text-sm text-red-600">{errors.raisedBy}</p>
                  )}
                </div>

                {/* Information Assets */}
                <div>
                  <label htmlFor="informationAssets" className="block text-sm font-medium text-gray-700 mb-2">
                    Information Assets <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="informationAssets"
                    value={formData.informationAssets}
                    onChange={(e) => handleInputChange('informationAssets', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors ${
                      errors.informationAssets 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                    }`}
                    placeholder="e.g., Customer Database, Financial Records"
                  />
                  {errors.informationAssets && (
                    <p className="mt-1 text-sm text-red-600">{errors.informationAssets}</p>
                  )}
                </div>

                {/* Threat */}
                <div>
                  <label htmlFor="threat" className="block text-sm font-medium text-gray-700 mb-2">
                    Threat <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="threat"
                    value={formData.threat}
                    onChange={(e) => handleInputChange('threat', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors ${
                      errors.threat 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                    }`}
                    placeholder="e.g., Cyber attack, Natural disaster"
                  />
                  {errors.threat && (
                    <p className="mt-1 text-sm text-red-600">{errors.threat}</p>
                  )}
                </div>

                {/* Vulnerability */}
                <div>
                  <label htmlFor="vulnerability" className="block text-sm font-medium text-gray-700 mb-2">
                    Vulnerability <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="vulnerability"
                    value={formData.vulnerability}
                    onChange={(e) => handleInputChange('vulnerability', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors ${
                      errors.vulnerability 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                    }`}
                    placeholder="e.g., Outdated software, Weak passwords"
                  />
                  {errors.vulnerability && (
                    <p className="mt-1 text-sm text-red-600">{errors.vulnerability}</p>
                  )}
                </div>
              </div>

              {/* Risk Statement - Full Width */}
              <div className="mt-6">
                <label htmlFor="riskStatement" className="block text-sm font-medium text-gray-700 mb-2">
                  Risk Statement <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="riskStatement"
                  rows={4}
                  value={formData.riskStatement}
                  onChange={(e) => handleInputChange('riskStatement', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors resize-none ${
                    errors.riskStatement 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                  }`}
                  placeholder="Describe the risk in detail..."
                />
                {errors.riskStatement && (
                  <p className="mt-1 text-sm text-red-600">{errors.riskStatement}</p>
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
                {/* Functional Unit */}
                <div>
                  <label htmlFor="functionalUnit" className="block text-sm font-medium text-gray-700 mb-2">
                    Functional Unit
                  </label>
                  <input
                    type="text"
                    id="functionalUnit"
                    value={formData.functionalUnit}
                    onChange={(e) => handleInputChange('functionalUnit', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    placeholder="e.g., IT, Finance, HR"
                  />
                </div>

                {/* Risk Owner */}
                <div>
                  <label htmlFor="riskOwner" className="block text-sm font-medium text-gray-700 mb-2">
                    Risk Owner
                  </label>
                  <input
                    type="text"
                    id="riskOwner"
                    value={formData.riskOwner}
                    onChange={(e) => handleInputChange('riskOwner', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    placeholder="Enter risk owner name"
                  />
                </div>

                {/* Affected Sites */}
                <div>
                  <label htmlFor="affectedSites" className="block text-sm font-medium text-gray-700 mb-2">
                    Affected Sites
                  </label>
                  <input
                    type="text"
                    id="affectedSites"
                    value={formData.affectedSites}
                    onChange={(e) => handleInputChange('affectedSites', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    placeholder="e.g., All Sites, HQ, Branch Office"
                  />
                </div>

                {/* Current Controls */}
                <div>
                  <label htmlFor="currentControls" className="block text-sm font-medium text-gray-700 mb-2">
                    Current Controls
                  </label>
                  <input
                    type="text"
                    id="currentControls"
                    value={formData.currentControls}
                    onChange={(e) => handleInputChange('currentControls', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    placeholder="e.g., Firewall, Access controls"
                  />
                </div>

                {/* Current Controls Reference */}
                <div>
                  <label htmlFor="currentControlsReference" className="block text-sm font-medium text-gray-700 mb-2">
                    Current Controls Reference
                  </label>
                  <input
                    type="text"
                    id="currentControlsReference"
                    value={formData.currentControlsReference}
                    onChange={(e) => handleInputChange('currentControlsReference', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    placeholder="e.g., CTRL-001"
                  />
                </div>
              </div>

              {/* Impact Assessment */}
              <div className="mt-6">
                <h3 className="text-md font-medium text-gray-900 mb-3">Impact Assessment (CIA)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="confidentiality" className="block text-sm font-medium text-gray-700 mb-2">
                      Confidentiality
                    </label>
                    <select
                      id="confidentiality"
                      value={formData.impact?.confidentiality}
                      onChange={(e) => handleImpactChange('confidentiality', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    >
                      <option value="">Select level</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="integrity" className="block text-sm font-medium text-gray-700 mb-2">
                      Integrity
                    </label>
                    <select
                      id="integrity"
                      value={formData.impact?.integrity}
                      onChange={(e) => handleImpactChange('integrity', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    >
                      <option value="">Select level</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-2">
                      Availability
                    </label>
                    <select
                      id="availability"
                      value={formData.impact?.availability}
                      onChange={(e) => handleImpactChange('availability', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    >
                      <option value="">Select level</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>
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
                  'Create Risk'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 