'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Icon from '@/app/components/Icon'
import Tooltip from '@/app/components/Tooltip'
import { useToast } from '@/app/components/Toast'

interface Risk {
  riskId: string
  riskStatement: string
  informationAsset: string
  likelihood: string
  impact: string
  riskLevel: string
}

interface Treatment {
  _id: string
  riskId: string
  treatmentId: string
  treatmentJira?: string
  riskTreatment: string
  riskTreatmentOwner: string
  dateRiskTreatmentDue: string
  extendedDueDate?: string
  numberOfExtensions: number
  completionDate?: string
  closureApproval: string
  closureApprovedBy?: string
  extensions: Array<{
    extendedDueDate: string
    approver: string
    dateApproved: string
    justification: string
  }>
  createdAt: string
  updatedAt: string
}

// Discriminated union for selectedTreatments
interface TreatmentMinutes {
  treatmentId: string
  treatmentJira?: string
  actionsTaken?: string
  toDo?: string
  outcome?: string
}

type SelectedTreatments = string[] | TreatmentMinutes[]

// Type guards for discriminated union
const isStringArray = (selectedTreatments: SelectedTreatments): selectedTreatments is string[] => {
  return selectedTreatments.length > 0 && 
         selectedTreatments[0] !== undefined && 
         selectedTreatments[0] !== null &&
         typeof selectedTreatments[0] === 'string'
}

const isTreatmentMinutesArray = (selectedTreatments: SelectedTreatments): selectedTreatments is TreatmentMinutes[] => {
  return selectedTreatments.length > 0 && 
         selectedTreatments[0] !== undefined && 
         selectedTreatments[0] !== null &&
         typeof selectedTreatments[0] === 'object' && 
         'treatmentId' in selectedTreatments[0]
}

// Helper function to safely check if array is empty or can be treated as TreatmentMinutes
const isEmptyOrTreatmentMinutesArray = (selectedTreatments: SelectedTreatments): boolean => {
  return selectedTreatments.length === 0 || isTreatmentMinutesArray(selectedTreatments)
}

interface Workshop {
  _id: string
  id: string
  date: string
  status: 'Pending Agenda' | 'Planned' | 'Scheduled' | 'Finalising Meeting Minutes' | 'Completed'
  facilitator: string
  facilitatorPosition?: string
  participants: Array<string | {
    name: string
    position?: string
  }>
  risks: string[]
  outcomes?: string
  securitySteeringCommittee: 'Core Systems Engineering' | 'Software Engineering' | 'IP Engineering'
  actionsTaken?: string
  toDo?: string
  notes?: string
  // Meeting Minutes subsections
  extensions?: Array<{
    riskId: string
    selectedTreatments?: SelectedTreatments
    actionsTaken: string
    toDo: string
    outcome: string
  }>
  closure?: Array<{
    riskId: string
    selectedTreatments?: SelectedTreatments
    actionsTaken: string
    toDo: string
    outcome: string
  }>
  newRisks?: Array<{
    riskId: string
    selectedTreatments?: SelectedTreatments
    actionsTaken: string
    toDo: string
    outcome: string
  }>
  createdAt?: string
  updatedAt?: string
}

// Inline Editable Field Component
interface EditableFieldProps {
  value: string
  placeholder: string
  onSave: (value: string) => Promise<void>
  className?: string
}

