'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Icon from '../../../../components/Icon'
import { useToast } from '../../../../components/Toast'
import { validateRiskId } from '../../../../../lib/utils'

interface Treatment {
  _id: string
  riskId: string
  treatmentJiraTicket: string
  riskTreatment: string
  riskTreatmentOwner: string
  dateRiskTreatmentDue: string
  extendedDueDate?: string
  numberOfExtensions: number
  completionDate?: string
  closureApproval: string
  closureApprovedBy?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

interface Risk {
  _id: string
  riskId: string
  riskTitle: string
  riskDescription: string
  currentPhase: string
  informationAsset: string
  threat: string
  vulnerability: string
  impact: string
  likelihood: string
  riskScore: number
  riskOwner: string
  raisedBy: string
  createdAt: string
  updatedAt: string
}

export default function TreatmentInformation() {
  const params = useParams()
  const router = useRouter()
  const { showToast } = useToast()
  const [treatment, setTreatment] = useState<Treatment | null>(null)
  const [risk, setRisk] = useState<Risk | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Get validated riskId from params
  const riskId = validateRiskId(params.riskId as string)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null) // Clear any previous errors
        // riskId is already validated above
        const treatmentId = params.id as string

        if (!riskId) {
          throw new Error('Invalid risk ID format. Expected format: RISK-XXX')
        }

        // Fetch treatment details
        const treatmentResponse = await fetch(`/api/treatments/${riskId}/${treatmentId}`)
        if (!treatmentResponse.ok) {
          const errorData = await treatmentResponse.json().catch(() => ({}))
          throw new Error(errorData.error || `HTTP ${treatmentResponse.status}: Failed to fetch treatment details`)
        }
        const treatmentData = await treatmentResponse.json()

        // Fetch risk details
        const riskResponse = await fetch(`/api/risks/${riskId}`)
        if (!riskResponse.ok) {
          const errorData = await riskResponse.json().catch(() => ({}))
          throw new Error(errorData.error || `HTTP ${riskResponse.status}: Failed to fetch risk details`)
        }
        const riskData = await riskResponse.json()

