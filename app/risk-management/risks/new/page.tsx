'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Icon from '@/app/components/Icon'
import { useToast } from '@/app/components/Toast'
import RiskMatrix from '@/app/components/RiskMatrix'

interface InformationAsset {
  id: string
  informationAsset: string
  category: string
}

interface SOAControl {
  _id?: string
  id: string
  title: string
  description: string
  controlStatus: string
  controlApplicability: string
  justification?: string[]
  implementationDetails?: string
  relatedRisks?: string[]
  controlSetId: string
  controlSetTitle: string
  controlSetDescription: string
  createdAt?: string
  updatedAt?: string
}

interface RiskFormData {
  riskId: string
  functionalUnit: string
  jiraTicket: string
  dateRiskRaised: string
  raisedBy: string
  riskOwner: string
  affectedSites: string
  informationAsset: string[]
  threat: string
  vulnerability: string
  riskStatement: string
  impactCIA: string[]
  currentControls: string[]
  currentControlsReference: string[]
  applicableControlsAfterTreatment: string[]
  consequenceRating: string
  likelihoodRating: string
  riskRating: string
  riskAction: string
  reasonForAcceptance: string
  dateOfSSCApproval: string
  riskTreatments: string
  dateRiskTreatmentsApproved: string
  riskTreatmentAssignedTo: string
  residualConsequence: string
  residualLikelihood: string
  residualRiskRating: string
  residualRiskAcceptedByOwner: string
  dateResidualRiskAccepted: string
  dateRiskTreatmentCompleted: string
  currentPhase: string
}

type RiskFormErrors = {
  [K in keyof RiskFormData]?: string
}

