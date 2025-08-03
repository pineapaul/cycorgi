import { NextRequest, NextResponse } from 'next/server'
import { clientPromise } from '../../../../../../lib/mongodb'
import { EXTENSION_STATUS } from '../../../../../../lib/constants'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ riskId: string; treatmentId: string }> }
) {
  try {
    const { extendedDueDate, justification } = await request.json()
    const { riskId, treatmentId } = await params

    // Validate required fields
    if (!extendedDueDate || !justification) {
      return NextResponse.json(
        { error: 'Extended due date and justification are required' },
        { status: 400 }
      )
    }

    // Validate date format
    const date = new Date(extendedDueDate)
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      )
    }

    // Check if date is today or in the future (accounting for timezone)
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time to start of day for fair comparison
    const selectedDate = new Date(date)
    selectedDate.setHours(0, 0, 0, 0) // Reset time to start of day for fair comparison
    
    if (selectedDate < today) {
      return NextResponse.json(
        { error: 'Extended due date must be today or a future date' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db('cycorgi')

    // Find the treatment by treatmentId and riskId
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

    // Create the extension object
    const extension = {
      extendedDueDate: extendedDueDate,
      justification: justification.trim(),
      approver: EXTENSION_STATUS.PENDING_APPROVAL, // This would typically be set by an admin
      dateApproved: null, // This will be set when approved
      createdAt: new Date().toISOString()
    }

    // Add the extension to the treatment
    const result = await db.collection('treatments').updateOne(
      { 
        treatmentId: treatmentId,
        riskId: riskId
      },
      {
        $push: { extensions: extension },
        $inc: { numberOfExtensions: 1 },
        $set: { 
          extendedDueDate: extendedDueDate,
          updatedAt: new Date().toISOString()
        }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Treatment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Extension request submitted successfully',
      extension
    })

  } catch (error) {
    console.error('Extension request error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 