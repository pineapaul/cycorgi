'use client'

import { useState, useEffect, useCallback } from 'react'
import Icon from './Icon'
import { useToast } from './Toast'

interface User {
  _id: string
  name: string
  email: string
  roles: string[]
}

interface ReviewerSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (selectedReviewers: string[]) => void
  riskId: string
  riskTitle: string
}

export default function ReviewerSelectionModal({
  isOpen,
  onClose,
  onConfirm,
  riskId,
  riskTitle
}: ReviewerSelectionModalProps) {
  const [reviewers, setReviewers] = useState<User[]>([])
  const [selectedReviewers, setSelectedReviewers] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchingReviewers, setFetchingReviewers] = useState(false)
  const { showToast } = useToast()

  const fetchReviewers = useCallback(async () => {
    setFetchingReviewers(true)
    try {
      const response = await fetch('/api/users/draft-reviewers')
      if (response.ok) {
        const data = await response.json()
        setReviewers(data)
      } else {
        showToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to fetch available reviewers',
          duration: 5000
        })
      }
    } catch (error) {
      console.error('Error fetching reviewers:', error)
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch available reviewers',
        duration: 5000
      })
    } finally {
      setFetchingReviewers(false)
    }
  }, [showToast])

  // Fetch available reviewers when modal opens
  useEffect(() => {
    if (isOpen && reviewers.length === 0) {
      fetchReviewers()
    }
  }, [isOpen, reviewers.length, fetchReviewers])

  const handleReviewerToggle = (reviewerId: string) => {
    setSelectedReviewers(prev => 
      prev.includes(reviewerId)
        ? prev.filter(id => id !== reviewerId)
        : [...prev, reviewerId]
    )
  }

  const handleConfirm = async () => {
    if (selectedReviewers.length === 0) {
      showToast({
        type: 'error',
        title: 'Selection Required',
        message: 'Please select at least one reviewer',
        duration: 5000
      })
      return
    }

    setLoading(true)
    try {
      onConfirm(selectedReviewers)
      onClose()
    } catch (error) {
      console.error('Error confirming selection:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Select Reviewers for Risk Review
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Icon name="x" size={24} />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Risk: {riskTitle} ({riskId})
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto max-h-[60vh]">
          {fetchingReviewers ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading reviewers...</span>
            </div>
          ) : reviewers.length === 0 ? (
            <div className="text-center py-8">
              <Icon name="users" size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No draft risk reviewers found</p>
              <p className="text-sm text-gray-500 mt-2">
                Users with the &quot;Draft Risk Reviewer&quot; role need to be assigned first.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                Select one or more reviewers who will review this risk submission:
              </p>
              {reviewers.map((reviewer) => (
                <label
                  key={reviewer._id}
                  className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedReviewers.includes(reviewer._id)}
                    onChange={() => handleReviewerToggle(reviewer._id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">
                        {reviewer.name}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {reviewer.roles.join(', ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{reviewer.email}</p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedReviewers.length > 0 && (
                <span>
                  {selectedReviewers.length} reviewer{selectedReviewers.length > 1 ? 's' : ''} selected
                </span>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={selectedReviewers.length === 0 || loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit for Review'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
