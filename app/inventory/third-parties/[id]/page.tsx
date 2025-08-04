'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Icon from '@/app/components/Icon'
import Link from 'next/link'

interface ThirdParty {
  id: string
  vendorId: string
  vendorName: string
  informationAssetIds: string[]
  functionalUnit: string
  vendorContact: string
  internalContact: string
  entity: string
  startDate: string
  endDate: string
  riskAssessmentJiraTicket: string
  dataPrivacy: string
  securityReviewJiraTicket: string
  lastSecurityReviewDate: string
  status: string
}

interface InformationAsset {
  id: string
  informationAsset: string
  category: string
}

export default function ThirdPartyDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [thirdParty, setThirdParty] = useState<ThirdParty | null>(null)
  const [informationAssets, setInformationAssets] = useState<InformationAsset[]>([])
  const [formData, setFormData] = useState<ThirdParty | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchThirdParty(params.id as string)
      fetchInformationAssets()
    }
  }, [params.id])

  const fetchThirdParty = async (id: string) => {
    try {
      const response = await fetch(`/api/third-parties/${id}`)
      const result = await response.json()
      
      if (result.success) {
        setThirdParty(result.data)
        setFormData(result.data)
      } else {
        console.error('Failed to fetch third party:', result.error)
        alert('Failed to fetch third party details.')
      }
    } catch (error) {
      console.error('Error fetching third party:', error)
      alert('Error fetching third party details.')
    } finally {
      setLoading(false)
    }
  }

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

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    } catch (error) {
      return dateString
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => prev ? ({
      ...prev,
      [name]: value
    }) : null)
  }

  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name } = e.target
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value)
    setFormData(prev => prev ? ({
      ...prev,
      [name]: selectedOptions
    }) : null)
  }

  const getInformationAssetName = (assetId: string) => {
    const asset = informationAssets.find(a => a.id === assetId)
    return asset ? asset.informationAsset : assetId
  }

  const getInformationAssetsDisplay = (assetIds: string[]) => {
    if (assetIds.length === 0) return <span>-</span>
    if (assetIds.length === 1) {
      const assetName = getInformationAssetName(assetIds[0])
      return (
        <Link 
          href={`/inventory/information-assets/${assetIds[0]}`}
          className="text-blue-600 hover:text-blue-800 underline"
        >
          {assetName}
        </Link>
      )
    }
    
    // Multiple assets - show list
    return (
      <div className="space-y-1">
        {assetIds.map((id, index) => {
          const assetName = getInformationAssetName(id)
          return (
            <div key={index}>
              <Link 
                href={`/inventory/information-assets/${id}`}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                {assetName}
              </Link>
            </div>
          )
        })}
      </div>
    )
  }

  const handleSave = async () => {
    if (!formData) return
    
    setSaving(true)
    try {
      const response = await fetch(`/api/third-parties/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        setThirdParty(formData)
        setEditing(false)
        alert('Third party updated successfully!')
      } else {
        console.error('Failed to update third party:', result.error)
        alert('Failed to update third party. Please try again.')
      }
    } catch (error) {
      console.error('Error updating third party:', error)
      alert('Error updating third party. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this third party? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/third-parties/${params.id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        router.push('/inventory/third-parties')
      } else {
        console.error('Failed to delete third party:', result.error)
        alert('Failed to delete third party. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting third party:', error)
      alert('Error deleting third party. Please try again.')
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading third party details...</p>
        </div>
      </div>
    )
  }

  if (!thirdParty) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Icon name="exclamation-circle" size={48} />
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: '#22223B' }}>Third Party Not Found</h3>
          <p className="text-gray-600 mb-4" style={{ color: '#22223B' }}>
            The requested third party could not be found.
          </p>
          <Link
            href="/inventory/third-parties"
            className="px-4 py-2 text-white rounded-lg transition-colors"
            style={{ backgroundColor: '#898AC4' }}
          >
            Back to Third Parties
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900" style={{ color: '#22223B' }}>
            {editing ? 'Edit Third Party' : thirdParty.vendorName}
          </h1>
          <p className="text-gray-600 mt-2" style={{ color: '#22223B' }}>
            {editing ? 'Update third party information' : `Vendor ID: ${thirdParty.vendorId}`}
          </p>
        </div>
        <div className="flex space-x-3">
          <Link
            href="/inventory/third-parties"
            className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <Icon name="arrow-left" size={16} />
            <span>Back to Third Parties</span>
          </Link>
          {!editing && (
            <>
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 text-white rounded-lg transition-colors flex items-center space-x-2"
                style={{ backgroundColor: '#898AC4' }}
              >
                <Icon name="pencil" size={16} />
                <span>Edit</span>
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <Icon name="trash" size={16} />
                <span>Delete</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {editing ? (
          // Edit Form
          <div className="space-y-6">
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
                  value={formData?.vendorId || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  value={formData?.vendorName || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  value={formData?.informationAssetIds || []}
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
                  value={formData?.functionalUnit || ''}
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
                  value={formData?.vendorContact || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  value={formData?.internalContact || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  value={formData?.entity || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  value={formData?.startDate || ''}
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
                  value={formData?.endDate || ''}
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
                  value={formData?.riskAssessmentJiraTicket || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  value={formData?.dataPrivacy || ''}
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
                  value={formData?.securityReviewJiraTicket || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  value={formData?.lastSecurityReviewDate || ''}
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
                  value={formData?.status || ''}
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

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setEditing(false)
                  setFormData(thirdParty)
                }}
                className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
                style={{ backgroundColor: '#898AC4' }}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Icon name="check" size={16} />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          // View Mode
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vendor ID</label>
              <p className="text-gray-900">{thirdParty.vendorId}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vendor Name</label>
              <p className="text-gray-900">{thirdParty.vendorName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Information Assets</label>
              <div className="text-gray-900">
                {getInformationAssetsDisplay(thirdParty.informationAssetIds)}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Functional Unit</label>
              <p className="text-gray-900">{thirdParty.functionalUnit}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vendor Contact</label>
              <p className="text-gray-900">{thirdParty.vendorContact}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Internal Contact</label>
              <p className="text-gray-900">{thirdParty.internalContact}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Entity</label>
              <p className="text-gray-900">{thirdParty.entity}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <p className="text-gray-900">{formatDate(thirdParty.startDate)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <p className="text-gray-900">{formatDate(thirdParty.endDate)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Risk Assessment Jira Ticket</label>
              <p className="text-blue-600 hover:text-blue-800 cursor-pointer">{thirdParty.riskAssessmentJiraTicket || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data Privacy Risk Assessment</label>
              <p className="text-blue-600 hover:text-blue-800 cursor-pointer">{thirdParty.dataPrivacy || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Security Review Jira Ticket</label>
              <p className="text-blue-600 hover:text-blue-800 cursor-pointer">{thirdParty.securityReviewJiraTicket || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Security Review Date</label>
              <p className="text-gray-900">{formatDate(thirdParty.lastSecurityReviewDate)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                thirdParty.status.toLowerCase() === 'active' ? 'bg-green-100 text-green-800' :
                thirdParty.status.toLowerCase() === 'inactive' ? 'bg-red-100 text-red-800' :
                thirdParty.status.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                thirdParty.status.toLowerCase() === 'expired' ? 'bg-gray-100 text-gray-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {thirdParty.status}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 