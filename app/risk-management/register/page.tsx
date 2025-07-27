'use client'

import { useState } from 'react'
import DataTable, { Column } from '../../components/DataTable'
import Icon from '../../components/Icon'

// Risk management phases
const RISK_PHASES = [
  { id: 'identification', name: 'Identification', icon: 'search' },
  { id: 'analysis', name: 'Analysis', icon: 'chart-line' },
  { id: 'evaluation', name: 'Evaluation', icon: 'scale' },
  { id: 'treatment', name: 'Treatment', icon: 'shield-check' },
  { id: 'monitoring', name: 'Monitoring', icon: 'eye' },
]

// Sample risk data for each phase
const sampleRisks = {
  identification: [
    {
      id: 'RISK-001',
      title: 'Data Breach Risk',
      description: 'Risk of unauthorized access to sensitive customer data',
      category: 'Information Security',
      owner: 'IT Security Team',
      status: 'Identified',
      dateIdentified: '2024-01-15',
      priority: 'High',
    },
    {
      id: 'RISK-002',
      title: 'Third-party Vendor Risk',
      description: 'Risk associated with third-party vendors accessing company systems',
      category: 'Vendor Management',
      owner: 'Procurement Team',
      status: 'Identified',
      dateIdentified: '2024-01-20',
      priority: 'Medium',
    },
    {
      id: 'RISK-003',
      title: 'Business Continuity Risk',
      description: 'Risk of business disruption due to system failures',
      category: 'Business Continuity',
      owner: 'Operations Team',
      status: 'Identified',
      dateIdentified: '2024-01-25',
      priority: 'High',
    },
  ],
  analysis: [
    {
      id: 'RISK-001',
      title: 'Data Breach Risk',
      description: 'Risk of unauthorized access to sensitive customer data',
      category: 'Information Security',
      owner: 'IT Security Team',
      status: 'Under Analysis',
      likelihood: 'Medium',
      impact: 'High',
      riskScore: '15',
      dateAnalyzed: '2024-01-30',
    },
    {
      id: 'RISK-004',
      title: 'Regulatory Compliance Risk',
      description: 'Risk of non-compliance with industry regulations',
      category: 'Compliance',
      owner: 'Legal Team',
      status: 'Under Analysis',
      likelihood: 'Low',
      impact: 'High',
      riskScore: '10',
      dateAnalyzed: '2024-02-05',
    },
  ],
  evaluation: [
    {
      id: 'RISK-001',
      title: 'Data Breach Risk',
      description: 'Risk of unauthorized access to sensitive customer data',
      category: 'Information Security',
      owner: 'IT Security Team',
      status: 'Evaluated',
      riskLevel: 'High',
      riskScore: '15',
      acceptableRisk: 'No',
      dateEvaluated: '2024-02-10',
    },
    {
      id: 'RISK-005',
      title: 'Cloud Security Risk',
      description: 'Risk of data exposure in cloud environments',
      category: 'Cloud Security',
      owner: 'Cloud Team',
      status: 'Evaluated',
      riskLevel: 'Medium',
      riskScore: '12',
      acceptableRisk: 'Yes',
      dateEvaluated: '2024-02-15',
    },
  ],
  treatment: [
    {
      id: 'RISK-001',
      title: 'Data Breach Risk',
      description: 'Risk of unauthorized access to sensitive customer data',
      category: 'Information Security',
      owner: 'IT Security Team',
      status: 'Treatment Planned',
      treatmentStrategy: 'Mitigate',
      treatmentActions: 'Implement encryption, access controls',
      targetDate: '2024-03-15',
      budget: '$50,000',
    },
    {
      id: 'RISK-006',
      title: 'Employee Security Risk',
      description: 'Risk of insider threats and employee security awareness',
      category: 'Human Resources',
      owner: 'HR Team',
      status: 'Treatment In Progress',
      treatmentStrategy: 'Transfer',
      treatmentActions: 'Security training, background checks',
      targetDate: '2024-02-28',
      budget: '$25,000',
    },
  ],
  monitoring: [
    {
      id: 'RISK-001',
      title: 'Data Breach Risk',
      description: 'Risk of unauthorized access to sensitive customer data',
      category: 'Information Security',
      owner: 'IT Security Team',
      status: 'Monitored',
      lastReview: '2024-02-20',
      nextReview: '2024-03-20',
      effectiveness: 'Effective',
      residualRisk: 'Low',
    },
    {
      id: 'RISK-007',
      title: 'Network Security Risk',
      description: 'Risk of network infrastructure vulnerabilities',
      category: 'Network Security',
      owner: 'Network Team',
      status: 'Monitored',
      lastReview: '2024-02-18',
      nextReview: '2024-03-18',
      effectiveness: 'Partially Effective',
      residualRisk: 'Medium',
    },
  ],
}

