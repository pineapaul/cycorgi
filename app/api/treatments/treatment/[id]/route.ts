import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '../../../../../lib/mongodb'
import { ObjectId } from 'mongodb'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const client = await clientPromise
    const db = client.db('cycorgi')
    const collection = db.collection('treatments')
    
    // Remove _id from body if it exists to avoid MongoDB conflicts
    const { _id, ...updateData } = body
    
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json({
        success: false,
        error: 'Treatment not found'
      }, { status: 404 })
    }
    
    // Fetch the updated document
    const updatedTreatment = await collection.findOne({ _id: new ObjectId(id) })
    
    return NextResponse.json({
      success: true,
      data: updatedTreatment
    })
  } catch (error) {
    console.error('Error updating treatment:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update treatment'
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
    const collection = db.collection('treatments')
    
    const result = await collection.deleteOne({ _id: new ObjectId(id) })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({
        success: false,
        error: 'Treatment not found'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Treatment deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting treatment:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to delete treatment'
    }, { status: 500 })
  }
} 