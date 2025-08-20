import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/*
 * MITRE ATTACK Framework Integration using STIX Data Feeds
 * 
 * This implementation fetches data directly from the official MITRE ATTACK STIX feed.
 * MITRE is a trusted, reputable source, so we can rely on their data structure.
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

// STIX data structure
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

// In-memory cache
let techniqueCache: {
  data: MitreTechnique[]
  timestamp: number
  source: string
} | null = null

const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

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

// Helper function to decode HTML entities
function decodeHtmlEntities(text: string): string {
  if (!text) return text
  
  // Common HTML entities
  const htmlEntities: { [key: string]: string } = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#x27;': "'",
    '&#x2F;': '/',
    '&#x60;': '`',
    '&#x3D;': '=',
    '&#x2B;': '+',
    '&#x23;': '#',
    '&#x25;': '%',
    '&#x40;': '@',
    '&#x5B;': '[',
    '&#x5D;': ']',
    '&#x7B;': '{',
    '&#x7D;': '}',
    '&#x7C;': '|',
    '&#x5C;': '\\',
    '&#x5E;': '^',
    '&#x7E;': '~'
  }
  
  // Replace HTML entities with their actual characters
  let decoded = text
  for (const [entity, char] of Object.entries(htmlEntities)) {
    decoded = decoded.replace(new RegExp(entity, 'g'), char)
  }
  
  // Also handle numeric HTML entities like &#x2F;
  decoded = decoded.replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => {
    return String.fromCharCode(parseInt(hex, 16))
  })
  
  // Handle decimal HTML entities like &#47;
  decoded = decoded.replace(/&#(\d+);/g, (match, decimal) => {
    return String.fromCharCode(parseInt(decimal, 10))
  })
  
  return decoded
}

// Parse and sanitize technique data
function parseTechnique(technique: StixObject): MitreTechnique | null {
  try {
    // Extract MITRE ID from external references
    const mitreId = technique.external_references?.find(ref => 
      ref.source_name === 'mitre-attack' && ref.external_id
    )?.external_id || technique.id
    
    if (!mitreId || !technique.name) {
      return null
    }
    
    // Extract tactic information
    const tactic = technique.kill_chain_phases?.[0]
    const tacticName = tactic?.phase_name || 'Unknown Tactic'
    
    // Extract platform information
    const platforms = Array.isArray(technique.x_mitre_platforms) 
      ? technique.x_mitre_platforms
      : []
    
    return {
      id: mitreId,
      name: decodeHtmlEntities(technique.name),
      description: decodeHtmlEntities(technique.description || 'No description available'),
      tactic: decodeHtmlEntities(tactic?.phase_name || ''),
      tacticName: decodeHtmlEntities(technique.name),
      platforms,
      url: `https://attack.mitre.org/techniques/${mitreId}`
    }
  } catch (error) {
    console.warn('Error parsing technique:', error)
    return null
  }
}

// Fetch MITRE ATTACK STIX data
async function fetchMitreData(): Promise<MitreTechnique[]> {
  // Check cache first
  if (techniqueCache && (Date.now() - techniqueCache.timestamp) < CACHE_DURATION) {
    return techniqueCache.data
  }
  
  // Official MITRE ATTACK STIX feed
  const STIX_FEED_URL = 'https://raw.githubusercontent.com/mitre/cti/master/enterprise-attack/enterprise-attack.json'
  
  try {
    const response = await fetch(STIX_FEED_URL, {
      method: 'GET',
      headers: {
        'User-Agent': 'Cycorgi-Threat-Library/1.0',
        'Accept': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data: StixData = await response.json()
    
    // Parse techniques from STIX data
    const techniques = data.objects
      .filter(obj => obj.type === 'attack-pattern')
      .map(parseTechnique)
      .filter((technique): technique is MitreTechnique => technique !== null)
      .slice(0, 1000) // Limit for performance
    
    if (techniques.length === 0) {
      throw new Error('No techniques found in MITRE data')
    }
    
    // Update cache
    techniqueCache = {
      data: techniques,
      timestamp: Date.now(),
      source: 'MITRE ATTACK STIX Feed'
    }
    
    return techniques
    
  } catch (error) {
    console.warn('Failed to fetch from MITRE STIX feed:', error)
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
      // Attempt to fetch from MITRE ATTACK STIX feed
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
      tactic: 'Privilege Escalation',
      tacticName: 'Abuse Elevation Control Mechanism',
      platforms: ['Windows', 'macOS', 'Linux'],
      url: 'https://attack.mitre.org/techniques/T1548'
    },
    {
      id: 'T1134',
      name: 'Access Token Manipulation',
      description: 'Adversaries may modify access tokens to operate under a different user or system security context to perform actions and bypass access controls. Windows uses access tokens to determine the ownership of a running process.',
      tactic: 'Privilege Escalation',
      tacticName: 'Access Token Manipulation',
      platforms: ['Windows'],
      url: 'https://attack.mitre.org/techniques/T1134'
    },
    {
      id: 'T1531',
      name: 'Account Access Removal',
      description: 'Adversaries may interrupt availability of system and network resources by inhibiting access to accounts utilized by legitimate users. Accounts may be deleted, locked, or manipulated to remove access.',
      tactic: 'Impact',
      tacticName: 'Account Access Removal',
      platforms: ['Windows', 'macOS', 'Linux', 'Office Suite', 'SaaS', 'IaaS'],
      url: 'https://attack.mitre.org/techniques/T1531'
    },
    {
      id: 'T1078',
      name: 'Valid Accounts',
      description: 'Adversaries may obtain and abuse credentials of existing accounts as a means of gaining Initial Access, Persistence, Privilege Escalation, or Defense Evasion.',
      tactic: 'Initial Access',
      tacticName: 'Valid Accounts',
      platforms: ['Windows', 'macOS', 'Linux', 'Office Suite', 'SaaS', 'IaaS', 'Network Devices'],
      url: 'https://attack.mitre.org/techniques/T1078'
    },
    {
      id: 'T1055',
      name: 'Process Injection',
      description: 'Adversaries may inject code into processes in order to evade process-based defenses as well as possibly elevate privileges. Process injection is a method of executing arbitrary code in the address space of a separate live process.',
      tactic: 'Execution',
      tacticName: 'Process Injection',
      platforms: ['Windows', 'macOS', 'Linux'],
      url: 'https://attack.mitre.org/techniques/T1055'
    },
    {
      id: 'T1053',
      name: 'Scheduled Task/Job',
      description: 'Adversaries may abuse task scheduling functionality to gain initial access, persistence, and privilege escalation. Most modern operating systems have built-in functionality to schedule programs or scripts to be executed at a specified date and time.',
      tactic: 'Persistence',
      tacticName: 'Scheduled Task/Job',
      platforms: ['Windows', 'macOS', 'Linux'],
      url: 'https://attack.mitre.org/techniques/T1053'
    },
    {
      id: 'T1083',
      name: 'File and Directory Discovery',
      description: 'Adversaries may enumerate files and directories or may search in specific locations of a host or network share for certain information within a file system.',
      tactic: 'Discovery',
      tacticName: 'File and Directory Discovery',
      platforms: ['Windows', 'macOS', 'Linux'],
      url: 'https://attack.mitre.org/techniques/T1083'
    },
    {
      id: 'T1562',
      name: 'Impair Defenses',
      description: 'Adversaries may modify system configurations to disable security tools and logging capabilities. This can be done to prevent detection of their activities and to maintain persistence.',
      tactic: 'Defense Evasion',
      tacticName: 'Impair Defenses',
      platforms: ['Windows', 'macOS', 'Linux'],
      url: 'https://attack.mitre.org/techniques/T1562'
    },
    {
      id: 'T1071',
      name: 'Application Layer Protocol',
      description: 'Adversaries may communicate using application layer protocols to avoid detection/network filtering by blending in with existing traffic. Commands to the remote system, and often the results of those commands, will be embedded within the protocol traffic between the client and server.',
      tactic: 'Command and Control',
      tacticName: 'Application Layer Protocol',
      platforms: ['Windows', 'macOS', 'Linux', 'Network Devices'],
      url: 'https://attack.mitre.org/techniques/T1071'
    },
    {
      id: 'T1041',
      name: 'Exfiltration Over C2 Channel',
      description: 'Adversaries may steal data by exfiltrating it over an existing Command and Control channel. The stolen data is encoded into the normal communications channel using the same protocol as command and control communications.',
      tactic: 'Exfiltration',
      tacticName: 'Exfiltration Over C2 Channel',
      platforms: ['Windows', 'macOS', 'Linux', 'Office Suite', 'SaaS', 'IaaS'],
      url: 'https://attack.mitre.org/techniques/T1041'
    },
    {
      id: 'T1490',
      name: 'Inhibit System Recovery',
      description: 'Adversaries may delete or remove built-in operating system data and turn off services designed to aid in the recovery of a corrupted system to prevent recovery.',
      tactic: 'Impact',
      tacticName: 'Inhibit System Recovery',
      platforms: ['Windows', 'macOS', 'Linux'],
      url: 'https://attack.mitre.org/techniques/T1490'
    },
    {
      id: 'T1673',
      name: 'Virtual Machine Discovery',
      description: 'An adversary may attempt to enumerate running virtual machines (VMs) after gaining access to a host or hypervisor. For example, adversaries may enumerate a list of VMs on an ESXi hypervisor using a Hypervisor CLI.',
      tactic: 'Discovery',
      tacticName: 'Virtual Machine Discovery',
      platforms: ['ESXi', 'Containers'],
      url: 'https://attack.mitre.org/techniques/T1673'
    },
    {
      id: 'T1497',
      name: 'Virtualization/Sandbox Evasion',
      description: 'Adversaries may employ various means to detect and avoid virtualization and analysis environments. This may include changing behaviors based on the results of checks for the presence of artifacts indicative of a virtual machine environment (VME) or sandbox.',
      tactic: 'Defense Evasion',
      tacticName: 'Virtualization/Sandbox Evasion',
      platforms: ['Windows', 'macOS', 'Linux', 'Containers'],
      url: 'https://attack.mitre.org/techniques/T1497'
    },
    {
      id: 'T1600',
      name: 'Weaken Encryption',
      description: 'Adversaries may compromise a network device\'s encryption capability in order to bypass encryption that would otherwise protect data communications.',
      tactic: 'Defense Evasion',
      tacticName: 'Weaken Encryption',
      platforms: ['Network Devices'],
      url: 'https://attack.mitre.org/techniques/T1600'
    },
    {
      id: 'T1102',
      name: 'Web Service',
      description: 'Adversaries may use an existing, legitimate external Web service as a means for relaying data to/from a compromised system. Popular websites, cloud services, and social media acting as a mechanism for C2 may give a significant amount of cover.',
      tactic: 'Command and Control',
      tacticName: 'Web Service',
      platforms: ['SaaS', 'IaaS', 'Office Suite'],
      url: 'https://attack.mitre.org/techniques/T1102'
    }
  ]
}
