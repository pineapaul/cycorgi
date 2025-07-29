'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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



// Get status values for each phase
const getCurrentPhaseForFilter = (phase: string): string => {
  switch (phase) {
    case 'identification':
      return 'Identification'
    case 'analysis':
      return 'Analysis'
    case 'evaluation':
      return 'Evaluation'
    case 'treatment':
      return 'Treatment'
    case 'monitoring':
      return 'Monitoring'
    default:
      return ''
  }
}

// Get columns for each phase
const getColumnsForPhase = (phase: string): Column[] => {
  const allColumns: Column[] = [
    { key: 'riskId', label: 'Risk ID', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false },
    { key: 'functionalUnit', label: 'Functional Unit', sortable: true },
    { key: 'currentPhase', label: 'Current Phase', sortable: true },
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
    { key: 'dateRiskTreatmentsApproved', label: 'Date Risk Treatments Approved', sortable: true },
    { key: 'residualConsequence', label: 'Residual Consequence', sortable: true },
    { key: 'residualLikelihood', label: 'Residual Likelihood', sortable: true },
    { key: 'residualRiskRating', label: 'Residual Risk Rating', sortable: true },
    { key: 'residualRiskAcceptedByOwner', label: 'Residual Risk Accepted By Owner', sortable: true },
    { key: 'dateResidualRiskAccepted', label: 'Date Residual Risk Accepted', sortable: true },
    { key: 'treatmentCount', label: 'Treatments', sortable: true },
  ]

  switch (phase) {
    case 'identification':
      return allColumns.filter(col => [
        'riskId',
        'actions',
        'functionalUnit',
        'currentPhase',
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
        'actions',
        'functionalUnit',
        'currentPhase',
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
        'actions',
        'functionalUnit',
        'currentPhase',
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
        'actions',
        'functionalUnit',
        'currentPhase',
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
        'actions',
        'functionalUnit',
        'currentPhase',
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
  const router = useRouter()

  const [selectedPhase, setSelectedPhase] = useState<string | null>(null)
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [risks, setRisks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch risks from MongoDB
  useEffect(() => {
    const fetchRisks = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/risks')
        const result = await response.json()
        
        if (result.success) {
          // Transform the data to match the expected format - simplified
          const transformedRisks = result.data.map((risk: any) => {
            // Create a new object with only the properties we need - simplified
            // Map phase values to display names
            const getPhaseDisplayName = (phase: string) => {
              const phaseMap: { [key: string]: string } = {
                'identification': 'Identification',
                'analysis': 'Analysis', 
                'evaluation': 'Evaluation',
                'treatment': 'Treatment',
                'monitoring': 'Monitoring'
              };
              return phaseMap[phase] || phase;
            };

            const transformed = {
              riskId: risk.riskId,
              functionalUnit: risk.functionalUnit,
              currentPhase: getPhaseDisplayName(risk.currentPhase),
              jiraTicket: `RISK-${risk.riskId.split('-')[1]}`,
              dateRiskRaised: risk.createdAt ? new Date(risk.createdAt).toISOString().split('T')[0] : '2024-01-15',
              raisedBy: risk.riskOwner,
              riskOwner: risk.riskOwner, // Add this for the riskOwner column
              affectedSites: 'All Sites',
              informationAssets: risk.informationAsset,
              threat: risk.threat,
              vulnerability: risk.vulnerability,
              riskStatement: risk.riskStatement,
              impactCIA: risk.impact ? `C:${risk.impact.confidentiality} I:${risk.impact.integrity} A:${risk.impact.availability}` : 'Not specified',
              currentControls: risk.currentControls,
              currentControlsReference: `CTRL-${risk.riskId.split('-')[1]}`,
              consequence: risk.consequenceRating,
              likelihood: risk.likelihoodRating,
              currentRiskRating: risk.riskRating,
              riskAction: 'Requires treatment',
              reasonForAcceptance: risk.reasonForAcceptance || '',
              dateOfSSCApproval: risk.dateOfSSCApproval ? new Date(risk.dateOfSSCApproval).toISOString().split('T')[0] : '',
              riskTreatments: '',
              dateRiskTreatmentsApproved: risk.dateRiskTreatmentsApproved ? new Date(risk.dateRiskTreatmentsApproved).toISOString().split('T')[0] : '',
              dateRiskTreatmentsAssigned: '',
              applicableControlsAfterTreatment: '',
              residualConsequence: risk.residualConsequence || '',
              residualLikelihood: risk.residualLikelihood || '',
              residualRiskRating: risk.residualRiskRating || '',
              residualRiskAcceptedByOwner: risk.residualRiskAcceptedByOwner || '',
              dateResidualRiskAccepted: risk.dateResidualRiskAccepted ? new Date(risk.dateResidualRiskAccepted).toISOString().split('T')[0] : '',
              dateRiskTreatmentCompleted: '',
              treatmentCount: 4,
            }
            return transformed
          })
          setRisks(transformedRisks)
        } else {
          setError(result.error || 'Failed to fetch risks')
        }
              } catch (err) {
          if (err instanceof TypeError) {
            setError('Network error: Failed to fetch risks. Please check your connection.')
          } else if (err instanceof SyntaxError) {
            setError('Parsing error: Received malformed data from the server.')
          } else {
            setError('Unexpected error: Failed to fetch risks.')
          }
          console.error('Error fetching risks:', err)
        } finally {
          setLoading(false)
        }
    }

    fetchRisks()
  }, []) // Remove selectedPhase dependency to avoid infinite re-renders



  const handleRowClick = (row: any) => {
    router.push(`/risk-management/risks/${row.riskId}`)
  }

  const handleExportCSV = (selectedRows: Set<number>) => {
    // TODO: Implement CSV export
  }

  const handlePhaseSelect = (phase: string | null) => {
    setSelectedPhase(phase)
  }

  const getStatusColor = (status: string) => {
    if (!status) return 'bg-gray-100 text-gray-800'
    
    switch (status.toLowerCase()) {
      case 'identification':
        return 'bg-blue-100 text-blue-800'
      case 'analysis':
        return 'bg-yellow-100 text-yellow-800'
      case 'evaluation':
        return 'bg-purple-100 text-purple-800'
      case 'treatment':
        return 'bg-orange-100 text-orange-800'
      case 'monitoring':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    if (!priority) return 'bg-gray-100 text-gray-800'
    
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
    if (!level) return 'bg-gray-100 text-gray-800'
    
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
    ? risks.filter(risk => risk.currentPhase === getCurrentPhaseForFilter(selectedPhase))
    : risks // Show all risks when no phase is selected

  const baseColumns = getColumnsForPhase(selectedPhase || 'full-view')
  
  const columns = baseColumns.map(col => ({
    ...col,
    render: (value: any, row: any) => {
      if (col.key === 'riskId') {
        return (
          <Link
            href={`/risk-management/risks/${row.riskId}`}
            className="text-blue-600 hover:text-blue-800 underline font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            {value}
          </Link>
        )
      }
      if (col.key === 'actions') {
        return (
          <div className="flex items-center space-x-2">
            <Link
              href={`/risk-management/risks/${row.riskId}`}
              className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
              onClick={(e) => e.stopPropagation()}
              title="View Risk Details"
            >
              <Icon name="eye" size={12} className="mr-1" />
              View
            </Link>
            <button
              onClick={(e) => {
                e.stopPropagation()
                const url = `${window.location.origin}/risk-management/risks/${row.riskId}`
                navigator.clipboard.writeText(url).then(() => {
                  alert('Link copied to clipboard!')
                })
              }}
              className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 transition-colors"
              title="Copy Link"
            >
              <Icon name="link" size={12} className="mr-1" />
              Copy
            </button>
          </div>
        )
      }
      if (col.key === 'currentPhase') {
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
      if (col.key === 'consequence' || col.key === 'residualConsequence') {
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(value)}`}>
            {value}
          </span>
        )
      }
      if (col.key === 'treatmentCount') {
        if (value === 0) {
          return <span className="text-gray-400">0</span>
        }
        return (
          <button
            onClick={(e) => {
              e.stopPropagation()
              // Navigate to specific risk treatments page
              window.location.href = `/risk-management/treatments/${row.riskId}`
            }}
            className="text-blue-600 hover:text-blue-800 underline font-medium"
          >
            {value}
          </button>
        )
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
            <span className="hidden sm:inline">New Risk</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <Link
            href="/risk-management/register"
            className="py-2 px-1 border-b-2 font-medium text-sm transition-colors border-blue-500 text-blue-600"
          >
            Register
          </Link>
          <Link
            href="/risk-management/treatments"
            className="py-2 px-1 border-b-2 font-medium text-sm transition-colors border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          >
            Treatments
          </Link>
        </nav>
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

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#898AC4' }}></div>
            <p className="mt-4" style={{ color: '#22223B' }}>Loading risks...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <Icon name="warning" size={48} />
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: '#22223B' }}>Error Loading Risks</h3>
          <p className="text-gray-600 mb-4" style={{ color: '#22223B' }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{ backgroundColor: '#898AC4', color: 'white' }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Risk Data Table */}
      {!loading && !error && (
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
      )}
    </div>
  )
} 