'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Icon from '@/app/components/Icon'
import Modal from '@/app/components/Modal'
import ImprovementForm from '@/app/components/ImprovementForm'
import { useToast } from '@/app/hooks/useToast'
import { Improvement } from '@/app/api/improvements/route'

export default function ImprovementDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { showToast } = useToast()
  const [improvement, setImprovement] = useState<Improvement | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingImprovement, setEditingImprovement] = useState<Improvement | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchImprovement(params.id as string)
    }
  }, [params.id])

  const fetchImprovement = async (id: string) => {
    try {
      const response = await fetch(`/api/improvements/${id}`)
      const data = await response.json()
      if (data.success) {
        setImprovement(data.data)
      }
    } catch (error) {
      console.error('Error fetching improvement:', error)
    } finally {
      setLoading(false)
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading improvement...</p>
        </div>
      </div>
    )
  }

  if (!improvement) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <Icon name="exclamation-triangle" size={48} />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Improvement Not Found</h2>
                 <p className="text-gray-600 mb-4">The improvement you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <button
          onClick={() => router.push('/compliance/improvements')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Icon name="arrow-left" size={16} className="mr-2" />
          Back to Improvements
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/compliance/improvements')}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Icon name="arrow-left" size={16} className="mr-2" />
            Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Improvement Details</h1>
            <p className="text-gray-600 mt-1">
              {improvement.ofiJiraTicket} - {improvement.functionalUnit}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(improvement.status)}`}>
            {improvement.status}
          </span>
          <button
            onClick={() => {
              setEditingImprovement(improvement)
              setShowEditModal(true)
            }}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Icon name="pencil" size={16} className="mr-2" />
            Edit
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Functional Unit</label>
                  <p className="mt-1 text-sm text-gray-900">{improvement.functionalUnit}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Date Raised</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(improvement.dateRaised).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Raised By</label>
                  <p className="mt-1 text-sm text-gray-900">{improvement.raisedBy}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Location</label>
                  <p className="mt-1 text-sm text-gray-900">{improvement.location}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">OFI JIRA Ticket</label>
                  <p className="mt-1 text-sm text-gray-900 font-mono">{improvement.ofiJiraTicket}</p>
                </div>
              </div>
            </div>

            {/* Information Asset */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Information Asset</h3>
              <p className="text-sm text-gray-900">{improvement.informationAsset}</p>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Description</h3>
              <p className="text-sm text-gray-900 leading-relaxed">{improvement.description}</p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Assignment & Scoring */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Assignment & Scoring</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Assigned To</label>
                  <p className="mt-1 text-sm text-gray-900">{improvement.assignedTo}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Benefit Score</label>
                  <div className="mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBenefitScoreColor(improvement.benefitScore)}`}>
                      {improvement.benefitScore}/10
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Job Size</label>
                  <div className="mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getJobSizeColor(improvement.jobSize)}`}>
                      {improvement.jobSize}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">WSJF</label>
                  <p className="mt-1 text-sm text-gray-900 font-mono">{improvement.wsjf}</p>
                </div>
              </div>
            </div>

            {/* Planning & Progress */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Planning & Progress</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Prioritised Quarter</label>
                  <p className="mt-1 text-sm text-gray-900">{improvement.prioritisedQuarter}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Action Taken</label>
                  <p className="mt-1 text-sm text-gray-900 leading-relaxed">{improvement.actionTaken}</p>
                </div>
              </div>
            </div>

            {/* Completion Information */}
            {(improvement.completionDate || improvement.dateApprovedForClosure) && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Completion Information</h3>
                <div className="space-y-4">
                  {improvement.completionDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Completion Date</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(improvement.completionDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {improvement.dateApprovedForClosure && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Date Approved for Closure</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(improvement.dateApprovedForClosure).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Timestamps */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
            <div>
              <span className="font-medium">Created:</span> {new Date(improvement.createdAt).toLocaleString()}
            </div>
            <div>
              <span className="font-medium">Last Updated:</span> {new Date(improvement.updatedAt).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && editingImprovement && (
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setEditingImprovement(null)
          }}
          title="Edit Improvement"
          maxWidth="4xl"
        >
          <ImprovementForm
            improvement={editingImprovement}
            mode="edit"
            onSubmit={async (formData) => {
              try {
                const response = await fetch(`/api/improvements/${editingImprovement._id}`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(formData),
                })

                const data = await response.json()
                if (data.success) {
                  // Refresh the improvement data
                  await fetchImprovement(params.id as string)
                  setShowEditModal(false)
                  setEditingImprovement(null)
                  showToast({
                    type: 'success',
                    title: 'Improvement Updated',
                    message: 'The improvement has been successfully updated.'
                  })
                } else {
                  showToast({
                    type: 'error',
                    title: 'Update Failed',
                    message: data.error || 'Failed to update the improvement.'
                  })
                }
              } catch (error) {
                console.error('Error updating improvement:', error)
                showToast({
                  type: 'error',
                  title: 'Update Failed',
                  message: 'An error occurred while updating the improvement.'
                })
              }
            }}
            onCancel={() => {
              setShowEditModal(false)
              setEditingImprovement(null)
            }}
          />
        </Modal>
      )}
    </div>
  )
}
