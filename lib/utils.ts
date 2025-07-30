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