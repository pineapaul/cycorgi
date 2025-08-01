import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '../../../../lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise
    const db = client.db('cycorgi')
    const collection = db.collection('workshops')
    
    const workshop = await collection.findOne({ _id: new ObjectId(params.id) })
    
    if (!workshop) {
      return NextResponse.json({
        success: false,
        error: 'Workshop not found'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: workshop
    })
  } catch (error) {
    console.error('Error fetching workshop:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch workshop'
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // Validation constants
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
    
    // Validate security steering committee if provided
    if (body.securitySteeringCommittee && !VALID_SECURITY_COMMITTEES.includes(body.securitySteeringCommittee)) {
      return NextResponse.json({
        success: false,
        error: `Invalid securitySteeringCommittee: "${body.securitySteeringCommittee}". Must be one of: ${VALID_SECURITY_COMMITTEES.join(', ')}`
      }, { status: 400 })
    }
    
    // Validate status if provided
    if (body.status && !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({
        success: false,
        error: `Invalid status: "${body.status}". Must be one of: ${VALID_STATUSES.join(', ')}`
      }, { status: 400 })
    }
    
    const client = await clientPromise
    const db = client.db('cycorgi')
    const collection = db.collection('workshops')
    
    const result = await collection.updateOne(
      { _id: new ObjectId(params.id) },
      { $set: body }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json({
        success: false,
        error: 'Workshop not found'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: { ...body, _id: params.id }
    })
  } catch (error) {
    console.error('Error updating workshop:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update workshop'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise
    const db = client.db('cycorgi')
    const collection = db.collection('workshops')
    
    const result = await collection.deleteOne({ _id: new ObjectId(params.id) })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({
        success: false,
        error: 'Workshop not found'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Workshop deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting workshop:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to delete workshop'
    }, { status: 500 })
  }
} 