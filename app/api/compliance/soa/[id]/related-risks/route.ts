import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '../../../../../../lib/mongodb'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: controlId } = await params
    
    if (!controlId) {
      return NextResponse.json({
        success: false,
        error: 'Control ID is required'
      }, { status: 400 })
    }

    const client = await clientPromise()
    const db = client.db('cycorgi')
    const risksCollection = db.collection('risks')
    
    // Find risks that reference this control in either field
    const relatedRisks = await risksCollection.find({
      $or: [
        { currentControlsReference: { $in: [controlId] } },
        { applicableControlsAfterTreatment: { $in: [controlId] } }
      ]
    }).project({
      riskId: 1,
      _id: 0
    }).toArray()
    
    return NextResponse.json({
      success: true,
      data: relatedRisks
    })
  } catch (error) {
    console.error('Error fetching related risks for control:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch related risks'
    }, { status: 500 })
  }
}
