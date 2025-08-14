'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Icon from '@/app/components/Icon'
import Tooltip from '@/app/components/Tooltip'
import { getCIAConfig, extractRiskNumber, mapAssetIdsToNames } from '@/lib/utils'
import { RISK_ACTIONS, RISK_PHASES } from '@/lib/constants'
import DataTable from '@/app/components/DataTable'
import { useToast } from '@/app/components/Toast'
import { useBackNavigation } from '@/app/hooks/useBackNavigation'
import CommentSidebar from '@/app/components/CommentSidebar'
import WorkshopSelectionModal from '@/app/components/WorkshopSelectionModal'
import RiskMatrix from '@/app/components/RiskMatrix'

interface InformationAsset {
  id: string
  informationAsset: string
  category: string
}

interface RiskDetails {
  riskId: string
  functionalUnit: string
  currentPhase: string
  jiraTicket: string
  dateRiskRaised: string
  raisedBy: string
  riskOwner: string
  affectedSites: string
  informationAssets: string
  threat: string
  vulnerability: string
  riskStatement: string
  impactCIA: string
  currentControls: string[]
  currentControlsReference: string[]
  applicableControlsAfterTreatment: string[]
  consequenceRating: string
  likelihoodRating: string
  riskRating: string
  riskAction: string
  reasonForAcceptance: string
  dateOfSSCApproval: string
  dateRiskTreatmentsApproved: string
  residualConsequence: string
  residualLikelihood: string
  residualRiskRating: string
  residualRiskAcceptedByOwner: string
  dateResidualRiskAccepted: string
  treatmentCount: number
}

interface Treatment {
  riskTreatment: string
  treatmentId: string
  treatmentJira?: string
  riskTreatmentOwner: string
  dateRiskTreatmentDue: string
  extendedDueDate: string
  numberOfExtensions: number
  completionDate: string
  closureApproval: string
  closureApprovedBy: string
  riskId?: string
}

interface SOAControl {
  _id: string
  id: string
  title: string
  description: string
  controlStatus: string
  controlApplicability: string
  controlSetId: string
  controlSetTitle: string
}

const parseDate = (dateString: string | null | undefined): Date | null => {
  if (!dateString || typeof dateString !== 'string') return null
  // Try ISO, yyyy-mm-dd, dd/mm/yyyy, dd MMM yyyy
  const iso = Date.parse(dateString)
  if (!isNaN(iso)) return new Date(iso)
  // dd/mm/yyyy
  const dmy = dateString.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (dmy) return new Date(`${dmy[3]}-${dmy[2]}-${dmy[1]}`)
  // dd MMM yyyy
  const dmyText = dateString.match(/^(\d{2}) ([A-Za-z]{3}) (\d{4})$/)
  if (dmyText) return new Date(`${dmyText[3]}-${dmyText[2]}-${dmyText[1]}`)
  return null
}

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString || dateString === 'Not specified') return 'Not specified'
  const date = parseDate(dateString)
  if (!date) return 'Invalid date'
  try {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  } catch {
    return 'Invalid date'
  }
}

