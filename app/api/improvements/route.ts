import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export interface Improvement {
  _id?: any
  functionalUnit: string
  status: string
  dateRaised: string
  raisedBy: string
  location: string
  ofiJiraTicket: string
  informationAsset: string
  description: string
  assignedTo: string
  benefitScore: number
  jobSize: string
  wsjf: number
  prioritisedQuarter: string
  actionTaken: string
  completionDate?: string
  dateApprovedForClosure?: string
  createdAt: string
  updatedAt: string
}

export async function GET() {
  try {
    const client = await clientPromise()
    const db = client.db('cycorgi')
    const collection = db.collection('improvements')
    
    const improvements = await collection.find({}).sort({ createdAt: -1 }).toArray()
    
    return NextResponse.json({
      success: true,
      data: improvements
    })
  } catch (error) {
    console.error('Error fetching improvements:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch improvements'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const client = await clientPromise()
    const db = client.db('cycorgi')
    const collection = db.collection('improvements')
    
    const now = new Date().toISOString()
    const improvement: Improvement = {
      ...body,
      createdAt: now,
      updatedAt: now
    }
    
    const result = await collection.insertOne(improvement)
    
    return NextResponse.json({
      success: true,
      data: { ...improvement, _id: result.insertedId }
    })
  } catch (error) {
    console.error('Error creating improvement:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create improvement'
    }, { status: 500 })
  }
}
