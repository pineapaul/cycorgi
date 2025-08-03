import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '../../../../../lib/mongodb'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ riskId: string; treatmentId: string }> }
) {
  try {
    const client = await clientPromise
    const db = client.db('cycorgi')
    const { riskId, treatmentId } = await params

    // Query by treatmentId and riskId to ensure we get the correct treatment
    const treatment = await db.collection('treatments').findOne({
      treatmentId: treatmentId,
      riskId: riskId
    })

    if (!treatment) {
      return NextResponse.json(
        { error: 'Treatment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(treatment)
  } catch (error) {
    console.error('Error fetching treatment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 