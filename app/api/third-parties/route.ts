import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

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
    status: 'Active'
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
    status: 'Active'
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
    status: 'Active'
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
    status: 'Active'
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
    status: 'Active'
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
    status: 'Active'
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
    status: 'Active'
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
    status: 'Active'
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
    status: 'Active'
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
    status: 'Active'
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
    status: 'Active'
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
    status: 'Active'
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
    status: 'Active'
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
    status: 'Active'
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
    status: 'Active'
  }
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const sortBy = searchParams.get('sortBy') || 'vendorName'
    const sortOrder = searchParams.get('sortOrder') || 'asc'
    const status = searchParams.get('status') || ''
    const functionalUnit = searchParams.get('functionalUnit') || ''
    
    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db('cycorgi')
    const collection = db.collection('third-parties')
    
    // Only insert fake data in development environment
    if (process.env.NODE_ENV === 'development') {
      const existingData = await collection.find({}).limit(1).toArray()
      
      if (existingData.length === 0) {
        // Insert fake data if collection is empty (development only)
        await collection.insertMany(fakeThirdParties)
        console.log('Inserted fake third parties data (development mode)')
      }
    }
    
    // Build filter query
    const filter: any = {}
    
    if (search) {
      filter.$or = [
        { vendorId: { $regex: search, $options: 'i' } },
        { vendorName: { $regex: search, $options: 'i' } },
        { entity: { $regex: search, $options: 'i' } },
        { vendorContact: { $regex: search, $options: 'i' } },
        { internalContact: { $regex: search, $options: 'i' } }
      ]
    }
    
    if (status) {
      filter.status = status
    }
    
    if (functionalUnit) {
      filter.functionalUnit = functionalUnit
    }
    
    // Build sort query
    const sort: any = {}
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1
    
    // Calculate pagination
    const skip = (page - 1) * limit
    
    // Get total count for pagination
    const totalCount = await collection.countDocuments(filter)
    
    // Retrieve paginated third parties
    const thirdParties = await collection
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray()
    
    // Migrate old data structure to new structure
    const migratedThirdParties = thirdParties.map(party => {
      // If the party has the old informationAssetId field, migrate it
      if (party.informationAssetId && !party.informationAssetIds) {
        return {
          ...party,
          informationAssetIds: [party.informationAssetId],
          informationAssetId: undefined // Remove old field
        }
      }
      // If the party has neither field, provide empty array
      if (!party.informationAssetIds) {
        return {
          ...party,
          informationAssetIds: []
        }
      }
      return party
    })
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1
    
    return NextResponse.json({
      success: true,
      data: migratedThirdParties,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage
      },
      filters: {
        search,
        status,
        functionalUnit,
        sortBy,
        sortOrder
      }
    })
  } catch (error) {
    console.error('Error fetching third parties:', error)
    
    // Only return fake data in development environment
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch third parties',
          data: fakeThirdParties.slice(0, 20), // Fallback to limited fake data
          pagination: {
            page: 1,
            limit: 20,
            totalCount: fakeThirdParties.length,
            totalPages: Math.ceil(fakeThirdParties.length / 20),
            hasNextPage: false,
            hasPrevPage: false
          }
        },
        { status: 500 }
      )
    }
    
    // In production, return proper error without fake data
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch third parties'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const client = await clientPromise
    const db = client.db('cycorgi')
    const collection = db.collection('third-parties')
    
    // Add timestamp and ID
    const newThirdParty = {
      ...body,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    const result = await collection.insertOne(newThirdParty)
    
    return NextResponse.json({
      success: true,
      data: { ...newThirdParty, _id: result.insertedId }
    })
  } catch (error) {
    console.error('Error creating third party:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create third party' },
      { status: 500 }
    )
  }
} 