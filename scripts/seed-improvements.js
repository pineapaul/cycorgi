const { MongoClient } = require('mongodb')
const path = require('path')
const fs = require('fs')

// Load environment variables from .env.local
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    const envVars = {}
    
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim()
        if (!key.startsWith('#')) {
          envVars[key.trim()] = value.replace(/^["'""'']|["'""'']$/g, '') // Remove quotes
        }
      }
    })
    
    // Set environment variables
    Object.keys(envVars).forEach(key => {
      process.env[key] = envVars[key]
    })
  }
}

// Load environment variables
loadEnvFile()

// MongoDB connection string from environment
const MONGODB_URI = process.env.MONGODB_URI

// Sample data for improvements
const sampleImprovements = [
  {
    functionalUnit: 'IT Security',
    status: 'In Progress',
    dateRaised: '2024-01-15',
    raisedBy: 'John Smith',
    location: 'Sydney Office',
    ofiJiraTicket: 'OFI-2024-001',
    informationAsset: 'Customer Database',
    description: 'Implement multi-factor authentication for all customer-facing applications to enhance security posture',
    assignedTo: 'Sarah Johnson',
    benefitScore: 8,
    jobSize: 'Medium',
    wsjf: 64,
    prioritisedQuarter: 'Q1 2024',
    actionTaken: 'MFA solution selected and implementation plan developed',
    completionDate: null,
    dateApprovedForClosure: null
  },
  {
    functionalUnit: 'HR',
    status: 'Completed',
    dateRaised: '2023-11-20',
    raisedBy: 'Lisa Wang',
    location: 'Melbourne Office',
    ofiJiraTicket: 'OFI-2023-045',
    informationAsset: 'Employee Records',
    description: 'Enhance data retention policies and implement automated cleanup procedures',
    assignedTo: 'David Brown',
    benefitScore: 7,
    jobSize: 'Small',
    wsjf: 49,
    prioritisedQuarter: 'Q4 2023',
    actionTaken: 'Policy updated and automated cleanup implemented',
    completionDate: '2024-01-10',
    dateApprovedForClosure: '2024-01-15'
  },
  {
    functionalUnit: 'Finance',
    status: 'Planning',
    dateRaised: '2024-02-01',
    raisedBy: 'Robert Davis',
    location: 'Brisbane Office',
    ofiJiraTicket: 'OFI-2024-012',
    informationAsset: 'Financial Reports',
    description: 'Implement automated backup verification and restore testing procedures',
    assignedTo: 'Emily Wilson',
    benefitScore: 9,
    jobSize: 'Large',
    wsjf: 81,
    prioritisedQuarter: 'Q2 2024',
    actionTaken: 'Requirements gathering and vendor evaluation in progress',
    completionDate: null,
    dateApprovedForClosure: null
  },
  {
    functionalUnit: 'Operations',
    status: 'On Hold',
    dateRaised: '2023-12-10',
    raisedBy: 'Kevin Thompson',
    location: 'Perth Office',
    ofiJiraTicket: 'OFI-2023-052',
    informationAsset: 'Network Infrastructure',
    description: 'Upgrade network monitoring tools and implement proactive alerting',
    assignedTo: 'Mike Chen',
    benefitScore: 6,
    jobSize: 'Medium',
    wsjf: 42,
    prioritisedQuarter: 'Q1 2024',
    actionTaken: 'Project temporarily suspended due to resource constraints',
    completionDate: null,
    dateApprovedForClosure: null
  },
  {
    functionalUnit: 'Development',
    status: 'In Progress',
    dateRaised: '2024-01-08',
    raisedBy: 'Jennifer Lee',
    location: 'Remote',
    ofiJiraTicket: 'OFI-2024-008',
    informationAsset: 'Source Code Repository',
    description: 'Implement automated security scanning in CI/CD pipeline',
    assignedTo: 'Alex Rodriguez',
    benefitScore: 8,
    jobSize: 'Medium',
    wsjf: 56,
    prioritisedQuarter: 'Q1 2024',
    actionTaken: 'Security tools integrated, testing phase in progress',
    completionDate: null,
    dateApprovedForClosure: null
  },
  {
    functionalUnit: 'Legal',
    status: 'Completed',
    dateRaised: '2023-10-15',
    raisedBy: 'Patricia Garcia',
    location: 'Sydney Office',
    ofiJiraTicket: 'OFI-2023-038',
    informationAsset: 'Legal Documents',
    description: 'Implement document classification and access control improvements',
    assignedTo: 'Tom Wilson',
    benefitScore: 7,
    jobSize: 'Small',
    wsjf: 49,
    prioritisedQuarter: 'Q4 2023',
    actionTaken: 'Classification system implemented and staff trained',
    completionDate: '2023-12-20',
    dateApprovedForClosure: '2024-01-05'
  },
  {
    functionalUnit: 'Marketing',
    status: 'Planning',
    dateRaised: '2024-02-05',
    raisedBy: 'Helen Rodriguez',
    location: 'Melbourne Office',
    ofiJiraTicket: 'OFI-2024-015',
    informationAsset: 'Marketing Campaign Data',
    description: 'Enhance data privacy controls for customer marketing data',
    assignedTo: 'Rachel Green',
    benefitScore: 8,
    jobSize: 'Medium',
    wsjf: 64,
    prioritisedQuarter: 'Q2 2024',
    actionTaken: 'Privacy impact assessment completed, implementation plan in development',
    completionDate: null,
    dateApprovedForClosure: null
  },
  {
    functionalUnit: 'Sales',
    status: 'In Progress',
    dateRaised: '2024-01-22',
    raisedBy: 'Mark Johnson',
    location: 'Brisbane Office',
    ofiJiraTicket: 'OFI-2024-020',
    informationAsset: 'Sales Pipeline Data',
    description: 'Implement data loss prevention for sensitive sales information',
    assignedTo: 'Amanda White',
    benefitScore: 7,
    jobSize: 'Small',
    wsjf: 49,
    prioritisedQuarter: 'Q1 2024',
    actionTaken: 'DLP solution configured and initial testing completed',
    completionDate: null,
    dateApprovedForClosure: null
  },
  {
    functionalUnit: 'Support',
    status: 'Completed',
    dateRaised: '2023-11-05',
    raisedBy: 'Anna Davis',
    location: 'Perth Office',
    ofiJiraTicket: 'OFI-2023-041',
    informationAsset: 'Customer Support Tickets',
    description: 'Implement secure ticket handling and data sanitization',
    assignedTo: 'Steve Johnson',
    benefitScore: 6,
    jobSize: 'Small',
    wsjf: 42,
    prioritisedQuarter: 'Q4 2023',
    actionTaken: 'Secure handling procedures implemented and staff trained',
    completionDate: '2023-12-15',
    dateApprovedForClosure: '2023-12-20'
  },
  {
    functionalUnit: 'Research',
    status: 'Planning',
    dateRaised: '2024-02-10',
    raisedBy: 'Carlos Martinez',
    location: 'Remote',
    ofiJiraTicket: 'OFI-2024-025',
    informationAsset: 'Research Data',
    description: 'Implement data classification and encryption for research materials',
    assignedTo: 'Daniel Kim',
    benefitScore: 9,
    jobSize: 'Large',
    wsjf: 81,
    prioritisedQuarter: 'Q2 2024',
    actionTaken: 'Data classification framework developed, encryption requirements defined',
    completionDate: null,
    dateApprovedForClosure: null
  }
]

