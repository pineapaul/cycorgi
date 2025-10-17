'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import DataTable, { Column } from '@/app/components/DataTable'
import Icon from '@/app/components/Icon'
import Tooltip from '@/app/components/Tooltip'
import { useToast } from '@/app/components/Toast'

// Incident status options for filtering
const INCIDENT_STATUSES = [
  { id: 'open', name: 'Open', icon: 'exclamation-circle' },
  { id: 'under-investigation', name: 'Under Investigation', icon: 'magnifying-glass' },
  { id: 'resolved', name: 'Resolved', icon: 'check-circle' },
  { id: 'closed', name: 'Closed', icon: 'shield-check' }
]

// Priority levels with color coding
const getPriorityConfig = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case 'critical':
      return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' }
    case 'high':
      return { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' }
    case 'medium':
      return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' }
    case 'low':
      return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' }
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' }
  }
}

// Status configuration with color coding
const getStatusConfig = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'open':
      return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' }
    case 'under investigation':
      return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' }
    case 'resolved':
      return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' }
    case 'closed':
      return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' }
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' }
  }
}



// Format date for display
const formatDate = (value: unknown) => {
  if (!value || value === '') {
    return <span className="text-gray-400 text-xs italic">Not specified</span>
  }
  
  try {
    const date = new Date(String(value))
    return date.toLocaleDateString('en-AU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch (error) {
    return <span className="text-gray-400 text-xs italic">Invalid date</span>
  }
}

// Custom renderer for Priority
const renderPriority = (value: unknown) => {
  if (!value || value === '') {
    return <span className="text-gray-400 text-xs italic">Not specified</span>
  }
  
  const config = getPriorityConfig(String(value))
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
      {String(value)}
    </span>
  )
}

// Custom renderer for Status
const renderStatus = (value: unknown) => {
  if (!value || value === '') {
    return <span className="text-gray-400 text-xs italic">Not specified</span>
  }
  
  const config = getStatusConfig(String(value))
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
      {String(value)}
    </span>
  )
}

// Custom renderer for Description (truncated)
const renderDescription = (value: unknown) => {
  if (!value || value === '') {
    return <span className="text-gray-400 text-xs italic">Not specified</span>
  }
  
  const description = String(value)
  const truncated = description.length > 60 ? `${description.substring(0, 60)}...` : description
  
  return (
    <Tooltip content={description}>
      <span className="text-sm text-gray-900 cursor-help">
        {truncated}
      </span>
    </Tooltip>
  )
}

// Custom renderer for Action Taken (truncated)
const renderActionTaken = (value: unknown) => {
  if (!value || value === '') {
    return <span className="text-gray-400 text-xs italic">Not specified</span>
  }
  
  const action = String(value)
  const truncated = action.length > 50 ? `${action.substring(0, 50)}...` : action
  
  return (
    <Tooltip content={action}>
      <span className="text-sm text-gray-900 cursor-help">
        {truncated}
      </span>
    </Tooltip>
  )
}



