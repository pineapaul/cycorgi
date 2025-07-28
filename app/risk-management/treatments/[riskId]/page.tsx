'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DataTable, { Column } from '../../../components/DataTable'
import Icon from '../../../components/Icon'

// Sample risk details
const getRiskDetails = (riskId: string) => {
  const riskDetails = {
    'RISK-001': {
      riskId: 'RISK-001',
      functionalUnit: 'IT Security',
      informationAsset: 'Customer Database, Payment Systems',
      riskStatement: 'Risk of unauthorized access to sensitive customer data through weak authentication mechanisms and insufficient access controls, potentially leading to data breaches and regulatory non-compliance.',
      riskRating: 'High',
      consequenceRating: 'High',
      likelihoodRating: 'Medium',
      impact: {
        confidentiality: 'High',
        integrity: 'Medium',
        availability: 'Low'
      },
      riskOwner: 'IT Security Manager',
      threat: 'Malicious actors attempting to gain unauthorized access to customer data',
      vulnerability: 'Weak password policies, lack of multi-factor authentication, insufficient access controls',
      currentControls: 'Basic password authentication, quarterly access reviews, network segmentation'
    },
    'RISK-002': {
      riskId: 'RISK-002',
      functionalUnit: 'Procurement',
      informationAsset: 'Vendor Management System',
      riskStatement: 'Risk associated with third-party vendors accessing company systems without proper security controls and monitoring, potentially leading to data exposure and compliance violations.',
      riskRating: 'Medium',
      consequenceRating: 'Medium',
      likelihoodRating: 'Medium',
      impact: {
        confidentiality: 'Medium',
        integrity: 'Low',
        availability: 'Low'
      },
      riskOwner: 'Procurement Director',
      threat: 'Third-party vendors with excessive or inappropriate access to company systems',
      vulnerability: 'Lack of vendor access controls, insufficient monitoring of vendor activities',
      currentControls: 'Basic vendor agreements, annual security assessments'
    },
    'RISK-004': {
      riskId: 'RISK-004',
      functionalUnit: 'Finance',
      informationAsset: 'Financial Systems',
      riskStatement: 'Risk of financial fraud due to inadequate controls and monitoring in financial systems, potentially leading to significant financial losses and regulatory penalties.',
      riskRating: 'High',
      consequenceRating: 'High',
      likelihoodRating: 'Medium',
      impact: {
        confidentiality: 'Medium',
        integrity: 'High',
        availability: 'Medium'
      },
      riskOwner: 'Finance Director',
      threat: 'Internal fraud, external cyber attacks targeting financial data',
      vulnerability: 'Inadequate segregation of duties, weak approval workflows, insufficient monitoring',
      currentControls: 'Basic approval workflows, monthly reconciliations, annual audits'
    },
    'RISK-005': {
      riskId: 'RISK-005',
      functionalUnit: 'HR',
      informationAsset: 'HR Systems',
      riskStatement: 'Risk of unauthorized access to employee personal data through weak access controls and insufficient monitoring, potentially leading to privacy violations and regulatory non-compliance.',
      riskRating: 'High',
      consequenceRating: 'High',
      likelihoodRating: 'Medium',
      impact: {
        confidentiality: 'High',
        integrity: 'Low',
        availability: 'Low'
      },
      riskOwner: 'HR Director',
      threat: 'Unauthorized access to sensitive employee information',
      vulnerability: 'Weak access controls, insufficient monitoring of HR system access',
      currentControls: 'Basic access controls, annual access reviews, data encryption'
    },
    'RISK-006': {
      riskId: 'RISK-006',
      functionalUnit: 'Operations',
      informationAsset: 'Production Systems, Network Infrastructure',
      riskStatement: 'Risk of system downtime and data loss due to inadequate backup procedures and disaster recovery planning, potentially leading to business interruption and revenue loss.',
      riskRating: 'Medium',
      consequenceRating: 'High',
      likelihoodRating: 'Low',
      impact: {
        confidentiality: 'Low',
        integrity: 'Medium',
        availability: 'High'
      },
      riskOwner: 'Operations Director',
      threat: 'Hardware failures, natural disasters, cyber attacks causing system outages',
      vulnerability: 'Inadequate backup procedures, lack of disaster recovery testing, insufficient redundancy',
      currentControls: 'Weekly backups, basic disaster recovery plan, annual testing'
    },
    'RISK-007': {
      riskId: 'RISK-007',
      functionalUnit: 'Legal',
      informationAsset: 'Contract Management System, Legal Documents',
      riskStatement: 'Risk of non-compliance with regulatory requirements and contractual obligations due to inadequate legal review processes and documentation management.',
      riskRating: 'High',
      consequenceRating: 'High',
      likelihoodRating: 'Medium',
      impact: {
        confidentiality: 'Medium',
        integrity: 'High',
        availability: 'Low'
      },
      riskOwner: 'Legal Director',
      threat: 'Regulatory violations, contractual breaches, legal disputes',
      vulnerability: 'Inadequate legal review processes, poor documentation management, lack of compliance monitoring',
      currentControls: 'Basic contract review process, annual compliance audits, legal document storage'
    },
    'RISK-008': {
      riskId: 'RISK-008',
      functionalUnit: 'Marketing',
      informationAsset: 'Customer Data, Marketing Campaigns',
      riskStatement: 'Risk of data privacy violations and reputational damage due to inadequate customer consent management and data protection measures in marketing activities.',
      riskRating: 'Medium',
      consequenceRating: 'Medium',
      likelihoodRating: 'Medium',
      impact: {
        confidentiality: 'High',
        integrity: 'Low',
        availability: 'Low'
      },
      riskOwner: 'Marketing Director',
      threat: 'Data privacy violations, customer complaints, regulatory fines',
      vulnerability: 'Inadequate consent management, poor data protection practices, insufficient privacy controls',
      currentControls: 'Basic consent collection, quarterly privacy reviews, data encryption'
    }
  }
  return riskDetails[riskId as keyof typeof riskDetails] || null
}

