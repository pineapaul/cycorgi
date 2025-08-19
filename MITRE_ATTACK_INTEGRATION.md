# MITRE ATTACK Framework Integration Guide

## Current Implementation Status

The Threat Library currently uses **sample data** for MITRE ATTACK techniques instead of real-time data from the MITRE ATTACK framework. This is because **MITRE ATTACK does not provide a traditional REST API**.

## Why Sample Data?

### 1. **No Official REST API**
- MITRE ATTACK is designed as a knowledge base, not an API service
- The framework is accessible via web pages at [https://attack.mitre.org/techniques/enterprise/](https://attack.mitre.org/techniques/enterprise/)
- There is no `https://attack.mitre.org/api/` endpoint

### 2. **Current URLs in Code**
```typescript
// These URLs are NOT API endpoints
const MITRE_TECHNIQUES_URL = 'https://attack.mitre.org/techniques/enterprise/'
const MITRE_TACTICS_URL = 'https://attack.mitre.org/tactics/enterprise/'
```

These URLs return HTML pages, not JSON data.

## Production-Ready Alternatives

### 1. **Official STIX Data Feeds** ⭐ **Recommended**
- **URL**: [https://attack.mitre.org/stix/](https://attack.mitre.org/stix/)
- **Format**: STIX 2.1 JSON
- **Update Frequency**: Real-time
- **License**: MITRE License

```bash
# Example STIX feed URLs
https://raw.githubusercontent.com/mitre/cti/master/enterprise-attack/enterprise-attack.json
https://raw.githubusercontent.com/mitre/cti/master/ics-attack/ics-attack.json
https://raw.githubusercontent.com/mitre/cti/master/mobile-attack/mobile-attack.json
```

### 2. **MITRE ATTACK Python Library**
- **Repository**: [https://github.com/mitre/cti](https://github.com/mitre/cti)
- **Installation**: `pip install mitre-attack`
- **Features**: Direct access to STIX data, filtering, searching

```python
from mitre.attack import Attack
attack = Attack()
techniques = attack.enterprise.techniques
```

### 3. **Web Scraping** ⚠️ **Use with Caution**
- **Approach**: Parse HTML from technique pages
- **Requirements**: Rate limiting, error handling, maintenance
- **Example**: Scrape [https://attack.mitre.org/techniques/T1548/](https://attack.mitre.org/techniques/T1548/)

### 4. **Third-Party Threat Intelligence APIs**
- **AlienVault OTX**: Free tier available
- **IBM X-Force**: Commercial
- **Recorded Future**: Commercial
- **VirusTotal**: Limited free tier

## Implementation Examples

### Option 1: STIX Feed Integration

```typescript
// app/api/mitre-attack/techniques/route.ts
const STIX_FEED_URL = 'https://raw.githubusercontent.com/mitre/cti/master/enterprise-attack/enterprise-attack.json'

export async function GET() {
  try {
    const response = await fetch(STIX_FEED_URL)
    const stixData = await response.json()
    
    // Parse STIX objects
    const techniques = stixData.objects
      .filter(obj => obj.type === 'attack-pattern')
      .map(technique => ({
        id: technique.external_references?.[0]?.external_id || technique.id,
        name: technique.name,
        description: technique.description,
        tactic: technique.kill_chain_phases?.[0]?.phase_name || '',
        tacticName: technique.kill_chain_phases?.[0]?.phase_name || '',
        url: `https://attack.mitre.org/techniques/${technique.external_references?.[0]?.external_id}`
      }))
    
    return NextResponse.json({ success: true, data: techniques })
  } catch (error) {
    // Fallback to sample data
    return NextResponse.json({ 
      success: true, 
      data: getSampleMitreData(),
      note: 'Using sample data due to STIX feed error'
    })
  }
}
```

### Option 2: Python Library via API Wrapper

```python
# scripts/mitre_attack_wrapper.py
from mitre.attack import Attack
import json

