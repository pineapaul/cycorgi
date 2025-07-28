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
    currentControls: 'Backup systems, monitoring',
    currentControlsReference: 'OPS-001',
    consequence: 'Business disruption, revenue loss',
    likelihood: 'Low',
    currentRiskRating: 'Medium',
    riskAction: 'Acceptable risk',
    reasonForAcceptance: 'Risk level within acceptable limits',
    dateOfSSCApproval: '2024-02-01',
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
    functionalUnit: 'Finance',
    status: 'Treatment Planned',
    jiraTicket: 'FIN-004',
    dateRiskRaised: '2024-01-30',
    raisedBy: 'Lisa Chen',
    riskOwner: 'Finance Team',
    affectedSites: 'Head Office',
    informationAssets: 'Financial Systems',
    threat: 'Fraud',
    vulnerability: 'Insufficient segregation of duties',
    riskStatement: 'Risk of financial fraud due to inadequate controls',
    impactCIA: 'Confidentiality - High, Integrity - High, Availability - Medium',
    currentControls: 'Basic approval workflows',
    currentControlsReference: 'FIN-001',
    consequence: 'Financial loss, regulatory penalties',
    likelihood: 'Medium',
    currentRiskRating: 'High',
    riskAction: 'Requires treatment',
    reasonForAcceptance: '',
    dateOfSSCApproval: '',
    riskTreatments: 'Implement enhanced approval workflows and monitoring',
    dateRiskTreatmentsApproved: '2024-02-05',
    dateRiskTreatmentsAssigned: '2024-02-10',
    applicableControlsAfterTreatment: 'Enhanced approval workflows, fraud monitoring',
    residualConsequence: 'Reduced financial loss',
    residualLikelihood: 'Low',
    residualRiskRating: 'Low',
    residualRiskAcceptedByOwner: 'Finance Director',
    dateResidualRiskAccepted: '2024-02-15',
    dateRiskTreatmentCompleted: '',
  },
  {
    riskId: 'RISK-005',
    functionalUnit: 'HR',
    status: 'Treatment In Progress',
    jiraTicket: 'HR-005',
    dateRiskRaised: '2024-02-01',
    raisedBy: 'David Wilson',
    riskOwner: 'HR Team',
    affectedSites: 'All Sites',
    informationAssets: 'HR Systems',
    threat: 'Data Breach',
    vulnerability: 'Weak access controls',
    riskStatement: 'Risk of unauthorized access to employee personal data',
    impactCIA: 'Confidentiality - High, Integrity - Medium, Availability - Low',
    currentControls: 'Basic authentication',
    currentControlsReference: 'HR-001',
    consequence: 'Privacy violations, legal action',
    likelihood: 'Medium',
    currentRiskRating: 'High',
    riskAction: 'Requires treatment',
    reasonForAcceptance: '',
    dateOfSSCApproval: '',
    riskTreatments: 'Implement multi-factor authentication and access reviews',
    dateRiskTreatmentsApproved: '2024-02-10',
    dateRiskTreatmentsAssigned: '2024-02-15',
    applicableControlsAfterTreatment: 'Multi-factor authentication, regular access reviews',
    residualConsequence: 'Reduced privacy risk',
    residualLikelihood: 'Low',
    residualRiskRating: 'Low',
    residualRiskAcceptedByOwner: 'HR Director',
    dateResidualRiskAccepted: '2024-02-20',
    dateRiskTreatmentCompleted: '',
  },
  {
    riskId: 'RISK-006',
    functionalUnit: 'Legal',
    status: 'Monitored',
    jiraTicket: 'LEG-006',
    dateRiskRaised: '2024-02-05',
    raisedBy: 'Emma Thompson',
    riskOwner: 'Legal Team',
    affectedSites: 'All Sites',
    informationAssets: 'Legal Documents',
    threat: 'Regulatory Changes',
    vulnerability: 'Outdated compliance procedures',
    riskStatement: 'Risk of non-compliance with new regulations',
    impactCIA: 'Confidentiality - Medium, Integrity - High, Availability - Low',
    currentControls: 'Regular compliance reviews',
    currentControlsReference: 'LEG-001',
    consequence: 'Regulatory fines, legal action',
    likelihood: 'Low',
    currentRiskRating: 'Medium',
    riskAction: 'Acceptable risk',
    reasonForAcceptance: 'Risk level acceptable with monitoring',
    dateOfSSCApproval: '2024-02-15',
    riskTreatments: 'Enhanced compliance monitoring and training',
    dateRiskTreatmentsApproved: '2024-02-20',
    dateRiskTreatmentsAssigned: '2024-02-25',
    applicableControlsAfterTreatment: 'Enhanced compliance monitoring, regular training',
    residualConsequence: 'Reduced compliance risk',
    residualLikelihood: 'Low',
    residualRiskRating: 'Low',
    residualRiskAcceptedByOwner: 'Legal Director',
    dateResidualRiskAccepted: '2024-03-01',
    dateRiskTreatmentCompleted: '2024-03-15',
  },
]

