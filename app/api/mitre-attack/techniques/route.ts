import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getEnvironmentConfig } from '@/lib/mitre-security-config'
import { secureFetch, validateStixObject, sanitizeString, logSecurityEvent } from '@/lib/mitre-security-utils'

/*
 * MITRE ATTACK Framework Integration using STIX Data Feeds
 * 
 * This implementation uses secure, validated access to MITRE ATTACK data
 * with proper caching and fallback mechanisms.
 * 
 * Security Features:
 * - Content-Type validation
 * - JSON schema validation
 * - Rate limiting and caching
 * - Secure fallback to trusted sample data
 * - Input sanitization and validation
 */

interface MitreTechnique {
  id: string
  name: string
  description: string
  tactic: string
  tacticName: string
  platforms: string[]
  url: string
}

// STIX data validation schema
interface StixObject {
  type: string
  id: string
  name?: string
  description?: string
  external_references?: Array<{
    source_name: string
    external_id: string
  }>
  kill_chain_phases?: Array<{
    kill_chain_name: string
    phase_name: string
  }>
  x_mitre_platforms?: string[]
}

interface StixData {
  objects: StixObject[]
}

// Get environment-specific configuration
const config = getEnvironmentConfig()

// In-memory cache (in production, consider using Redis or similar)
let techniqueCache: {
  data: MitreTechnique[]
  timestamp: number
  source: string
} | null = null

// Get available tactics and platforms for filtering
function getMetadata() {
  const tactics = [
    { id: 'TA0001', name: 'Initial Access' },
    { id: 'TA0002', name: 'Execution' },
    { id: 'TA0003', name: 'Persistence' },
    { id: 'TA0004', name: 'Privilege Escalation' },
    { id: 'TA0005', name: 'Defense Evasion' },
    { id: 'TA0006', name: 'Credential Access' },
    { id: 'TA0007', name: 'Discovery' },
    { id: 'TA0008', name: 'Lateral Movement' },
    { id: 'TA0009', name: 'Collection' },
    { id: 'TA0010', name: 'Exfiltration' },
    { id: 'TA0011', name: 'Command and Control' },
    { id: 'TA0040', name: 'Impact' }
  ]

  const platforms = [
    'Windows',
    'macOS', 
    'Linux',
    'PRE',
    'Office Suite',
    'Identity Provider',
    'SaaS',
    'IaaS',
    'Network Devices',
    'Containers',
    'ESXi'
  ]

  return NextResponse.json({
    success: true,
    data: {
      tactics,
      platforms
    }
  })
}

// Validate STIX data structure and content
function validateStixData(data: any): data is StixData {
  if (!data || typeof data !== 'object') {
    return false
  }
  
  if (!Array.isArray(data.objects)) {
    return false
  }
  
  // Limit the number of objects to prevent memory issues
  if (data.objects.length > config.validation.maxObjects) {
    return false
  }
  
  // More flexible validation - check that most objects have required properties
  // Allow some objects to be malformed as long as we have enough valid ones
  const validObjects = data.objects.filter((obj: any) => {
    return obj && 
           typeof obj === 'object' && 
           typeof obj.type === 'string' &&
           typeof obj.id === 'string'
  })
  
  // Require at least 80% of objects to be valid
  const minValidPercentage = 0.8
  const validPercentage = validObjects.length / data.objects.length
  
  return validPercentage >= minValidPercentage
}

