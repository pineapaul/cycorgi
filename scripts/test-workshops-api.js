const { MongoClient } = require('mongodb')
require('dotenv').config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables')
  console.log('💡 Make sure your .env.local file contains MONGODB_URI=your_connection_string')
  process.exit(1)
}

const uri = MONGODB_URI
const dbName = 'cycorgi'

const sampleWorkshops = [
  {
    id: 'WS-001',
    date: '2024-03-15',
    status: 'Completed',
    facilitator: 'Sarah Johnson',
    participants: ['John Smith', 'Mike Davis', 'Lisa Chen'],
    risks: ['RISK-001', 'RISK-003', 'RISK-005'],
    outcomes: 'Identified 3 new risks, updated 2 existing risk ratings',
    securitySteeringCommittee: 'Core Systems Engineering',
    actionsTaken: 'Implemented new risk monitoring dashboard, updated risk assessment procedures',
    toDo: 'Schedule follow-up review in 3 months',
    notes: 'Team showed excellent engagement during the workshop. Consider expanding to other departments.',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'WS-002',
    date: '2024-04-20',
    status: 'Scheduled',
    facilitator: 'David Wilson',
    participants: ['Sarah Johnson', 'Alex Brown', 'Emma Taylor'],
    risks: ['RISK-002', 'RISK-004'],
    outcomes: '',
    securitySteeringCommittee: 'IP Engineering',
    actionsTaken: '',
    toDo: 'Prepare agenda, send pre-workshop materials to participants',
    notes: 'Focus will be on cybersecurity threats and data protection measures',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'WS-003',
    date: '2024-05-10',
    status: 'Pending Agenda',
    facilitator: 'Lisa Chen',
    participants: ['John Smith', 'David Wilson', 'Mike Davis'],
    risks: ['RISK-006', 'RISK-007'],
    outcomes: '',
    securitySteeringCommittee: 'Software Engineering',
    actionsTaken: '',
    toDo: 'Finalize agenda items, confirm participant availability',
    notes: 'Need to address recent software vulnerabilities identified in audit',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'WS-004',
    date: '2024-06-15',
    status: 'Planned',
    facilitator: 'Alex Brown',
    participants: ['Sarah Johnson', 'Lisa Chen', 'Emma Taylor'],
    risks: ['RISK-008', 'RISK-009'],
    outcomes: '',
    securitySteeringCommittee: 'Core Systems Engineering',
    actionsTaken: '',
    toDo: 'Book meeting room, prepare presentation materials',
    notes: 'Strategic planning session for Q3 risk management initiatives',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'WS-005',
    date: '2024-07-20',
    status: 'Finalising Meeting Minutes',
    facilitator: 'Emma Taylor',
    participants: ['John Smith', 'David Wilson', 'Alex Brown'],
    risks: ['RISK-010'],
    outcomes: 'Completed risk assessment for new cloud migration project',
    securitySteeringCommittee: 'Software Engineering',
    actionsTaken: 'Drafted migration timeline, identified key stakeholders',
    toDo: 'Finalize meeting minutes, distribute action items to team',
    notes: 'Cloud migration risks are well understood. Team confident in proceeding with project.',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

async function testWorkshopsAPI() {
  const client = new MongoClient(uri)
  
  try {
    await client.connect()
    console.log('✅ Connected to MongoDB')
    
    const db = client.db(dbName)
    const collection = db.collection('workshops')
    
    // Clear existing workshops
    await collection.deleteMany({})
    console.log('✅ Cleared existing workshops')
    
    // Insert sample workshops
    const result = await collection.insertMany(sampleWorkshops)
    console.log(`✅ Inserted ${result.insertedCount} workshops`)
    
    // Test fetching workshops
    const workshops = await collection.find({}).toArray()
    console.log(`✅ Retrieved ${workshops.length} workshops from database`)
    
    // Display sample data
    console.log('\n📋 Sample workshop data:')
    workshops.forEach(workshop => {
      console.log(`  - ${workshop.id}: ${workshop.status} (${workshop.securitySteeringCommittee})`)
    })
    
    // Create indexes
    await collection.createIndex({ id: 1 }, { unique: true })
    await collection.createIndex({ status: 1 })
    await collection.createIndex({ date: 1 })
    console.log('✅ Created indexes')
    
    console.log('\n🎉 Workshops API test completed successfully!')
    console.log('📝 Available status values:', ['Pending Agenda', 'Planned', 'Scheduled', 'Finalising Meeting Minutes', 'Completed'])
    console.log('📝 Available security steering committee values:', ['Core Systems Engineering', 'Software Engineering', 'IP Engineering'])
    
  } catch (error) {
    console.error('❌ Error testing workshops API:', error)
  } finally {
    await client.close()
  }
}

// Export for use in other scripts
module.exports = { testWorkshopsAPI }

// Run if called directly
if (require.main === module) {
  testWorkshopsAPI()
} 