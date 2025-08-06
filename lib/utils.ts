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

/**
 * Formats a date string to "dd MMM yyyy" format
 * @param dateString - The date string to format
 * @returns Formatted date string or '-' if invalid/empty
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '-'
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '-'
    
    return date.toLocaleDateString('en-AU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  } catch {
    return '-'
  }
}

/**
 * Formats information assets for display, handling both array and single value formats
 * Supports both new format (objects with id/name) and old format (strings)
 * @param informationAsset - The information asset value which can be a string, array of strings, or array of objects
 * @returns Formatted string representation of the information assets
 */
export function formatInformationAssets(informationAsset: string | Array<{ id: string; name: string }> | string[] | undefined): string {
  if (!informationAsset) return '-'
  
  if (Array.isArray(informationAsset)) {
    return informationAsset.map((asset: any) => {
      // Handle both new format (objects with id/name) and old format (strings)
      if (typeof asset === 'object' && asset !== null) {
        return escapeHtml(asset.name || asset.id || JSON.stringify(asset))
      }
      return escapeHtml(String(asset))
    }).join(', ')
  }
  
  return escapeHtml(String(informationAsset))
}

/**
 * Formats a date string for CSV export (dd/MM/yyyy format)
 * @param dateString - The date string to format
 * @returns Formatted date string or empty string if invalid/empty
 */
export function formatDateForCSV(dateString: string): string {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch (error) {
    return dateString
  }
} 

/**
 * Safely escapes HTML content to prevent XSS attacks
 * @param text - The text to escape
 * @returns Escaped text safe for rendering in JSX
 */
export function escapeHtml(text: string): string {
  if (!text || typeof text !== 'string') return ''
  
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
} 