export default function NewRisk() {
  const router = useRouter()
  const { showToast } = useToast()
  
  const [formData, setFormData] = useState<RiskFormData>({
    riskId: '',
    functionalUnit: '',
    jiraTicket: '',
    dateRiskRaised: '',
    raisedBy: '',
    riskOwner: '',
    affectedSites: '',
    informationAsset: [],
    threat: '',
    vulnerability: '',
    riskStatement: '',
    impactCIA: [],
    currentControls: [],
    currentControlsReference: [],
    applicableControlsAfterTreatment: [],
    consequenceRating: '',
    likelihoodRating: '',
    riskRating: '',
    riskAction: '',
    reasonForAcceptance: '',
    dateOfSSCApproval: '',
    riskTreatments: '',
    dateRiskTreatmentsApproved: '',
    riskTreatmentAssignedTo: '',
    residualConsequence: '',
    residualLikelihood: '',
    residualRiskRating: '',
    residualRiskAcceptedByOwner: '',
    dateResidualRiskAccepted: '',
    dateRiskTreatmentCompleted: '',
    currentPhase: 'Draft',
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<RiskFormErrors>({})
  const [informationAssets, setInformationAssets] = useState<InformationAsset[]>([])
  const [generatingRiskId, setGeneratingRiskId] = useState(false)
  
  // Modal states
  const [showAssetModal, setShowAssetModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [tempSelectedAssets, setTempSelectedAssets] = useState<string[]>([])
  const [selectedLetter, setSelectedLetter] = useState('')
  
  // SOA Controls Modal States
  const [showSOAControlsModal, setShowSOAControlsModal] = useState(false)
  const [soaControls, setSoaControls] = useState<SOAControl[]>([])
  const [soaSearchTerm, setSoaSearchTerm] = useState('')
  const [soaSelectedLetter, setSoaSelectedLetter] = useState('')
  const [soaModalType, setSoaModalType] = useState<'currentControlsReference' | 'applicableControlsAfterTreatment' | null>(null)
  const [tempSelectedSOAControls, setTempSelectedSOAControls] = useState<string[]>([])

  const mandatoryFields = ['raisedBy', 'informationAsset', 'threat', 'vulnerability', 'riskStatement', 'consequenceRating', 'likelihoodRating', 'riskRating', 'impactCIA', 'riskOwner', 'functionalUnit']

  // Fetch information assets and generate risk ID on component mount
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

    const fetchSOAControls = async () => {
      try {
        const response = await fetch('/api/compliance/soa')
        const result = await response.json()
        
        if (result.success) {
          setSoaControls(result.data)
        } else {
          console.error('Failed to fetch SOA controls:', result.error)
        }
      } catch (error) {
        console.error('Error fetching SOA controls:', error)
      }
    }

    const generateAndSetRiskId = async () => {
      try {
        setGeneratingRiskId(true)
        const nextRiskId = await generateNextRiskId()
        setFormData(prev => ({
          ...prev,
          riskId: nextRiskId
        }))
      } catch (error) {
        console.error('Error generating risk ID:', error)
        showToast({
          title: 'Warning',
          message: 'Failed to auto-generate risk ID. Please enter manually.',
          type: 'warning'
        })
      } finally {
        setGeneratingRiskId(false)
      }
    }

    fetchInformationAssets()
    fetchSOAControls()
    generateAndSetRiskId()
  }, [showToast])

  // Modal functions
  const openAssetModal = () => {
    setTempSelectedAssets([...formData.informationAsset])
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

  // SOA Controls Modal functions
  const openSOAControlsModal = (type: 'currentControlsReference' | 'applicableControlsAfterTreatment') => {
    setSoaModalType(type)
    setTempSelectedSOAControls([...formData[type]])
    setSoaSearchTerm('')
    setSoaSelectedLetter('')
    setShowSOAControlsModal(true)
  }

  const closeSOAControlsModal = () => {
    setShowSOAControlsModal(false)
    setSoaModalType(null)
    setSoaSearchTerm('')
    setSoaSelectedLetter('')
    setTempSelectedSOAControls([])
  }

  const handleSOAControlSelection = (controlId: string, checked: boolean) => {
    setTempSelectedSOAControls(prev => 
      checked 
        ? [...prev, controlId]
        : prev.filter(id => id !== controlId)
    )
  }

  const applySOAControlSelection = () => {
    if (soaModalType) {
      setFormData(prev => ({
        ...prev,
        [soaModalType]: tempSelectedSOAControls
      }))
      
      // Clear error when SOA controls are selected
      if (errors[soaModalType]) {
        setErrors(prev => ({
          ...prev,
          [soaModalType]: undefined
        }))
      }
    }
    
    closeSOAControlsModal()
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
      informationAsset: tempSelectedAssets
    }))
    
    // Clear error when information asset is selected
    if (errors.informationAsset) {
      setErrors(prev => ({
        ...prev,
        informationAsset: undefined
      }))
    }
    
    closeAssetModal()
  }

  const validateForm = (): boolean => {
    const newErrors: RiskFormErrors = {}

    mandatoryFields.forEach(field => {
      const value = formData[field as keyof RiskFormData]
      if (field === 'informationAsset') {
        if (!Array.isArray(value) || value.length === 0) {
          newErrors[field as keyof RiskFormData] = 'Please select at least one information asset'
        }
      } else if (typeof value === 'string' && !value.trim()) {
        newErrors[field as keyof RiskFormData] = 'This field is required'
      }
    })

    // Special validation for impact field (array)
    if (!formData.impactCIA || formData.impactCIA.length === 0) {
      newErrors.impactCIA = 'Please select at least one CIA component'
    }

    // Validate Risk ID format and presence
    if (!formData.riskId.trim()) {
      newErrors.riskId = 'Risk ID is required'
    } else {
      const riskIdPattern = /^RISK-\d+$/i
      if (!riskIdPattern.test(formData.riskId.trim())) {
        newErrors.riskId = 'Risk ID must be in format RISK-XXX (where XXX is numeric)'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof RiskFormData, value: string | string[]) => {
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
    if (field === 'riskId' && typeof value === 'string' && value.trim()) {
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
      impactCIA: checked 
        ? [...(prev.impactCIA || []), ciaValue]
        : (prev.impactCIA || []).filter(item => item !== ciaValue)
    }))
    
    // Clear error when CIA component is selected
    if (errors.impactCIA) {
      setErrors(prev => ({
        ...prev,
        impactCIA: undefined
      }))
    }
  }

  const handleRiskMatrixSelect = (args: {
    likelihoodIndex: number;
    consequenceIndex: number;
    likelihood: string;
    consequence: string;
    rating: string;
  }) => {
    setFormData(prev => ({
      ...prev,
      likelihoodRating: args.likelihood,
      consequenceRating: args.consequence,
      riskRating: args.rating
    }))
    
    // Clear errors when risk matrix selection is made
    if (errors.likelihoodRating) {
      setErrors(prev => ({
        ...prev,
        likelihoodRating: undefined
      }))
    }
    if (errors.consequenceRating) {
      setErrors(prev => ({
        ...prev,
        consequenceRating: undefined
      }))
    }
    if (errors.riskRating) {
      setErrors(prev => ({
        ...prev,
        riskRating: undefined
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

  // Generate next risk ID
  const generateNextRiskId = async (): Promise<string> => {
    try {
      const response = await fetch('/api/risks/next-id')
      const result = await response.json()
      
      if (result.success) {
        return result.data.nextRiskId
      } else {
        console.error('Failed to generate risk ID:', result.error)
        throw new Error(result.error || 'Failed to generate risk ID')
      }
    } catch (error) {
      console.error('Error generating risk ID:', error)
      // Fallback to a safe default
      return 'RISK-001'
    }
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
  const selectedAssetNames = formData.informationAsset.map(assetId => {
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
                    {generatingRiskId && (
                      <span className="ml-2 text-sm text-gray-500">(Generating...)</span>
                    )}
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      id="riskId"
                      value={formData.riskId}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-200 bg-gray-50 text-gray-700 rounded-md shadow-sm cursor-not-allowed"
                      placeholder={generatingRiskId ? "Generating..." : "Auto-generated"}
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          setGeneratingRiskId(true)
                          const nextRiskId = await generateNextRiskId()
                          setFormData(prev => ({
                            ...prev,
                            riskId: nextRiskId
                          }))
                          showToast({
                            title: 'Success',
                            message: 'New risk ID generated successfully',
                            type: 'success'
                          })
                        } catch (error) {
                          console.error('Error regenerating risk ID:', error)
                          showToast({
                            title: 'Error',
                            message: 'Failed to generate new risk ID',
                            type: 'error'
                          })
                        } finally {
                          setGeneratingRiskId(false)
                        }
                      }}
                      disabled={generatingRiskId}
                      className={`px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors ${
                        generatingRiskId
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50 focus:ring-purple-500'
                      }`}
                      title="Generate new risk ID"
                    >
                      <Icon name="refresh" size={16} />
                    </button>
                  </div>
                  {errors.riskId && (
                    <p className="mt-1 text-sm text-red-600">{errors.riskId}</p>
                  )}
                  {!errors.riskId && !generatingRiskId && formData.riskId && (
                    <p className="mt-1 text-sm text-green-600">✓ Auto-generated risk ID</p>
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

                {/* Risk Owner */}
                <div>
                  <label htmlFor="riskOwner" className="block text-sm font-medium text-gray-700 mb-2">
                    Risk Owner <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="riskOwner"
                    value={formData.riskOwner}
                    onChange={(e) => handleInputChange('riskOwner', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors ${
                      errors.riskOwner 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                    }`}
                    placeholder="Enter risk owner name"
                  />
                  {errors.riskOwner && (
                    <p className="mt-1 text-sm text-red-600">{errors.riskOwner}</p>
                  )}
                </div>

                {/* Functional Unit */}
                <div>
                  <label htmlFor="functionalUnit" className="block text-sm font-medium text-gray-700 mb-2">
                    Functional Unit <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="functionalUnit"
                    value={formData.functionalUnit}
                    onChange={(e) => handleInputChange('functionalUnit', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors ${
                      errors.functionalUnit 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                    }`}
                    placeholder="e.g., IT, Finance, HR"
                  />
                  {errors.functionalUnit && (
                    <p className="mt-1 text-sm text-red-600">{errors.functionalUnit}</p>
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
                      errors.informationAsset 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500 hover:border-purple-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={formData.informationAsset.length > 0 ? 'text-gray-900' : 'text-gray-500'}>
                        {formData.informationAsset.length > 0 
                          ? `${formData.informationAsset.length} asset${formData.informationAsset.length !== 1 ? 's' : ''} selected`
                          : 'Click to select information assets'
                        }
                      </span>
                      <Icon name="chevron-down" size={16} className="text-gray-400" />
                    </div>
                  </button>
                  
                  {/* Display selected assets as tags */}
                  {formData.informationAsset.length > 0 && (
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
                  
                  {errors.informationAsset && (
                    <p className="mt-1 text-sm text-red-600">{errors.informationAsset}</p>
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

              {/* Impact Assessment (CIA) */}
              <div className="mt-6">
                <h3 className="text-md font-medium text-gray-900 mb-3">Impact Assessment (CIA) <span className="text-red-500">*</span></h3>
                <p className="text-sm text-gray-600 mb-4">Select which CIA components are affected by this risk:</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className={`relative flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 group ${
                    errors.impactCIA 
                      ? 'border-red-300 hover:border-red-400 hover:bg-red-50' 
                      : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
                  }`}>
                    <input
                      type="checkbox"
                      id="confidentiality"
                      checked={formData.impactCIA?.includes('Confidentiality')}
                      onChange={(e) => handleImpactChange('Confidentiality', e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`flex items-center justify-center w-5 h-5 border-2 rounded mr-3 transition-all duration-200 ${
                      formData.impactCIA?.includes('Confidentiality')
                        ? 'bg-red-500 border-red-500'
                        : 'border-gray-300 group-hover:border-red-400'
                    }`}>
                      {formData.impactCIA?.includes('Confidentiality') && (
                        <Icon name="check" size={12} className="text-white" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Confidentiality</div>
                      <div className="text-xs text-gray-500">Data privacy & access control</div>
                    </div>
                  </label>

                  <label className={`relative flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 group ${
                    errors.impactCIA 
                      ? 'border-red-300 hover:border-red-400 hover:bg-red-50' 
                      : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                  }`}>
                    <input
                      type="checkbox"
                      id="integrity"
                      checked={formData.impactCIA?.includes('Integrity')}
                      onChange={(e) => handleImpactChange('Integrity', e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`flex items-center justify-center w-5 h-5 border-2 rounded mr-3 transition-all duration-200 ${
                      formData.impactCIA?.includes('Integrity')
                        ? 'bg-orange-500 border-orange-500'
                        : 'border-gray-300 group-hover:border-orange-400'
                    }`}>
                      {formData.impactCIA?.includes('Integrity') && (
                        <Icon name="check" size={12} className="text-white" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Integrity</div>
                      <div className="text-xs text-gray-500">Data accuracy & consistency</div>
                    </div>
                  </label>

                  <label className={`relative flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 group ${
                    errors.impactCIA 
                      ? 'border-red-300 hover:border-red-400 hover:bg-red-50' 
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}>
                    <input
                      type="checkbox"
                      id="availability"
                      checked={formData.impactCIA?.includes('Availability')}
                      onChange={(e) => handleImpactChange('Availability', e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`flex items-center justify-center w-5 h-5 border-2 rounded mr-3 transition-all duration-200 ${
                      formData.impactCIA?.includes('Availability')
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-gray-300 group-hover:border-blue-400'
                    }`}>
                      {formData.impactCIA?.includes('Availability') && (
                        <Icon name="check" size={12} className="text-white" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Availability</div>
                      <div className="text-xs text-gray-500">System accessibility & uptime</div>
                    </div>
                  </label>
                </div>
                {errors.impactCIA && (
                  <p className="mt-2 text-sm text-red-600">{errors.impactCIA}</p>
                )}
              </div>
            </div>

            {/* Risk Assessment Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Icon name="chart-bar" size={16} className="mr-2 text-purple-500" />
                Risk Assessment
              </h2>
              <p className="text-sm text-gray-600 mb-4">Click on a cell in the risk matrix below to automatically set the likelihood, consequence, and risk rating:</p>
              
              {/* Risk Matrix */}
              <div className="mb-6">
                <RiskMatrix
                  onSelect={handleRiskMatrixSelect}
                  isEditing={true}
                  compact={false}
                  selected={
                    formData.likelihoodRating && formData.consequenceRating
                      ? {
                          likelihoodIndex: ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'].indexOf(formData.likelihoodRating),
                          consequenceIndex: ['Insignificant', 'Minor', 'Moderate', 'Major', 'Critical'].indexOf(formData.consequenceRating)
                        }
                      : null
                  }
                  // For new risk creation, we only edit current risk, not residual
                  currentRisk={null}
                  residualRisk={null}
                  // Disable residual risk editing for new risks
                  onResidualRiskSelect={undefined}
                />
              </div>


            </div>

            {/* Optional Fields Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Icon name="plus-circle" size={16} className="mr-2 text-gray-500" />
                Additional Information (Optional)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">




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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Controls
                  </label>
                  <div className="space-y-2">
                    {formData.currentControls.map((control, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={control}
                          onChange={(e) => {
                            const newControls = [...formData.currentControls]
                            newControls[index] = e.target.value
                            handleInputChange('currentControls', newControls)
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                          placeholder="Enter current control..."
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newControls = formData.currentControls.filter((_, i) => i !== index)
                            handleInputChange('currentControls', newControls)
                          }}
                          className="px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                          title="Remove control"
                        >
                          <Icon name="x" size={16} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const newControls = [...formData.currentControls, '']
                        handleInputChange('currentControls', newControls)
                      }}
                      className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-purple-400 hover:text-purple-600 transition-colors flex items-center justify-center"
                    >
                      <Icon name="plus" size={16} className="mr-2" />
                      Add Current Control
                    </button>
                  </div>
                </div>

                {/* Current Controls Reference */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Controls Reference
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Select controls from the SOA that are currently implemented or applicable to this risk
                  </p>
                  <div className="space-y-2">
                    {formData.currentControlsReference.map((controlRef, index) => {
                      const soaControl = soaControls.find(control => control.id === controlRef)
                      return (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50">
                            <div className="font-mono text-purple-600 text-sm">{controlRef}</div>
                            {soaControl && (
                              <div className="text-gray-700 text-xs mt-1">{soaControl.title}</div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newControlRefs = formData.currentControlsReference.filter((_, i) => i !== index)
                              handleInputChange('currentControlsReference', newControlRefs)
                            }}
                            className="px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                            title="Remove control reference"
                          >
                            <Icon name="x" size={16} />
                          </button>
                        </div>
                      )
                    })}
                    <button
                      type="button"
                      onClick={() => openSOAControlsModal('currentControlsReference')}
                      className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-purple-400 hover:text-purple-600 transition-colors flex items-center justify-center"
                    >
                      <Icon name="plus" size={16} className="mr-2" />
                      Select SOA Controls
                    </button>
                  </div>
                </div>

                {/* Applicable Controls After Treatment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Applicable Controls After Treatment
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Select controls from the SOA that will be applicable after implementing risk treatments
                  </p>
                  <div className="space-y-2">
                    {formData.applicableControlsAfterTreatment.map((control, index) => {
                      const soaControl = soaControls.find(controlItem => controlItem.id === control)
                      return (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50">
                            <div className="font-mono text-purple-600 text-sm">{control}</div>
                            {soaControl && (
                              <div className="text-gray-700 text-xs mt-1">{soaControl.title}</div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newControls = formData.applicableControlsAfterTreatment.filter((_, i) => i !== index)
                              handleInputChange('applicableControlsAfterTreatment', newControls)
                            }}
                            className="px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                            title="Remove control"
                          >
                            <Icon name="x" size={16} />
                          </button>
                        </div>
                      )
                    })}
                    <button
                      type="button"
                      onClick={() => openSOAControlsModal('applicableControlsAfterTreatment')}
                      className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-purple-400 hover:text-purple-600 transition-colors flex items-center justify-center"
                    >
                      <Icon name="plus" size={16} className="mr-2" />
                      Select SOA Controls
                    </button>
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

      {/* SOA Controls Selection Modal */}
      {showSOAControlsModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Icon name="shield-check" size={20} className="text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Select SOA Controls - {soaModalType === 'currentControlsReference' ? 'Current Controls Reference' : 'Applicable Controls After Treatment'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Select controls from the SOA to reference in this risk assessment
                </p>
              </div>
              <button
                onClick={closeSOAControlsModal}
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
                  placeholder="Search SOA controls by ID (e.g., A.5.1), title, or description..."
                  value={soaSearchTerm}
                  onChange={(e) => setSoaSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Alphabet Filter */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setSoaSelectedLetter('')}
                  className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                    soaSelectedLetter === ''
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map((letter) => (
                  <button
                    key={letter}
                    onClick={() => setSoaSelectedLetter(soaSelectedLetter === letter ? '' : letter)}
                    className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                      soaSelectedLetter === letter
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {letter}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Controls Summary */}
            {tempSelectedSOAControls.length > 0 && (
              <div className="px-6 py-3 bg-purple-50 border-b border-purple-200">
                <div className="text-sm font-medium text-purple-800 mb-2">
                  Selected Controls ({tempSelectedSOAControls.length}):
                </div>
                <div className="flex flex-wrap gap-2">
                  {tempSelectedSOAControls.map((controlId) => {
                    const control = soaControls.find(c => c.id === controlId)
                    return (
                      <span
                        key={controlId}
                        className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                      >
                        <span className="font-mono mr-1">{controlId}</span>
                        {control && <span className="text-purple-600">- {control.title}</span>}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}

            {/* SOA Controls List */}
            <div className="flex-1 overflow-y-auto p-6">
              {(() => {
                let filteredControls = soaControls
                
                // Filter by search term
                if (soaSearchTerm) {
                  const searchLower = soaSearchTerm.toLowerCase()
                  filteredControls = filteredControls.filter(control => 
                    control.id.toLowerCase().includes(searchLower) ||
                    control.title.toLowerCase().includes(searchLower) ||
                    control.description.toLowerCase().includes(searchLower)
                  )
                }
                
                // Filter by selected letter
                if (soaSelectedLetter) {
                  filteredControls = filteredControls.filter(control => 
                    control.id.startsWith(soaSelectedLetter)
                  )
                }
                
                return filteredControls.length === 0 ? (
                  <div className="text-center py-8">
                    <Icon name="magnifying-glass" size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No SOA controls found matching your search criteria.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredControls.map((control) => (
                      <label
                        key={control.id}
                        className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={tempSelectedSOAControls.includes(control.id)}
                          onChange={(e) => handleSOAControlSelection(control.id, e.target.checked)}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{control.id}</div>
                          <div className="text-sm text-gray-700">{control.title}</div>
                          <div className="text-xs text-gray-500">{control.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                )
              })()}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                {tempSelectedSOAControls.length} control{tempSelectedSOAControls.length !== 1 ? 's' : ''} selected
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={closeSOAControlsModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applySOAControlSelection}
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