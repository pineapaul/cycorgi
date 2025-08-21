import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export interface CorrectiveAction {
  _id?: string | any // MongoDB ObjectId or string
  correctiveActionId: string
  functionalUnit: string
  status: string
  dateRaised: string
  raisedBy: string
  location: string
  severity: string
  caJiraTicket: string
  informationAsset: string
  description: string
  rootCause: string
  rootCauseCategory: string
  assignedTo: string
  resolutionDueDate: string
  actionTaken: string
  completionDate?: string
  dateApprovedForClosure?: string
  createdAt?: string
  updatedAt?: string
}

export async function GET() {
  try {
    const client = await clientPromise()
    const db = client.db('cycorgi')
    const collection = db.collection('corrective_actions')
    
    const correctiveActions = await collection.find({}).toArray()
    
    return NextResponse.json({
      success: true,
      data: correctiveActions
    })
  } catch (error) {
    console.error('Error fetching corrective actions:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch corrective actions'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const client = await clientPromise()
    const db = client.db('cycorgi')
    const collection = db.collection('corrective_actions')
    
    // Validate required fields
    const validationErrors: string[] = []
    
    if (!body.correctiveActionId) validationErrors.push('Corrective Action ID is required')
    if (!body.functionalUnit) validationErrors.push('Functional Unit is required')
    if (!body.status) validationErrors.push('Status is required')
    if (!body.dateRaised) validationErrors.push('Date Raised is required')
    if (!body.raisedBy) validationErrors.push('Raised By is required')
    if (!body.location) validationErrors.push('Location is required')
    if (!body.severity) validationErrors.push('Severity is required')
    if (!body.caJiraTicket) validationErrors.push('CA JIRA Ticket is required')
    if (!body.informationAsset) validationErrors.push('Information Asset is required')
    if (!body.description) validationErrors.push('Description is required')
    if (!body.rootCause) validationErrors.push('Root Cause is required')
    if (!body.rootCauseCategory) validationErrors.push('Root Cause Category is required')
    if (!body.assignedTo) validationErrors.push('Assigned To is required')
    if (!body.resolutionDueDate) validationErrors.push('Resolution Due Date is required')
    
    if (validationErrors.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: validationErrors
      }, { status: 400 })
    }
    
    // Add timestamps
    const correctiveActionData = {
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    const result = await collection.insertOne(correctiveActionData)
    
    return NextResponse.json({
      success: true,
      data: { ...correctiveActionData, _id: result.insertedId }
    })
  } catch (error) {
    console.error('Error creating corrective action:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create corrective action'
    }, { status: 500 })
  }
}