// Column definitions for each phase
const getColumnsForPhase = (phase: string): Column[] => {
  const baseColumns: Column[] = [
    { key: 'id', label: 'Risk ID', sortable: true, width: '120px' },
    { key: 'title', label: 'Risk Title', sortable: true },
    { key: 'description', label: 'Description', sortable: false },
    { key: 'category', label: 'Category', sortable: true, width: '150px' },
    { key: 'owner', label: 'Owner', sortable: true, width: '150px' },
    { key: 'status', label: 'Status', sortable: true, width: '120px' },
  ]

  switch (phase) {
    case 'identification':
      return [
        ...baseColumns,
        { key: 'dateIdentified', label: 'Date Identified', sortable: true, width: '140px' },
        { key: 'priority', label: 'Priority', sortable: true, width: '100px' },
      ]
    case 'analysis':
      return [
        ...baseColumns,
        { key: 'likelihood', label: 'Likelihood', sortable: true, width: '100px' },
        { key: 'impact', label: 'Impact', sortable: true, width: '100px' },
        { key: 'riskScore', label: 'Risk Score', sortable: true, width: '100px' },
        { key: 'dateAnalyzed', label: 'Date Analyzed', sortable: true, width: '140px' },
      ]
    case 'evaluation':
      return [
        ...baseColumns,
        { key: 'riskLevel', label: 'Risk Level', sortable: true, width: '100px' },
        { key: 'riskScore', label: 'Risk Score', sortable: true, width: '100px' },
        { key: 'acceptableRisk', label: 'Acceptable Risk', sortable: true, width: '130px' },
        { key: 'dateEvaluated', label: 'Date Evaluated', sortable: true, width: '140px' },
      ]
    case 'treatment':
      return [
        ...baseColumns,
        { key: 'treatmentStrategy', label: 'Strategy', sortable: true, width: '100px' },
        { key: 'treatmentActions', label: 'Actions', sortable: false },
        { key: 'targetDate', label: 'Target Date', sortable: true, width: '120px' },
        { key: 'budget', label: 'Budget', sortable: true, width: '100px' },
      ]
    case 'monitoring':
      return [
        ...baseColumns,
        { key: 'lastReview', label: 'Last Review', sortable: true, width: '120px' },
        { key: 'nextReview', label: 'Next Review', sortable: true, width: '120px' },
        { key: 'effectiveness', label: 'Effectiveness', sortable: true, width: '120px' },
        { key: 'residualRisk', label: 'Residual Risk', sortable: true, width: '120px' },
      ]
    default:
      return baseColumns
  }
}

export default function RiskRegister() {
  const [activePhase, setActivePhase] = useState('identification')
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())

  const handleRowClick = (row: any) => {
    console.log('Risk clicked:', row)
    // TODO: Implement risk detail view
  }

  const handleExportCSV = (selectedRows: Set<number>) => {
    console.log('Exporting selected risks:', selectedRows)
    // TODO: Implement CSV export
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'identified':
        return 'bg-blue-100 text-blue-800'
      case 'under analysis':
        return 'bg-yellow-100 text-yellow-800'
      case 'evaluated':
        return 'bg-purple-100 text-purple-800'
      case 'treatment planned':
        return 'bg-orange-100 text-orange-800'
      case 'treatment in progress':
        return 'bg-indigo-100 text-indigo-800'
      case 'monitored':
        return 'bg-green-100 text-green-800'
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

  const getRiskLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
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

  const columns = getColumnsForPhase(activePhase).map(col => ({
    ...col,
    render: (value: any, row: any) => {
      if (col.key === 'status') {
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
            {value}
          </span>
        )
      }
      if (col.key === 'priority') {
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(value)}`}>
            {value}
          </span>
        )
      }
      if (col.key === 'riskLevel') {
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(value)}`}>
            {value}
          </span>
        )
      }
      if (col.key === 'riskScore') {
        return (
          <span className="font-medium text-gray-900">
            {value}
          </span>
        )
      }
      return undefined
    }
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Risk Register</h1>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <button className="px-3 py-2 md:px-4 md:py-2 rounded-lg transition-colors text-sm md:text-base" style={{ backgroundColor: '#C0C9EE', color: '#898AC4' }}>
            Export Report
          </button>
          <button className="px-3 py-2 md:px-4 md:py-2 text-white rounded-lg transition-colors text-sm md:text-base" style={{ backgroundColor: '#898AC4' }}>
            + New Risk
          </button>
        </div>
      </div>

             {/* Phase Tabs */}
       <div className="border-b border-gray-200">
         <nav className="-mb-px flex space-x-8">
           {RISK_PHASES.map((phase) => (
             <button
               key={phase.id}
               onClick={() => setActivePhase(phase.id)}
               className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                 activePhase === phase.id
                   ? 'border-blue-500 text-blue-600'
                   : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
               }`}
             >
               {phase.name}
             </button>
           ))}
         </nav>
       </div>

             {/* Phase Description */}
       <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
         <div className="flex items-start space-x-3">
           <Icon 
             name={
               activePhase === 'identification' ? 'binoculars' :
               activePhase === 'analysis' ? 'magnifying-glass-chart' :
               activePhase === 'evaluation' ? 'ruler' :
               activePhase === 'treatment' ? 'bandage' :
               activePhase === 'monitoring' ? 'file-waveform' :
               'info-circle'
             } 
             size={20} 
             className="text-blue-600 mt-0.5" 
           />
           <div>
             <h3 className="text-sm font-medium text-blue-900">
               {RISK_PHASES.find(p => p.id === activePhase)?.name} Phase
             </h3>
             <p className="text-sm text-blue-700 mt-1">
               {activePhase === 'identification' && 'Identify and document potential risks to the organization.'}
               {activePhase === 'analysis' && 'Analyze the likelihood and impact of identified risks.'}
               {activePhase === 'evaluation' && 'Evaluate risks against criteria and determine acceptability.'}
               {activePhase === 'treatment' && 'Develop and implement risk treatment strategies.'}
               {activePhase === 'monitoring' && 'Monitor the effectiveness of risk treatments and residual risks.'}
             </p>
           </div>
         </div>
       </div>

      {/* Risk Data Table */}
      <DataTable
        columns={columns}
        data={sampleRisks[activePhase as keyof typeof sampleRisks] || []}
        title={`${RISK_PHASES.find(p => p.id === activePhase)?.name} Risks`}
        searchPlaceholder="Search risks..."
        onRowClick={handleRowClick}
        selectable={true}
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        onExportCSV={handleExportCSV}
      />

      
    </div>
  )
} 