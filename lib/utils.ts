import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface CIAConfig {
  bg: string
  text: string
  border: string
  label?: string
}

export function getCIAConfig(ciaType: string): CIAConfig {
  switch (ciaType) {
    case 'Confidentiality':
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        label: 'C'
      }
    case 'Integrity':
      return {
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200',
        label: 'I'
      }
    case 'Availability':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        label: 'A'
      }
    default:
      return {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        border: 'border-gray-200',
        label: ciaType.charAt(0)
      }
  }
}

export function validateRiskId(riskId: string | string[] | undefined): string | null {
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

/**
 * Safely extracts the numeric part from a risk ID
 * Handles cases where the risk ID might not follow the expected RISK-XXX format
 * @param riskId - The risk ID to extract from
 * @returns The numeric part if found, otherwise the original risk ID
 */
export function extractRiskNumber(riskId: string): string {
  if (!riskId || typeof riskId !== 'string') {
    return riskId || ''
  }
  
  // Try to match RISK-XXX format
  const match = riskId.match(/^RISK-(\d+)$/i)
  if (match) {
    return match[1]
  }
  
  // If no match, try to extract any numeric part after a hyphen
  const parts = riskId.split('-')
  if (parts.length >= 2 && parts[1]) {
    return parts[1]
  }
  
  // If no hyphen or no second part, return the original
  return riskId
} 