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
  treatmentJiraTicket: string
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
  outcomes: string
  securitySteeringCommittee: 'Core Systems Engineering' | 'Software Engineering' | 'IP Engineering'
  actionsTaken?: string
  toDo?: string
  notes?: string
  // Meeting Minutes subsections
  extensions?: Array<{
    riskId: string
    selectedTreatments?: Array<{
      treatmentJiraTicket: string
      actionsTaken?: string
      toDo?: string
      outcome?: string
    }>
    actionsTaken: string
    toDo: string
    outcome: string
  }>
  closure?: Array<{
    riskId: string
    selectedTreatments?: Array<{
      treatmentJiraTicket: string
      actionsTaken?: string
      toDo?: string
      outcome?: string
    }>
    actionsTaken: string
    toDo: string
    outcome: string
  }>
  newRisks?: Array<{
    riskId: string
    selectedTreatments?: Array<{
      treatmentJiraTicket: string
      actionsTaken?: string
      toDo?: string
      outcome?: string
    }>
    actionsTaken: string
    toDo: string
    outcome: string
  }>
  createdAt?: string
  updatedAt?: string
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

  // Helper function to filter treatments based on selectedTreatments
  const getFilteredTreatments = (allRiskTreatments: Treatment[], selectedTreatments?: Array<{treatmentJiraTicket: string, actionsTaken?: string, toDo?: string, outcome?: string}>) => {
    if (!selectedTreatments || selectedTreatments.length === 0) {
      return allRiskTreatments
    }
    return allRiskTreatments.filter(treatment => 
      selectedTreatments.some(st => st.treatmentJiraTicket === treatment.treatmentJiraTicket)
    )
  }

  // Helper function to get treatment minutes for a specific treatment
  const getTreatmentMinutes = (
    treatmentJiraTicket: string,
    selectedTreatments?: Array<string | { treatmentJiraTicket: string; actionsTaken?: string; toDo?: string; outcome?: string }>
  ) => {
    if (!selectedTreatments || selectedTreatments.length === 0) return undefined
    if (typeof selectedTreatments[0] === 'string') return undefined
    return (selectedTreatments as { treatmentJiraTicket: string; actionsTaken?: string; toDo?: string; outcome?: string }[]).find(
      st => st.treatmentJiraTicket === treatmentJiraTicket
    )
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
  useEffect(() => {
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

    fetchRiskAndTreatmentData()
  }, [workshop])

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
                    // Show selected treatments if available, otherwise show all treatments
                    const riskTreatments = item.selectedTreatments && item.selectedTreatments.length > 0
                      ? allRiskTreatments.filter(treatment => {
                          if (typeof item.selectedTreatments[0] === 'string') {
                            return (item.selectedTreatments as string[]).includes(treatment.treatmentJiraTicket)
                          } else {
                            return (item.selectedTreatments as {treatmentJiraTicket: string}[]).some(
                              st => st.treatmentJiraTicket === treatment.treatmentJiraTicket
                            )
                          }
                        })
                      : allRiskTreatments
                    

                    
                    return (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        {/* Risk Information */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-gray-500 uppercase tracking-wide">Risk ID: {item.riskId}</span>
                            {risk && (
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-md">
                                {risk.riskLevel}
                              </span>
                            )}
                          </div>
                          
                          {risk && (
                            <div className="space-y-2 mb-4">
                              <div>
                                <span className="text-xs text-gray-500 uppercase tracking-wide">Risk Statement</span>
                                <div className="mt-1 text-sm text-gray-700">
                                  {risk.riskStatement}
                                </div>
                              </div>
                              <div>
                                <span className="text-xs text-gray-500 uppercase tracking-wide">Information Asset</span>
                                <div className="mt-1 text-sm text-gray-700">
                                  {risk.informationAsset}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Risk Treatments */}
                        {riskTreatments.length > 0 && (
                          <div className="mb-4">
                            <span className="text-xs text-gray-500 uppercase tracking-wide">Risk Treatments</span>
                            <div className="mt-2 space-y-2">
                              {riskTreatments.map((treatment, treatmentIndex) => {
                                const treatmentMinutes = getTreatmentMinutes(treatment.treatmentJiraTicket, item.selectedTreatments)
                                return (
                                  <div key={treatmentIndex} className="bg-white rounded p-3 border border-gray-200">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                      <div>
                                        <span className="text-xs text-gray-500">Treatment Description</span>
                                        <div className="mt-1 text-sm text-gray-700">{treatment.riskTreatment}</div>
                                      </div>
                                      <div>
                                        <span className="text-xs text-gray-500">Owner</span>
                                        <div className="mt-1 text-sm text-gray-700">{treatment.riskTreatmentOwner}</div>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-gray-100">
                                      <div>
                                        <span className="text-xs text-gray-500">Actions Taken</span>
                                        <div className="mt-1 text-sm text-gray-700">{treatmentMinutes?.actionsTaken || <span className="text-gray-500 italic">None</span>}</div>
                                      </div>
                                      <div>
                                        <span className="text-xs text-gray-500">To Do</span>
                                        <div className="mt-1 text-sm text-gray-700">{treatmentMinutes?.toDo || <span className="text-gray-500 italic">None</span>}</div>
                                      </div>
                                      <div>
                                        <span className="text-xs text-gray-500">Outcome</span>
                                        <div className="mt-1 text-sm text-gray-700">{treatmentMinutes?.outcome || <span className="text-gray-500 italic">None</span>}</div>
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {/* Meeting Minutes */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <span className="text-xs text-gray-500 uppercase tracking-wide">Actions Taken</span>
                            <div className="mt-1 text-sm text-gray-700">
                              {item.actionsTaken || <span className="text-gray-500 italic">None</span>}
                            </div>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 uppercase tracking-wide">To Do</span>
                            <div className="mt-1 text-sm text-gray-700">
                              {item.toDo || <span className="text-gray-500 italic">None</span>}
                            </div>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 uppercase tracking-wide">Outcome</span>
                            <div className="mt-1 text-sm text-gray-700">
                              {item.outcome || <span className="text-gray-500 italic">None</span>}
                            </div>
                          </div>
                        </div>
                      </div>
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
                    // Show selected treatments if available, otherwise show all treatments
                    const riskTreatments = item.selectedTreatments && item.selectedTreatments.length > 0
                      ? allRiskTreatments.filter(treatment => {
                          if (typeof item.selectedTreatments[0] === 'string') {
                            return (item.selectedTreatments as string[]).includes(treatment.treatmentJiraTicket)
                          } else {
                            return (item.selectedTreatments as {treatmentJiraTicket: string}[]).some(
                              st => st.treatmentJiraTicket === treatment.treatmentJiraTicket
                            )
                          }
                        })
                      : allRiskTreatments
                    

                    
                    return (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        {/* Risk Information */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-gray-500 uppercase tracking-wide">Risk ID: {item.riskId}</span>
                            {risk && (
                              <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-md">
                                {risk.riskLevel}
                              </span>
                            )}
                          </div>
                          
                          {risk && (
                            <div className="space-y-2 mb-4">
                              <div>
                                <span className="text-xs text-gray-500 uppercase tracking-wide">Risk Statement</span>
                                <div className="mt-1 text-sm text-gray-700">
                                  {risk.riskStatement}
                                </div>
                              </div>
                              <div>
                                <span className="text-xs text-gray-500 uppercase tracking-wide">Information Asset</span>
                                <div className="mt-1 text-sm text-gray-700">
                                  {risk.informationAsset}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Risk Treatments */}
                        {riskTreatments.length > 0 && (
                          <div className="mb-4">
                            <span className="text-xs text-gray-500 uppercase tracking-wide">Risk Treatments</span>
                            <div className="mt-2 space-y-2">
                              {riskTreatments.map((treatment, treatmentIndex) => {
                                const treatmentMinutes = getTreatmentMinutes(treatment.treatmentJiraTicket, item.selectedTreatments)
                                return (
                                  <div key={treatmentIndex} className="bg-white rounded p-3 border border-gray-200">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                      <div>
                                        <span className="text-xs text-gray-500">Treatment Description</span>
                                        <div className="mt-1 text-sm text-gray-700">{treatment.riskTreatment}</div>
                                      </div>
                                      <div>
                                        <span className="text-xs text-gray-500">Owner</span>
                                        <div className="mt-1 text-sm text-gray-700">{treatment.riskTreatmentOwner}</div>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-gray-100">
                                      <div>
                                        <span className="text-xs text-gray-500">Actions Taken</span>
                                        <div className="mt-1 text-sm text-gray-700">{treatmentMinutes?.actionsTaken || <span className="text-gray-500 italic">None</span>}</div>
                                      </div>
                                      <div>
                                        <span className="text-xs text-gray-500">To Do</span>
                                        <div className="mt-1 text-sm text-gray-700">{treatmentMinutes?.toDo || <span className="text-gray-500 italic">None</span>}</div>
                                      </div>
                                      <div>
                                        <span className="text-xs text-gray-500">Outcome</span>
                                        <div className="mt-1 text-sm text-gray-700">{treatmentMinutes?.outcome || <span className="text-gray-500 italic">None</span>}</div>
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {/* Meeting Minutes */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <span className="text-xs text-gray-500 uppercase tracking-wide">Actions Taken</span>
                            <div className="mt-1 text-sm text-gray-700">
                              {item.actionsTaken || <span className="text-gray-500 italic">None</span>}
                            </div>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 uppercase tracking-wide">To Do</span>
                            <div className="mt-1 text-sm text-gray-700">
                              {item.toDo || <span className="text-gray-500 italic">None</span>}
                            </div>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 uppercase tracking-wide">Outcome</span>
                            <div className="mt-1 text-sm text-gray-700">
                              {item.outcome || <span className="text-gray-500 italic">None</span>}
                            </div>
                          </div>
                        </div>
                      </div>
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
                    // Show selected treatments if available, otherwise show all treatments
                    const riskTreatments = item.selectedTreatments && item.selectedTreatments.length > 0
                      ? allRiskTreatments.filter(treatment => {
                          if (typeof item.selectedTreatments[0] === 'string') {
                            return (item.selectedTreatments as string[]).includes(treatment.treatmentJiraTicket)
                          } else {
                            return (item.selectedTreatments as {treatmentJiraTicket: string}[]).some(
                              st => st.treatmentJiraTicket === treatment.treatmentJiraTicket
                            )
                          }
                        })
                      : allRiskTreatments
                    

                    
                    return (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        {/* Risk Information */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-gray-500 uppercase tracking-wide">Risk ID: {item.riskId}</span>
                            {risk && (
                              <span className="text-xs px-2 py-1 bg-orange-100 text-orange-800 rounded-md">
                                {risk.riskLevel}
                              </span>
                            )}
                          </div>
                          
                          {risk && (
                            <div className="space-y-2 mb-4">
                              <div>
                                <span className="text-xs text-gray-500 uppercase tracking-wide">Risk Statement</span>
                                <div className="mt-1 text-sm text-gray-700">
                                  {risk.riskStatement}
                                </div>
                              </div>
                              <div>
                                <span className="text-xs text-gray-500 uppercase tracking-wide">Information Asset</span>
                                <div className="mt-1 text-sm text-gray-700">
                                  {risk.informationAsset}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Risk Treatments */}
                        {riskTreatments.length > 0 && (
                          <div className="mb-4">
                            <span className="text-xs text-gray-500 uppercase tracking-wide">Risk Treatments</span>
                            <div className="mt-2 space-y-2">
                              {riskTreatments.map((treatment, treatmentIndex) => {
                                const treatmentMinutes = getTreatmentMinutes(treatment.treatmentJiraTicket, item.selectedTreatments)
                                return (
                                  <div key={treatmentIndex} className="bg-white rounded p-3 border border-gray-200">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                      <div>
                                        <span className="text-xs text-gray-500">Treatment Description</span>
                                        <div className="mt-1 text-sm text-gray-700">{treatment.riskTreatment}</div>
                                      </div>
                                      <div>
                                        <span className="text-xs text-gray-500">Owner</span>
                                        <div className="mt-1 text-sm text-gray-700">{treatment.riskTreatmentOwner}</div>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-gray-100">
                                      <div>
                                        <span className="text-xs text-gray-500">Actions Taken</span>
                                        <div className="mt-1 text-sm text-gray-700">{treatmentMinutes?.actionsTaken || <span className="text-gray-500 italic">None</span>}</div>
                                      </div>
                                      <div>
                                        <span className="text-xs text-gray-500">To Do</span>
                                        <div className="mt-1 text-sm text-gray-700">{treatmentMinutes?.toDo || <span className="text-gray-500 italic">None</span>}</div>
                                      </div>
                                      <div>
                                        <span className="text-xs text-gray-500">Outcome</span>
                                        <div className="mt-1 text-sm text-gray-700">{treatmentMinutes?.outcome || <span className="text-gray-500 italic">None</span>}</div>
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {/* Meeting Minutes */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <span className="text-xs text-gray-500 uppercase tracking-wide">Actions Taken</span>
                            <div className="mt-1 text-sm text-gray-700">
                              {item.actionsTaken || <span className="text-gray-500 italic">None</span>}
                            </div>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 uppercase tracking-wide">To Do</span>
                            <div className="mt-1 text-sm text-gray-700">
                              {item.toDo || <span className="text-gray-500 italic">None</span>}
                            </div>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 uppercase tracking-wide">Outcome</span>
                            <div className="mt-1 text-sm text-gray-700">
                              {item.outcome || <span className="text-gray-500 italic">None</span>}
                            </div>
                          </div>
                        </div>
                      </div>
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
    </div>
  )
} 