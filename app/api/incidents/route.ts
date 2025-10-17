import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '../../../lib/mongodb'

// Sample incident data for development
const sampleIncidents = [
  {
    id: 'INC-001',
    incidentId: 'INC-001',
    functionalUnit: 'IT Security',
    status: 'Open',
    dateRaised: '2024-01-15',
    raisedBy: 'John Smith',
    location: 'Sydney Office',
    priority: 'High',
    incidentJiraTicket: 'SEC-1234',
    informationAsset: 'Customer Database',
    description: 'Unauthorized access attempt detected on customer database',
    rootCause: 'Weak password policy',
    rootCauseCategory: 'Authentication',
    assignedTo: 'Sarah Johnson',
    actionTaken: 'Password reset and account lockout',
    completionDate: '',
    dateApprovedForClosure: '',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'INC-002',
    incidentId: 'INC-002',
    functionalUnit: 'Finance',
    status: 'Under Investigation',
    dateRaised: '2024-01-14',
    raisedBy: 'Lisa Wang',
    location: 'Melbourne Office',
    priority: 'Medium',
    incidentJiraTicket: 'SEC-1235',
    informationAsset: 'Financial Systems',
    description: 'Suspicious login activity from unknown IP address',
    rootCause: 'Compromised credentials',
    rootCauseCategory: 'Credential Theft',
    assignedTo: 'Mike Chen',
    actionTaken: 'IP blocking and user notification',
    completionDate: '',
    dateApprovedForClosure: '',
    createdAt: '2024-01-14T14:20:00Z',
    updatedAt: '2024-01-14T14:20:00Z'
  },
  {
    id: 'INC-003',
    incidentId: 'INC-003',
    functionalUnit: 'HR',
    status: 'Resolved',
    dateRaised: '2024-01-10',
    raisedBy: 'David Brown',
    location: 'Brisbane Office',
    priority: 'Low',
    incidentJiraTicket: 'SEC-1236',
    informationAsset: 'Employee Records',
    description: 'Accidental data exposure in email',
    rootCause: 'Human error',
    rootCauseCategory: 'Human Error',
    assignedTo: 'Alex Rodriguez',
    actionTaken: 'Email recall and recipient notification',
    completionDate: '2024-01-12',
    dateApprovedForClosure: '2024-01-13',
    createdAt: '2024-01-10T09:15:00Z',
    updatedAt: '2024-01-13T16:45:00Z'
  },
  {
    id: 'INC-004',
    incidentId: 'INC-004',
    functionalUnit: 'Operations',
    status: 'Closed',
    dateRaised: '2024-01-05',
    raisedBy: 'Emma Wilson',
    location: 'Perth Office',
    priority: 'High',
    incidentJiraTicket: 'SEC-1237',
    informationAsset: 'Production Systems',
    description: 'Malware detected on production server',
    rootCause: 'Phishing email',
    rootCauseCategory: 'Social Engineering',
    assignedTo: 'Tom Anderson',
    actionTaken: 'Server isolation and malware removal',
    completionDate: '2024-01-08',
    dateApprovedForClosure: '2024-01-09',
    createdAt: '2024-01-05T11:00:00Z',
    updatedAt: '2024-01-09T14:30:00Z'
  },
  {
    id: 'INC-005',
    incidentId: 'INC-005',
    functionalUnit: 'Legal',
    status: 'Open',
    dateRaised: '2024-01-16',
    raisedBy: 'Robert Davis',
    location: 'Adelaide Office',
    priority: 'Critical',
    incidentJiraTicket: 'SEC-1238',
    informationAsset: 'Legal Documents',
    description: 'Potential data breach involving sensitive legal documents',
    rootCause: 'System vulnerability',
    rootCauseCategory: 'Technical Vulnerability',
    assignedTo: 'Security Team',
    actionTaken: 'Incident response team activated',
    completionDate: '',
    dateApprovedForClosure: '',
    createdAt: '2024-01-16T08:00:00Z',
    updatedAt: '2024-01-16T08:00:00Z'
  }
]

export async function GET() {
  try {
    const client = await clientPromise()
    const db = client.db('cycorgi')
    const incidentsCollection = db.collection('incidents')
    
    // Check if incidents collection exists and has data
    const existingData = await incidentsCollection.find({}).limit(1).toArray()
    
    if (existingData.length === 0) {
      // Insert sample data if collection is empty
      await incidentsCollection.insertMany(sampleIncidents)
      console.log('Inserted sample incidents data')
    }
    
    // Retrieve all incidents
    const incidents = await incidentsCollection.find({}).toArray()
    
    return NextResponse.json({
      success: true,
      data: incidents
    })
  } catch (error) {
    console.error('Error fetching incidents:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch incidents'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const client = await clientPromise()
    const db = client.db('cycorgi')
    const collection = db.collection('incidents')
    
    // Add timestamp and ID
    const newIncident = {
      ...body,
      id: `INC-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    const result = await collection.insertOne(newIncident)
    
    return NextResponse.json({
      success: true,
      data: { ...newIncident, _id: result.insertedId }
    })
  } catch (error) {
    console.error('Error creating incident:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create incident'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body
    
    const client = await clientPromise()
    const db = client.db('cycorgi')
    const collection = db.collection('incidents')
    
    // Update timestamp
    const updatedIncident = {
      ...updateData,
      updatedAt: new Date().toISOString()
    }
    
    const result = await collection.updateOne(
      { id: id },
      { $set: updatedIncident }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json({
        success: false,
        error: 'Incident not found'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: { id, ...updatedIncident }
    })
  } catch (error) {
    console.error('Error updating incident:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update incident'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Incident ID is required'
      }, { status: 400 })
    }
    
    const client = await clientPromise()
    const db = client.db('cycorgi')
    const collection = db.collection('incidents')
    
    const result = await collection.deleteOne({ id: id })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({
        success: false,
        error: 'Incident not found'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Incident deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting incident:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to delete incident'
    }, { status: 500 })
  }
}
