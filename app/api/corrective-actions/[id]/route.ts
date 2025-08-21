import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const client = await clientPromise()
    const db = client.db('cycorgi')
    const collection = db.collection('corrective_actions')
    
    const correctiveAction = await collection.findOne({ _id: new ObjectId(id) })
    
    if (!correctiveAction) {
      return NextResponse.json({
        success: false,
        error: 'Corrective action not found'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: correctiveAction
    })
  } catch (error) {
    console.error('Error fetching corrective action:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch corrective action'
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
    
    // Add updated timestamp
    const updateData = {
      ...body,
      updatedAt: new Date().toISOString()
    }
    
    // Remove _id from update data
    delete (updateData as any)._id
    
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json({
        success: false,
        error: 'Corrective action not found'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: { _id: id, ...updateData }
    })
  } catch (error) {
    console.error('Error updating corrective action:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update corrective action'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const client = await clientPromise()
    const db = client.db('cycorgi')
    const collection = db.collection('corrective_actions')
    
    const result = await collection.deleteOne({ _id: new ObjectId(id) })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({
        success: false,
        error: 'Corrective action not found'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Corrective action deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting corrective action:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to delete corrective action'
    }, { status: 500 })
  }
}
