import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '../../../../../lib/mongodb'
import { ObjectId } from 'mongodb'

interface RouteParams {
  params: {
    id: string
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params
    const body = await request.json()
    const client = await clientPromise
    const db = client.db('cycorgi')
    const collection = db.collection('soa_controls')
    
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: body }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json({
        success: false,
        error: 'Control not found'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: { _id: id, ...body }
    })
  } catch (error) {
    console.error('Error updating SoA control:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update SoA control'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params
    const client = await clientPromise
    const db = client.db('cycorgi')
    const collection = db.collection('soa_controls')
    
    const result = await collection.deleteOne({ _id: new ObjectId(id) })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({
        success: false,
        error: 'Control not found'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Control deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting SoA control:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to delete SoA control'
    }, { status: 500 })
  }
} 