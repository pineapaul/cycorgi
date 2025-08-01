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
    
    // Required fields validation
    if (!body.id || !body.date || !body.facilitator) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: id, date, and facilitator are required'
      }, { status: 400 })
    }
    
    // Validate security steering committee
    if (!VALID_SECURITY_COMMITTEES.includes(body.securitySteeringCommittee)) {
      return NextResponse.json({
        success: false,
        error: `Invalid securitySteeringCommittee: "${body.securitySteeringCommittee}". Must be one of: ${VALID_SECURITY_COMMITTEES.join(', ')}`
      }, { status: 400 })
    }
    
    // Validate status
    if (!VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({
        success: false,
        error: `Invalid status: "${body.status}". Must be one of: ${VALID_STATUSES.join(', ')}`
      }, { status: 400 })
    }
    
    // Validate Meeting Minutes structure if provided
    if (body.extensions && !Array.isArray(body.extensions)) {
      return NextResponse.json({
        success: false,
        error: 'Extensions must be an array'
      }, { status: 400 })
    }
    
    if (body.closure && !Array.isArray(body.closure)) {
      return NextResponse.json({
        success: false,
        error: 'Closure must be an array'
      }, { status: 400 })
    }
    
    if (body.newRisks && !Array.isArray(body.newRisks)) {
      return NextResponse.json({
        success: false,
        error: 'New Risks must be an array'
      }, { status: 400 })
    }
    
    // Validate each item in the arrays if they exist
    const validateMeetingMinutesItem = (item: any, sectionName: string) => {
      if (!item.riskId || typeof item.riskId !== 'string') {
        throw new Error(`${sectionName}: Each item must have a valid riskId string`)
      }
      if (item.actionsTaken && typeof item.actionsTaken !== 'string') {
        throw new Error(`${sectionName}: actionsTaken must be a string`)
      }
      if (item.toDo && typeof item.toDo !== 'string') {
        throw new Error(`${sectionName}: toDo must be a string`)
      }
      if (item.outcome && typeof item.outcome !== 'string') {
        throw new Error(`${sectionName}: outcome must be a string`)
      }
    }
    
    try {
      if (body.extensions) {
        body.extensions.forEach((item: any, index: number) => {
          validateMeetingMinutesItem(item, `Extensions item ${index + 1}`)
        })
      }
      if (body.closure) {
        body.closure.forEach((item: any, index: number) => {
          validateMeetingMinutesItem(item, `Closure item ${index + 1}`)
        })
      }
      if (body.newRisks) {
        body.newRisks.forEach((item: any, index: number) => {
          validateMeetingMinutesItem(item, `New Risks item ${index + 1}`)
        })
      }
    } catch (validationError) {
      return NextResponse.json({
        success: false,
        error: validationError instanceof Error ? validationError.message : 'Invalid Meeting Minutes structure'
      }, { status: 400 })
    }
    
    const client = await clientPromise
    const db = client.db('cycorgi')
    const collection = db.collection('workshops')
    
    const result = await collection.insertOne(body)
    
    return NextResponse.json({
      success: true,
      data: { ...body, _id: result.insertedId }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating workshop:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create workshop'
    }, { status: 500 })
  }
} 