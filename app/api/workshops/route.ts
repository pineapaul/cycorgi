import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '../../../lib/mongodb'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('cycorgi')
    const collection = db.collection('workshops')
    
    const workshops = await collection.find({}).toArray()
    
    return NextResponse.json({
      success: true,
      data: workshops
    })
  } catch (error) {
    console.error('Error fetching workshops:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch workshops'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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
    
    // Validate security steering committee
    if (body.securitySteeringCommittee && !VALID_SECURITY_COMMITTEES.includes(body.securitySteeringCommittee)) {
      return NextResponse.json({
        success: false,
        error: `Invalid securitySteeringCommittee: "${body.securitySteeringCommittee}". Must be one of: ${VALID_SECURITY_COMMITTEES.join(', ')}`
      }, { status: 400 })
    }
    
    // Validate status
    if (body.status && !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({
        success: false,
        error: `Invalid status: "${body.status}". Must be one of: ${VALID_STATUSES.join(', ')}`
      }, { status: 400 })
    }
    
    // Validate required fields
    if (!body.id) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: id'
      }, { status: 400 })
    }
    
    if (!body.date) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: date'
      }, { status: 400 })
    }
    
    if (!body.facilitator) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: facilitator'
      }, { status: 400 })
    }
    
    const client = await clientPromise
    const db = client.db('cycorgi')
    const collection = db.collection('workshops')
    
    const result = await collection.insertOne(body)
    
    return NextResponse.json({
      success: true,
      data: { ...body, _id: result.insertedId }
    })
  } catch (error) {
    console.error('Error creating workshop:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create workshop'
    }, { status: 500 })
  }
} 