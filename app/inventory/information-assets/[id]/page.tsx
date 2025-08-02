'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Icon from '@/app/components/Icon'
import { useBackNavigation } from '@/app/hooks/useBackNavigation'
import { useToast } from '@/app/components/Toast'

interface InformationAsset {
  id: string
  informationAsset: string
  category: string
  type: string
  description: string
  location: string
  owner: string
  sme: string
  administrator: string
  agileReleaseTrain: string
  confidentiality: string
  integrity: string
  availability: string
  criticality: string
  additionalInfo: string
}

export default function AssetProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { showToast } = useToast()
  const { goBack } = useBackNavigation({
    fallbackRoute: '/inventory/information-assets'
  })
  const [asset, setAsset] = useState<InformationAsset | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedAsset, setEditedAsset] = useState<InformationAsset | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchAsset(params.id as string)
    }
  }, [params.id])

  const fetchAsset = async (id: string) => {
    try {
      setLoading(true)
      // First try to fetch the specific asset directly
      const response = await fetch(`/api/information-assets/${id}`)
      const result = await response.json()
      
      if (result.success) {
        setAsset(result.data)
        setEditedAsset(result.data)
      } else {
        // Fallback to fetching all assets and finding the one we need
        const allAssetsResponse = await fetch('/api/information-assets')
        const allAssetsResult = await allAssetsResponse.json()
        
        if (allAssetsResult.success) {
          const foundAsset = allAssetsResult.data.find((a: InformationAsset) => a.id === id)
          if (foundAsset) {
            setAsset(foundAsset)
            setEditedAsset(foundAsset)
          } else {
            setError('Asset not found')
          }
        } else {
          setError(allAssetsResult.error || 'Failed to fetch asset')
        }
      }
    } catch (err) {
      setError('Failed to fetch asset details')
      console.error('Error fetching asset:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedAsset(asset)
  }

  const handleSave = async () => {
    if (!editedAsset) return

    try {
      setSaving(true)
      const response = await fetch(`/api/information-assets/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedAsset),
      })

      const result = await response.json()
      
      if (result.success) {
        setAsset(editedAsset)
        setIsEditing(false)
      } else {
        setError(result.error || 'Failed to update asset')
      }
    } catch (err) {
      setError('Failed to update asset')
      console.error('Error updating asset:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this asset? This action cannot be undone.')) {
      return
    }

    try {
      setSaving(true)
      const response = await fetch(`/api/information-assets/${params.id}`, {
        method: 'DELETE',
      })

      const result = await response.json()
      
      if (result.success) {
        router.push('/inventory/information-assets')
      } else {
        setError(result.error || 'Failed to delete asset')
      }
    } catch (err) {
      setError('Failed to delete asset')
      console.error('Error deleting asset:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleCopyLink = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url).then(() => {
      showToast({
        type: 'success',
        title: 'Link copied to clipboard!'
      })
    }).catch(() => {
      showToast({
        type: 'error',
        title: 'Failed to copy link to clipboard'
      })
    })
  }

  const handleFieldChange = (field: keyof InformationAsset, value: string) => {
    if (!editedAsset) return
    setEditedAsset({
      ...editedAsset,
      [field]: value
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#898AC4' }}></div>
          <p className="mt-4" style={{ color: '#22223B' }}>Loading asset details...</p>
        </div>
      </div>
    )
  }

  if (error || !asset) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <Icon name="warning" size={48} />
        </div>
        <h3 className="text-lg font-semibold mb-2" style={{ color: '#22223B' }}>Error Loading Asset</h3>
        <p className="text-gray-600 mb-4" style={{ color: '#22223B' }}>{error || 'Asset not found'}</p>
        <button
          onClick={goBack}
          className="px-4 py-2 rounded-lg transition-colors"
          style={{ backgroundColor: '#898AC4', color: 'white' }}
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
              {isEditing ? 'Edit Asset' : asset.informationAsset}
            </h1>
            <p className="text-gray-600" style={{ color: '#22223B' }}>
              Asset Profile
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {!isEditing && (
            <>
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Copy link to asset"
              >
                <Icon name="link" size={16} className="mr-2" />
                Copy Link
              </button>
              <button
                onClick={handleEdit}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                style={{ backgroundColor: '#4C1D95' }}
                title="Edit asset"
              >
                <Icon name="pencil" size={16} className="mr-2" />
                Edit
              </button>
            </>
          )}
          {isEditing && (
            <>
              <button
                onClick={handleCancel}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50"
                style={{ backgroundColor: '#4C1D95' }}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Icon name="check" size={16} className="mr-2" />
                    Save
                  </>
                )}
              </button>
            </>
          )}
          <button
            onClick={handleDelete}
            disabled={saving}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
            title="Delete asset"
          >
            <Icon name="trash" size={16} className="mr-2" />
            Delete
          </button>
        </div>
      </div>

      {/* Asset Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#22223B' }}>Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Asset Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedAsset?.informationAsset || ''}
                  onChange={(e) => handleFieldChange('informationAsset', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{asset.informationAsset}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              {isEditing ? (
                <select
                  value={editedAsset?.category || ''}
                  onChange={(e) => handleFieldChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Customer Data">Customer Data</option>
                  <option value="HR Data">HR Data</option>
                  <option value="Financial Data">Financial Data</option>
                  <option value="Intellectual Property">Intellectual Property</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Security">Security</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Legal">Legal</option>
                  <option value="Communication">Communication</option>
                </select>
              ) : (
                <p className="text-gray-900">{asset.category}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              {isEditing ? (
                <select
                  value={editedAsset?.type || ''}
                  onChange={(e) => handleFieldChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Database">Database</option>
                  <option value="Documents">Documents</option>
                  <option value="Code Repository">Code Repository</option>
                  <option value="Network">Network</option>
                  <option value="Credentials">Credentials</option>
                  <option value="Backup">Backup</option>
                  <option value="Media">Media</option>
                  <option value="Development">Development</option>
                  <option value="API">API</option>
                  <option value="Email">Email</option>
                  <option value="Logs">Logs</option>
                </select>
              ) : (
                <p className="text-gray-900">{asset.type}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              {isEditing ? (
                <textarea
                  value={editedAsset?.description || ''}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{asset.description}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedAsset?.location || ''}
                  onChange={(e) => handleFieldChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{asset.location}</p>
              )}
            </div>
          </div>

          {/* Ownership & Access */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#22223B' }}>Ownership & Access</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedAsset?.owner || ''}
                  onChange={(e) => handleFieldChange('owner', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{asset.owner}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject Matter Expert (SME)</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedAsset?.sme || ''}
                  onChange={(e) => handleFieldChange('sme', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{asset.sme}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Administrator</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedAsset?.administrator || ''}
                  onChange={(e) => handleFieldChange('administrator', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{asset.administrator}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Agile Release Train</label>
              {isEditing ? (
                <select
                  value={editedAsset?.agileReleaseTrain || ''}
                  onChange={(e) => handleFieldChange('agileReleaseTrain', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ART-1">ART-1</option>
                  <option value="ART-2">ART-2</option>
                  <option value="ART-3">ART-3</option>
                  <option value="ART-4">ART-4</option>
                  <option value="ART-5">ART-5</option>
                </select>
              ) : (
                <p className="text-gray-900">{asset.agileReleaseTrain}</p>
              )}
            </div>
          </div>
        </div>

        {/* Security Classification */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#22223B' }}>Security Classification</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confidentiality</label>
              {isEditing ? (
                <select
                  value={editedAsset?.confidentiality || ''}
                  onChange={(e) => handleFieldChange('confidentiality', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              ) : (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  asset.confidentiality === 'High' ? 'bg-red-100 text-red-800' :
                  asset.confidentiality === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  asset.confidentiality === 'Low' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {asset.confidentiality}
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Integrity</label>
              {isEditing ? (
                <select
                  value={editedAsset?.integrity || ''}
                  onChange={(e) => handleFieldChange('integrity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              ) : (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  asset.integrity === 'High' ? 'bg-red-100 text-red-800' :
                  asset.integrity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  asset.integrity === 'Low' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {asset.integrity}
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
              {isEditing ? (
                <select
                  value={editedAsset?.availability || ''}
                  onChange={(e) => handleFieldChange('availability', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              ) : (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  asset.availability === 'Critical' ? 'bg-red-100 text-red-800' :
                  asset.availability === 'High' ? 'bg-orange-100 text-orange-800' :
                  asset.availability === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  asset.availability === 'Low' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {asset.availability}
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Criticality</label>
              {isEditing ? (
                <select
                  value={editedAsset?.criticality || ''}
                  onChange={(e) => handleFieldChange('criticality', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="mission-critical">Mission Critical</option>
                  <option value="business-critical">Business Critical</option>
                  <option value="standard">Standard</option>
                  <option value="non-critical">Non Critical</option>
                </select>
              ) : (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  asset.criticality === 'mission-critical' ? 'bg-red-100 text-red-800' :
                  asset.criticality === 'business-critical' ? 'bg-orange-100 text-orange-800' :
                  asset.criticality === 'standard' ? 'bg-blue-100 text-blue-800' :
                  asset.criticality === 'non-critical' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {asset.criticality.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-8">
          <label className="block text-sm font-medium text-gray-700 mb-1">Additional Information</label>
          {isEditing ? (
            <textarea
              value={editedAsset?.additionalInfo || ''}
              onChange={(e) => handleFieldChange('additionalInfo', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter any additional information about this asset..."
            />
          ) : (
            <p className="text-gray-900">{asset.additionalInfo}</p>
          )}
        </div>
      </div>
    </div>
  )
} 