// Sanitize and validate technique data
function sanitizeTechnique(technique: any): MitreTechnique | null {
  try {
    // Extract MITRE ID from external references with validation
    const mitreId = technique.external_references?.find((ref: any) => 
      ref?.source_name === 'mitre-attack' && 
      ref?.external_id && 
      typeof ref.external_id === 'string' &&
      ref.external_id.match(config.patterns.mitreTechniqueId) // MITRE technique ID format
    )?.external_id || technique.id
    
    if (!mitreId || !technique.name) {
      return null
    }
    
    // Extract tactic information with validation
    const tactic = technique.kill_chain_phases?.[0]
    const tacticName = tactic?.phase_name || 'Unknown Tactic'
    
    // Extract and validate platform information
    const platforms = Array.isArray(technique.x_mitre_platforms) 
      ? technique.x_mitre_platforms.filter((p: any) => 
          typeof p === 'string' && p.length <= config.validation.maxPlatformNameLength
        ).slice(0, config.validation.maxPlatformsPerTechnique)
      : []
    
    // Sanitize strings to prevent XSS
    const sanitizedName = sanitizeString(technique.name, config.validation.maxNameLength)
    const sanitizedDescription = technique.description 
      ? sanitizeString(technique.description, config.validation.maxDescriptionLength)
      : 'No description available'
    
    return {
      id: mitreId,
      name: sanitizedName,
      description: sanitizedDescription,
      tactic: tactic?.kill_chain_name || '',
      tacticName,
      platforms,
      url: `https://attack.mitre.org/techniques/${mitreId}`
    }
  } catch (error) {
    console.warn('Error sanitizing technique:', error)
    return null
  }
}

// Fetch and validate MITRE ATTACK STIX data securely
async function fetchMitreData(): Promise<MitreTechnique[]> {
  // Check cache first
  if (techniqueCache && (Date.now() - techniqueCache.timestamp) < config.cache.duration) {
    return techniqueCache.data
  }
  
  // Use official MITRE ATTACK STIX feed
  const MITRE_STIX_URL = config.endpoints.primary
  
  try {
    // Use secure fetch utility with built-in validation
    const response = await secureFetch(MITRE_STIX_URL, {
      method: 'GET',
      headers: {
        'User-Agent': config.request.userAgent
      }
    })
    
    const data = await response.json()
    
    // Validate the data structure
    if (!validateStixData(data)) {
      logSecurityEvent('invalid_stix_data', { url: MITRE_STIX_URL })
      throw new Error('Invalid STIX data structure received')
    }
    
    // Parse and sanitize techniques with additional validation
    const techniques = data.objects
      .filter((obj: StixObject) => obj.type === 'attack-pattern')
      .filter(validateStixObject) // Additional security validation
      .map(sanitizeTechnique)
      .filter((technique): technique is MitreTechnique => technique !== null)
      .slice(0, config.validation.maxTechniques) // Limit techniques for performance
    
    if (techniques.length === 0) {
      throw new Error('No valid techniques found in MITRE data')
    }
    
    // Log successful data fetch
    logSecurityEvent('data_fetch_success', { 
      count: techniques.length, 
      source: 'MITRE ATTACK STIX Feed' 
    })
    
    // Update cache
    techniqueCache = {
      data: techniques,
      timestamp: Date.now(),
      source: 'MITRE ATTACK STIX Feed'
    }
    
    return techniques
    
  } catch (error) {
    console.warn('Failed to fetch from MITRE API:', error)
    
    // Log security event for failed fetch
    logSecurityEvent('data_fetch_failure', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      url: MITRE_STIX_URL
    })
    
    // If cache exists and is not too old, use it even if expired
    if (techniqueCache && (Date.now() - techniqueCache.timestamp) < config.cache.gracePeriod) {
      console.log('Using expired cache data due to API failure')
      return techniqueCache.data
    }
    
    throw error
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    // If requesting metadata (tactics and platforms), return that instead
    if (type === 'metadata') {
      return getMetadata()
    }

    try {
      // Attempt to fetch from MITRE ATTACK STIX feed with proper validation
      const techniques = await fetchMitreData()
      
      return NextResponse.json({
        success: true,
        data: techniques,
        count: techniques.length,
        source: techniqueCache?.source || 'MITRE ATTACK STIX Feed',
        lastUpdated: new Date().toISOString(),
        cacheStatus: techniqueCache ? 'cached' : 'fresh'
      })
      
    } catch (mitreError) {
      console.warn('Failed to fetch from MITRE STIX feed, falling back to sample data:', mitreError)
      
      // Fallback to trusted sample data
      const techniques = getSampleMitreData()
      
      return NextResponse.json({
        success: true,
        data: techniques,
        count: techniques.length,
        note: 'Using trusted sample data due to MITRE STIX feed error. Feed may be temporarily unavailable.',
        source: 'Trusted Sample Data (Fallback)',
        lastUpdated: new Date().toISOString(),
        fallbackReason: mitreError instanceof Error ? mitreError.message : 'Unknown error'
      })
    }
    
  } catch (error) {
    console.error('Error in MITRE ATTACK API:', error)
    
    // Final fallback to trusted sample data
    const sampleData = getSampleMitreData()
    
    return NextResponse.json({
      success: true,
      data: sampleData,
      count: sampleData.length,
      note: 'Using trusted sample data due to system error',
      source: 'Trusted Sample Data (Error Fallback)',
      lastUpdated: new Date().toISOString()
    })
  }
}

