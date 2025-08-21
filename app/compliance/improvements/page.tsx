'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DataTable, { Column } from '@/app/components/DataTable'
import Icon from '@/app/components/Icon'
import Modal from '@/app/components/Modal'
import ImprovementForm from '@/app/components/ImprovementForm'
import { Improvement } from '@/app/api/improvements/route'

export default function ImprovementsPage() {
  const router = useRouter()
  const [improvements, setImprovements] = useState<Improvement[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingImprovement, setEditingImprovement] = useState<Improvement | null>(null)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')

  useEffect(() => {
    fetchImprovements()
  }, [])

  const fetchImprovements = async () => {
    try {
      const response = await fetch('/api/improvements')
      const data = await response.json()
      if (data.success) {
        setImprovements(data.data)
      }
    } catch (error) {
      console.error('Error fetching improvements:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRowClick = (improvement: Improvement) => {
    // Navigate to improvement detail page
    router.push(`/compliance/improvements/${improvement._id}`)
  }

  const handleCreateImprovement = () => {
    setFormMode('create')
    setEditingImprovement(null)
    setShowFormModal(true)
  }

  const handleEditImprovement = (improvement: Improvement) => {
    setFormMode('edit')
    setEditingImprovement(improvement)
    setShowFormModal(true)
  }

  const handleFormSubmit = async (data: Partial<Improvement>) => {
    try {
      if (formMode === 'create') {
        const response = await fetch('/api/improvements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
        
        if (response.ok) {
          await fetchImprovements()
          setShowFormModal(false)
        }
      } else if (formMode === 'edit' && editingImprovement?._id) {
        const response = await fetch(`/api/improvements/${editingImprovement._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
        
        if (response.ok) {
          await fetchImprovements()
          setShowFormModal(false)
        }
      }
    } catch (error) {
      console.error('Error saving improvement:', error)
    }
  }

  const handleFormCancel = () => {
    setShowFormModal(false)
    setEditingImprovement(null)
  }

  const handleExportCSV = (selectedRows: Set<number>) => {
    // Export selected improvements to CSV
    console.log('Exporting improvements:', selectedRows)
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in progress':
        return 'bg-blue-100 text-blue-800'
      case 'planning':
        return 'bg-yellow-100 text-yellow-800'
      case 'on hold':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getJobSizeColor = (jobSize: string) => {
    switch (jobSize?.toLowerCase()) {
      case 'small':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'large':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getBenefitScoreColor = (score: number) => {
    if (score >= 8) return 'bg-green-100 text-green-800'
    if (score >= 6) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const columns: Column[] = [
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
      key: 'ofiJiraTicket',
      label: 'OFI JIRA Ticket',
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
      width: '250px'
    },
    {
      key: 'assignedTo',
      label: 'Assigned To',
      sortable: true,
      width: '130px'
    },
    {
      key: 'benefitScore',
      label: 'Benefit Score',
      sortable: true,
      width: '120px',
      align: 'center',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBenefitScoreColor(value as number)}`}>
          {value as number}/10
        </span>
      )
    },
    {
      key: 'jobSize',
      label: 'Job Size',
      sortable: true,
      width: '100px',
      align: 'center',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getJobSizeColor(value as string)}`}>
          {value as string}
        </span>
      )
    },
    {
      key: 'wsjf',
      label: 'WSJF',
      sortable: true,
      width: '80px',
      align: 'center'
    },
    {
      key: 'prioritisedQuarter',
      label: 'Prioritised Quarter',
      sortable: true,
      width: '140px'
    },
    {
      key: 'actionTaken',
      label: 'Action Taken',
      sortable: true,
      width: '200px'
    },
    {
      key: 'completionDate',
      label: 'Completion Date',
      sortable: true,
      width: '130px'
    },
    {
      key: 'dateApprovedForClosure',
      label: 'Date Approved for Closure',
      sortable: true,
      width: '160px'
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
              handleRowClick(row as unknown as Improvement)
            }}
            className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
            title="View Details"
          >
            <Icon name="eye" size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleEditImprovement(row as unknown as Improvement)
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
          <p className="text-gray-600">Loading improvements...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Improvements</h1>
          <p className="text-gray-600 mt-1">
            Track continuous improvement initiatives and enhancement opportunities for your ISMS
          </p>
        </div>
        <button
          onClick={handleCreateImprovement}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Icon name="plus" size={16} className="mr-2" />
          New Improvement
        </button>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={improvements}
        title="Improvements"
        searchPlaceholder="Search improvements..."
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
        maxWidth="4xl"
      >
        <ImprovementForm
          improvement={editingImprovement || undefined}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          mode={formMode}
        />
      </Modal>
    </div>
  )
} 