const getRelativeTime = (dateString: string | null | undefined): string => {
  if (!dateString || dateString === 'Not specified') return ''

  const date = parseDate(dateString)
  if (!date) return ''

  try {
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return '1 day ago'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`
    return `${Math.ceil(diffDays / 365)} years ago`
  } catch {
    return ''
  }
}

export default function RiskInformation() {
  const params = useParams()
  const { showToast } = useToast()
  const { goBack } = useBackNavigation({
    fallbackRoute: '/risk-management/register'
  })
  const [riskDetails, setRiskDetails] = useState<RiskDetails | null>(null)

  // Validation utilities
  const validateRiskId = (riskId: string | string[] | undefined): string | null => {
    if (!riskId) return null

    // Ensure it's a string
    const id = Array.isArray(riskId) ? riskId[0] : riskId

    // Check if it's empty or whitespace
    if (!id || id.trim() === '') return null

    // Validate format (RISK-XXX where XXX is numeric)
    const riskIdPattern = /^RISK-\d+$/i
    if (!riskIdPattern.test(id.trim())) return null

    return id.trim()
  }



  // Safe API URL construction
  const buildApiUrl = useCallback((endpoint: string, riskId?: string | string[] | undefined): string | null => {
    const validRiskId = validateRiskId(riskId || params.id)
    if (!validRiskId) return null
    return `${endpoint}/${validRiskId}`
  }, [params.id])
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedRisk, setEditedRisk] = useState<RiskDetails | null>(null)
  const [originalRisk, setOriginalRisk] = useState<RiskDetails | null>(null)
  const [saving, setSaving] = useState(false)
  const [exportingPDF, setExportingPDF] = useState(false)
  const [isCommentSidebarOpen, setIsCommentSidebarOpen] = useState(false)
  const [floatingButtonPosition, setFloatingButtonPosition] = useState({ x: 0, y: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [commentCount, setCommentCount] = useState(0)
  const [informationAssets, setInformationAssets] = useState<InformationAsset[]>([])
  const [selectedInformationAssets, setSelectedInformationAssets] = useState<string[]>([])
  const [originalInformationAssetIds, setOriginalInformationAssetIds] = useState<string[]>([])

  // SOA Controls state
  const [soaControls, setSoaControls] = useState<SOAControl[]>([])

  // Modal state for information assets selection
  const [showAssetModal, setShowAssetModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [tempSelectedAssets, setTempSelectedAssets] = useState<string[]>([])
  const [selectedLetter, setSelectedLetter] = useState<string>('')

  // Control selection modal state
  const [showControlModal, setShowControlModal] = useState(false)
  const [controlModalType, setControlModalType] = useState<'currentControlsReference' | 'applicableControlsAfterTreatment' | 'currentControls'>('currentControlsReference')
  const [tempSelectedControls, setTempSelectedControls] = useState<string[]>([])
  const [controlSearchTerm, setControlSearchTerm] = useState('')
  const [selectedControlSet, setSelectedControlSet] = useState<string>('')

  // Workshop selection modal state
  const [isWorkshopModalOpen, setIsWorkshopModalOpen] = useState(false)
  const [selectedTreatmentForWorkshop, setSelectedTreatmentForWorkshop] = useState<Treatment | null>(null)
  const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false)

  // Memoized risk matrix data to prevent unnecessary recalculations
  const memoizedCurrentRisk = useMemo(() => ({
    likelihoodRating: isEditing ? (editedRisk?.likelihoodRating || riskDetails?.likelihoodRating || '') : (riskDetails?.likelihoodRating || ''),
    consequenceRating: isEditing ? (editedRisk?.consequenceRating || riskDetails?.consequenceRating || '') : (riskDetails?.consequenceRating || ''),
    rating: (isEditing ? (editedRisk?.riskRating || riskDetails?.riskRating || 'Low') : (riskDetails?.riskRating || 'Low')) as "Low" | "Moderate" | "High" | "Extreme"
  }), [isEditing, editedRisk?.likelihoodRating, editedRisk?.consequenceRating, editedRisk?.riskRating, riskDetails?.likelihoodRating, riskDetails?.consequenceRating, riskDetails?.riskRating])

  const memoizedResidualRisk = useMemo(() => ({
    residualLikelihood: isEditing ? (editedRisk?.residualLikelihood || riskDetails?.residualLikelihood || '') : (riskDetails?.residualLikelihood || ''),
    residualConsequence: isEditing ? (editedRisk?.residualConsequence || riskDetails?.residualConsequence || '') : (riskDetails?.residualConsequence || ''),
    rating: (isEditing ? (editedRisk?.residualRiskRating || riskDetails?.residualRiskRating || 'Low') : (riskDetails?.residualRiskRating || 'Low')) as "Low" | "Moderate" | "High" | "Extreme"
  }), [isEditing, editedRisk?.residualLikelihood, editedRisk?.residualConsequence, editedRisk?.residualRiskRating, riskDetails?.residualLikelihood, riskDetails?.residualConsequence, riskDetails?.residualRiskRating])





  // Set initial position of floating button to middle of page
  useEffect(() => {
    const setInitialButtonPosition = () => {
      const windowHeight = window.innerHeight
      const buttonHeight = 56 // w-14 h-14 = 56px
      const middleY = (windowHeight / 2) - (buttonHeight / 2)
      setFloatingButtonPosition(prev => ({ ...prev, y: Math.max(20, middleY) }))
    }

    // Set position after component mounts
    setInitialButtonPosition()

    // Update position on window resize
    const handleResize = () => {
      setInitialButtonPosition()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Close options menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOptionsMenuOpen) {
        const target = event.target as Element
        if (!target.closest('.options-menu-container')) {
          setIsOptionsMenuOpen(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOptionsMenuOpen])

  useEffect(() => {
    const fetchData = async () => {
      // Validate risk ID before making API calls
      const validRiskId = validateRiskId(params.id)
      if (!validRiskId) {
        setError('Invalid risk ID format. Expected format: RISK-XXX')
        setLoading(false)
        return
      }

      try {
        setLoading(true)

        // Build safe API URLs
        const riskApiUrl = buildApiUrl('/api/risks', params.id)
        const treatmentsApiUrl = buildApiUrl('/api/treatments', params.id)

        if (!riskApiUrl || !treatmentsApiUrl) {
          setError('Invalid risk ID format. Expected format: RISK-XXX')
          setLoading(false)
          return
        }

        // Fetch information assets
        const informationAssetsResponse = await fetch('/api/information-assets')
        const informationAssetsResult = await informationAssetsResponse.json()
        if (informationAssetsResult.success) {
          setInformationAssets(informationAssetsResult.data)
        }

        // Fetch risk details
        const riskResponse = await fetch(riskApiUrl)
        const riskResult = await riskResponse.json()

        if (riskResult.success) {
          // Transform the data to match the expected format
          const risk = riskResult.data;

          // Store the original information asset IDs for proper initialization
          let originalIds: string[] = []
          if (Array.isArray(risk.informationAsset)) {
            originalIds = risk.informationAsset.map((asset: any) => {
              if (typeof asset === 'object' && asset !== null) {
                return asset.id
              }
              return asset
            }).filter(Boolean) // Remove any undefined/null values
          } else if (typeof risk.informationAsset === 'string') {
            originalIds = risk.informationAsset.split(',').map((id: string) => id.trim())
          }
          setOriginalInformationAssetIds(originalIds)



          const transformedRisk = {
            riskId: risk.riskId,
            functionalUnit: risk.functionalUnit,
            currentPhase: risk.currentPhase,
            jiraTicket: `RISK-${extractRiskNumber(risk.riskId)}`,
            dateRiskRaised: risk.createdAt ? toDateInputValue(risk.createdAt) : '2024-01-15',
            raisedBy: risk.riskOwner,
            riskOwner: risk.riskOwner,
            affectedSites: risk.affectedSites || 'All Sites',
            informationAssets: mapAssetIdsToNames(risk.informationAsset, informationAssetsResult.data || []),
            threat: risk.threat,
            vulnerability: risk.vulnerability,
            riskStatement: risk.riskStatement,
            impactCIA: risk.impact ? (Array.isArray(risk.impact) ? risk.impact.join(', ') : risk.impact) : 'Not specified',
                              currentControls: Array.isArray(risk.currentControls) ? risk.currentControls : (risk.currentControls ? [risk.currentControls] : []),
                  currentControlsReference: Array.isArray(risk.currentControlsReference) ? risk.currentControlsReference : (risk.currentControlsReference ? [risk.currentControlsReference] : []),
                  applicableControlsAfterTreatment: Array.isArray(risk.applicableControlsAfterTreatment) ? risk.applicableControlsAfterTreatment : (risk.applicableControlsAfterTreatment ? [risk.applicableControlsAfterTreatment] : []),
            consequenceRating: risk.consequenceRating,
            likelihoodRating: risk.likelihoodRating,
            riskRating: risk.riskRating,
            riskAction: risk.riskAction,
            reasonForAcceptance: risk.reasonForAcceptance || '',
            dateOfSSCApproval: risk.dateOfSSCApproval ? toDateInputValue(risk.dateOfSSCApproval) : '',
            dateRiskTreatmentsApproved: risk.dateRiskTreatmentsApproved ? toDateInputValue(risk.dateRiskTreatmentsApproved) : '',
            residualConsequence: risk.residualConsequence || '',
            residualLikelihood: risk.residualLikelihood || '',
            residualRiskRating: risk.residualRiskRating || '',
            residualRiskAcceptedByOwner: risk.residualRiskAcceptedByOwner || '',
            dateResidualRiskAccepted: risk.dateResidualRiskAccepted ? toDateInputValue(risk.dateResidualRiskAccepted) : '',
            treatmentCount: 4,
          };
          setRiskDetails(transformedRisk)
        } else {
          setError(riskResult.error || 'Failed to fetch risk details')
          setLoading(false)
          return
        }

        // Fetch treatments for this risk
        const treatmentsResponse = await fetch(treatmentsApiUrl)
        const treatmentsResult = await treatmentsResponse.json()

        if (treatmentsResult.success) {
          setTreatments(treatmentsResult.data)
        }

        // Fetch SOA controls
        try {
          const soaResponse = await fetch('/api/compliance/soa')
          const soaResult = await soaResponse.json()
          if (soaResult.success) {
            setSoaControls(soaResult.data)
          }
        } catch (error) {
          console.error('Error fetching SOA controls:', error)
          // Don't fail if SOA controls fetch fails
        }

      } catch (err) {
        setError('Failed to fetch risk details')
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }

    const validRiskId = validateRiskId(params.id)
    if (validRiskId) {
      fetchData()
    } else if (params.id) {
      // Only set error if params.id exists but is invalid
      setError('Invalid risk ID format. Expected format: RISK-XXX')
      setLoading(false)
    }
  }, [params.id, buildApiUrl])

  // Separate useEffect for fetching comment count to avoid interference with main data loading
  useEffect(() => {
    const fetchCommentCount = async () => {
      const validRiskId = validateRiskId(params.id)
      if (!validRiskId) return

      try {
        const commentsApiUrl = buildApiUrl('/api/risks', params.id)
        if (commentsApiUrl) {
          const commentsResponse = await fetch(`${commentsApiUrl}/comments`)
          const commentsResult = await commentsResponse.json()
          if (commentsResult.success) {
            setCommentCount(commentsResult.data.length)
          }
        }
      } catch (error) {
        console.error('Error fetching comments count:', error)
        // Don't fail if comments fetch fails
      }
    }

    if (params.id) {
      fetchCommentCount()
    }
  }, [params.id, buildApiUrl])

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

  const getTreatmentStatusColor = (status: string) => {
    if (!status) return 'bg-gray-100 text-gray-800'

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

  // Convert date to YYYY-MM-DD format for HTML date inputs
  const toDateInputValue = (dateString: string | null | undefined): string => {
    const date = parseDate(dateString)
    if (!date) return ''

    try {
      return date.toISOString().split('T')[0]
    } catch {
      return ''
    }
  }



  const handleExportPDF = async () => {
    if (!riskDetails) return

    try {
      setExportingPDF(true)

      // Generate HTML content for PDF
      const htmlContent = generatePDFHTML(riskDetails, treatments)

      // Call the PDF generation API
      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html: htmlContent,
          filename: `${riskDetails.riskId}-risk-information.pdf`
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      // Create blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${riskDetails.riskId}-risk-information.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      showToast({
        type: 'success',
        title: 'PDF Exported Successfully',
        message: `Risk information for ${riskDetails.riskId} has been exported to PDF.`,
        duration: 4000
      })
    } catch (error) {
      console.error('PDF export error:', error)
      showToast({
        type: 'error',
        title: 'PDF Export Failed',
        message: 'Failed to generate PDF. Please try again.',
        duration: 6000
      })
    } finally {
      setExportingPDF(false)
    }
  }

  const generatePDFHTML = (risk: RiskDetails, treatments: Treatment[]) => {
    // Generate risk matrix HTML
    const generateRiskMatrixHTML = () => {
      const likelihoodLabels = ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain']
      const consequenceLabels = ['Insignificant', 'Minor', 'Moderate', 'Major', 'Critical']
      const ratings = [
        ['Low', 'Low', 'Moderate', 'High', 'High'],
        ['Low', 'Low', 'Moderate', 'High', 'Extreme'],
        ['Low', 'Moderate', 'High', 'Extreme', 'Extreme'],
        ['Moderate', 'Moderate', 'High', 'Extreme', 'Extreme'],
        ['Moderate', 'High', 'Extreme', 'Extreme', 'Extreme'],
      ]

      // Find current risk coordinates
      const currentLikelihoodIndex = likelihoodLabels.findIndex(label => label === risk.likelihoodRating)
      const currentConsequenceIndex = consequenceLabels.findIndex(label => label === risk.consequenceRating)
      
      // Find residual risk coordinates
      const residualLikelihoodIndex = likelihoodLabels.findIndex(label => label === risk.residualLikelihood)
      const residualConsequenceIndex = consequenceLabels.findIndex(label => label === risk.residualConsequence)

      let matrixHTML = `
        <div class="risk-matrix">
          <h3>Risk Matrix</h3>
          <div class="matrix-container">
            <div class="matrix-grid">
              <div class="matrix-header-cell"></div>
      `
      
      // Add consequence headers
      consequenceLabels.forEach(label => {
        matrixHTML += `<div class="matrix-header-cell">${label}</div>`
      })
      
      // Add matrix rows
      likelihoodLabels.forEach((likelihood, lIdx) => {
        matrixHTML += `<div class="matrix-row-label">${likelihood}</div>`
        
        consequenceLabels.forEach((consequence, cIdx) => {
          const rating = ratings[lIdx][cIdx]
          const isCurrentRisk = lIdx === currentLikelihoodIndex && cIdx === currentConsequenceIndex
          const isResidualRisk = lIdx === residualLikelihoodIndex && cIdx === residualConsequenceIndex
          
          let cellClass = 'matrix-cell'
          let cellContent = rating
          
          if (isCurrentRisk && isResidualRisk) {
            cellClass += ' current-and-residual'
            cellContent = `${rating}<br><span class="risk-indicator current">C</span><span class="risk-indicator residual">R</span>`
          } else if (isCurrentRisk) {
            cellClass += ' current-risk'
            cellContent = `${rating}<br><span class="risk-indicator current">C</span>`
          } else if (isResidualRisk) {
            cellClass += ' residual-risk'
            cellContent = `${rating}<br><span class="risk-indicator residual">R</span>`
          }
          
          matrixHTML += `<div class="${cellClass} ${rating.toLowerCase()}">${cellContent}</div>`
        })
      })
      
      matrixHTML += `
            </div>
          </div>
          <div class="matrix-legend">
            <div class="legend-item">
              <span class="legend-marker current"></span>
              <span>Current Risk (${risk.likelihoodRating} × ${risk.consequenceRating} = ${risk.riskRating})</span>
            </div>
            ${risk.residualLikelihood && risk.residualConsequence ? `
            <div class="legend-item">
              <span class="legend-marker residual"></span>
              <span>Residual Risk (${risk.residualLikelihood} × ${risk.residualConsequence} = ${risk.residualRiskRating})</span>
            </div>
            ` : ''}
          </div>
        </div>
      `
      
      return matrixHTML
    }

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${risk.riskId} - Risk Information</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 20px;
            background: white;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #4C1D95;
          }
          .header h1 {
            color: #22223B;
            margin: 0;
            font-size: 24px;
            font-weight: bold;
          }
          .header p {
            color: #666;
            margin: 5px 0 0 0;
            font-size: 14px;
          }
          .section {
            margin-bottom: 25px;
            page-break-inside: avoid;
          }
          .section h2 {
            color: #4C1D95;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            padding-bottom: 5px;
            border-bottom: 1px solid #E8ECF7;
          }
          .section h3 {
            color: #4C1D95;
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 12px;
          }
          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
          }
          .field {
            margin-bottom: 12px;
          }
          .field-label {
            font-weight: 600;
            color: #666;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
          }
          .field-value {
            color: #333;
            font-size: 14px;
            line-height: 1.4;
          }
          .risk-statement {
            background: #F8F9FA;
            padding: 15px;
            border-left: 4px solid #4C1D95;
            margin-bottom: 25px;
            border-radius: 4px;
          }
          .risk-statement h3 {
            color: #4C1D95;
            margin: 0 0 10px 0;
            font-size: 16px;
            font-weight: bold;
          }
          .risk-statement p {
            margin: 0;
            color: #333;
            line-height: 1.5;
          }
          
          /* Risk Matrix Styles */
          .risk-matrix {
            margin-bottom: 30px;
            page-break-inside: avoid;
          }
          .matrix-container {
            margin: 20px 0;
            overflow-x: auto;
          }
          .matrix-grid {
            display: grid;
            grid-template-columns: 120px repeat(5, 1fr);
            gap: 2px;
            max-width: 800px;
            margin: 0 auto;
          }
          .matrix-header-cell {
            background: #F8F9FA;
            padding: 8px 4px;
            text-align: center;
            font-weight: 600;
            font-size: 11px;
            color: #4C1D95;
            border: 1px solid #E8ECF7;
          }
          .matrix-row-label {
            background: #F8F9FA;
            padding: 8px 4px;
            text-align: center;
            font-weight: 600;
            font-size: 11px;
            color: #4C1D95;
            border: 1px solid #E8ECF7;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .matrix-cell {
            padding: 8px 4px;
            text-align: center;
            font-weight: 600;
            font-size: 10px;
            border: 1px solid #E8ECF7;
            position: relative;
            min-height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
          }
          .matrix-cell.low {
            background: #D1FAE5;
            color: #065F46;
          }
          .matrix-cell.moderate {
            background: #FEF3C7;
            color: #92400E;
          }
          .matrix-cell.high {
            background: #FED7AA;
            color: #C2410C;
          }
          .matrix-cell.extreme {
            background: #FECACA;
            color: #BE123C;
          }
          .matrix-cell.current-risk {
            background: #DBEAFE;
            color: #1E40AF;
            border: 2px solid #3B82F6;
          }
          .matrix-cell.residual-risk {
            background: #FCE7F3;
            color: #BE185D;
            border: 2px solid #EC4899;
          }
          .matrix-cell.current-and-residual {
            background: linear-gradient(135deg, #DBEAFE 50%, #FCE7F3 50%);
            color: #1E40AF;
            border: 2px solid #3B82F6;
          }
          .risk-indicator {
            font-size: 8px;
            font-weight: bold;
            padding: 1px 3px;
            border-radius: 2px;
            margin-top: 2px;
          }
          .risk-indicator.current {
            background: #3B82F6;
            color: white;
          }
          .risk-indicator.residual {
            background: #EC4899;
            color: white;
          }
          .matrix-legend {
            margin-top: 15px;
            text-align: center;
          }
          .legend-item {
            display: inline-block;
            margin: 0 15px;
            font-size: 12px;
            color: #666;
          }
          .legend-marker {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 2px;
            margin-right: 5px;
            vertical-align: middle;
          }
          .legend-marker.current {
            background: #3B82F6;
          }
          .legend-marker.residual {
            background: #EC4899;
          }
          
          .treatments-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            font-size: 12px;
          }
          .treatments-table th,
          .treatments-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          .treatments-table th {
            background: #F8F9FA;
            font-weight: 600;
            color: #4C1D95;
          }
          .treatments-table tr:nth-child(even) {
            background: #F8F9FA;
          }
          .status-badge {
            padding: 2px 6px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
          }
          .status-completed {
            background: #D1FAE5;
            color: #065F46;
          }
          .status-pending {
            background: #FEF3C7;
            color: #92400E;
          }
          .page-break {
            page-break-before: always;
          }
          @media print {
            body { margin: 0; }
            .page-break { page-break-before: always; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${risk.riskId} - Risk Information</h1>
          <p>Risk Profile Report</p>
          <p>Generated on ${new Date().toLocaleDateString('en-AU')}</p>
        </div>

        <div class="risk-statement">
          <h3>Risk Statement</h3>
          <p>${risk.riskStatement}</p>
        </div>

        <div class="section">
          <h2>Risk Assessment</h2>
          <div class="grid">
            <div class="field">
              <div class="field-label">Risk Rating</div>
              <div class="field-value">${risk.riskRating}</div>
            </div>
            <div class="field">
              <div class="field-label">Impact (CIA)</div>
              <div class="field-value">${risk.impactCIA}</div>
            </div>
            <div class="field">
              <div class="field-label">Threat</div>
              <div class="field-value">${risk.threat}</div>
            </div>
            <div class="field">
              <div class="field-label">Vulnerability</div>
              <div class="field-value">${risk.vulnerability}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Risk Matrix</h2>
          ${generateRiskMatrixHTML()}
        </div>

        <div class="section">
          <h2>Ownership & Asset</h2>
          <div class="grid">
            <div class="field">
              <div class="field-label">Risk Owner</div>
              <div class="field-value">${risk.riskOwner}</div>
            </div>
            <div class="field">
              <div class="field-label">Functional Unit</div>
              <div class="field-value">${risk.functionalUnit}</div>
            </div>
            <div class="field">
              <div class="field-label">Information Asset</div>
              <div class="field-value">${risk.informationAssets}</div>
            </div>
            <div class="field">
              <div class="field-label">Affected Sites</div>
              <div class="field-value">${risk.affectedSites}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Current Status</h2>
          <div class="grid">
            <div class="field">
              <div class="field-label">Current Phase</div>
              <div class="field-value">${risk.currentPhase}</div>
            </div>
            <div class="field">
              <div class="field-label">Risk Action</div>
              <div class="field-value">${risk.riskAction}</div>
            </div>
            <div class="field">
              <div class="field-label">Jira Ticket</div>
              <div class="field-value">${risk.jiraTicket}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Controls</h2>
          <div class="grid">
            <div class="field">
              <div class="field-label">Current Controls</div>
              <div class="field-value">${Array.isArray(risk.currentControls) && risk.currentControls.length > 0 ? risk.currentControls.join(', ') : 'Not specified'}</div>
            </div>
            <div class="field">
              <div class="field-label">Current Controls Reference</div>
              <div class="field-value">${Array.isArray(risk.currentControlsReference) && risk.currentControlsReference.length > 0 ? risk.currentControlsReference.join(', ') : 'Not specified'}</div>
            </div>
            <div class="field">
              <div class="field-label">Applicable Controls After Treatment</div>
              <div class="field-value">${Array.isArray(risk.applicableControlsAfterTreatment) && risk.applicableControlsAfterTreatment.length > 0 ? risk.applicableControlsAfterTreatment.join(', ') : 'Not specified'}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Risk Details</h2>
          <div class="grid">
            <div class="field">
              <div class="field-label">Date Risk Raised</div>
              <div class="field-value">${formatDate(risk.dateRiskRaised)}</div>
            </div>
            <div class="field">
              <div class="field-label">Raised By</div>
              <div class="field-value">${risk.raisedBy}</div>
            </div>
            <div class="field">
              <div class="field-label">Consequence Rating</div>
              <div class="field-value">${risk.consequenceRating}</div>
            </div>
            <div class="field">
              <div class="field-label">Likelihood Rating</div>
              <div class="field-value">${risk.likelihoodRating}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Residual Risk Assessment</h2>
          <div class="grid">
            <div class="field">
              <div class="field-label">Residual Consequence</div>
              <div class="field-value">${risk.residualConsequence || 'Not specified'}</div>
            </div>
            <div class="field">
              <div class="field-label">Residual Likelihood</div>
              <div class="field-value">${risk.residualLikelihood || 'Not specified'}</div>
            </div>
            <div class="field">
              <div class="field-label">Residual Risk Rating</div>
              <div class="field-value">${risk.residualRiskRating || 'Not specified'}</div>
            </div>
            <div class="field">
              <div class="field-label">Residual Risk Accepted By Owner</div>
              <div class="field-value">${risk.residualRiskAcceptedByOwner || 'Not specified'}</div>
            </div>
            <div class="field">
              <div class="field-label">Date Residual Risk Accepted</div>
              <div class="field-value">${formatDate(risk.dateResidualRiskAccepted)}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Approvals & Dates</h2>
          <div class="grid">
            <div class="field">
              <div class="field-label">Date of SSC Approval</div>
              <div class="field-value">${formatDate(risk.dateOfSSCApproval)}</div>
            </div>
            <div class="field">
              <div class="field-label">Date Risk Treatments Approved</div>
              <div class="field-value">${formatDate(risk.dateRiskTreatmentsApproved)}</div>
            </div>
            ${risk.riskAction === 'Accept' ? `
            <div class="field">
              <div class="field-label">Reason for Acceptance</div>
              <div class="field-value">${risk.reasonForAcceptance || 'Not specified'}</div>
            </div>
            ` : ''}
          </div>
        </div>

        ${treatments.length > 0 ? `
        <div class="section page-break">
          <h2>Risk Treatments</h2>
          <table class="treatments-table">
            <thead>
              <tr>
                <th>Treatment</th>
                <th>Treatment ID</th>
                <th>Treatment Jira</th>
                <th>Owner</th>
                <th>Due Date</th>
                <th>Extended Due Date</th>
                <th>Extensions</th>
                <th>Completion Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${treatments.map(treatment => `
                <tr>
                  <td>${treatment.riskTreatment}</td>
                  <td>${treatment.treatmentId}</td>
                  <td>${treatment.treatmentJira || 'Not specified'}</td>
                  <td>${treatment.riskTreatmentOwner}</td>
                  <td>${formatDate(treatment.dateRiskTreatmentDue)}</td>
                  <td>${formatDate(treatment.extendedDueDate)}</td>
                  <td>${treatment.numberOfExtensions}</td>
                  <td>${formatDate(treatment.completionDate)}</td>
                  <td>
                    <span class="status-badge ${treatment.closureApproval === 'Approved' ? 'status-completed' : 'status-pending'}">
                      ${treatment.closureApproval}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}
      </body>
      </html>
    `
  }

  const handleCopyLink = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url).then(() => {
      showToast({
        type: 'success',
        title: 'Link Copied',
        message: 'Risk page link has been copied to your clipboard.',
        duration: 3000
      })
    }).catch(err => {
      console.error('Failed to copy link: ', err)
      showToast({
        type: 'error',
        title: 'Copy Failed',
        message: 'Failed to copy link to clipboard.',
        duration: 4000
      })
    })
  }

  const handleEdit = () => {
    if (!riskDetails) return
    
    setIsEditing(true)
    setOriginalRisk(riskDetails)
    setEditedRisk(riskDetails)

    // Initialize selected information assets from the stored original IDs
    // If we have original IDs, use them; otherwise, try to extract from informationAssets string
    if (originalInformationAssetIds.length > 0) {
      setSelectedInformationAssets(originalInformationAssetIds)
    } else if (riskDetails.informationAssets) {
      // Extract asset IDs from the informationAssets string by matching with informationAssets array
      const assetNames = riskDetails.informationAssets.split(', ').map(name => name.trim())
      const matchingAssetIds = informationAssets
        .filter(asset => assetNames.includes(asset.informationAsset))
        .map(asset => asset.id)
      setSelectedInformationAssets(matchingAssetIds)
    } else {
      setSelectedInformationAssets([])
    }
    
    // Ensure risk ratings are properly calculated when entering edit mode
    if (riskDetails.likelihoodRating && riskDetails.consequenceRating) {
      const calculatedCurrentRating = calculateRiskRating(riskDetails.likelihoodRating, riskDetails.consequenceRating)
      if (calculatedCurrentRating !== riskDetails.riskRating) {
        setEditedRisk(prev => prev ? {
          ...prev,
          riskRating: calculatedCurrentRating
        } : null)
      }
    }
    
    if (riskDetails.residualLikelihood && riskDetails.residualConsequence) {
      const calculatedResidualRating = calculateRiskRating(riskDetails.residualLikelihood, riskDetails.residualConsequence)
      if (calculatedResidualRating !== riskDetails.residualRiskRating) {
        setEditedRisk(prev => prev ? {
          ...prev,
          residualRiskRating: calculatedResidualRating
        } : null)
      }
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedRisk(originalRisk) // Reset to the original values when canceling
    setOriginalRisk(null) // Clear the original values
    setSelectedInformationAssets([]) // Reset selected information assets
    setShowAssetModal(false) // Close modal if open
    setSearchTerm('')
    setTempSelectedAssets([])
    setOriginalInformationAssetIds([]) // Reset original IDs
  }

  const handleSave = async () => {
    if (!editedRisk) return

    // Build safe API URL with the current risk ID
    const riskApiUrl = buildApiUrl('/api/risks', params.id)
    if (!riskApiUrl) {
      showToast({
        type: 'error',
        title: 'Invalid Risk ID',
        message: 'The risk ID format is invalid. Expected format: RISK-XXX',
        duration: 5000
      })
      return
    }

    try {
      setSaving(true)

      // Ensure risk ratings are calculated before saving
      const dataToSave = {
        ...editedRisk,
        informationAsset: selectedInformationAssets,
        // Ensure current risk rating is calculated if likelihood/consequence changed
        riskRating: editedRisk.likelihoodRating && editedRisk.consequenceRating 
          ? calculateRiskRating(editedRisk.likelihoodRating, editedRisk.consequenceRating)
          : editedRisk.riskRating,
        // Ensure residual risk rating is calculated if residual likelihood/consequence changed
        residualRiskRating: editedRisk.residualLikelihood && editedRisk.residualConsequence
          ? calculateRiskRating(editedRisk.residualLikelihood, editedRisk.residualConsequence)
          : editedRisk.residualRiskRating
      }

      const response = await fetch(riskApiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSave),
      })

      const result = await response.json()

      if (result.success) {
        // Update the local state with the actual API response data
        // The risk details will be updated in the refresh section below
        
        // Immediately update the editedRisk state with the saved values to ensure UI consistency
        const savedRiskData = {
          ...editedRisk,
          impactCIA: editedRisk.impactCIA, // Keep the current edited value
          informationAssets: selectedInformationAssets.length > 0 
            ? selectedInformationAssets.map(assetId => {
                const asset = informationAssets.find(a => a.id === assetId)
                return asset?.informationAsset || assetId
              }).join(', ')
            : ''
        }
        setEditedRisk(savedRiskData)
        
        setIsEditing(false)
        setOriginalRisk(null)
        
        // Refresh both risk details and information assets to ensure we have the latest data
        // Only refresh information assets if they were actually changed
        // Compare the selected assets with the original information asset IDs
        const informationAssetsChanged = JSON.stringify(selectedInformationAssets.sort()) !== JSON.stringify(originalInformationAssetIds.sort())
        
        try {
          const [riskResponse, informationAssetsResponse] = await Promise.all([
            fetch(riskApiUrl),
            // Only fetch information assets if they changed
            informationAssetsChanged ? fetch('/api/information-assets') : Promise.resolve({ json: () => Promise.resolve({ success: false }) })
          ])
          
          const riskResult = await riskResponse.json()
          const informationAssetsResult = await informationAssetsResponse.json()
          

          
          if (riskResult.success) {
            // Update with the latest risk data from database
            // Transform the impact field to impactCIA for UI display
            const transformedRiskData = {
              ...riskResult.data,
              impactCIA: riskResult.data.impact ? (Array.isArray(riskResult.data.impact) ? riskResult.data.impact.join(', ') : riskResult.data.impact) : 'Not specified',
              informationAssets: selectedInformationAssets.length > 0 
                ? selectedInformationAssets.map(assetId => {
                    const asset = informationAssets.find(a => a.id === assetId)
                    return asset?.informationAsset || assetId
                  }).join(', ')
                : ''
            }
            

            setRiskDetails(transformedRiskData)
            // Also update the editedRisk state to reflect the new values in the form
            setEditedRisk(transformedRiskData)

          } else {
            console.warn('Failed to refresh risk details:', riskResult.error)
            // Use fallback data if refresh fails
            const fallbackRiskDetails = {
              ...result.data,
              impactCIA: result.data.impact ? (Array.isArray(result.data.impact) ? result.data.impact.join(', ') : result.data.impact) : 'Not specified',
              informationAssets: selectedInformationAssets.length > 0 
                ? selectedInformationAssets.map(assetId => {
                    const asset = informationAssets.find(a => a.id === assetId)
                    return asset?.informationAsset || assetId
                  }).join(', ')
                : ''
            }
            setRiskDetails(fallbackRiskDetails)
            setEditedRisk(fallbackRiskDetails)
          }
          
          if (informationAssetsResult.success) {
            setInformationAssets(informationAssetsResult.data)
          } else {
            console.warn('Failed to refresh information assets:', informationAssetsResult.error)
          }
        } catch (error) {
          console.error('Error refreshing data:', error)
          // Fallback: update with the current edited data if refresh fails
          // Since the API response data might not have the transformed fields, we need to handle this manually
          const fallbackRiskDetails = {
            ...result.data,
            impactCIA: result.data.impact ? (Array.isArray(result.data.impact) ? result.data.impact.join(', ') : result.data.impact) : 'Not specified',
            informationAssets: selectedInformationAssets.length > 0 
              ? selectedInformationAssets.map(assetId => {
                  const asset = informationAssets.find(a => a.id === assetId)
                  return asset?.informationAsset || assetId
                }).join(', ')
              : ''
          }
          setRiskDetails(fallbackRiskDetails)
          setEditedRisk(fallbackRiskDetails)
        }
        
        showToast({
          type: 'success',
          title: 'Risk Updated Successfully',
          message: 'The risk information has been saved successfully.',
          duration: 4000
        })
      } else {
        const errorMessage = result.details
          ? `Validation failed: ${result.details.join(', ')}`
          : result.error || 'An unknown error occurred while updating the risk.'
        showToast({
          type: 'error',
          title: 'Update Failed',
          message: errorMessage,
          duration: 6000
        })
      }
    } catch (error) {
      console.error('Error updating risk:', error)
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update risk. Please try again.',
        duration: 6000
      })
    } finally {
      setSaving(false)
    }
  }

  const calculateRiskRating = (likelihood: string, consequence: string): string => {
    const likelihoodIndex = ["Rare", "Unlikely", "Possible", "Likely", "Almost Certain"].indexOf(likelihood)
    const consequenceIndex = ["Insignificant", "Minor", "Moderate", "Major", "Critical"].indexOf(consequence)
    
    if (likelihoodIndex === -1 || consequenceIndex === -1) return "Low"
    
    const ratings = [
      ["Low", "Low", "Moderate", "High", "High"],
      ["Low", "Low", "Moderate", "High", "Extreme"],
      ["Low", "Moderate", "High", "Extreme", "Extreme"],
      ["Moderate", "Moderate", "High", "Extreme", "Extreme"],
      ["Moderate", "High", "Extreme", "Extreme", "Extreme"],
    ]
    
    return ratings[likelihoodIndex][consequenceIndex]
  }

  const handleFieldChange = <K extends keyof RiskDetails>(
    field: K,
    value: RiskDetails[K]
  ) => {
    if (!editedRisk) return
    
    let updatedRisk = { ...editedRisk, [field]: value }
    
    // Auto-calculate residual risk rating when residual likelihood or consequence changes
    if (field === 'residualLikelihood' || field === 'residualConsequence') {
      const newLikelihood = field === 'residualLikelihood' ? value as string : editedRisk.residualLikelihood
      const newConsequence = field === 'residualConsequence' ? value as string : editedRisk.residualConsequence
      
      if (newLikelihood && newConsequence) {
        const calculatedRating = calculateRiskRating(newLikelihood, newConsequence)
        updatedRisk = {
          ...updatedRisk,
          residualRiskRating: calculatedRating
        }
      }
    }
    
    // Auto-calculate current risk rating when likelihood or consequence changes
    if (field === 'likelihoodRating' || field === 'consequenceRating') {
      const newLikelihood = field === 'likelihoodRating' ? value as string : editedRisk.likelihoodRating
      const newConsequence = field === 'consequenceRating' ? value as string : editedRisk.consequenceRating
      
      if (newLikelihood && newConsequence) {
        const calculatedRating = calculateRiskRating(newLikelihood, newConsequence)
        updatedRisk = {
          ...updatedRisk,
          riskRating: calculatedRating
        }
      }
    }
    
    setEditedRisk(updatedRisk)
  }



  const openAssetModal = () => {
    setTempSelectedAssets([...selectedInformationAssets])
    setSearchTerm('')
    setSelectedLetter('')
    setShowAssetModal(true)
  }

  const closeAssetModal = () => {
    setShowAssetModal(false)
    setSearchTerm('')
    setTempSelectedAssets([])
    setSelectedLetter('')
  }

  const handleAssetSelection = (assetId: string, checked: boolean) => {
    setTempSelectedAssets(prev =>
      checked
        ? [...prev, assetId]
        : prev.filter(id => id !== assetId)
    )
  }

  const applyAssetSelection = () => {
    setSelectedInformationAssets([...tempSelectedAssets])
    closeAssetModal()
  }

  const openControlModal = (type: 'currentControlsReference' | 'applicableControlsAfterTreatment' | 'currentControls') => {
    setControlModalType(type)
    setControlSearchTerm('')
    setSelectedControlSet('')
    
    // Initialize with current values
    if (type === 'currentControlsReference') {
      setTempSelectedControls([...(editedRisk?.currentControlsReference || [])])
    } else if (type === 'applicableControlsAfterTreatment') {
      setTempSelectedControls([...(editedRisk?.applicableControlsAfterTreatment || [])])
    } else {
      setTempSelectedControls([...(editedRisk?.currentControls || [])])
    }
    
    setShowControlModal(true)
  }

  const closeControlModal = () => {
    setShowControlModal(false)
    setControlSearchTerm('')
    setSelectedControlSet('')
    setTempSelectedControls([])
  }

  const handleControlSelection = (controlId: string, checked: boolean) => {
    setTempSelectedControls(prev =>
      checked
        ? [...prev, controlId]
        : prev.filter(id => id !== controlId)
    )
  }

  const applyControlSelection = () => {
    if (controlModalType === 'currentControlsReference') {
      handleFieldChange('currentControlsReference', [...tempSelectedControls])
    } else if (controlModalType === 'applicableControlsAfterTreatment') {
      handleFieldChange('applicableControlsAfterTreatment', [...tempSelectedControls])
    } else {
      handleFieldChange('currentControls', [...tempSelectedControls])
    }
    closeControlModal()
  }

  const addCurrentControl = (controlId: string) => {
    if (!editedRisk) return
    
    const currentControls = Array.isArray(editedRisk.currentControls) ? [...editedRisk.currentControls] : []
    if (!currentControls.includes(controlId)) {
      currentControls.push(controlId)
      handleFieldChange('currentControls', currentControls)
    }
  }

  const filteredAssets = informationAssets
    .filter(asset =>
      asset.informationAsset.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(asset => {
      if (!selectedLetter) return true
      return asset.informationAsset.toLowerCase().startsWith(selectedLetter.toLowerCase())
    })
    .sort((a, b) => a.informationAsset.localeCompare(b.informationAsset))

  const filteredSOAControls = soaControls
    .filter(control =>
      control.id.toLowerCase().includes(controlSearchTerm.toLowerCase()) ||
      control.title.toLowerCase().includes(controlSearchTerm.toLowerCase()) ||
      control.description.toLowerCase().includes(controlSearchTerm.toLowerCase())
    )
    .filter(control => {
      if (!selectedControlSet) return true
      return control.controlSetId === selectedControlSet
    })
    .sort((a, b) => a.id.localeCompare(b.id))

  const getUniqueControlSets = () => {
    const sets = new Set(soaControls.map(control => control.controlSetId))
    return Array.from(sets).sort()
  }

  const handleAddTreatmentToWorkshop = (treatment: Treatment) => {
    setSelectedTreatmentForWorkshop(treatment)
    setIsWorkshopModalOpen(true)
  }

  const handleCloseWorkshopModal = () => {
    setIsWorkshopModalOpen(false)
    setSelectedTreatmentForWorkshop(null)
  }

  const handleAddRiskToWorkshop = () => {
    setIsWorkshopModalOpen(true)
    setIsOptionsMenuOpen(false) // Close options menu
  }

  // Helper function to get SOA control details by ID
  const getSOAControlDetails = (controlId: string) => {
    return soaControls.find(control => control.id === controlId)
  }



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading risk details...</p>
        </div>
      </div>
    )
  }

  if (error || !riskDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Icon name="exclamation-triangle" size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Risk Not Found</h2>
          <p className="text-gray-600 mb-4">
            {error || 'The risk with ID "' + validateRiskId(params.id) + '" could not be found.'}
          </p>
          <button
            onClick={goBack}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{
              backgroundColor: '#4C1D95',
              '--tw-ring-color': '#4C1D95'
            } as React.CSSProperties}
          >
            <Icon name="arrow-left" size={16} className="mr-2" />
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Risk Information Container */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={goBack}
              className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 hover:bg-gray-200 bg-white border border-gray-300"
              title="Go back to previous page"
            >
              <Icon name="arrow-left" size={16} />
            </button>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#22223B' }}>
                {isEditing ? 'Edit Risk' : `${riskDetails.riskId} - Risk Information`}
              </h1>
              <p className="text-gray-600" style={{ color: '#22223B' }}>
                Risk Profile
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!isEditing && (
              <div className="relative options-menu-container">
                <button
                  onClick={() => setIsOptionsMenuOpen(!isOptionsMenuOpen)}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                  style={{ backgroundColor: '#4C1D95' }}
                  title="Options"
                >
                  <Icon name="ellipsis-vertical" size={16} className="mr-2" />
                  Options
                </button>

                {/* Options Dropdown Menu */}
                {isOptionsMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          handleCopyLink()
                          setIsOptionsMenuOpen(false)
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Icon name="link" size={16} className="mr-3" />
                        Copy Link
                      </button>
                      
                      <button
                        onClick={() => {
                          handleEdit()
                          setIsOptionsMenuOpen(false)
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Icon name="pencil" size={16} className="mr-3" />
                        Edit Risk
                      </button>
                      
                      <button
                        onClick={() => {
                          handleExportPDF()
                          setIsOptionsMenuOpen(false)
                        }}
                        disabled={exportingPDF}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {exportingPDF ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-3"></div>
                            Exporting PDF...
                          </>
                        ) : (
                          <>
                            <Icon name="file-pdf" size={16} className="mr-3" />
                            Export PDF
                          </>
                        )}
                      </button>
                      
                      <div className="border-t border-gray-100 my-1"></div>
                      
                      <button
                        onClick={handleAddRiskToWorkshop}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Icon name="calendar-plus" size={16} className="mr-3" />
                        Add to workshop
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            {isEditing && (
              <>
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50"
                  style={{ backgroundColor: '#4C1D95' }}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Icon name="check" size={16} className="mr-2" />
                      Save
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Risk Statement - Prominent Display */}
        <div className="bg-gray-50 rounded-lg p-6 border-l-4 mb-8" style={{ borderLeftColor: '#4C1D95' }}>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Risk Statement</label>
          {isEditing ? (
            <textarea
              value={editedRisk?.riskStatement || ''}
              onChange={(e) => handleFieldChange('riskStatement', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={4}
              placeholder="Enter risk statement..."
            />
          ) : (
            <p className="text-gray-900 leading-relaxed text-base">{riskDetails.riskStatement}</p>
          )}
        </div>

        {/* Risk Assessment Section */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <div className="w-1 h-6 bg-purple-600 rounded-full mr-3"></div>
            <h3 className="text-lg font-semibold text-gray-900">Risk Assessment</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700">Risk Details</h4>
              </div>
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Risk Phase</span>
                  {isEditing ? (
                    <select
                      value={editedRisk?.currentPhase || ''}
                      onChange={(e) => handleFieldChange('currentPhase', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent mt-1"
                    >
                      <option value="">Select a phase</option>
                      {Object.values(RISK_PHASES).map((phase: string) => (
                        <option key={phase} value={phase}>
                          {phase}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="mt-1">
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(riskDetails.currentPhase)}`}>
                        {riskDetails.currentPhase || 'Not specified'}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Impact (CIA)</span>
                  {isEditing ? (
                    <div className="space-y-3 mt-2">
                      <p className="text-sm text-gray-600 mb-3">Select which CIA components are affected by this risk:</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <label className="relative flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-red-300 hover:bg-red-50 transition-all duration-200 group">
                          <input
                            type="checkbox"
                            id="edit-confidentiality-register"
                            checked={editedRisk?.impactCIA?.includes('Confidentiality')}
                            onChange={(e) => {
                              const currentCIA = editedRisk?.impactCIA?.split(', ').filter(item => item.trim() !== '') || []
                              const newCIA = e.target.checked
                                ? [...currentCIA, 'Confidentiality']
                                : currentCIA.filter(item => item !== 'Confidentiality')
                              handleFieldChange('impactCIA', newCIA.join(', '))
                            }}
                            className="sr-only"
                          />
                          <div className={`flex items-center justify-center w-5 h-5 border-2 rounded mr-3 transition-all duration-200 ${editedRisk?.impactCIA?.includes('Confidentiality')
                              ? 'bg-red-500 border-red-500'
                              : 'border-gray-300 group-hover:border-red-400'
                            }`}>
                            {editedRisk?.impactCIA?.includes('Confidentiality') && (
                              <Icon name="check" size={12} className="text-white" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">Confidentiality</div>
                            <div className="text-xs text-gray-500">Data privacy & access control</div>
                          </div>
                        </label>

                        <label className="relative flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 group">
                          <input
                            type="checkbox"
                            id="edit-integrity-register"
                            checked={editedRisk?.impactCIA?.includes('Integrity')}
                            onChange={(e) => {
                              const currentCIA = editedRisk?.impactCIA?.split(', ').filter(item => item.trim() !== '') || []
                              const newCIA = e.target.checked
                                ? [...currentCIA, 'Integrity']
                                : currentCIA.filter(item => item !== 'Integrity')
                              handleFieldChange('impactCIA', newCIA.join(', '))
                            }}
                            className="sr-only"
                          />
                          <div className={`flex items-center justify-center w-5 h-5 border-2 rounded mr-3 transition-all duration-200 ${editedRisk?.impactCIA?.includes('Integrity')
                              ? 'bg-orange-500 border-orange-500'
                              : 'border-gray-300 group-hover:border-orange-400'
                            }`}>
                            {editedRisk?.impactCIA?.includes('Integrity') && (
                              <Icon name="check" size={12} className="text-white" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">Integrity</div>
                            <div className="text-xs text-gray-500">Data accuracy & consistency</div>
                          </div>
                        </label>

                        <label className="relative flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group">
                          <input
                            type="checkbox"
                            id="edit-availability-register"
                            checked={editedRisk?.impactCIA?.includes('Availability')}
                            onChange={(e) => {
                              const currentCIA = editedRisk?.impactCIA?.split(', ').filter(item => item.trim() !== '') || []
                              const newCIA = e.target.checked
                                ? [...currentCIA, 'Availability']
                                : currentCIA.filter(item => item !== 'Availability')
                              handleFieldChange('impactCIA', newCIA.join(', '))
                            }}
                            className="sr-only"
                          />
                          <div className={`flex items-center justify-center w-5 h-5 border-2 rounded mr-3 transition-all duration-200 ${editedRisk?.impactCIA?.includes('Availability')
                              ? 'bg-blue-500 border-blue-500'
                              : 'border-gray-300 group-hover:border-blue-400'
                            }`}>
                            {editedRisk?.impactCIA?.includes('Availability') && (
                              <Icon name="check" size={12} className="text-white" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">Availability</div>
                            <div className="text-xs text-gray-500">System accessibility & uptime</div>
                          </div>
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {riskDetails.impactCIA ? (
                        (riskDetails.impactCIA?.split(', ').filter(item => item.trim() !== '') || []).map((cia: string, index: number) => {
                          const config = getCIAConfig(cia)
                          return (
                            <span
                              key={index}
                              className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${config.bg} ${config.text} ${config.border} transition-all duration-200 hover:scale-105`}
                            >
                              {cia}
                            </span>
                          )
                        })
                      ) : (
                        <span className="text-sm text-gray-500 italic">Not specified</span>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Risk Action</span>
                  {isEditing ? (
                    <select
                      value={editedRisk?.riskAction || ''}
                      onChange={(e) => handleFieldChange('riskAction', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select a risk action</option>
                      {Object.values(RISK_ACTIONS).map((action) => (
                        <option key={action} value={action}>
                          {action}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-sm text-gray-900 mt-1">{riskDetails.riskAction || 'Not specified'}</p>
                  )}
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Threat</span>
                  {isEditing ? (
                    <textarea
                      value={editedRisk?.threat || ''}
                      onChange={(e) => handleFieldChange('threat', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      rows={3}
                      placeholder="Enter threat description..."
                    />
                  ) : (
                    <p className="text-sm text-gray-900 mt-1">{riskDetails.threat}</p>
                  )}
                </div>

                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Vulnerability</span>
                  {isEditing ? (
                    <textarea
                      value={editedRisk?.vulnerability || ''}
                      onChange={(e) => handleFieldChange('vulnerability', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      rows={3}
                      placeholder="Enter vulnerability description..."
                    />
                  ) : (
                    <p className="text-sm text-gray-900 mt-1">{riskDetails.vulnerability}</p>
                  )}
                </div>

                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Raised By</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedRisk?.raisedBy || ''}
                      onChange={(e) => handleFieldChange('raisedBy', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter who raised the risk"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 mt-1">{riskDetails.raisedBy}</p>
                  )}
                </div>
              </div>
            </div>

                         <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-4">Risk Matrix</h4>
              
              {/* Risk Assessment Fields - Only visible when editing */}
              {isEditing && (
                <div className="mb-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Likelihood</span>
                      <select
                        value={editedRisk?.likelihoodRating || ''}
                        onChange={(e) => handleFieldChange('likelihoodRating', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Select likelihood</option>
                        <option value="Rare">Rare</option>
                        <option value="Unlikely">Unlikely</option>
                        <option value="Possible">Possible</option>
                        <option value="Likely">Likely</option>
                        <option value="Almost Certain">Almost Certain</option>
                      </select>
                    </div>
                    
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Consequence</span>
                      <select
                        value={editedRisk?.consequenceRating || ''}
                        onChange={(e) => handleFieldChange('consequenceRating', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Select consequence</option>
                        <option value="Insignificant">Insignificant</option>
                        <option value="Minor">Minor</option>
                        <option value="Moderate">Moderate</option>
                        <option value="Major">Major</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Residual Likelihood</span>
                      <select
                        value={editedRisk?.residualLikelihood || ''}
                        onChange={(e) => handleFieldChange('residualLikelihood', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Select likelihood</option>
                        <option value="Rare">Rare</option>
                        <option value="Unlikely">Unlikely</option>
                        <option value="Possible">Possible</option>
                        <option value="Likely">Likely</option>
                        <option value="Almost Certain">Almost Certain</option>
                      </select>
                    </div>
                    
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Residual Consequence</span>
                      <select
                        value={editedRisk?.residualConsequence || ''}
                        onChange={(e) => handleFieldChange('residualConsequence', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Select consequence</option>
                        <option value="Insignificant">Insignificant</option>
                        <option value="Minor">Minor</option>
                        <option value="Moderate">Moderate</option>
                        <option value="Major">Major</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
              
                             {riskDetails && (
                               <RiskMatrix
                                 currentRisk={memoizedCurrentRisk}
                                 residualRisk={memoizedResidualRisk}
                                 isEditing={false}
                                 compact={true}
                               />
                             )}
            </div>
          </div>
        </div>



        {/* Controls Section */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <div className="w-1 h-6 bg-indigo-600 rounded-full mr-3"></div>
            <h3 className="text-lg font-semibold text-gray-900">Controls</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Current Controls</h4>
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Current Controls</span>
                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => openControlModal('currentControls')}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100 transition-colors"
                        >
                          <Icon name="plus" size={12} className="mr-1" />
                          Add Control
                        </button>
                        <span className="text-xs text-gray-500">or type manually below</span>
                      </div>
                      <textarea
                        value={Array.isArray(editedRisk?.currentControls) ? editedRisk.currentControls.join('\n') : ''}
                        onChange={(e) => handleFieldChange('currentControls', e.target.value.split('\n').filter(line => line.trim() !== ''))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        rows={3}
                        placeholder="Enter current controls (one per line)..."
                      />
                    </div>
                  ) : (
                    <div className="text-sm text-gray-900 mt-1">
                      {Array.isArray(riskDetails.currentControls) && riskDetails.currentControls.length > 0 ? (
                        <ul className="list-disc list-inside space-y-1">
                          {riskDetails.currentControls.map((control, index) => (
                            <li key={index}>{control}</li>
                          ))}
                        </ul>
                      ) : (
                        'Not specified'
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Current Controls Reference</span>
                  <p className="text-xs text-gray-400 mt-1 mb-2">
                    Select controls from the SOA that are currently implemented or applicable to this risk
                  </p>
                  {isEditing ? (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => openControlModal('currentControlsReference')}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100 transition-colors"
                      >
                        <Icon name="plus" size={12} className="mr-1" />
                        Select SOA Controls
                      </button>
                      
                      {/* Display selected controls with titles */}
                      {Array.isArray(editedRisk?.currentControlsReference) && editedRisk.currentControlsReference.length > 0 && (
                        <div className="space-y-2 mt-3">
                          {editedRisk.currentControlsReference.map((controlRef, index) => {
                            const soaControl = getSOAControlDetails(controlRef)
                            return (
                              <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex-1">
                                  <div className="font-mono text-purple-600 text-sm">{controlRef}</div>
                                  {soaControl && (
                                    <div className="text-gray-700 text-xs mt-1">{soaControl.title}</div>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newControls = editedRisk.currentControlsReference.filter((_, i) => i !== index)
                                    handleFieldChange('currentControlsReference', newControls)
                                  }}
                                  className="text-red-500 hover:text-red-700 p-1"
                                  title="Remove control"
                                >
                                  <Icon name="x" size={14} />
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-900 mt-1">
                      {Array.isArray(riskDetails.currentControlsReference) && riskDetails.currentControlsReference.length > 0 ? (
                        <ul className="list-disc list-inside space-y-1">
                          {riskDetails.currentControlsReference.map((controlRef, index) => {
                            const soaControl = getSOAControlDetails(controlRef)
                            return (
                              <li key={index}>
                                <span className="font-mono text-purple-600">{controlRef}</span>
                                {soaControl && (
                                  <span className="text-gray-600 ml-2">- {soaControl.title}</span>
                                )}
                              </li>
                            )
                          })}
                        </ul>
                      ) : (
                        'Not specified'
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Post-Treatment Controls</h4>
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Applicable Controls After Treatment</span>
                  <p className="text-xs text-gray-400 mt-1 mb-2">
                    Select controls from the SOA that will be applicable after implementing risk treatments
                  </p>
                  {isEditing ? (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => openControlModal('applicableControlsAfterTreatment')}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100 transition-colors"
                      >
                        <Icon name="plus" size={12} className="mr-1" />
                        Select SOA Controls
                      </button>
                      
                      {/* Display selected controls with titles */}
                      {Array.isArray(editedRisk?.applicableControlsAfterTreatment) && editedRisk.applicableControlsAfterTreatment.length > 0 && (
                        <div className="space-y-2 mt-3">
                          {editedRisk.applicableControlsAfterTreatment.map((controlRef, index) => {
                            const soaControl = getSOAControlDetails(controlRef)
                            return (
                              <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex-1">
                                  <div className="font-mono text-purple-600 text-sm">{controlRef}</div>
                                  {soaControl && (
                                    <div className="text-gray-700 text-xs mt-1">{soaControl.title}</div>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newControls = editedRisk.applicableControlsAfterTreatment.filter((_, i) => i !== index)
                                    handleFieldChange('applicableControlsAfterTreatment', newControls)
                                  }}
                                  className="text-red-500 hover:text-red-700 p-1"
                                  title="Remove control"
                                >
                                  <Icon name="x" size={14} />
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-900 mt-1">
                      {Array.isArray(riskDetails.applicableControlsAfterTreatment) && riskDetails.applicableControlsAfterTreatment.length > 0 ? (
                        <ul className="list-disc list-inside space-y-1">
                          {riskDetails.applicableControlsAfterTreatment.map((controlRef, index) => {
                            const soaControl = getSOAControlDetails(controlRef)
                            return (
                              <li key={index}>
                                <span className="font-mono text-purple-600">{controlRef}</span>
                                {soaControl && (
                                  <span className="text-gray-600 ml-2">- {soaControl.title}</span>
                                )}
                              </li>
                            )
                          })}
                        </ul>
                      ) : (
                        'Not specified'
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ownership & Asset Section */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <div className="w-1 h-6 bg-blue-600 rounded-full mr-3"></div>
            <h3 className="text-lg font-semibold text-gray-900">Ownership & Asset</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Primary Contact</h4>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Risk Owner</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedRisk?.riskOwner || ''}
                      onChange={(e) => handleFieldChange('riskOwner', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter risk owner"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 mt-1 font-medium">{riskDetails.riskOwner}</p>
                  )}
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Functional Unit</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedRisk?.functionalUnit || ''}
                      onChange={(e) => handleFieldChange('functionalUnit', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter functional unit"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 mt-1">{riskDetails.functionalUnit}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Affected Assets</h4>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Information Assets</span>
                  {isEditing ? (
                    <div>
                      <button
                        type="button"
                        onClick={openAssetModal}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left hover:bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            {selectedInformationAssets.length > 0 ? (
                              <div className="text-sm text-gray-900">
                                {selectedInformationAssets.length} asset{selectedInformationAssets.length !== 1 ? 's' : ''} selected
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500">Click to select information assets</div>
                            )}
                          </div>
                          <Icon name="chevron-right" size={16} className="text-gray-400" />
                        </div>
                      </button>
                      {selectedInformationAssets.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs text-gray-600 mb-1">Selected assets:</div>
                          <div className="flex flex-wrap gap-1">
                            {selectedInformationAssets.map(assetId => {
                              const asset = informationAssets.find(a => a.id === assetId)
                              return (
                                <span
                                  key={assetId}
                                  className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-purple-100 text-purple-800"
                                >
                                  {asset?.informationAsset || assetId}
                                </span>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-1">
                      {riskDetails.informationAssets ? (
                        <div className="flex flex-wrap gap-2">
                          {riskDetails.informationAssets.split(', ').map((assetName, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                            >
                              {assetName.trim()}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No information assets specified</p>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Affected Sites</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedRisk?.affectedSites || ''}
                      onChange={(e) => handleFieldChange('affectedSites', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter affected sites"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 mt-1">{riskDetails.affectedSites}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Tracking</h4>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">JIRA Ticket</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedRisk?.jiraTicket || ''}
                      onChange={(e) => handleFieldChange('jiraTicket', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
                      placeholder="e.g., RISK-123"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 mt-1 font-mono">{riskDetails.jiraTicket}</p>
                  )}
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Date Risk Raised</span>
                  {isEditing ? (
                    <input
                      type="date"
                      value={toDateInputValue(editedRisk?.dateRiskRaised)}
                      onChange={(e) => handleFieldChange('dateRiskRaised', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="mt-1">
                      <span className="text-sm font-medium text-gray-900">{formatDate(riskDetails.dateRiskRaised)}</span>
                      {getRelativeTime(riskDetails.dateRiskRaised) && (
                        <p className="text-xs text-gray-500 mt-1">{getRelativeTime(riskDetails.dateRiskRaised)}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>



        {/* Approvals & Dates Section */}
        <div>
          <div className="flex items-center mb-6">
            <div className="w-1 h-6 bg-green-600 rounded-full mr-3"></div>
            <h3 className="text-lg font-semibold text-gray-900">Approvals & Dates</h3>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide block mb-2">Date of SSC Approval</span>
                {isEditing ? (
                  <input
                    type="date"
                    value={toDateInputValue(editedRisk?.dateOfSSCApproval)}
                    onChange={(e) => handleFieldChange('dateOfSSCApproval', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-900">{formatDate(riskDetails.dateOfSSCApproval)}</p>
                    {getRelativeTime(riskDetails.dateOfSSCApproval) && (
                      <p className="text-xs text-gray-500 mt-1">{getRelativeTime(riskDetails.dateOfSSCApproval)}</p>
                    )}
                  </>
                )}
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide block mb-2">Date Risk Treatments Approved</span>
                {isEditing ? (
                  <input
                    type="date"
                    value={toDateInputValue(editedRisk?.dateRiskTreatmentsApproved)}
                    onChange={(e) => handleFieldChange('dateRiskTreatmentsApproved', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-900">{formatDate(riskDetails.dateRiskTreatmentsApproved)}</p>
                    {getRelativeTime(riskDetails.dateRiskTreatmentsApproved) && (
                      <p className="text-xs text-gray-500 mt-1">{getRelativeTime(riskDetails.dateRiskTreatmentsApproved)}</p>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide block mb-2">Date Residual Risk Accepted</span>
                {isEditing ? (
                  <input
                    type="date"
                    value={toDateInputValue(editedRisk?.dateResidualRiskAccepted)}
                    onChange={(e) => handleFieldChange('dateResidualRiskAccepted', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-900">{formatDate(riskDetails.dateResidualRiskAccepted)}</p>
                    {getRelativeTime(riskDetails.dateResidualRiskAccepted) && (
                      <p className="text-xs text-gray-500 mt-1">{getRelativeTime(riskDetails.dateResidualRiskAccepted)}</p>
                    )}
                  </>
                )}
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide block mb-2">Residual Risk Accepted By</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedRisk?.residualRiskAcceptedByOwner || ''}
                    onChange={(e) => handleFieldChange('residualRiskAcceptedByOwner', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter name"
                  />
                ) : (
                  <p className="text-sm text-gray-900">{riskDetails.residualRiskAcceptedByOwner || 'Not specified'}</p>
                )}
              </div>
            </div>
            {/* Only show Reason for Acceptance if Risk Action is "Accept" */}
            {(isEditing ? editedRisk?.riskAction === 'Accept' : riskDetails.riskAction === 'Accept') && (
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide block mb-2">Reason for Acceptance</span>
                {isEditing ? (
                  <textarea
                    value={editedRisk?.reasonForAcceptance || ''}
                    onChange={(e) => handleFieldChange('reasonForAcceptance', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Enter reason for acceptance..."
                  />
                ) : (
                  <p className="text-sm text-gray-900">{riskDetails.reasonForAcceptance || 'Not specified'}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Risk Treatments DataTable */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
              <Icon name="bandage" size={20} className="text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Risk Treatments</h3>
              <p className="text-sm text-gray-500">
                {treatments.length} treatment{treatments.length !== 1 ? 's' : ''} for this risk
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 rounded-lg">
              <Icon name="check-circle" size={16} className="text-green-500" />
              <span className="text-sm font-medium text-green-700">
                {treatments.filter(t => t.completionDate).length} completed
              </span>
            </div>
            <div className="flex items-center space-x-2 px-3 py-2 bg-orange-50 rounded-lg">
              <Icon name="hourglass-half" size={16} className="text-orange-500" />
              <span className="text-sm font-medium text-orange-700">
                {treatments.filter(t => !t.completionDate).length} pending
              </span>
            </div>
            <Link
              href={`/risk-management/treatments/${validateRiskId(params.id)}/new`}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                backgroundColor: '#4C1D95',
                '--tw-ring-color': '#4C1D95'
              } as React.CSSProperties}
            >
              <Icon name="plus" size={16} className="mr-2" />
              Add Treatment
            </Link>
          </div>
        </div>

        {treatments.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="list-check" size={48} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No treatments found for this risk</p>
            <p className="text-sm text-gray-400 mt-1">Treatments will appear here once they are added</p>
          </div>
        ) : (
          <DataTable
            data={treatments}
            columns={[
              { key: 'riskTreatment', label: 'Risk Treatment', sortable: true, width: 'auto' },
              { key: 'actions', label: 'Add to Workshop Agenda', sortable: false, width: '180px', align: 'center' as const },
              { key: 'treatmentId', label: 'Treatment ID', sortable: true, width: '140px' },
              { key: 'treatmentJira', label: 'Jira Ticket', sortable: true, width: '160px' },
              { key: 'riskTreatmentOwner', label: 'Risk Treatment Owner', sortable: true, width: '180px' },
              { key: 'dateRiskTreatmentDue', label: 'Date Risk Treatment Due', sortable: true, width: '160px' },
              { key: 'extendedDueDate', label: 'Extended Due Date', sortable: true, width: '160px' },
              { key: 'numberOfExtensions', label: 'Number of Extensions', sortable: true, width: '140px' },
              { key: 'completionDate', label: 'Completion Date', sortable: true, width: '150px' },
              { key: 'closureApproval', label: 'Closure Approval', sortable: true, width: '140px' },
              { key: 'closureApprovedBy', label: 'Closure Approved by', sortable: true, width: '160px' },
            ].map(col => ({
              ...col,
              render: (value: any, row: any) => {
                if (col.key === 'treatmentId') {
                  return (
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {value}
                    </span>
                  )
                }
                if (col.key === 'treatmentJira') {
                  if (!value || value === 'Not specified') {
                    return <span className="text-gray-400">-</span>
                  }
                  return (
                    <a
                      href={value}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
                    >
                      <Icon name="link" size={12} className="mr-1" />
                      {value.split('/').pop() || value}
                    </a>
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
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTreatmentStatusColor(value)}`}>
                      {value}
                    </span>
                  )
                }
                if (col.key === 'dateRiskTreatmentDue' || col.key === 'extendedDueDate' || col.key === 'completionDate') {
                  if (!value) return <span className="text-gray-400">-</span>
                  return <span className="text-sm font-medium">{formatDate(value)}</span>
                }
                if (col.key === 'actions') {
                  const isApproved = row.closureApproval === 'Approved'
                  return (
                    <div className="flex items-center justify-center">
                      <Tooltip content={isApproved ? "Cannot add approved treatments to agenda" : "Add to Workshop Agenda"}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (!isApproved) {
                              handleAddTreatmentToWorkshop(row)
                            }
                          }}
                          disabled={isApproved}
                          className={`inline-flex items-center justify-center w-8 h-8 text-xs font-medium border rounded transition-colors ${
                            isApproved
                              ? 'text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed'
                              : 'text-purple-600 bg-purple-50 border-purple-200 hover:bg-purple-100'
                          }`}
                        >
                          <Icon name="calendar-plus" size={12} />
                        </button>
                      </Tooltip>
                    </div>
                  )
                }
                // Implement responsive content display
                const cellValue = value ? String(value) : '-'
                return (
                  <Tooltip content={cellValue} theme="dark">
                    <span className="block break-words w-full">
                      {cellValue}
                    </span>
                  </Tooltip>
                )
              }
            }))}
            onRowClick={(row: any) => {
              const treatmentUrl = `/risk-management/treatments/${validateRiskId(params.id)}/${row.treatmentId}`
              window.location.href = treatmentUrl
            }}
            onExportCSV={() => { }}
            selectable={true}
          />
        )}
      </div>

      {/* Floating Draggable Comments Button */}
      {!isEditing && (
        <div
          className="fixed z-50 cursor-move select-none"
          style={{
            right: '20px',
            top: `${floatingButtonPosition.y}px`,
            transform: isDragging ? 'scale(1.1)' : 'scale(1)',
            transition: isDragging ? 'none' : 'transform 0.2s ease-in-out'
          }}
          onMouseDown={(e) => {
            e.preventDefault()

            const startY = e.clientY
            const startTop = floatingButtonPosition.y
            let hasMoved = false
            const moveThreshold = 5 // pixels

            const handleMouseMove = (e: MouseEvent) => {
              const deltaY = Math.abs(e.clientY - startY)

              // Only start dragging if mouse has moved beyond threshold
              if (deltaY > moveThreshold && !hasMoved) {
                hasMoved = true
                setIsDragging(true)
              }

              if (hasMoved) {
                const newY = Math.max(20, Math.min(window.innerHeight - 100, startTop + (e.clientY - startY)))
                setFloatingButtonPosition(prev => ({ ...prev, y: newY }))
              }
            }

            const handleMouseUp = () => {
              setIsDragging(false)
              document.removeEventListener('mousemove', handleMouseMove)
              document.removeEventListener('mouseup', handleMouseUp)
            }

            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
          }}
        >
          <div className="relative">
            <button
              onClick={() => setIsCommentSidebarOpen(true)}
              className="flex items-center justify-center w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              style={{ backgroundColor: '#4C1D95' }}
              title="Open comments"
            >
              <Icon name="comments" size={24} className="text-white" />
            </button>
            {commentCount > 0 && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg">
                {commentCount > 99 ? '99+' : commentCount}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Information Assets Selection Modal */}
      {showAssetModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Icon name="file" size={20} className="text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Select Information Assets</h3>
              </div>
              <button onClick={closeAssetModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <Icon name="x" size={20} />
              </button>
            </div>
            {/* Search Input */}
            <div className="p-6 border-b border-gray-200">
              <div className="relative">
                <Icon name="magnifying-glass" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search assets by name or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Alphabet Filter */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setSelectedLetter('')}
                  className={`px-2 py-1 text-xs font-medium rounded transition-colors ${selectedLetter === ''
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  All
                </button>
                {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map((letter) => (
                  <button
                    key={letter}
                    onClick={() => setSelectedLetter(selectedLetter === letter ? '' : letter)}
                    className={`px-2 py-1 text-xs font-medium rounded transition-colors ${selectedLetter === letter
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {letter}
                  </button>
                ))}
              </div>
            </div>

            {/* Assets List */}
            <div className="flex-1 overflow-y-auto p-6">
              {filteredAssets.length === 0 ? (
                <div className="text-center py-8">
                  <Icon name="magnifying-glass" size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">
                    {searchTerm ? 'No assets found matching your search.' : 'No information assets available.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredAssets.map((asset) => (
                    <label
                      key={asset.id}
                      className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={tempSelectedAssets.includes(asset.id)}
                        onChange={(e) => handleAssetSelection(asset.id, e.target.checked)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{asset.informationAsset}</div>
                        <div className="text-xs text-gray-500">{asset.category}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                {tempSelectedAssets.length} asset{tempSelectedAssets.length !== 1 ? 's' : ''} selected
              </div>
              <div className="flex space-x-3">
                <button onClick={closeAssetModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button onClick={applyAssetSelection} className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors">
                  Apply Selection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SOA Controls Selection Modal */}
      {showControlModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Icon name="shield-check" size={20} className="text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {controlModalType === 'currentControls' ? 'Add Current Controls' : 
                   controlModalType === 'currentControlsReference' ? 'Select SOA Controls Reference' : 
                   'Select Applicable Controls After Treatment'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {controlModalType === 'currentControls' ? 'Add controls that are currently implemented' :
                   controlModalType === 'currentControlsReference' ? 'Select controls from the SOA to reference as current controls' :
                   'Select controls from the SOA that will be applicable after treatment'}
                </p>
              </div>
              <button onClick={closeControlModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <Icon name="x" size={20} />
              </button>
            </div>

            {/* Search and Filter Controls */}
            <div className="p-6 border-b border-gray-200 space-y-4">
              <div className="relative">
                <Icon name="magnifying-glass" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search controls by ID (e.g., A.5.1), title, or description..."
                  value={controlSearchTerm}
                  onChange={(e) => setControlSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700">Control Set:</span>
                <button
                  onClick={() => setSelectedControlSet('')}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${selectedControlSet === ''
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  All Sets
                </button>
                {getUniqueControlSets().map((setId) => (
                  <button
                    key={setId}
                    onClick={() => setSelectedControlSet(selectedControlSet === setId ? '' : setId)}
                    className={`px-3 py-1 text-xs font-medium rounded transition-colors ${selectedControlSet === setId
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {setId}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Controls Summary */}
            {tempSelectedControls.length > 0 && (
              <div className="px-6 py-3 bg-purple-50 border-b border-purple-200">
                <div className="text-sm font-medium text-purple-800 mb-2">
                  Selected Controls ({tempSelectedControls.length}):
                </div>
                <div className="flex flex-wrap gap-2">
                  {tempSelectedControls.map((controlId) => {
                    const control = filteredSOAControls.find(c => c.id === controlId)
                    return (
                      <span
                        key={controlId}
                        className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                      >
                        <span className="font-mono mr-1">{controlId}</span>
                        {control && <span className="text-purple-600">- {control.title}</span>}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Controls List */}
            <div className="flex-1 overflow-y-auto p-6">
              {filteredSOAControls.length === 0 ? (
                <div className="text-center py-8">
                  <Icon name="magnifying-glass" size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">
                    {controlSearchTerm || selectedControlSet ? 'No controls found matching your criteria.' : 'No SOA controls available.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredSOAControls.map((control) => (
                    <div
                      key={control._id}
                      className="flex items-start space-x-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      {controlModalType === 'currentControls' ? (
                        // For current controls, show an "Add" button instead of checkbox
                        <button
                          onClick={() => addCurrentControl(control.id)}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors"
                        >
                          <Icon name="plus" size={12} className="mr-1" />
                          Add
                        </button>
                      ) : (
                        // For other control types, show checkbox
                        <input
                          type="checkbox"
                          checked={tempSelectedControls.includes(control.id)}
                          onChange={(e) => handleControlSelection(control.id, e.target.checked)}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mt-1"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-mono text-sm font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded">
                            {control.id}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            control.controlStatus === 'Implemented' ? 'bg-green-100 text-green-800' :
                            control.controlStatus === 'Partially Implemented' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {control.controlStatus}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            control.controlApplicability === 'Applicable' ? 'bg-blue-100 text-blue-800' :
                            control.controlApplicability === 'Not Applicable' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {control.controlApplicability}
                          </span>
                        </div>
                        <div className="text-sm font-medium text-gray-900 mb-1">{control.title}</div>
                        <div className="text-xs text-gray-600">{control.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                {controlModalType === 'currentControls' ? (
                  'Click "Add" button next to each control to add it to current controls'
                ) : (
                  `${tempSelectedControls.length} control${tempSelectedControls.length !== 1 ? 's' : ''} selected`
                )}
              </div>
              <div className="flex space-x-3">
                <button onClick={closeControlModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  {controlModalType === 'currentControls' ? 'Close' : 'Cancel'}
                </button>
                {controlModalType !== 'currentControls' && (
                  <button onClick={applyControlSelection} className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors">
                    Apply Selection
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comment Sidebar */}
      <CommentSidebar
        isOpen={isCommentSidebarOpen}
        onClose={() => setIsCommentSidebarOpen(false)}
        riskId={validateRiskId(params.id) || ''}
        onCommentCountChange={setCommentCount}
      />

      {/* Workshop Selection Modal */}
      <WorkshopSelectionModal
        isOpen={isWorkshopModalOpen}
        onClose={handleCloseWorkshopModal}
        risk={riskDetails ? {
          riskId: riskDetails.riskId,
          currentPhase: riskDetails.currentPhase
        } : null}
        treatment={selectedTreatmentForWorkshop ? {
          treatmentId: selectedTreatmentForWorkshop.treatmentId,
          riskId: selectedTreatmentForWorkshop.riskId || riskDetails?.riskId || ''
        } : undefined}
      />
    </div>
  )
} 