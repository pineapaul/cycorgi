'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import DataTable, { Column } from '@/app/components/DataTable'
import Icon from '@/app/components/Icon'
import Tooltip from '@/app/components/Tooltip'

export default function Treatments() {
  const router = useRouter()
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
                     // Transform the treatments data for display
           const transformedTreatments = result.data.map((treatment: any) => {
             // Helper function to format dates
             const formatDate = (dateString: string | null) => {
               if (!dateString || dateString === 'Not specified') return 'Not specified'
               try {
                 const date = new Date(dateString)
                 return date.toLocaleDateString('en-GB', {
                   day: '2-digit',
                   month: 'short',
                   year: 'numeric'
                 })
               } catch {
                 return 'Not specified'
               }
             }

             return {
               treatmentId: treatment.treatmentJiraTicket,
               riskId: treatment.riskId,
               riskStatement: treatment.riskStatement || 'Not specified',
               informationAsset: treatment.informationAsset || 'Not specified',
               treatmentType: treatment.riskTreatment || 'Not specified',
               treatmentDescription: treatment.riskTreatment || 'Not specified',
               treatmentOwner: treatment.riskTreatmentOwner || 'Not assigned',
               treatmentStatus: treatment.closureApproval || 'Not specified',
               priority: treatment.priority || 'Not specified',
               startDate: formatDate(treatment.createdAt),
               targetCompletionDate: formatDate(treatment.dateRiskTreatmentDue),
               actualCompletionDate: formatDate(treatment.completionDate),
               budget: treatment.budget || 'Not specified',
               cost: treatment.cost || 'Not specified',
               effectiveness: treatment.effectiveness || 'Not specified',
               residualRisk: treatment.residualRisk || 'Not specified',
               numberOfExtensions: treatment.numberOfExtensions || 0,
               extendedDueDate: formatDate(treatment.extendedDueDate),
               closureApprovedBy: treatment.closureApprovedBy || 'Not specified',
               createdAt: formatDate(treatment.createdAt),
               updatedAt: formatDate(treatment.updatedAt),
             }
           })
          setTreatments(transformedTreatments)
        } else {
          setError(result.error || 'Failed to fetch treatments')
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? `Failed to fetch treatments: ${err.message}` : 'Failed to fetch treatments: An unknown error occurred';
        setError(errorMessage);
        console.error('Error fetching treatments:', err);
      } finally {
        setLoading(false)
      }
    }

    fetchTreatments()
  }, [])

  const handleRowClick = (row: any) => {
    // Navigate to specific treatment detail page
    router.push(`/risk-management/treatments/${row.riskId}/${row.treatmentId}`)
  }

  const handleExportCSV = (selectedRows: Set<number>) => {
    // TODO: Implement CSV export
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }



  const columns: Column[] = [
    { key: 'treatmentId', label: 'Treatment ID', sortable: true, width: '140px' },
    { key: 'actions', label: 'Actions', sortable: false, width: '120px' },
    { key: 'riskId', label: 'Risk ID', sortable: true, width: '120px' },
    { key: 'treatmentType', label: 'Treatment', sortable: true },
    { key: 'treatmentOwner', label: 'Owner', sortable: true, width: '150px' },
    { key: 'treatmentStatus', label: 'Status', sortable: true, width: '100px' },
    { key: 'targetCompletionDate', label: 'Due Date', sortable: true, width: '110px' },
    { key: 'extendedDueDate', label: 'Extended Due Date', sortable: true, width: '130px' },
    { key: 'numberOfExtensions', label: 'Extensions', sortable: true, width: '100px' },
    { key: 'actualCompletionDate', label: 'Completion Date', sortable: true, width: '130px' },
    { key: 'closureApprovedBy', label: 'Approved By', sortable: true, width: '150px' },
    { key: 'createdAt', label: 'Created Date', sortable: true, width: '110px' },
  ].map(col => ({
    ...col,
    render: (value: any, row: any) => {
             if (col.key === 'treatmentId') {
         return (
           <Link
             href={`/risk-management/treatments/${row.riskId}/${row.treatmentId}`}
             className="risk-id-button"
             onClick={(e) => e.stopPropagation()}
           >
             <span className="tracking-wide">{value}</span>
             <Icon name="arrow-right" size={10} className="arrow-icon" />
           </Link>
         )
       }
             if (col.key === 'actions') {
         return (
           <div className="flex items-center space-x-2">
             <Tooltip content="Copy Link">
               <button
                 onClick={(e) => {
                   e.stopPropagation()
                   const url = `${window.location.origin}/risk-management/treatments/${row.riskId}/${row.treatmentId}`
                   navigator.clipboard.writeText(url).then(() => {
                     alert('Link copied to clipboard!')
                   })
                 }}
                 className="inline-flex items-center justify-center w-8 h-8 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 transition-colors"
               >
                 <Icon name="link" size={12} />
               </button>
             </Tooltip>
             <Tooltip content="Add to Workshop Agenda">
               <button
                 onClick={(e) => {
                   e.stopPropagation()
                   // TODO: Implement workshop agenda functionality
                   alert(`Treatment ${row.treatmentId} added to workshop agenda!`)
                 }}
                 className="inline-flex items-center px-2 py-1 text-xs font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded hover:bg-purple-100 transition-colors"
               >
                 <Icon name="calendar-plus" size={12} className="mr-1" />
                 Workshop
               </button>
             </Tooltip>
           </div>
         )
       }
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
      if (col.key === 'treatmentStatus') {
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
            {value}
          </span>
        )
      }
      if (col.key === 'numberOfExtensions') {
        if (!value || value === 0) return <span className="text-gray-400">0</span>
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${value > 2 ? 'bg-red-100 text-red-800' : value > 1 ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
            {value}
          </span>
        )
      }
             if (col.key === 'treatmentType') {
         return (
           <div className="relative group">
             <span className="text-sm truncate block max-w-full">
               {value}
             </span>
             <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 max-w-xs break-words">
               {value}
               <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
             </div>
           </div>
         )
       }
             if (col.key === 'targetCompletionDate' || col.key === 'extendedDueDate' || col.key === 'actualCompletionDate' || col.key === 'createdAt') {
         if (!value || value === 'Not specified') return <span className="text-gray-400">-</span>
         return <span className="text-sm whitespace-nowrap">{value}</span>
       }
       // Default rendering for other columns
       const cellValue = value ? String(value) : '-'
       return <span className="truncate block max-w-full">{cellValue}</span>
    }
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Risk Management</h1>
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
            href="/risk-management/draft-risks"
            className="py-2 px-1 border-b-2 font-medium text-sm transition-colors border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          >
            Draft Risks
          </Link>
          <Link
            href="/risk-management/treatments"
            className="py-2 px-1 border-b-2 font-medium text-sm transition-colors border-blue-500 text-blue-600"
          >
            Treatments
          </Link>
          <Link
            href="/risk-management/workshops"
            className="py-2 px-1 border-b-2 font-medium text-sm transition-colors border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          >
            Workshops
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
          title="Risk Treatments"
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