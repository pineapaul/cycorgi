'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Icon from '@/app/components/Icon'
import Tooltip from '@/app/components/Tooltip'

interface Workshop {
  _id: string
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
  createdAt?: string
  updatedAt?: string
}

export default function WorkshopDetails() {
  const params = useParams()
  const router = useRouter()
  const [workshop, setWorkshop] = useState<Workshop | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWorkshop = async () => {
      try {
        const response = await fetch(`/api/workshops/${params.id}`)
        const result = await response.json()
        
        if (result.success) {
          setWorkshop(result.data)
        } else {
          setError(result.error || 'Failed to fetch workshop')
        }
      } catch (error) {
        setError('Error fetching workshop details')
        console.error('Error fetching workshop:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchWorkshop()
    }
  }, [params.id])

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

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    
    const day = date.getDate().toString().padStart(2, '0')
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    const year = date.getFullYear()
    return `${day} ${month} ${year}`
  }

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    
    const day = date.getDate().toString().padStart(2, '0')
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    const year = date.getFullYear()
    const time = date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
    return `${day} ${month} ${year} at ${time}`
  }

  const handleCopyLink = () => {
    const url = `${window.location.origin}/risk-management/workshops/${workshop?.id}`
    navigator.clipboard.writeText(url).then(() => {
      // You could add a toast notification here
      alert('Link copied to clipboard!')
    })
  }

  const handleEdit = () => {
    router.push(`/risk-management/workshops/${workshop?.id}/edit`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#898AC4' }}></div>
          <p className="mt-4" style={{ color: '#22223B' }}>Loading workshop details...</p>
        </div>
      </div>
    )
  }

  if (error || !workshop) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <Icon name="alert-circle" className="w-5 h-5 text-red-400 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error || 'Workshop not found'}</p>
            </div>
          </div>
        </div>
        <Link
          href="/risk-management/workshops"
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          <Icon name="arrow-left" className="w-4 h-4 mr-2" />
          Back to Workshops
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Workshop Information Container */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/risk-management/workshops')}
              className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 hover:bg-gray-200 bg-white border border-gray-300"
              title="Back to Workshops"
            >
              <Icon name="arrow-left" size={16} />
            </button>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#22223B' }}>
                Workshop {workshop.id}
              </h1>
              <p className="text-gray-600" style={{ color: '#22223B' }}>
                Meeting Minutes & Details
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Copy link to workshop"
            >
              <Icon name="link" size={16} className="mr-2" />
              Copy Link
            </button>
            <button
              onClick={handleEdit}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-white rounded-lg transition-colors"
              style={{ backgroundColor: '#4C1D95' }}
              title="Edit workshop"
            >
              <Icon name="pencil" size={16} className="mr-2" />
              Edit
            </button>
          </div>
        </div>

        {/* Workshop Overview Section */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <div className="w-1 h-6 bg-purple-600 rounded-full mr-3"></div>
            <h3 className="text-lg font-semibold text-gray-900">Workshop Overview</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Date</span>
              <div className="mt-1 text-sm font-medium text-gray-900">{formatDate(workshop.date)}</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Status</span>
              <div className="mt-1">
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(workshop.status)}`}>
                  {workshop.status}
                </span>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Security Steering Committee</span>
              <div className="mt-1 text-sm font-medium text-gray-900">{workshop.securitySteeringCommittee}</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Facilitator</span>
              <div className="mt-1 text-sm font-medium text-gray-900">{workshop.facilitator}</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Participants</span>
              <div className="mt-1 text-sm font-medium text-gray-900">
                {workshop.participants.length > 0 ? workshop.participants.join(', ') : '-'}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Related Risks</span>
              <div className="mt-1 text-sm font-medium text-gray-900">
                {workshop.risks.length > 0 ? workshop.risks.join(', ') : '-'}
              </div>
            </div>
          </div>
        </div>

        {/* Meeting Minutes Section */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <div className="w-1 h-6 bg-purple-600 rounded-full mr-3"></div>
            <h3 className="text-lg font-semibold text-gray-900">Meeting Minutes</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Outcomes */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <Icon name="check-circle" size={16} className="mr-2 text-green-600" />
                Outcomes
              </h4>
              <div className="bg-white rounded-md p-3 border border-gray-200">
                {workshop.outcomes ? (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{workshop.outcomes}</p>
                ) : (
                  <p className="text-sm text-gray-500 italic">No outcomes recorded</p>
                )}
              </div>
            </div>

            {/* Actions Taken */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <Icon name="check" size={16} className="mr-2 text-green-600" />
                Actions Taken
              </h4>
              <div className="bg-white rounded-md p-3 border border-gray-200">
                {workshop.actionsTaken ? (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{workshop.actionsTaken}</p>
                ) : (
                  <p className="text-sm text-gray-500 italic">No actions taken recorded</p>
                )}
              </div>
            </div>

            {/* To Do */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <Icon name="clock" size={16} className="mr-2 text-yellow-600" />
                To Do
              </h4>
              <div className="bg-white rounded-md p-3 border border-gray-200">
                {workshop.toDo ? (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{workshop.toDo}</p>
                ) : (
                  <p className="text-sm text-gray-500 italic">No to-do items recorded</p>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <Icon name="document-text" size={16} className="mr-2 text-blue-600" />
                Notes
              </h4>
              <div className="bg-white rounded-md p-3 border border-gray-200">
                {workshop.notes ? (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{workshop.notes}</p>
                ) : (
                  <p className="text-sm text-gray-500 italic">No notes recorded</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Metadata Section */}
        <div>
          <div className="flex items-center mb-6">
            <div className="w-1 h-6 bg-purple-600 rounded-full mr-3"></div>
            <h3 className="text-lg font-semibold text-gray-900">Metadata</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Created</span>
              <div className="mt-1 text-sm font-medium text-gray-900">
                {workshop.createdAt ? formatDateTime(workshop.createdAt) : '-'}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Last Updated</span>
              <div className="mt-1 text-sm font-medium text-gray-900">
                {workshop.updatedAt ? formatDateTime(workshop.updatedAt) : '-'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Footer */}
      <div className="flex justify-between items-center pt-6">
        <Link
          href="/risk-management/workshops"
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          <Icon name="arrow-left" className="w-4 h-4 mr-2" />
          Back to Workshops
        </Link>
        
        <div className="flex space-x-3">
          <button
            onClick={handleEdit}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
            style={{ backgroundColor: '#4C1D95' }}
          >
            <Icon name="pencil" className="w-4 h-4 mr-2" />
            Edit Workshop
          </button>
        </div>
      </div>
    </div>
  )
} 