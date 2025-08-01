'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import DataTable, { Column } from '../../components/DataTable'
import Icon from '../../components/Icon'
import Tooltip from '../../components/Tooltip'

interface Workshop {
  id: string
  title: string
  date: string
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
  facilitator: string
  participants: string[]
  risks: string[]
  objectives: string
  outcomes: string
}

export default function Workshops() {
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())

  // Mock data for workshops - in a real app, this would come from an API
  useEffect(() => {
    const mockWorkshops: Workshop[] = [
      {
        id: 'WS-001',
        title: 'Q1 2024 Risk Assessment Workshop',
        date: '2024-03-15',
        status: 'completed',
        facilitator: 'Sarah Johnson',
        participants: ['John Smith', 'Mike Davis', 'Lisa Chen'],
        risks: ['RISK-001', 'RISK-003', 'RISK-005'],
        objectives: 'Review and assess current risk landscape for Q1 2024',
        outcomes: 'Identified 3 new risks, updated 2 existing risk ratings'
      },
      {
        id: 'WS-002',
        title: 'Cybersecurity Risk Workshop',
        date: '2024-04-20',
        status: 'scheduled',
        facilitator: 'David Wilson',
        participants: ['Sarah Johnson', 'Alex Brown', 'Emma Taylor'],
        risks: ['RISK-002', 'RISK-004'],
        objectives: 'Focus on cybersecurity threats and vulnerabilities',
        outcomes: ''
      },
      {
        id: 'WS-003',
        title: 'Third-Party Risk Management',
        date: '2024-05-10',
        status: 'scheduled',
        facilitator: 'Lisa Chen',
        participants: ['John Smith', 'David Wilson', 'Mike Davis'],
        risks: ['RISK-006', 'RISK-007'],
        objectives: 'Review third-party vendor risks and controls',
        outcomes: ''
      }
    ]

    // Simulate API call
    setTimeout(() => {
      setWorkshops(mockWorkshops)
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800'
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'in-progress':
        return 'In Progress'
      case 'scheduled':
        return 'Scheduled'
      case 'cancelled':
        return 'Cancelled'
      default:
        return status
    }
  }

  const columns: Column[] = [
    {
      key: 'id',
      label: 'Workshop ID',
      sortable: true,
      width: '120px'
    },
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      width: '250px'
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      width: '120px'
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      width: '120px',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
          {getStatusDisplayName(value)}
        </span>
      )
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
      key: 'objectives',
      label: 'Objectives',
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
      ['Workshop ID', 'Title', 'Date', 'Status', 'Facilitator', 'Participants', 'Related Risks', 'Objectives', 'Outcomes'],
      ...selectedWorkshops.map(workshop => [
        workshop.id,
        workshop.title,
        workshop.date,
        getStatusDisplayName(workshop.status),
        workshop.facilitator,
        workshop.participants.join('; '),
        workshop.risks.join('; '),
        workshop.objectives,
        workshop.outcomes
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
    window.location.href = `/risk-management/workshops/${row.id}`
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
          <p className="text-gray-600 mt-1">Manage and track risk assessment workshops</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => window.location.href = '/risk-management/workshops/new'}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Icon name="plus" className="w-4 h-4 mr-2" />
            New Workshop
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
            href="/risk-management/draft-risks"
            className="py-2 px-1 border-b-2 font-medium text-sm transition-colors border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          >
            Draft Risks
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

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <Icon name="alert-circle" className="w-5 h-5 text-red-400 mr-2" />
            <div className="text-sm text-red-700">
              Error loading workshops: {error}
            </div>
          </div>
        </div>
      )}

      {/* Workshops Data Table */}
      {!loading && !error && (
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