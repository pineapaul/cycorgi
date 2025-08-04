'use client'

import { useState, useEffect } from 'react'
import DataTable, { Column } from '@/app/components/DataTable'
import Icon from '@/app/components/Icon'
import Link from 'next/link'
import Tooltip from '@/app/components/Tooltip'

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

export default function ThirdPartiesPage() {
  const [thirdParties, setThirdParties] = useState<ThirdParty[]>([])
  const [informationAssets, setInformationAssets] = useState<InformationAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetchThirdParties()
    fetchInformationAssets()
  }, [])

  const fetchThirdParties = async () => {
    try {
      const response = await fetch('/api/third-parties')
      const result = await response.json()
      
      if (result.success) {
        setThirdParties(result.data)
      } else {
        console.error('Failed to fetch third parties:', result.error)
      }
    } catch (error) {
      console.error('Error fetching third parties:', error)
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

  const getInformationAssetName = (assetId: string) => {
    const asset = informationAssets.find(a => a.id === assetId)
    return asset ? asset.informationAsset : assetId
  }

  const getInformationAssetsDisplay = (assetIds: any) => {
    // Handle undefined, null, or non-array values
    if (!assetIds || !Array.isArray(assetIds)) {
      return <span>-</span>
    }
    
    if (assetIds.length === 0) return <span>-</span>
    if (assetIds.length === 1) {
      const assetName = getInformationAssetName(assetIds[0])
      return (
        <Link 
          href={`/inventory/information-assets/${assetIds[0]}`}
          className="text-blue-600 hover:text-blue-800 underline"
          onClick={(e) => e.stopPropagation()}
        >
          {assetName}
        </Link>
      )
    }
    
    // Multiple assets - show "Multiple" with tooltip
    const assetNames = assetIds.map(id => getInformationAssetName(id))
    const tooltipContent = (
      <div className="space-y-1">
        <div className="font-medium text-white mb-2">Linked Information Assets:</div>
        {assetNames.map((name, index) => (
          <div key={index} className="text-sm text-gray-200">
            • {name}
          </div>
        ))}
      </div>
    )
    
    return (
      <Tooltip content={tooltipContent} theme="dark">
        <span className="text-blue-600 hover:text-blue-800 cursor-pointer font-medium">
          Multiple ({assetIds.length})
        </span>
      </Tooltip>
    )
  }

  const handleRowClick = (row: ThirdParty) => {
    // Navigate to third party detail page
    window.location.href = `/inventory/third-parties/${row.id}`
  }

  const handleExportCSV = (selectedRows: Set<number>) => {
    const selectedData = Array.from(selectedRows).map(index => thirdParties[index])
    
    // Create CSV content
    const headers = [
      'Vendor ID',
      'Vendor Name',
      'Information Asset IDs',
      'Functional Unit',
      'Vendor Contact',
      'Internal Contact',
      'Entity',
      'Start Date',
      'End Date',
      'Risk Assessment Jira Ticket',
      'Data Privacy',
      'Security Review Jira Ticket',
      'Last Security Review Date',
      'Status'
    ]
    
    const csvContent = [
      headers.join(','),
      ...selectedData.map(row => [
        row.vendorId,
        row.vendorName,
        row.informationAssetIds.join('; '),
        row.functionalUnit,
        row.vendorContact,
        row.internalContact,
        row.entity,
        formatDate(row.startDate),
        formatDate(row.endDate),
        row.riskAssessmentJiraTicket,
        row.dataPrivacy,
        row.securityReviewJiraTicket,
        formatDate(row.lastSecurityReviewDate),
        row.status
      ].join(','))
    ].join('\n')
    
    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'third-parties-export.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const columns: Column[] = [
    {
      key: 'vendorId',
      label: 'Vendor ID',
      sortable: true,
      width: '120px'
    },
    {
      key: 'vendorName',
      label: 'Vendor Name',
      sortable: true,
      width: '200px'
    },
    {
      key: 'informationAssetIds',
      label: 'Information Assets',
      sortable: true,
      width: '200px',
      render: (value: any, row: any) => getInformationAssetsDisplay(value)
    },
    {
      key: 'functionalUnit',
      label: 'Functional Unit',
      sortable: true,
      width: '150px'
    },
    {
      key: 'vendorContact',
      label: 'Vendor Contact',
      sortable: true,
      width: '250px'
    },
    {
      key: 'internalContact',
      label: 'Internal Contact',
      sortable: true,
      width: '250px'
    },
    {
      key: 'entity',
      label: 'Entity',
      sortable: true,
      width: '150px'
    },
    {
      key: 'startDate',
      label: 'Start Date',
      sortable: true,
      width: '110px',
      render: (value) => formatDate(value)
    },
    {
      key: 'endDate',
      label: 'End Date',
      sortable: true,
      width: '110px',
      render: (value) => formatDate(value)
    },
    {
      key: 'riskAssessmentJiraTicket',
      label: 'Risk Assessment Jira Ticket',
      sortable: true,
      width: '200px',
      render: (value) => (
        <span className="text-blue-600 hover:text-blue-800 cursor-pointer">
          {value}
        </span>
      )
    },
    {
      key: 'dataPrivacy',
      label: 'Data Privacy Risk Assessment',
      sortable: true,
      width: '200px',
      render: (value) => (
        <span className="text-blue-600 hover:text-blue-800 cursor-pointer">
          {value}
        </span>
      )
    },
    {
      key: 'securityReviewJiraTicket',
      label: 'Security Review Jira Ticket',
      sortable: true,
      width: '200px',
      render: (value) => (
        <span className="text-blue-600 hover:text-blue-800 cursor-pointer">
          {value}
        </span>
      )
    },
    {
      key: 'lastSecurityReviewDate',
      label: 'Last Security Review Date',
      sortable: true,
      width: '160px',
      render: (value) => formatDate(value)
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      width: '100px',
      render: (value) => {
        const getStatusColor = (status: string) => {
          switch (status.toLowerCase()) {
            case 'active':
              return 'bg-green-100 text-green-800'
            case 'inactive':
              return 'bg-red-100 text-red-800'
            case 'pending':
              return 'bg-yellow-100 text-yellow-800'
            case 'expired':
              return 'bg-gray-100 text-gray-800'
            default:
              return 'bg-gray-100 text-gray-800'
          }
        }
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
            {value}
          </span>
        )
      }
    }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900" style={{ color: '#22223B' }}>
              Third Parties
            </h1>
            <p className="text-gray-600 mt-2" style={{ color: '#22223B' }}>
              Manage and track third-party relationships and compliance
            </p>
          </div>
        </div>
        
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading third parties...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900" style={{ color: '#22223B' }}>
            Third Parties
          </h1>
          <p className="text-gray-600 mt-2" style={{ color: '#22223B' }}>
            Manage and track third-party relationships and compliance
          </p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <Link
            href="/inventory/third-parties/new"
            className="px-3 py-2 md:px-4 md:py-2 text-white rounded-lg transition-colors text-sm md:text-base flex items-center space-x-2"
            style={{ backgroundColor: '#898AC4' }}
          >
            <Icon name="plus" size={16} />
            <span>Add Third Party</span>
          </Link>
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={thirdParties}
        title="Third Party Inventory"
        searchPlaceholder="Search third parties..."
        onRowClick={handleRowClick}
        selectable={true}
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        onExportCSV={handleExportCSV}
        className="third-parties-table"
      />
    </div>
  )
} 