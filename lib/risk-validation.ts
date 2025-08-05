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
  consequence?: string
  likelihood?: string
  currentRiskRating?: string
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
  transformedData?: any
}

/**
 * Validates and transforms informationAsset field to ensure consistent array of ID strings format
 */
export function validateAndTransformInformationAsset(
  informationAsset: any,
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
      .map((item: any) => {
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
      .filter(Boolean)
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
  const transformedData: any = { ...data }

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

  // Validate risk ratings
  const validRatings = ['High', 'Medium', 'Low']
  if (data.currentRiskRating && !validRatings.includes(data.currentRiskRating)) {
    errors.push(`Invalid current risk rating: ${data.currentRiskRating}. Must be one of: ${validRatings.join(', ')}`)
  }
  if (data.residualRiskRating && !validRatings.includes(data.residualRiskRating)) {
    errors.push(`Invalid residual risk rating: ${data.residualRiskRating}. Must be one of: ${validRatings.join(', ')}`)
  }

  // Validate phases
  const validPhases = ['Identification', 'Analysis', 'Evaluation', 'Treatment', 'Monitoring']
  if (data.currentPhase && !validPhases.includes(data.currentPhase)) {
    errors.push(`Invalid current phase: ${data.currentPhase}. Must be one of: ${validPhases.join(', ')}`)
  }

  // Validate dates
  const dateFields = [
    'dateRiskRaised', 'dateOfSSCApproval', 'dateRiskTreatmentsApproved',
    'dateResidualRiskAccepted', 'dateRiskTreatmentCompleted'
  ]
  
  dateFields.forEach(field => {
    const value = data[field as keyof RiskData]
    if (value && typeof value === 'string') {
      const date = new Date(value)
      if (isNaN(date.getTime())) {
        errors.push(`Invalid date format for ${field}: ${value}`)
      }
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
    transformedData: errors.length === 0 ? transformedData : undefined
  }
}

/**
 * Transforms risk data from database format to API response format
 */
export function transformRiskForResponse(risk: any, assetMap: Map<string, InformationAsset>): any {
  const transformed = { ...risk }

  // Transform informationAsset to objects with id and name
  if (risk.informationAsset) {
    if (Array.isArray(risk.informationAsset)) {
      transformed.informationAsset = risk.informationAsset.map((assetId: string) => {
        const foundAsset = assetMap.get(assetId)
        return foundAsset 
          ? { id: assetId, name: foundAsset.informationAsset }
          : { id: assetId, name: assetId }
      })
    } else if (typeof risk.informationAsset === 'string') {
      // Handle old string format
      const assetIds = risk.informationAsset.split(',').map((id: string) => id.trim())
      transformed.informationAsset = assetIds.map((id: string) => {
        const foundAsset = assetMap.get(id)
        return foundAsset 
          ? { id, name: foundAsset.informationAsset }
          : { id, name: id }
      })
    }
  } else {
    transformed.informationAsset = []
  }

  // Transform impact array to impactCIA string for frontend compatibility
  if (risk.impact && Array.isArray(risk.impact)) {
    transformed.impactCIA = risk.impact.join(', ')
  }

  return transformed
}

/**
 * Creates a map of available information asset IDs for validation
 */
export function createAssetIdMap(assets: InformationAsset[]): Set<string> {
  return new Set(assets.map(asset => asset.id))
} 