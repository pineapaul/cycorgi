require('dotenv').config({ path: '.env.local' })
const { MongoClient } = require('mongodb')

// Validation constants (shared with API validation)
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
    date: '2024-01-15',
    status: 'Completed',
    facilitator: 'Dr. Sarah Johnson',
    participants: ['John Smith', 'Emily Davis', 'Michael Brown', 'Lisa Wilson'],
    risks: ['RISK-001', 'RISK-003', 'RISK-005'],
    outcomes: 'Comprehensive review of system architecture risks completed. All critical vulnerabilities identified and mitigation strategies approved.',

    actionsTaken: 'Implemented additional security controls for data encryption',
    toDo: 'Schedule follow-up review in 3 months',
    notes: 'Team showed excellent collaboration and thorough risk assessment',
    extensions: [
      {
        riskId: 'RISK-001',
        actionsTaken: 'Extended monitoring period by 6 months',
        toDo: 'Review effectiveness of new controls',
        outcome: 'Risk level reduced from High to Medium'
      },
      {
        riskId: 'RISK-003',
        actionsTaken: 'Additional security training completed',
        toDo: 'Implement automated monitoring tools',
        outcome: 'Team competency improved significantly'
      }
    ],
    closure: [
      {
        riskId: 'RISK-005',
        actionsTaken: 'All identified vulnerabilities patched',
        toDo: 'None - risk fully mitigated',
        outcome: 'Risk closed successfully'
      }
    ],
    newRisks: [
      {
        riskId: 'RISK-007',
        actionsTaken: 'Initial assessment completed',
        toDo: 'Develop detailed mitigation plan',
        outcome: 'New risk identified and documented'
      }
    ]
  },
  {
    id: 'WS-002',
    date: '2024-02-20',
    status: 'Scheduled',
    facilitator: 'Prof. Robert Chen',
    participants: ['Alex Thompson', 'Maria Garcia', 'David Lee', 'Sophie Anderson'],
    risks: ['RISK-002', 'RISK-004'],
    outcomes: 'Software development lifecycle risks assessed. Code review processes enhanced.',

    actionsTaken: 'Updated code review guidelines',
    toDo: 'Implement automated testing pipeline',
    notes: 'Focus on CI/CD security improvements',
    extensions: [
      {
        riskId: 'RISK-002',
        actionsTaken: 'Extended code review requirements',
        toDo: 'Train team on new guidelines',
        outcome: 'Process improvements identified'
      }
    ],
    closure: [],
    newRisks: [
      {
        riskId: 'RISK-008',
        actionsTaken: 'Initial analysis completed',
        toDo: 'Conduct detailed threat modeling',
        outcome: 'New security risk identified in deployment pipeline'
      }
    ]
  },
  {
    id: 'WS-003',
    date: '2024-03-10',
    status: 'Planned',
    facilitator: 'Dr. Amanda White',
    participants: ['Chris Rodriguez', 'Jennifer Kim', 'Kevin Patel', 'Rachel Green'],
    risks: ['RISK-006'],
    outcomes: 'IP protection strategies reviewed. Patent filing process optimized.',

    actionsTaken: 'Updated IP documentation procedures',
    toDo: 'Schedule legal review session',
    notes: 'Strong focus on trade secret protection',
    extensions: [],
    closure: [],
    newRisks: [
      {
        riskId: 'RISK-009',
        actionsTaken: 'Initial IP audit completed',
        toDo: 'Develop comprehensive protection strategy',
        outcome: 'New IP risk identified in open source usage'
      },
      {
        riskId: 'RISK-010',
        actionsTaken: 'Documentation review started',
        toDo: 'Complete risk assessment matrix',
        outcome: 'Process improvement opportunities identified'
      }
    ]
  }
]

function validateWorkshop(workshop) {
  const errors = []
  
  // Check required fields
  if (!workshop.id) errors.push('Missing required field: id')
  if (!workshop.date) errors.push('Missing required field: date')
  if (!workshop.facilitator) errors.push('Missing required field: facilitator')
  

  
  // Check status
  if (!VALID_STATUSES.includes(workshop.status)) {
    errors.push(`Invalid status: "${workshop.status}". Must be one of: ${VALID_STATUSES.join(', ')}`)
  }
  
  // Validate Meeting Minutes structure
  if (workshop.extensions && !Array.isArray(workshop.extensions)) {
    errors.push('Extensions must be an array')
  }
  
  if (workshop.closure && !Array.isArray(workshop.closure)) {
    errors.push('Closure must be an array')
  }
  
  if (workshop.newRisks && !Array.isArray(workshop.newRisks)) {
    errors.push('New Risks must be an array')
  }
  
  // Validate each item in the arrays
  const validateMeetingMinutesItem = (item, sectionName, index) => {
    if (!item.riskId || typeof item.riskId !== 'string') {
      errors.push(`${sectionName} item ${index + 1}: Missing or invalid riskId`)
    }
    if (item.actionsTaken && typeof item.actionsTaken !== 'string') {
      errors.push(`${sectionName} item ${index + 1}: actionsTaken must be a string`)
    }
    if (item.toDo && typeof item.toDo !== 'string') {
      errors.push(`${sectionName} item ${index + 1}: toDo must be a string`)
    }
    if (item.outcome && typeof item.outcome !== 'string') {
      errors.push(`${sectionName} item ${index + 1}: outcome must be a string`)
    }
  }
  
  if (workshop.extensions) {
    workshop.extensions.forEach((item, index) => {
      validateMeetingMinutesItem(item, 'Extensions', index)
    })
  }
  
  if (workshop.closure) {
    workshop.closure.forEach((item, index) => {
      validateMeetingMinutesItem(item, 'Closure', index)
    })
  }
  
  if (workshop.newRisks) {
    workshop.newRisks.forEach((item, index) => {
      validateMeetingMinutesItem(item, 'New Risks', index)
    })
  }
  
  return errors
}

async function seedWorkshops() {
  const uri = process.env.MONGODB_URI
  
  if (!uri) {
    console.error('MONGODB_URI environment variable is not set')
    process.exit(1)
  }
  
  const client = new MongoClient(uri)
  
  try {
    await client.connect()
    console.log('Connected to MongoDB')
    
    const db = client.db('cycorgi')
    const collection = db.collection('workshops')
    
    // Validate all workshops before inserting
    console.log('Validating workshop data...')
    const allErrors = []
    
    sampleWorkshops.forEach((workshop, index) => {
      const errors = validateWorkshop(workshop)
      if (errors.length > 0) {
        allErrors.push(`Workshop ${index + 1} (${workshop.id}): ${errors.join(', ')}`)
      }
    })
    
    if (allErrors.length > 0) {
      console.error('Validation errors found:')
      allErrors.forEach(error => console.error(`- ${error}`))
      process.exit(1)
    }
    
    console.log('All workshop data is valid')
    
    // Clear existing data
    await collection.deleteMany({})
    console.log('Cleared existing workshops')
    
    // Insert new data
    const result = await collection.insertMany(sampleWorkshops)
    console.log(`Successfully seeded ${result.insertedCount} workshops`)
    
    // Display inserted workshops
    console.log('\nInserted workshops:')
    result.insertedIds.forEach((id, index) => {
      console.log(`- ${sampleWorkshops[index].id}: ${sampleWorkshops[index].status}`)
    })
    
  } catch (error) {
    console.error('Error seeding workshops:', error)
  } finally {
    await client.close()
    console.log('Disconnected from MongoDB')
  }
}

seedWorkshops() 