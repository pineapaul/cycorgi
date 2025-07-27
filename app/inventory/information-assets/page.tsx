'use client'

import { useState, useEffect } from 'react'
import DataTable, { Column } from '../../components/DataTable'
import Icon from '../../components/Icon'

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
  additionalInfo: string
}

export default function InformationAssetsPage() {
  const [assets, setAssets] = useState<InformationAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [showFilter, setShowFilter] = useState(false)
  const [showColumns, setShowColumns] = useState(false)
  const [activeTab, setActiveTab] = useState<'assets' | 'cia'>('assets')
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set([
    'informationAsset', 'category', 'type', 'description', 'location', 'owner', 
    'sme', 'administrator', 'agileReleaseTrain', 'confidentiality', 'integrity', 
    'availability', 'additionalInfo'
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
      width: '200px'
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
      render: (value) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      )
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
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'High' ? 'bg-red-100 text-red-800' :
          value === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
          value === 'Low' ? 'bg-green-100 text-green-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'integrity',
      label: 'Integrity',
      sortable: true,
      width: '100px',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'High' ? 'bg-red-100 text-red-800' :
          value === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
          value === 'Low' ? 'bg-green-100 text-green-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'availability',
      label: 'Availability',
      sortable: true,
      width: '120px',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Critical' ? 'bg-red-100 text-red-800' :
          value === 'High' ? 'bg-orange-100 text-orange-800' :
          value === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
          value === 'Low' ? 'bg-green-100 text-green-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'additionalInfo',
      label: 'Additional Info',
      sortable: false,
      render: (value) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      )
    }
  ]

  const columns = allColumns.filter(col => visibleColumns.has(col.key))

  const handleRowClick = (row: InformationAsset) => {
    // Handle row click - could open a modal or navigate to detail page
    console.log('Clicked asset:', row)
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
    console.log('Add new asset')
  }

  const handleFilter = () => {
    setShowFilter(!showFilter)
    console.log('Filter button clicked')
  }

  const handleColumns = () => {
    setShowColumns(!showColumns)
  }

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
            actions={
              <div className="flex items-center space-x-2">
                {/* Filter Button */}
                <button
                  onClick={handleFilter}
                  className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 hover:bg-gray-200 bg-white border border-gray-300"
                  title="Filter"
                >
                  <Icon name="filter" size={16} />
                </button>
                
                {/* Columns Button */}
                <button
                  onClick={handleColumns}
                  className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 hover:bg-gray-200 bg-white border border-gray-300"
                  title="Columns"
                >
                  <Icon name="columns" size={16} />
                </button>
              </div>
            }
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
    </div>
  )
} 