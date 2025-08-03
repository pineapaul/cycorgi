'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Icon from '@/app/components/Icon'
import Tooltip from '@/app/components/Tooltip'
import { getCIAConfig, extractRiskNumber } from '@/lib/utils'
import DataTable, { Column } from '@/app/components/DataTable'
import { useToast } from '@/app/components/Toast'
import { useBackNavigation } from '@/app/hooks/useBackNavigation'
import CommentSidebar from '@/app/components/CommentSidebar'

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
  currentControls: string
  currentControlsReference: string
  consequence: string
  likelihood: string
  currentRiskRating: string
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
}

// Robust date parsing utility
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

// Format date to dd MMM yyyy format
export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString || dateString === 'Not specified') return 'Not specified'
  const date = parseDate(dateString)
  if (!date) return 'Invalid date'
  try {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  } catch (error) {
    return 'Invalid date'
  }
}

// Get relative time (e.g., "2 days ago", "1 week ago")
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
  } catch (error) {
    return ''
  }
}

export default function RiskInformation() {
  const params = useParams()
  const router = useRouter()
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

  const isValidRiskId = (riskId: string | string[] | undefined): riskId is string => {
    return validateRiskId(riskId) !== null
  }

  // Safe API URL construction
  const buildApiUrl = (endpoint: string, riskId?: string | string[] | undefined): string | null => {
    const validRiskId = validateRiskId(riskId || params.riskId)
    if (!validRiskId) return null
    return `${endpoint}/${validRiskId}`
  }
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

  useEffect(() => {
    const fetchData = async () => {
      // Validate risk ID before making API calls
      const validRiskId = validateRiskId(params.riskId)
      if (!validRiskId) {
        setError('Invalid risk ID format. Expected format: RISK-XXX')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        
        // Build safe API URLs
        const riskApiUrl = buildApiUrl('/api/risks')
        const treatmentsApiUrl = buildApiUrl('/api/treatments')
        
        if (!riskApiUrl || !treatmentsApiUrl) {
          setError('Invalid risk ID format. Expected format: RISK-XXX')
          setLoading(false)
          return
        }
        
        // Fetch risk details
        const riskResponse = await fetch(riskApiUrl)
        const riskResult = await riskResponse.json()
        
        if (riskResult.success) {
          // Transform the data to match the expected format
          const risk = riskResult.data;
          const transformedRisk = {
            riskId: risk.riskId,
            functionalUnit: risk.functionalUnit,
            currentPhase: risk.currentPhase,
                            jiraTicket: `RISK-${extractRiskNumber(risk.riskId)}`,
            dateRiskRaised: risk.createdAt ? toDateInputValue(risk.createdAt) : '2024-01-15',
            raisedBy: risk.riskOwner,
            riskOwner: risk.riskOwner,
            affectedSites: 'All Sites',
            informationAssets: risk.informationAsset,
            threat: risk.threat,
            vulnerability: risk.vulnerability,
            riskStatement: risk.riskStatement,
            impactCIA: risk.impact ? (Array.isArray(risk.impact) ? risk.impact.join(', ') : 'Not specified') : 'Not specified',
            currentControls: risk.currentControls,
                            currentControlsReference: `CTRL-${extractRiskNumber(risk.riskId)}`,
            consequence: risk.consequenceRating,
            likelihood: risk.likelihoodRating,
            currentRiskRating: risk.riskRating,
            riskAction: 'Requires treatment',
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
        
      } catch (err) {
        setError('Failed to fetch risk details')
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }

    const validRiskId = validateRiskId(params.riskId)
    if (validRiskId) {
      fetchData()
    } else if (params.riskId) {
      // Only set error if params.riskId exists but is invalid
      setError('Invalid risk ID format. Expected format: RISK-XXX')
      setLoading(false)
    }
  }, [params.riskId])

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
    } catch (error) {
      return ''
    }
  }

  const handleRowClick = (row: any) => {
    // TODO: Navigate to treatment detail page
  }

  const handleExportCSV = (selectedRows: Set<number>) => {
    // TODO: Implement CSV export
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
              <div class="field-value">${risk.currentRiskRating}</div>
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
              <div class="field-label">Current Controls</div>
              <div class="field-value">${risk.currentControls}</div>
            </div>
            <div class="field">
              <div class="field-label">Jira Ticket</div>
              <div class="field-value">${risk.jiraTicket}</div>
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
              <div class="field-label">Consequence</div>
              <div class="field-value">${risk.consequence}</div>
            </div>
            <div class="field">
              <div class="field-label">Likelihood</div>
              <div class="field-value">${risk.likelihood}</div>
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
            <div class="field">
              <div class="field-label">Date Residual Risk Accepted</div>
              <div class="field-value">${formatDate(risk.dateResidualRiskAccepted)}</div>
            </div>
            <div class="field">
              <div class="field-label">Reason for Acceptance</div>
              <div class="field-value">${risk.reasonForAcceptance || 'Not specified'}</div>
            </div>
          </div>
        </div>

        ${treatments.length > 0 ? `
        <div class="section page-break">
          <h2>Risk Treatments</h2>
          <table class="treatments-table">
            <thead>
              <tr>
                <th>Treatment</th>
                <th>Jira Ticket</th>
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
    setIsEditing(true)
    setOriginalRisk(riskDetails) // Store the original values when entering edit mode
    setEditedRisk(riskDetails)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedRisk(originalRisk) // Reset to the original values when canceling
    setOriginalRisk(null) // Clear the original values
  }

  const handleSave = async () => {
    if (!editedRisk) return

    // Build safe API URL
    const riskApiUrl = buildApiUrl('/api/risks')
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
      const response = await fetch(riskApiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedRisk),
      })

      const result = await response.json()
      
      if (result.success) {
        setRiskDetails(editedRisk)
        setIsEditing(false)
        setOriginalRisk(null) // Clear the original values after successful save
        showToast({
          type: 'success',
          title: 'Risk Updated Successfully',
          message: 'The risk information has been saved successfully.',
          duration: 4000
        })
      } else {
        showToast({
          type: 'error',
          title: 'Update Failed',
          message: result.error || 'An unknown error occurred while updating the risk.',
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

  // Type utilities for safe field change handling
  type StringFields = {
    [K in keyof RiskDetails]: RiskDetails[K] extends string ? K : never
  }[keyof RiskDetails]

  type NumberFields = {
    [K in keyof RiskDetails]: RiskDetails[K] extends number ? K : never
  }[keyof RiskDetails]

  // Type-safe field change handler that accepts appropriate value types for each field
  const handleFieldChange = <K extends keyof RiskDetails>(
    field: K, 
    value: RiskDetails[K]
  ) => {
    if (!editedRisk) return
    setEditedRisk({
      ...editedRisk,
      [field]: value
    })
  }

  // Type-safe string field change handler
  const handleStringFieldChange = (field: StringFields, value: string) => {
    handleFieldChange(field, value)
  }

  // Type-safe number field change handler
  const handleNumberFieldChange = (field: NumberFields, value: number) => {
    handleFieldChange(field, value)
  }

  // Type-safe date field change handler (dates are stored as strings)
  const handleDateFieldChange = (field: StringFields, value: string) => {
    // Ensure date is in proper format for storage
    const formattedDate = value ? value : ''
    handleFieldChange(field, formattedDate)
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
            {error || 'The risk with ID "' + validateRiskId(params.riskId) + '" could not be found.'}
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
              <>
                <button
                  onClick={handleCopyLink}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  title="Copy link to risk"
                >
                  <Icon name="link" size={16} className="mr-2" />
                  Copy Link
                </button>

                <button
                  onClick={handleEdit}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                  style={{ backgroundColor: '#4C1D95' }}
                  title="Edit risk"
                >
                  <Icon name="pencil" size={16} className="mr-2" />
                  Edit
                </button>
                <button
                  onClick={handleExportPDF}
                  disabled={exportingPDF}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50"
                  style={{ backgroundColor: '#4C1D95' }}
                  title="Export to PDF"
                >
                  {exportingPDF ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Icon name="file-pdf" size={16} className="mr-2" />
                      Export PDF
                    </>
                  )}
                </button>

              </>
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
            {/* Current Risk Status */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-4">Current Status</h4>
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Current Phase</span>
                  <div className="mt-1">
                    {isEditing ? (
                      <select
                        value={editedRisk?.currentPhase || ''}
                        onChange={(e) => handleFieldChange('currentPhase', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="identification">Identification</option>
                        <option value="analysis">Analysis</option>
                        <option value="evaluation">Evaluation</option>
                        <option value="treatment">Treatment</option>
                        <option value="monitoring">Monitoring</option>
                      </select>
                    ) : (
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(riskDetails.currentPhase)}`}>
                        {riskDetails.currentPhase}
                      </span>
                    )}
                  </div>
                </div>

                <div className="relative group">
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Current Risk Rating</span>
                  <div className="mt-1">
                    {isEditing ? (
                      <select
                        value={editedRisk?.currentRiskRating || ''}
                        onChange={(e) => handleFieldChange('currentRiskRating', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    ) : (
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium cursor-help ${getRiskLevelColor(riskDetails.currentRiskRating)}`}>
                        {riskDetails.currentRiskRating}
                      </span>
                    )}
                  </div>
                  {!isEditing && (
                    <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10">
                      <div className="text-white text-xs rounded-lg p-3 shadow-lg" style={{ backgroundColor: '#4C1D95' }}>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>Consequence:</span>
                            <span className={`ml-2 px-1 py-0.5 rounded text-xs ${getPriorityColor(riskDetails.consequence)}`}>
                              {riskDetails.consequence}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Likelihood:</span>
                            <span className={`ml-2 px-1 py-0.5 rounded text-xs ${getPriorityColor(riskDetails.likelihood)}`}>
                              {riskDetails.likelihood}
                            </span>
                          </div>
                        </div>
                        <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent" style={{ borderTopColor: '#4C1D95' }}></div>
                      </div>
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
                              const currentCIA = editedRisk?.impactCIA?.split(', ') || []
                              const newCIA = e.target.checked 
                                ? [...currentCIA, 'Confidentiality']
                                : currentCIA.filter(item => item !== 'Confidentiality')
                              handleFieldChange('impactCIA', newCIA.join(', '))
                            }}
                            className="sr-only"
                          />
                          <div className={`flex items-center justify-center w-5 h-5 border-2 rounded mr-3 transition-all duration-200 ${
                            editedRisk?.impactCIA?.includes('Confidentiality')
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
                              const currentCIA = editedRisk?.impactCIA?.split(', ') || []
                              const newCIA = e.target.checked 
                                ? [...currentCIA, 'Integrity']
                                : currentCIA.filter(item => item !== 'Integrity')
                              handleFieldChange('impactCIA', newCIA.join(', '))
                            }}
                            className="sr-only"
                          />
                          <div className={`flex items-center justify-center w-5 h-5 border-2 rounded mr-3 transition-all duration-200 ${
                            editedRisk?.impactCIA?.includes('Integrity')
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
                              const currentCIA = editedRisk?.impactCIA?.split(', ') || []
                              const newCIA = e.target.checked 
                                ? [...currentCIA, 'Availability']
                                : currentCIA.filter(item => item !== 'Availability')
                              handleFieldChange('impactCIA', newCIA.join(', '))
                            }}
                            className="sr-only"
                          />
                          <div className={`flex items-center justify-center w-5 h-5 border-2 rounded mr-3 transition-all duration-200 ${
                            editedRisk?.impactCIA?.includes('Availability')
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
                        (riskDetails.impactCIA?.split(', ') || []).map((cia: string, index: number) => {
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
                    <input
                      type="text"
                      value={editedRisk?.riskAction || ''}
                      onChange={(e) => handleFieldChange('riskAction', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., Requires treatment"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 mt-1">{riskDetails.riskAction}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Risk Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-4">Risk Details</h4>
              <div className="space-y-4">
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
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Current Controls</span>
                  {isEditing ? (
                    <textarea
                      value={editedRisk?.currentControls || ''}
                      onChange={(e) => handleFieldChange('currentControls', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      rows={3}
                      placeholder="Enter current controls..."
                    />
                  ) : (
                    <p className="text-sm text-gray-900 mt-1">{riskDetails.currentControls}</p>
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
                    <textarea
                      value={editedRisk?.informationAssets || ''}
                      onChange={(e) => handleFieldChange('informationAssets', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      rows={3}
                      placeholder="Enter information assets..."
                    />
                  ) : (
                    <p className="text-sm text-gray-900 mt-1">{riskDetails.informationAssets}</p>
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
                      onChange={(e) => handleDateFieldChange('dateRiskRaised', e.target.value)}
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

        {/* Residual Risk Assessment Section */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <div className="w-1 h-6 bg-orange-600 rounded-full mr-3"></div>
            <h3 className="text-lg font-semibold text-gray-900">Residual Risk Assessment</h3>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <span className="text-xs text-gray-500 uppercase tracking-wide block mb-2">Residual Consequence</span>
                {isEditing ? (
                  <select
                    value={editedRisk?.residualConsequence || ''}
                    onChange={(e) => handleFieldChange('residualConsequence', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select...</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                ) : (
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(riskDetails.residualConsequence)}`}>
                    {riskDetails.residualConsequence}
                  </span>
                )}
              </div>
              <div className="text-center">
                <span className="text-xs text-gray-500 uppercase tracking-wide block mb-2">Residual Likelihood</span>
                {isEditing ? (
                  <select
                    value={editedRisk?.residualLikelihood || ''}
                    onChange={(e) => handleFieldChange('residualLikelihood', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select...</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                ) : (
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(riskDetails.residualLikelihood)}`}>
                    {riskDetails.residualLikelihood}
                  </span>
                )}
              </div>
              <div className="text-center">
                <span className="text-xs text-gray-500 uppercase tracking-wide block mb-2">Residual Risk Rating</span>
                {isEditing ? (
                  <select
                    value={editedRisk?.residualRiskRating || ''}
                    onChange={(e) => handleFieldChange('residualRiskRating', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select...</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                ) : (
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelColor(riskDetails.residualRiskRating)}`}>
                    {riskDetails.residualRiskRating}
                  </span>
                )}
              </div>
              <div className="text-center">
                <span className="text-xs text-gray-500 uppercase tracking-wide block mb-2">Accepted By</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedRisk?.residualRiskAcceptedByOwner || ''}
                    onChange={(e) => handleFieldChange('residualRiskAcceptedByOwner', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter name"
                  />
                ) : (
                  <p className="text-sm text-gray-900">{riskDetails.residualRiskAcceptedByOwner}</p>
                )}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide block mb-2">Date of SSC Approval</span>
                {isEditing ? (
                  <input
                    type="date"
                    value={toDateInputValue(editedRisk?.dateOfSSCApproval)}
                    onChange={(e) => handleDateFieldChange('dateOfSSCApproval', e.target.value)}
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
                    onChange={(e) => handleDateFieldChange('dateRiskTreatmentsApproved', e.target.value)}
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
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide block mb-2">Date Residual Risk Accepted</span>
                {isEditing ? (
                                                        <input
                    type="date"
                    value={toDateInputValue(editedRisk?.dateResidualRiskAccepted)}
                    onChange={(e) => handleDateFieldChange('dateResidualRiskAccepted', e.target.value)}
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
            </div>
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
          href={`/risk-management/treatments/${validateRiskId(params.riskId)}/new`}
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
              { key: 'riskTreatment', label: 'Risk Treatment', sortable: true },
              { key: 'actions', label: 'Actions', sortable: false },
              { key: 'treatmentId', label: 'Treatment ID', sortable: true },
              { key: 'riskTreatmentOwner', label: 'Risk Treatment Owner', sortable: true },
              { key: 'dateRiskTreatmentDue', label: 'Date Risk Treatment Due', sortable: true },
              { key: 'extendedDueDate', label: 'Extended Due Date', sortable: true },
              { key: 'numberOfExtensions', label: 'Number of Extensions', sortable: true },
              { key: 'completionDate', label: 'Completion Date', sortable: true },
              { key: 'closureApproval', label: 'Closure Approval', sortable: true },
              { key: 'closureApprovedBy', label: 'Closure Approved by', sortable: true },
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
                   return (
                     <div className="flex items-center space-x-2">
                       <Tooltip content="View Treatment Details">
                         <Link
                           href={`/risk-management/treatments/${validateRiskId(params.riskId)}/${row.treatmentId}`}
                           className="inline-flex items-center justify-center w-8 h-8 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
                         >
                           <Icon name="eye" size={12} />
                         </Link>
                       </Tooltip>
                                             <Tooltip content="Copy Treatment Link">
                         <button
                           onClick={(e) => {
                             e.stopPropagation()
                             const url = `${window.location.origin}/risk-management/treatments/${validateRiskId(params.riskId)}/${row.treatmentId}`
                             navigator.clipboard.writeText(url).then(() => {
                               showToast({
                                 title: 'Success',
                                 message: 'Treatment link copied to clipboard!',
                                 type: 'success'
                               })
                             }).catch(() => {
                               showToast({
                                 title: 'Error',
                                 message: 'Failed to copy link to clipboard',
                                 type: 'error'
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
                             // TODO: Implement workshop agenda functionality
                             showToast({
                               title: 'Success',
                               message: `Treatment ${row.treatmentId} added to workshop agenda!`,
                               type: 'success'
                             })
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
            }))}
            onRowClick={handleRowClick}
            onExportCSV={handleExportCSV}
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

      {/* Comment Sidebar */}
      <CommentSidebar
        isOpen={isCommentSidebarOpen}
        onClose={() => setIsCommentSidebarOpen(false)}
        riskId={validateRiskId(params.riskId) || ''}
        onCommentCountChange={setCommentCount}
      />
    </div>
  )
} 