function EditableField({ value, placeholder, onSave, className = '' }: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const [isSaving, setIsSaving] = useState(false)
  const [isCanceling, setIsCanceling] = useState(false)

  // Update editValue when value prop changes
  useEffect(() => {
    setEditValue(value)
  }, [value])

  const handleSave = async () => {
    if (editValue.trim() !== value) {
      setIsSaving(true)
      try {
        await onSave(editValue.trim())
        setIsEditing(false)
      } catch (error) {
        console.error('Error saving:', error)
      } finally {
        setIsSaving(false)
      }
    } else {
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setIsCanceling(true)
    setEditValue(value)
    setIsEditing(false)
    // Reset canceling flag after a brief delay to prevent onBlur from triggering
    setTimeout(() => setIsCanceling(false), 100)
  }

  const handleBlur = (e: React.FocusEvent) => {
    // Only save on blur if we're not canceling and the focus is not moving to the cancel button
    if (!isCanceling && !e.relatedTarget?.closest('button')) {
      handleSave()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  if (isEditing) {
    return (
      <div className={`relative ${className}`}>
        <textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="w-full p-2 text-sm border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={3}
          autoFocus
        />
        <div className="absolute top-1 right-1 flex space-x-1">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="p-1 text-green-600 hover:text-green-800 disabled:opacity-50"
            title="Save"
          >
            {isSaving ? (
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600"></div>
            ) : (
              <Icon name="check" size={14} />
            )}
          </button>
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="p-1 text-red-600 hover:text-red-800 disabled:opacity-50"
            title="Cancel"
          >
            <Icon name="x" size={14} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`group cursor-pointer p-2 rounded-md hover:bg-gray-50 transition-colors ${className}`}
      onClick={() => setIsEditing(true)}
    >
      <div className="text-sm text-gray-700 whitespace-pre-wrap">
        {value || <span className="text-gray-500 italic">{placeholder}</span>}
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-1">
        <Icon name="pencil" size={12} className="text-gray-400" />
      </div>
    </div>
  )
}

// Helper functions (moved outside components)
const getFilteredTreatments = (allRiskTreatments: Treatment[], selectedTreatments?: SelectedTreatments): Treatment[] => {
  if (!selectedTreatments || selectedTreatments.length === 0) {
    return allRiskTreatments
  }

  if (isStringArray(selectedTreatments)) {
    return allRiskTreatments.filter(treatment => 
      selectedTreatments.includes(treatment.treatmentId)
    )
  }

  if (isTreatmentMinutesArray(selectedTreatments)) {
    return allRiskTreatments.filter(treatment => 
      selectedTreatments.some(st => st.treatmentId === treatment.treatmentId)
    )
  }

  return allRiskTreatments
}

const getTreatmentMinutes = (
  treatmentId: string,
  selectedTreatments?: SelectedTreatments
): TreatmentMinutes | undefined => {
  if (!selectedTreatments || selectedTreatments.length === 0) return undefined
  
  if (isTreatmentMinutesArray(selectedTreatments)) {
    return selectedTreatments.find(st => st.treatmentId === treatmentId)
  }
  
  return undefined
}

// Generate HTML content for PDF export
const generatePDFHTML = (
  workshop: Workshop,
  risks: Record<string, Risk>,
  treatments: Record<string, Treatment[]>
): string => {
  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    
    const day = date.getDate().toString().padStart(2, '0')
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    const year = date.getFullYear()
    return `${day} ${month} ${year}`
  }

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    
    const day = date.getDate().toString().padStart(2, '0')
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    const year = date.getFullYear()
    const time = date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
    return `${day} ${month} ${year} at ${time}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return '#dcfce7'
      case 'Finalising Meeting Minutes': return '#dbeafe'
      case 'Scheduled': return '#fef3c7'
      case 'Planned': return '#f3e8ff'
      case 'Pending Agenda': return '#fed7aa'
      default: return '#f3f4f6'
    }
  }

  const getSectionColor = (sectionType: 'extensions' | 'closure' | 'newRisks') => {
    switch (sectionType) {
      case 'extensions': return '#dbeafe'
      case 'closure': return '#dcfce7'
      case 'newRisks': return '#fed7aa'
      default: return '#f3f4f6'
    }
  }

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'high': return '#fecaca'
      case 'medium': return '#fef3c7'
      case 'low': return '#dcfce7'
      default: return '#f3f4f6'
    }
  }

  const generateRiskCardHTML = (
    item: any,
    sectionType: 'extensions' | 'closure' | 'newRisks'
  ) => {
    const risk = risks[item.riskId]
    const riskTreatments = getFilteredTreatments(treatments[item.riskId] || [], item.selectedTreatments)
    
    if (!risk) return ''

    return `
      <div style="border-left: 4px solid ${sectionType === 'extensions' ? '#3b82f6' : sectionType === 'closure' ? '#10b981' : '#f97316'}; background-color: ${getSectionColor(sectionType)}; border-radius: 8px; padding: 24px; margin-bottom: 16px;">
        <div style="margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
            <span style="font-size: 14px; font-weight: 500; color: #111827;">Risk ID: ${item.riskId}</span>
            ${risk.riskLevel ? `<span style="padding: 4px 8px; font-size: 12px; font-weight: 500; border-radius: 9999px; background-color: ${getRiskLevelColor(risk.riskLevel)}; color: #111827;">${risk.riskLevel}</span>` : ''}
          </div>
        </div>

        <div style="margin-bottom: 24px;">
          <h4 style="font-size: 14px; font-weight: 600; color: #111827; margin-bottom: 12px;">Risk Details & Meeting Minutes</h4>
          <div style="background-color: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
              <div>
                <h5 style="font-size: 14px; font-weight: 500; color: #111827; margin-bottom: 8px;">Risk Statement</h5>
                <p style="font-size: 14px; color: #374151; line-height: 1.5;">${risk.riskStatement}</p>
              </div>
              <div>
                <h5 style="font-size: 14px; font-weight: 500; color: #111827; margin-bottom: 8px;">Information Asset</h5>
                <p style="font-size: 14px; color: #374151;">${risk.informationAsset}</p>
              </div>
            </div>
            
            <div style="border-top: 1px solid #f3f4f6; padding-top: 16px;">
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
                <div>
                  <h6 style="font-size: 12px; font-weight: 500; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Actions Taken</h6>
                  <p style="font-size: 14px; color: #374151; white-space: pre-wrap;">${item.actionsTaken || 'No actions taken recorded'}</p>
                </div>
                <div>
                  <h6 style="font-size: 12px; font-weight: 500; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">To Do</h6>
                  <p style="font-size: 14px; color: #374151; white-space: pre-wrap;">${item.toDo || 'No to do items recorded'}</p>
                </div>
                <div>
                  <h6 style="font-size: 12px; font-weight: 500; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Outcome</h6>
                  <p style="font-size: 14px; color: #374151; white-space: pre-wrap;">${item.outcome || 'No outcome recorded'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        ${riskTreatments.length > 0 ? `
          <div>
            <h4 style="font-size: 14px; font-weight: 600; color: #111827; margin-bottom: 12px;">Risk Treatments</h4>
            ${riskTreatments.map((treatment: Treatment, treatmentIndex: number) => {
              const treatmentMinutes = getTreatmentMinutes(treatment.treatmentId, item.selectedTreatments)
              return `
                <div style="background-color: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 16px;">
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                    <div>
                      <h5 style="font-size: 14px; font-weight: 500; color: #111827; margin-bottom: 4px;">Treatment Description</h5>
                      <p style="font-size: 14px; color: #374151;">${treatment.riskTreatment}</p>
                    </div>
                    <div>
                      <h5 style="font-size: 14px; font-weight: 500; color: #111827; margin-bottom: 4px;">Owner</h5>
                      <p style="font-size: 14px; color: #374151;">${treatment.riskTreatmentOwner}</p>
                    </div>
                  </div>
                  
                  <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; padding-top: 16px; border-top: 1px solid #f3f4f6;">
                    <div>
                      <h6 style="font-size: 12px; font-weight: 500; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Actions Taken</h6>
                      <p style="font-size: 14px; color: #374151; white-space: pre-wrap;">${treatmentMinutes?.actionsTaken || 'No actions taken recorded'}</p>
                    </div>
                    <div>
                      <h6 style="font-size: 12px; font-weight: 500; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">To Do</h6>
                      <p style="font-size: 14px; color: #374151; white-space: pre-wrap;">${treatmentMinutes?.toDo || 'No to do items recorded'}</p>
                    </div>
                    <div>
                      <h6 style="font-size: 12px; font-weight: 500; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Outcome</h6>
                      <p style="font-size: 14px; color: #374151; white-space: pre-wrap;">${treatmentMinutes?.outcome || 'No outcome recorded'}</p>
                    </div>
                  </div>
                </div>
              `
            }).join('')}
          </div>
        ` : ''}
      </div>
    `
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Risk Workshop - ${workshop.id}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #111827;
          margin: 0;
          padding: 20px;
          background-color: #f9fafb;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .header {
          background-color: #4c1d95;
          color: white;
          padding: 32px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: bold;
        }
        .header p {
          margin: 8px 0 0 0;
          font-size: 16px;
          opacity: 0.9;
        }
        .content {
          padding: 32px;
        }
        .section {
          margin-bottom: 32px;
        }
        .section-title {
          font-size: 20px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .section-title::before {
          content: '';
          width: 4px;
          height: 24px;
          background-color: #4c1d95;
          border-radius: 2px;
        }
        .overview-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 24px;
          margin-bottom: 32px;
        }
        .overview-card {
          background-color: #f9fafb;
          border-radius: 8px;
          padding: 16px;
        }
        .overview-card h4 {
          font-size: 12px;
          font-weight: 500;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0 0 8px 0;
        }
        .overview-card p {
          font-size: 14px;
          color: #111827;
          margin: 0;
        }
        .subsection {
          margin-bottom: 32px;
        }
        .subsection h4 {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 16px;
        }
        .empty-state {
          background-color: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          text-align: center;
          color: #6b7280;
          font-style: italic;
        }
        .metadata-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        .metadata-card {
          background-color: #f9fafb;
          border-radius: 8px;
          padding: 16px;
        }
        .metadata-card h4 {
          font-size: 12px;
          font-weight: 500;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0 0 8px 0;
        }
        .metadata-card p {
          font-size: 14px;
          font-weight: 500;
          color: #111827;
          margin: 0;
        }
        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 12px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 500;
          margin-left: 12px;
        }
        .participant {
          font-size: 14px;
          color: #374151;
          padding-left: 8px;
          border-left: 2px solid #d1d5db;
          margin-bottom: 4px;
        }
        .participant-position {
          color: #6b7280;
          margin-left: 4px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Risk Workshop - ${workshop.id}</h1>
          <p>${formatDate(workshop.date)} Meeting Minutes</p>
        </div>
        
        <div class="content">
          <div class="section">
            <h3 class="section-title">Workshop Overview</h3>
            <div style="display: flex; align-items: center; margin-bottom: 24px;">
              <span class="status-badge" style="background-color: ${getStatusColor(workshop.status)}; color: #111827;">
                ${workshop.status}
              </span>
            </div>
            
            <div class="overview-grid">
              <div class="overview-card">
                <h4>Facilitator</h4>
                <p>${workshop.facilitator}${workshop.facilitatorPosition ? ` (${workshop.facilitatorPosition})` : ''}</p>
                <h4 style="margin-top: 16px;">Participants</h4>
                ${workshop.participants.length > 0 ? 
                  workshop.participants.map((participant: any) => {
                    if (typeof participant === 'string') {
                      const parts = participant.split(', ')
                      const name = parts[0]
                      const position = parts[1]
                      return `<div class="participant">${name}${position ? `<span class="participant-position">(${position})</span>` : ''}</div>`
                    } else {
                      return `<div class="participant">${participant.name}${participant.position ? `<span class="participant-position">(${participant.position})</span>` : ''}</div>`
                    }
                  }).join('') : 
                  '<div class="participant">No participants listed</div>'
                }
              </div>
              
              <div class="overview-card">
                <h4>Agenda</h4>
                <p>• Extensions of risk treatment due dates</p>
                <p>• Closure of risks and treatments</p>
                <p>• Discussion of newly identified risks</p>
              </div>
              
              <div class="overview-card">
                <h4>Summary</h4>
                <p>${workshop.extensions?.length || 0} extensions, ${workshop.closure?.length || 0} closures, ${workshop.newRisks?.length || 0} new risks</p>
              </div>
            </div>
          </div>

          <div class="section">
            <h3 class="section-title">Meeting Minutes</h3>
            
            <div class="subsection">
              <h4>Extensions</h4>
              ${workshop.extensions && workshop.extensions.length > 0 ? 
                workshop.extensions.map((item: any) => generateRiskCardHTML(item, 'extensions')).join('') :
                '<div class="empty-state">No extensions recorded</div>'
              }
            </div>

            <div class="subsection">
              <h4>Closure</h4>
              ${workshop.closure && workshop.closure.length > 0 ? 
                workshop.closure.map((item: any) => generateRiskCardHTML(item, 'closure')).join('') :
                '<div class="empty-state">No closures recorded</div>'
              }
            </div>

            <div class="subsection">
              <h4>New Risks</h4>
              ${workshop.newRisks && workshop.newRisks.length > 0 ? 
                workshop.newRisks.map((item: any) => generateRiskCardHTML(item, 'newRisks')).join('') :
                '<div class="empty-state">No new risks recorded</div>'
              }
            </div>
          </div>

          <div class="section">
            <h3 class="section-title">Metadata</h3>
            <div class="metadata-grid">
              <div class="metadata-card">
                <h4>Created</h4>
                <p>${workshop.createdAt ? formatDateTime(workshop.createdAt) : '-'}</p>
              </div>
              <div class="metadata-card">
                <h4>Last Updated</h4>
                <p>${workshop.updatedAt ? formatDateTime(workshop.updatedAt) : '-'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

// Risk Card Component
interface RiskCardProps {
  item: {
    riskId: string
    selectedTreatments?: SelectedTreatments
    actionsTaken: string
    toDo: string
    outcome: string
  }
  risk: Risk | undefined
  treatments: Treatment[]
  sectionType: 'extensions' | 'closure' | 'newRisks'
  onUpdate: (field: 'actionsTaken' | 'toDo' | 'outcome', value: string) => Promise<void>
  onUpdateTreatment: (treatmentId: string, field: 'actionsTaken' | 'toDo' | 'outcome', value: string) => Promise<void>
  onRequestExtension: (treatment: Treatment) => void
}

function RiskCard({ item, risk, treatments, sectionType, onUpdate, onUpdateTreatment, onRequestExtension }: RiskCardProps) {
  const riskTreatments = getFilteredTreatments(treatments, item.selectedTreatments)
  
  const getSectionColor = () => {
    switch (sectionType) {
      case 'extensions': return 'border-l-blue-500 bg-blue-50'
      case 'closure': return 'border-l-green-500 bg-green-50'
      case 'newRisks': return 'border-l-orange-500 bg-orange-50'
      default: return 'border-l-gray-500 bg-gray-50'
    }
  }

  const getRiskLevelColor = () => {
    if (!risk?.riskLevel) return 'bg-gray-100 text-gray-800'
    switch (risk.riskLevel.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className={`border-l-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 ${getSectionColor()}`}>
      <div className="p-6">
        {/* Risk Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-sm font-medium text-gray-900">Risk ID: {item.riskId}</span>
              {risk?.riskLevel && (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskLevelColor()}`}>
                  {risk.riskLevel}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Risk Details and Meeting Minutes Section */}
        {risk && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Risk Details & Meeting Minutes</h4>
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              {/* Risk Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div>
                  <h5 className="text-sm font-medium text-gray-900 mb-2">Risk Statement</h5>
                  <p className="text-sm text-gray-700 leading-relaxed">{risk.riskStatement}</p>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-900 mb-2">Information Asset</h5>
                  <p className="text-sm text-gray-700">{risk.informationAsset}</p>
                </div>
              </div>
              
                             {/* Risk-level Meeting Minutes */}
               <div className="border-t border-gray-100 pt-4">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h6 className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">Actions Taken</h6>
                    <EditableField
                      value={item.actionsTaken}
                      placeholder="Add risk-level actions taken..."
                      onSave={(value) => onUpdate('actionsTaken', value)}
                    />
                  </div>
                  <div>
                    <h6 className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">To Do</h6>
                    <EditableField
                      value={item.toDo}
                      placeholder="Add risk-level to do items..."
                      onSave={(value) => onUpdate('toDo', value)}
                    />
                  </div>
                  <div>
                    <h6 className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">Outcome</h6>
                    <EditableField
                      value={item.outcome}
                      placeholder="Add risk-level outcome..."
                      onSave={(value) => onUpdate('outcome', value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Risk Treatments */}
        {riskTreatments.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Risk Treatments</h4>
            <div className="space-y-4">
              {riskTreatments.map((treatment: Treatment, treatmentIndex: number) => {
                const treatmentMinutes = getTreatmentMinutes(treatment.treatmentId, item.selectedTreatments)
                return (
                  <div key={treatmentIndex} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h5 className="text-sm font-medium text-gray-900 mb-1">Treatment Description</h5>
                        <p className="text-sm text-gray-700">{treatment.riskTreatment}</p>
                      </div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="text-sm font-medium text-gray-900 mb-1">Owner</h5>
                          <p className="text-sm text-gray-700">{treatment.riskTreatmentOwner}</p>
                        </div>
                        <button
                          onClick={() => onRequestExtension(treatment)}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 hover:border-purple-300 transition-colors"
                          title="Request due date extension"
                        >
                          <Icon name="calendar-plus" size={12} className="mr-1" />
                          Request Extension
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                      <div>
                        <h6 className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">Actions Taken</h6>
                        <EditableField
                          value={treatmentMinutes?.actionsTaken || ''}
                          placeholder="Add actions taken..."
                          onSave={(value) => onUpdateTreatment(treatment.treatmentId, 'actionsTaken', value)}
                        />
                      </div>
                      <div>
                        <h6 className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">To Do</h6>
                        <EditableField
                          value={treatmentMinutes?.toDo || ''}
                          placeholder="Add to do items..."
                          onSave={(value) => onUpdateTreatment(treatment.treatmentId, 'toDo', value)}
                        />
                      </div>
                      <div>
                        <h6 className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">Outcome</h6>
                        <EditableField
                          value={treatmentMinutes?.outcome || ''}
                          placeholder="Add outcome..."
                          onSave={(value) => onUpdateTreatment(treatment.treatmentId, 'outcome', value)}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Extension Modal Component
interface ExtensionModalProps {
  isOpen: boolean
  onClose: () => void
  treatment: Treatment
  onSubmit: (data: { extendedDueDate: string; justification: string }) => Promise<void>
  submitting: boolean
}

function ExtensionModal({ isOpen, onClose, treatment, onSubmit, submitting }: ExtensionModalProps) {
  const [formData, setFormData] = useState({
    extendedDueDate: '',
    justification: ''
  })
  const [modalRef, setModalRef] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setFormData({
        extendedDueDate: '',
        justification: ''
      })
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    // Focus management for modal
    const timer = setTimeout(() => {
      // Focus the first focusable element in the modal
      const firstFocusableElement = modalRef?.querySelector(
        'input, textarea, button, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement
      firstFocusableElement?.focus()
    }, 100)

    return () => clearTimeout(timer)
  }, [isOpen, modalRef])

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscapeKey)
    return () => document.removeEventListener('keydown', handleEscapeKey)
  }, [isOpen, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Handle tab key to trap focus within modal
  const handleTabKey = (event: React.KeyboardEvent) => {
    if (event.key !== 'Tab') return

    if (!modalRef) return

    const focusableElements = modalRef.querySelectorAll(
      'input, textarea, button, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.extendedDueDate && formData.justification.trim()) {
      await onSubmit(formData)
      onClose()
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 backdrop-blur-lg flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div 
        ref={setModalRef}
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onKeyDown={handleTabKey}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 id="modal-title" className="text-lg font-semibold text-gray-900">Request Extension</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors"
            title="Close"
            aria-label="Close extension request form"
          >
            <Icon name="close" size={16} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Treatment Details</h3>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-700 mb-1">
                <span className="font-medium">Treatment ID:</span> {treatment.treatmentId}
              </p>
              <p className="text-sm text-gray-700 mb-1">
                <span className="font-medium">Owner:</span> {treatment.riskTreatmentOwner}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Current Due Date:</span> {new Date(treatment.dateRiskTreatmentDue).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="extendedDueDate" className="block text-sm font-medium text-gray-700 mb-2">
              Extended Due Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="extendedDueDate"
              name="extendedDueDate"
              value={formData.extendedDueDate}
              onChange={(e) => handleInputChange('extendedDueDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
              min={new Date().toISOString().split('T')[0]}
              aria-describedby="date-help"
            />
            <p id="date-help" className="text-xs text-gray-500 mt-1">
              Must be today or a future date
            </p>
          </div>

          <div>
            <label htmlFor="justification" className="block text-sm font-medium text-gray-700 mb-2">
              Justification <span className="text-red-500">*</span>
            </label>
            <textarea
              id="justification"
              name="justification"
              value={formData.justification}
              onChange={(e) => handleInputChange('justification', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="Please provide a detailed justification for the extension request..."
              required
              aria-describedby="justification-help"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={submitting}
              aria-label="Cancel extension request"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={submitting || !formData.extendedDueDate || !formData.justification.trim()}
              aria-label="Submit extension request"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function WorkshopDetails() {
  const params = useParams()
  const router = useRouter()
  const { showToast } = useToast()
  const [workshop, setWorkshop] = useState<Workshop | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [risks, setRisks] = useState<Record<string, Risk>>({})
  const [treatments, setTreatments] = useState<Record<string, Treatment[]>>({})
  // Per-field saving states
  const [savingFields, setSavingFields] = useState<Set<string>>(new Set())
  const [exportingPDF, setExportingPDF] = useState(false)
  // Extension modal state
  const [showExtensionModal, setShowExtensionModal] = useState(false)
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null)
  const [submittingExtension, setSubmittingExtension] = useState(false)

  // Update risk-level meeting minutes
  const updateRiskMinutes = async (section: 'extensions' | 'closure' | 'newRisks', index: number, field: 'actionsTaken' | 'toDo' | 'outcome', value: string) => {
    if (!workshop) return

    const fieldKey = `${section}-${index}-${field}`
    setSavingFields(prev => new Set(prev).add(fieldKey))
    
    try {
      const updatedWorkshop = { ...workshop }
      if (updatedWorkshop[section]) {
        updatedWorkshop[section]![index] = {
          ...updatedWorkshop[section]![index],
          [field]: value
        }
      }

      const response = await fetch(`/api/workshops/${workshop.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedWorkshop),
      })

      const result = await response.json()
      if (result.success) {
        setWorkshop(updatedWorkshop)
        showToast({
          type: 'success',
          title: 'Updated',
          message: 'Meeting minutes updated successfully'
        })
      } else {
        throw new Error(result.error || 'Failed to update')
      }
    } catch (error) {
      console.error('Error updating risk minutes:', error)
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update meeting minutes. Please try again.'
      })
    } finally {
      setSavingFields(prev => {
        const newSet = new Set(prev)
        newSet.delete(fieldKey)
        return newSet
      })
    }
  }

  // Open extension modal
  const openExtensionModal = (treatment: Treatment) => {
    setSelectedTreatment(treatment)
    setShowExtensionModal(true)
  }

  // Close extension modal
  const closeExtensionModal = () => {
    setShowExtensionModal(false)
    setSelectedTreatment(null)
  }

  // Update treatment-level meeting minutes
  const updateTreatmentMinutes = async (section: 'extensions' | 'closure' | 'newRisks', index: number, treatmentId: string, field: 'actionsTaken' | 'toDo' | 'outcome', value: string) => {
    if (!workshop) return

    const fieldKey = `${section}-${index}-treatment-${treatmentId}-${field}`
    setSavingFields(prev => new Set(prev).add(fieldKey))
    
    try {
      const updatedWorkshop = { ...workshop }
      if (updatedWorkshop[section]) {
        const item = updatedWorkshop[section]![index]
        
        // Initialize selectedTreatments as TreatmentMinutes array if it doesn't exist
        if (!item.selectedTreatments) {
          item.selectedTreatments = []
        }
        
        // Convert string array to TreatmentMinutes array if needed
        if (isStringArray(item.selectedTreatments)) {
          item.selectedTreatments = item.selectedTreatments.map(treatmentIdStr => ({
            treatmentId: treatmentIdStr,
            treatmentJira: `https://jira.company.com/browse/${treatmentIdStr}`,
            actionsTaken: '',
            toDo: '',
            outcome: ''
          }))
        }
        
        // Ensure we have a TreatmentMinutes array
        if (!isTreatmentMinutesArray(item.selectedTreatments)) {
          // If it's not a TreatmentMinutes array, initialize it
          item.selectedTreatments = [] as TreatmentMinutes[]
        }
        
        // At this point, TypeScript knows it's a TreatmentMinutes array
        const treatmentsArray = item.selectedTreatments as TreatmentMinutes[]
        
        // Find the treatment in the array
        let treatmentIndex = treatmentsArray.findIndex(t => t.treatmentId === treatmentId)
        
        // If treatment not found, add it
        if (treatmentIndex === -1) {
          treatmentsArray.push({
            treatmentId,
            treatmentJira: `https://jira.company.com/browse/${treatmentId}`,
            actionsTaken: '',
            toDo: '',
            outcome: ''
          })
          treatmentIndex = treatmentsArray.length - 1
        }
        
        // Update the treatment
        treatmentsArray[treatmentIndex] = {
          ...treatmentsArray[treatmentIndex],
          [field]: value
        }
      }

      console.log('Updating workshop with data:', JSON.stringify(updatedWorkshop, null, 2))

      const response = await fetch(`/api/workshops/${workshop.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedWorkshop),
      })

      const result = await response.json()
      console.log('Update response:', result)
      
      if (result.success) {
        setWorkshop(updatedWorkshop)
        showToast({
          type: 'success',
          title: 'Updated',
          message: 'Treatment minutes updated successfully'
        })
      } else {
        throw new Error(result.error || 'Failed to update')
      }
    } catch (error) {
      console.error('Error updating treatment minutes:', error)
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update treatment minutes. Please try again.'
      })
    } finally {
      setSavingFields(prev => {
        const newSet = new Set(prev)
        newSet.delete(fieldKey)
        return newSet
      })
    }
  }

  useEffect(() => {
    const fetchWorkshop = async () => {
      try {
        const response = await fetch(`/api/workshops/${params.id}`)
        const result = await response.json()
        
        if (result.success) {
          setWorkshop(result.data)
        } else {
          setError(result.error || 'Failed to fetch workshop')
        }
      } catch (error) {
        setError('Error fetching workshop details')
        console.error('Error fetching workshop:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchWorkshop()
    }
  }, [params.id])

  // Fetch risk and treatment data for meeting minutes items
  const fetchRiskAndTreatmentData = async () => {
    if (!workshop) return

    try {
      // Get all unique risk IDs from meeting minutes
      const riskIds = new Set<string>()
      ;(workshop.extensions || []).forEach(item => riskIds.add(item.riskId))
      ;(workshop.closure || []).forEach(item => riskIds.add(item.riskId))
      ;(workshop.newRisks || []).forEach(item => riskIds.add(item.riskId))

      if (riskIds.size === 0) return

      // Fetch risks data
      const risksResponse = await fetch('/api/risks')
      const risksResult = await risksResponse.json()
      
      if (risksResult.success) {
        const risksMap: Record<string, Risk> = {}
        risksResult.data.forEach((risk: Risk) => {
          if (riskIds.has(risk.riskId)) {
            risksMap[risk.riskId] = risk
          }
        })
        setRisks(risksMap)
      }

      // Fetch treatments data
      const treatmentsResponse = await fetch('/api/treatments')
      const treatmentsResult = await treatmentsResponse.json()
      
      if (treatmentsResult.success) {
        const treatmentsMap: Record<string, Treatment[]> = {}
        treatmentsResult.data.forEach((treatment: Treatment) => {
          if (riskIds.has(treatment.riskId)) {
            if (!treatmentsMap[treatment.riskId]) {
              treatmentsMap[treatment.riskId] = []
            }
            treatmentsMap[treatment.riskId].push(treatment)
          }
        })
        setTreatments(treatmentsMap)
      }
    } catch (error) {
      console.error('Error fetching risk and treatment data:', error)
    }
  }

  useEffect(() => {
    fetchRiskAndTreatmentData()
  }, [workshop])

  // Handle extension request
  const handleExtensionRequest = async (data: { extendedDueDate: string; justification: string }) => {
    if (!selectedTreatment) return

    setSubmittingExtension(true)
    try {
      const response = await fetch(`/api/treatments/${selectedTreatment.riskId}/${selectedTreatment.treatmentId}/extensions?directApproval=true`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()
      
      if (result.success) {
        // Update the outcome field for the specific treatment
        await updateTreatmentOutcomeAfterExtension(data.extendedDueDate, data.justification)
        
        showToast({
          type: 'success',
          title: 'Extension Approved',
          message: result.message || 'Extension approved and recorded successfully'
        })
        closeExtensionModal()
      } else {
        throw new Error(result.error || 'Failed to submit extension request')
      }
    } catch (error) {
      console.error('Error submitting extension request:', error)
      showToast({
        type: 'error',
        title: 'Request Failed',
        message: error instanceof Error ? error.message : 'Failed to submit extension request'
      })
    } finally {
      setSubmittingExtension(false)
    }
  }

  const updateTreatmentOutcomeAfterExtension = async (extendedDueDate: string, justification: string) => {
    if (!workshop || !selectedTreatment) return

    // Format the extended due date for display
    const formattedDate = formatDate(extendedDueDate)
    
    // Create the outcome message
    const outcomeMessage = `Risk treatment due date extended until ${formattedDate} due to ${justification}`
    
    // Find the risk item in the extensions section that contains this treatment
    const extensionsSection = workshop.extensions || []
    const riskIndex = extensionsSection.findIndex(item => item.riskId === selectedTreatment.riskId)
    
    if (riskIndex !== -1) {
      // Get the current outcome text
      const currentOutcome = getTreatmentMinutes(selectedTreatment.treatmentId, extensionsSection[riskIndex].selectedTreatments)?.outcome || ''
      
      // Combine existing outcome with new extension message
      const combinedOutcome = currentOutcome 
        ? `${currentOutcome}\n\n${outcomeMessage}`
        : outcomeMessage
      
      // Update the treatment's outcome field with combined text
      await updateTreatmentMinutes('extensions', riskIndex, selectedTreatment.treatmentId, 'outcome', combinedOutcome)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800'
      case 'Finalising Meeting Minutes':
        return 'bg-blue-100 text-blue-800'
      case 'Scheduled':
        return 'bg-yellow-100 text-yellow-800'
      case 'Planned':
        return 'bg-purple-100 text-purple-800'
      case 'Pending Agenda':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    
    const day = date.getDate().toString().padStart(2, '0')
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    const year = date.getFullYear()
    return `${day} ${month} ${year}`
  }

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    
    const day = date.getDate().toString().padStart(2, '0')
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    const year = date.getFullYear()
    const time = date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
    return `${day} ${month} ${year} at ${time}`
  }

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/risk-management/workshops/${workshop?.id}`
    
    try {
      // Check if clipboard API is available
      if (!navigator.clipboard) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = url
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        showToast({
          type: 'success',
          title: 'Link copied!',
          message: 'Workshop link has been copied to clipboard'
        })
        return
      }

      await navigator.clipboard.writeText(url)
      showToast({
        type: 'success',
        title: 'Link copied!',
        message: 'Workshop link has been copied to clipboard'
      })
    } catch (error) {
      console.error('Failed to copy link:', error)
      showToast({
        type: 'error',
        title: 'Copy failed',
        message: 'Unable to copy link to clipboard. Please try again.'
      })
    }
  }

  const handleEdit = () => {
    router.push(`/risk-management/workshops/${workshop?.id}/edit`)
  }

  const handleExportPDF = async () => {
    if (!workshop) return

    try {
      setExportingPDF(true)
      
      // Generate HTML content for PDF
      const htmlContent = generatePDFHTML(workshop, risks, treatments)
      
      // Call the PDF generation API
      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html: htmlContent,
          filename: `${workshop.id}-workshop-report.pdf`
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
      a.download = `${workshop.id}-workshop-report.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      showToast({
        type: 'success',
        title: 'PDF Exported Successfully',
        message: `Workshop report for ${workshop.id} has been exported to PDF.`,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#898AC4' }}></div>
          <p className="mt-4" style={{ color: '#22223B' }}>Loading workshop details...</p>
        </div>
      </div>
    )
  }

  if (error || !workshop) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <Icon name="alert-circle" className="w-5 h-5 text-red-400 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error || 'Workshop not found'}</p>
            </div>
          </div>
        </div>
        <Link
          href="/risk-management/workshops"
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          <Icon name="arrow-left" className="w-4 h-4 mr-2" />
          Back to Workshops
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Workshop Information Container */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/risk-management/workshops')}
              className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 hover:bg-gray-200 bg-white border border-gray-300"
              title="Back to Workshops"
            >
              <Icon name="arrow-left" size={16} />
            </button>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#22223B' }}>
                Risk Workshop - {workshop.id}
              </h1>
              <p className="text-gray-600" style={{ color: '#22223B' }}>
                {formatDate(workshop.date)} Meeting Minutes
              </p>
            </div>
          </div>
          
                     <div className="flex items-center space-x-2">
             <button
               onClick={handleCopyLink}
               className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
               title="Copy link to workshop"
             >
               <Icon name="link" size={16} className="mr-2" />
               Copy Link
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
             <button
               onClick={handleEdit}
               className="inline-flex items-center px-3 py-2 text-sm font-medium text-white rounded-lg transition-colors"
               style={{ backgroundColor: '#4C1D95' }}
               title="Edit workshop"
             >
               <Icon name="pencil" size={16} className="mr-2" />
               Edit
             </button>
           </div>
        </div>

        {/* Workshop Overview Section */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <div className="w-1 h-6 bg-purple-600 rounded-full mr-3"></div>
            <h3 className="text-lg font-semibold text-gray-900">Workshop Overview</h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-3 ${getStatusColor(workshop.status)}`}>
              {workshop.status}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium text-gray-900">Facilitator:</span>
                  <span className="text-gray-700 ml-1">
                    {workshop.facilitator}
                    {workshop.facilitatorPosition && (
                      <span className="text-gray-500 ml-1">({workshop.facilitatorPosition})</span>
                    )}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-gray-900">Participants:</span>
                  {workshop.participants.length > 0 ? (
                    <div className="mt-1 space-y-1">
                      {workshop.participants.map((participant, index) => {
                        // Handle both old string format and new object format
                        if (typeof participant === 'string') {
                          // Old format: "Name, Position" or just "Name"
                          const parts = participant.split(', ')
                          const name = parts[0]
                          const position = parts[1]
                          return (
                            <div key={index} className="text-gray-700 pl-2 border-l-2 border-gray-300">
                              {name}
                              {position && (
                                <span className="text-gray-500 ml-1">({position})</span>
                              )}
                            </div>
                          )
                        } else {
                          // New format: { name: string, position?: string }
                          return (
                            <div key={index} className="text-gray-700 pl-2 border-l-2 border-gray-300">
                              {participant.name}
                              {participant.position && (
                                <span className="text-gray-500 ml-1">({participant.position})</span>
                              )}
                            </div>
                          )
                        }
                      })}
                    </div>
                  ) : (
                    <span className="text-gray-500 italic ml-1">No participants listed</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Agenda</span>
              <div className="mt-2 space-y-2">
                <div className="text-sm text-gray-700">• Extensions of risk treatment due dates</div>
                <div className="text-sm text-gray-700">• Closure of risks and treatments</div>
                <div className="text-sm text-gray-700">• Discussion of newly identified risks</div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Summary</span>
              <div className="mt-1 text-sm font-medium text-gray-900">
                {workshop.extensions?.length || 0} extensions, {workshop.closure?.length || 0} closures, {workshop.newRisks?.length || 0} new risks
              </div>
            </div>
          </div>
        </div>

        {/* Meeting Minutes Section */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <div className="w-1 h-6 bg-purple-600 rounded-full mr-3"></div>
            <h3 className="text-lg font-semibold text-gray-900">Meeting Minutes</h3>
          </div>
          
          <div className="space-y-8">
            {/* Extensions Subsection */}
            <div>
              <h4 className="text-md font-semibold text-gray-800 mb-4">
                Extensions
              </h4>
              {workshop.extensions && workshop.extensions.length > 0 ? (
                <div className="space-y-4">
                  {workshop.extensions.map((item, index) => {
                    const risk = risks[item.riskId]
                    const allRiskTreatments = treatments[item.riskId] || []
                    
                    return (
                      <RiskCard
                        key={index}
                        item={item}
                        risk={risk}
                        treatments={allRiskTreatments}
                        sectionType="extensions"
                        onUpdate={(field, value) => updateRiskMinutes('extensions', index, field, value)}
                        onUpdateTreatment={(treatmentId, field, value) => updateTreatmentMinutes('extensions', index, treatmentId, field, value)}
                        onRequestExtension={openExtensionModal}
                      />
                    )
                  })}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-500 italic text-center">No extensions recorded</p>
                </div>
              )}
            </div>

            {/* Closure Subsection */}
            <div>
              <h4 className="text-md font-semibold text-gray-800 mb-4">
                Closure
              </h4>
              {workshop.closure && workshop.closure.length > 0 ? (
                <div className="space-y-4">
                  {workshop.closure.map((item, index) => {
                    const risk = risks[item.riskId]
                    const allRiskTreatments = treatments[item.riskId] || []
                    
                    return (
                      <RiskCard
                        key={index}
                        item={item}
                        risk={risk}
                        treatments={allRiskTreatments}
                        sectionType="closure"
                        onUpdate={(field, value) => updateRiskMinutes('closure', index, field, value)}
                        onUpdateTreatment={(treatmentId, field, value) => updateTreatmentMinutes('closure', index, treatmentId, field, value)}
                        onRequestExtension={openExtensionModal}
                      />
                    )
                  })}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-500 italic text-center">No closures recorded</p>
                </div>
              )}
            </div>

            {/* New Risks Subsection */}
            <div>
              <h4 className="text-md font-semibold text-gray-800 mb-4">
                New Risks
              </h4>
              {workshop.newRisks && workshop.newRisks.length > 0 ? (
                <div className="space-y-4">
                  {workshop.newRisks.map((item, index) => {
                    const risk = risks[item.riskId]
                    const allRiskTreatments = treatments[item.riskId] || []
                    
                    return (
                      <RiskCard
                        key={index}
                        item={item}
                        risk={risk}
                        treatments={allRiskTreatments}
                        sectionType="newRisks"
                        onUpdate={(field, value) => updateRiskMinutes('newRisks', index, field, value)}
                        onUpdateTreatment={(treatmentId, field, value) => updateTreatmentMinutes('newRisks', index, treatmentId, field, value)}
                        onRequestExtension={openExtensionModal}
                      />
                    )
                  })}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-500 italic text-center">No new risks recorded</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Metadata Section */}
        <div>
          <div className="flex items-center mb-6">
            <div className="w-1 h-6 bg-purple-600 rounded-full mr-3"></div>
            <h3 className="text-lg font-semibold text-gray-900">Metadata</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Created</span>
              <div className="mt-1 text-sm font-medium text-gray-900">
                {workshop.createdAt ? formatDateTime(workshop.createdAt) : '-'}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Last Updated</span>
              <div className="mt-1 text-sm font-medium text-gray-900">
                {workshop.updatedAt ? formatDateTime(workshop.updatedAt) : '-'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Footer */}
      <div className="flex justify-between items-center pt-6">
        <Link
          href="/risk-management/workshops"
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          <Icon name="arrow-left" className="w-4 h-4 mr-2" />
          Back to Workshops
        </Link>
        
        <div className="flex space-x-3">
          <button
            onClick={handleEdit}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
            style={{ backgroundColor: '#4C1D95' }}
          >
            <Icon name="pencil" className="w-4 h-4 mr-2" />
            Edit Workshop
          </button>
        </div>
      </div>

      {/* Extension Modal */}
      {selectedTreatment && (
        <ExtensionModal
          isOpen={showExtensionModal}
          onClose={closeExtensionModal}
          treatment={selectedTreatment}
          onSubmit={handleExtensionRequest}
          submitting={submittingExtension}
        />
      )}
    </div>
  )
} 