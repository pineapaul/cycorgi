import { NextResponse } from 'next/server'
import clientPromise from '../../../../lib/mongodb'

export async function GET() {
  try {
    const client = await clientPromise()
    const db = client.db('cycorgi')
    const risksCollection = db.collection('risks')
    
    // Find the risk with the highest numeric ID
    const pipeline = [
      {
        $addFields: {
          // Extract numeric part from riskId (e.g., "RISK-123" -> 123)
          numericId: {
            $toInt: {
              $replaceAll: {
                input: "$riskId",
                find: "RISK-",
                replacement: ""
              }
            }
          }
        }
      },
      {
        $sort: { numericId: -1 }
      },
      {
        $limit: 1
      },
      {
        $project: {
          riskId: 1,
          numericId: 1
        }
      }
    ]
    
    const result = await risksCollection.aggregate(pipeline).toArray()
    
    let nextNumericId = 1
    
    if (result.length > 0 && result[0].numericId && !isNaN(result[0].numericId)) {
      // Increment the highest numeric ID by 1
      nextNumericId = result[0].numericId + 1
    }
    
    // Ensure we don't have duplicate IDs by checking if the generated ID already exists
    // This handles edge cases where there might be gaps in the sequence
    let attempts = 0
    const maxAttempts = 10 // Prevent infinite loops
    
    while (attempts < maxAttempts) {
      const existingRisk = await risksCollection.findOne({ riskId: `RISK-${nextNumericId.toString().padStart(3, '0')}` })
      if (!existingRisk) {
        break // Found an available ID
      }
      nextNumericId++
      attempts++
    }
    
    // Format the next risk ID with leading zeros (e.g., 1 -> "001", 12 -> "012", 123 -> "123")
    const nextRiskId = `RISK-${nextNumericId.toString().padStart(3, '0')}`
    
    return NextResponse.json({
      success: true,
      data: {
        nextRiskId,
        nextNumericId
      }
    })
  } catch (error) {
    console.error('Error generating next risk ID:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to generate next risk ID'
    }, { status: 500 })
  }
}
