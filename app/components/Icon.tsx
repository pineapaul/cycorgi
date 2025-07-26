'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faTachometerAlt,
  faExclamationTriangle,
  faSearch,
  faFileAlt,
  faCheckCircle,
  faChartLine,
  faCog,
  faPlus,
  faClipboardList,
  faFileInvoice,
  faCogs,
  faCubes,
  faBell
} from '@fortawesome/free-solid-svg-icons'

interface IconProps {
  name: string
  size?: number
  className?: string
}

export default function Icon({ name, size = 20, className = '' }: IconProps) {
  // Font Awesome icon mapping
  const icons: Record<string, any> = {
    dashboard: faTachometerAlt,
    risk: faExclamationTriangle,
    audit: faSearch,
    policies: faFileAlt,
    compliance: faCheckCircle,
    reports: faChartLine,
    settings: faCog,
    add: faPlus,
    audit_new: faClipboardList,
    report: faFileInvoice,
    settings_advanced: faCogs,
    cubes: faCubes,
    bell: faBell,
  }

  const icon = icons[name]

  if (!icon) {
    // Fallback to emoji if icon doesn't exist
    return <span className={`text-lg ${className}`}>{getFallbackEmoji(name)}</span>
  }

  return (
    <FontAwesomeIcon
      icon={icon}
      className={className}
      style={{ width: size, height: size }}
    />
  )
}

function getFallbackEmoji(name: string): string {
  const emojiMap: Record<string, string> = {
    dashboard: '📊',
    risk: '⚠️',
    audit: '🔍',
    policies: '📋',
    compliance: '✅',
    reports: '📈',
    settings: '⚙️',
    add: '➕',
    audit_new: '📋',
    report: '📄',
    settings_advanced: '⚙️',
    cubes: '🧊',
    bell: '🔔',
  }
  return emojiMap[name] || '📄'
} 