        setTreatment(treatmentData)
        setRisk(riskData)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred'
        setError(errorMessage)
        console.error('Treatment fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.riskId, params.id])

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getClosureStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRiskScoreColor = (score: number) => {
    if (score >= 15) return 'bg-red-100 text-red-800 border-red-200'
    if (score >= 8) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-green-100 text-green-800 border-green-200'
  }

  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading treatment details...</p>
        </div>
      </div>
    )
  }

  // Error State
  if (error || !treatment || !risk) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Icon name="exclamation-triangle" size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Treatment Not Found</h2>
          <p className="text-gray-600 mb-4">
            {error || 'The treatment could not be found.'}
          </p>
          <button
            onClick={() => router.push('/risk-management/register')}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ 
              backgroundColor: '#4C1D95',
              '--tw-ring-color': '#4C1D95'
            } as React.CSSProperties}
          >
            <Icon name="arrow-left" size={16} className="mr-2" />
            Back to Register
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Treatment Information Container */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push(`/risk-management/register/${riskId}`)}
              className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 hover:bg-gray-200 bg-white border border-gray-300"
              title="Back to Risk"
            >
              <Icon name="arrow-left" size={16} />
            </button>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#22223B' }}>
                {treatment.treatmentJiraTicket} - Treatment Details
              </h1>
              <p className="text-gray-600" style={{ color: '#22223B' }}>
                Risk: {risk.riskId} - {risk.riskTitle}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                const url = window.location.href
                navigator.clipboard.writeText(url).then(() => {
                  showToast({
                    type: 'success',
                    title: 'Link Copied',
                    message: 'Treatment page link has been copied to clipboard.'
                  })
                })
              }}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Copy link to treatment page"
            >
              <Icon name="link" size={16} className="mr-2" />
              Copy Link
            </button>
            <button
              onClick={() => router.push(`/risk-management/treatments/${riskId}/${params.id}/edit`)}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-white rounded-lg transition-colors"
              style={{ backgroundColor: '#4C1D95' }}
              title="Edit treatment details"
            >
                             <Icon name="pencil" size={16} className="mr-2" />
              Edit Treatment
            </button>

          </div>
        </div>
        
        {/* Treatment Statement - Prominent Display */}
        <div className="bg-gray-50 rounded-lg p-6 border-l-4 mb-8" style={{ borderLeftColor: '#4C1D95' }}>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Treatment Description</label>
          <p className="text-gray-900 leading-relaxed text-base">{treatment.riskTreatment || 'No description provided'}</p>
        </div>

        {/* Treatment Details Section */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <div className="w-1 h-6 bg-purple-600 rounded-full mr-3"></div>
            <h3 className="text-lg font-semibold text-gray-900">Treatment Details</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Treatment Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-4">Treatment Information</h4>
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Treatment Owner</span>
                  <p className="text-sm text-gray-900 mt-1 font-medium">{treatment.riskTreatmentOwner || 'Not assigned'}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Due Date</span>
                  <p className="text-sm text-gray-900 mt-1">{formatDate(treatment.dateRiskTreatmentDue)}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Status</span>
                  <div className="mt-1">
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getClosureStatusColor(treatment.closureApproval)}`}>
                      {treatment.closureApproval}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-4">Timeline</h4>
              <div className="space-y-4">
                {treatment.extendedDueDate && (
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Extended Due Date</span>
                    <p className="text-sm text-gray-900 mt-1">{formatDate(treatment.extendedDueDate)}</p>
                  </div>
                )}
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Number of Extensions</span>
                  <p className="text-sm text-gray-900 mt-1">{treatment.numberOfExtensions}</p>
                </div>
                {treatment.completionDate && (
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Completion Date</span>
                    <p className="text-sm text-gray-900 mt-1">{formatDate(treatment.completionDate)}</p>
                  </div>
                )}
                {treatment.closureApprovedBy && (
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Approved By</span>
                    <p className="text-sm text-gray-900 mt-1">{treatment.closureApprovedBy}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Risk Context Section */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <div className="w-1 h-6 bg-purple-600 rounded-full mr-3"></div>
            <h3 className="text-lg font-semibold text-gray-900">Risk Context</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Risk Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-4">Risk Information</h4>
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Risk ID</span>
                  <Link
                    href={`/risk-management/register/${risk.riskId}`}
                    className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors mt-1"
                  >
                    <Icon name="link" size={12} className="mr-1" />
                    {risk.riskId}
                  </Link>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Risk Score</span>
                  <div className="mt-1">
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getRiskScoreColor(risk.riskScore)}`}>
                      {risk.riskScore}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Phase</span>
                  <div className="mt-1">
                    <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                      {risk.currentPhase}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-4">Risk Assessment</h4>
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Impact</span>
                  <p className="text-sm text-gray-900 mt-1">{risk.impact}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Likelihood</span>
                  <p className="text-sm text-gray-900 mt-1">{risk.likelihood}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Information Asset</span>
                  <p className="text-sm text-gray-900 mt-1">{risk.informationAsset}</p>
                </div>
              </div>
            </div>

            {/* Ownership */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-4">Ownership</h4>
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Risk Owner</span>
                  <p className="text-sm text-gray-900 mt-1 font-medium">{risk.riskOwner || 'Not assigned'}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Raised By</span>
                  <p className="text-sm text-gray-900 mt-1">{risk.raisedBy}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Threat & Vulnerability Section */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <div className="w-1 h-6 bg-purple-600 rounded-full mr-3"></div>
            <h3 className="text-lg font-semibold text-gray-900">Threat & Vulnerability</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-4">Threat</h4>
              <p className="text-sm text-gray-900">{risk.threat}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-4">Vulnerability</h4>
              <p className="text-sm text-gray-900">{risk.vulnerability}</p>
            </div>
          </div>
        </div>

        {/* Risk Description Section */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <div className="w-1 h-6 bg-purple-600 rounded-full mr-3"></div>
            <h3 className="text-lg font-semibold text-gray-900">Risk Description</h3>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-900">{risk.riskDescription}</p>
          </div>
        </div>

        {/* Notes Section */}
        {treatment.notes && (
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <div className="w-1 h-6 bg-purple-600 rounded-full mr-3"></div>
              <h3 className="text-lg font-semibold text-gray-900">Treatment Notes</h3>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-900">{treatment.notes}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 