'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import Icon from '@/app/components/Icon'
import DataTable, { Column } from '@/app/components/DataTable'
import { APPROVAL_STATUS } from '@/lib/constants'

interface Approval {
  _id: string
  requestId: string
  request: string
  category: string
  type: string
  requester: string
  submitted: string
  approvedDate?: string
  status: string
  approvers: string[]
  createdAt: string
  updatedAt: string
  createdBy: string
}

export default function ApprovalsPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<'my' | 'all'>('my')
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [tabCounts, setTabCounts] = useState({ my: 0, all: 0 })

  const tabs = useMemo(() => [
    { id: 'my', label: 'My Approvals', count: tabCounts.my, icon: 'user' },
    { id: 'all', label: 'All Approvals', count: tabCounts.all, icon: 'user-group' }
  ], [tabCounts])

  // Fetch approvals from API
  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        
        if (activeTab === 'my') {
          params.append('userId', session?.user?.id || '')
        }
        
        const response = await fetch(`/api/approvals?${params.toString()}`)
        if (!response.ok) {
          throw new Error('Failed to fetch approvals')
        }
        
        const data = await response.json()
        setApprovals(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch approvals')
        console.error('Error fetching approvals:', err)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.id) {
      fetchApprovals()
    }
  }, [activeTab, session?.user?.id])

  // Update tab counts
  useEffect(() => {
    if (approvals.length > 0) {
      const myCount = approvals.filter(a => a.requester === session?.user?.id).length
      const allCount = approvals.length
      
      setTabCounts({ my: myCount, all: allCount })
    }
  }, [approvals, session?.user?.id])

  // Filter approvals based on active tab
  const filteredApprovals = useMemo(() => {
    return activeTab === 'my' 
      ? approvals.filter(a => a.requester === session?.user?.id)
      : approvals
  }, [activeTab, approvals, session?.user?.id])

  // DataTable columns configuration
  const columns: Column[] = [
    {
      key: 'requestId',
      label: 'Request ID',
      sortable: true,
      width: '140px',
      render: (value) => (
        <span className="font-mono text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
          {value as string}
        </span>
      )
    },
    {
      key: 'request',
      label: 'Request',
      sortable: true,
      width: '300px',
      render: (value) => (
        <div className="max-w-xs">
          <p className="text-sm font-medium text-gray-900 line-clamp-2">
            {value as string}
          </p>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      width: '120px',
      render: (value) => {
        const category = value as string
        const colorClasses = getCategoryColor(category)
        return (
          <span className={cn(
            'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border',
            colorClasses
          )}>
            {category}
          </span>
        )
      }
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      width: '150px',
      render: (value) => (
        <span className="text-sm text-gray-700 bg-gray-50 px-2 py-1 rounded">
          {value as string}
        </span>
      )
    },
    {
      key: 'submitted',
      label: 'Submitted',
      sortable: true,
      width: '120px',
      render: (value) => (
        <div className="text-sm text-gray-600">
          <div className="font-medium">
            {new Date(value as string).toLocaleDateString()}
          </div>
          <div className="text-xs text-gray-500">
            {new Date(value as string).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      width: '120px',
      render: (value) => {
        const status = value as string
        const colorClasses = getStatusColor(status)
        const icon = getStatusIcon(status)
        return (
          <span className={cn(
            'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border',
            colorClasses
          )}>
            <Icon name={icon} size={12} className="mr-1.5" />
            {status}
          </span>
        )
      }
    },
    {
      key: 'requester',
      label: 'Requester',
      sortable: true,
      width: '120px',
      render: (value) => (
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
            <Icon name="user" size={12} className="text-blue-600" />
          </div>
          <span className="text-sm text-gray-700 font-medium">
            {value as string}
          </span>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '200px',
      render: (_, row) => {
        const approval = row as unknown as Approval
        const canApprove = approval.status === APPROVAL_STATUS.PENDING || 
                          approval.status === APPROVAL_STATUS.REVIEWING
        const canReview = approval.status === APPROVAL_STATUS.PENDING
        
        return (
          <div className="flex items-center space-x-2">
            {canReview && (
              <button 
                className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
                onClick={() => handleReview(approval)}
              >
                <Icon name="eye" size={12} className="mr-1" />
                Review
              </button>
            )}
            {canApprove && (
              <>
                <button 
                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded hover:bg-green-100 transition-colors"
                  onClick={() => handleApprove(approval)}
                >
                  <Icon name="check" size={12} className="mr-1" />
                  Approve
                </button>
                <button 
                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition-colors"
                  onClick={() => handleReject(approval)}
                >
                  <Icon name="ban" size={12} className="mr-1" />
                  Reject
                </button>
              </>
            )}
            {approval.status === APPROVAL_STATUS.APPROVED && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded">
                <Icon name="check-circle" size={12} className="mr-1" />
                Approved
              </span>
            )}
            {approval.status === APPROVAL_STATUS.REJECTED && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded">
                <Icon name="ban" size={12} className="mr-1" />
                Rejected
              </span>
            )}
          </div>
        )
      }
    }
  ]

  // Helper functions
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'reviewing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'reviewed':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'clock'
      case 'reviewing':
        return 'eye'
      case 'reviewed':
        return 'check-circle'
      case 'approved':
        return 'check-circle'
      case 'rejected':
        return 'ban'
      default:
        return 'question-circle'
    }
  }

  // Action handlers
  const handleReview = (approval: Approval) => {
    // TODO: Implement review functionality
    console.log('Review approval:', approval.requestId)
  }

  const handleApprove = (approval: Approval) => {
    // TODO: Implement approve functionality
    console.log('Approve approval:', approval.requestId)
  }

  const handleReject = (approval: Approval) => {
    // TODO: Implement reject functionality
    console.log('Reject approval:', approval.requestId)
  }

  const handleExportCSV = (selectedRows: Set<number>) => {
    // TODO: Implement CSV export
    console.log('Export selected rows:', selectedRows)
  }

  const handleRowClick = (row: Approval) => {
    // TODO: Navigate to approval detail page
    console.log('View approval details:', row.requestId)
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Approvals</h1>
          <p className="text-gray-600">Review and manage approval requests across the organization</p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading approvals...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Approvals</h1>
          <p className="text-gray-600">Review and manage approval requests across the organization</p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Approvals</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Icon name="refresh" size={16} className="mr-2" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Icon name="check-circle" size={24} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Approvals</h1>
            <p className="text-gray-600">Review and manage approval requests across the organization</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <Icon name="clock" size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {approvals.filter(a => a.status === APPROVAL_STATUS.PENDING).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                <Icon name="eye" size={16} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">In Review</p>
                <p className="text-2xl font-bold text-gray-900">
                  {approvals.filter(a => a.status === APPROVAL_STATUS.REVIEWING).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <Icon name="check-circle" size={16} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {approvals.filter(a => a.status === APPROVAL_STATUS.APPROVED).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                <Icon name="ban" size={16} className="text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">
                  {approvals.filter(a => a.status === APPROVAL_STATUS.REJECTED).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'my' | 'all')}
                className={cn(
                  'py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors',
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                <Icon name={tab.icon} size={16} />
                <span>{tab.label}</span>
                <span className={cn(
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                )}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {filteredApprovals.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="file" size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No approvals found</h3>
              <p className="text-gray-500">
                {activeTab === 'my' 
                  ? "You haven't submitted any approval requests yet."
                  : "No approval requests have been submitted yet."
                }
              </p>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredApprovals}
              title={`${activeTab === 'my' ? 'My' : 'All'} Approvals`}
              searchPlaceholder="Search approvals..."
              onRowClick={handleRowClick}
              selectable={true}
              selectedRows={selectedRows}
              onSelectionChange={setSelectedRows}
              onExportCSV={handleExportCSV}
              className="min-h-[500px]"
            />
          )}
        </div>
      </div>
    </div>
  )
}
