const { MongoClient } = require('mongodb')
require('dotenv').config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables')
  console.log('💡 Make sure your .env.local file contains MONGODB_URI=your_connection_string')
  console.log('📝 Example: MONGODB_URI=mongodb://localhost:27017/cycorgi')
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
    securitySteeringCommittee: ['Core Systems Engineering', 'Software Engineering'],
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
    securitySteeringCommittee: ['IP Engineering', 'Core Systems Engineering'],
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
    securitySteeringCommittee: ['Software Engineering', 'IP Engineering'],
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
    securitySteeringCommittee: ['Core Systems Engineering', 'Software Engineering', 'IP Engineering'],
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
    securitySteeringCommittee: ['Software Engineering'],
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

async function seedWorkshops() {
  const client = new MongoClient(uri)
  
  try {
    await client.connect()
    console.log('Connected to MongoDB')
    
    const db = client.db(dbName)
    const collection = db.collection('workshops')
    
    // Clear existing workshops
    await collection.deleteMany({})
    console.log('Cleared existing workshops')
    
    // Insert sample workshops
    const result = await collection.insertMany(sampleWorkshops)
    console.log(`Inserted ${result.insertedCount} workshops`)
    
    // Create indexes
    await collection.createIndex({ id: 1 }, { unique: true })
    await collection.createIndex({ status: 1 })
    await collection.createIndex({ date: 1 })
    console.log('Created indexes')
    
    console.log('Workshops seeding completed successfully')
  } catch (error) {
    console.error('Error seeding workshops:', error)
  } finally {
    await client.close()
  }
}

seedWorkshops() 