// Get status values for each phase
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
    default:
      return []
  }
}

// Get columns for each phase
const getColumnsForPhase = (phase: string): Column[] => {
  const allColumns: Column[] = [
    { key: 'riskId', label: 'Risk ID', sortable: true },
    { key: 'functionalUnit', label: 'Functional Unit', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'jiraTicket', label: 'JIRA Ticket', sortable: true },
    { key: 'dateRiskRaised', label: 'Date Risk Raised', sortable: true },
    { key: 'raisedBy', label: 'Raised By', sortable: true },
    { key: 'riskOwner', label: 'Risk Owner', sortable: true },
    { key: 'affectedSites', label: 'Affected Sites', sortable: true },
    { key: 'informationAssets', label: 'Information Assets', sortable: true },
    { key: 'threat', label: 'Threat', sortable: true },
    { key: 'vulnerability', label: 'Vulnerability', sortable: true },
    { key: 'riskStatement', label: 'Risk Statement', sortable: true },
    { key: 'impactCIA', label: 'Impact (CIA)', sortable: true },
    { key: 'currentControls', label: 'Current Controls', sortable: true },
    { key: 'currentControlsReference', label: 'Current Controls Reference', sortable: true },
    { key: 'consequence', label: 'Consequence', sortable: true },
    { key: 'likelihood', label: 'Likelihood', sortable: true },
    { key: 'currentRiskRating', label: 'Current Risk Rating', sortable: true },
    { key: 'riskAction', label: 'Risk Action', sortable: true },
    { key: 'reasonForAcceptance', label: 'Reason for Acceptance', sortable: true },
    { key: 'dateOfSSCApproval', label: 'Date of SSC Approval', sortable: true },
    { key: 'riskTreatments', label: 'Risk Treatments', sortable: true },
    { key: 'dateRiskTreatmentsApproved', label: 'Date Risk Treatments Approved', sortable: true },
    { key: 'dateRiskTreatmentsAssigned', label: 'Date Risk Treatments Assigned', sortable: true },
    { key: 'applicableControlsAfterTreatment', label: 'Applicable Controls After Treatment', sortable: true },
    { key: 'residualConsequence', label: 'Residual Consequence', sortable: true },
    { key: 'residualLikelihood', label: 'Residual Likelihood', sortable: true },
    { key: 'residualRiskRating', label: 'Residual Risk Rating', sortable: true },
    { key: 'residualRiskAcceptedByOwner', label: 'Residual Risk Accepted By Owner', sortable: true },
    { key: 'dateResidualRiskAccepted', label: 'Date Residual Risk Accepted', sortable: true },
    { key: 'dateRiskTreatmentCompleted', label: 'Date Risk Treatment Completed', sortable: true },
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
        'riskStatement'
      ].includes(col.key))
    case 'analysis':
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
        'impactCIA',
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
        'dateRiskRaised',
        'raisedBy',
        'riskOwner',
        'affectedSites',
        'informationAssets',
        'threat',
        'vulnerability',
        'riskStatement',
        'impactCIA',
        'currentControls',
        'currentControlsReference',
        'consequence',
        'likelihood',
        'currentRiskRating',
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
        'dateRiskRaised',
        'raisedBy',
        'riskOwner',
        'affectedSites',
        'informationAssets',
        'threat',
        'vulnerability',
        'riskStatement',
        'impactCIA',
        'currentControls',
        'currentControlsReference',
        'consequence',
        'likelihood',
        'currentRiskRating',
        'riskAction',
        'reasonForAcceptance',
        'dateOfSSCApproval',
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
    case 'monitoring':
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
        'impactCIA',
        'currentControls',
        'currentControlsReference',
        'consequence',
        'likelihood',
        'currentRiskRating',
        'riskAction',
        'reasonForAcceptance',
        'dateOfSSCApproval',
        'riskTreatments',
        'dateRiskTreatmentsApproved',
        'dateRiskTreatmentsAssigned',
        'applicableControlsAfterTreatment',
        'residualConsequence',
        'residualLikelihood',
        'residualRiskRating',
        'residualRiskAcceptedByOwner',
        'dateResidualRiskAccepted',
        'dateRiskTreatmentCompleted'
      ].includes(col.key))
    default:
      return allColumns // Show all columns for full view
  }
}

