'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Icon from '@/app/components/Icon'
import Modal from '@/app/components/Modal'
import CorrectiveActionForm from '@/app/components/CorrectiveActionForm'
import { CorrectiveAction } from '@/app/api/corrective-actions/route'
import { CORRECTIVE_ACTION_STATUS, CORRECTIVE_ACTION_SEVERITY } from '@/lib/constants'
import { ObjectId } from 'mongodb'

export default function CorrectiveActionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [correctiveAction, setCorrectiveAction] = useState<CorrectiveAction | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchCorrectiveAction(params.id as string)
    }
  }, [params.id])

  const fetchCorrectiveAction = async (id: string) => {
    try {
      const response = await fetch(`/api/corrective-actions/${id}`)
      const data = await response.json()
      
      if (data.success) {
        setCorrectiveAction(data.data)
      } else {
        setError(data.error || 'Failed to fetch corrective action')
      }
    } catch (error) {
      console.error('Error fetching corrective action:', error)
      setError('Failed to fetch corrective action')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setShowEditModal(true)
  }

  const handleEditSubmit = async (data: Partial<CorrectiveAction>) => {
    try {
      const response = await fetch(`/api/corrective-actions/${correctiveAction?._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (response.ok) {
        await fetchCorrectiveAction(correctiveAction?._id as string)
        setShowEditModal(false)
      }
    } catch (error) {
      console.error('Error updating corrective action:', error)
    }
  }

  const handleDelete = async () => {
    if (!correctiveAction?._id) return
    
    setDeleting(true)
    try {
      const response = await fetch(`/api/corrective-actions/${correctiveAction._id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        router.push('/compliance/corrective-actions')
      }
    } catch (error) {
      console.error('Error deleting corrective action:', error)
      setDeleting(false)
    }
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

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-AU')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading corrective action...</p>
        </div>
      </div>
    )
  }

  if (error || !correctiveAction) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <Icon name="warning" size={48} />
        </div>
        <h3 className="text-lg font-semibold mb-2 text-gray-900">Error Loading Corrective Action</h3>
        <p className="text-gray-600 mb-4">{error || 'Corrective action not found'}</p>
        <button
          onClick={() => router.push('/compliance/corrective-actions')}
          className="px-4 py-2 rounded-lg transition-colors bg-blue-600 text-white hover:bg-blue-700"
        >
          Back to Corrective Actions
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push('/compliance/corrective-actions')}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Icon name="arrow-left" size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {correctiveAction.correctiveActionId}
              </h1>
              <p className="text-gray-600 mt-1">
                Corrective Action Details
              </p>
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleEdit}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Icon name="pencil" size={16} className="mr-2" />
            Edit
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            <Icon name="trash" size={16} className="mr-2" />
            Delete
          </button>
        </div>
      </div>

      {/* Status and Severity Badges */}
      <div className="flex space-x-4">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(correctiveAction.status)}`}>
          {correctiveAction.status}
        </span>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(correctiveAction.severity)}`}>
          {correctiveAction.severity}
        </span>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Functional Unit</label>
                <p className="mt-1 text-sm text-gray-900">{correctiveAction.functionalUnit}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Date Raised</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(correctiveAction.dateRaised)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Raised By</label>
                <p className="mt-1 text-sm text-gray-900">{correctiveAction.raisedBy}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Location</label>
                <p className="mt-1 text-sm text-gray-900">{correctiveAction.location}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">CA JIRA Ticket</label>
                <p className="mt-1 text-sm text-gray-900">{correctiveAction.caJiraTicket}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Information Asset</label>
                <p className="mt-1 text-sm text-gray-900">{correctiveAction.informationAsset}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment & Timeline</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Assigned To</label>
                <p className="mt-1 text-sm text-gray-900">{correctiveAction.assignedTo}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Resolution Due Date</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(correctiveAction.resolutionDueDate)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Completion Date</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(correctiveAction.completionDate || '')}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Date Approved for Closure</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(correctiveAction.dateApprovedForClosure || '')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Root Cause Analysis</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Root Cause Category</label>
                <p className="mt-1 text-sm text-gray-900">{correctiveAction.rootCauseCategory}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Root Cause</label>
                <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{correctiveAction.rootCause}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
            <p className="text-sm text-gray-900 whitespace-pre-wrap">{correctiveAction.description}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Action Taken</h3>
            <p className="text-sm text-gray-900 whitespace-pre-wrap">
              {correctiveAction.actionTaken || 'No action taken yet'}
            </p>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        maxWidth="6xl"
      >
        <CorrectiveActionForm
          correctiveAction={correctiveAction}
          onSubmit={handleEditSubmit}
          onCancel={() => setShowEditModal(false)}
          mode="edit"
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        maxWidth="md"
      >
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <Icon name="warning" size={24} className="text-red-600" />
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Delete Corrective Action
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this corrective action? This action cannot be undone.
            </p>
            <div className="flex justify-center space-x-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