// Sample treatments for specific risks
const getRiskTreatments = (riskId: string) => {
  const treatments = {
    'RISK-001': [
      {
        riskTreatment: 'Implement multi-factor authentication and access controls',
        treatmentJiraTicket: 'TREAT-001',
        riskTreatmentOwner: 'IT Security Team',
        dateRiskTreatmentDue: '2024-03-15',
        extendedDueDate: '2024-04-15',
        numberOfExtensions: 1,
        completionDate: '2024-04-10',
        closureApproval: 'Approved',
        closureApprovedBy: 'Security Manager'
      }
    ],
    'RISK-002': [
      {
        riskTreatment: 'Enhanced vendor security assessments and monitoring',
        treatmentJiraTicket: 'TREAT-002',
        riskTreatmentOwner: 'Procurement Team',
        dateRiskTreatmentDue: '2024-03-20',
        extendedDueDate: '2024-05-20',
        numberOfExtensions: 2,
        completionDate: '',
        closureApproval: 'Pending',
        closureApprovedBy: ''
      }
    ],
    'RISK-004': [
      {
        riskTreatment: 'Implement enhanced approval workflows and monitoring',
        treatmentJiraTicket: 'TREAT-004',
        riskTreatmentOwner: 'Finance Team',
        dateRiskTreatmentDue: '2024-03-30',
        extendedDueDate: '2024-04-30',
        numberOfExtensions: 1,
        completionDate: '2024-04-25',
        closureApproval: 'Approved',
        closureApprovedBy: 'Finance Director'
      }
    ],
    'RISK-005': [
      {
        riskTreatment: 'Implement multi-factor authentication and access reviews',
        treatmentJiraTicket: 'TREAT-005',
        riskTreatmentOwner: 'HR Team',
        dateRiskTreatmentDue: '2024-04-15',
        extendedDueDate: '2024-05-15',
        numberOfExtensions: 1,
        completionDate: '',
        closureApproval: 'Pending',
        closureApprovedBy: ''
      }
    ],
    'RISK-006': [
      {
        riskTreatment: 'Implement comprehensive backup and disaster recovery procedures',
        treatmentJiraTicket: 'TREAT-006',
        riskTreatmentOwner: 'Operations Team',
        dateRiskTreatmentDue: '2024-05-01',
        extendedDueDate: '2024-06-01',
        numberOfExtensions: 1,
        completionDate: '2024-05-28',
        closureApproval: 'Approved',
        closureApprovedBy: 'Operations Director'
      },
      {
        riskTreatment: 'Conduct disaster recovery testing and training',
        treatmentJiraTicket: 'TREAT-006A',
        riskTreatmentOwner: 'Operations Team',
        dateRiskTreatmentDue: '2024-06-15',
        extendedDueDate: '2024-07-15',
        numberOfExtensions: 1,
        completionDate: '',
        closureApproval: 'Pending',
        closureApprovedBy: ''
      }
    ],
    'RISK-007': [
      {
        riskTreatment: 'Implement enhanced legal review and compliance monitoring processes',
        treatmentJiraTicket: 'TREAT-007',
        riskTreatmentOwner: 'Legal Team',
        dateRiskTreatmentDue: '2024-05-10',
        extendedDueDate: '2024-06-10',
        numberOfExtensions: 1,
        completionDate: '',
        closureApproval: 'Pending',
        closureApprovedBy: ''
      }
    ],
    'RISK-008': [
      {
        riskTreatment: 'Implement enhanced customer consent management and data protection',
        treatmentJiraTicket: 'TREAT-008',
        riskTreatmentOwner: 'Marketing Team',
        dateRiskTreatmentDue: '2024-05-20',
        extendedDueDate: '2024-06-20',
        numberOfExtensions: 1,
        completionDate: '',
        closureApproval: 'Pending',
        closureApprovedBy: ''
      }
    ]
  }
  return treatments[riskId as keyof typeof treatments] || []
}