export default function RiskRegister() {
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null)
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())

  const handleRowClick = (row: any) => {
    console.log('Risk clicked:', row)
    // TODO: Implement risk detail view
  }

  const handleExportCSV = (selectedRows: Set<number>) => {
    console.log('Exporting selected risks:', selectedRows)
    // TODO: Implement CSV export
  }

  const handlePhaseSelect = (phase: string | null) => {
    setSelectedPhase(phase)
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

  // Filter data based on selected phase
  const filteredData = selectedPhase 
    ? sampleRisks.filter(risk => getStatusForPhase(selectedPhase).includes(risk.status))
    : sampleRisks // Show all risks when no phase is selected

  const columns = getColumnsForPhase(selectedPhase || 'full-view').map(col => ({
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

      {/* Phase Description */}
      {selectedPhase && (
        <div className="rounded-lg p-4" style={{ backgroundColor: '#E8ECF7', borderColor: '#E8ECF7' }}>
          <div className="flex items-start space-x-3">
            <div style={{ color: '#22223B' }}>
              <Icon 
                name={
                  selectedPhase === 'identification' ? 'binoculars' :
                  selectedPhase === 'analysis' ? 'magnifying-glass-chart' :
                  selectedPhase === 'evaluation' ? 'ruler' :
                  selectedPhase === 'treatment' ? 'bandage' :
                  selectedPhase === 'monitoring' ? 'file-waveform' :
                  'info-circle'
                } 
                size={20} 
                className="mt-0.5" 
              />
            </div>
            <div>
              <h3 className="text-sm font-medium" style={{ color: '#22223B' }}>
                {RISK_PHASES.find(p => p.id === selectedPhase)?.name} Phase
              </h3>
              <p className="text-sm mt-1" style={{ color: '#22223B' }}>
                {selectedPhase === 'identification' && 'Identify and document potential risks to the organization.'}
                {selectedPhase === 'analysis' && 'Analyze the likelihood and impact of identified risks.'}
                {selectedPhase === 'evaluation' && 'Evaluate risks against criteria and determine acceptability.'}
                {selectedPhase === 'treatment' && 'Develop and implement risk treatment strategies.'}
                {selectedPhase === 'monitoring' && 'Monitor the effectiveness of risk treatments and residual risks.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Risk Data Table */}
      <DataTable
        columns={columns}
        data={filteredData}
        title={`${selectedPhase ? RISK_PHASES.find(p => p.id === selectedPhase)?.name : 'Register'} Risks`}
        searchPlaceholder="Search risks..."
        onRowClick={handleRowClick}
        selectable={true}
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        onExportCSV={handleExportCSV}
        phaseButtons={RISK_PHASES}
        selectedPhase={selectedPhase}
        onPhaseSelect={handlePhaseSelect}
      />
    </div>
  )
} 