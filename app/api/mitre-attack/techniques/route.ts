import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/*
 * MITRE ATTACK Framework Integration using STIX Data Feeds
 * 
 * This implementation now uses the official MITRE ATTACK STIX data feeds
 * for real-time access to technique data.
 * 
 * STIX Feed URLs:
 * - Enterprise: https://raw.githubusercontent.com/mitre/cti/master/enterprise-attack/enterprise-attack.json
 * - ICS: https://raw.githubusercontent.com/mitre/cti/master/ics-attack/ics-attack.json
 * - Mobile: https://raw.githubusercontent.com/mitre/cti/master/mobile-attack/mobile-attack.json
 */

interface MitreTechnique {
  id: string
  name: string
  description: string
  tactic: string
  tacticName: string
  url: string
}



export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch from MITRE ATTACK STIX feed
    const STIX_FEED_URL = 'https://raw.githubusercontent.com/mitre/cti/master/enterprise-attack/enterprise-attack.json'
    
    try {
      const response = await fetch(STIX_FEED_URL, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Cycorgi-Threat-Library/1.0'
        }
      })
      
      if (!response.ok) {
        throw new Error(`STIX feed responded with status: ${response.status}`)
      }
      
      const stixData = await response.json()
      
      // Parse STIX objects to extract techniques
      const techniques = stixData.objects
        .filter((obj: any) => obj.type === 'attack-pattern')
        .map((technique: any) => {
          // Extract MITRE ID from external references
          const mitreId = technique.external_references?.find((ref: any) => 
            ref.source_name === 'mitre-attack'
          )?.external_id || technique.id
          
          // Extract tactic information
          const tactic = technique.kill_chain_phases?.[0]
          
          return {
            id: mitreId,
            name: technique.name,
            description: technique.description || 'No description available',
            tactic: tactic?.kill_chain_name || '',
            tacticName: tactic?.phase_name || 'Unknown Tactic',
            url: `https://attack.mitre.org/techniques/${mitreId}`
          }
        })
        .filter((technique: any) => technique.id && technique.name) // Filter out invalid entries
      
      if (techniques.length > 0) {
        return NextResponse.json({
          success: true,
          data: techniques,
          count: techniques.length,
          source: 'MITRE ATTACK STIX Feed',
          lastUpdated: new Date().toISOString()
        })
      } else {
        throw new Error('No valid techniques found in STIX data')
      }
      
    } catch (stixError) {
      console.warn('Failed to fetch from STIX feed, falling back to sample data:', stixError)
      
      // Fallback to sample data if STIX feed fails
      const techniques = getSampleMitreData()
      
      return NextResponse.json({
        success: true,
        data: techniques,
        count: techniques.length,
        note: 'Using sample data due to STIX feed error. STIX feed may be temporarily unavailable.',
        source: 'Sample Data (Fallback)',
        lastUpdated: new Date().toISOString()
      })
    }
    
  } catch (error) {
    console.error('Error in MITRE ATTACK API:', error)
    
    // Final fallback to sample data
    const sampleData = getSampleMitreData()
    
    return NextResponse.json({
      success: true,
      data: sampleData,
      count: sampleData.length,
      note: 'Using sample data due to error',
      source: 'Sample Data (Error Fallback)',
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
      url: 'https://attack.mitre.org/techniques/T1548'
    },
    {
      id: 'T1134',
      name: 'Access Token Manipulation',
      description: 'Adversaries may modify access tokens to operate under a different user or system security context to perform actions and bypass access controls. Windows uses access tokens to determine the ownership of a running process.',
      tactic: 'TA0004',
      tacticName: 'Privilege Escalation',
      url: 'https://attack.mitre.org/techniques/T1134'
    },
    {
      id: 'T1531',
      name: 'Account Access Removal',
      description: 'Adversaries may interrupt availability of system and network resources by inhibiting access to accounts utilized by legitimate users. Accounts may be deleted, locked, or manipulated to remove access.',
      tactic: 'TA0040',
      tacticName: 'Impact',
      url: 'https://attack.mitre.org/techniques/T1531'
    },
    {
      id: 'T1078',
      name: 'Valid Accounts',
      description: 'Adversaries may obtain and abuse credentials of existing accounts as a means of gaining Initial Access, Persistence, Privilege Escalation, or Defense Evasion.',
      tactic: 'TA0001',
      tacticName: 'Initial Access',
      url: 'https://attack.mitre.org/techniques/T1078'
    },
    {
      id: 'T1055',
      name: 'Process Injection',
      description: 'Adversaries may inject code into processes in order to evade process-based defenses as well as possibly elevate privileges. Process injection is a method of executing arbitrary code in the address space of a separate live process.',
      tactic: 'TA0002',
      tacticName: 'Execution',
      url: 'https://attack.mitre.org/techniques/T1055'
    },
    {
      id: 'T1053',
      name: 'Scheduled Task/Job',
      description: 'Adversaries may abuse task scheduling functionality to gain initial access, persistence, and privilege escalation. Most modern operating systems have built-in functionality to schedule programs or scripts to be executed at a specified date and time.',
      tactic: 'TA0003',
      tacticName: 'Persistence',
      url: 'https://attack.mitre.org/techniques/T1053'
    },
    {
      id: 'T1083',
      name: 'File and Directory Discovery',
      description: 'Adversaries may enumerate files and directories or may search in specific locations of a host or network share for certain information within a file system.',
      tactic: 'TA0007',
      tacticName: 'Discovery',
      url: 'https://attack.mitre.org/techniques/T1078'
    },
    {
      id: 'T1562',
      name: 'Impair Defenses',
      description: 'Adversaries may modify system configurations to disable security tools and logging capabilities. This can be done to prevent detection of their activities and to maintain persistence.',
      tactic: 'TA0005',
      tacticName: 'Defense Evasion',
      url: 'https://attack.mitre.org/techniques/T1562'
    },
    {
      id: 'T1071',
      name: 'Application Layer Protocol',
      description: 'Adversaries may communicate using application layer protocols to avoid detection/network filtering by blending in with existing traffic. Commands to the remote system, and often the results of those commands, will be embedded within the protocol traffic between the client and server.',
      tactic: 'TA0011',
      tacticName: 'Command and Control',
      url: 'https://attack.mitre.org/techniques/T1071'
    },
    {
      id: 'T1041',
      name: 'Exfiltration Over C2 Channel',
      description: 'Adversaries may steal data by exfiltrating it over an existing Command and Control channel. The stolen data is encoded into the normal communications channel using the same protocol as command and control communications.',
      tactic: 'TA0010',
      tacticName: 'Exfiltration',
      url: 'https://attack.mitre.org/techniques/T1041'
    },
    {
      id: 'T1490',
      name: 'Inhibit System Recovery',
      description: 'Adversaries may delete or remove built-in operating system data and turn off services designed to aid in the recovery of a corrupted system to prevent recovery.',
      tactic: 'TA0040',
      tacticName: 'Impact',
      url: 'https://attack.mitre.org/techniques/T1490'
    },
    {
      id: 'T1673',
      name: 'Virtual Machine Discovery',
      description: 'An adversary may attempt to enumerate running virtual machines (VMs) after gaining access to a host or hypervisor. For example, adversaries may enumerate a list of VMs on an ESXi hypervisor using a Hypervisor CLI.',
      tactic: 'TA0007',
      tacticName: 'Discovery',
      url: 'https://attack.mitre.org/techniques/T1673'
    },
    {
      id: 'T1497',
      name: 'Virtualization/Sandbox Evasion',
      description: 'Adversaries may employ various means to detect and avoid virtualization and analysis environments. This may include changing behaviors based on the results of checks for the presence of artifacts indicative of a virtual machine environment (VME) or sandbox.',
      tactic: 'TA0005',
      tacticName: 'Defense Evasion',
      url: 'https://attack.mitre.org/techniques/T1497'
    },
    {
      id: 'T1600',
      name: 'Weaken Encryption',
      description: 'Adversaries may compromise a network device\'s encryption capability in order to bypass encryption that would otherwise protect data communications.',
      tactic: 'TA0005',
      tacticName: 'Defense Evasion',
      url: 'https://attack.mitre.org/techniques/T1600'
    },
    {
      id: 'T1102',
      name: 'Web Service',
      description: 'Adversaries may use an existing, legitimate external Web service as a means for relaying data to/from a compromised system. Popular websites, cloud services, and social media acting as a mechanism for C2 may give a significant amount of cover.',
      tactic: 'TA0011',
      tacticName: 'Command and Control',
      url: 'https://attack.mitre.org/techniques/T1102'
    }
  ]
}
