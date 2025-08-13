'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import DataTable, { Column } from '@/app/components/DataTable'
import Icon from '@/app/components/Icon'
import Tooltip from '@/app/components/Tooltip'
import { getCIAConfig, extractRiskNumber, mapAssetIdsToNames } from '@/lib/utils'
import { CIA_DELIMITERS } from '@/lib/constants'
import { useToast } from '@/app/components/Toast'

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

// Get columns for draft risks
const getColumns = (): Column[] => [
  { key: 'riskId', label: 'Risk ID', sortable: true, width: '140px' },
  { key: 'actions', label: 'Submit for Review', sortable: false, width: '140px' },
  { key: 'functionalUnit', label: 'Functional Unit', sortable: true, width: '150px' },
  { key: 'currentPhase', label: 'Current Phase', sortable: true, width: '130px' },
  { key: 'jiraTicket', label: 'JIRA Ticket', sortable: true, width: '120px' },
  { key: 'dateRiskRaised', label: 'Date Risk Raised', sortable: true, width: '140px' },
  { key: 'raisedBy', label: 'Raised By', sortable: true, width: '120px' },
  { key: 'riskOwner', label: 'Risk Owner', sortable: true, width: '120px' },
  { key: 'affectedSites', label: 'Affected Sites', sortable: true, width: '120px' },
  { key: 'informationAssets', label: 'Information Assets', sortable: true, width: '300px' },
  { key: 'threat', label: 'Threat', sortable: true, width: '400px' },
  { key: 'vulnerability', label: 'Vulnerability', sortable: true, width: '400px' },
  { key: 'riskStatement', label: 'Risk Statement', sortable: true, width: '500px' },
  { key: 'impactCIA', label: 'Impact (CIA)', sortable: true, width: '120px', render: renderCIAValues },
  { key: 'currentControls', label: 'Current Controls', sortable: true, width: '200px' },
  { key: 'currentControlsReference', label: 'Current Controls Reference', sortable: true, width: '200px' },
  { key: 'consequence', label: 'Consequence', sortable: true, width: '120px' },
  { key: 'likelihood', label: 'Likelihood', sortable: true, width: '120px' },
  { key: 'currentRiskRating', label: 'Current Risk Rating', sortable: true, width: '150px' },
  { key: 'riskAction', label: 'Risk Action', sortable: true, width: '140px' },
  { key: 'reasonForAcceptance', label: 'Reason for Acceptance', sortable: true, width: '200px' },
  { key: 'dateOfSSCApproval', label: 'Date of SSC Approval', sortable: true, width: '160px' },
  { key: 'dateRiskTreatmentsApproved', label: 'Date Risk Treatments Approved', sortable: true, width: '200px' },
  { key: 'residualConsequence', label: 'Residual Consequence', sortable: true, width: '150px' },
  { key: 'residualLikelihood', label: 'Residual Likelihood', sortable: true, width: '150px' },
  { key: 'residualRiskRating', label: 'Residual Risk Rating', sortable: true, width: '160px' },
  { key: 'residualRiskAcceptedByOwner', label: 'Residual Risk Accepted By Owner', sortable: true, width: '220px' },
  { key: 'dateResidualRiskAccepted', label: 'Date Residual Risk Accepted', sortable: true, width: '180px' },
]

