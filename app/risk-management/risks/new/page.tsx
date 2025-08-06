'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Icon from '@/app/components/Icon'
import { useToast } from '@/app/components/Toast'

interface InformationAsset {
  id: string
  informationAsset: string
  category: string
}

interface RiskFormData {
  riskId: string
  raisedBy: string
  informationAssets: string[]
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
  impact?: string[]
}

type RiskFormErrors = {
  [K in keyof RiskFormData]?: string
}

export default function NewRisk() {
  const router = useRouter()
  const { showToast } = useToast()
  
  const [formData, setFormData] = useState<RiskFormData>({
    riskId: '',
    raisedBy: '',
    informationAssets: [],
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
    impact: []
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<RiskFormErrors>({})
  const [informationAssets, setInformationAssets] = useState<InformationAsset[]>([])
  
  // Modal states
  const [showAssetModal, setShowAssetModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [tempSelectedAssets, setTempSelectedAssets] = useState<string[]>([])
  const [selectedLetter, setSelectedLetter] = useState('')

  const mandatoryFields = ['riskId', 'raisedBy', 'informationAssets', 'threat', 'vulnerability', 'riskStatement', 'consequenceRating', 'likelihoodRating', 'riskRating', 'impact']

  // Fetch information assets on component mount
  useEffect(() => {
    const fetchInformationAssets = async () => {
      try {
        const response = await fetch('/api/information-assets')
        const result = await response.json()
        
        if (result.success) {
          setInformationAssets(result.data)
        } else {
          console.error('Failed to fetch information assets:', result.error)
        }
      } catch (error) {
        console.error('Error fetching information assets:', error)
      }
    }

    fetchInformationAssets()
  }, [])

  // Modal functions
  const openAssetModal = () => {
    setTempSelectedAssets([...formData.informationAssets])
    setSearchTerm('')
    setSelectedLetter('')
    setShowAssetModal(true)
  }

  const closeAssetModal = () => {
    setShowAssetModal(false)
    setSearchTerm('')
    setTempSelectedAssets([])
    setSelectedLetter('')
  }

  const handleAssetSelection = (assetId: string, checked: boolean) => {
    setTempSelectedAssets(prev => 
      checked 
        ? [...prev, assetId]
        : prev.filter(id => id !== assetId)
    )
  }

  const applyAssetSelection = () => {
    setFormData(prev => ({
      ...prev,
      informationAssets: tempSelectedAssets
    }))
    
    // Clear error when information asset is selected
    if (errors.informationAssets) {
      setErrors(prev => ({
        ...prev,
        informationAssets: undefined
      }))
    }
    
    closeAssetModal()
  }

  const validateForm = (): boolean => {
    const newErrors: RiskFormErrors = {}

    mandatoryFields.forEach(field => {
      const value = formData[field as keyof RiskFormData]
      if (field === 'informationAssets') {
        if (!Array.isArray(value) || value.length === 0) {
          newErrors[field as keyof RiskFormData] = 'Please select at least one information asset'
        }
      } else if (typeof value === 'string' && !value.trim()) {
        newErrors[field as keyof RiskFormData] = 'This field is required'
      }
    })

    // Special validation for impact field (array)
    if (!formData.impact || formData.impact.length === 0) {
      newErrors.impact = 'Please select at least one CIA component'
    }

    // Validate Risk ID format
    if (formData.riskId.trim()) {
      const riskIdPattern = /^RISK-\d+$/i
      if (!riskIdPattern.test(formData.riskId.trim())) {
        newErrors.riskId = 'Risk ID must be in format RISK-XXX (where XXX is numeric)'
      }
    }

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

    // Real-time validation for Risk ID
    if (field === 'riskId' && value.trim()) {
      const riskIdPattern = /^RISK-\d+$/i
      if (!riskIdPattern.test(value.trim())) {
        setErrors(prev => ({
          ...prev,
          riskId: 'Risk ID must be in format RISK-XXX (where XXX is numeric)'
        }))
      }
    }
  }

  const handleImpactChange = (ciaValue: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      impact: checked 
        ? [...(prev.impact || []), ciaValue]
        : (prev.impact || []).filter(item => item !== ciaValue)
    }))
    
    // Clear error when CIA component is selected
    if (errors.impact) {
      setErrors(prev => ({
        ...prev,
        impact: undefined
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      showToast({
        title: 'Validation Error',
        message: 'Please fill in all mandatory fields',
        type: 'error'
      })
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
        showToast({
          title: 'Success',
          message: 'Risk created successfully!',
          type: 'success'
        })
        // Redirect to the newly created risk's info page using the risk ID
        router.push(`/risk-management/risks/${formData.riskId}`)
      } else {
        showToast({
          title: 'Error',
          message: result.error || 'Failed to create risk',
          type: 'error'
        })
      }
    } catch (error) {
      console.error('Error creating risk:', error)
      showToast({
        title: 'Error',
        message: 'An error occurred while creating the risk',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/risk-management/register')
  }

  // Filter and sort assets for modal
  const filteredAssets = informationAssets
    .filter(asset =>
      asset.informationAsset.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(asset => {
      if (!selectedLetter) return true
      return asset.informationAsset.toLowerCase().startsWith(selectedLetter.toLowerCase())
    })
    .sort((a, b) => a.informationAsset.localeCompare(b.informationAsset))

  // Get selected asset names for display
  const selectedAssetNames = formData.informationAssets.map(assetId => {
    const asset = informationAssets.find(a => a.id === assetId)
    return asset ? asset.informationAsset : assetId
  })

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

                {/* Information Assets - Modal Button */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Information Assets <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={openAssetModal}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors text-left ${
                      errors.informationAssets 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500 hover:border-purple-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={formData.informationAssets.length > 0 ? 'text-gray-900' : 'text-gray-500'}>
                        {formData.informationAssets.length > 0 
                          ? `${formData.informationAssets.length} asset${formData.informationAssets.length !== 1 ? 's' : ''} selected`
                          : 'Click to select information assets'
                        }
                      </span>
                      <Icon name="chevron-down" size={16} className="text-gray-400" />
                    </div>
                  </button>
                  
                  {/* Display selected assets as tags */}
                  {formData.informationAssets.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedAssetNames.map((assetName, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                        >
                          {assetName}
                        </span>
                      ))}
                    </div>
                  )}
                  
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

              {/* Risk Assessment */}
              <div className="mt-6">
                <h3 className="text-md font-medium text-gray-900 mb-3">Risk Assessment <span className="text-red-500">*</span></h3>
                <p className="text-sm text-gray-600 mb-4">Assess the consequence and likelihood of this risk:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Consequence Rating */}
                  <div>
                    <label htmlFor="consequenceRating" className="block text-sm font-medium text-gray-700 mb-2">
                      Consequence Rating <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="consequenceRating"
                      value={formData.consequenceRating}
                      onChange={(e) => handleInputChange('consequenceRating', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors ${
                        errors.consequenceRating 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                      }`}
                    >
                      <option value="">Select consequence rating</option>
                      <option value="Insignificant">Insignificant</option>
                      <option value="Minor">Minor</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Major">Major</option>
                      <option value="Critical">Critical</option>
                    </select>
                    {errors.consequenceRating && (
                      <p className="mt-1 text-sm text-red-600">{errors.consequenceRating}</p>
                    )}
                  </div>

                  {/* Likelihood Rating */}
                  <div>
                    <label htmlFor="likelihoodRating" className="block text-sm font-medium text-gray-700 mb-2">
                      Likelihood Rating <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="likelihoodRating"
                      value={formData.likelihoodRating}
                      onChange={(e) => handleInputChange('likelihoodRating', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors ${
                        errors.likelihoodRating 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                      }`}
                    >
                      <option value="">Select likelihood rating</option>
                      <option value="Rare">Rare</option>
                      <option value="Unlikely">Unlikely</option>
                      <option value="Possible">Possible</option>
                      <option value="Likely">Likely</option>
                      <option value="Almost Certain">Almost Certain</option>
                    </select>
                    {errors.likelihoodRating && (
                      <p className="mt-1 text-sm text-red-600">{errors.likelihoodRating}</p>
                    )}
                  </div>
                </div>

                {/* Risk Rating */}
                <div className="mt-6">
                  <label htmlFor="riskRating" className="block text-sm font-medium text-gray-700 mb-2">
                    Risk Rating <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="riskRating"
                    value={formData.riskRating}
                    onChange={(e) => handleInputChange('riskRating', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors ${
                      errors.riskRating 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                    }`}
                  >
                    <option value="">Select risk rating</option>
                    <option value="Low">Low</option>
                    <option value="Moderate">Moderate</option>
                    <option value="High">High</option>
                    <option value="Extreme">Extreme</option>
                  </select>
                  {errors.riskRating && (
                    <p className="mt-1 text-sm text-red-600">{errors.riskRating}</p>
                  )}
                </div>
                </div>

                {/* Impact Assessment */}
                <h3 className="text-md font-medium text-gray-900 mb-3">Impact Assessment (CIA) <span className="text-red-500">*</span></h3>
                <p className="text-sm text-gray-600 mb-4">Select which CIA components are affected by this risk:</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                   <label className={`relative flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 group ${
                     errors.impact 
                       ? 'border-red-300 hover:border-red-400 hover:bg-red-50' 
                       : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
                   }`}>
                   <input
                     type="checkbox"
                     id="confidentiality"
                     checked={formData.impact?.includes('Confidentiality')}
                     onChange={(e) => handleImpactChange('Confidentiality', e.target.checked)}
                     className="sr-only"
                   />
                   <div className={`flex items-center justify-center w-5 h-5 border-2 rounded mr-3 transition-all duration-200 ${
                     formData.impact?.includes('Confidentiality')
                       ? 'bg-red-500 border-red-500'
                       : 'border-gray-300 group-hover:border-red-400'
                   }`}>
                     {formData.impact?.includes('Confidentiality') && (
                       <Icon name="check" size={12} className="text-white" />
                     )}
                   </div>
                   <div>
                     <div className="font-medium text-gray-900">Confidentiality</div>
                     <div className="text-xs text-gray-500">Data privacy & access control</div>
                   </div>
                 </label>

                 <label className={`relative flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 group ${
                   errors.impact 
                     ? 'border-red-300 hover:border-red-400 hover:bg-red-50' 
                     : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                 }`}>
                   <input
                     type="checkbox"
                     id="integrity"
                     checked={formData.impact?.includes('Integrity')}
                     onChange={(e) => handleImpactChange('Integrity', e.target.checked)}
                     className="sr-only"
                   />
                   <div className={`flex items-center justify-center w-5 h-5 border-2 rounded mr-3 transition-all duration-200 ${
                     formData.impact?.includes('Integrity')
                       ? 'bg-orange-500 border-orange-500'
                       : 'border-gray-300 group-hover:border-orange-400'
                   }`}>
                     {formData.impact?.includes('Integrity') && (
                       <Icon name="check" size={12} className="text-white" />
                     )}
                   </div>
                   <div>
                     <div className="font-medium text-gray-900">Integrity</div>
                     <div className="text-xs text-gray-500">Data accuracy & consistency</div>
                   </div>
                 </label>

                 <label className={`relative flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 group ${
                   errors.impact 
                     ? 'border-red-300 hover:border-red-400 hover:bg-red-50' 
                     : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                 }`}>
                   <input
                     type="checkbox"
                     id="availability"
                     checked={formData.impact?.includes('Availability')}
                     onChange={(e) => handleImpactChange('Availability', e.target.checked)}
                     className="sr-only"
                   />
                   <div className={`flex items-center justify-center w-5 h-5 border-2 rounded mr-3 transition-all duration-200 ${
                     formData.impact?.includes('Availability')
                       ? 'bg-blue-500 border-blue-500'
                       : 'border-gray-300 group-hover:border-blue-400'
                   }`}>
                     {formData.impact?.includes('Availability') && (
                       <Icon name="check" size={12} className="text-white" />
                     )}
                   </div>
                   <div>
                     <div className="font-medium text-gray-900">Availability</div>
                     <div className="text-xs text-gray-500">System accessibility & uptime</div>
                   </div>
                 </label>
                </div>
                {errors.impact && (
                  <p className="mt-2 text-sm text-red-600">{errors.impact}</p>
                )}
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

      {/* Information Assets Selection Modal */}
      {showAssetModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Icon name="file" size={20} className="text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Select Information Assets</h3>
              </div>
              <button
                onClick={closeAssetModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="x" size={20} />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-6 border-b border-gray-200">
              <div className="relative">
                <Icon name="magnifying-glass" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search assets by name or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Alphabet Filter */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setSelectedLetter('')}
                  className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                    selectedLetter === ''
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map((letter) => (
                  <button
                    key={letter}
                    onClick={() => setSelectedLetter(selectedLetter === letter ? '' : letter)}
                    className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                      selectedLetter === letter
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {letter}
                  </button>
                ))}
              </div>
            </div>

            {/* Assets List */}
            <div className="flex-1 overflow-y-auto p-6">
              {filteredAssets.length === 0 ? (
                <div className="text-center py-8">
                  <Icon name="magnifying-glass" size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No assets found matching your search criteria.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredAssets.map((asset) => (
                    <label
                      key={asset.id}
                      className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={tempSelectedAssets.includes(asset.id)}
                        onChange={(e) => handleAssetSelection(asset.id, e.target.checked)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{asset.informationAsset}</div>
                        <div className="text-xs text-gray-500">{asset.category}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                {tempSelectedAssets.length} asset{tempSelectedAssets.length !== 1 ? 's' : ''} selected
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={closeAssetModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyAssetSelection}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                >
                  Apply Selection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 