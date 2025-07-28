import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '../../../../lib/mongodb'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise
    const db = client.db('cycorgi')
    const collection = db.collection('risks')
    
    const risk = await collection.findOne({ riskId: params.id })
    
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
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const client = await clientPromise
    const db = client.db('cycorgi')
    const collection = db.collection('risks')
    
    const result = await collection.updateOne(
      { riskId: params.id },
      { $set: body }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json({
        success: false,
        error: 'Risk not found'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: { ...body, riskId: params.id }
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
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise
    const db = client.db('cycorgi')
    const collection = db.collection('risks')
    
    const result = await collection.deleteOne({ riskId: params.id })
    
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