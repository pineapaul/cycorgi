import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '../../../lib/mongodb'

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
    const transformedRisks = risks.map(risk => {
      let informationAssets = []
      
      // Handle the informationAsset field
      if (risk.informationAsset) {
        if (Array.isArray(risk.informationAsset)) {
          // New format: array of ID strings - fetch names from information-assets collection
          informationAssets = risk.informationAsset.map((assetId: string) => {
            const foundAsset = assetMap.get(assetId)
            return foundAsset ? { id: assetId, name: foundAsset.informationAsset } : { id: assetId, name: assetId }
          })
        } else if (typeof risk.informationAsset === 'string') {
          // Old format: string - convert to new format
          const assetIds = risk.informationAsset.split(',').map((id: string) => id.trim())
          informationAssets = assetIds.map((id: string) => {
            const foundAsset = assetMap.get(id)
            return { id, name: foundAsset ? foundAsset.informationAsset : id }
          })
        }
      }
      
      return {
        ...risk,
        informationAsset: informationAssets
      }
    })
    
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
    
    // Transform informationAssets from array of IDs to array of ID strings
    if (body.informationAssets && Array.isArray(body.informationAssets)) {
      body.informationAsset = body.informationAssets
      delete body.informationAssets
    }
    
    const result = await collection.insertOne(body)
    
    return NextResponse.json({
      success: true,
      data: { ...body, _id: result.insertedId }
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
    
    // Transform informationAsset if it's an array of IDs
    if (updateData.informationAsset && Array.isArray(updateData.informationAsset)) {
      // Keep the array structure as is since it's already in the correct format (array of ID strings)
    }
    
    const result = await collection.updateOne(
      { riskId: riskId },
      { $set: { ...updateData, updatedAt: new Date().toISOString() } }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json({
        success: false,
        error: 'Risk not found'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: { riskId, ...updateData }
    })
  } catch (error) {
    console.error('Error updating risk:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update risk'
    }, { status: 500 })
  }
} 