import { ObjectId } from 'mongodb'

export interface InformationAsset {
  id: string
  informationAsset: string
  category: string
}

export interface RiskData {
  riskId?: string
  functionalUnit?: string
  jiraTicket?: string
  dateRiskRaised?: string
  raisedBy?: string
  riskOwner?: string
  affectedSites?: string
  informationAsset?: string[] | string
  threat?: string
  vulnerability?: string
  riskStatement?: string
  impactCIA?: string
  currentControls?: string
  currentControlsReference?: string
  consequenceRating?: string
  likelihoodRating?: string
  riskRating?: string
  riskAction?: string
  reasonForAcceptance?: string
  dateOfSSCApproval?: string
  riskTreatments?: string
  dateRiskTreatmentsApproved?: string
  riskTreatmentAssignedTo?: string
  residualConsequence?: string
  residualLikelihood?: string
  residualRiskRating?: string
  residualRiskAcceptedByOwner?: string
  dateResidualRiskAccepted?: string
  dateRiskTreatmentCompleted?: string
  currentPhase?: string
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  transformedData?: RiskData
}

/**
 * Validates and transforms informationAsset field to ensure consistent array of ID strings format
 */
export function validateAndTransformInformationAsset(
  informationAsset: string | string[] | null | undefined,
  availableAssetIds: Set<string> = new Set()
): { isValid: boolean; errors: string[]; transformedData: string[] } {
  const errors: string[] = []
  let transformedData: string[] = []

  // Handle null/undefined
  if (informationAsset == null) {
    return { isValid: true, errors: [], transformedData: [] }
  }

  // Handle string format (old format or comma-separated)
  if (typeof informationAsset === 'string') {
    if (informationAsset.trim() === '') {
      return { isValid: true, errors: [], transformedData: [] }
    }
    
    const assetIds = informationAsset.split(',').map((id: string) => id.trim()).filter(Boolean)
    transformedData = assetIds
  }
  // Handle array format
  else if (Array.isArray(informationAsset)) {
    transformedData = informationAsset
      .map((item: string | { id?: string; name?: string }) => {
        if (typeof item === 'string') {
          return item.trim()
        } else if (item && typeof item === 'object' && item.id) {
          return item.id.toString()
        } else if (item && typeof item === 'object' && item.name) {
          // If we have a name but no ID, we can't reliably convert it
          errors.push(`Invalid information asset format: ${JSON.stringify(item)}`)
          return null
        }
        return null
      })
      .filter((item): item is string => item !== null)
  }
  // Handle invalid format
  else {
    errors.push(`Invalid informationAsset format: expected string or array, got ${typeof informationAsset}`)
    return { isValid: false, errors, transformedData: [] }
  }

  // Validate that all IDs are strings and not empty
  const invalidIds = transformedData.filter(id => typeof id !== 'string' || id.trim() === '')
  if (invalidIds.length > 0) {
    errors.push(`Invalid information asset IDs: ${invalidIds.join(', ')}`)
  }

  // If we have available asset IDs, validate against them
  if (availableAssetIds.size > 0) {
    const unknownIds = transformedData.filter(id => !availableAssetIds.has(id))
    if (unknownIds.length > 0) {
      errors.push(`Unknown information asset IDs: ${unknownIds.join(', ')}`)
    }
  }

  // Remove duplicates
  transformedData = [...new Set(transformedData)]

  return {
    isValid: errors.length === 0,
    errors,
    transformedData
  }
}

/**
 * Validates and transforms a complete risk object
 */
