import { VALID_STATUSES } from './constants'

export type WorkshopStatus = typeof VALID_STATUSES[number]

const isValidWorkshopStatus = (status: unknown): status is WorkshopStatus => {
  return typeof status === 'string' && VALID_STATUSES.includes(status as WorkshopStatus)
}

export interface TreatmentMinutes {
  treatmentId: string
  treatmentJira?: string
  actionsTaken?: string
  toDo?: string
  outcome?: string
}

type SelectedTreatments = string[] | TreatmentMinutes[]

const isStringArray = (selectedTreatments: SelectedTreatments): selectedTreatments is string[] => {
  return Array.isArray(selectedTreatments) && selectedTreatments.every(item => typeof item === 'string')
}

const isTreatmentMinutesArray = (selectedTreatments: SelectedTreatments): selectedTreatments is TreatmentMinutes[] => {
  return Array.isArray(selectedTreatments) && selectedTreatments.every(item => 
    typeof item === 'object' && item !== null && typeof item.treatmentId === 'string'
  )
}

// This function is not used but kept for potential future use
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const isEmptyOrTreatmentMinutesArray = (selectedTreatments: SelectedTreatments): boolean => {
  return selectedTreatments.length === 0 || isTreatmentMinutesArray(selectedTreatments)
}

export interface MeetingMinutesItem {
  riskId: string
  selectedTreatments?: SelectedTreatments // Array of treatment details with their own minutes
  actionsTaken?: string // General risk-level actions taken
  toDo?: string // General risk-level to do
  outcome?: string // General risk-level outcome
}

export interface WorkshopData {
  id?: string
  date?: string
  facilitator?: string
  securitySteeringCommittee?: string
  status?: string
  extensions?: MeetingMinutesItem[]
  closure?: MeetingMinutesItem[]
  newRisks?: MeetingMinutesItem[]
  [key: string]: unknown
}

// Validate Treatment Minutes structure
const validateTreatmentMinutes = (treatment: TreatmentMinutes, sectionName: string): void => {
  if (!treatment.treatmentId || typeof treatment.treatmentId !== 'string') {
    throw new Error(`${sectionName}: Each treatment must have a valid treatmentId string`)
  }
  if (treatment.treatmentJira && typeof treatment.treatmentJira !== 'string') {
    throw new Error(`${sectionName}: treatment treatmentJira must be a string`)
  }
  if (treatment.actionsTaken && typeof treatment.actionsTaken !== 'string') {
    throw new Error(`${sectionName}: treatment actionsTaken must be a string`)
  }
  if (treatment.toDo && typeof treatment.toDo !== 'string') {
    throw new Error(`${sectionName}: treatment toDo must be a string`)
  }
  if (treatment.outcome && typeof treatment.outcome !== 'string') {
    throw new Error(`${sectionName}: treatment outcome must be a string`)
  }
}

// Validate Meeting Minutes item structure
const validateMeetingMinutesItem = (item: MeetingMinutesItem, sectionName: string): void => {
  if (!item.riskId || typeof item.riskId !== 'string') {
    throw new Error(`${sectionName}: Each item must have a valid riskId string`)
  }
  if (item.actionsTaken && typeof item.actionsTaken !== 'string') {
    throw new Error(`${sectionName}: actionsTaken must be a string`)
  }
  if (item.toDo && typeof item.toDo !== 'string') {
    throw new Error(`${sectionName}: toDo must be a string`)
  }
  if (item.outcome && typeof item.outcome !== 'string') {
    throw new Error(`${sectionName}: outcome must be a string`)
  }
  
  // Validate selectedTreatments if present
  if (item.selectedTreatments && Array.isArray(item.selectedTreatments)) {
    if (isStringArray(item.selectedTreatments)) {
      // Validate string array - each item should be a string
      item.selectedTreatments.forEach((treatmentId: string, index: number) => {
        if (typeof treatmentId !== 'string') {
          throw new Error(`${sectionName} treatment ${index + 1}: treatmentId must be a string`)
        }
      })
    } else if (isTreatmentMinutesArray(item.selectedTreatments)) {
      // Validate TreatmentMinutes array
      item.selectedTreatments.forEach((treatment: TreatmentMinutes, index: number) => {
        validateTreatmentMinutes(treatment, `${sectionName} treatment ${index + 1}`)
      })
    } else {
      throw new Error(`${sectionName}: selectedTreatments must be either string[] or TreatmentMinutes[]`)
    }
  }
}

// Validate Meeting Minutes arrays
const validateMeetingMinutesArrays = (data: WorkshopData): void => {
  if (data.extensions && !Array.isArray(data.extensions)) {
    throw new Error('Extensions must be an array')
  }
  
  if (data.closure && !Array.isArray(data.closure)) {
    throw new Error('Closure must be an array')
  }
  
  if (data.newRisks && !Array.isArray(data.newRisks)) {
    throw new Error('New Risks must be an array')
  }
  
  // Validate each item in the arrays if they exist
  if (data.extensions) {
    data.extensions.forEach((item: MeetingMinutesItem, index: number) => {
      validateMeetingMinutesItem(item, `Extensions item ${index + 1}`)
    })
  }
  
  if (data.closure) {
    data.closure.forEach((item: MeetingMinutesItem, index: number) => {
      validateMeetingMinutesItem(item, `Closure item ${index + 1}`)
    })
  }
  
  if (data.newRisks) {
    data.newRisks.forEach((item: MeetingMinutesItem, index: number) => {
      validateMeetingMinutesItem(item, `New Risks item ${index + 1}`)
    })
  }
}

// Validate workshop data for POST requests (requires all mandatory fields)
export const validateWorkshopForCreate = (data: WorkshopData): void => {
  // Required fields validation
  if (!data.id || !data.date) {
    throw new Error('Missing required fields: id and date are required')
  }
  
  // Validate date format
  if (data.date) {
    const date = new Date(data.date)
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format')
    }
  }
  
  // Validate status if provided
  if (data.status && !isValidWorkshopStatus(data.status)) {
    throw new Error(`Invalid status: ${data.status}. Must be one of: ${VALID_STATUSES.join(', ')}`)
  }
  
  // Validate string fields
  if (data.facilitator && typeof data.facilitator !== 'string') {
    throw new Error('Facilitator must be a string')
  }
  
  if (data.securitySteeringCommittee && typeof data.securitySteeringCommittee !== 'string') {
    throw new Error('Security Steering Committee must be a string')
  }
  
  // Validate arrays
  validateMeetingMinutesArrays(data)
}

// Validate workshop data for PUT requests (all fields optional but must be valid if present)
export const validateWorkshopForUpdate = (data: WorkshopData): void => {
  // Validate date format if provided
  if (data.date) {
    const date = new Date(data.date)
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format')
    }
  }
  
  // Validate status if provided
  if (data.status && !isValidWorkshopStatus(data.status)) {
    throw new Error(`Invalid status: ${data.status}. Must be one of: ${VALID_STATUSES.join(', ')}`)
  }
  
  // Validate string fields if provided
  if (data.facilitator !== undefined && typeof data.facilitator !== 'string') {
    throw new Error('Facilitator must be a string')
  }
  
  if (data.securitySteeringCommittee !== undefined && typeof data.securitySteeringCommittee !== 'string') {
    throw new Error('Security Steering Committee must be a string')
  }
  
  // Validate arrays if provided
  validateMeetingMinutesArrays(data)
} 