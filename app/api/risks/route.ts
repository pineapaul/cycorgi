import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '../../../lib/mongodb'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('cycorgi')
    const collection = db.collection('risks')
    
    const risks = await collection.find({}).toArray()
    
    return NextResponse.json({
      success: true,
      data: risks
    })
  } catch (error) {
    console.error('Error fetching risks:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch risks'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const client = await clientPromise
    const db = client.db('cycorgi')
    const collection = db.collection('risks')
    
    const result = await collection.insertOne(body)
    
    return NextResponse.json({
      success: true,
      data: { ...body, _id: result.insertedId }
    })
  } catch (error) {
    console.error('Error creating risk:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create risk'
    }, { status: 500 })
  }
} 