import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '../../../../lib/mongodb'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const client = await clientPromise
    const db = client.db('cycorgi')
    const collection = db.collection('risks')
    
    const risk = await collection.findOne({ riskId: id })
    
    if (!risk) {
      return NextResponse.json({
        success: false,
        error: 'Risk not found'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: risk
    })
  } catch (error) {
    console.error('Error fetching risk:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch risk'
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
    const client = await clientPromise
    const db = client.db('cycorgi')
    const collection = db.collection('risks')
    
    // Convert impactCIA string back to impact array for database storage
    const updateData = { ...body }
    if (updateData.impactCIA) {
      // Convert comma-separated string back to array
      updateData.impact = updateData.impactCIA.split(', ').filter((item: string) => item.trim() !== '')
      delete updateData.impactCIA // Remove the string version as it's not stored in DB
    }
    
    const result = await collection.updateOne(
      { riskId: id },
      { $set: updateData }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json({
        success: false,
        error: 'Risk not found'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: { ...updateData, riskId: id }
    })
  } catch (error) {
    console.error('Error updating risk:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update risk'
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
    const collection = db.collection('risks')
    
    const result = await collection.deleteOne({ riskId: id })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({
        success: false,
        error: 'Risk not found'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Risk deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting risk:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to delete risk'
    }, { status: 500 })
  }
} 