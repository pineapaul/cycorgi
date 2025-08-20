import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const client = await clientPromise()
    const db = client.db('cycorgi')
    const collection = db.collection('information-assets')

    // Get simplified list of information assets for selection
    const assets = await collection
      .find({}, { 
        projection: { 
          id: 1, 
          informationAsset: 1, 
          category: 1, 
          type: 1,
          criticality: 1
        } 
      })
      .sort({ informationAsset: 1 })
      .toArray()

    return NextResponse.json({
      success: true,
      data: assets
    })
  } catch (error) {
    console.error('Error fetching information assets list:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
