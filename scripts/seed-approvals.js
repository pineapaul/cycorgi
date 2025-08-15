const { MongoClient } = require('mongodb')
const path = require('path')

// Load environment variables from .env.local
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env.local file')
  console.error('💡 Please ensure you have a .env.local file in your project root with MONGODB_URI set')
  process.exit(1)
}

console.log('📋 Approvals Seeding Script')
console.log('============================')

const sampleApprovals = [
  {
    requestId: 'REQ-0001',
    request: 'Risk Assessment Review for New Cloud Migration Project',
    category: 'High',
    type: 'Risk Management',
    requester: 'user1', // This should match actual user IDs in your users collection
    submitted: new Date('2025-01-15'),
    approvedDate: null,
    status: 'Pending',
    approvers: ['user2', 'user3'], // These should match actual user IDs
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
    createdBy: 'user1'
  },
  {
    requestId: 'REQ-0002',
    request: 'Policy Update Approval for Remote Work Security',
    category: 'Medium',
    type: 'Governance',
    requester: 'user2',
    submitted: new Date('2025-01-14'),
    approvedDate: null,
    status: 'Reviewing',
    approvers: ['user1', 'user4'],
    createdAt: new Date('2025-01-14'),
    updatedAt: new Date('2025-01-14'),
    createdBy: 'user2'
  },
  {
    requestId: 'REQ-0003',
    request: 'Third Party Risk Review for New Vendor',
    category: 'High',
    type: 'Compliance',
    requester: 'user3',
    submitted: new Date('2025-01-13'),
    approvedDate: null,
    status: 'Pending',
    approvers: ['user1', 'user2'],
    createdAt: new Date('2025-01-13'),
    updatedAt: new Date('2025-01-13'),
    createdBy: 'user3'
  },
  {
    requestId: 'REQ-0004',
    request: 'Security Incident Report for Data Breach',
    category: 'Critical',
    type: 'ISMS Operations',
    requester: 'user4',
    submitted: new Date('2025-01-12'),
    approvedDate: null,
    status: 'Pending',
    approvers: ['user1', 'user2', 'user3'],
    createdAt: new Date('2025-01-12'),
    updatedAt: new Date('2025-01-12'),
    createdBy: 'user4'
  },
  {
    requestId: 'REQ-0005',
    request: 'Training Program Update for Cybersecurity Awareness',
    category: 'Low',
    type: 'ISMS Operations',
    requester: 'user1',
    submitted: new Date('2025-01-11'),
    approvedDate: null,
    status: 'Pending',
    approvers: ['user2'],
    createdAt: new Date('2025-01-11'),
    updatedAt: new Date('2025-01-11'),
    createdBy: 'user1'
  },
  {
    requestId: 'REQ-0006',
    request: 'Audit Finding Response for Compliance Violation',
    category: 'High',
    type: 'Compliance',
    requester: 'user2',
    submitted: new Date('2025-01-10'),
    approvedDate: null,
    status: 'Pending',
    approvers: ['user1', 'user3'],
    createdAt: new Date('2025-01-10'),
    updatedAt: new Date('2025-01-10'),
    createdBy: 'user2'
  }
]

async function seedApprovals() {
  const client = new MongoClient(MONGODB_URI)
  
  try {
    console.log('🔌 Connecting to MongoDB...')
    console.log(`📍 URI: ${MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`) // Hide credentials
    await client.connect()
    console.log('✅ Connected to MongoDB successfully')
    
    const db = client.db()
    const dbName = db.databaseName
    console.log(`🗄️  Database: ${dbName}`)
    
    // Check if approvals collection exists, if not create it
    const collections = await db.listCollections().toArray()
    const approvalsCollectionExists = collections.some(col => col.name === 'approvals')
    
    if (!approvalsCollectionExists) {
      await db.createCollection('approvals')
      console.log('Created approvals collection')
    }
    
    // Clear existing approvals
    await db.collection('approvals').deleteMany({})
    console.log('Cleared existing approvals')
    
    // Insert sample approvals
    console.log('📝 Inserting sample approvals...')
    const result = await db.collection('approvals').insertMany(sampleApprovals)
    console.log(`✅ Inserted ${result.insertedCount} sample approvals`)
    
    // Display summary of inserted approvals
    console.log('\n📊 Sample Approvals Summary:')
    sampleApprovals.forEach((approval, index) => {
      console.log(`  ${index + 1}. ${approval.requestId} - ${approval.request}`)
    })
    
    // Create indexes for better performance
    await db.collection('approvals').createIndex({ requestId: 1 }, { unique: true })
    await db.collection('approvals').createIndex({ status: 1 })
    await db.collection('approvals').createIndex({ requester: 1 })
    await db.collection('approvals').createIndex({ approvers: 1 })
    await db.collection('approvals').createIndex({ submitted: -1 })
    console.log('Created indexes for approvals collection')
    
    console.log('\n🎉 Approvals seeding completed successfully!')
    console.log('🚀 You can now navigate to /dashboard/approvals to view the sample data')
    
  } catch (error) {
    console.error('❌ Error seeding approvals:', error)
    if (error.name === 'MongoServerSelectionError') {
      console.error('💡 Make sure your MongoDB server is running and accessible')
      console.error('💡 Check your MONGODB_URI in .env.local file')
    }
  } finally {
    if (client) {
      await client.close()
      console.log('🔌 Disconnected from MongoDB')
    }
  }
}

// Run the seeding function
seedApprovals()
  .then(() => {
    console.log('Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  })
