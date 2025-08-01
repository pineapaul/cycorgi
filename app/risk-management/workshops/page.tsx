'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import DataTable, { Column } from '@/app/components/DataTable'
import Icon from '@/app/components/Icon'
import Tooltip from '@/app/components/Tooltip'

interface Workshop {
  id: string
  date: string
  status: 'Pending Agenda' | 'Planned' | 'Scheduled' | 'Finalising Meeting Minutes' | 'Completed'
  facilitator: string
  participants: string[]
  risks: string[]
  outcomes: string
  securitySteeringCommittee: 'Core Systems Engineering' | 'Software Engineering' | 'IP Engineering'
  actionsTaken?: string
  toDo?: string
  notes?: string
}

export default function Workshops() {
  const router = useRouter()
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())

  // Fetch workshops from API
  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const response = await fetch('/api/workshops')
        const result = await response.json()
        
        if (result.success) {
          setWorkshops(result.data)
        } else {
          console.error('Failed to fetch workshops:', result.error)
        }
      } catch (error) {
        console.error('Error fetching workshops:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWorkshops()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800'
      case 'Finalising Meeting Minutes':
        return 'bg-blue-100 text-blue-800'
      case 'Scheduled':
        return 'bg-yellow-100 text-yellow-800'
      case 'Planned':
        return 'bg-purple-100 text-purple-800'
      case 'Pending Agenda':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusDisplayName = (status: string) => {
    return status
  }

  const columns: Column[] = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      width: '140px',
      render: (value, row) => {
        return (
          <Link
            href={`/risk-management/workshops/${row.id}`}
            className="workshop-id-button"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="tracking-wide">{value || '-'}</span>
            <Icon name="arrow-right" size={10} className="arrow-icon" />
          </Link>
        )
      }
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      width: '140px',
      render: (value) => {
        if (!value) return '-'
        const date = new Date(value)
        if (isNaN(date.getTime())) return value // Return original value if invalid date
        
        const day = date.getDate().toString().padStart(2, '0')
        const month = date.toLocaleDateString('en-US', { month: 'short' })
        const year = date.getFullYear()
        
        return (
          <span className="whitespace-nowrap">
            {`${day} ${month} ${year}`}
          </span>
        )
      }
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      width: '200px',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(value)}`}>
          {getStatusDisplayName(value)}
        </span>
      )
    },
    {
      key: 'securitySteeringCommittee',
      label: 'Security Steering Committee',
      sortable: true,
      width: '180px',
      render: (value) => {
        return (
          <span className="whitespace-nowrap">
            {value || '-'}
          </span>
        )
      }
    },
    {
      key: 'facilitator',
      label: 'Facilitator',
      sortable: true,
      width: '150px'
    },
    {
      key: 'participants',
      label: 'Participants',
      sortable: false,
      width: '200px',
      render: (value) => {
        const participants = Array.isArray(value) ? value : []
        const displayText = participants.length > 2 
          ? `${participants.slice(0, 2).join(', ')} +${participants.length - 2} more`
          : participants.join(', ')
        
        return (
          <Tooltip content={participants.join(', ')} theme="dark">
            <span className="truncate block max-w-full">
              {displayText || '-'}
            </span>
          </Tooltip>
        )
      }
    },
    {
      key: 'risks',
      label: 'Related Risks',
      sortable: false,
      width: '150px',
      render: (value) => {
        const risks = Array.isArray(value) ? value : []
        return (
          <Tooltip content={risks.join(', ')} theme="dark">
            <span className="truncate block max-w-full">
              {risks.length > 0 ? `${risks.length} risk(s)` : '-'}
            </span>
          </Tooltip>
        )
      }
    },
    {
      key: 'outcomes',
      label: 'Outcomes',
      sortable: false,
      width: '200px',
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

  const transformedData = workshops.map((workshop, index) => ({
    ...workshop,
    _originalIndex: index
  }))

  const handleExportCSV = (selectedRows: Set<number>) => {
    const selectedWorkshops = Array.from(selectedRows).map(index => workshops[index])
    const csvContent = [
      ['Workshop ID', 'Date', 'Status', 'Security Steering Committee', 'Facilitator', 'Participants', 'Related Risks', 'Outcomes', 'Actions Taken', 'To Do', 'Notes'],
      ...selectedWorkshops.map(workshop => [
        workshop.id,
        workshop.date,
        getStatusDisplayName(workshop.status),
        workshop.securitySteeringCommittee,
        workshop.facilitator,
        workshop.participants.join('; '),
        workshop.risks.join('; '),
        workshop.outcomes,
        workshop.actionsTaken || '',
        workshop.toDo || '',
        workshop.notes || ''
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'workshops-export.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleRowClick = (row: any) => {
    // Navigate to workshop details page
    router.push(`/risk-management/workshops/${row.id}`)
  }

  const columnsWithRenderers = columns.map(col => ({
    ...col,
    render: col.render || ((value: any) => value || '-')
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Risk Workshops</h1>
          <p className="text-gray-600 mt-1">Manage and track risk workshops</p>
        </div>
                 <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
           <Link
             href="/risk-management/workshops/new"
             className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-white rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
             style={{ 
               backgroundColor: '#4C1D95',
               '--tw-ring-color': '#4C1D95'
             } as React.CSSProperties}
           >
             <Icon name="plus" size={16} className="mr-2" />
             <span className="hidden sm:inline">New Workshop</span>
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
            href="/risk-management/draft-risks"
            className="py-2 px-1 border-b-2 font-medium text-sm transition-colors border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          >
            Draft Risks
          </Link>
          <Link
            href="/risk-management/treatments"
            className="py-2 px-1 border-b-2 font-medium text-sm transition-colors border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          >
            Treatments
          </Link>
          <Link
            href="/risk-management/workshops"
            className="py-2 px-1 border-b-2 font-medium text-sm transition-colors border-blue-500 text-blue-600"
          >
            Workshops
          </Link>
        </nav>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Workshops Data Table */}
      {!loading && (
        <DataTable
          columns={columnsWithRenderers}
          data={transformedData}
          title="Risk Workshops"
          searchPlaceholder="Search workshops..."
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