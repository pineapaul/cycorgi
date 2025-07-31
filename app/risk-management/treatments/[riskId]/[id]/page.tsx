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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null) // Clear any previous errors
        const riskId = validateRiskId(params.riskId as string)
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
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiskScoreColor = (score: number) => {
    if (score >= 15) return 'bg-red-100 text-red-800'
    if (score >= 8) return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-900"></div>
      </div>
    )
  }

  if (error || !treatment || !risk) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <Icon name="alert-circle" size={48} className="text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Treatment</h1>
          <p className="text-gray-600 mb-4">{error || 'Treatment not found'}</p>
          <Link
            href={`/risk-management/register/${validateRiskId(params.riskId as string) || ''}`}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
            style={{ backgroundColor: '#4C1D95' }}
          >
            <Icon name="arrow-left" size={16} className="mr-2" />
            Back to Risk
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href={`/risk-management/register/${validateRiskId(params.riskId as string) || ''}`}
                className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                <Icon name="arrow-left" size={16} className="mr-2" />
                Back to Risk
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">
                Treatment Details
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {treatment.treatmentJiraTicket}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Treatment Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Treatment Information</h2>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Treatment Description
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                    {treatment.riskTreatment || 'No description provided'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Treatment Owner
                    </label>
                    <p className="text-sm text-gray-900">{treatment.riskTreatmentOwner || 'Not assigned'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Due Date
                    </label>
                    <p className="text-sm text-gray-900">{formatDate(treatment.dateRiskTreatmentDue)}</p>
                  </div>
                </div>

                {treatment.extendedDueDate && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Extended Due Date
                      </label>
                      <p className="text-sm text-gray-900">{formatDate(treatment.extendedDueDate)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Number of Extensions
                      </label>
                      <p className="text-sm text-gray-900">{treatment.numberOfExtensions}</p>
                    </div>
                  </div>
                )}

                {treatment.completionDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Completion Date
                    </label>
                    <p className="text-sm text-gray-900">{formatDate(treatment.completionDate)}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Closure Approval
                    </label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getClosureStatusColor(treatment.closureApproval)}`}>
                      {treatment.closureApproval}
                    </span>
                  </div>
                  {treatment.closureApprovedBy && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Approved By
                      </label>
                      <p className="text-sm text-gray-900">{treatment.closureApprovedBy}</p>
                    </div>
                  )}
                </div>

                {treatment.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                      {treatment.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Risk Context */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Risk Context</h2>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Risk Title
                  </label>
                  <p className="text-sm text-gray-900 font-medium">{risk.riskTitle}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Risk Description
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                    {risk.riskDescription}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Information Asset
                    </label>
                    <p className="text-sm text-gray-900">{risk.informationAsset}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Risk Phase
                    </label>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {risk.currentPhase}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Threat
                    </label>
                    <p className="text-sm text-gray-900">{risk.threat}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vulnerability
                    </label>
                    <p className="text-sm text-gray-900">{risk.vulnerability}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Risk Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Risk Summary</h3>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Risk ID
                  </label>
                  <Link
                    href={`/risk-management/register/${risk._id}`}
                    className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
                  >
                    <Icon name="link" size={12} className="mr-1" />
                    {risk.riskId}
                  </Link>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Risk Score
                  </label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskScoreColor(risk.riskScore)}`}>
                    {risk.riskScore}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Impact
                    </label>
                    <p className="text-sm text-gray-900">{risk.impact}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Likelihood
                    </label>
                    <p className="text-sm text-gray-900">{risk.likelihood}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Risk Owner
                    </label>
                    <p className="text-sm text-gray-900">{risk.riskOwner || 'Not assigned'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Raised By
                    </label>
                    <p className="text-sm text-gray-900">{risk.raisedBy}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Treatment Timeline */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Timeline</h3>
              </div>
              <div className="px-6 py-4 space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Treatment Created</p>
                    <p className="text-xs text-gray-500">{formatDate(treatment.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Due Date</p>
                    <p className="text-xs text-gray-500">{formatDate(treatment.dateRiskTreatmentDue)}</p>
                  </div>
                </div>
                {treatment.extendedDueDate && (
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Extended Due Date</p>
                      <p className="text-xs text-gray-500">{formatDate(treatment.extendedDueDate)}</p>
                    </div>
                  </div>
                )}
                {treatment.completionDate && (
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Completed</p>
                      <p className="text-xs text-gray-500">{formatDate(treatment.completionDate)}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Last Updated</p>
                    <p className="text-xs text-gray-500">{formatDate(treatment.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 