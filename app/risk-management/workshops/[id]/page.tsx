'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Icon from '../../../components/Icon'
import Tooltip from '../../../components/Tooltip'

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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !workshop) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
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
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <Icon name="arrow-left" className="w-4 h-4 mr-2" />
          Back to Workshops
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-3">
            <Link
              href="/risk-management/workshops"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <Icon name="arrow-left" className="w-4 h-4 mr-1" />
              Back to Workshops
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">Workshop {workshop.id}</h1>
          <p className="text-gray-600 mt-1">Meeting Minutes & Details</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => router.push(`/risk-management/workshops/${workshop.id}/edit`)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Icon name="edit" className="w-4 h-4 mr-2" />
            Edit Workshop
          </button>
        </div>
      </div>

      {/* Workshop Overview */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Workshop Overview</h2>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <dt className="text-sm font-medium text-gray-500">Date</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatDate(workshop.date)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(workshop.status)}`}>
                  {workshop.status}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Security Steering Committee</dt>
              <dd className="mt-1 text-sm text-gray-900">{workshop.securitySteeringCommittee}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Facilitator</dt>
              <dd className="mt-1 text-sm text-gray-900">{workshop.facilitator}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Participants</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {workshop.participants.length > 0 ? workshop.participants.join(', ') : '-'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Related Risks</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {workshop.risks.length > 0 ? workshop.risks.join(', ') : '-'}
              </dd>
            </div>
          </div>
        </div>
      </div>

      {/* Meeting Minutes */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Meeting Minutes</h2>
        </div>
        <div className="px-6 py-4 space-y-6">
          {/* Outcomes */}
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-2">Outcomes</h3>
            <div className="bg-gray-50 rounded-md p-4">
              {workshop.outcomes ? (
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{workshop.outcomes}</p>
              ) : (
                <p className="text-sm text-gray-500 italic">No outcomes recorded</p>
              )}
            </div>
          </div>

          {/* Actions Taken */}
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-2">Actions Taken</h3>
            <div className="bg-green-50 rounded-md p-4">
              {workshop.actionsTaken ? (
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{workshop.actionsTaken}</p>
              ) : (
                <p className="text-sm text-gray-500 italic">No actions taken recorded</p>
              )}
            </div>
          </div>

          {/* To Do */}
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-2">To Do</h3>
            <div className="bg-yellow-50 rounded-md p-4">
              {workshop.toDo ? (
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{workshop.toDo}</p>
              ) : (
                <p className="text-sm text-gray-500 italic">No to-do items recorded</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-2">Notes</h3>
            <div className="bg-blue-50 rounded-md p-4">
              {workshop.notes ? (
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{workshop.notes}</p>
              ) : (
                <p className="text-sm text-gray-500 italic">No notes recorded</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Metadata</h2>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {workshop.createdAt ? formatDateTime(workshop.createdAt) : '-'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {workshop.updatedAt ? formatDateTime(workshop.updatedAt) : '-'}
              </dd>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-6">
        <Link
          href="/risk-management/workshops"
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <Icon name="arrow-left" className="w-4 h-4 mr-2" />
          Back to Workshops
        </Link>
        <div className="flex space-x-3">
          <button
            onClick={() => router.push(`/risk-management/workshops/${workshop.id}/edit`)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <Icon name="edit" className="w-4 h-4 mr-2" />
            Edit Workshop
          </button>
        </div>
      </div>
    </div>
  )
} 