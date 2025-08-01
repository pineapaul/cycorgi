import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '../../../../lib/mongodb'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('cycorgi')
    const collection = db.collection('soa_controls')
    
    const controls = await collection.find({}).toArray()
    
    return NextResponse.json({
      success: true,
      data: controls
    })
  } catch (error) {
    console.error('Error fetching SoA controls:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch SoA controls'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const client = await clientPromise
    const db = client.db('cycorgi')
    const collection = db.collection('soa_controls')
    
    const result = await collection.insertOne(body)
    
    return NextResponse.json({
      success: true,
      data: { ...body, _id: result.insertedId }
    })
  } catch (error) {
    console.error('Error creating SoA control:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create SoA control'
    }, { status: 500 })
  }
} 