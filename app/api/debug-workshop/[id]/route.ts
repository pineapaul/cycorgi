import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '../../../../lib/mongodb'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise
    const db = client.db('cycorgi')
    const collection = db.collection('workshops')
    
    const workshop = await collection.findOne({ id: params.id })
    
    if (!workshop) {
      return NextResponse.json({
        success: false,
        error: 'Workshop not found'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: {
        id: workshop.id,
        extensions: workshop.extensions,
        closure: workshop.closure,
        newRisks: workshop.newRisks
      }
    })
  } catch (error) {
    console.error('Error fetching workshop:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch workshop'
    }, { status: 500 })
  }
} 