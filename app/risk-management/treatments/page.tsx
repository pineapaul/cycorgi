'use client'

import { useState } from 'react'
import Link from 'next/link'
import DataTable, { Column } from '../../components/DataTable'
import Icon from '../../components/Icon'

// Sample treatment data
const sampleTreatments = [
  {
    riskId: 'RISK-001',
    treatmentJiraTicket: 'TREAT-001',
    riskStatement: 'Risk of unauthorized access to sensitive customer data',
    informationAsset: 'Customer Database, Payment Systems',
    riskTreatment: 'Implement multi-factor authentication and access controls',
    riskTreatmentOwner: 'IT Security Team',
    dueDate: '2024-03-15',
    extendedDueDate: '2024-04-15',
    dateRiskTreatmentsCompleted: '2024-04-10',
    dateOfClosureApproval: '2024-04-12',
    extensions: [
      {
        extendedDueDate: '2024-04-15',
        approver: 'Security Manager',
        dateApproved: '2024-03-10'
      }
    ]
  },
  {
    riskId: 'RISK-002',
    treatmentJiraTicket: 'TREAT-002',
    riskStatement: 'Risk associated with third-party vendors accessing company systems',
    informationAsset: 'Vendor Management System',
    riskTreatment: 'Enhanced vendor security assessments and monitoring',
    riskTreatmentOwner: 'Procurement Team',
    dueDate: '2024-03-20',
    extendedDueDate: '2024-05-20',
    dateRiskTreatmentsCompleted: '',
    dateOfClosureApproval: '',
    extensions: [
      {
        extendedDueDate: '2024-04-20',
        approver: 'Procurement Director',
        dateApproved: '2024-03-15'
      },
      {
        extendedDueDate: '2024-05-20',
        approver: 'Procurement Director',
        dateApproved: '2024-04-15'
      }
    ]
  },
  {
    riskId: 'RISK-004',
    treatmentJiraTicket: 'TREAT-004',
    riskStatement: 'Risk of financial fraud due to inadequate controls',
    informationAsset: 'Financial Systems',
    riskTreatment: 'Implement enhanced approval workflows and monitoring',
    riskTreatmentOwner: 'Finance Team',
    dueDate: '2024-03-30',
    extendedDueDate: '2024-04-30',
    dateRiskTreatmentsCompleted: '2024-04-25',
    dateOfClosureApproval: '2024-04-28',
    extensions: [
      {
        extendedDueDate: '2024-04-30',
        approver: 'Finance Director',
        dateApproved: '2024-03-25'
      }
    ]
  },
  {
    riskId: 'RISK-005',
    treatmentJiraTicket: 'TREAT-005',
    riskStatement: 'Risk of unauthorized access to employee personal data',
    informationAsset: 'HR Systems',
    riskTreatment: 'Implement multi-factor authentication and access reviews',
    riskTreatmentOwner: 'HR Team',
    dueDate: '2024-04-15',
    extendedDueDate: '2024-05-15',
    dateRiskTreatmentsCompleted: '',
    dateOfClosureApproval: '',
    extensions: [
      {
        extendedDueDate: '2024-05-15',
        approver: 'HR Director',
        dateApproved: '2024-04-10'
      }
    ]
  }
]

export default function Treatments() {
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())

  const handleRowClick = (row: any) => {
    console.log('Treatment clicked:', row)
    // TODO: Navigate to specific risk treatments page
    // window.location.href = `/risk-management/treatments/${row.riskId}`
  }

  const handleExportCSV = (selectedRows: Set<number>) => {
    console.log('Exporting selected treatments:', selectedRows)
    // TODO: Implement CSV export
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in progress':
        return 'bg-blue-100 text-blue-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
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
    { key: 'riskId', label: 'Risk ID', sortable: true },
    { key: 'treatmentJiraTicket', label: 'Treatment Jira Ticket', sortable: true },
    { key: 'riskStatement', label: 'Risk Statement', sortable: true },
    { key: 'informationAsset', label: 'Information Asset', sortable: true },
    { key: 'riskTreatment', label: 'Risk Treatment', sortable: true },
    { key: 'riskTreatmentOwner', label: 'Risk Treatment Owner', sortable: true },
    { key: 'dueDate', label: 'Due Date', sortable: true },
    { key: 'extendedDueDate', label: 'Extended Due Date', sortable: true },
    { key: 'dateRiskTreatmentsCompleted', label: 'Date Risk Treatments Completed', sortable: true },
    { key: 'dateOfClosureApproval', label: 'Date of Closure Approval', sortable: true },
  ].map(col => ({
    ...col,
    render: (value: any, row: any) => {
      if (col.key === 'riskId') {
        return (
          <button
            onClick={(e) => {
              e.stopPropagation()
              // TODO: Navigate to specific risk treatments page
              console.log('Navigate to risk treatments for:', value)
            }}
            className="text-blue-600 hover:text-blue-800 underline font-medium"
          >
            {value}
          </button>
        )
      }
      if (col.key === 'treatmentJiraTicket') {
        return (
          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
            {value}
          </span>
        )
      }
      if (col.key === 'dueDate' || col.key === 'extendedDueDate' || col.key === 'dateRiskTreatmentsCompleted' || col.key === 'dateOfClosureApproval') {
        if (!value) return <span className="text-gray-400">-</span>
        return <span>{value}</span>
      }
      return undefined
    }
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Risk Management</h1>
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

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <Link
            href="/risk-management/register"
            className="py-2 px-1 border-b-2 font-medium text-sm transition-colors border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          >
            Register
          </Link>
          <Link
            href="/risk-management/treatments"
            className="py-2 px-1 border-b-2 font-medium text-sm transition-colors border-blue-500 text-blue-600"
          >
            Treatments
          </Link>
        </nav>
      </div>

      {/* Treatments Data Table */}
      <DataTable
        columns={columns}
        data={sampleTreatments}
        title="All Risk Treatments"
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