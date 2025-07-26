'use client'

import { useState } from 'react'
import DataTable, { Column } from '../../../components/DataTable'
import Icon from '../../../components/Icon'

// Sample data for Information Assets
const sampleData = [
  {
    informationAsset: 'Customer Database',
    description: 'Primary customer information and transaction history',
    category: 'Customer Data',
    type: 'Database',
    location: 'AWS RDS',
    owner: 'John Smith',
    sme: 'Sarah Johnson',
    administrator: 'Mike Chen',
    agileReleaseTrain: 'ART-1',
    confidentiality: 'High',
    integrity: 'High',
    availability: 'High',
    additionalInformation: 'Contains PII, requires encryption'
  },
  {
    informationAsset: 'Employee Records',
    description: 'HR employee data and performance records',
    category: 'HR Data',
    type: 'Database',
    location: 'On-Premise SQL Server',
    owner: 'Lisa Wang',
    sme: 'David Brown',
    administrator: 'Alex Rodriguez',
    agileReleaseTrain: 'ART-2',
    confidentiality: 'High',
    integrity: 'Medium',
    availability: 'Medium',
    additionalInformation: 'Contains sensitive HR information'
  },
  {
    informationAsset: 'Financial Reports',
    description: 'Quarterly and annual financial statements',
    category: 'Financial Data',
    type: 'Documents',
    location: 'SharePoint Online',
    owner: 'Robert Davis',
    sme: 'Emily Wilson',
    administrator: 'Tom Anderson',
    agileReleaseTrain: 'ART-3',
    confidentiality: 'Medium',
    integrity: 'High',
    availability: 'Medium',
    additionalInformation: 'Regulatory compliance required'
  },
  {
    informationAsset: 'Source Code Repository',
    description: 'Application source code and version control',
    category: 'Intellectual Property',
    type: 'Code Repository',
    location: 'GitHub Enterprise',
    owner: 'Jennifer Lee',
    sme: 'Carlos Martinez',
    administrator: 'Rachel Green',
    agileReleaseTrain: 'ART-1',
    confidentiality: 'Medium',
    integrity: 'High',
    availability: 'High',
    additionalInformation: 'Contains proprietary algorithms'
  },
  {
    informationAsset: 'Network Infrastructure',
    description: 'Network devices and configuration data',
    category: 'Infrastructure',
    type: 'Network',
    location: 'On-Premise',
    owner: 'Kevin Thompson',
    sme: 'Amanda White',
    administrator: 'Steve Johnson',
    agileReleaseTrain: 'ART-4',
    confidentiality: 'Low',
    integrity: 'High',
    availability: 'Critical',
    additionalInformation: 'Critical for business operations'
  },
  {
    informationAsset: 'API Keys',
    description: 'Third-party service integration keys',
    category: 'Security',
    type: 'Credentials',
    location: 'Azure Key Vault',
    owner: 'Patricia Garcia',
    sme: 'Daniel Kim',
    administrator: 'Maria Lopez',
    agileReleaseTrain: 'ART-2',
    confidentiality: 'High',
    integrity: 'High',
    availability: 'Medium',
    additionalInformation: 'Rotated quarterly'
  },
  {
    informationAsset: 'Backup Systems',
    description: 'Data backup and disaster recovery systems',
    category: 'Infrastructure',
    type: 'Backup',
    location: 'AWS S3',
    owner: 'Frank Miller',
    sme: 'Grace Taylor',
    administrator: 'Henry Wilson',
    agileReleaseTrain: 'ART-4',
    confidentiality: 'Medium',
    integrity: 'High',
    availability: 'High',
    additionalInformation: 'Automated daily backups'
  },
  {
    informationAsset: 'Email System',
    description: 'Corporate email and communication platform',
    category: 'Communication',
    type: 'Email',
    location: 'Microsoft 365',
    owner: 'Nancy Clark',
    sme: 'Paul Anderson',
    administrator: 'Ruth Davis',
    agileReleaseTrain: 'ART-3',
    confidentiality: 'Medium',
    integrity: 'Medium',
    availability: 'High',
    additionalInformation: 'Primary communication tool'
  },
  {
    informationAsset: 'Customer Support Tickets',
    description: 'Customer service and support case data',
    category: 'Customer Data',
    type: 'Application Data',
    location: 'Salesforce',
    owner: 'Timothy Hall',
    sme: 'Victoria Moore',
    administrator: 'James Taylor',
    agileReleaseTrain: 'ART-1',
    confidentiality: 'Medium',
    integrity: 'Medium',
    availability: 'Medium',
    additionalInformation: 'Contains customer feedback'
  },
  {
    informationAsset: 'Marketing Campaign Data',
    description: 'Marketing analytics and campaign performance',
    category: 'Marketing Data',
    type: 'Analytics',
    location: 'Google Analytics',
    owner: 'Samantha Young',
    sme: 'Christopher Lee',
    administrator: 'Nicole Brown',
    agileReleaseTrain: 'ART-2',
    confidentiality: 'Low',
    integrity: 'Medium',
    availability: 'Medium',
    additionalInformation: 'Public marketing data'
  }
]

// Define table columns
const columns: Column[] = [
  {
    key: 'informationAsset',
    label: 'Information Asset',
    sortable: true,
    width: '200px'
  },
  {
    key: 'description',
    label: 'Description',
    sortable: true,
    width: '250px'
  },
  {
    key: 'category',
    label: 'Category',
    sortable: true,
    width: '120px'
  },
  {
    key: 'type',
    label: 'Type',
    sortable: true,
    width: '100px'
  },
  {
    key: 'location',
    label: 'Location',
    sortable: true,
    width: '150px'
  },
  {
    key: 'owner',
    label: 'Owner',
    sortable: true,
    width: '120px'
  },
  {
    key: 'sme',
    label: 'SME',
    sortable: true,
    width: '120px'
  },
  {
    key: 'administrator',
    label: 'Administrator',
    sortable: true,
    width: '120px'
  },
  {
    key: 'agileReleaseTrain',
    label: 'Agile Release Train',
    sortable: true,
    width: '150px'
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
    key: 'additionalInformation',
    label: 'Additional Information',
    sortable: false,
    width: '200px'
  }
]

export default function InformationAssetsPage() {
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())

  const handleRowClick = (row: any) => {
    // Handle row click - could open a modal or navigate to detail page
    console.log('Clicked row:', row)
  }

  const handleAddAsset = () => {
    // Handle adding new asset
    console.log('Add new asset')
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
            Information Assets
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <button 
            onClick={handleAddAsset}
            className="px-3 py-2 md:px-4 md:py-2 text-white rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm md:text-base"
            style={{ backgroundColor: '#898AC4' }}
          >
            <Icon name="add" size={16} />
            <span>Add Asset</span>
          </button>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={sampleData}
        searchPlaceholder="Search assets..."
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