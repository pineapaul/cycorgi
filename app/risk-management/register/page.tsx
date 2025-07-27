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

// Full view tab (not a risk phase)
const FULL_VIEW = { id: 'full-view', name: 'Full View', icon: 'earth-oceania' }

// Sample risk data with all columns
const sampleRisks = [
  {
    riskId: 'RISK-001',
    functionalUnit: 'IT Security',
    status: 'Identified',
    jiraTicket: 'SEC-001',
    dateRiskRaised: '2024-01-15',
    raisedBy: 'John Smith',
    riskOwner: 'IT Security Team',
    affectedSites: 'Head Office, Data Center',
    informationAssets: 'Customer Database, Payment Systems',
    threat: 'Unauthorized Access',
    vulnerability: 'Weak Access Controls',
    riskStatement: 'Risk of unauthorized access to sensitive customer data',
    impactCIA: 'Confidentiality - High, Integrity - Medium, Availability - Low',
    currentControls: 'Basic password authentication',
    currentControlsReference: 'IS-001',
    consequence: 'Data breach, regulatory fines, reputational damage',
    likelihood: 'Medium',
    currentRiskRating: 'High',
    riskAction: 'Requires treatment',
    reasonForAcceptance: '',
    dateOfSSCApproval: '',
    riskTreatments: '',
    dateRiskTreatmentsApproved: '',
    dateRiskTreatmentsAssigned: '',
    applicableControlsAfterTreatment: '',
    residualConsequence: '',
    residualLikelihood: '',
    residualRiskRating: '',
    residualRiskAcceptedByOwner: '',
    dateResidualRiskAccepted: '',
    dateRiskTreatmentCompleted: '',
  },
  {
    riskId: 'RISK-002',
    functionalUnit: 'Procurement',
    status: 'Under Analysis',
    jiraTicket: 'PROC-002',
    dateRiskRaised: '2024-01-20',
    raisedBy: 'Sarah Johnson',
    riskOwner: 'Procurement Team',
    affectedSites: 'All Sites',
    informationAssets: 'Vendor Management System',
    threat: 'Third-party Data Breach',
    vulnerability: 'Insufficient vendor security controls',
    riskStatement: 'Risk associated with third-party vendors accessing company systems',
    impactCIA: 'Confidentiality - High, Integrity - Medium, Availability - Low',
    currentControls: 'Vendor security questionnaire',
    currentControlsReference: 'PROC-001',
    consequence: 'Data exposure, compliance violations',
    likelihood: 'Medium',
    currentRiskRating: 'Medium',
    riskAction: 'Under analysis',
    reasonForAcceptance: '',
    dateOfSSCApproval: '',
    riskTreatments: '',
    dateRiskTreatmentsApproved: '',
    dateRiskTreatmentsAssigned: '',
    applicableControlsAfterTreatment: '',
    residualConsequence: '',
    residualLikelihood: '',
    residualRiskRating: '',
    residualRiskAcceptedByOwner: '',
    dateResidualRiskAccepted: '',
    dateRiskTreatmentCompleted: '',
  },
  {
    riskId: 'RISK-003',
    functionalUnit: 'Operations',
    status: 'Evaluated',
    jiraTicket: 'OPS-003',
    dateRiskRaised: '2024-01-25',
    raisedBy: 'Mike Davis',
    riskOwner: 'Operations Team',
    affectedSites: 'All Sites',
    informationAssets: 'Core Business Systems',
    threat: 'System Failure',
    vulnerability: 'Single point of failure',
    riskStatement: 'Risk of business disruption due to system failures',
    impactCIA: 'Confidentiality - Low, Integrity - Medium, Availability - High',
    currentControls: 'Backup systems',
    currentControlsReference: 'OPS-001',
    consequence: 'Business disruption, revenue loss',
    likelihood: 'Low',
    currentRiskRating: 'Medium',
    riskAction: 'Acceptable risk',
    reasonForAcceptance: 'Cost of treatment exceeds potential loss',
    dateOfSSCApproval: '2024-02-10',
    riskTreatments: '',
    dateRiskTreatmentsApproved: '',
    dateRiskTreatmentsAssigned: '',
    applicableControlsAfterTreatment: '',
    residualConsequence: '',
    residualLikelihood: '',
    residualRiskRating: '',
    residualRiskAcceptedByOwner: '',
    dateResidualRiskAccepted: '',
    dateRiskTreatmentCompleted: '',
  },
  {
    riskId: 'RISK-004',
    functionalUnit: 'Legal',
    status: 'Treatment Planned',
    jiraTicket: 'LEG-004',
    dateRiskRaised: '2024-02-01',
    raisedBy: 'Lisa Chen',
    riskOwner: 'Legal Team',
    affectedSites: 'All Sites',
    informationAssets: 'Compliance Documentation',
    threat: 'Regulatory Non-compliance',
    vulnerability: 'Outdated compliance procedures',
    riskStatement: 'Risk of non-compliance with industry regulations',
    impactCIA: 'Confidentiality - Medium, Integrity - High, Availability - Low',
    currentControls: 'Annual compliance review',
    currentControlsReference: 'LEG-001',
    consequence: 'Regulatory fines, legal action',
    likelihood: 'Medium',
    currentRiskRating: 'High',
    riskAction: 'Requires treatment',
    reasonForAcceptance: '',
    dateOfSSCApproval: '2024-02-15',
    riskTreatments: 'Update compliance procedures, staff training',
    dateRiskTreatmentsApproved: '2024-02-20',
    dateRiskTreatmentsAssigned: '2024-02-25',
    applicableControlsAfterTreatment: 'Enhanced compliance monitoring',
    residualConsequence: 'Reduced regulatory exposure',
    residualLikelihood: 'Low',
    residualRiskRating: 'Low',
    residualRiskAcceptedByOwner: '',
    dateResidualRiskAccepted: '',
    dateRiskTreatmentCompleted: '',
  },
  {
    riskId: 'RISK-005',
    functionalUnit: 'Cloud Team',
    status: 'Monitored',
    jiraTicket: 'CLOUD-005',
    dateRiskRaised: '2024-01-10',
    raisedBy: 'Alex Wong',
    riskOwner: 'Cloud Team',
    affectedSites: 'Cloud Infrastructure',
    informationAssets: 'Cloud Data Storage',
    threat: 'Data Exposure',
    vulnerability: 'Misconfigured cloud security',
    riskStatement: 'Risk of data exposure in cloud environments',
    impactCIA: 'Confidentiality - High, Integrity - Medium, Availability - Low',
    currentControls: 'Cloud security monitoring',
    currentControlsReference: 'CLOUD-001',
    consequence: 'Data breach, compliance violations',
    likelihood: 'Low',
    currentRiskRating: 'Medium',
    riskAction: 'Under monitoring',
    reasonForAcceptance: '',
    dateOfSSCApproval: '2024-01-30',
    riskTreatments: 'Enhanced cloud security controls',
    dateRiskTreatmentsApproved: '2024-02-01',
    dateRiskTreatmentsAssigned: '2024-02-05',
    applicableControlsAfterTreatment: 'Advanced cloud security monitoring',
    residualConsequence: 'Minimal data exposure risk',
    residualLikelihood: 'Very Low',
    residualRiskRating: 'Low',
    residualRiskAcceptedByOwner: 'Alex Wong',
    dateResidualRiskAccepted: '2024-02-15',
    dateRiskTreatmentCompleted: '2024-02-10',
  },
]

