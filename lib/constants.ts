// Application-wide constants for status values and other configuration

export const TREATMENT_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected'
} as const

export const EXTENSION_STATUS = {
  PENDING_APPROVAL: 'Pending Approval',
  APPROVED: 'Approved',
  REJECTED: 'Rejected'
} as const

export const RISK_PHASES = {
  DRAFT: 'Draft',
  IDENTIFICATION: 'Identification',
  ANALYSIS: 'Analysis',
  EVALUATION: 'Evaluation',
  TREATMENT: 'Treatment',
  MONITORING: 'Monitoring',
  CLOSED: 'Closed'
} as const

export const RISK_RATINGS = {
  EXTREME: 'Extreme',
  HIGH: 'High',
  MODERATE: 'Moderate',
  LOW: 'Low'
} as const

export const CONSEQUENCE_RATINGS = {
  CRITICAL: 'Critical',
  MAJOR: 'Major',
  MODERATE: 'Moderate',
  MINOR: 'Minor',
  INSIGNIFICANT: 'Insignificant'
} as const

export const LIKELIHOOD_RATINGS = {
  ALMOST_CERTAIN: 'Almost Certain',
  CERTAIN: 'Certain',
  POSSIBLE: 'Possible',
  UNLIKELY: 'Unlikely',
  RARE: 'Rare',
  INCONSEQUENTIAL: 'Inconsequential'
} as const

// Data parsing constants
export const CIA_DELIMITERS = {
  PRIMARY: ', ',
  ALTERNATIVES: /[,;|]/ // Regex for comma, semicolon, or pipe
} as const

// Type definitions for better type safety
export type TreatmentStatus = typeof TREATMENT_STATUS[keyof typeof TREATMENT_STATUS]
export type ExtensionStatus = typeof EXTENSION_STATUS[keyof typeof EXTENSION_STATUS]
export type RiskPhase = typeof RISK_PHASES[keyof typeof RISK_PHASES]
export type RiskRating = typeof RISK_RATINGS[keyof typeof RISK_RATINGS]
export type ConsequenceRating = typeof CONSEQUENCE_RATINGS[keyof typeof CONSEQUENCE_RATINGS]
export type LikelihoodRating = typeof LIKELIHOOD_RATINGS[keyof typeof LIKELIHOOD_RATINGS] 