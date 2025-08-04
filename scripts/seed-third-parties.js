const { MongoClient } = require('mongodb')

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const dbName = 'cycorgi'

// Comprehensive fake data for third parties with multiple information assets
const fakeThirdParties = [
  {
    id: '1',
    vendorId: 'VEND-001',
    vendorName: 'Microsoft Corporation',
    informationAssetIds: ['1', '15'],
    functionalUnit: 'IT Infrastructure',
    vendorContact: 'John Smith (john.smith@microsoft.com)',
    internalContact: 'Sarah Johnson (sarah.johnson@company.com)',
    entity: 'Microsoft Azure',
    startDate: '2023-01-15',
    endDate: '2024-12-31',
    riskAssessmentJiraTicket: 'SEC-2023-001',
    dataPrivacy: 'DPR-2023-001',
    securityReviewJiraTicket: 'SEC-2023-002',
    lastSecurityReviewDate: '2023-06-15',
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    vendorId: 'VEND-002',
    vendorName: 'Amazon Web Services',
    informationAssetIds: ['5', '7'],
    functionalUnit: 'Cloud Services',
    vendorContact: 'Mike Davis (mike.davis@aws.com)',
    internalContact: 'David Brown (david.brown@company.com)',
    entity: 'AWS',
    startDate: '2022-08-01',
    endDate: '2024-07-31',
    riskAssessmentJiraTicket: 'SEC-2022-015',
    dataPrivacy: 'DPR-2022-015',
    securityReviewJiraTicket: 'SEC-2022-016',
    lastSecurityReviewDate: '2023-03-20',
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    vendorId: 'VEND-003',
    vendorName: 'Salesforce Inc.',
    informationAssetIds: ['11'],
    functionalUnit: 'Customer Success',
    vendorContact: 'Lisa Chen (lisa.chen@salesforce.com)',
    internalContact: 'Anna Davis (anna.davis@company.com)',
    entity: 'Salesforce CRM',
    startDate: '2023-03-10',
    endDate: '2025-03-09',
    riskAssessmentJiraTicket: 'SEC-2023-008',
    dataPrivacy: 'DPR-2023-008',
    securityReviewJiraTicket: 'SEC-2023-009',
    lastSecurityReviewDate: '2023-09-10',
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    vendorId: 'VEND-004',
    vendorName: 'GitHub Inc.',
    informationAssetIds: ['4'],
    functionalUnit: 'Development',
    vendorContact: 'Tom Wilson (tom.wilson@github.com)',
    internalContact: 'Jennifer Lee (jennifer.lee@company.com)',
    entity: 'GitHub Enterprise',
    startDate: '2022-11-01',
    endDate: '2024-10-31',
    riskAssessmentJiraTicket: 'SEC-2022-025',
    dataPrivacy: 'DPR-2022-025',
    securityReviewJiraTicket: 'SEC-2022-026',
    lastSecurityReviewDate: '2023-05-12',
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '5',
    vendorId: 'VEND-005',
    vendorName: 'Splunk Inc.',
    informationAssetIds: ['12', '13'],
    functionalUnit: 'Security Operations',
    vendorContact: 'David Brown (david.brown@splunk.com)',
    internalContact: 'Kevin Thompson (kevin.thompson@company.com)',
    entity: 'Splunk Enterprise',
    startDate: '2023-02-01',
    endDate: '2025-01-31',
    riskAssessmentJiraTicket: 'SEC-2023-003',
    dataPrivacy: 'DPR-2023-003',
    securityReviewJiraTicket: 'SEC-2023-004',
    lastSecurityReviewDate: '2023-08-22',
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '6',
    vendorId: 'VEND-006',
    vendorName: 'DocuSign Inc.',
    informationAssetIds: ['13'],
    functionalUnit: 'Legal',
    vendorContact: 'Emma Taylor (emma.taylor@docusign.com)',
    internalContact: 'Helen Rodriguez (helen.rodriguez@company.com)',
    entity: 'DocuSign',
    startDate: '2022-12-01',
    endDate: '2024-11-30',
    riskAssessmentJiraTicket: 'SEC-2022-030',
    dataPrivacy: 'DPR-2022-030',
    securityReviewJiraTicket: 'SEC-2022-031',
    lastSecurityReviewDate: '2023-04-18',
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '7',
    vendorId: 'VEND-007',
    vendorName: 'Microsoft Corporation',
    informationAssetIds: ['15'],
    functionalUnit: 'IT Infrastructure',
    vendorContact: 'Alex Rodriguez (alex.rodriguez@microsoft.com)',
    internalContact: 'Tom Wilson (tom.wilson@company.com)',
    entity: 'Microsoft Exchange',
    startDate: '2023-01-01',
    endDate: '2024-12-31',
    riskAssessmentJiraTicket: 'SEC-2023-005',
    dataPrivacy: 'DPR-2023-005',
    securityReviewJiraTicket: 'SEC-2023-006',
    lastSecurityReviewDate: '2023-07-05',
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '8',
    vendorId: 'VEND-008',
    vendorName: 'Google LLC',
    informationAssetIds: ['8', '9'],
    functionalUnit: 'Marketing',
    vendorContact: 'Rachel Green (rachel.green@google.com)',
    internalContact: 'Emily Wilson (emily.wilson@company.com)',
    entity: 'Google Drive',
    startDate: '2022-09-01',
    endDate: '2024-08-31',
    riskAssessmentJiraTicket: 'SEC-2022-020',
    dataPrivacy: 'DPR-2022-020',
    securityReviewJiraTicket: 'SEC-2022-021',
    lastSecurityReviewDate: '2023-02-14',
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '9',
    vendorId: 'VEND-009',
    vendorName: 'Adobe Inc.',
    informationAssetIds: ['8'],
    functionalUnit: 'Marketing',
    vendorContact: 'Carlos Martinez (carlos.martinez@adobe.com)',
    internalContact: 'Emily Wilson (emily.wilson@company.com)',
    entity: 'Adobe Creative Cloud',
    startDate: '2023-04-01',
    endDate: '2025-03-31',
    riskAssessmentJiraTicket: 'SEC-2023-010',
    dataPrivacy: 'DPR-2023-010',
    securityReviewJiraTicket: 'SEC-2023-011',
    lastSecurityReviewDate: '2023-10-05',
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '10',
    vendorId: 'VEND-010',
    vendorName: 'Slack Technologies',
    informationAssetIds: ['15'],
    functionalUnit: 'Communication',
    vendorContact: 'Amanda White (amanda.white@slack.com)',
    internalContact: 'Tom Wilson (tom.wilson@company.com)',
    entity: 'Slack',
    startDate: '2022-10-01',
    endDate: '2024-09-30',
    riskAssessmentJiraTicket: 'SEC-2022-022',
    dataPrivacy: 'DPR-2022-022',
    securityReviewJiraTicket: 'SEC-2022-023',
    lastSecurityReviewDate: '2023-01-30',
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '11',
    vendorId: 'VEND-011',
    vendorName: 'Zoom Video Communications',
    informationAssetIds: ['15'],
    functionalUnit: 'Communication',
    vendorContact: 'Steve Johnson (steve.johnson@zoom.us)',
    internalContact: 'Tom Wilson (tom.wilson@company.com)',
    entity: 'Zoom',
    startDate: '2023-05-01',
    endDate: '2025-04-30',
    riskAssessmentJiraTicket: 'SEC-2023-012',
    dataPrivacy: 'DPR-2023-012',
    securityReviewJiraTicket: 'SEC-2023-013',
    lastSecurityReviewDate: '2023-11-15',
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '12',
    vendorId: 'VEND-012',
    vendorName: 'Okta Inc.',
    informationAssetIds: ['6'],
    functionalUnit: 'Security',
    vendorContact: 'Maria Lopez (maria.lopez@okta.com)',
    internalContact: 'Patricia Garcia (patricia.garcia@company.com)',
    entity: 'Okta Identity',
    startDate: '2022-07-01',
    endDate: '2024-06-30',
    riskAssessmentJiraTicket: 'SEC-2022-010',
    dataPrivacy: 'DPR-2022-010',
    securityReviewJiraTicket: 'SEC-2022-011',
    lastSecurityReviewDate: '2023-03-08',
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '13',
    vendorId: 'VEND-013',
    vendorName: 'CrowdStrike Inc.',
    informationAssetIds: ['12'],
    functionalUnit: 'Security Operations',
    vendorContact: 'Daniel Kim (daniel.kim@crowdstrike.com)',
    internalContact: 'Kevin Thompson (kevin.thompson@company.com)',
    entity: 'CrowdStrike Falcon',
    startDate: '2023-06-01',
    endDate: '2025-05-31',
    riskAssessmentJiraTicket: 'SEC-2023-014',
    dataPrivacy: 'DPR-2023-014',
    securityReviewJiraTicket: 'SEC-2023-015',
    lastSecurityReviewDate: '2023-12-01',
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '14',
    vendorId: 'VEND-014',
    vendorName: 'ServiceNow Inc.',
    informationAssetIds: ['11', '14'],
    functionalUnit: 'IT Operations',
    vendorContact: 'James Wilson (james.wilson@servicenow.com)',
    internalContact: 'Anna Davis (anna.davis@company.com)',
    entity: 'ServiceNow',
    startDate: '2022-12-15',
    endDate: '2024-12-14',
    riskAssessmentJiraTicket: 'SEC-2022-035',
    dataPrivacy: 'DPR-2022-035',
    securityReviewJiraTicket: 'SEC-2022-036',
    lastSecurityReviewDate: '2023-06-20',
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '15',
    vendorId: 'VEND-015',
    vendorName: 'Atlassian Corporation',
    informationAssetIds: ['4'],
    functionalUnit: 'Development',
    vendorContact: 'Lisa Chen (lisa.chen@atlassian.com)',
    internalContact: 'Jennifer Lee (jennifer.lee@company.com)',
    entity: 'Jira & Confluence',
    startDate: '2023-02-15',
    endDate: '2025-02-14',
    riskAssessmentJiraTicket: 'SEC-2023-007',
    dataPrivacy: 'DPR-2023-007',
    securityReviewJiraTicket: 'SEC-2023-008',
    lastSecurityReviewDate: '2023-08-10',
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

async function seedThirdParties() {
  const client = new MongoClient(uri)
  
  try {
    await client.connect()
    console.log('Connected to MongoDB')
    
    const db = client.db(dbName)
    const collection = db.collection('third-parties')
    
    // Clear existing data
    await collection.deleteMany({})
    console.log('Cleared existing third parties data')
    
    // Insert new data
    const result = await collection.insertMany(fakeThirdParties)
    console.log(`Successfully seeded ${result.insertedCount} third parties`)
    
    // Display some sample data
    const sampleData = await collection.find({}).limit(3).toArray()
    console.log('\nSample third parties:')
    sampleData.forEach((party, index) => {
      console.log(`${index + 1}. ${party.vendorName} (${party.vendorId})`)
      console.log(`   Information Assets: ${party.informationAssetIds.join(', ')}`)
      console.log(`   Status: ${party.status}`)
      console.log('')
    })
    
  } catch (error) {
    console.error('Error seeding third parties:', error)
  } finally {
    await client.close()
    console.log('Disconnected from MongoDB')
  }
}

// Run the seed function
seedThirdParties()
  .then(() => {
    console.log('Third parties seeding completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Third parties seeding failed:', error)
    process.exit(1)
  }) 