// Status mapping for each phase
const getStatusForPhase = (phase: string): string[] => {
  switch (phase) {
    case 'identification':
      return ['Identified']
    case 'analysis':
      return ['Under Analysis']
    case 'evaluation':
      return ['Evaluated']
    case 'treatment':
      return ['Treatment Planned', 'Treatment In Progress']
    case 'monitoring':
      return ['Monitored']
    case 'full-view':
      return [] // No status filter for full view
    default:
      return []
  }
}

// Column definitions for the risk register
const getColumnsForPhase = (phase: string): Column[] => {
  const allColumns: Column[] = [
    { key: 'riskId', label: 'Risk ID', sortable: true, width: '120px' },
    { key: 'functionalUnit', label: 'Functional Unit', sortable: true, width: '150px' },
    { key: 'status', label: 'Status', sortable: true, width: '120px' },
    { key: 'jiraTicket', label: 'Jira Ticket', sortable: true, width: '120px' },
    { key: 'dateRiskRaised', label: 'Date Risk Raised', sortable: true, width: '140px' },
    { key: 'raisedBy', label: 'Raised By', sortable: true, width: '120px' },
    { key: 'riskOwner', label: 'Risk Owner', sortable: true, width: '150px' },
    { key: 'affectedSites', label: 'Affected Sites', sortable: true, width: '150px' },
    { key: 'informationAssets', label: 'Information Assets', sortable: true, width: '200px' },
    { key: 'threat', label: 'Threat', sortable: true, width: '150px' },
    { key: 'vulnerability', label: 'Vulnerability', sortable: true, width: '150px' },
    { key: 'riskStatement', label: 'Risk Statement', sortable: false, width: '300px' },
    { key: 'impactCIA', label: 'Impact (CIA)', sortable: true, width: '200px' },
    { key: 'currentControls', label: 'Current Controls', sortable: true, width: '150px' },
    { key: 'currentControlsReference', label: 'Current Controls Reference', sortable: true, width: '180px' },
    { key: 'consequence', label: 'Consequence', sortable: true, width: '200px' },
    { key: 'likelihood', label: 'Likelihood', sortable: true, width: '100px' },
    { key: 'currentRiskRating', label: 'Current Risk Rating', sortable: true, width: '140px' },
    { key: 'riskAction', label: 'Risk Action', sortable: true, width: '140px' },
    { key: 'reasonForAcceptance', label: 'Reason for Acceptance', sortable: true, width: '200px' },
    { key: 'dateOfSSCApproval', label: 'Date of SSC Approval', sortable: true, width: '160px' },
    { key: 'riskTreatments', label: 'Risk Treatments', sortable: true, width: '200px' },
    { key: 'dateRiskTreatmentsApproved', label: 'Date Risk Treatments Approved', sortable: true, width: '200px' },
    { key: 'dateRiskTreatmentsAssigned', label: 'Date Risk Treatments Assigned', sortable: true, width: '200px' },
    { key: 'applicableControlsAfterTreatment', label: 'Applicable Controls After Treatment', sortable: true, width: '220px' },
    { key: 'residualConsequence', label: 'Residual Consequence', sortable: true, width: '180px' },
    { key: 'residualLikelihood', label: 'Residual Likelihood', sortable: true, width: '140px' },
    { key: 'residualRiskRating', label: 'Residual Risk Rating', sortable: true, width: '160px' },
    { key: 'residualRiskAcceptedByOwner', label: 'Residual Risk Accepted By Owner', sortable: true, width: '200px' },
    { key: 'dateResidualRiskAccepted', label: 'Date Residual Risk Accepted', sortable: true, width: '180px' },
    { key: 'dateRiskTreatmentCompleted', label: 'Date Risk Treatment Completed', sortable: true, width: '200px' },
  ]

  switch (phase) {
    case 'identification':
      return allColumns.filter(col => [
        'riskId',
        'functionalUnit', 
        'status',
        'jiraTicket',
        'dateRiskRaised',
        'raisedBy',
        'riskOwner',
        'affectedSites',
        'informationAssets',
        'threat',
        'vulnerability',
        'riskStatement',
        'impactCIA'
      ].includes(col.key))
    case 'analysis':
      return allColumns.filter(col => [
        'riskId',
        'functionalUnit',
        'status',
        'jiraTicket',
        'informationAssets',
        'riskStatement',
        'currentControls',
        'currentControlsReference',
        'consequence',
        'likelihood',
        'currentRiskRating'
      ].includes(col.key))
    case 'evaluation':
      return allColumns.filter(col => [
        'riskId',
        'functionalUnit',
        'status',
        'jiraTicket',
        'informationAssets',
        'riskStatement',
        'riskAction',
        'reasonForAcceptance',
        'dateOfSSCApproval'
      ].includes(col.key))
    case 'treatment':
      return allColumns.filter(col => [
        'riskId',
        'functionalUnit',
        'status',
        'jiraTicket',
        'informationAssets',
        'riskStatement',
        'riskTreatments',
        'dateRiskTreatmentsApproved',
        'dateRiskTreatmentsAssigned',
        'applicableControlsAfterTreatment',
        'residualConsequence',
        'residualLikelihood',
        'residualRiskRating',
        'residualRiskAcceptedByOwner',
        'dateResidualRiskAccepted'
      ].includes(col.key))
    case 'full-view':
      return allColumns // Show all columns for full view
    default:
      return allColumns
  }
}

