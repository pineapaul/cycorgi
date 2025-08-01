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

// Valid security steering committee values
const VALID_SECURITY_COMMITTEES = [
  'Core Systems Engineering',
  'Software Engineering', 
  'IP Engineering'
]

// Valid status values
const VALID_STATUSES = [
  'Pending Agenda',
  'Planned',
  'Scheduled', 
  'Finalising Meeting Minutes',
  'Completed'
]

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

// Validation function
function validateWorkshop(workshop) {
  const errors = []
  
  // Validate security steering committee
  if (!VALID_SECURITY_COMMITTEES.includes(workshop.securitySteeringCommittee)) {
    errors.push(`Invalid securitySteeringCommittee: "${workshop.securitySteeringCommittee}". Must be one of: ${VALID_SECURITY_COMMITTEES.join(', ')}`)
  }
  
  // Validate status
  if (!VALID_STATUSES.includes(workshop.status)) {
    errors.push(`Invalid status: "${workshop.status}". Must be one of: ${VALID_STATUSES.join(', ')}`)
  }
  
  // Validate required fields
  if (!workshop.id) errors.push('Missing required field: id')
  if (!workshop.date) errors.push('Missing required field: date')
  if (!workshop.facilitator) errors.push('Missing required field: facilitator')
  
  return errors
}

async function seedWorkshops() {
  const client = new MongoClient(uri)
  
  try {
    await client.connect()
    console.log('✅ Connected to MongoDB')
    
    const db = client.db(dbName)
    const collection = db.collection('workshops')
    
    // Validate all workshops before insertion
    console.log('🔍 Validating workshop data...')
    const validationErrors = []
    
    sampleWorkshops.forEach((workshop, index) => {
      const errors = validateWorkshop(workshop)
      if (errors.length > 0) {
        validationErrors.push(`Workshop ${index + 1} (${workshop.id}): ${errors.join(', ')}`)
      }
    })
    
    if (validationErrors.length > 0) {
      console.error('❌ Validation errors found:')
      validationErrors.forEach(error => console.error(`  - ${error}`))
      return
    }
    
    console.log('✅ All workshop data validated successfully')
    
    // Clear existing workshops
    await collection.deleteMany({})
    console.log('✅ Cleared existing workshops')
    
    // Insert sample workshops
    const result = await collection.insertMany(sampleWorkshops)
    console.log(`✅ Inserted ${result.insertedCount} workshops`)
    
    // Create indexes
    await collection.createIndex({ id: 1 }, { unique: true })
    await collection.createIndex({ status: 1 })
    await collection.createIndex({ date: 1 })
    console.log('✅ Created indexes')
    
    console.log('\n🎉 Workshops seeding completed successfully!')
    console.log('📝 Available security steering committee values:', VALID_SECURITY_COMMITTEES)
    console.log('📝 Available status values:', VALID_STATUSES)
    
  } catch (error) {
    console.error('❌ Error seeding workshops:', error)
  } finally {
    await client.close()
  }
}

seedWorkshops() 