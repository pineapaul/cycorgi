import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '../../../lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const riskId = searchParams.get('riskId')
    
    const client = await clientPromise()
    const db = client.db('cycorgi')
    const treatmentsCollection = db.collection('treatments')
    const risksCollection = db.collection('risks')
    
    // Build query filter
    const filter = riskId ? { riskId } : {}
    
    const treatments = await treatmentsCollection.find(filter).toArray()
    
    // Join with risks data to get riskStatement and informationAsset
    const enrichedTreatments = await Promise.all(
      treatments.map(async (treatment) => {
        const risk = await risksCollection.findOne({ riskId: treatment.riskId })
        return {
          ...treatment,
          riskStatement: risk?.riskStatement || '',
          informationAsset: risk?.informationAsset || ''
        }
      })
    )
    
    return NextResponse.json({
      success: true,
      data: enrichedTreatments
    })
  } catch (error) {
    console.error('Error fetching treatments:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch treatments'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const client = await clientPromise()
    const db = client.db('cycorgi')
    const collection = db.collection('treatments')
    
    const result = await collection.insertOne(body)
    
    return NextResponse.json({
      success: true,
      data: { ...body, _id: result.insertedId }
    })
  } catch (error) {
    console.error('Error creating treatment:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create treatment'
    }, { status: 500 })
  }
} 