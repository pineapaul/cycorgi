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
  faBell,
  faWarehouse,
  faBriefcase,
  faSortUp,
  faSortDown,
  faChartSimple,
  faMagnifyingGlass,
  faFile,
  faShield,
  faCheckCircle as faCheckCircleSolid,
  faFolder,
  faArrowRotateRight,
  faWarning,
  faPlus as faPlusSolid,
  faArrowRight,
  faFilter,
  faColumns,
  faTimes,
  faChevronLeft,
  faChevronRight
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
    warehouse: faWarehouse,
    briefcase: faBriefcase,
    'sort-up': faSortUp,
    'sort-down': faSortDown,
    'chart-simple': faChartSimple,
    'magnifying-glass': faMagnifyingGlass,
    file: faFile,
    shield: faShield,
    'check-circle': faCheckCircleSolid,
    folder: faFolder,
    'arrow-clockwise': faArrowRotateRight,
    warning: faWarning,
    plus: faPlusSolid,
    'arrow-right': faArrowRight,
    filter: faFilter,
    columns: faColumns,
    close: faTimes,
    'chevron-left': faChevronLeft,
    'chevron-right': faChevronRight,
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
    warehouse: '🏭',
    briefcase: '💼',
    'sort-up': '⬆️',
    'sort-down': '⬇️',
    'chart-simple': '📊',
    'magnifying-glass': '🔍',
    file: '📄',
    shield: '🛡️',
    'check-circle': '✅',
    folder: '📁',
    'arrow-clockwise': '🔄',
    warning: '⚠️',
    plus: '➕',
    'arrow-right': '➡️',
    filter: '🔍',
    columns: '📊',
    close: '✕',
    'chevron-left': '◀️',
    'chevron-right': '▶️',
  }
  return emojiMap[name] || '📄'
} 