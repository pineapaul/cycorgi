// Workshop validation constants and utilities
export const VALID_SECURITY_COMMITTEES = [
  'Core Systems Engineering',
  'Software Engineering', 
  'IP Engineering'
] as const

export const VALID_STATUSES = [
  'Pending Agenda',
  'Planned',
  'Scheduled', 
  'Finalising Meeting Minutes',
  'Completed'
] as const

export type WorkshopStatus = typeof VALID_STATUSES[number]

// Type guard for workshop status validation
const isValidWorkshopStatus = (status: unknown): status is WorkshopStatus => {
  return typeof status === 'string' && VALID_STATUSES.some(validStatus => validStatus === status)
}

export interface MeetingMinutesItem {
  riskId: string
  actionsTaken?: string
  toDo?: string
  outcome?: string
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
  [key: string]: any
}

// Validate Meeting Minutes item structure
const validateMeetingMinutesItem = (item: any, sectionName: string): void => {
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
    data.extensions.forEach((item: any, index: number) => {
      validateMeetingMinutesItem(item, `Extensions item ${index + 1}`)
    })
  }
  
  if (data.closure) {
    data.closure.forEach((item: any, index: number) => {
      validateMeetingMinutesItem(item, `Closure item ${index + 1}`)
    })
  }
  
  if (data.newRisks) {
    data.newRisks.forEach((item: any, index: number) => {
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
  
  // Validate status
  if (!isValidWorkshopStatus(data.status)) {
    throw new Error(`Invalid status: "${data.status}". Must be one of: ${VALID_STATUSES.join(', ')}`)
  }
  
  // Validate Meeting Minutes structure
  validateMeetingMinutesArrays(data)
}

// Validate workshop data for PUT requests (only validates provided fields)
export const validateWorkshopForUpdate = (data: WorkshopData): void => {
  // Validate status if provided
  if (data.status && !isValidWorkshopStatus(data.status)) {
    throw new Error(`Invalid status: "${data.status}". Must be one of: ${VALID_STATUSES.join(', ')}`)
  }
  
  // Validate Meeting Minutes structure if provided
  validateMeetingMinutesArrays(data)
} 