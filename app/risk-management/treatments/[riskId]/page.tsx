'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import DataTable, { Column } from '../../../components/DataTable'
import Icon from '../../../components/Icon'

// Sample risk details
const getRiskDetails = (riskId: string) => {
  const riskDetails = {
    'RISK-001': {
      riskId: 'RISK-001',
      functionalUnit: 'IT Security',
      informationAsset: 'Customer Database, Payment Systems',
      riskStatement: 'Risk of unauthorized access to sensitive customer data',
      riskRating: 'High'
    },
    'RISK-002': {
      riskId: 'RISK-002',
      functionalUnit: 'Procurement',
      informationAsset: 'Vendor Management System',
      riskStatement: 'Risk associated with third-party vendors accessing company systems',
      riskRating: 'Medium'
    },
    'RISK-004': {
      riskId: 'RISK-004',
      functionalUnit: 'Finance',
      informationAsset: 'Financial Systems',
      riskStatement: 'Risk of financial fraud due to inadequate controls',
      riskRating: 'High'
    },
    'RISK-005': {
      riskId: 'RISK-005',
      functionalUnit: 'HR',
      informationAsset: 'HR Systems',
      riskStatement: 'Risk of unauthorized access to employee personal data',
      riskRating: 'High'
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
    ]
  }
  return treatments[riskId as keyof typeof treatments] || []
}

export default function RiskTreatments() {
  const params = useParams()
  const riskId = params.riskId as string
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())

  const riskDetails = getRiskDetails(riskId)
  const treatments = getRiskTreatments(riskId)

  const handleRowClick = (row: any) => {
    console.log('Treatment clicked:', row)
    // TODO: Navigate to treatment detail page
  }

  const handleExportCSV = (selectedRows: Set<number>) => {
    console.log('Exporting selected treatments:', selectedRows)
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
      return undefined
    }
  }))

  if (!riskDetails) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Icon name="exclamation-triangle" size={48} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Risk Not Found</h2>
          <p className="text-gray-600">The risk with ID "{riskId}" could not be found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Risk Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Risk Treatments - {riskDetails.riskId}
            </h1>
            <p className="text-gray-600 mt-1">Manage treatments for this specific risk</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Risk ID</label>
            <p className="text-sm text-gray-900 font-mono">{riskDetails.riskId}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Functional Unit</label>
            <p className="text-sm text-gray-900">{riskDetails.functionalUnit}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Risk Rating</label>
            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getRiskRatingColor(riskDetails.riskRating)}`}>
              {riskDetails.riskRating}
            </span>
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Information Asset</label>
            <p className="text-sm text-gray-900">{riskDetails.informationAsset}</p>
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Risk Statement</label>
            <p className="text-sm text-gray-900">{riskDetails.riskStatement}</p>
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