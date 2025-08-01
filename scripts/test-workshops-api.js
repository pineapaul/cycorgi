require('dotenv').config({ path: '.env.local' })
const { MongoClient } = require('mongodb')

// Validation constants (shared with API validation)
const VALID_SECURITY_COMMITTEES = [
  'Core Systems Engineering',
  'Software Engineering', 
  'IP Engineering'
]

const VALID_STATUSES = [
  'Pending Agenda',
  'Planned',
  'Scheduled', 
  'Finalising Meeting Minutes',
  'Completed'
]

const testWorkshop = {
  id: 'WS-TEST-001',
  date: '2024-12-01',
  status: 'Planned',
  facilitator: 'Test Facilitator',
  participants: ['Test User 1', 'Test User 2'],
  risks: ['RISK-TEST-001', 'RISK-TEST-002'],
  outcomes: 'Test workshop outcomes',
  securitySteeringCommittee: 'Software Engineering',
  actionsTaken: 'Test actions taken',
  toDo: 'Test to-do items',
  notes: 'Test workshop notes',
  extensions: [
    {
      riskId: 'RISK-TEST-001',
      actionsTaken: 'Extended monitoring period',
      toDo: 'Review effectiveness',
      outcome: 'Risk level reduced'
    }
  ],
  closure: [
    {
      riskId: 'RISK-TEST-002',
      actionsTaken: 'All vulnerabilities patched',
      toDo: 'None - risk fully mitigated',
      outcome: 'Risk closed successfully'
    }
  ],
  newRisks: [
    {
      riskId: 'RISK-TEST-003',
      actionsTaken: 'Initial assessment completed',
      toDo: 'Develop mitigation plan',
      outcome: 'New risk identified'
    }
  ]
}

async function testWorkshopsAPI() {
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
    
    // Test 1: Insert a test workshop
    console.log('\n1. Testing workshop insertion...')
    const insertResult = await collection.insertOne(testWorkshop)
    console.log(`✅ Inserted test workshop with ID: ${insertResult.insertedId}`)
    
    // Test 2: Fetch all workshops
    console.log('\n2. Testing workshop retrieval...')
    const allWorkshops = await collection.find({}).toArray()
    console.log(`✅ Retrieved ${allWorkshops.length} workshops`)
    
    // Test 3: Find specific workshop by ID
    console.log('\n3. Testing specific workshop retrieval...')
    const foundWorkshop = await collection.findOne({ id: testWorkshop.id })
    if (foundWorkshop) {
      console.log(`✅ Found workshop: ${foundWorkshop.id} - ${foundWorkshop.status}`)
      console.log(`   Extensions: ${foundWorkshop.extensions?.length || 0} items`)
      console.log(`   Closure: ${foundWorkshop.closure?.length || 0} items`)
      console.log(`   New Risks: ${foundWorkshop.newRisks?.length || 0} items`)
    } else {
      console.log('❌ Workshop not found')
    }
    
    // Test 4: Update workshop
    console.log('\n4. Testing workshop update...')
    const updateResult = await collection.updateOne(
      { id: testWorkshop.id },
      { 
        $set: { 
          status: 'Completed',
          'extensions.0.outcome': 'Updated outcome for extension'
        } 
      }
    )
    console.log(`✅ Updated ${updateResult.modifiedCount} workshop`)
    
    // Test 5: Verify update
    console.log('\n5. Verifying update...')
    const updatedWorkshop = await collection.findOne({ id: testWorkshop.id })
    if (updatedWorkshop) {
      console.log(`✅ Workshop status updated to: ${updatedWorkshop.status}`)
      console.log(`✅ Extension outcome updated to: ${updatedWorkshop.extensions[0].outcome}`)
    }
    
    // Test 6: Add new item to extensions
    console.log('\n6. Testing adding new extension item...')
    const addExtensionResult = await collection.updateOne(
      { id: testWorkshop.id },
      { 
        $push: { 
          extensions: {
            riskId: 'RISK-TEST-004',
            actionsTaken: 'New extension action',
            toDo: 'New extension todo',
            outcome: 'New extension outcome'
          }
        } 
      }
    )
    console.log(`✅ Added new extension item: ${addExtensionResult.modifiedCount} workshop updated`)
    
    // Test 7: Verify new extension
    console.log('\n7. Verifying new extension...')
    const finalWorkshop = await collection.findOne({ id: testWorkshop.id })
    if (finalWorkshop) {
      console.log(`✅ Total extensions: ${finalWorkshop.extensions.length}`)
      console.log(`   Latest extension: ${finalWorkshop.extensions[finalWorkshop.extensions.length - 1].riskId}`)
    }
    
    // Test 8: Clean up - remove test workshop
    console.log('\n8. Cleaning up test data...')
    const deleteResult = await collection.deleteOne({ id: testWorkshop.id })
    console.log(`✅ Removed test workshop: ${deleteResult.deletedCount} workshop deleted`)
    
    console.log('\n🎉 All tests completed successfully!')
    
  } catch (error) {
    console.error('❌ Error during testing:', error)
  } finally {
    await client.close()
    console.log('Disconnected from MongoDB')
  }
}

// Wrap the function call in a try-catch block for better error handling
async function main() {
  try {
    await testWorkshopsAPI()
  } catch (error) {
    console.error('❌ Fatal error running test script:', error)
    process.exit(1)
  }
}

main() 