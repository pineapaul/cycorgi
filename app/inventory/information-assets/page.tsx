'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DataTable, { Column } from '@/app/components/DataTable'
import Icon from '@/app/components/Icon'
import Tooltip from '@/app/components/Tooltip'
import { useToast } from '@/app/components/Toast'
import { 
  CONFIDENTIALITY_LEVELS, 
  INTEGRITY_LEVELS, 
  AVAILABILITY_LEVELS,
  type ConfidentialityLevel,
  type IntegrityLevel,
  type AvailabilityLevel
} from '@/lib/constants'

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

export default function InformationAssetsPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [assets, setAssets] = useState<InformationAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [showFilter, setShowFilter] = useState(false)
  const [showColumns, setShowColumns] = useState(false)
  const [activeTab, setActiveTab] = useState<'assets' | 'cia' | 'decommissioning'>('assets')
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set([
    'informationAsset', 'category', 'type', 'description', 'location', 'owner', 
    'sme', 'administrator', 'agileReleaseTrain', 'confidentiality', 'integrity', 
    'availability', 'criticality', 'additionalInfo', 'actions'
  ]))

  useEffect(() => {
    fetchAssets()
  }, [])

  const fetchAssets = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/information-assets')
      const result = await response.json()
      
      if (result.success) {
        setAssets(result.data)
      } else {
        setError(result.error || 'Failed to fetch assets')
      }
    } catch (err) {
      setError('Failed to fetch information assets')
      console.error('Error fetching assets:', err)
    } finally {
      setLoading(false)
    }
  }

  const allColumns: Column[] = [
    {
      key: 'informationAsset',
      label: 'Information Asset',
      sortable: true,
      width: '200px',
      align: 'center',
      render: (value, row) => (
        <button
          onClick={(e) => {
            e.stopPropagation()
            router.push(`/inventory/information-assets/${row.id}`)
          }}
          className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
        >
          {value}
        </button>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      width: '150px',
      align: 'center',
      render: (value, row) => (
        <div className="flex items-center space-x-2">
          <Tooltip content="View Profile">
            <button
              onClick={(e) => {
                e.stopPropagation()
                window.location.href = `/inventory/information-assets/${row.id}`
              }}
              className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 hover:bg-blue-100 bg-white border border-gray-300"
            >
              <Icon name="eye" size={14} className="text-blue-600" />
            </button>
          </Tooltip>
          <Tooltip content="Copy Link">
            <button
              onClick={(e) => {
                e.stopPropagation()
                const url = `${window.location.origin}/inventory/information-assets/${row.id}`
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
              }}
              className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 hover:bg-green-100 bg-white border border-gray-300"
            >
              <Icon name="link" size={14} className="text-green-600" />
            </button>
          </Tooltip>
          <Tooltip content="Delete Asset">
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (confirm('Are you sure you want to delete this asset? This action cannot be undone.')) {
                  handleDeleteAsset(row.id)
                }
              }}
              className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 hover:bg-red-100 bg-white border border-gray-300"
            >
              <Icon name="trash" size={14} className="text-red-600" />
            </button>
          </Tooltip>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      width: '120px'
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      width: '120px'
    },
    {
      key: 'description',
      label: 'Description',
      sortable: false,
      render: (value) => {
        const cellValue = value ? String(value) : '-'
        return (
          <Tooltip content={cellValue} theme="dark">
            <span className="truncate block max-w-full">
              {cellValue}
            </span>
          </Tooltip>
        )
      }
    },
    {
      key: 'location',
      label: 'Location',
      sortable: true,
      width: '150px'
    },
    {
      key: 'owner',
      label: 'Owner',
      sortable: true,
      width: '120px'
    },
    {
      key: 'sme',
      label: 'SME',
      sortable: true,
      width: '120px'
    },
    {
      key: 'administrator',
      label: 'Administrator',
      sortable: true,
      width: '130px'
    },
    {
      key: 'agileReleaseTrain',
      label: 'Agile Release Train',
      sortable: true,
      width: '150px'
    },
    {
      key: 'confidentiality',
      label: 'Confidentiality',
      sortable: true,
      width: '130px',
      render: (value) => {
        const confidentialityValue = value as ConfidentialityLevel
        const getConfidentialityColor = (level: ConfidentialityLevel) => {
          switch (level) {
            case CONFIDENTIALITY_LEVELS.STRICTLY_CONFIDENTIAL:
              return 'bg-red-100 text-red-800'
            case CONFIDENTIALITY_LEVELS.CONFIDENTIAL:
              return 'bg-orange-100 text-orange-800'
            case CONFIDENTIALITY_LEVELS.INTERNAL_USE:
              return 'bg-yellow-100 text-yellow-800'
            case CONFIDENTIALITY_LEVELS.PUBLIC:
              return 'bg-green-100 text-green-800'
            default:
              return 'bg-gray-100 text-gray-800'
          }
        }
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidentialityColor(confidentialityValue)}`}>
            {confidentialityValue}
          </span>
        )
      }
    },
    {
      key: 'integrity',
      label: 'Integrity',
      sortable: true,
      width: '100px',
      render: (value) => {
        const integrityValue = value as IntegrityLevel
        const getIntegrityColor = (level: IntegrityLevel) => {
          switch (level) {
            case INTEGRITY_LEVELS.HIGH:
              return 'bg-red-100 text-red-800'
            case INTEGRITY_LEVELS.MODERATE:
              return 'bg-yellow-100 text-yellow-800'
            case INTEGRITY_LEVELS.LOW:
              return 'bg-green-100 text-green-800'
            default:
              return 'bg-gray-100 text-gray-800'
          }
        }
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getIntegrityColor(integrityValue)}`}>
            {integrityValue}
          </span>
        )
      }
    },
    {
      key: 'availability',
      label: 'Availability',
      sortable: true,
      width: '120px',
      render: (value) => {
        const availabilityValue = value as AvailabilityLevel
        const getAvailabilityColor = (level: AvailabilityLevel) => {
          switch (level) {
            case AVAILABILITY_LEVELS.HIGH:
              return 'bg-red-100 text-red-800'
            case AVAILABILITY_LEVELS.MODERATE:
              return 'bg-yellow-100 text-yellow-800'
            case AVAILABILITY_LEVELS.LOW:
              return 'bg-green-100 text-green-800'
            default:
              return 'bg-gray-100 text-gray-800'
          }
        }
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(availabilityValue)}`}>
            {availabilityValue}
          </span>
        )
      }
    },
    {
      key: 'criticality',
      label: 'Criticality',
      sortable: true,
      width: '160px',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
          value === 'mission-critical' ? 'bg-red-100 text-red-800' :
          value === 'business-critical' ? 'bg-orange-100 text-orange-800' :
          value === 'standard' ? 'bg-blue-100 text-blue-800' :
          value === 'non-critical' ? 'bg-green-100 text-green-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
        </span>
      )
    },
    {
      key: 'additionalInfo',
      label: 'Additional Info',
      sortable: false,
      render: (value) => {
        const cellValue = value ? String(value) : '-'
        return (
          <Tooltip content={cellValue} theme="dark">
            <span className="truncate block max-w-full">
              {cellValue}
            </span>
          </Tooltip>
        )
      }
    }
  ]

  const columns = allColumns.filter(col => visibleColumns.has(col.key))

  const handleRowClick = (row: InformationAsset) => {
    // Navigate to asset profile page
    router.push(`/inventory/information-assets/${row.id}`)
  }

  const handleExportCSV = (selectedRows: Set<number>) => {
    const selectedAssets = Array.from(selectedRows).map(index => assets[index])
    const csvContent = [
      ['Information Asset', 'Category', 'Type', 'Description', 'Location', 'Owner', 'SME', 'Administrator', 'Agile Release Train', 'Confidentiality', 'Integrity', 'Availability', 'Additional Info'],
      ...selectedAssets.map(asset => [
        asset.informationAsset,
        asset.category,
        asset.type,
        asset.description,
        asset.location,
        asset.owner,
        asset.sme,
        asset.administrator,
        asset.agileReleaseTrain,
        asset.confidentiality,
        asset.integrity,
        asset.availability,
        asset.additionalInfo
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'information-assets.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleAddAsset = () => {
    // Handle adding new asset - could open a modal or navigate to form
  }

  const handleDeleteAsset = async (assetId: string) => {
    try {
      const response = await fetch(`/api/information-assets/${assetId}`, {
        method: 'DELETE',
      })

      const result = await response.json()
      
      if (result.success) {
        // Refresh the assets list
        fetchAssets()
      } else {
        setError(result.error || 'Failed to delete asset')
      }
    } catch (err) {
      setError('Failed to delete asset')
      console.error('Error deleting asset:', err)
    }
  }

  // const handleFilter = () => {
  //   setShowFilter(!showFilter)
  // }

  // const handleColumns = () => {
  //   setShowColumns(!showColumns)
  // }

  const toggleColumn = (columnKey: string) => {
    const newVisibleColumns = new Set(visibleColumns)
    if (newVisibleColumns.has(columnKey)) {
      newVisibleColumns.delete(columnKey)
    } else {
      newVisibleColumns.add(columnKey)
    }
    setVisibleColumns(newVisibleColumns)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#898AC4' }}></div>
          <p className="mt-4" style={{ color: '#22223B' }}>Loading information assets...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <Icon name="warning" size={48} />
        </div>
        <h3 className="text-lg font-semibold mb-2" style={{ color: '#22223B' }}>Error Loading Assets</h3>
        <p className="text-gray-600 mb-4" style={{ color: '#22223B' }}>{error}</p>
        <button
          onClick={fetchAssets}
          className="px-4 py-2 rounded-lg transition-colors"
          style={{ backgroundColor: '#898AC4', color: 'white' }}
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: '#22223B' }}>
          Information Assets
        </h1>
        <button
          onClick={handleAddAsset}
          className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-white rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{ 
            backgroundColor: '#4C1D95',
            '--tw-ring-color': '#4C1D95'
          } as React.CSSProperties}
        >
          <Icon name="plus" size={16} className="mr-2" />
          <span className="hidden sm:inline">Add Asset</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

             {/* Tabs */}
       <div className="border-b border-gray-200">
         <nav className="-mb-px flex space-x-8">
           <button
             onClick={() => setActiveTab('assets')}
             className={`py-2 px-1 border-b-2 font-medium text-sm ${
               activeTab === 'assets'
                 ? 'border-blue-500 text-blue-600'
                 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
             }`}
           >
             Assets
           </button>
           <button
             onClick={() => setActiveTab('cia')}
             className={`py-2 px-1 border-b-2 font-medium text-sm ${
               activeTab === 'cia'
                 ? 'border-blue-500 text-blue-600'
                 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
             }`}
           >
             CIA Assessments
           </button>
           <button
             onClick={() => setActiveTab('decommissioning')}
             className={`py-2 px-1 border-b-2 font-medium text-sm ${
               activeTab === 'decommissioning'
                 ? 'border-blue-500 text-blue-600'
                 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
             }`}
           >
             Decommissioning Assessments
           </button>
         </nav>
       </div>

      {/* Tab Content */}
      {activeTab === 'assets' && (
        <div className="relative">
          <DataTable
            columns={columns}
            data={assets}
            searchPlaceholder="Search assets..."
            onRowClick={handleRowClick}
            selectable={true}
            selectedRows={selectedRows}
            onSelectionChange={setSelectedRows}
            onExportCSV={handleExportCSV}
          />

          {/* Columns Dropdown */}
          {showColumns && (
            <div className="absolute right-0 top-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
              <div className="p-3">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-900">Select Columns</h3>
                  <button
                    onClick={() => setShowColumns(false)}
                    className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-gray-100 transition-colors"
                    title="Close"
                  >
                    <Icon name="close" size={12} className="text-gray-500" />
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {allColumns.map((column) => (
                    <label key={column.key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={visibleColumns.has(column.key)}
                        onChange={() => toggleColumn(column.key)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{column.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

             {activeTab === 'cia' && (
         <div className="text-center py-12">
           <div className="text-gray-400 mb-4">
             <Icon name="shield" size={48} />
           </div>
           <h3 className="text-lg font-semibold mb-2" style={{ color: '#22223B' }}>CIA Assessments</h3>
           <p className="text-gray-600 mb-4" style={{ color: '#22223B' }}>
             Confidentiality, Integrity, and Availability assessments will be available here.
           </p>
           <button
             className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-white rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
             style={{ 
               backgroundColor: '#4C1D95',
               '--tw-ring-color': '#4C1D95'
             } as React.CSSProperties}
           >
             <Icon name="plus" size={16} className="mr-2" />
             <span className="hidden sm:inline">Create Assessment</span>
             <span className="sm:hidden">Create</span>
           </button>
         </div>
       )}

       {activeTab === 'decommissioning' && (
         <div className="text-center py-12">
           <div className="text-gray-400 mb-4">
             <Icon name="trash" size={48} />
           </div>
           <h3 className="text-lg font-semibold mb-2" style={{ color: '#22223B' }}>Decommissioning Assessments</h3>
           <p className="text-gray-600 mb-4" style={{ color: '#22223B' }}>
             Assess and manage the decommissioning process for information assets that are no longer needed.
           </p>
           <button
             className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-white rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
             style={{ 
               backgroundColor: '#4C1D95',
               '--tw-ring-color': '#4C1D95'
             } as React.CSSProperties}
           >
             <Icon name="plus" size={16} className="mr-2" />
             <span className="hidden sm:inline">Create Assessment</span>
             <span className="sm:hidden">Create</span>
           </button>
         </div>
       )}
    </div>
  )
} 