'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Icon from '@/app/components/Icon'
import { useToast } from '@/app/components/Toast'
import { EditIncidentModal } from '@/app/components/EditIncidentModal'

interface Incident {
  id: string
  incidentId: string
  functionalUnit: string
  status: string
  dateRaised: string
  raisedBy: string
  location: string
  priority: string
  incidentJiraTicket: string
  informationAsset: string
  description: string
  rootCause: string
  rootCauseCategory: string
  assignedTo: string
  actionTaken: string
  completionDate: string
  dateApprovedForClosure: string
  createdAt: string
  updatedAt: string
}

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
const formatDate = (dateString: string) => {
  if (!dateString || dateString === '') {
    return 'Not specified'
  }
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-AU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch (error) {
    return 'Invalid date'
  }
}

export default function IncidentDetail() {
  const router = useRouter()
  const params = useParams()
  const { showToast } = useToast()

  const [incident, setIncident] = useState<Incident | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const incidentId = params.id as string

  // Fetch incident details
  useEffect(() => {
    const fetchIncident = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/incidents')
        const result = await response.json()
        
        if (result.success) {
          const foundIncident = result.data.find((inc: Incident) => inc.id === incidentId)
          if (foundIncident) {
            setIncident(foundIncident)
          } else {
            setError('Incident not found')
            showToast({ 
              type: 'error', 
              title: 'Incident Not Found',
              message: 'The requested incident could not be found.'
            })
          }
        } else {
          setError(result.error || 'Failed to fetch incident')
          showToast({ 
            type: 'error', 
            title: 'Failed to Fetch Incident',
            message: result.error || 'An error occurred while fetching the incident.'
          })
        }
      } catch (error) {
        console.error('Error fetching incident:', error)
        setError('Failed to fetch incident')
        showToast({ 
          type: 'error', 
          title: 'Failed to Fetch Incident',
          message: 'An error occurred while fetching the incident.'
        })
      } finally {
        setLoading(false)
      }
    }

    if (incidentId) {
      fetchIncident()
    }
  }, [incidentId, showToast])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading incident details...</p>
        </div>
      </div>
    )
  }

  if (error || !incident) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Icon name="exclamation-triangle" className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Incident</h2>
          <p className="text-gray-600 mb-4">{error || 'Incident not found'}</p>
          <div className="space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
            <Link
              href="/isms-operations/incidents"
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Back to Incidents
            </Link>
                  </div>
      </div>

      {/* Edit Incident Modal */}
      <EditIncidentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        incident={incident}
        onIncidentUpdated={() => {
          // Refresh the incident data after update
          window.location.reload()
        }}
      />
    </div>
  )
}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-3">
          <Link
            href="/isms-operations/incidents"
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md transition-colors"
          >
            <Icon name="arrow-left" className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Incident {incident.incidentId}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Information Security Incident Details
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-white rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ 
              backgroundColor: '#4C1D95',
              '--tw-ring-color': '#4C1D95'
            } as React.CSSProperties}
          >
            <Icon name="pencil" size={16} className="mr-2" />
            Edit Incident
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow">
        {/* Incident Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{incident.description}</h2>
              <p className="text-sm text-gray-600 mt-1">
                Reported by {incident.raisedBy} on {formatDate(incident.dateRaised)}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <span className="text-sm font-medium text-gray-500">Priority</span>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityConfig(incident.priority).bg} ${getPriorityConfig(incident.priority).text} ${getPriorityConfig(incident.priority).border}`}>
                    {incident.priority}
                  </span>
                </div>
              </div>
              <div className="text-center">
                <span className="text-sm font-medium text-gray-500">Status</span>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusConfig(incident.status).bg} ${getStatusConfig(incident.status).text} ${getStatusConfig(incident.status).border}`}>
                    {incident.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Incident Details */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-3">Basic Information</h3>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Functional Unit</dt>
                    <dd className="text-sm text-gray-900">{incident.functionalUnit || 'Not specified'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Location</dt>
                    <dd className="text-sm text-gray-900">{incident.location || 'Not specified'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">JIRA Ticket</dt>
                    <dd className="text-sm text-gray-900">{incident.incidentJiraTicket || 'Not specified'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Information Asset</dt>
                    <dd className="text-sm text-gray-900">{incident.informationAsset || 'Not specified'}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="text-base font-medium text-gray-900 mb-3">Root Cause Analysis</h3>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Root Cause</dt>
                    <dd className="text-sm text-gray-900">{incident.rootCause || 'Not specified'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Root Cause Category</dt>
                    <dd className="text-sm text-gray-900">{incident.rootCauseCategory || 'Not specified'}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-3">Assignment & Actions</h3>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Assigned To</dt>
                    <dd className="text-sm text-gray-900">{incident.assignedTo || 'Not specified'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Action Taken</dt>
                    <dd className="text-sm text-gray-900">{incident.actionTaken || 'Not specified'}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="text-base font-medium text-gray-900 mb-3">Timeline</h3>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Date Raised</dt>
                    <dd className="text-sm text-gray-900">{formatDate(incident.dateRaised)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Completion Date</dt>
                    <dd className="text-sm text-gray-900">{formatDate(incident.completionDate)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Date Approved for Closure</dt>
                    <dd className="text-sm text-gray-900">{formatDate(incident.dateApprovedForClosure)}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h3 className="text-base font-medium text-gray-900 mb-3">Description</h3>
            <p className="text-sm text-gray-900 whitespace-pre-wrap">{incident.description || 'No description provided'}</p>
          </div>

          {/* System Information */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h3 className="text-base font-medium text-gray-900 mb-3">System Information</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="font-medium text-gray-500">Created</dt>
                <dd className="text-gray-900">{formatDate(incident.createdAt)}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">Last Updated</dt>
                <dd className="text-gray-900">{formatDate(incident.updatedAt)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Edit Incident Modal */}
      <EditIncidentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        incident={incident}
        onIncidentUpdated={() => {
          // Refresh the incident data after update
          window.location.reload()
        }}
      />
    </div>
  )
}
