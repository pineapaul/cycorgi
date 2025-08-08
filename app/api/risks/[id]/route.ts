import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '../../../../lib/mongodb'
import { 
  validateAndTransformRiskData, 
  transformRiskForResponse, 
  createAssetIdMap,
  type InformationAsset 
} from '../../../../lib/risk-validation'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const client = await clientPromise
    const db = client.db('cycorgi')
    const collection = db.collection('risks')
    const informationAssetsCollection = db.collection('information-assets')
    
    const risk = await collection.findOne({ riskId: id })
    
    if (!risk) {
      return NextResponse.json({
        success: false,
        error: 'Risk not found'
      }, { status: 404 })
    }
    
    // Fetch information assets for transformation
    const informationAssets = await informationAssetsCollection.find({}).toArray() as unknown as InformationAsset[]
    const assetMap = new Map(informationAssets.map(asset => [asset.id, asset]))
    
    // Transform the risk data for response
    const transformedRisk = transformRiskForResponse(risk, assetMap)
    
    return NextResponse.json({
      success: true,
      data: transformedRisk
    })
  } catch (error) {
    console.error('Error fetching risk:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch risk'
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const client = await clientPromise
    const db = client.db('cycorgi')
    const collection = db.collection('risks')
    const informationAssetsCollection = db.collection('information-assets')
    
    // Fetch available information assets for validation
    const informationAssets = await informationAssetsCollection.find({}).toArray() as unknown as InformationAsset[]
    const availableAssetIds = createAssetIdMap(informationAssets)
    
    // Convert impactCIA string back to impact array for database storage
    const updateData = { ...body }
    if (updateData.impactCIA) {
      // Convert comma-separated string back to array
      updateData.impact = (updateData.impactCIA?.split(', ') || []).filter((item: string) => item.trim() !== '')
      delete updateData.impactCIA // Remove the string version as it's not stored in DB
    }
    
    // Validate and transform the update data
    const validation = validateAndTransformRiskData({ riskId: id, ...updateData }, availableAssetIds)
    
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: validation.errors
      }, { status: 400 })
    }
    
    const { riskId: validatedRiskId, ...validatedUpdateData } = validation.transformedData!
    
    const result = await collection.updateOne(
      { riskId: validatedRiskId },
      { $set: validatedUpdateData }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json({
        success: false,
        error: 'Risk not found'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: { ...validatedUpdateData, riskId: validatedRiskId }
    })
  } catch (error) {
    console.error('Error updating risk:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update risk'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const client = await clientPromise
    const db = client.db('cycorgi')
    const collection = db.collection('risks')
    
    const result = await collection.deleteOne({ riskId: id })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({
        success: false,
        error: 'Risk not found'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Risk deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting risk:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to delete risk'
    }, { status: 500 })
  }
} 