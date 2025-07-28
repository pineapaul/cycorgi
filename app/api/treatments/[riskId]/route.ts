import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '../../../../lib/mongodb'

export async function GET(
  request: NextRequest,
  { params }: { params: { riskId: string } }
) {
  try {
    const client = await clientPromise
    const db = client.db('cycorgi')
    const collection = db.collection('treatments')
    
    const treatments = await collection.find({ riskId: params.riskId }).toArray()
    
    return NextResponse.json({
      success: true,
      data: treatments
    })
  } catch (error) {
    console.error('Error fetching treatments:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch treatments'
    }, { status: 500 })
  }
} 