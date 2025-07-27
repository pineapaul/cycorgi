import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise
    const db = client.db('cycorgi')
    const collection = db.collection('information-assets')
    
    // Try to find by id field first, then by _id if that fails
    let asset = await collection.findOne({ id: params.id })
    
    if (!asset) {
      // If not found by id, try by _id (MongoDB ObjectId)
      try {
        const { ObjectId } = require('mongodb')
        asset = await collection.findOne({ _id: new ObjectId(params.id) })
      } catch (e) {
        // If ObjectId conversion fails, asset is not found
      }
    }
    
    if (!asset) {
      return NextResponse.json(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: asset
    })
  } catch (error) {
    console.error('Error fetching asset:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch asset' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const client = await clientPromise
    const db = client.db('cycorgi')
    const collection = db.collection('information-assets')
    
    // Update the asset with new data and timestamp, excluding _id field
    const { _id, ...bodyWithoutId } = body
    const updatedAsset = {
      ...bodyWithoutId,
      updatedAt: new Date().toISOString()
    }
    
    // Try to update by id field first, then by _id if that fails
    let result = await collection.updateOne(
      { id: params.id },
      { $set: updatedAsset }
    )
    
    if (result.matchedCount === 0) {
      // If not found by id, try by _id (MongoDB ObjectId)
      try {
        const { ObjectId } = require('mongodb')
        result = await collection.updateOne(
          { _id: new ObjectId(params.id) },
          { $set: updatedAsset }
        )
      } catch (e) {
        // If ObjectId conversion fails, asset is not found
      }
    }
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: updatedAsset
    })
  } catch (error) {
    console.error('Error updating asset:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update asset' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise
    const db = client.db('cycorgi')
    const collection = db.collection('information-assets')
    
    // Try to delete by id field first, then by _id if that fails
    let result = await collection.deleteOne({ id: params.id })
    
    if (result.deletedCount === 0) {
      // If not found by id, try by _id (MongoDB ObjectId)
      try {
        const { ObjectId } = require('mongodb')
        result = await collection.deleteOne({ _id: new ObjectId(params.id) })
      } catch (e) {
        // If ObjectId conversion fails, asset is not found
      }
    }
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Asset deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting asset:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete asset' },
      { status: 500 }
    )
  }
} 