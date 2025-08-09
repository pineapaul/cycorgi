import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '../../../../lib/mongodb'
import { 
  CONTROL_STATUS, 
  CONTROL_APPLICABILITY, 
  CONTROL_JUSTIFICATION 
} from '../../../../lib/constants'

export async function GET() {
  try {
    const client = await clientPromise()
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
    const client = await clientPromise()
    const db = client.db('cycorgi')
    const collection = db.collection('soa_controls')
    
    // Validate required fields and enum values
    const validationErrors: string[] = []
    
    if (!body.id) validationErrors.push('Control ID is required')
    if (!body.title) validationErrors.push('Control title is required')
    if (!body.description) validationErrors.push('Control description is required')
    if (!body.controlSetId) validationErrors.push('Control set ID is required')
    
    // Validate controlStatus
    if (!body.controlStatus) {
      validationErrors.push('Control status is required')
    } else if (!Object.values(CONTROL_STATUS).includes(body.controlStatus)) {
      validationErrors.push(`Invalid control status. Must be one of: ${Object.values(CONTROL_STATUS).join(', ')}`)
    }
    
    // Validate controlApplicability
    if (!body.controlApplicability) {
      validationErrors.push('Control applicability is required')
    } else if (!Object.values(CONTROL_APPLICABILITY).includes(body.controlApplicability)) {
      validationErrors.push(`Invalid control applicability. Must be one of: ${Object.values(CONTROL_APPLICABILITY).join(', ')}`)
    }
    
    // Validate justification if provided
    if (body.justification && !Object.values(CONTROL_JUSTIFICATION).includes(body.justification)) {
      validationErrors.push(`Invalid justification. Must be one of: ${Object.values(CONTROL_JUSTIFICATION).join(', ')}`)
    }
    
    // Validate relatedRisks if provided
    if (body.relatedRisks && !Array.isArray(body.relatedRisks)) {
      validationErrors.push('Related risks must be an array of risk IDs')
    }
    
    if (validationErrors.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: validationErrors
      }, { status: 400 })
    }
    
    // Add timestamps
    const controlData = {
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    const result = await collection.insertOne(controlData)
    
    return NextResponse.json({
      success: true,
      data: { ...controlData, _id: result.insertedId }
    })
  } catch (error) {
    console.error('Error creating SoA control:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create SoA control'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const client = await clientPromise()
    const db = client.db('cycorgi')
    const collection = db.collection('soa_controls')
    
    const { id, ...updateData } = body
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Control ID is required'
      }, { status: 400 })
    }
    
    // Validate enum values if they are being updated
    const validationErrors: string[] = []
    
    if (updateData.controlStatus && !Object.values(CONTROL_STATUS).includes(updateData.controlStatus)) {
      validationErrors.push(`Invalid control status. Must be one of: ${Object.values(CONTROL_STATUS).join(', ')}`)
    }
    
    if (updateData.controlApplicability && !Object.values(CONTROL_APPLICABILITY).includes(updateData.controlApplicability)) {
      validationErrors.push(`Invalid control applicability. Must be one of: ${Object.values(CONTROL_APPLICABILITY).join(', ')}`)
    }
    
    if (updateData.justification && !Object.values(CONTROL_JUSTIFICATION).includes(updateData.justification)) {
      validationErrors.push(`Invalid justification. Must be one of: ${Object.values(CONTROL_JUSTIFICATION).join(', ')}`)
    }
    
    if (updateData.relatedRisks && !Array.isArray(updateData.relatedRisks)) {
      validationErrors.push('Related risks must be an array of risk IDs')
    }
    
    if (validationErrors.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: validationErrors
      }, { status: 400 })
    }
    
    // Add updated timestamp
    const dataToUpdate = {
      ...updateData,
      updatedAt: new Date().toISOString()
    }
    
    const result = await collection.updateOne(
      { id: id },
      { $set: dataToUpdate }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json({
        success: false,
        error: 'Control not found'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: { id, ...dataToUpdate }
    })
  } catch (error) {
    console.error('Error updating SoA control:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update SoA control'
    }, { status: 500 })
  }
} 