export default function InformationSecurityIncidents() {
  const router = useRouter()
  const { showToast } = useToast()

  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [incidents, setIncidents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  


  // Fetch incidents from API
  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/incidents')
        const result = await response.json()
        
        if (result.success) {
          setIncidents(result.data)
        } else {
          showToast({ type: 'error', title: 'Failed to fetch incidents' })
        }
      } catch (error) {
        console.error('Error fetching incidents:', error)
        showToast({ type: 'error', title: 'Failed to fetch incidents' })
      } finally {
        setLoading(false)
      }
    }

    fetchIncidents()
  }, [showToast])









  // Get columns for incidents table
  const getColumns = (): Column[] => [
    { 
      key: 'incidentId', 
      label: 'Incident ID', 
      sortable: true, 
      width: 'w-24 sm:w-28 md:w-32 lg:w-36' 
    },
    { 
      key: 'actions', 
      label: 'Actions', 
      sortable: false, 
      width: 'w-20 sm:w-24 md:w-28 lg:w-32',
      render: (value: unknown, row: any) => (
        <div className="flex items-center gap-2">
          <Tooltip content="View Details">
            <button
              onClick={() => router.push(`/isms-operations/incidents/${row.id}`)}
              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
            >
              <Icon name="eye" size={16} />
            </button>
          </Tooltip>
        </div>
      )
    },
    { 
      key: 'functionalUnit', 
      label: 'Functional Unit', 
      sortable: true, 
      width: 'w-32 sm:w-36 md:w-40 lg:w-44' 
    },
    { 
      key: 'status', 
      label: 'Status', 
      sortable: true, 
      width: 'w-28 sm:w-32 md:w-36 lg:w-40',
      render: renderStatus
    },
    { 
      key: 'dateRaised', 
      label: 'Date Raised', 
      sortable: true, 
      width: 'w-24 sm:w-28 md:w-32 lg:w-36',
      render: formatDate
    },
    { 
      key: 'raisedBy', 
      label: 'Raised By', 
      sortable: true, 
      width: 'w-28 sm:w-32 lg:w-36' 
    },
    { 
      key: 'location', 
      label: 'Location', 
      sortable: true, 
      width: 'w-28 sm:w-32 lg:w-36' 
    },
    { 
      key: 'priority', 
      label: 'Priority', 
      sortable: true, 
      width: 'w-20 sm:w-24 lg:w-28',
      render: renderPriority
    },
    { 
      key: 'incidentJiraTicket', 
      label: 'JIRA Ticket', 
      sortable: true, 
      width: 'w-24 sm:w-28 md:w-32 lg:w-36' 
    },
    { 
      key: 'informationAsset', 
      label: 'Information Asset', 
      sortable: true, 
      width: 'w-32 sm:w-36 md:w-40 lg:w-44' 
    },
    { 
      key: 'description', 
      label: 'Description', 
      sortable: true, 
      width: 'w-48 sm:w-52 md:w-56 lg:w-60',
      render: renderDescription
    },
    { 
      key: 'rootCause', 
      label: 'Root Cause', 
      sortable: true, 
      width: 'w-32 sm:w-36 md:w-40 lg:w-44' 
    },
    { 
      key: 'rootCauseCategory', 
      label: 'Root Cause Category', 
      sortable: true, 
      width: 'w-32 sm:w-36 md:w-40 lg:w-44' 
    },
    { 
      key: 'assignedTo', 
      label: 'Assigned To', 
      sortable: true, 
      width: 'w-28 sm:w-32 lg:w-36' 
    },
    { 
      key: 'actionTaken', 
      label: 'Action Taken', 
      sortable: true, 
      width: 'w-40 sm:w-44 md:w-48 lg:w-52',
      render: renderActionTaken
    },
    { 
      key: 'completionDate', 
      label: 'Completion Date', 
      sortable: true, 
      width: 'w-28 sm:w-32 lg:w-36',
      render: formatDate
    },
    { 
      key: 'dateApprovedForClosure', 
      label: 'Date Approved for Closure', 
      sortable: true, 
      width: 'w-32 sm:w-36 md:w-40 lg:w-44',
      render: formatDate
    }
  ]

  // Filter data based on selected status
  const filteredData = selectedStatus 
    ? incidents.filter(incident => {
        const status = incident.status.toLowerCase()
        const selected = selectedStatus.toLowerCase()
        
        if (selected === 'open') return status === 'open'
        if (selected === 'under-investigation') return status === 'under investigation'
        if (selected === 'resolved') return status === 'resolved'
        if (selected === 'closed') return status === 'closed'
        
        return true
      })
    : incidents

  // Handle status selection
  const handleStatusSelect = (status: string | null) => {
    setSelectedStatus(status)
  }

  // Handle row click
  const handleRowClick = (row: any) => {
    router.push(`/isms-operations/incidents/${row.id}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading incidents...</p>
        </div>
      </div>
    )
  }



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Information Security Incidents</h1>
          <p className="text-sm text-gray-600 mt-1">
            Track, manage, and respond to information security incidents
          </p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <Link
            href="/isms-operations/incidents/new"
            className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-white rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ 
              backgroundColor: '#4C1D95',
              '--tw-ring-color': '#4C1D95'
            } as React.CSSProperties}
          >
            <Icon name="plus" size={16} className="mr-2" />
            <span className="hidden sm:inline">New Incident</span>
            <span className="sm:hidden">New</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div>
        <DataTable
          columns={getColumns()}
          data={filteredData}
          title="Security Incidents"
          searchPlaceholder="Search incidents..."
          onRowClick={handleRowClick}
          selectable={true}
          onExportCSV={(selectedRows) => {
            // Export functionality can be implemented here
            showToast({ type: 'info', title: `Exporting ${selectedRows.size} selected incidents` })
          }}
          phaseButtons={INCIDENT_STATUSES}
          selectedPhase={selectedStatus}
          onPhaseSelect={handleStatusSelect}
        />
      </div>






    </div>
  )
}