export function validateAndTransformRiskData(
  data: RiskData,
  availableAssetIds: Set<string> = new Set()
): ValidationResult {
  const errors: string[] = []
  const transformedData: RiskData = { ...data }

  // Validate required fields
  if (!data.riskId || typeof data.riskId !== 'string' || data.riskId.trim() === '') {
    errors.push('Risk ID is required and must be a non-empty string')
  }

  // Validate and transform informationAsset
  const infoAssetValidation = validateAndTransformInformationAsset(
    data.informationAsset,
    availableAssetIds
  )
  
  if (!infoAssetValidation.isValid) {
    errors.push(...infoAssetValidation.errors)
  } else {
    transformedData.informationAsset = infoAssetValidation.transformedData
  }

  // Validate other required fields
  if (!data.riskStatement || typeof data.riskStatement !== 'string' || data.riskStatement.trim() === '') {
    errors.push('Risk statement is required and must be a non-empty string')
  }

  if (!data.threat || typeof data.threat !== 'string' || data.threat.trim() === '') {
    errors.push('Threat is required and must be a non-empty string')
  }

  if (!data.vulnerability || typeof data.vulnerability !== 'string' || data.vulnerability.trim() === '') {
    errors.push('Vulnerability is required and must be a non-empty string')
  }

  if (!data.consequenceRating || typeof data.consequenceRating !== 'string' || data.consequenceRating.trim() === '') {
    errors.push('Consequence rating is required and must be a non-empty string')
  }

  if (!data.likelihoodRating || typeof data.likelihoodRating !== 'string' || data.likelihoodRating.trim() === '') {
    errors.push('Likelihood rating is required and must be a non-empty string')
  }

  if (!data.riskRating || typeof data.riskRating !== 'string' || data.riskRating.trim() === '') {
    errors.push('Risk rating is required and must be a non-empty string')
  }

  if (!data.riskOwner || typeof data.riskOwner !== 'string' || data.riskOwner.trim() === '') {
    errors.push('Risk owner is required and must be a non-empty string')
  }

  if (!data.raisedBy || typeof data.raisedBy !== 'string' || data.raisedBy.trim() === '') {
    errors.push('Raised by is required and must be a non-empty string')
  }

  if (!data.functionalUnit || typeof data.functionalUnit !== 'string' || data.functionalUnit.trim() === '') {
    errors.push('Functional unit is required and must be a non-empty string')
  }

  return {
    isValid: errors.length === 0,
    errors,
    transformedData: errors.length === 0 ? transformedData : undefined
  }
}

/**
 * Validates risk ID format
 */
export function validateRiskId(riskId: string): string | null {
  if (!riskId || typeof riskId !== 'string') {
    return null
  }

  const trimmedId = riskId.trim()
  
  // Check if it's already in the correct format
  if (/^RISK-\d{3}$/.test(trimmedId)) {
    return trimmedId
  }

  // Try to extract a number from the string
  const numberMatch = trimmedId.match(/\d+/)
  if (numberMatch) {
    const number = parseInt(numberMatch[0], 10)
    if (number >= 1 && number <= 999) {
      return `RISK-${number.toString().padStart(3, '0')}`
    }
  }

  return null
}

/**
 * Transforms a risk object for API response, including information asset details
 */
export function transformRiskForResponse(risk: RiskData & { _id?: string | ObjectId }, assetMap: Map<string, InformationAsset>): RiskData & { _id?: string; informationAssetDetails?: InformationAsset[] } {
  const transformedRisk = { ...risk } as RiskData & { _id?: string; informationAssetDetails?: InformationAsset[] }
  
  // Convert ObjectId to string if present
  if (transformedRisk._id && typeof transformedRisk._id === 'object') {
    transformedRisk._id = (transformedRisk._id as any).toString()
  }

  // Add information asset details if we have asset IDs
  if (transformedRisk.informationAsset && Array.isArray(transformedRisk.informationAsset)) {
    transformedRisk.informationAssetDetails = transformedRisk.informationAsset
      .map(assetId => assetMap.get(assetId))
      .filter((asset): asset is InformationAsset => asset !== undefined)
  }

  return transformedRisk
}

/**
 * Creates a map of asset IDs for quick lookup
 */
export function createAssetIdMap(assets: InformationAsset[]): Set<string> {
  return new Set(assets.map(asset => asset.id))
} 