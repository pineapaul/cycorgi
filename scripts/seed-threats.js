const { MongoClient } = require('mongodb')
require('dotenv').config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cycorgi'

const sampleThreats = [
  {
    name: 'Ransomware Attack',
    description: 'Malicious software that encrypts files and demands payment for decryption keys. Can cause significant business disruption and data loss.',
    category: 'Malware',
    severity: 'Critical',
    source: 'Custom',
    tags: ['ransomware', 'encryption', 'extortion', 'business-disruption'],
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    name: 'Phishing Campaign',
    description: 'Social engineering attack where attackers impersonate legitimate entities to steal credentials or sensitive information.',
    category: 'Social Engineering',
    severity: 'High',
    source: 'Custom',
    tags: ['phishing', 'social-engineering', 'credential-theft', 'email'],
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    name: 'SQL Injection',
    description: 'Attack technique that exploits vulnerabilities in database queries to gain unauthorized access to data or execute malicious commands.',
    category: 'Application',
    severity: 'High',
    source: 'Custom',
    tags: ['sql-injection', 'database', 'web-application', 'data-breach'],
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    name: 'DDoS Attack',
    description: 'Distributed Denial of Service attack that overwhelms systems with traffic to make them unavailable to legitimate users.',
    category: 'Network',
    severity: 'Medium',
    source: 'Custom',
    tags: ['ddos', 'network', 'availability', 'traffic-overload'],
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    name: 'Insider Threat',
    description: 'Security risk posed by individuals within an organization who may intentionally or unintentionally cause harm.',
    category: 'Physical',
    severity: 'High',
    source: 'Custom',
    tags: ['insider-threat', 'physical', 'human-factor', 'trusted-user'],
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    name: 'Supply Chain Compromise',
    description: 'Attack that targets third-party vendors or suppliers to gain access to the target organization through trusted relationships.',
    category: 'Supply Chain',
    severity: 'Critical',
    source: 'Custom',
    tags: ['supply-chain', 'third-party', 'vendor', 'trust-relationship'],
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    name: 'Process Injection (T1055)',
    description: 'Adversaries may inject code into processes in order to evade process-based defenses as well as possibly elevate privileges.',
    category: 'Malware',
    severity: 'High',
    mitreId: 'T1055',
    mitreTactic: 'TA0002',
    mitreTechnique: 'Execution',
    source: 'MITRE ATTACK',
    tags: ['process-injection', 'privilege-escalation', 'defense-evasion', 'mitre'],
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    name: 'Valid Accounts (T1078)',
    description: 'Adversaries may obtain and abuse credentials of existing accounts as a means of gaining Initial Access, Persistence, Privilege Escalation, or Defense Evasion.',
    category: 'Social Engineering',
    severity: 'Medium',
    mitreId: 'T1078',
    mitreTactic: 'TA0001',
    mitreTechnique: 'Initial Access',
    source: 'MITRE ATTACK',
    tags: ['valid-accounts', 'credential-abuse', 'initial-access', 'mitre'],
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system'
  }
]

async function seedThreats() {
  const client = new MongoClient(MONGODB_URI)
  
  try {
    await client.connect()
    console.log('Connected to MongoDB')
    
    const db = client.db()
    const threatsCollection = db.collection('threats')
    
    // Check if threats already exist
    const existingCount = await threatsCollection.countDocuments()
    if (existingCount > 0) {
      console.log(`Threats collection already contains ${existingCount} documents. Skipping seed.`)
      return
    }
    
    // Insert sample threats
    const result = await threatsCollection.insertMany(sampleThreats)
    console.log(`Successfully inserted ${result.insertedCount} threats`)
    
    // Create indexes for better performance
    await threatsCollection.createIndex({ name: 1 })
    await threatsCollection.createIndex({ category: 1 })
    await threatsCollection.createIndex({ severity: 1 })
    await threatsCollection.createIndex({ source: 1 })
    await threatsCollection.createIndex({ status: 1 })
    await threatsCollection.createIndex({ tags: 1 })
    await threatsCollection.createIndex({ mitreId: 1 })
    await threatsCollection.createIndex({ createdAt: -1 })
    
    console.log('Created indexes for threats collection')
    
  } catch (error) {
    console.error('Error seeding threats:', error)
  } finally {
    await client.close()
    console.log('Disconnected from MongoDB')
  }
}

// Run the seed function
seedThreats()
  .then(() => {
    console.log('Threat seeding completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Threat seeding failed:', error)
    process.exit(1)
  })
