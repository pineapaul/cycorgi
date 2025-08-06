'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Icon from '../../../../components/Icon'
import { useToast } from '../../../../components/Toast'
import { validateRiskId, getCIAConfig, formatInformationAssets } from '../../../../../lib/utils'
import DataTable from '../../../../components/DataTable'
import { TREATMENT_STATUS, CIA_DELIMITERS } from '../../../../../lib/constants'
import { useBackNavigation } from '../../../../hooks/useBackNavigation'

interface Extension {
  extendedDueDate: string
  approver: string
  dateApproved: string
  justification?: string
}

interface Treatment {
  _id: string
  riskId: string
  treatmentId: string
  treatmentJira?: string
  riskTreatment: string
  riskTreatmentOwner: string
  dateRiskTreatmentDue: string
  extendedDueDate?: string
  numberOfExtensions: number
  completionDate?: string
  closureApproval: string
  closureApprovedBy?: string
  notes?: string
  extensions: Extension[]
  createdAt: string
  updatedAt: string
}

interface Risk {
  _id: string
  riskId: string
  riskTitle: string
  riskStatement: string
  currentPhase: string
  informationAsset: string
  functionalUnit: string
  threat: string
  vulnerability: string
  impact: string | string[]
  consequenceRating: string
  likelihoodRating: string
  riskRating: string
  riskOwner: string
  raisedBy: string
  createdAt: string
  updatedAt: string
}

// Custom tooltip component - moved outside main component for better performance
interface CustomTooltipProps {
  hoveredCIA: string | null
  tooltipPosition: { x: number; y: number }
}

const CustomTooltip = ({ hoveredCIA, tooltipPosition }: CustomTooltipProps) => {
  if (!hoveredCIA) return null

  return (
    <div 
      className="fixed z-50 pointer-events-none"
      style={{
        left: tooltipPosition.x,
        top: tooltipPosition.y,
        transform: 'translateX(-50%) translateY(-100%)'
      }}
    >
      <div className="text-white text-xs rounded-lg p-3 shadow-lg whitespace-nowrap" style={{ backgroundColor: '#4C1D95' }}>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Impact Value:</span>
            <span className="ml-2">{hoveredCIA}</span>
          </div>
        </div>
        <div className="absolute top-full left-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent transform -translate-x-1/2" style={{ borderTopColor: '#4C1D95' }}></div>
      </div>
    </div>
  )
}

