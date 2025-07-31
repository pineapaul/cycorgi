'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import DataTable, { Column } from '../../components/DataTable'
import Icon from '../../components/Icon'
import Tooltip from '../../components/Tooltip'
import { getCIAConfig } from '../../../lib/utils'

// Custom renderer for CIA values
const renderCIAValues = (value: string) => {
  if (!value || value === 'Not specified') {
    return (
      <span className="text-gray-400 text-xs italic">Not specified</span>
    )
  }

  const ciaValues = value?.split(', ') || []
  return (
    <div className="flex gap-1.5 overflow-hidden">
      {ciaValues.map((cia, index) => {
        const config = getCIAConfig(cia)
        return (
          <span
            key={index}
            className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${config.bg} ${config.text} ${config.border} transition-all duration-200 hover:scale-105 flex-shrink-0`}
            title={cia}
          >
            {config.label}
          </span>
        )
      })}
    </div>
  )
}

export default function DraftRisks() {
  const router = useRouter()
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [draftRisks, setDraftRisks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch draft risks from MongoDB
  useEffect(() => {
    const fetchDraftRisks = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/risks')
        const result = await response.json()
        
        if (result.success) {
          // Filter for risks with 'Draft' status and transform the data
          const draftRisksData = result.data
            .filter((risk: any) => risk.currentPhase === 'Draft')
            .map((risk: any) => ({
              riskId: risk.riskId,
              functionalUnit: risk.functionalUnit || 'Not specified',
              raisedBy: risk.raisedBy,
              riskOwner: risk.riskOwner || 'Not assigned',
              informationAssets: risk.informationAsset,
              threat: risk.threat,
              vulnerability: risk.vulnerability,
              riskStatement: risk.riskStatement,
              impactCIA: risk.impact ? (Array.isArray(risk.impact) ? risk.impact.join(', ') : 'Not specified') : 'Not specified',
              currentControls: risk.currentControls || 'Not specified',
              currentControlsReference: risk.currentControlsReference || 'Not specified',
              consequenceRating: risk.consequenceRating || 'Not rated',
              likelihoodRating: risk.likelihoodRating || 'Not rated',
              riskRating: risk.riskRating || 'Not rated',
              createdAt: risk.createdAt ? new Date(risk.createdAt).toISOString().split('T')[0] : 'Not specified',
              updatedAt: risk.updatedAt ? new Date(risk.updatedAt).toISOString().split('T')[0] : 'Not specified',
            }))
          setDraftRisks(draftRisksData)
        } else {
          setError(result.error || 'Failed to fetch draft risks')
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? `Failed to fetch draft risks: ${err.message}` : 'Failed to fetch draft risks: An unknown error occurred';
        setError(errorMessage);
        console.error('Error fetching draft risks:', err);
      } finally {
        setLoading(false)
      }
    }

    fetchDraftRisks()
  }, [])

  const handleRowClick = (row: any) => {
    // Navigate to specific risk info page
    router.push(`/risk-management/register/${row.riskId}`)
  }

  const handleExportCSV = (selectedRows: Set<number>) => {
    // TODO: Implement CSV export
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'identification':
        return 'bg-blue-100 text-blue-800'
      case 'analysis':
        return 'bg-yellow-100 text-yellow-800'
      case 'evaluation':
        return 'bg-orange-100 text-orange-800'
      case 'treatment':
        return 'bg-purple-100 text-purple-800'
      case 'monitoring':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiskLevelColor = (level: string) => {
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

  const columns: Column[] = [
    { key: 'riskId', label: 'Risk ID', sortable: true },
    { key: 'functionalUnit', label: 'Functional Unit', sortable: true },
    { key: 'raisedBy', label: 'Raised By', sortable: true },
    { key: 'riskOwner', label: 'Risk Owner', sortable: true },
    { key: 'informationAssets', label: 'Information Assets', sortable: true },
    { key: 'threat', label: 'Threat', sortable: true },
    { key: 'vulnerability', label: 'Vulnerability', sortable: true },
    { key: 'riskStatement', label: 'Risk Statement', sortable: true },
    { key: 'impactCIA', label: 'Impact (CIA)', sortable: true },
    { key: 'currentControls', label: 'Current Controls', sortable: true },
    { key: 'currentControlsReference', label: 'Controls Reference', sortable: true },
    { key: 'consequenceRating', label: 'Consequence', sortable: true },
    { key: 'likelihoodRating', label: 'Likelihood', sortable: true },
    { key: 'riskRating', label: 'Risk Rating', sortable: true },
    { key: 'createdAt', label: 'Created Date', sortable: true },
    { key: 'updatedAt', label: 'Last Updated', sortable: true },
  ].map(col => ({
    ...col,
    render: (value: any, row: any) => {
      if (col.key === 'riskId') {
        return (
          <Link
            href={`/risk-management/register/${row.riskId}`}
            className="risk-id-button"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="tracking-wide">{value}</span>
            <Icon name="arrow-right" size={10} className="arrow-icon" />
          </Link>
        )
      }
      if (col.key === 'impactCIA') {
        return renderCIAValues(value)
      }
      if (col.key === 'riskRating') {
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(value)}`}>
            {value}
          </span>
        )
      }
      if (col.key === 'consequenceRating' || col.key === 'likelihoodRating') {
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(value)}`}>
            {value}
          </span>
        )
      }
      if (col.key === 'createdAt' || col.key === 'updatedAt') {
        if (!value || value === 'Not specified') return <span className="text-gray-400">-</span>
        return <span>{value}</span>
      }
      // Implement tooltip rendering for all content
      const cellValue = value ? String(value) : '-'
      return (
        <Tooltip content={cellValue} theme="dark">
          <span className="truncate block max-w-full">
            {cellValue}
          </span>
        </Tooltip>
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
          <Link
            href="/risk-management/register/new"
            className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-white rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ 
              backgroundColor: '#4C1D95',
              '--tw-ring-color': '#4C1D95'
            } as React.CSSProperties}
          >
            <Icon name="plus" size={16} className="mr-2" />
            <span className="hidden sm:inline">New Risk</span>
            <span className="sm:hidden">New</span>
          </Link>
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
            Draft Risks
          </Link>
        </nav>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#898AC4' }}></div>
            <p className="mt-4" style={{ color: '#22223B' }}>Loading draft risks...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <Icon name="warning" size={48} />
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: '#22223B' }}>Error Loading Draft Risks</h3>
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

      {/* Draft Risks Data Table */}
      {!loading && !error && (
        <DataTable
          columns={columns}
          data={draftRisks}
          title="Draft Risks"
          searchPlaceholder="Search draft risks..."
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