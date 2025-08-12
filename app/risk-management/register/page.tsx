'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import DataTable, { Column } from '@/app/components/DataTable'
import Icon from '@/app/components/Icon'
import Tooltip from '@/app/components/Tooltip'
import { getCIAConfig, extractRiskNumber, formatDate, mapAssetIdsToNames } from '@/lib/utils'
import { CIA_DELIMITERS } from '@/lib/constants'
import { useToast } from '@/app/components/Toast'
import WorkshopSelectionModal from '@/app/components/WorkshopSelectionModal'

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

// Custom renderer for CIA values
const renderCIAValues = (value: unknown) => {
  if (!value || value === 'Not specified') {
    return (
      <span className="text-gray-400 text-xs italic">Not specified</span>
    )
  }

  // Use robust parsing with multiple delimiters
  const valueStr = String(value)
  const ciaValues = valueStr
    .split(CIA_DELIMITERS.ALTERNATIVES)
    .map(item => item.trim())
    .filter(item => item.length > 0)

  if (ciaValues.length === 0) {
    return (
      <span className="text-gray-400 text-xs italic">Not specified</span>
    )
  }

  return (
    <div className="flex gap-1.5 overflow-hidden">
      {ciaValues.map((cia, index) => {
        try {
          const config = getCIAConfig(cia)
          if (!config) {
            // Fallback for unknown CIA values
            return (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border bg-gray-50 text-gray-700 border-gray-200 transition-all duration-200 hover:scale-105 flex-shrink-0"
                title={cia}
              >
                {cia.charAt(0).toUpperCase()}
              </span>
            )
          }
          
          return (
            <span
              key={index}
              className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${config.bg} ${config.text} ${config.border} transition-all duration-200 hover:scale-105 flex-shrink-0`}
              title={cia}
            >
              {config.label}
            </span>
          )
        } catch (error) {
          // Fallback for any errors in CIA config
          console.warn(`Error rendering CIA value "${cia}":`, error)
          return (
            <span
              key={index}
              className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border bg-gray-50 text-gray-700 border-gray-200 transition-all duration-200 hover:scale-105 flex-shrink-0"
              title={cia}
            >
              {cia.charAt(0).toUpperCase()}
            </span>
          )
        }
      })}
    </div>
  )
}

// Date column keys for consistent formatting
const DATE_COLUMNS = [
  'dateRiskRaised',
  'dateOfSSCApproval', 
  'dateRiskTreatmentsApproved',
  'dateResidualRiskAccepted',
  'dateRiskTreatmentsAssigned',
  'dateRiskTreatmentCompleted'
]



export default function RiskRegister() {
  const router = useRouter()
  const { showToast } = useToast()

  const [selectedPhase, setSelectedPhase] = useState<string | null>(null)

  const [risks, setRisks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [workshopModalOpen, setWorkshopModalOpen] = useState(false)
  const [selectedRiskForWorkshop, setSelectedRiskForWorkshop] = useState<any>(null)

  // Custom renderer for Information Assets
  const renderInformationAssets = (value: any) => {
    if (!value || value === 'Not specified' || value === '' || value === '-') {
      return (
        <span className="text-gray-400 text-xs italic">Not specified</span>
      )
    }

    let assets: string[] = []

    // Handle different data formats
    if (Array.isArray(value)) {
      // Handle array of objects with id/name or array of strings
      assets = value.map((asset: any) => {
        if (typeof asset === 'object' && asset !== null) {
          // The API returns objects with id and name properties
          if (asset.name) return asset.name
          if (asset.id) return asset.id
          if (asset.title) return asset.title
          if (asset.label) return asset.label
          // If none of the above, try to find any string property
          const stringProps = Object.values(asset).filter(val => typeof val === 'string' && val.trim() !== '')
          if (stringProps.length > 0) return stringProps[0]
          return JSON.stringify(asset)
        }
        return String(asset)
      }).filter(asset => asset && asset !== '[object Object]')
    } else if (typeof value === 'string') {
      // Handle comma-separated string (already mapped by mapAssetIdsToNames)
      assets = value
        .split(/[,;|]/)
        .map(item => item.trim())
        .filter(item => item.length > 0)
    } else {
      // Fallback for other types
      assets = [String(value)]
    }

    if (assets.length === 0) {
      return (
        <span className="text-gray-400 text-xs italic">Not specified</span>
      )
    }

    return (
      <div className="flex flex-wrap gap-1.5 min-w-32 max-w-none">
        {assets.map((asset, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200 transition-all duration-200 hover:scale-105 flex-shrink-0 whitespace-nowrap max-w-full"
            title={asset}
          >
            <span className="truncate">{asset}</span>
          </span>
        ))}
      </div>
    )
  }
  


  // Get columns for each phase
  const getColumnsForPhase = (phase: string): Column[] => {
    const allColumns: Column[] = [
      { key: 'riskId', label: 'Risk ID', sortable: true, width: 'w-24 sm:w-28 md:w-32 lg:w-36' },
      { key: 'actions', label: 'Actions', sortable: false, width: 'w-20 sm:w-24 md:w-28 lg:w-32' },
      { key: 'functionalUnit', label: 'Functional Unit', sortable: true, width: 'w-32 sm:w-36 md:w-40 lg:w-44' },
      { key: 'currentPhase', label: 'Current Phase', sortable: true, width: 'w-28 sm:w-32 md:w-36 lg:w-40' },
      { key: 'jiraTicket', label: 'JIRA Ticket', sortable: true, width: 'w-24 sm:w-28 md:w-32 lg:w-36' },
      { key: 'dateRiskRaised', label: 'Date Risk Raised', sortable: true, width: 'w-24 sm:w-28 md:w-32 lg:w-36' },
      { key: 'raisedBy', label: 'Raised By', sortable: true, width: 'w-28 sm:w-32 md:w-36 lg:w-40' },
      { key: 'riskOwner', label: 'Risk Owner', sortable: true, width: 'w-28 sm:w-32 md:w-36 lg:w-40' },
      { key: 'affectedSites', label: 'Affected Sites', sortable: true, width: 'w-32 sm:w-36 md:w-40 lg:w-44' },
      { key: 'informationAssets', label: 'Information Assets', sortable: true, render: renderInformationAssets, width: 'w-40 sm:w-44 md:w-48 lg:w-52' },
      { key: 'threat', label: 'Threat', sortable: true, width: 'w-36 sm:w-40 md:w-44 lg:w-48' },
      { key: 'vulnerability', label: 'Vulnerability', sortable: true, width: 'w-36 sm:w-40 md:w-44 lg:w-48' },
      { key: 'riskStatement', label: 'Risk Statement', sortable: true, width: 'w-40 sm:w-44 md:w-48 lg:w-52' },
      { key: 'impactCIA', label: 'Impact (CIA)', sortable: true, render: renderCIAValues, width: 'w-28 sm:w-32 md:w-36 lg:w-40' },
      { key: 'currentControls', label: 'Current Controls', sortable: true, width: 'w-36 sm:w-40 md:w-44 lg:w-48' },
      { key: 'currentControlsReference', label: 'Current Controls Reference', sortable: true, width: 'w-36 sm:w-40 md:w-44 lg:w-48' },
      { key: 'consequence', label: 'Consequence', sortable: true, width: 'w-28 sm:w-32 md:w-36 lg:w-40' },
      { key: 'likelihood', label: 'Likelihood', sortable: true, width: 'w-28 sm:w-32 md:w-36 lg:w-40' },
      { key: 'currentRiskRating', label: 'Current Risk Rating', sortable: true, width: 'w-32 sm:w-36 md:w-40 lg:w-44' },
      { key: 'riskAction', label: 'Risk Action', sortable: true, width: 'w-32 sm:w-36 md:w-40 lg:w-44' },
      { key: 'reasonForAcceptance', label: 'Reason for Acceptance', sortable: true, width: 'w-36 sm:w-40 md:w-44 lg:w-48' },
      { key: 'dateOfSSCApproval', label: 'Date of SSC Approval', sortable: true, width: 'w-32 sm:w-36 md:w-40 lg:w-44' },
      { key: 'riskTreatments', label: 'Risk Treatments', sortable: true, width: 'w-32 sm:w-36 md:w-40 lg:w-44' },
      { key: 'dateRiskTreatmentsApproved', label: 'Date Risk Treatments Approved', sortable: true, width: 'w-40 sm:w-44 md:w-48 lg:w-52' },
      { key: 'dateRiskTreatmentsAssigned', label: 'Date Risk Treatments Assigned', sortable: true, width: 'w-40 sm:w-44 md:w-48 lg:w-52' },
      { key: 'applicableControlsAfterTreatment', label: 'Applicable Controls After Treatment', sortable: true, width: 'w-44 sm:w-48 md:w-52 lg:w-56' },
      { key: 'residualConsequence', label: 'Residual Consequence', sortable: true, width: 'w-32 sm:w-36 md:w-40 lg:w-44' },
      { key: 'residualLikelihood', label: 'Residual Likelihood', sortable: true, width: 'w-32 sm:w-36 md:w-40 lg:w-44' },
      { key: 'residualRiskRating', label: 'Residual Risk Rating', sortable: true, width: 'w-32 sm:w-36 md:w-40 lg:w-44' },
      { key: 'residualRiskAcceptedByOwner', label: 'Residual Risk Accepted By Owner', sortable: true, width: 'w-44 sm:w-48 md:w-52 lg:w-56' },
      { key: 'dateResidualRiskAccepted', label: 'Date Residual Risk Accepted', sortable: true, width: 'w-36 sm:w-40 md:w-44 lg:w-48' },
      { key: 'dateRiskTreatmentCompleted', label: 'Date Risk Treatment Completed', sortable: true, width: 'w-40 sm:w-44 md:w-48 lg:w-52' },
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

  // Fetch risks from MongoDB
  useEffect(() => {
    const fetchRisks = async () => {
      try {
        setLoading(true)
        
        // Fetch risks, treatments, and information assets
        const [risksResponse, treatmentsResponse, informationAssetsResponse] = await Promise.all([
          fetch('/api/risks'),
          fetch('/api/treatments'),
          fetch('/api/information-assets')
        ])
        
        const risksResult = await risksResponse.json()
        const treatmentsResult = await treatmentsResponse.json()
        const informationAssetsResult = await informationAssetsResponse.json()
        
        if (risksResult.success && treatmentsResult.success && informationAssetsResult.success) {
          // Create a map of treatments by riskId for quick lookup
          const treatmentsByRiskId = new Map()
          treatmentsResult.data.forEach((treatment: any) => {
            if (!treatmentsByRiskId.has(treatment.riskId)) {
              treatmentsByRiskId.set(treatment.riskId, [])
            }
            treatmentsByRiskId.get(treatment.riskId).push(treatment)
          })
          
          // Filter out draft risks and transform the data
          const transformedRisks = risksResult.data
            .filter((risk: any) => risk.currentPhase !== 'Draft')
            .map((risk: any) => {
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

            // Get treatments for this risk
            const riskTreatments = treatmentsByRiskId.get(risk.riskId) || []
            const treatmentsText = riskTreatments.length > 0 
              ? `${riskTreatments.length} treatment${riskTreatments.length > 1 ? 's' : ''} assigned`
              : 'No treatments assigned'

            const transformed = {
              riskId: risk.riskId,
              functionalUnit: risk.functionalUnit,
              currentPhase: getPhaseDisplayName(risk.currentPhase),
              jiraTicket: `RISK-${extractRiskNumber(risk.riskId)}`,
              dateRiskRaised: risk.createdAt ? new Date(risk.createdAt).toISOString().split('T')[0] : '2024-01-15',
              raisedBy: risk.riskOwner,
              riskOwner: risk.riskOwner,
              affectedSites: 'All Sites',
              informationAssets: mapAssetIdsToNames(risk.informationAsset, informationAssetsResult.data || []),
              threat: risk.threat,
              vulnerability: risk.vulnerability,
              riskStatement: risk.riskStatement,
              impactCIA: risk.impact ? (Array.isArray(risk.impact) ? risk.impact.join(', ') : 'Not specified') : 'Not specified',
              currentControls: Array.isArray(risk.currentControls) ? risk.currentControls.join(', ') : (risk.currentControls || 'Not specified'),
              currentControlsReference: Array.isArray(risk.currentControlsReference) ? risk.currentControlsReference.join(', ') : (risk.currentControlsReference || 'Not specified'),
              consequence: risk.consequenceRating,
              likelihood: risk.likelihoodRating,
              currentRiskRating: risk.riskRating,
              riskAction: risk.riskAction || 'Not specified',
              reasonForAcceptance: risk.reasonForAcceptance || '',
              dateOfSSCApproval: risk.dateOfSSCApproval ? new Date(risk.dateOfSSCApproval).toISOString().split('T')[0] : '',
              riskTreatments: treatmentsText,
              dateRiskTreatmentsApproved: risk.dateRiskTreatmentsApproved ? new Date(risk.dateRiskTreatmentsApproved).toISOString().split('T')[0] : '',
              dateRiskTreatmentsAssigned: risk.dateRiskTreatmentsAssigned ? new Date(risk.dateRiskTreatmentsAssigned).toISOString().split('T')[0] : '',
              applicableControlsAfterTreatment: risk.applicableControlsAfterTreatment || '',
              residualConsequence: risk.residualConsequence || '',
              residualLikelihood: risk.residualLikelihood || '',
              residualRiskRating: risk.residualRiskRating || '',
              residualRiskAcceptedByOwner: risk.residualRiskAcceptedByOwner || '',
              dateResidualRiskAccepted: risk.dateResidualRiskAccepted ? new Date(risk.dateResidualRiskAccepted).toISOString().split('T')[0] : '',
              dateRiskTreatmentCompleted: risk.dateRiskTreatmentCompleted ? new Date(risk.dateRiskTreatmentCompleted).toISOString().split('T')[0] : '',
            }
            return transformed
          })
          setRisks(transformedRisks)
        } else {
          setError(risksResult.error || treatmentsResult.error || informationAssetsResult.error || 'Failed to fetch data')
        }
              } catch (err) {
          if (err instanceof TypeError) {
            setError('Network error: Failed to fetch data. Please check your connection.')
          } else if (err instanceof SyntaxError) {
            setError('Parsing error: Received malformed data from the server.')
          } else {
            setError('Unexpected error: Failed to fetch data.')
          }
          console.error('Error fetching data:', err)
        } finally {
          setLoading(false)
        }
    }

    fetchRisks()
  }, []) // Remove selectedPhase dependency to avoid infinite re-renders



  const handleRowClick = (row: any) => {
    // Navigate to risk information page
            router.push(`/risk-management/risks/${row.riskId}`)
  }

  const handleExportCSV = () => {
    
  }

  const handlePhaseSelect = (phase: string | null) => {
    setSelectedPhase(phase)
  }

  const handleAddToWorkshop = (risk: any) => {
    setSelectedRiskForWorkshop(risk)
    setWorkshopModalOpen(true)
  }

  const handleCloseWorkshopModal = () => {
    setWorkshopModalOpen(false)
    setSelectedRiskForWorkshop(null)
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
      case 'critical':
      case 'almost certain':
        return 'bg-red-100 text-red-800'
      case 'medium':
      case 'moderate':
      case 'likely':
      case 'possible':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
      case 'minor':
      case 'insignificant':
      case 'unlikely':
      case 'rare':
        return 'bg-green-100 text-green-800'
      case 'major':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiskLevelColor = (level: string) => {
    if (!level) return 'bg-gray-100 text-gray-800'
    
    switch (level.toLowerCase()) {
      case 'extreme':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'moderate':
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

  // Always show all columns regardless of phase selection
  const baseColumns = getColumnsForPhase('full-view')
  
  const columns = baseColumns.map(col => ({
    ...col,
    render: (value: any, row: any) => {
      if (col.key === 'riskId') {
        return (
          <Link
                            href={`/risk-management/risks/${row.riskId}`}
            className="risk-id-button"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="tracking-wide">{value}</span>
            <Icon name="arrow-right" size={10} className="arrow-icon" />
          </Link>
        )
      }
      if (col.key === 'actions') {
        return (
          <div className="flex items-center space-x-2">
            <Tooltip content="Copy Link">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  const url = `${window.location.origin}/risk-management/risks/${row.riskId}`
                  navigator.clipboard.writeText(url).then(() => {
                    showToast({
                      type: 'success',
                      title: 'Link copied to clipboard!'
                    })
                  }).catch(() => {
                    showToast({
                      type: 'error',
                      title: 'Failed to copy link to clipboard'
                    })
                  })
                }}
                className="inline-flex items-center justify-center w-8 h-8 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 transition-colors"
              >
                <Icon name="link" size={12} />
              </button>
            </Tooltip>
            <Tooltip content="Add to Workshop Agenda">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleAddToWorkshop(row)
                }}
                className="inline-flex items-center px-2 py-1 text-xs font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded hover:bg-purple-100 transition-colors"
              >
                <Icon name="calendar-plus" size={12} className="mr-1" />
                Workshop
              </button>
            </Tooltip>
          </div>
        )
      }
      if (col.key === 'impactCIA') {
        // Use the custom renderCIAValues function for the impactCIA column
        return renderCIAValues(value)
      }
      if (col.key === 'informationAssets') {
        // Use the custom renderInformationAssets function for the informationAssets column
        return renderInformationAssets(value)
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
       if (DATE_COLUMNS.includes(col.key)) {
         return (
           <span className="truncate block max-w-full">
             {formatDate(value)}
           </span>
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
           <Link
             href="/risk-management/risks/new"
             className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-white rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
             style={{ 
               backgroundColor: '#4C1D95',
               '--tw-ring-color': '#4C1D95'
             } as React.CSSProperties}
           >
             <Icon name="plus" size={16} className="mr-2" />
             <span className="hidden sm:inline">New Risk</span>
             <span className="sm:hidden">New</span>
           </Link>
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
            href="/risk-management/draft-risks"
            className="py-2 px-1 border-b-2 font-medium text-sm transition-colors border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          >
            Draft Risks
          </Link>
          <Link
            href="/risk-management/treatments"
            className="py-2 px-1 border-b-2 font-medium text-sm transition-colors border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          >
            Treatments
          </Link>
          <Link
            href="/risk-management/workshops"
            className="py-2 px-1 border-b-2 font-medium text-sm transition-colors border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          >
            Workshops
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
           title={`${selectedPhase ? `${RISK_PHASES.find(p => p.id === selectedPhase)?.name} Phase` : 'All'} Risks`}
           searchPlaceholder="Search risks..."
           onRowClick={handleRowClick}
           selectable={false}
           onExportCSV={handleExportCSV}
           phaseButtons={RISK_PHASES}
           selectedPhase={selectedPhase}
           onPhaseSelect={handlePhaseSelect}
         />
      )}

      {/* Workshop Selection Modal */}
      <WorkshopSelectionModal
        isOpen={workshopModalOpen}
        onClose={handleCloseWorkshopModal}
        risk={selectedRiskForWorkshop}
      />
    </div>
  )
} 