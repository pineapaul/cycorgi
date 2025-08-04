'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Icon from '@/app/components/Icon'
import Link from 'next/link'

interface InformationAsset {
  id: string
  informationAsset: string
  category: string
}

export default function NewThirdPartyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [informationAssets, setInformationAssets] = useState<InformationAsset[]>([])
  const [formData, setFormData] = useState({
    vendorId: '',
    vendorName: '',
    informationAssetIds: [] as string[],
    functionalUnit: '',
    vendorContact: '',
    internalContact: '',
    entity: '',
    startDate: '',
    endDate: '',
    riskAssessmentJiraTicket: '',
    dataPrivacy: '',
    securityReviewJiraTicket: '',
    lastSecurityReviewDate: '',
    status: 'Active'
  })

  useEffect(() => {
    fetchInformationAssets()
  }, [])

  const fetchInformationAssets = async () => {
    try {
      const response = await fetch('/api/information-assets')
      const result = await response.json()
      
      if (result.success) {
        setInformationAssets(result.data)
      }
    } catch (error) {
      console.error('Error fetching information assets:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name } = e.target
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value)
    setFormData(prev => ({
      ...prev,
      [name]: selectedOptions
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/third-parties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        router.push('/inventory/third-parties')
      } else {
        console.error('Failed to create third party:', result.error)
        alert('Failed to create third party. Please try again.')
      }
    } catch (error) {
      console.error('Error creating third party:', error)
      alert('Error creating third party. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const functionalUnits = [
    'IT Infrastructure',
    'Cloud Services',
    'Customer Success',
    'Development',
    'Security Operations',
    'Legal',
    'Marketing',
    'Communication',
    'Security',
    'IT Operations'
  ]

  const dataPrivacyOptions = [
    'DPR-2023-001',
    'DPR-2023-002',
    'DPR-2023-003',
    'DPR-2023-004',
    'DPR-2023-005',
    'DPR-2023-006',
    'DPR-2023-007',
    'DPR-2023-008',
    'DPR-2023-009',
    'DPR-2023-010',
    'DPR-2023-011',
    'DPR-2023-012',
    'DPR-2023-013',
    'DPR-2023-014',
    'DPR-2023-015',
    'DPR-2022-010',
    'DPR-2022-015',
    'DPR-2022-020',
    'DPR-2022-022',
    'DPR-2022-025',
    'DPR-2022-030',
    'DPR-2022-035'
  ]

  const statusOptions = [
    'Active',
    'Inactive',
    'Pending',
    'Expired'
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900" style={{ color: '#22223B' }}>
            Add New Third Party
          </h1>
          <p className="text-gray-600 mt-2" style={{ color: '#22223B' }}>
            Create a new third party relationship record
          </p>
        </div>
        <Link
          href="/inventory/third-parties"
          className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
        >
          <Icon name="arrow-left" size={16} />
          <span>Back to Third Parties</span>
        </Link>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Vendor ID */}
            <div>
              <label htmlFor="vendorId" className="block text-sm font-medium text-gray-700 mb-2">
                Vendor ID *
              </label>
              <input
                type="text"
                id="vendorId"
                name="vendorId"
                value={formData.vendorId}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., VEND-001"
              />
            </div>

            {/* Vendor Name */}
            <div>
              <label htmlFor="vendorName" className="block text-sm font-medium text-gray-700 mb-2">
                Vendor Name *
              </label>
              <input
                type="text"
                id="vendorName"
                name="vendorName"
                value={formData.vendorName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Microsoft Corporation"
              />
            </div>

            {/* Information Asset IDs */}
            <div>
              <label htmlFor="informationAssetIds" className="block text-sm font-medium text-gray-700 mb-2">
                Information Assets *
              </label>
              <select
                id="informationAssetIds"
                name="informationAssetIds"
                value={formData.informationAssetIds}
                onChange={handleMultiSelectChange}
                required
                multiple
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px]"
              >
                {informationAssets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.id} - {asset.informationAsset} ({asset.category})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Hold Ctrl (or Cmd on Mac) to select multiple assets
              </p>
            </div>

            {/* Functional Unit */}
            <div>
              <label htmlFor="functionalUnit" className="block text-sm font-medium text-gray-700 mb-2">
                Functional Unit *
              </label>
              <select
                id="functionalUnit"
                name="functionalUnit"
                value={formData.functionalUnit}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Functional Unit</option>
                {functionalUnits.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>

            {/* Vendor Contact */}
            <div>
              <label htmlFor="vendorContact" className="block text-sm font-medium text-gray-700 mb-2">
                Vendor Contact *
              </label>
              <input
                type="text"
                id="vendorContact"
                name="vendorContact"
                value={formData.vendorContact}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., John Smith (john.smith@vendor.com)"
              />
            </div>

            {/* Internal Contact */}
            <div>
              <label htmlFor="internalContact" className="block text-sm font-medium text-gray-700 mb-2">
                Internal Contact *
              </label>
              <input
                type="text"
                id="internalContact"
                name="internalContact"
                value={formData.internalContact}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Sarah Johnson (sarah.johnson@company.com)"
              />
            </div>

            {/* Entity */}
            <div>
              <label htmlFor="entity" className="block text-sm font-medium text-gray-700 mb-2">
                Entity *
              </label>
              <input
                type="text"
                id="entity"
                name="entity"
                value={formData.entity}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Microsoft Azure"
              />
            </div>

            {/* Start Date */}
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* End Date */}
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Risk Assessment Jira Ticket */}
            <div>
              <label htmlFor="riskAssessmentJiraTicket" className="block text-sm font-medium text-gray-700 mb-2">
                Risk Assessment Jira Ticket
              </label>
              <input
                type="text"
                id="riskAssessmentJiraTicket"
                name="riskAssessmentJiraTicket"
                value={formData.riskAssessmentJiraTicket}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., SEC-2023-001"
              />
            </div>

            {/* Data Privacy Risk Assessment */}
            <div>
              <label htmlFor="dataPrivacy" className="block text-sm font-medium text-gray-700 mb-2">
                Data Privacy Risk Assessment Jira Ticket
              </label>
              <input
                type="text"
                id="dataPrivacy"
                name="dataPrivacy"
                value={formData.dataPrivacy}
                onChange={handleInputChange}
                placeholder="e.g., DPR-2023-001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Security Review Jira Ticket */}
            <div>
              <label htmlFor="securityReviewJiraTicket" className="block text-sm font-medium text-gray-700 mb-2">
                Security Review Jira Ticket
              </label>
              <input
                type="text"
                id="securityReviewJiraTicket"
                name="securityReviewJiraTicket"
                value={formData.securityReviewJiraTicket}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., SEC-2023-002"
              />
            </div>

            {/* Last Security Review Date */}
            <div>
              <label htmlFor="lastSecurityReviewDate" className="block text-sm font-medium text-gray-700 mb-2">
                Last Security Review Date
              </label>
              <input
                type="date"
                id="lastSecurityReviewDate"
                name="lastSecurityReviewDate"
                value={formData.lastSecurityReviewDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Link
              href="/inventory/third-parties"
              className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
              style={{ backgroundColor: '#898AC4' }}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Icon name="plus" size={16} />
                  <span>Create Third Party</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 