export default function RiskRegister() {
  const [activePhase, setActivePhase] = useState('full-view')
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

  // Filter data based on active phase
  const filteredData = activePhase === 'full-view' 
    ? sampleRisks // Show all risks for full view
    : sampleRisks.filter(risk => getStatusForPhase(activePhase).includes(risk.status))

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
      if (col.key === 'currentRiskRating' || col.key === 'residualRiskRating') {
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(value)}`}>
            {value}
          </span>
        )
      }
      if (col.key === 'likelihood' || col.key === 'residualLikelihood') {
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(value)}`}>
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
          <button 
            className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-white rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ 
              backgroundColor: '#4C1D95',
              '--tw-ring-color': '#4C1D95'
            } as React.CSSProperties}
          >
            <Icon name="plus" size={16} className="mr-2" />
            <span className="hidden sm:inline">New Risk</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

             {/* Phase Tabs */}
       <div className="border-b border-gray-200">
         <nav className="-mb-px flex space-x-8">
           <button
             onClick={() => setActivePhase('full-view')}
             className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
               activePhase === 'full-view'
                 ? 'border-blue-500 text-blue-600'
                 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
             }`}
           >
             {FULL_VIEW.name}
           </button>
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
       <div className="rounded-lg p-4" style={{ backgroundColor: '#E8ECF7', borderColor: '#E8ECF7' }}>
         <div className="flex items-start space-x-3">
           <div style={{ color: '#22223B' }}>
                        <Icon 
             name={
               activePhase === 'full-view' ? 'earth-oceania' :
               activePhase === 'identification' ? 'binoculars' :
               activePhase === 'analysis' ? 'magnifying-glass-chart' :
               activePhase === 'evaluation' ? 'ruler' :
               activePhase === 'treatment' ? 'bandage' :
               activePhase === 'monitoring' ? 'file-waveform' :
               'info-circle'
             } 
             size={20} 
             className="mt-0.5" 
           />
           </div>
           <div>
             <h3 className="text-sm font-medium" style={{ color: '#22223B' }}>
               {activePhase === 'full-view' ? FULL_VIEW.name : RISK_PHASES.find(p => p.id === activePhase)?.name + ' Phase'}
             </h3>
             <p className="text-sm mt-1" style={{ color: '#22223B' }}>
               {activePhase === 'identification' && 'Identify and document potential risks to the organization.'}
               {activePhase === 'analysis' && 'Analyze the likelihood and impact of identified risks.'}
               {activePhase === 'evaluation' && 'Evaluate risks against criteria and determine acceptability.'}
               {activePhase === 'treatment' && 'Develop and implement risk treatment strategies.'}
               {activePhase === 'monitoring' && 'Monitor the effectiveness of risk treatments and residual risks.'}
               {activePhase === 'full-view' && 'View all risks across all phases of the risk management lifecycle.'}
             </p>
           </div>
         </div>
       </div>

             {/* Risk Data Table */}
       <DataTable
         columns={columns}
         data={filteredData}
         title={`${activePhase === 'full-view' ? FULL_VIEW.name : RISK_PHASES.find(p => p.id === activePhase)?.name} Risks`}
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