async function seedDatabase() {
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in environment variables')
    console.log('💡 Make sure your .env.local file contains MONGODB_URI=your_connection_string')
    process.exit(1)
  }
  
  const client = new MongoClient(MONGODB_URI)
  
  try {
    console.log('🔗 Connecting to MongoDB...')
    console.log(`📡 Using URI: ${MONGODB_URI.substring(0, 20)}...`)
    await client.connect()
    
    const db = client.db('cycorgi')
    const collection = db.collection('improvements')
    
    // Clear existing data
    console.log('🧹 Clearing existing improvements data...')
    await collection.deleteMany({})
    
    // Add timestamps to sample data
    const now = new Date().toISOString()
    const improvementsWithTimestamps = sampleImprovements.map(improvement => ({
      ...improvement,
      createdAt: now,
      updatedAt: now
    }))
    
    // Insert sample data
    console.log('📝 Inserting sample improvements data...')
    const result = await collection.insertMany(improvementsWithTimestamps)
    
    console.log(`✅ Successfully seeded database with ${result.insertedCount} improvements`)
    console.log('\n📊 Sample data includes:')
    console.log('- IT Security: MFA implementation (In Progress)')
    console.log('- HR: Data retention policy enhancement (Completed)')
    console.log('- Finance: Backup verification automation (Planning)')
    console.log('- Operations: Network monitoring upgrade (On Hold)')
    console.log('- Development: Security scanning in CI/CD (In Progress)')
    console.log('- And 5 more diverse improvements...')
    
    console.log('\n🎯 Improvement statistics:')
    const statusCounts = await collection.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]).toArray()
    
    statusCounts.forEach(status => {
      console.log(`   - ${status._id}: ${status.count} improvements`)
    })
    
  } catch (error) {
    console.error('❌ Error seeding database:', error)
  } finally {
    await client.close()
    console.log('\n🔗 Database connection closed')
  }
}

// Run the seeding function
seedDatabase()
