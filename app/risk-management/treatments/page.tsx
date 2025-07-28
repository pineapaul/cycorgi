'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import DataTable, { Column } from '../../components/DataTable'
import Icon from '../../components/Icon'



export default function Treatments() {
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [treatments, setTreatments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch treatments from MongoDB
  useEffect(() => {
    const fetchTreatments = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/treatments')
        const result = await response.json()
        
        if (result.success) {
          // Transform the data to match the expected format
          const transformedTreatments = result.data.map((treatment: any) => ({
            ...treatment,
            dueDate: treatment.dateRiskTreatmentDue,
            dateRiskTreatmentsCompleted: treatment.completionDate,
            dateOfClosureApproval: treatment.closureApproval === 'Approved' ? treatment.completionDate : '',
          }))
          setTreatments(transformedTreatments)
        } else {
          setError(result.error || 'Failed to fetch treatments')
        }
      } catch (err) {
        setError('Failed to fetch treatments')
        console.error('Error fetching treatments:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTreatments()
  }, [])

  const handleRowClick = (row: any) => {
    // TODO: Navigate to specific risk treatments page
    // window.location.href = `/risk-management/treatments/${row.riskId}`
  }

  const handleExportCSV = (selectedRows: Set<number>) => {
    // TODO: Implement CSV export
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in progress':
        return 'bg-blue-100 text-blue-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
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

  const columns: Column[] = [
    { key: 'riskId', label: 'Risk ID', sortable: true },
    { key: 'treatmentJiraTicket', label: 'Treatment Jira Ticket', sortable: true },
    { key: 'riskStatement', label: 'Risk Statement', sortable: true },
    { key: 'informationAsset', label: 'Information Asset', sortable: true },
    { key: 'riskTreatment', label: 'Risk Treatment', sortable: true },
    { key: 'riskTreatmentOwner', label: 'Risk Treatment Owner', sortable: true },
    { key: 'dueDate', label: 'Due Date', sortable: true },
    { key: 'extendedDueDate', label: 'Extended Due Date', sortable: true },
    { key: 'dateRiskTreatmentsCompleted', label: 'Date Risk Treatments Completed', sortable: true },
    { key: 'dateOfClosureApproval', label: 'Date of Closure Approval', sortable: true },
  ].map(col => ({
    ...col,
    render: (value: any, row: any) => {
      if (col.key === 'riskId') {
        return (
          <button
            onClick={(e) => {
              e.stopPropagation()
              // Navigate to specific risk treatments page
              window.location.href = `/risk-management/treatments/${value}`
            }}
            className="text-blue-600 hover:text-blue-800 underline font-medium"
          >
            {value}
          </button>
        )
      }
      if (col.key === 'treatmentJiraTicket') {
        return (
          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
            {value}
          </span>
        )
      }
      if (col.key === 'dueDate' || col.key === 'extendedDueDate' || col.key === 'dateRiskTreatmentsCompleted' || col.key === 'dateOfClosureApproval') {
        if (!value) return <span className="text-gray-400">-</span>
        return <span>{value}</span>
      }
      // Implement tooltip rendering for all content
      const cellValue = value ? String(value) : '-'
      return (
        <div className="relative group">
          <span className="truncate block max-w-full">
            {cellValue}
          </span>
          <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 max-w-xs break-words">
            {cellValue}
            <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )
    }
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Risk Management</h1>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <button 
            className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-white rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ 
              backgroundColor: '#4C1D95',
              '--tw-ring-color': '#4C1D95'
            } as React.CSSProperties}
          >
            <Icon name="plus" size={16} className="mr-2" />
            <span className="hidden sm:inline">New Treatment</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <Link
            href="/risk-management/register"
            className="py-2 px-1 border-b-2 font-medium text-sm transition-colors border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          >
            Register
          </Link>
          <Link
            href="/risk-management/treatments"
            className="py-2 px-1 border-b-2 font-medium text-sm transition-colors border-blue-500 text-blue-600"
          >
            Treatments
          </Link>
        </nav>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#898AC4' }}></div>
            <p className="mt-4" style={{ color: '#22223B' }}>Loading treatments...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <Icon name="warning" size={48} />
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: '#22223B' }}>Error Loading Treatments</h3>
          <p className="text-gray-600 mb-4" style={{ color: '#22223B' }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{ backgroundColor: '#898AC4', color: 'white' }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Treatments Data Table */}
      {!loading && !error && (
        <DataTable
          columns={columns}
          data={treatments}
          title="All Risk Treatments"
          searchPlaceholder="Search treatments..."
          onRowClick={handleRowClick}
          selectable={true}
          selectedRows={selectedRows}
          onSelectionChange={setSelectedRows}
          onExportCSV={handleExportCSV}
        />
      )}
    </div>
  )
} 