export default function DraftRisks() {
  const router = useRouter()
  const { showToast } = useToast()

  const [risks, setRisks] = useState<any[]>([])
  const [informationAssets, setInformationAssets] = useState<Array<{ id: string; informationAsset: string }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch risks and information assets from MongoDB
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch both risks and information assets in parallel
        const [risksResponse, assetsResponse] = await Promise.all([
          fetch('/api/risks'),
          fetch('/api/information-assets')
        ])
        
        const risksResult = await risksResponse.json()
        const assetsResult = await assetsResponse.json()
        
        if (risksResult.success && assetsResult.success) {
          // Set information assets for mapping
          setInformationAssets(assetsResult.data || [])
          
          // Filter for draft risks only and transform the data
          const transformedRisks = risksResult.data
            .filter((risk: any) => risk.currentPhase === 'Draft')
            .map((risk: any) => {
            // Create a new object with only the properties we need - simplified
            // Map phase values to display names
            const getPhaseDisplayName = (phase: string) => {
              const phaseMap: { [key: string]: string } = {
                'identification': 'Identification',
                'analysis': 'Analysis', 
                'evaluation': 'Evaluation',
                'treatment': 'Treatment',
                'monitoring': 'Monitoring',
                'draft': 'Draft'
              };
              return phaseMap[phase] || phase;
            };

            const transformed = {
              riskId: risk.riskId,
              functionalUnit: risk.functionalUnit,
              currentPhase: getPhaseDisplayName(risk.currentPhase),
                              jiraTicket: `RISK-${extractRiskNumber(risk.riskId)}`,
              dateRiskRaised: risk.createdAt ? new Date(risk.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '15 Jan 2024',
              raisedBy: risk.riskOwner,
              riskOwner: risk.riskOwner,
              affectedSites: 'All Sites',
              informationAssets: risk.informationAsset || '',
              threat: risk.threat,
              vulnerability: risk.vulnerability,
              riskStatement: risk.riskStatement,
              impactCIA: risk.impact ? (Array.isArray(risk.impact) ? risk.impact.join(', ') : 'Not specified') : 'Not specified',
                                    currentControls: Array.isArray(risk.currentControls) ? risk.currentControls.join(', ') : (risk.currentControls || 'Not specified'),
                      currentControlsReference: Array.isArray(risk.currentControlsReference) ? risk.currentControlsReference.join(', ') : (risk.currentControlsReference || 'Not specified'),
                      applicableControlsAfterTreatment: Array.isArray(risk.applicableControlsAfterTreatment) ? risk.applicableControlsAfterTreatment.join(', ') : (risk.applicableControlsAfterTreatment || 'Not specified'),
                      consequence: risk.consequenceRating,
              likelihood: risk.likelihoodRating,
              currentRiskRating: risk.riskRating,
              riskAction: 'Requires treatment',
              reasonForAcceptance: risk.reasonForAcceptance || '',
              dateOfSSCApproval: risk.dateOfSSCApproval ? new Date(risk.dateOfSSCApproval).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
              riskTreatments: '',
              dateRiskTreatmentsApproved: risk.dateRiskTreatmentsApproved ? new Date(risk.dateRiskTreatmentsApproved).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
              dateRiskTreatmentsAssigned: '',
              residualConsequence: risk.residualConsequence || '',
              residualLikelihood: risk.residualLikelihood || '',
              residualRiskRating: risk.residualRiskRating || '',
              residualRiskAcceptedByOwner: risk.residualRiskAcceptedByOwner || '',
              dateResidualRiskAccepted: risk.dateResidualRiskAccepted ? new Date(risk.dateResidualRiskAccepted).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
              dateRiskTreatmentCompleted: '',
            }
            return transformed
          })
          setRisks(transformedRisks)
        } else {
          setError(risksResult.error || assetsResult.error || 'Failed to fetch data')
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

    fetchData()
  }, [])

  const handleRowClick = (row: any) => {
    // Navigate to risk information page
            router.push(`/risk-management/risks/${row.riskId}`)
  }

  const handleExportCSV = () => {
    
  }

  const getStatusColor = (status: string) => {
    if (!status) return 'bg-gray-100 text-gray-800'
    
    switch (status.toLowerCase()) {
      case 'draft':
        return 'bg-gray-100 text-gray-800'
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

  const getConsequenceColor = (consequence: string) => {
    if (!consequence) return 'bg-gray-100 text-gray-800'
    
    switch (consequence.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'major':
        return 'bg-orange-100 text-orange-800'
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800'
      case 'minor':
        return 'bg-blue-100 text-blue-800'
      case 'insignificant':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getLikelihoodColor = (likelihood: string) => {
    if (!likelihood) return 'bg-gray-100 text-gray-800'
    
    switch (likelihood.toLowerCase()) {
      case 'almost certain':
        return 'bg-red-100 text-red-800'
      case 'likely':
        return 'bg-orange-100 text-orange-800'
      case 'possible':
        return 'bg-yellow-100 text-yellow-800'
      case 'unlikely':
        return 'bg-blue-100 text-blue-800'
      case 'rare':
        return 'bg-green-100 text-green-800'
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
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const baseColumns = getColumns()
  
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
             <Tooltip content="Submit for Review">
               <button
                 onClick={(e) => {
                   e.stopPropagation()
           
                   showToast({
                     type: 'success',
                     title: `Risk ${row.riskId} submitted for review!`
                   })
                 }}
                 className="inline-flex items-center px-2 py-1 text-xs font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded hover:bg-purple-100 transition-colors"
               >
                 <Icon name="check-circle" size={12} className="mr-1" />
                 Submit
               </button>
             </Tooltip>
           </div>
         )
       }
      if (col.key === 'impactCIA') {
        // Use the custom renderCIAValues function for the impactCIA column
        return renderCIAValues(value)
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
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLikelihoodColor(value)}`}>
            {value}
          </span>
        )
      }
      if (col.key === 'consequence' || col.key === 'residualConsequence') {
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConsequenceColor(value)}`}>
            {value}
          </span>
        )
      }
      if (col.key === 'informationAssets') {
        if (!value || value === '') {
          return (
            <span className="text-gray-400 text-xs italic">No assets specified</span>
          )
        }
        
        // Use the mapAssetIdsToNames utility function
        const assetNames = mapAssetIdsToNames(value, informationAssets)
        
        if (!assetNames) {
          return (
            <span className="text-gray-400 text-xs italic">No assets specified</span>
          )
        }
        
        // Split the comma-separated names and render as chips
        const assetNameArray = assetNames.split(', ').filter(name => name.trim())
        
        return (
          <div className="flex flex-wrap gap-1.5 overflow-hidden">
            {assetNameArray.map((assetName, index) => (
              <span
                key={`${assetName}-${index}`}
                className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200 transition-all duration-200 hover:scale-105 flex-shrink-0"
                title={assetName}
              >
                {assetName}
              </span>
            ))}
          </div>
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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Draft Risks</h1>
          <p className="text-gray-600 mt-1">Review and manage risks in draft status</p>
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
            className="py-2 px-1 border-b-2 font-medium text-sm transition-colors border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          >
            Register
          </Link>
          <Link
            href="/risk-management/draft-risks"
            className="py-2 px-1 border-b-2 font-medium text-sm transition-colors border-blue-500 text-blue-600"
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

      {/* Draft Status Info */}
      <div className="rounded-lg p-4" style={{ backgroundColor: '#E8ECF7', borderColor: '#E8ECF7' }}>
        <div>
          <h3 className="text-sm font-medium" style={{ color: '#22223B' }}>
            Draft Risks
          </h3>
          <p className="text-sm mt-1" style={{ color: '#22223B' }}>
            These risks are in draft status and require review before being added to the formal risk register.
          </p>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#898AC4' }}></div>
            <p className="mt-4" style={{ color: '#22223B' }}>Loading draft risks...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <Icon name="warning" size={48} />
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: '#22223B' }}>Error Loading Draft Risks</h3>
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

      {/* Empty State */}
      {!loading && !error && risks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Icon name="edit" size={48} />
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: '#22223B' }}>No Draft Risks</h3>
          <p className="text-gray-600 mb-4" style={{ color: '#22223B' }}>
            There are currently no risks in draft status.
          </p>
          <Link
            href="/risk-management/risks/new"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
            style={{ backgroundColor: '#4C1D95' }}
          >
            <Icon name="plus" size={16} className="mr-2" />
            Create New Risk
          </Link>
        </div>
      )}

      {/* Draft Risks Data Table */}
      {!loading && !error && risks.length > 0 && (
        <DataTable
          columns={columns}
          data={risks}
          title="Draft Risks"
          searchPlaceholder="Search draft risks..."
          onRowClick={handleRowClick}
          selectable={false}
          onExportCSV={handleExportCSV}
        />
      )}
    </div>
  )
} 