def get_techniques():
    attack = Attack()
    techniques = []
    
    for technique in attack.enterprise.techniques:
        techniques.append({
            'id': technique.id,
            'name': technique.name,
            'description': technique.description,
            'tactic': technique.tactic.name if technique.tactic else '',
            'tacticName': technique.tactic.name if technique.tactic else '',
            'url': f"https://attack.mitre.org/techniques/{technique.id}"
        })
    
    return techniques

if __name__ == "__main__":
    techniques = get_techniques()
    with open('mitre_techniques.json', 'w') as f:
        json.dump(techniques, f, indent=2)
```

### Option 3: Web Scraping Implementation

```typescript
// app/api/mitre-attack/techniques/route.ts
import { JSDOM } from 'jsdom'

async function scrapeMitreTechniques(): Promise<MitreTechnique[]> {
  const response = await fetch('https://attack.mitre.org/techniques/enterprise/')
  const html = await response.text()
  const dom = new JSDOM(html)
  
  const techniques: MitreTechnique[] = []
  const rows = dom.window.document.querySelectorAll('table tbody tr')
  
  rows.forEach(row => {
    const cells = row.querySelectorAll('td')
    if (cells.length >= 3) {
      const id = cells[0]?.textContent?.trim()
      const name = cells[1]?.textContent?.trim()
      const description = cells[2]?.textContent?.trim()
      
      if (id && name) {
        techniques.push({
          id,
          name,
          description: description || 'No description available',
          tactic: '', // Would need to scrape tactic pages separately
          tacticName: '',
          url: `https://attack.mitre.org/techniques/${id}`
        })
      }
    }
  })
  
  return techniques
}
```

## Recommended Production Implementation

### Phase 1: STIX Feed Integration
1. **Implement STIX feed fetching** with proper error handling
2. **Add caching** (24-hour cache with fallback to sample data)
3. **Implement rate limiting** to respect MITRE's servers
4. **Add data validation** for STIX objects

### Phase 2: Enhanced Features
1. **Real-time updates** via webhook or scheduled jobs
2. **Multiple feed support** (Enterprise, ICS, Mobile)
3. **Advanced filtering** by tactic, platform, etc.
4. **Data versioning** and change tracking

### Phase 3: Advanced Integration
1. **Threat intelligence correlation** with other sources
2. **Automated threat mapping** to your organization's assets
3. **Risk scoring** based on MITRE techniques
4. **Reporting and analytics** integration

## Current Sample Data

The current implementation includes **15 realistic MITRE ATTACK techniques** based on actual Enterprise techniques:

- **T1548**: Abuse Elevation Control Mechanism
- **T1134**: Access Token Manipulation  
- **T1531**: Account Access Removal
- **T1078**: Valid Accounts
- **T1055**: Process Injection
- **T1053**: Scheduled Task/Job
- **T1083**: File and Directory Discovery
- **T1562**: Impair Defenses
- **T1071**: Application Layer Protocol
- **T1041**: Exfiltration Over C2 Channel
- **T1490**: Inhibit System Recovery
- **T1673**: Virtual Machine Discovery
- **T1497**: Virtualization/Sandbox Evasion
- **T1600**: Weaken Encryption
- **T1102**: Web Service

## Next Steps

1. **Choose integration method** based on your requirements
2. **Implement STIX feed integration** for production use
3. **Add proper error handling** and fallback mechanisms
4. **Consider caching** to reduce API calls
5. **Monitor and maintain** the integration

## Resources

- [MITRE ATTACK Framework](https://attack.mitre.org/)
- [STIX Data Feeds](https://attack.mitre.org/stix/)
- [MITRE CTI GitHub Repository](https://github.com/mitre/cti)
- [STIX 2.1 Specification](https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html)
- [MITRE ATTACK Python Library](https://pypi.org/project/mitre-attack/)

## Support

For questions about MITRE ATTACK integration:
1. Check the [MITRE ATTACK FAQ](https://attack.mitre.org/resources/faq/)
2. Review the [STIX documentation](https://attack.mitre.org/stix/)
3. Consult the [MITRE CTI repository](https://github.com/mitre/cti) for examples
4. Consider reaching out to the MITRE ATTACK community
