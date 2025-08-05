import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '../../../lib/mongodb'
import { 
  validateAndTransformRiskData, 
  transformRiskForResponse, 
  createAssetIdMap,
  type InformationAsset 
} from '../../../lib/risk-validation'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('cycorgi')
    const risksCollection = db.collection('risks')
    const informationAssetsCollection = db.collection('information-assets')
    
    // Fetch all risks
    const risks = await risksCollection.find({}).toArray()
    
    // Fetch all information assets for reference
    const informationAssets = await informationAssetsCollection.find({}).toArray()
    const assetMap = new Map(informationAssets.map(asset => [asset.id, asset]))
    
    // Transform risks to include information asset details
    const transformedRisks = risks.map(risk => transformRiskForResponse(risk, assetMap))
    
    return NextResponse.json({
      success: true,
      data: transformedRisks
    })
  } catch (error) {
    console.error('Error fetching risks:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch risks'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const client = await clientPromise
    const db = client.db('cycorgi')
    const collection = db.collection('risks')
    
    // Fetch available information assets for validation
    const informationAssetsCollection = db.collection('information-assets')
    const informationAssets = await informationAssetsCollection.find({}).toArray() as InformationAsset[]
    const availableAssetIds = createAssetIdMap(informationAssets)
    
    // Validate and transform the request data
    const validation = validateAndTransformRiskData(body, availableAssetIds)
    
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: validation.errors
      }, { status: 400 })
    }
    
    const result = await collection.insertOne(validation.transformedData)
    
    return NextResponse.json({
      success: true,
      data: { ...validation.transformedData, _id: result.insertedId }
    })
  } catch (error) {
    console.error('Error creating risk:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create risk'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const client = await clientPromise
    const db = client.db('cycorgi')
    const collection = db.collection('risks')
    
    // Extract riskId from the request body
    const { riskId, ...updateData } = body
    
    if (!riskId) {
      return NextResponse.json({
        success: false,
        error: 'Risk ID is required'
      }, { status: 400 })
    }
    
    // Fetch available information assets for validation
    const informationAssetsCollection = db.collection('information-assets')
    const informationAssets = await informationAssetsCollection.find({}).toArray() as InformationAsset[]
    const availableAssetIds = createAssetIdMap(informationAssets)
    
    // Validate and transform the update data
    const validation = validateAndTransformRiskData({ riskId, ...updateData }, availableAssetIds)
    
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
      { $set: { ...validatedUpdateData, updatedAt: new Date().toISOString() } }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json({
        success: false,
        error: 'Risk not found'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: { riskId: validatedRiskId, ...validatedUpdateData }
    })
  } catch (error) {
    console.error('Error updating risk:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update risk'
    }, { status: 500 })
  }
} 