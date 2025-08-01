import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '../../../lib/mongodb'
import { validateWorkshopForCreate } from '../../../lib/workshop-validation'

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
    
    // Validate workshop data using shared validation function
    try {
      validateWorkshopForCreate(body)
    } catch (validationError) {
      return NextResponse.json({
        success: false,
        error: validationError instanceof Error ? validationError.message : 'Invalid workshop data'
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