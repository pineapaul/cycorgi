'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DataTable, { Column } from '@/app/components/DataTable'
import Icon from '@/app/components/Icon'
import Modal from '@/app/components/Modal'
import CorrectiveActionForm from '@/app/components/CorrectiveActionForm'
import { CorrectiveAction } from '@/app/api/corrective-actions/route'
import { CORRECTIVE_ACTION_STATUS, CORRECTIVE_ACTION_SEVERITY } from '@/lib/constants'

export default function CorrectiveActionsPage() {
  const router = useRouter()
  const [correctiveActions, setCorrectiveActions] = useState<CorrectiveAction[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingCorrectiveAction, setEditingCorrectiveAction] = useState<CorrectiveAction | null>(null)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')

  useEffect(() => {
    fetchCorrectiveActions()
  }, [])

  const fetchCorrectiveActions = async () => {
    try {
      const response = await fetch('/api/corrective-actions')
      const data = await response.json()
      if (data.success) {
        setCorrectiveActions(data.data)
      }
    } catch (error) {
      console.error('Error fetching corrective actions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRowClick = (correctiveAction: CorrectiveAction) => {
    // Navigate to corrective action detail page
    router.push(`/compliance/corrective-actions/${correctiveAction._id}`)
  }

  const handleCreateCorrectiveAction = () => {
    setFormMode('create')
    setEditingCorrectiveAction(null)
    setShowFormModal(true)
  }

  const handleEditCorrectiveAction = (correctiveAction: CorrectiveAction) => {
    setFormMode('edit')
    setEditingCorrectiveAction(correctiveAction)
    setShowFormModal(true)
  }

  const handleFormSubmit = async (data: Partial<CorrectiveAction>) => {
    try {
      if (formMode === 'create') {
        const response = await fetch('/api/corrective-actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
        
        if (response.ok) {
          await fetchCorrectiveActions()
          setShowFormModal(false)
        }
      } else if (formMode === 'edit' && editingCorrectiveAction?._id) {
        const response = await fetch(`/api/corrective-actions/${editingCorrectiveAction._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
        
        if (response.ok) {
          await fetchCorrectiveActions()
          setShowFormModal(false)
        }
      }
    } catch (error) {
      console.error('Error saving corrective action:', error)
    }
  }

  const handleFormCancel = () => {
    setShowFormModal(false)
    setEditingCorrectiveAction(null)
  }

  const handleExportCSV = (selectedRows: Set<number>) => {
    // Export selected corrective actions to CSV
    console.log('Exporting corrective actions:', selectedRows)
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'closed':
        return 'bg-green-100 text-green-800'
      case 'in progress':
        return 'bg-blue-100 text-blue-800'
      case 'pending review':
      case 'pending approval':
        return 'bg-yellow-100 text-yellow-800'
      case 'on hold':
        return 'bg-orange-100 text-orange-800'
      case 'open':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const columns: Column[] = [
    {
      key: 'correctiveActionId',
      label: 'Corrective Action ID',
      sortable: true,
      width: '150px'
    },
    {
      key: 'functionalUnit',
      label: 'Functional Unit',
      sortable: true,
      width: '150px'
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      width: '120px',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value as string)}`}>
          {value as string}
        </span>
      )
    },
    {
      key: 'dateRaised',
      label: 'Date Raised',
      sortable: true,
      width: '120px'
    },
    {
      key: 'raisedBy',
      label: 'Raised By',
      sortable: true,
      width: '130px'
    },
    {
      key: 'location',
      label: 'Location',
      sortable: true,
      width: '130px'
    },
    {
      key: 'severity',
      label: 'Severity',
      sortable: true,
      width: '100px',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(value as string)}`}>
          {value as string}
        </span>
      )
    },
    {
      key: 'caJiraTicket',
      label: 'CA JIRA Ticket',
      sortable: true,
      width: '140px'
    },
    {
      key: 'informationAsset',
      label: 'Information Asset',
      sortable: true,
      width: '160px'
    },
    {
      key: 'description',
      label: 'Description',
      sortable: true,
      width: '250px',
      render: (value) => (
        <div className="max-w-xs truncate" title={value as string}>
          {value as string}
        </div>
      )
    },
    {
      key: 'rootCause',
      label: 'Root Cause',
      sortable: true,
      width: '200px',
      render: (value) => (
        <div className="max-w-xs truncate" title={value as string}>
          {value as string}
        </div>
      )
    },
    {
      key: 'rootCauseCategory',
      label: 'Root Cause Category',
      sortable: true,
      width: '160px'
    },
    {
      key: 'assignedTo',
      label: 'Assigned To',
      sortable: true,
      width: '130px'
    },
    {
      key: 'resolutionDueDate',
      label: 'Resolution Due Date',
      sortable: true,
      width: '140px'
    },
    {
      key: 'actionTaken',
      label: 'Action Taken',
      sortable: true,
      width: '200px',
      render: (value) => (
        <div className="max-w-xs truncate" title={value as string}>
          {value as string || '-'}
        </div>
      )
    },
    {
      key: 'completionDate',
      label: 'Completion Date',
      sortable: true,
      width: '130px',
      render: (value) => <span>{value ? String(value) : '-'}</span>
    },
    {
      key: 'dateApprovedForClosure',
      label: 'Date Approved for Closure',
      sortable: true,
      width: '160px',
      render: (value) => <span>{value ? String(value) : '-'}</span>
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '100px',
      align: 'center',
      render: (value, row) => (
        <div className="flex items-center justify-center space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleRowClick(row as unknown as CorrectiveAction)
            }}
            className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
            title="View Details"
          >
            <Icon name="eye" size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleEditCorrectiveAction(row as unknown as CorrectiveAction)
            }}
            className="p-1 text-green-600 hover:text-green-800 transition-colors"
            title="Edit"
          >
            <Icon name="pencil" size={16} />
          </button>
        </div>
      )
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading corrective actions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Corrective Actions</h1>
          <p className="text-gray-600 mt-1">
            Track and manage corrective actions to address compliance gaps and audit findings
          </p>
        </div>
        <button
          onClick={handleCreateCorrectiveAction}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Icon name="plus" size={16} className="mr-2" />
          New Corrective Action
        </button>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={correctiveActions}
        title="Corrective Actions"
        searchPlaceholder="Search corrective actions..."
        onRowClick={handleRowClick}
        selectable={true}
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        onExportCSV={handleExportCSV}
        className="bg-white"
      />

      {/* Form Modal */}
      <Modal
        isOpen={showFormModal}
        onClose={handleFormCancel}
        maxWidth="6xl"
      >
        <CorrectiveActionForm
          correctiveAction={editingCorrectiveAction || undefined}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          mode={formMode}
        />
      </Modal>
    </div>
  )
} 