import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise
    const db = client.db('cycorgi')
    const collection = db.collection('third-parties')
    
    const thirdParty = await collection.findOne({ id: params.id })
    
    if (!thirdParty) {
      return NextResponse.json(
        { success: false, error: 'Third party not found' },
        { status: 404 }
      )
    }
    
    // Migrate old data structure to new structure
    let migratedThirdParty = thirdParty
    if (thirdParty.informationAssetId && !thirdParty.informationAssetIds) {
      migratedThirdParty = {
        ...thirdParty,
        informationAssetIds: [thirdParty.informationAssetId],
        informationAssetId: undefined // Remove old field
      }
    } else if (!thirdParty.informationAssetIds) {
      migratedThirdParty = {
        ...thirdParty,
        informationAssetIds: []
      }
    }
    
    return NextResponse.json({
      success: true,
      data: migratedThirdParty
    })
  } catch (error) {
    console.error('Error fetching third party:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch third party' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const client = await clientPromise
    const db = client.db('cycorgi')
    const collection = db.collection('third-parties')
    
    const updatedThirdParty = {
      ...body,
      updatedAt: new Date().toISOString()
    }
    
    const result = await collection.updateOne(
      { id: params.id },
      { $set: updatedThirdParty }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Third party not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: updatedThirdParty
    })
  } catch (error) {
    console.error('Error updating third party:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update third party' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise
    const db = client.db('cycorgi')
    const collection = db.collection('third-parties')
    
    const result = await collection.deleteOne({ id: params.id })
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Third party not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Third party deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting third party:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete third party' },
      { status: 500 }
    )
  }
} 