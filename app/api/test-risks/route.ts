import { NextResponse } from 'next/server'
import clientPromise from '../../../lib/mongodb'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('cycorgi')
    const collection = db.collection('risks')
    
    const count = await collection.countDocuments()
    const sampleRisk = await collection.findOne({})
    
    return NextResponse.json({
      success: true,
      count,
      sampleRisk,
      message: 'Risks collection test'
    })
  } catch (error) {
    console.error('Error testing risks:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to test risks collection'
    }, { status: 500 })
  }
} 