export default function TreatmentInformation() {
  const params = useParams()
  const router = useRouter()
  const { showToast } = useToast()
  const { goBack } = useBackNavigation({
    fallbackRoute: `/risk-management/register/${validateRiskId(params.riskId as string)}`
  })
  const [treatment, setTreatment] = useState<Treatment | null>(null)
  const [risk, setRisk] = useState<Risk | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showExtensionForm, setShowExtensionForm] = useState(false)
  const [extensionFormData, setExtensionFormData] = useState({
    extendedDueDate: '',
    justification: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [modalRef, setModalRef] = useState<HTMLDivElement | null>(null)
  const [previousActiveElement, setPreviousActiveElement] = useState<HTMLElement | null>(null)
  const [hoveredCIA, setHoveredCIA] = useState<string | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  
  // Get validated riskId from params
  const riskId = validateRiskId(params.riskId as string)

  // Memoized mouse event handlers for better performance
  const handleMouseEnter = useCallback((cia: string, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    })
    setHoveredCIA(cia)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setHoveredCIA(null)
  }, [])

  // Custom renderer for CIA values with memoization
  const renderCIAValues = useCallback((value: string | string[]) => {
    if (!value || value === 'Not specified') {
      return (
        <span className="text-gray-400 text-xs italic">Not specified</span>
      )
    }

    // Handle both string and array formats with robust parsing
    let ciaValues: string[] = []
    
    if (Array.isArray(value)) {
      ciaValues = value.filter(item => item && typeof item === 'string')
    } else if (typeof value === 'string') {
      // Use multiple delimiters for more robust parsing
      ciaValues = value
        .split(CIA_DELIMITERS.ALTERNATIVES) // Split by comma, semicolon, or pipe
        .map(item => item.trim())
        .filter(item => item.length > 0)
    }

    if (ciaValues.length === 0) {
      return (
        <span className="text-gray-400 text-xs italic">Not specified</span>
      )
    }

    return (
      <div className="flex gap-1.5 overflow-hidden">
        {ciaValues.map((cia, index) => {
          try {
            const config = getCIAConfig(cia)
            if (!config) {
              // Fallback for unknown CIA values
              return (
                <div key={index} className="relative">
                  <span 
                    className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border bg-gray-50 text-gray-700 border-gray-200 transition-all duration-200 hover:scale-105 flex-shrink-0 cursor-help"
                    onMouseEnter={(e) => handleMouseEnter(cia, e)}
                    onMouseLeave={handleMouseLeave}
                  >
                    {cia.charAt(0).toUpperCase()}
                  </span>
                </div>
              )
            }
            
            return (
              <div key={index} className="relative">
                <span 
                  className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${config.bg} ${config.text} ${config.border} transition-all duration-200 hover:scale-105 flex-shrink-0 cursor-help`}
                  onMouseEnter={(e) => handleMouseEnter(cia, e)}
                  onMouseLeave={handleMouseLeave}
                >
                  {config.label}
                </span>
              </div>
            )
          } catch (error) {
            // Fallback for any errors in CIA config
            console.warn(`Error rendering CIA value "${cia}":`, error)
            return (
              <div key={index} className="relative">
                <span 
                  className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border bg-gray-50 text-gray-700 border-gray-200 transition-all duration-200 hover:scale-105 flex-shrink-0 cursor-help"
                  onMouseEnter={(e) => handleMouseEnter(cia, e)}
                  onMouseLeave={handleMouseLeave}
                >
                  {cia.charAt(0).toUpperCase()}
                </span>
              </div>
            )
          }
        })}
      </div>
    )
  }, [handleMouseEnter, handleMouseLeave])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null) // Clear any previous errors
      // riskId is already validated above
      const treatmentId = params.id as string

      if (!riskId) {
        throw new Error('Invalid risk ID format. Expected format: RISK-XXX')
      }

      // Fetch treatment details
      const treatmentResponse = await fetch(`/api/treatments/${riskId}/${treatmentId}`)
      if (!treatmentResponse.ok) {
        const errorData = await treatmentResponse.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${treatmentResponse.status}: Failed to fetch treatment details`)
      }
      const treatmentData = await treatmentResponse.json()

      // Fetch risk details
      const riskResponse = await fetch(`/api/risks/${riskId}`)
      if (!riskResponse.ok) {
        const errorData = await riskResponse.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${riskResponse.status}: Failed to fetch risk details`)
      }
      const riskResponseData = await riskResponse.json()

      setTreatment(treatmentData)
      setRisk(riskResponseData.data) // Extract data property from risk API response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      console.error('Treatment fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [params.riskId, params.id])

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '-'
    
    const day = date.getDate().toString().padStart(2, '0')
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    const year = date.getFullYear()
    
    return `${day} ${month} ${year}`
  }

  const getClosureStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case TREATMENT_STATUS.APPROVED.toLowerCase():
        return 'bg-green-100 text-green-800 border-green-200'
      case TREATMENT_STATUS.PENDING.toLowerCase():
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case TREATMENT_STATUS.REJECTED.toLowerCase():
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRiskLevelColor = (level: string | undefined | null) => {
    if (!level || typeof level !== 'string') return 'bg-gray-100 text-gray-800'
    
    switch (level.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleExtensionFormChange = (field: string, value: string) => {
    setExtensionFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleExtensionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!extensionFormData.extendedDueDate || !extensionFormData.justification.trim()) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fill in all required fields.'
      })
      return
    }

    // Validate that the extended due date is today or in the future
    const selectedDate = new Date(extensionFormData.extendedDueDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time to start of day for fair comparison
    
    if (selectedDate < today) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Extended due date must be today or a future date.'
      })
      return
    }

    setSubmitting(true)
    
    try {
      const response = await fetch(`/api/treatments/${riskId}/${params.id}/extensions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          extendedDueDate: extensionFormData.extendedDueDate,
          justification: extensionFormData.justification.trim()
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to submit extension request')
      }

      showToast({
        type: 'success',
        title: 'Extension Request Submitted',
        message: 'Your extension request has been submitted successfully.'
      })

      // Reset form and close modal
      setExtensionFormData({ extendedDueDate: '', justification: '' })
      setShowExtensionForm(false)
      
      // Refetch data to show the new extension
      await fetchData()
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred'
      showToast({
        type: 'error',
        title: 'Submission Failed',
        message: errorMessage
      })
    } finally {
      setSubmitting(false)
    }
  }

  const closeExtensionForm = () => {
    setShowExtensionForm(false)
    setExtensionFormData({ extendedDueDate: '', justification: '' })
    // Restore focus to the previous active element
    if (previousActiveElement) {
      previousActiveElement.focus()
    }
  }

  // Focus management for modal
  useEffect(() => {
    if (showExtensionForm) {
      // Store the currently focused element
      setPreviousActiveElement(document.activeElement as HTMLElement)
      
      // Focus the first focusable element in the modal
      const firstFocusableElement = modalRef?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement
      
      if (firstFocusableElement) {
        firstFocusableElement.focus()
      }
    }
  }, [showExtensionForm, modalRef])

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showExtensionForm) {
        closeExtensionForm()
      }
    }

    if (showExtensionForm) {
      document.addEventListener('keydown', handleEscapeKey)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
      document.body.style.overflow = 'unset'
    }
  }, [showExtensionForm])

  // Handle tab key to trap focus within modal
  const handleTabKey = (event: React.KeyboardEvent) => {
    if (!modalRef) return

    const focusableElements = modalRef.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }
  }

  // Loading State
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

  // Error State
  if (error || !treatment || !risk) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Icon name="exclamation-triangle" size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Treatment Not Found</h2>
          <p className="text-gray-600 mb-4">
            {error || 'The treatment could not be found.'}
          </p>
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
    <div className="space-y-6">
      {/* Treatment Information Container */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={goBack}
              className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 hover:bg-gray-200 bg-white border border-gray-300"
              title="Go back to previous page"
            >
              <Icon name="arrow-left" size={16} />
            </button>
                         <div>
               <h1 className="text-2xl font-bold" style={{ color: '#22223B' }}>
                 {treatment.treatmentId} - Treatment Details
               </h1>
             </div>
          </div>
          
                     <div className="flex items-center space-x-2">
             <button
               onClick={() => {
                 const url = window.location.href
                 navigator.clipboard.writeText(url).then(() => {
                   showToast({
                     type: 'success',
                     title: 'Link Copied',
                     message: 'Treatment page link has been copied to clipboard.'
                   })
                 })
               }}
               className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
               title="Copy link to treatment page"
             >
               <Icon name="link" size={16} className="mr-2" />
               Copy Link
             </button>
                           <button
                onClick={() => setShowExtensionForm(true)}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Request an extension for this treatment"
              >
                <Icon name="calendar-plus" size={16} className="mr-2" />
                Request Extension
              </button>
             <button
               onClick={() => router.push(`/risk-management/treatments/${riskId}/${params.id}/edit`)}
               className="inline-flex items-center px-3 py-2 text-sm font-medium text-white rounded-lg transition-colors"
               style={{ backgroundColor: '#4C1D95' }}
               title="Edit treatment details"
             >
                              <Icon name="pencil" size={16} className="mr-2" />
               Edit Treatment
             </button>

          </div>
        </div>
        
                 {/* Treatment Statement - Prominent Display */}
         <div className="bg-gray-50 rounded-lg p-4 border-l-4 mb-4" style={{ borderLeftColor: '#4C1D95' }}>
           <label className="block text-sm font-semibold text-gray-700 mb-2">Treatment Description</label>
           <p className="text-gray-900 leading-relaxed text-sm">{treatment.riskTreatment || 'No description provided'}</p>
         </div>

                                                           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Treatment Details and Risk Context */}
              <div className="space-y-4">
               {/* Treatment Details Section */}
               <div>
                 <div className="flex items-center mb-3">
                   <div className="w-1 h-4 bg-purple-600 rounded-full mr-3"></div>
                   <h3 className="text-base font-semibold text-gray-900">Treatment Details</h3>
                 </div>
                 
                 <div className="bg-gray-50 rounded-lg p-3">
                   <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                     <div>
                       <span className="text-xs text-gray-500 uppercase tracking-wide">Treatment Owner</span>
                       <p className="text-sm text-gray-900 mt-1 font-medium">{treatment.riskTreatmentOwner || 'Not assigned'}</p>
                     </div>
                     <div>
                       <span className="text-xs text-gray-500 uppercase tracking-wide">Due Date</span>
                       <p className="text-sm text-gray-900 mt-1">{formatDate(treatment.dateRiskTreatmentDue)}</p>
                     </div>
                     <div>
                       <span className="text-xs text-gray-500 uppercase tracking-wide">Status</span>
                       <div className="mt-1">
                         <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getClosureStatusColor(treatment.closureApproval)}`}>
                           {treatment.closureApproval}
                         </span>
                       </div>
                     </div>
                     <div>
                       <span className="text-xs text-gray-500 uppercase tracking-wide">Extensions</span>
                       <p className="text-sm text-gray-900 mt-1">{treatment.numberOfExtensions}</p>
                     </div>
                     {treatment.extendedDueDate && (
                       <div>
                         <span className="text-xs text-gray-500 uppercase tracking-wide">Extended Due Date</span>
                         <p className="text-sm text-gray-900 mt-1">{formatDate(treatment.extendedDueDate)}</p>
                       </div>
                     )}
                     {treatment.completionDate && (
                       <div>
                         <span className="text-xs text-gray-500 uppercase tracking-wide">Completion Date</span>
                         <p className="text-sm text-gray-900 mt-1">{formatDate(treatment.completionDate)}</p>
                       </div>
                     )}
                     {treatment.closureApprovedBy && (
                       <div>
                         <span className="text-xs text-gray-500 uppercase tracking-wide">Approved By</span>
                         <p className="text-sm text-gray-900 mt-1">{treatment.closureApprovedBy}</p>
                       </div>
                     )}
                   </div>
                 </div>
               </div>

               {/* Risk Context Section */}
               <div>
                 <div className="flex items-center mb-3">
                   <div className="w-1 h-4 bg-purple-600 rounded-full mr-3"></div>
                   <h3 className="text-base font-semibold text-gray-900">Risk Context</h3>
                 </div>
                 
                 <div className="bg-gray-50 rounded-lg p-3 border-l-4" style={{ borderLeftColor: '#4C1D95' }}>
                   {/* Risk Statement */}
                   <div className="mb-2">
                     <h4 className="text-sm font-semibold text-gray-700 mb-1">Risk Statement</h4>
                     <p className="text-gray-900 leading-relaxed text-sm">{risk.riskStatement}</p>
                   </div>
                   
                   {/* Risk Information Grid */}
                   <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Current Risk Rating</span>
                      <div className="mt-1 relative group">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium cursor-help ${getRiskLevelColor(risk.riskRating)}`}>
                          {risk.riskRating || 'Not specified'}
                        </span>
                        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10">
                          <div className="text-white text-xs rounded-lg p-3 shadow-lg" style={{ backgroundColor: '#4C1D95' }}>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span>Consequence:</span>
                                <span className={`ml-2 px-1 py-0.5 rounded text-xs ${getRiskLevelColor(risk.consequenceRating)}`}>
                                  {risk.consequenceRating}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Likelihood:</span>
                                <span className={`ml-2 px-1 py-0.5 rounded text-xs ${getRiskLevelColor(risk.likelihoodRating)}`}>
                                  {risk.likelihoodRating}
                                </span>
                              </div>
                            </div>
                            <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent" style={{ borderTopColor: '#4C1D95' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Information Asset</span>
                      <p className="text-sm text-gray-900 mt-1">
                        {formatInformationAssets(risk.informationAsset)}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Functional Unit</span>
                      <p className="text-sm text-gray-900 mt-1">{risk.functionalUnit}</p>
                    </div>
                                         <div>
                       <span className="text-xs text-gray-500 uppercase tracking-wide">Impact</span>
                       <div className="mt-1">
                         {renderCIAValues(risk.impact)}
                       </div>
                     </div>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              {treatment.notes && (
                <div>
                  <div className="flex items-center mb-3">
                    <div className="w-1 h-4 bg-purple-600 rounded-full mr-3"></div>
                    <h3 className="text-base font-semibold text-gray-900">Treatment Notes</h3>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-900">{treatment.notes}</p>
                  </div>
                </div>
              )}
             </div>

                           {/* Right Column - Due Date Extensions */}
              <div>
               <div className="flex items-center mb-3">
                 <div className="w-1 h-4 bg-purple-600 rounded-full mr-3"></div>
                 <h3 className="text-base font-semibold text-gray-900">Due Date Extensions</h3>
               </div>
               
               {treatment.extensions && treatment.extensions.length > 0 ? (
                 <DataTable
                   columns={[
                     {
                       key: 'extendedDueDate',
                       label: 'Extended Due Date',
                       sortable: true,
                       render: (value) => formatDate(value)
                     },
                     {
                       key: 'justification',
                       label: 'Justification',
                       sortable: true,
                       render: (value) => value || 'Not specified'
                     },
                     {
                       key: 'approver',
                       label: 'Approved By',
                       sortable: true
                     },
                     {
                       key: 'dateApproved',
                       label: 'Approved Date',
                       sortable: true,
                       render: (value) => formatDate(value)
                     }
                   ]}
                   data={treatment.extensions}
                   title="Due Date Extensions"
                 />
               ) : (
                 <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                   <div className="text-center">
                     <Icon name="calendar" size={24} className="text-gray-400 mx-auto mb-2" />
                     <p className="text-sm text-gray-500">No extensions requested yet</p>
                     <p className="text-xs text-gray-400 mt-1">Use the "Request Extension" button to add one</p>
                   </div>
                 </div>
               )}
             </div>
                       </div>
       </div>

               {/* Extension Request Form Modal */}
        {showExtensionForm && (
          <div 
            className="fixed inset-0 backdrop-blur-lg flex items-center justify-center z-50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                closeExtensionForm()
              }
            }}
          >
           <div 
             ref={setModalRef}
             className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
             onKeyDown={handleTabKey}
           >
             {/* Header */}
             <div className="flex items-center justify-between p-6 border-b border-gray-200">
               <h2 id="modal-title" className="text-lg font-semibold text-gray-900">Request Extension</h2>
               <button
                 onClick={closeExtensionForm}
                 className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors"
                 title="Close"
                 aria-label="Close extension request form"
               >
                 <Icon name="close" size={16} className="text-gray-500" />
               </button>
             </div>

             {/* Form */}
             <form onSubmit={handleExtensionSubmit} className="p-6 space-y-4">
               <div>
                 <label htmlFor="extendedDueDate" className="block text-sm font-medium text-gray-700 mb-2">
                   Extended Due Date <span className="text-red-500">*</span>
                 </label>
                 <input
                   type="date"
                   id="extendedDueDate"
                   name="extendedDueDate"
                   value={extensionFormData.extendedDueDate}
                   onChange={(e) => handleExtensionFormChange('extendedDueDate', e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                   required
                   min={new Date().toISOString().split('T')[0]}
                   aria-describedby="date-help"
                 />
                 <p id="date-help" className="text-xs text-gray-500 mt-1">
                   Must be today or a future date
                 </p>
               </div>

               <div>
                 <label htmlFor="justification" className="block text-sm font-medium text-gray-700 mb-2">
                   Justification <span className="text-red-500">*</span>
                 </label>
                 <textarea
                   id="justification"
                   name="justification"
                   value={extensionFormData.justification}
                   onChange={(e) => handleExtensionFormChange('justification', e.target.value)}
                   rows={4}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                   placeholder="Please provide a detailed justification for the extension request..."
                   required
                   aria-describedby="justification-help"
                 />
               </div>

               {/* Form Actions */}
               <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                 <button
                   type="button"
                   onClick={closeExtensionForm}
                   className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                   disabled={submitting}
                   aria-label="Cancel extension request"
                 >
                   Cancel
                 </button>
                 <button
                   type="submit"
                   className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                   style={{ backgroundColor: '#4C1D95' }}
                   disabled={submitting}
                   aria-label={submitting ? "Submitting extension request" : "Submit extension request"}
                 >
                   {submitting ? (
                     <div className="flex items-center">
                       <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                       Submitting...
                     </div>
                   ) : (
                     'Submit Request'
                   )}
                 </button>
               </div>
             </form>
           </div>
         </div>
       )}

               {/* Custom Tooltip */}
        <CustomTooltip hoveredCIA={hoveredCIA} tooltipPosition={tooltipPosition} />
     </div>
   )
 } 