'use client'

import { useState } from 'react'
import DataTable, { Column } from '../../../components/DataTable'
import Icon from '../../../components/Icon'

// Sample data for CIA Assessments
const sampleData = [
  {
    asset: 'Customer Database',
    confidentiality: 'High',
    integrity: 'High',
    availability: 'High',
    lastAssessment: '2024-01-15',
    nextAssessment: '2024-04-15',
    assessor: 'Sarah Johnson',
    status: 'Current',
    notes: 'All controls implemented and effective'
  },
  {
    asset: 'Employee Records',
    confidentiality: 'High',
    integrity: 'Medium',
    availability: 'Medium',
    lastAssessment: '2024-01-10',
    nextAssessment: '2024-04-10',
    assessor: 'David Brown',
    status: 'Current',
    notes: 'Integrity controls need review'
  },
  {
    asset: 'Financial Reports',
    confidentiality: 'Medium',
    integrity: 'High',
    availability: 'Medium',
    lastAssessment: '2024-01-20',
    nextAssessment: '2024-04-20',
    assessor: 'Emily Wilson',
    status: 'Current',
    notes: 'Compliance requirements met'
  },
  {
    asset: 'Source Code Repository',
    confidentiality: 'Medium',
    integrity: 'High',
    availability: 'High',
    lastAssessment: '2024-01-05',
    nextAssessment: '2024-04-05',
    assessor: 'Carlos Martinez',
    status: 'Current',
    notes: 'Access controls reviewed and updated'
  },
  {
    asset: 'Network Infrastructure',
    confidentiality: 'Low',
    integrity: 'High',
    availability: 'Critical',
    lastAssessment: '2024-01-12',
    nextAssessment: '2024-04-12',
    assessor: 'Amanda White',
    status: 'Current',
    notes: 'Redundancy measures in place'
  },
  {
    asset: 'API Keys',
    confidentiality: 'High',
    integrity: 'High',
    availability: 'Medium',
    lastAssessment: '2024-01-08',
    nextAssessment: '2024-04-08',
    assessor: 'Daniel Kim',
    status: 'Current',
    notes: 'Key rotation schedule maintained'
  },
  {
    asset: 'Backup Systems',
    confidentiality: 'Medium',
    integrity: 'High',
    availability: 'High',
    lastAssessment: '2024-01-18',
    nextAssessment: '2024-04-18',
    assessor: 'Grace Taylor',
    status: 'Current',
    notes: 'Backup testing completed successfully'
  },
  {
    asset: 'Email System',
    confidentiality: 'Medium',
    integrity: 'Medium',
    availability: 'High',
    lastAssessment: '2024-01-25',
    nextAssessment: '2024-04-25',
    assessor: 'Paul Anderson',
    status: 'Current',
    notes: 'Email security controls verified'
  },
  {
    asset: 'Customer Support Tickets',
    confidentiality: 'Medium',
    integrity: 'Medium',
    availability: 'Medium',
    lastAssessment: '2024-01-30',
    nextAssessment: '2024-04-30',
    assessor: 'Victoria Moore',
    status: 'Current',
    notes: 'Data retention policies reviewed'
  },
  {
    asset: 'Marketing Campaign Data',
    confidentiality: 'Low',
    integrity: 'Medium',
    availability: 'Medium',
    lastAssessment: '2024-01-22',
    nextAssessment: '2024-04-22',
    assessor: 'Christopher Lee',
    status: 'Current',
    notes: 'Public data handling procedures updated'
  }
]

// Define table columns
const columns: Column[] = [
  {
    key: 'asset',
    label: 'Asset',
    sortable: true,
    width: '200px'
  },
  {
    key: 'confidentiality',
    label: 'Confidentiality',
    sortable: true,
    width: '120px',
    render: (value) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        value === 'High' ? 'bg-red-100 text-red-800' :
        value === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
        'bg-green-100 text-green-800'
      }`}>
        {value}
      </span>
    )
  },
  {
    key: 'integrity',
    label: 'Integrity',
    sortable: true,
    width: '100px',
    render: (value) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        value === 'High' ? 'bg-green-100 text-green-800' :
        value === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
        'bg-red-100 text-red-800'
      }`}>
        {value}
      </span>
    )
  },
  {
    key: 'availability',
    label: 'Availability',
    sortable: true,
    width: '120px',
    render: (value) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        value === 'High' || value === 'Critical' ? 'bg-green-100 text-green-800' :
        value === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
        'bg-red-100 text-red-800'
      }`}>
        {value}
      </span>
    )
  },
  {
    key: 'lastAssessment',
    label: 'Last Assessment',
    sortable: true,
    width: '140px'
  },
  {
    key: 'nextAssessment',
    label: 'Next Assessment',
    sortable: true,
    width: '140px'
  },
  {
    key: 'assessor',
    label: 'Assessor',
    sortable: true,
    width: '120px'
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    width: '100px',
    render: (value) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        value === 'Current' ? 'bg-green-100 text-green-800' :
        value === 'Overdue' ? 'bg-red-100 text-red-800' :
        'bg-yellow-100 text-yellow-800'
      }`}>
        {value}
      </span>
    )
  },
  {
    key: 'notes',
    label: 'Notes',
    sortable: false,
    width: '200px'
  }
]

export default function CIAAssessmentsPage() {
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())

  const handleRowClick = (row: any) => {
    // Handle row click - could open a modal or navigate to detail page
    console.log('Clicked row:', row)
  }

  const handleNewAssessment = () => {
    // Handle adding new assessment
    console.log('Add new assessment')
  }

  const handleExportCSV = (selectedRows: Set<number>) => {
    // Handle CSV export functionality
    console.log('Export CSV for rows:', Array.from(selectedRows))
  }

  const handleSelectionChange = (newSelectedRows: Set<number>) => {
    setSelectedRows(newSelectedRows)
    console.log('Selected rows:', Array.from(newSelectedRows))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#22223B' }}>
            CIA Assessments
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <button 
            onClick={handleNewAssessment}
            className="px-3 py-2 md:px-4 md:py-2 text-white rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm md:text-base"
            style={{ backgroundColor: '#898AC4' }}
          >
            <Icon name="add" size={16} />
            <span>New Assessment</span>
          </button>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={sampleData}
        searchPlaceholder="Search assessments..."
        onRowClick={handleRowClick}
        selectable={true}
        selectedRows={selectedRows}
        onSelectionChange={handleSelectionChange}
        onExportCSV={handleExportCSV}
        actions={
          <div className="flex items-center space-x-2">
            <button 
              className="flex items-center justify-center px-3 py-1 md:px-4 md:py-2 rounded-lg transition-all duration-200 hover:scale-105 text-xs md:text-sm font-medium"
              style={{ backgroundColor: '#FFF2E0', color: '#22223B' }}
              title="Filter"
            >
              Filter
            </button>
            <button 
              className="flex items-center justify-center px-3 py-1 md:px-4 md:py-2 rounded-lg transition-all duration-200 hover:scale-105 text-xs md:text-sm font-medium"
              style={{ backgroundColor: '#FFF2E0', color: '#22223B' }}
              title="Columns"
            >
              Columns
            </button>
          </div>
        }
      />
    </div>
  )
} 