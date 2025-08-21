import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const client = await clientPromise()
    const db = client.db('cycorgi')
    const collection = db.collection('improvements')
    
    const improvement = await collection.findOne({ _id: new ObjectId(id) })
    
    if (!improvement) {
      return NextResponse.json({
        success: false,
        error: 'Improvement not found'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: improvement
    })
  } catch (error) {
    console.error('Error fetching improvement:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch improvement'
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const client = await clientPromise()
    const db = client.db('cycorgi')
    const collection = db.collection('improvements')
    
    const now = new Date().toISOString()
    const updateData = {
      ...body,
      updatedAt: now
    }
    
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json({
        success: false,
        error: 'Improvement not found'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: { ...updateData, _id: id }
    })
  } catch (error) {
    console.error('Error updating improvement:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update improvement'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const client = await clientPromise()
    const db = client.db('cycorgi')
    const collection = db.collection('improvements')
    
    const result = await collection.deleteOne({ _id: new ObjectId(id) })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({
        success: false,
        error: 'Improvement not found'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Improvement deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting improvement:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to delete improvement'
    }, { status: 500 })
  }
}
