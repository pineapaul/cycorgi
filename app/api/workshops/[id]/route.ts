import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '../../../../lib/mongodb'
import { ObjectId } from 'mongodb'
import { validateWorkshopForUpdate } from '../../../../lib/workshop-validation'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const client = await clientPromise
    const db = client.db('cycorgi')
    const collection = db.collection('workshops')
    
    // Try to find by workshop ID first, then by MongoDB _id
    let workshop = await collection.findOne({ id })
    
    if (!workshop) {
      // If not found by workshop ID, try by MongoDB _id
      try {
        workshop = await collection.findOne({ _id: new ObjectId(id) })
      } catch (objectIdError) {
        // Invalid ObjectId format, continue with null workshop
      }
    }
    
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
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('API: PUT method called')
  
  try {
    console.log('API: Starting PUT request')
    const { id } = await params
    console.log('API: Workshop ID from params:', id)
    
    const body = await request.json()
    console.log('API: Received update request for workshop:', id)
    console.log('API: Request body:', JSON.stringify(body, null, 2))
    
    // Test validation first
    try {
      console.log('API: Starting validation')
      validateWorkshopForUpdate(body)
      console.log('API: Validation passed')
    } catch (validationError) {
      console.log('API: Validation failed:', validationError)
      return NextResponse.json({
        success: false,
        error: validationError instanceof Error ? validationError.message : 'Invalid workshop data'
      }, { status: 400 })
    }
    
    // Test MongoDB connection
    console.log('API: Connecting to MongoDB')
    const client = await clientPromise
    const db = client.db('cycorgi')
    const collection = db.collection('workshops')
    console.log('API: MongoDB connected successfully')
    
    // Add updatedAt timestamp
    const updateData = {
      ...body,
      updatedAt: new Date().toISOString()
    }
    
    console.log('API: Update data:', JSON.stringify(updateData, null, 2))
    
    // Try to update by workshop ID first, then by MongoDB _id
    console.log('API: Attempting first update by workshop ID')
    let result = await collection.updateOne(
      { id },
      { $set: updateData }
    )
    
    console.log('API: First update attempt result:', result)
    
    if (result.matchedCount === 0) {
      // If not found by workshop ID, try by MongoDB _id
      console.log('API: Workshop not found by ID, trying by MongoDB _id')
      try {
        result = await collection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        )
        console.log('API: Second update attempt result:', result)
      } catch (objectIdError) {
        console.log('API: ObjectId error:', objectIdError)
        // Invalid ObjectId format, continue with result
      }
    }
    
    if (result.matchedCount === 0) {
      console.log('API: No workshop found to update')
      return NextResponse.json({
        success: false,
        error: 'Workshop not found'
      }, { status: 404 })
    }
    
    console.log('API: Update successful')
    return NextResponse.json({
      success: true,
      data: { ...updateData, _id: id }
    })
    
  } catch (error) {
    console.error('API: Error in PUT method:', error)
    console.error('API: Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json({
      success: false,
      error: 'Failed to update workshop',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const client = await clientPromise
    const db = client.db('cycorgi')
    const collection = db.collection('workshops')
    
    // Try to delete by workshop ID first, then by MongoDB _id
    let result = await collection.deleteOne({ id })
    
    if (result.deletedCount === 0) {
      // If not found by workshop ID, try by MongoDB _id
      try {
        result = await collection.deleteOne({ _id: new ObjectId(id) })
      } catch (objectIdError) {
        // Invalid ObjectId format, continue with result
      }
    }
    
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