export default function RiskTreatments() {
  const params = useParams()
  const router = useRouter()
  const riskId = params.riskId as string
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [riskDetails, setRiskDetails] = useState<any>(null)
  const [treatments, setTreatments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch risk details and treatments from MongoDB
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch risk details
        const riskResponse = await fetch(`/api/risks/${riskId}`)
        const riskResult = await riskResponse.json()
        
        if (!riskResult.success) {
          setError('Risk not found')
          setLoading(false)
          return
        }
        
        setRiskDetails(riskResult.data)
        
        // Fetch treatments for this risk
        const treatmentsResponse = await fetch(`/api/treatments/${riskId}`)
        const treatmentsResult = await treatmentsResponse.json()
        
        if (treatmentsResult.success) {
          setTreatments(treatmentsResult.data)
        }
        
      } catch (err) {
        setError('Failed to fetch risk details')
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [riskId])



  const handleRowClick = (row: any) => {
    // TODO: Navigate to treatment detail page
  }

  const handleExportCSV = (selectedRows: Set<number>) => {
    // TODO: Implement CSV export
  }

  const getStatusColor = (status: string) => {
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

  const getRiskRatingColor = (rating: string) => {
    switch (rating.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCIAImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const columns: Column[] = [
    { key: 'riskTreatment', label: 'Risk Treatment', sortable: true },
    { key: 'treatmentJiraTicket', label: 'Treatment Jira Ticket', sortable: true },
    { key: 'riskTreatmentOwner', label: 'Risk Treatment Owner', sortable: true },
    { key: 'dateRiskTreatmentDue', label: 'Date Risk Treatment Due', sortable: true },
    { key: 'extendedDueDate', label: 'Extended Due Date', sortable: true },
    { key: 'numberOfExtensions', label: 'Number of Extensions', sortable: true },
    { key: 'completionDate', label: 'Completion Date', sortable: true },
    { key: 'closureApproval', label: 'Closure Approval', sortable: true },
    { key: 'closureApprovedBy', label: 'Closure Approved by', sortable: true },
  ].map(col => ({
    ...col,
    render: (value: any, row: any) => {
      if (col.key === 'treatmentJiraTicket') {
        return (
          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
            {value}
          </span>
        )
      }
      if (col.key === 'numberOfExtensions') {
        return (
          <span className="font-medium text-blue-600">
            {value}
          </span>
        )
      }
      if (col.key === 'closureApproval') {
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
            {value}
          </span>
        )
      }
      if (col.key === 'dateRiskTreatmentDue' || col.key === 'extendedDueDate' || col.key === 'completionDate') {
        if (!value) return <span className="text-gray-400">-</span>
        return <span>{value}</span>
      }
      // Implement tooltip rendering for all content
      const cellValue = value ? String(value) : '-'
      return (
        <div className="relative group">
          <span className="truncate block max-w-full">
            {cellValue}
          </span>
          <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 max-w-xs break-words">
            {cellValue}
            <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )
    }
  }))

  // Loading State
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#898AC4' }}></div>
            <p className="mt-4" style={{ color: '#22223B' }}>Loading risk details...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error State
  if (error || !riskDetails) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Icon name="exclamation-triangle" size={48} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error ? 'Error Loading Risk' : 'Risk Not Found'}
          </h2>
          <p className="text-gray-600">
            {error || `The risk with ID "${riskId}" could not be found.`}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Risk Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/risk-management/register')}
              className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 hover:bg-gray-200 bg-white border border-gray-300"
              title="Back to Register"
            >
              <Icon name="arrow-left" size={16} />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Risk Treatments - {riskDetails.riskId}
              </h1>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button 
              className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-white rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{ 
                backgroundColor: '#4C1D95',
                '--tw-ring-color': '#4C1D95'
              } as React.CSSProperties}
            >
              <Icon name="plus" size={16} className="mr-2" />
              <span className="hidden sm:inline">New Treatment</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </div>

        {/* Risk Information Grid */}
        <div className="space-y-4">
          {/* Risk Statement - Prominent Display */}
          <div className="bg-gray-50 rounded-lg p-4 border-l-4" style={{ borderLeftColor: '#4C1D95' }}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Risk Statement</label>
            <p className="text-gray-900 leading-relaxed">{riskDetails.riskStatement}</p>
          </div>

          {/* Two Cards Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Card - Risk Assessment */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Risk Assessment</h3>
              <div className="space-y-4">
                {/* Risk Rating with Hover */}
                <div className="relative group">
                  <span className="text-xs text-gray-500">Risk Rating</span>
                  <div className="mt-1">
                    <span className={`inline-flex px-2 py-1 rounded text-xs font-medium cursor-help ${getRiskRatingColor(riskDetails.riskRating)}`}>
                      {riskDetails.riskRating}
                    </span>
                  </div>
                  {/* Hover Tooltip */}
                  <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10">
                    <div className="text-white text-xs rounded-lg p-3 shadow-lg" style={{ backgroundColor: '#4C1D95' }}>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>Consequence:</span>
                          <span className={`ml-2 px-1 py-0.5 rounded text-xs ${getRiskRatingColor(riskDetails.consequenceRating)}`}>
                            {riskDetails.consequenceRating}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Likelihood:</span>
                          <span className={`ml-2 px-1 py-0.5 rounded text-xs ${getRiskRatingColor(riskDetails.likelihoodRating)}`}>
                            {riskDetails.likelihoodRating}
                          </span>
                        </div>
                      </div>
                      <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent" style={{ borderTopColor: '#4C1D95' }}></div>
                    </div>
                  </div>
                </div>

                {/* Impact CIA */}
                <div>
                  <span className="text-xs text-gray-500">Impact (CIA)</span>
                  <div className="mt-1 flex space-x-3">
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-gray-500">C:</span>
                      <span className={`inline-flex px-1 py-0.5 rounded text-xs font-medium ${getCIAImpactColor(riskDetails.impact.confidentiality)}`}>
                        {riskDetails.impact.confidentiality}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-gray-500">I:</span>
                      <span className={`inline-flex px-1 py-0.5 rounded text-xs font-medium ${getCIAImpactColor(riskDetails.impact.integrity)}`}>
                        {riskDetails.impact.integrity}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-gray-500">A:</span>
                      <span className={`inline-flex px-1 py-0.5 rounded text-xs font-medium ${getCIAImpactColor(riskDetails.impact.availability)}`}>
                        {riskDetails.impact.availability}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Threat */}
                <div>
                  <span className="text-xs text-gray-500">Threat</span>
                  <p className="text-sm text-gray-900 mt-1">{riskDetails.threat}</p>
                </div>

                {/* Vulnerability */}
                <div>
                  <span className="text-xs text-gray-500">Vulnerability</span>
                  <p className="text-sm text-gray-900 mt-1">{riskDetails.vulnerability}</p>
                </div>
              </div>
            </div>

            {/* Right Card - Ownership & Asset */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Ownership & Asset</h3>
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-gray-500">Risk Owner</span>
                  <p className="text-sm text-gray-900 mt-1">{riskDetails.riskOwner}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Functional Unit</span>
                  <p className="text-sm text-gray-900 mt-1">{riskDetails.functionalUnit}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Information Asset</span>
                  <p className="text-sm text-gray-900 mt-1">{riskDetails.informationAsset}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Treatments Data Table */}
      <DataTable
        columns={columns}
        data={treatments}
        title={`Treatments for ${riskDetails.riskId}`}
        searchPlaceholder="Search treatments..."
        onRowClick={handleRowClick}
        selectable={true}
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        onExportCSV={handleExportCSV}
      />
    </div>
  )
} 