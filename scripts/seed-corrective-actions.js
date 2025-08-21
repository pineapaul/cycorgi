require('dotenv').config({ path: '.env.local' })
const { MongoClient } = require('mongodb')

const sampleCorrectiveActions = [
  {
    correctiveActionId: 'CA-001',
    functionalUnit: 'IT Security',
    status: 'Open',
    dateRaised: '2024-01-15',
    raisedBy: 'John Smith',
    location: 'Sydney Office',
    severity: 'High',
    caJiraTicket: 'CA-123',
    informationAsset: 'Customer Database',
    description: 'Unauthorized access detected to customer database. Investigation required to determine scope and impact.',
    rootCause: 'Weak authentication controls and lack of proper access monitoring',
    rootCauseCategory: 'Security Breach',
    assignedTo: 'Sarah Johnson',
    resolutionDueDate: '2024-02-15',
    actionTaken: 'Immediate access revocation and enhanced monitoring implemented',
    completionDate: '',
    dateApprovedForClosure: ''
  },
  {
    correctiveActionId: 'CA-002',
    functionalUnit: 'Compliance',
    status: 'In Progress',
    dateRaised: '2024-01-20',
    raisedBy: 'Lisa Wang',
    location: 'Melbourne Office',
    severity: 'Medium',
    caJiraTicket: 'CA-124',
    informationAsset: 'Employee Records',
    description: 'Non-compliance with data retention policies identified during audit. Records not being deleted according to schedule.',
    rootCause: 'Automated deletion process failure and lack of manual oversight',
    rootCauseCategory: 'Process Failure',
    assignedTo: 'David Brown',
    resolutionDueDate: '2024-02-20',
    actionTaken: 'Process automation fixed and manual review procedures implemented',
    completionDate: '',
    dateApprovedForClosure: ''
  },
  {
    correctiveActionId: 'CA-003',
    functionalUnit: 'Software Engineering',
    status: 'Pending Review',
    dateRaised: '2024-01-25',
    raisedBy: 'Mike Chen',
    location: 'Brisbane Office',
    severity: 'Critical',
    caJiraTicket: 'CA-125',
    informationAsset: 'Payment Processing System',
    description: 'Critical vulnerability identified in payment processing system that could allow unauthorized transactions.',
    rootCause: 'Insufficient input validation and lack of proper security testing',
    rootCauseCategory: 'System Failure',
    assignedTo: 'Alex Rodriguez',
    resolutionDueDate: '2024-01-30',
    actionTaken: 'Emergency patch deployed and additional security controls implemented',
    completionDate: '2024-01-28',
    dateApprovedForClosure: ''
  },
  {
    correctiveActionId: 'CA-004',
    functionalUnit: 'HR',
    status: 'Completed',
    dateRaised: '2024-01-10',
    raisedBy: 'Emily Wilson',
    location: 'Perth Office',
    severity: 'Low',
    caJiraTicket: 'CA-126',
    informationAsset: 'HR Policies',
    description: 'Outdated HR policies found during compliance review. Policies need updating to reflect current regulations.',
    rootCause: 'Lack of regular policy review schedule and outdated documentation',
    rootCauseCategory: 'Documentation Issue',
    assignedTo: 'Tom Anderson',
    resolutionDueDate: '2024-02-10',
    actionTaken: 'All HR policies updated and review schedule established',
    completionDate: '2024-02-05',
    dateApprovedForClosure: '2024-02-08'
  },
  {
    correctiveActionId: 'CA-005',
    functionalUnit: 'Network Operations',
    status: 'On Hold',
    dateRaised: '2024-01-30',
    raisedBy: 'Robert Davis',
    location: 'Adelaide Office',
    severity: 'High',
    caJiraTicket: 'CA-127',
    informationAsset: 'Network Infrastructure',
    description: 'Network segmentation failure identified during security assessment. Critical systems not properly isolated.',
    rootCause: 'Configuration error during recent network upgrade and insufficient testing',
    rootCauseCategory: 'System Failure',
    assignedTo: 'Maria Garcia',
    resolutionDueDate: '2024-02-28',
    actionTaken: 'Network reconfiguration planned but awaiting maintenance window',
    completionDate: '',
    dateApprovedForClosure: ''
  },
  {
    correctiveActionId: 'CA-006',
    functionalUnit: 'Data Management',
    status: 'Pending Approval',
    dateRaised: '2024-02-01',
    raisedBy: 'Sophie Anderson',
    location: 'Canberra Office',
    severity: 'Medium',
    caJiraTicket: 'CA-128',
    informationAsset: 'Data Warehouse',
    description: 'Data quality issues identified in customer analytics. Inconsistent data formats and missing validation rules.',
    rootCause: 'Lack of data governance framework and insufficient data quality controls',
    rootCauseCategory: 'Process Failure',
    assignedTo: 'James Wilson',
    resolutionDueDate: '2024-03-01',
    actionTaken: 'Data quality framework developed and validation rules implemented',
    completionDate: '2024-02-25',
    dateApprovedForClosure: ''
  },
  {
    correctiveActionId: 'CA-007',
    functionalUnit: 'Facilities',
    status: 'Open',
    dateRaised: '2024-02-05',
    raisedBy: 'Chris Thompson',
    location: 'Darwin Office',
    severity: 'Low',
    caJiraTicket: 'CA-129',
    informationAsset: 'Physical Security',
    description: 'Physical security audit revealed gaps in visitor management and building access controls.',
    rootCause: 'Insufficient training for security staff and outdated access control procedures',
    rootCauseCategory: 'Training Deficiency',
    assignedTo: 'Patricia Lee',
    resolutionDueDate: '2024-03-05',
    actionTaken: 'Security staff training scheduled and access control procedures updated',
    completionDate: '',
    dateApprovedForClosure: ''
  },
  {
    correctiveActionId: 'CA-008',
    functionalUnit: 'Legal',
    status: 'In Progress',
    dateRaised: '2024-02-10',
    raisedBy: 'Jennifer Martinez',
    location: 'Hobart Office',
    severity: 'High',
    caJiraTicket: 'CA-130',
    informationAsset: 'Contract Management',
    description: 'Contract management system audit revealed non-compliance with data protection regulations.',
    rootCause: 'System not designed with privacy-by-design principles and insufficient data handling controls',
    rootCauseCategory: 'Compliance Violation',
    assignedTo: 'Kevin O\'Connor',
    resolutionDueDate: '2024-03-10',
    actionTaken: 'Privacy controls implemented and data handling procedures updated',
    completionDate: '',
    dateApprovedForClosure: ''
  }
]

async function seedCorrectiveActions() {
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
    const collection = db.collection('corrective_actions')

    // Clear existing data
    await collection.deleteMany({})
    console.log('Cleared existing corrective actions')

    // Insert sample data
    const result = await collection.insertMany(sampleCorrectiveActions)
    console.log(`Inserted ${result.insertedCount} corrective actions`)

    // Add timestamps to all documents
    const updatePromises = sampleCorrectiveActions.map((action, index) => {
      const timestamp = new Date()
      return collection.updateOne(
        { _id: result.insertedIds[index] },
        { 
          $set: { 
            createdAt: timestamp.toISOString(),
            updatedAt: timestamp.toISOString()
          } 
        }
      )
    })

    await Promise.all(updatePromises)
    console.log('Added timestamps to all corrective actions')

    console.log('Corrective actions seeding completed successfully!')
  } catch (error) {
    console.error('Error seeding corrective actions:', error)
    process.exit(1)
  } finally {
    await client.close()
    console.log('Disconnected from MongoDB')
  }
}

seedCorrectiveActions()
