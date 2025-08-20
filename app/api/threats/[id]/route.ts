import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Threat ID is required' },
        { status: 400 }
      )
    }

    const client = await clientPromise()
    const db = client.db('cycorgi')
    const collection = db.collection('threats')

    // Find the threat by ID (search by _id since that's what's stored in MongoDB)
    // Convert string ID to ObjectId for MongoDB query
    const threat = await collection.findOne({ _id: new ObjectId(id) })
    
    if (!threat) {
      return NextResponse.json(
        { success: false, error: 'Threat not found' },
        { status: 404 }
      )
    }

    // Populate information assets details if they exist
    if (threat.informationAssets && threat.informationAssets.length > 0) {
      const assetsCollection = db.collection('information-assets')
      const assets = await assetsCollection
        .find({ id: { $in: threat.informationAssets } }, { 
          projection: { 
            id: 1, 
            informationAsset: 1, 
            category: 1, 
            type: 1,
            criticality: 1
          } 
        })
        .toArray()
      
      const assetsMap = new Map(assets.map(asset => [asset.id, asset]))
      
      threat.informationAssets = (threat.informationAssets || []).map((assetId: string) => assetsMap.get(assetId)).filter(Boolean)
    }

    // Populate createdBy user details if they exist
    if (threat.createdBy) {
      try {
        const usersCollection = db.collection('users')
        const user = await usersCollection.findOne(
          { _id: new ObjectId(threat.createdBy) },
          { projection: { name: 1, email: 1 } }
        )
        
        if (user) {
          threat.createdBy = {
            id: threat.createdBy,
            name: user.name,
            email: user.email
          }
        }
      } catch (error) {
        console.warn('Could not populate createdBy user details:', error)
        // Keep the original createdBy value if user lookup fails
      }
    }

    // Map MongoDB _id to id for frontend compatibility
    const threatWithId = {
      ...threat,
      id: threat._id.toString()
    }

    return NextResponse.json({
      success: true,
      data: threatWithId
    })
  } catch (error) {
    console.error('Error fetching threat:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
