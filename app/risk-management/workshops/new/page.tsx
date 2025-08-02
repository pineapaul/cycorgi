'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Icon from '@/app/components/Icon'
import { useToast } from '@/app/components/Toast'
import Tooltip from '@/app/components/Tooltip'

interface WorkshopFormData {
  date: string
  securitySteeringCommittee: string
  facilitator: string
  participants: string[]
  risks: string[]
  notes: string
}

type WorkshopFormErrors = {
  [K in keyof WorkshopFormData]?: string
}

const VALID_SECURITY_COMMITTEES = [
  'Core Systems Engineering',
  'Software Engineering', 
  'IP Engineering'
] as const

export default function NewWorkshop() {
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [nextWorkshopId, setNextWorkshopId] = useState<string>('')
  const [errors, setErrors] = useState<WorkshopFormErrors>({})
  
  const [formData, setFormData] = useState<WorkshopFormData>({
    date: '',
    securitySteeringCommittee: '',
    facilitator: '',
    participants: [],
    risks: [],
    notes: ''
  })

  const mandatoryFields = ['date', 'securitySteeringCommittee']

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

  const validateForm = (): boolean => {
    const newErrors: WorkshopFormErrors = {}

    mandatoryFields.forEach(field => {
      const value = formData[field as keyof WorkshopFormData]
      if (typeof value === 'string' && !value.trim()) {
        newErrors[field as keyof WorkshopFormData] = 'This field is required'
      }
    })

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

  const handleArrayInputChange = (field: 'participants' | 'risks', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item.length > 0)
    setFormData(prev => ({
      ...prev,
      [field]: items
    }))
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
      const workshopData = {
        id: nextWorkshopId,
        date: formData.date,
        status: 'Planned' as const,
        facilitator: formData.facilitator || '',
        participants: formData.participants,
        risks: formData.risks,
        securitySteeringCommittee: formData.securitySteeringCommittee,
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

                {/* Security Steering Committee */}
                <div>
                  <label htmlFor="securitySteeringCommittee" className="block text-sm font-medium text-gray-700 mb-2">
                    Security Steering Committee <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="securitySteeringCommittee"
                    value={formData.securitySteeringCommittee}
                    onChange={(e) => handleInputChange('securitySteeringCommittee', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors ${
                      errors.securitySteeringCommittee 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                    }`}
                  >
                    <option value="">Select a committee</option>
                    {VALID_SECURITY_COMMITTEES.map((committee) => (
                      <option key={committee} value={committee}>
                        {committee}
                      </option>
                    ))}
                  </select>
                  {errors.securitySteeringCommittee && (
                    <p className="mt-1 text-sm text-red-600">{errors.securitySteeringCommittee}</p>
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
                {/* Facilitator */}
                <div>
                  <label htmlFor="facilitator" className="block text-sm font-medium text-gray-700 mb-2">
                    Facilitator
                  </label>
                  <input
                    type="text"
                    id="facilitator"
                    value={formData.facilitator}
                    onChange={(e) => handleInputChange('facilitator', e.target.value)}
                    placeholder="Enter facilitator name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-purple-500 focus:ring-purple-500 transition-colors"
                  />
                </div>

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

              {/* Related Risks */}
              <div className="mt-6">
                <label htmlFor="risks" className="block text-sm font-medium text-gray-700 mb-2">
                  Related Risks
                </label>
                <input
                  type="text"
                  id="risks"
                  value={formData.risks.join(', ')}
                  onChange={(e) => handleArrayInputChange('risks', e.target.value)}
                  placeholder="Enter risk IDs separated by commas (e.g., RISK-001, RISK-002)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-purple-500 focus:ring-purple-500 transition-colors"
                />
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
    </div>
  )
} 