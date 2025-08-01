'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Icon from '@/app/components/Icon'
import { useToast } from '@/app/components/Toast'
import Tooltip from '@/app/components/Tooltip'

interface Risk {
  riskId: string
  riskStatement: string
  informationAsset: string
  likelihood: string
  impact: string
  riskLevel: string
}

interface TreatmentExtension {
  extendedDueDate: string
  approver: string
  dateApproved: string
  justification: string
}

interface Treatment {
  treatmentJiraTicket: string
  riskId: string
  riskTreatment: string
  riskTreatmentOwner: string
  dateRiskTreatmentDue: string
  extendedDueDate?: string
  numberOfExtensions: number
  completionDate?: string
  closureApproval: string
  closureApprovedBy?: string
  extensions: TreatmentExtension[]
  createdAt: string
  updatedAt: string
}

interface WorkshopFormData {
  date: string
  facilitator: string
  participants: string[]
  risks: string[]
  notes: string
}

type WorkshopFormErrors = {
  [K in keyof WorkshopFormData]?: string
}



export default function NewWorkshop() {
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [nextWorkshopId, setNextWorkshopId] = useState<string>('')
  const [errors, setErrors] = useState<WorkshopFormErrors>({})
  
  // New state for risks and treatments
  const [risks, setRisks] = useState<Risk[]>([])
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [selectedRiskId, setSelectedRiskId] = useState<string>('')
  const [selectedTreatments, setSelectedTreatments] = useState<string[]>([])
  const [loadingRisks, setLoadingRisks] = useState(false)
  const [loadingTreatments, setLoadingTreatments] = useState(false)
  
  // Modal state
  const [showRiskModal, setShowRiskModal] = useState(false)
  
  const [formData, setFormData] = useState<WorkshopFormData>({
    date: '',
    facilitator: '',
    participants: [],
    risks: [],
    notes: ''
  })

  const mandatoryFields = ['date', 'facilitator']

  // Helper function to truncate text
  const truncateText = (text: string, maxLength: number = 80) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  // Fetch existing workshops to determine next ID
  useEffect(() => {
    const fetchNextId = async () => {
      try {
        const response = await fetch('/api/workshops')
        const result = await response.json()
        
        if (result.success && result.data.length > 0) {
          // Find the highest workshop ID number
          const workshopIds = result.data
            .map((workshop: any) => workshop.id)
            .filter((id: string) => id && id.startsWith('WS-'))
            .map((id: string) => parseInt(id.replace('WS-', '')))
            .filter((num: number) => !isNaN(num))
          
          const maxId = Math.max(...workshopIds, 0)
          const nextId = maxId + 1
          setNextWorkshopId(`WS-${nextId.toString().padStart(3, '0')}`)
        } else {
          // If no workshops exist, start with WS-001
          setNextWorkshopId('WS-001')
        }
      } catch (error) {
        console.error('Error fetching workshops for ID generation:', error)
        setNextWorkshopId('WS-001')
      }
    }

    fetchNextId()
  }, [])

  // Fetch risks on component mount
  useEffect(() => {
    const fetchRisks = async () => {
      setLoadingRisks(true)
      try {
        const response = await fetch('/api/risks')
        const result = await response.json()
        
        if (result.success) {
          setRisks(result.data)
        } else {
          showToast({
            type: 'error',
            title: 'Error',
            message: 'Failed to fetch risks'
          })
        }
      } catch (error) {
        console.error('Error fetching risks:', error)
        showToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to fetch risks'
        })
      } finally {
        setLoadingRisks(false)
      }
    }

    fetchRisks()
  }, [showToast])

  // Fetch treatments when a risk is selected
  useEffect(() => {
    const fetchTreatments = async () => {
      if (!selectedRiskId) {
        setTreatments([])
        return
      }

      setLoadingTreatments(true)
      try {
        const response = await fetch(`/api/treatments/${selectedRiskId}`)
        const result = await response.json()
        
        if (result.success) {
          setTreatments(result.data)
        } else {
          showToast({
            type: 'error',
            title: 'Error',
            message: 'Failed to fetch treatments'
          })
        }
      } catch (error) {
        console.error('Error fetching treatments:', error)
        showToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to fetch treatments'
        })
      } finally {
        setLoadingTreatments(false)
      }
    }

    fetchTreatments()
  }, [selectedRiskId, showToast])

  const validateForm = (): boolean => {
    const newErrors: WorkshopFormErrors = {}

    // Validate required fields
    mandatoryFields.forEach(field => {
      const value = formData[field as keyof WorkshopFormData]
      if (typeof value === 'string' && !value.trim()) {
        newErrors[field as keyof WorkshopFormData] = 'This field is required'
      }
    })

    // Additional explicit validation for facilitator
    if (!formData.facilitator || !formData.facilitator.trim()) {
      newErrors.facilitator = 'Facilitator is required'
    }

    // Validate date is not in the past
    if (formData.date) {
      const selectedDate = new Date(formData.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (selectedDate < today) {
        newErrors.date = 'Workshop date cannot be in the past'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof WorkshopFormData, value: any) => {
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

  const handleArrayInputChange = (field: 'participants', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item.length > 0)
    setFormData(prev => ({
      ...prev,
      [field]: items
    }))
  }

  const handleRiskSelection = (riskId: string) => {
    setSelectedRiskId(riskId)
    setSelectedTreatments([])
  }

  const handleTreatmentSelection = (treatmentJiraTicket: string, checked: boolean) => {
    if (checked) {
      setSelectedTreatments(prev => [...prev, treatmentJiraTicket])
    } else {
      setSelectedTreatments(prev => prev.filter(id => id !== treatmentJiraTicket))
    }
  }

  const addSelectedRiskToWorkshop = () => {
    if (!selectedRiskId) return

    const selectedRisk = risks.find(risk => risk.riskId === selectedRiskId)
    if (!selectedRisk) return

    // Add the risk and its selected treatments to the form data
    const riskWithTreatments = {
      riskId: selectedRiskId,
      riskStatement: selectedRisk.riskStatement,
      treatments: selectedTreatments
    }

    setFormData(prev => ({
      ...prev,
      risks: [...prev.risks, JSON.stringify(riskWithTreatments)]
    }))

    // Reset selection
    setSelectedRiskId('')
    setSelectedTreatments([])
    setTreatments([])
  }

  const removeRiskFromWorkshop = (index: number) => {
    setFormData(prev => ({
      ...prev,
      risks: prev.risks.filter((_, i) => i !== index)
    }))
  }

  const getSelectedRiskData = () => {
    const result = formData.risks
      .map((riskJson, index) => {
        try {
          const parsed = JSON.parse(riskJson)
          if (parsed && typeof parsed === 'object' && parsed.riskId) {
            return { ...parsed, originalIndex: index }
          }
          return null
        } catch {
          return null
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
    
    return result
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fix the errors in the form before submitting'
      })
      return
    }

    setLoading(true)

    try {
      // Parse the risks data to get the structured format
      const parsedRisks = getSelectedRiskData()
      
      const workshopData = {
        id: nextWorkshopId,
        date: formData.date,
        status: 'Planned' as const,
        facilitator: formData.facilitator,
        participants: formData.participants,
        risks: parsedRisks, // Use the parsed risk data instead of raw strings
        notes: formData.notes || '',
        extensions: [],
        closure: [],
        newRisks: []
      }

      const response = await fetch('/api/workshops', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workshopData),
      })

      const result = await response.json()

      if (result.success) {
        showToast({
          type: 'success',
          title: 'Workshop Created',
          message: `Workshop ${nextWorkshopId} has been created successfully`
        })
        
        // Redirect to the new workshop page after a short delay
        setTimeout(() => {
          router.push(`/risk-management/workshops/${nextWorkshopId}`)
        }, 1500)
      } else {
        showToast({
          type: 'error',
          title: 'Creation Failed',
          message: result.error || 'Failed to create workshop. Please try again.'
        })
      }
    } catch (error) {
      console.error('Error creating workshop:', error)
      showToast({
        type: 'error',
        title: 'Network Error',
        message: 'An error occurred while creating the workshop. Please check your connection and try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/risk-management/workshops')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link
                href="/risk-management/workshops"
                className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Icon name="arrow-left" size={16} className="mr-2" />
                Back to Workshops
              </Link>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Create New Workshop</h1>
          </div>
          <p className="mt-2 text-gray-600">Schedule a new risk management workshop with the required information</p>
        </div>

                 {/* Workshop ID Display */}
         <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
           <div className="flex items-center justify-between">
             <p className="text-lg font-mono font-semibold text-purple-600">{nextWorkshopId}</p>
             <div className="flex items-center space-x-2">
               <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                 <Icon name="hourglass-half" size={12} className="mr-1" />
                 Planned
               </span>
             </div>
           </div>
         </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Mandatory Fields Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Icon name="exclamation-triangle" size={16} className="mr-2 text-red-500" />
                Required Information
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
                     className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors ${
                       errors.date 
                         ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                         : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                     }`}
                   />
                   {errors.date && (
                     <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                   )}
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
                     className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors ${
                       errors.facilitator 
                         ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                         : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                     }`}
                   />
                   {errors.facilitator && (
                     <p className="mt-1 text-sm text-red-600">{errors.facilitator}</p>
                   )}
                 </div>
               </div>
            </div>

            {/* Additional Information Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Icon name="information-circle" size={16} className="mr-2 text-blue-500" />
                Additional Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              {/* Risks to be discussed */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Risks to be discussed
                </label>
                
                                 {/* Risk Selection */}
                 <div className="mb-4">
                   <label className="block text-sm font-medium text-gray-600 mb-2">
                     Select a risk to discuss:
                   </label>
                   <button
                     type="button"
                     onClick={() => setShowRiskModal(true)}
                     className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-left focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-purple-500 focus:ring-purple-500 transition-colors hover:bg-gray-50"
                   >
                     {selectedRiskId ? (
                       <div className="flex items-center justify-between">
                         <span className="text-gray-900">
                           {risks.find(r => r.riskId === selectedRiskId)?.riskId} - {truncateText(risks.find(r => r.riskId === selectedRiskId)?.riskStatement || '')}
                         </span>
                         <Icon name="chevron-right" size={16} className="text-gray-400" />
                       </div>
                     ) : (
                       <div className="flex items-center justify-between">
                         <span className="text-gray-500">Choose a risk...</span>
                         <Icon name="chevron-right" size={16} className="text-gray-400" />
                       </div>
                     )}
                   </button>
                 </div>

                {/* Treatment Selection */}
                {selectedRiskId && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                      Treatments for selected risk:
                    </h3>
                    {loadingTreatments ? (
                      <div className="flex items-center text-sm text-gray-600">
                        <Icon name="arrow-clockwise" size={14} className="mr-2 animate-spin" />
                        Loading treatments...
                      </div>
                    ) : treatments.length === 0 ? (
                      <p className="text-sm text-gray-500">No treatments found for this risk.</p>
                    ) : (
                                             <div className="space-y-2">
                                                 {treatments.map(treatment => (
                           <div key={treatment.treatmentJiraTicket} className="flex items-start">
                             <input
                               type="checkbox"
                               id={`treatment-${selectedRiskId}-${treatment.treatmentJiraTicket}`}
                               checked={selectedTreatments.includes(treatment.treatmentJiraTicket)}
                               onChange={(e) => handleTreatmentSelection(treatment.treatmentJiraTicket, e.target.checked)}
                               className="mt-1 mr-3"
                             />
                             <div className="flex-1">
                               <label htmlFor={`treatment-${selectedRiskId}-${treatment.treatmentJiraTicket}`} className="text-sm text-gray-700 cursor-pointer">
                                 <div className="font-medium text-gray-900">{treatment.treatmentJiraTicket}</div>
                                 <div className="text-gray-700">{treatment.riskTreatment}</div>
                               </label>
                               <div className="flex items-center mt-1 space-x-4 text-xs text-gray-500">
                                 <span>Owner: {treatment.riskTreatmentOwner}</span>
                                 <span>Status: {treatment.closureApproval}</span>
                                 <span>Due: {treatment.extendedDueDate || treatment.dateRiskTreatmentDue}</span>
                               </div>
                             </div>
                           </div>
                         ))}
                       </div>
                    )}
                    
                    <button
                      type="button"
                      onClick={addSelectedRiskToWorkshop}
                      disabled={selectedTreatments.length === 0}
                      className="mt-4 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Icon name="plus" size={14} className="mr-2" />
                      Add Risk to Workshop
                    </button>
                  </div>
                )}

                {/* Selected Risks Display */}
                {getSelectedRiskData().length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                      Risks added to workshop:
                    </h3>
                                         <div className="space-y-2">
                       {getSelectedRiskData().map((risk, index) => (
                         <div key={`${risk.riskId}-${risk.originalIndex}`} className="flex items-start justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex-1">
                            <div className="flex items-center mb-1">
                              <span className="text-sm font-medium text-gray-900">{risk.riskId}</span>
                              <span className="ml-2 text-xs text-gray-500">({risk.treatments.length} treatments)</span>
                            </div>
                            <p className="text-sm text-gray-700">{risk.riskStatement}</p>
                          </div>
                                                     <button
                             type="button"
                             onClick={() => removeRiskFromWorkshop(risk.originalIndex)}
                             className="ml-3 text-red-500 hover:text-red-700 transition-colors"
                             title="Remove risk from workshop"
                           >
                                                         <Icon name="x-mark" size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                 disabled={loading}
                 className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
               >
                 {loading ? (
                   <div className="flex items-center">
                     <Icon name="arrow-clockwise" size={14} className="mr-2 animate-spin" />
                     Creating...
                   </div>
                 ) : (
                   <div className="flex items-center">
                     <Icon name="plus" size={14} className="mr-2" />
                     Create Workshop
                   </div>
                 )}
               </button>
             </div>
                     </form>
         </div>
       </div>

       {/* Risk Selection Modal */}
       {showRiskModal && (
         <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
           <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden border border-gray-200">
             {/* Modal Header */}
             <div className="flex items-center justify-between p-6 border-b border-gray-200">
               <h2 className="text-xl font-semibold text-gray-900">Select Risk to Discuss</h2>
               <button
                 type="button"
                 onClick={() => setShowRiskModal(false)}
                 className="text-gray-400 hover:text-gray-600 transition-colors"
               >
                 <Icon name="x-mark" size={20} />
               </button>
             </div>

             {/* Modal Content */}
             <div className="p-6 overflow-y-auto max-h-[60vh]">
               {loadingRisks ? (
                 <div className="flex items-center justify-center py-8">
                   <Icon name="arrow-clockwise" size={20} className="mr-3 animate-spin" />
                   <span className="text-gray-600">Loading risks...</span>
                 </div>
               ) : risks.length === 0 ? (
                 <div className="text-center py-8">
                   <Icon name="exclamation-triangle" size={48} className="mx-auto text-gray-400 mb-4" />
                   <p className="text-gray-600">No risks available. Add some risks in the risk management section.</p>
                 </div>
               ) : (
                 <div className="grid gap-3">
                   {risks.map(risk => (
                     <div
                       key={risk.riskId}
                       className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                         selectedRiskId === risk.riskId
                           ? 'border-purple-500 bg-purple-50'
                           : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                       }`}
                       onClick={() => {
                         handleRiskSelection(risk.riskId)
                         setShowRiskModal(false)
                       }}
                     >
                       <div className="flex items-start justify-between">
                         <div className="flex-1">
                           <div className="flex items-center mb-2">
                             <span className="text-sm font-semibold text-gray-900 mr-3">{risk.riskId}</span>
                             <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                               risk.riskLevel === 'High' ? 'bg-red-100 text-red-800' :
                               risk.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                               'bg-green-100 text-green-800'
                             }`}>
                               {risk.riskLevel}
                             </span>
                           </div>
                           <Tooltip content={risk.riskStatement}>
                             <p className="text-sm text-gray-700 mb-2">
                               {truncateText(risk.riskStatement, 100)}
                             </p>
                           </Tooltip>
                           <div className="flex items-center text-xs text-gray-500 space-x-4">
                             <span>Asset: {risk.informationAsset}</span>
                             <span>Likelihood: {risk.likelihood}</span>
                             <span>Impact: {risk.impact}</span>
                           </div>
                         </div>
                         <Icon 
                           name="chevron-right" 
                           size={16} 
                           className={`ml-3 transition-colors ${
                             selectedRiskId === risk.riskId ? 'text-purple-600' : 'text-gray-400'
                           }`} 
                         />
                       </div>
                     </div>
                   ))}
                 </div>
               )}
             </div>

             {/* Modal Footer */}
             <div className="flex justify-end p-6 border-t border-gray-200">
               <button
                 type="button"
                 onClick={() => setShowRiskModal(false)}
                 className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
               >
                 Cancel
               </button>
             </div>
           </div>
         </div>
       )}
     </div>
   )
}  