// Sample MITRE ATTACK data based on actual Enterprise techniques from https://attack.mitre.org/techniques/enterprise/
function getSampleMitreData(): MitreTechnique[] {
  return [
    {
      id: 'T1548',
      name: 'Abuse Elevation Control Mechanism',
      description: 'Adversaries may circumvent mechanisms designed to control elevate privileges to gain higher-level permissions. Most modern systems contain native elevation control mechanisms that are intended to limit privileges that a user can perform on a machine.',
      tactic: 'TA0004',
      tacticName: 'Privilege Escalation',
      platforms: ['Windows', 'macOS', 'Linux'],
      url: 'https://attack.mitre.org/techniques/T1548'
    },
    {
      id: 'T1134',
      name: 'Access Token Manipulation',
      description: 'Adversaries may modify access tokens to operate under a different user or system security context to perform actions and bypass access controls. Windows uses access tokens to determine the ownership of a running process.',
      tactic: 'TA0004',
      tacticName: 'Privilege Escalation',
      platforms: ['Windows'],
      url: 'https://attack.mitre.org/techniques/T1134'
    },
    {
      id: 'T1531',
      name: 'Account Access Removal',
      description: 'Adversaries may interrupt availability of system and network resources by inhibiting access to accounts utilized by legitimate users. Accounts may be deleted, locked, or manipulated to remove access.',
      tactic: 'TA0040',
      tacticName: 'Impact',
      platforms: ['Windows', 'macOS', 'Linux', 'Office Suite', 'SaaS', 'IaaS'],
      url: 'https://attack.mitre.org/techniques/T1531'
    },
    {
      id: 'T1078',
      name: 'Valid Accounts',
      description: 'Adversaries may obtain and abuse credentials of existing accounts as a means of gaining Initial Access, Persistence, Privilege Escalation, or Defense Evasion.',
      tactic: 'TA0001',
      tacticName: 'Initial Access',
      platforms: ['Windows', 'macOS', 'Linux', 'Office Suite', 'SaaS', 'IaaS', 'Network Devices'],
      url: 'https://attack.mitre.org/techniques/T1078'
    },
    {
      id: 'T1055',
      name: 'Process Injection',
      description: 'Adversaries may inject code into processes in order to evade process-based defenses as well as possibly elevate privileges. Process injection is a method of executing arbitrary code in the address space of a separate live process.',
      tactic: 'TA0002',
      tacticName: 'Execution',
      platforms: ['Windows', 'macOS', 'Linux'],
      url: 'https://attack.mitre.org/techniques/T1055'
    },
    {
      id: 'T1053',
      name: 'Scheduled Task/Job',
      description: 'Adversaries may abuse task scheduling functionality to gain initial access, persistence, and privilege escalation. Most modern operating systems have built-in functionality to schedule programs or scripts to be executed at a specified date and time.',
      tactic: 'TA0003',
      tacticName: 'Persistence',
      platforms: ['Windows', 'macOS', 'Linux'],
      url: 'https://attack.mitre.org/techniques/T1053'
    },
    {
      id: 'T1083',
      name: 'File and Directory Discovery',
      description: 'Adversaries may enumerate files and directories or may search in specific locations of a host or network share for certain information within a file system.',
      tactic: 'TA0007',
      tacticName: 'Discovery',
      platforms: ['Windows', 'macOS', 'Linux'],
      url: 'https://attack.mitre.org/techniques/T1078'
    },
    {
      id: 'T1562',
      name: 'Impair Defenses',
      description: 'Adversaries may modify system configurations to disable security tools and logging capabilities. This can be done to prevent detection of their activities and to maintain persistence.',
      tactic: 'TA0005',
      tacticName: 'Defense Evasion',
      platforms: ['Windows', 'macOS', 'Linux'],
      url: 'https://attack.mitre.org/techniques/T1562'
    },
    {
      id: 'T1071',
      name: 'Application Layer Protocol',
      description: 'Adversaries may communicate using application layer protocols to avoid detection/network filtering by blending in with existing traffic. Commands to the remote system, and often the results of those commands, will be embedded within the protocol traffic between the client and server.',
      tactic: 'TA0011',
      tacticName: 'Command and Control',
      platforms: ['Windows', 'macOS', 'Linux', 'Network Devices'],
      url: 'https://attack.mitre.org/techniques/T1071'
    },
    {
      id: 'T1041',
      name: 'Exfiltration Over C2 Channel',
      description: 'Adversaries may steal data by exfiltrating it over an existing Command and Control channel. The stolen data is encoded into the normal communications channel using the same protocol as command and control communications.',
      tactic: 'TA0010',
      tacticName: 'Exfiltration',
      platforms: ['Windows', 'macOS', 'Linux', 'Office Suite', 'SaaS', 'IaaS'],
      url: 'https://attack.mitre.org/techniques/T1041'
    },
    {
      id: 'T1490',
      name: 'Inhibit System Recovery',
      description: 'Adversaries may delete or remove built-in operating system data and turn off services designed to aid in the recovery of a corrupted system to prevent recovery.',
      tactic: 'TA0040',
      tacticName: 'Impact',
      platforms: ['Windows', 'macOS', 'Linux'],
      url: 'https://attack.mitre.org/techniques/T1490'
    },
    {
      id: 'T1673',
      name: 'Virtual Machine Discovery',
      description: 'An adversary may attempt to enumerate running virtual machines (VMs) after gaining access to a host or hypervisor. For example, adversaries may enumerate a list of VMs on an ESXi hypervisor using a Hypervisor CLI.',
      tactic: 'TA0007',
      tacticName: 'Discovery',
      platforms: ['ESXi', 'Containers'],
      url: 'https://attack.mitre.org/techniques/T1673'
    },
    {
      id: 'T1497',
      name: 'Virtualization/Sandbox Evasion',
      description: 'Adversaries may employ various means to detect and avoid virtualization and analysis environments. This may include changing behaviors based on the results of checks for the presence of artifacts indicative of a virtual machine environment (VME) or sandbox.',
      tactic: 'TA0005',
      tacticName: 'Defense Evasion',
      platforms: ['Windows', 'macOS', 'Linux', 'Containers'],
      url: 'https://attack.mitre.org/techniques/T1497'
    },
    {
      id: 'T1600',
      name: 'Weaken Encryption',
      description: 'Adversaries may compromise a network device\'s encryption capability in order to bypass encryption that would otherwise protect data communications.',
      tactic: 'TA0005',
      tacticName: 'Defense Evasion',
      platforms: ['Network Devices'],
      url: 'https://attack.mitre.org/techniques/T1600'
    },
    {
      id: 'T1102',
      name: 'Web Service',
      description: 'Adversaries may use an existing, legitimate external Web service as a means for relaying data to/from a compromised system. Popular websites, cloud services, and social media acting as a mechanism for C2 may give a significant amount of cover.',
      tactic: 'TA0011',
      tacticName: 'Command and Control',
      platforms: ['SaaS', 'IaaS', 'Office Suite'],
      url: 'https://attack.mitre.org/techniques/T1102'
    }
  ]
}
