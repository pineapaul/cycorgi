import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'
import { USER_ROLES } from '@/lib/constants'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await clientPromise()
    const db = client.db('cycorgi')
    const collection = db.collection('system-settings')
    
    // Get system settings, create default if none exist
    let settings = await collection.findOne({})
    
    if (!settings) {
      // Create default settings
      const defaultSettings = {
        riskTreatmentDueDates: {
          extreme: 30,
          high: 90,
          moderate: 180,
          low: 365
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      const result = await collection.insertOne(defaultSettings)
      settings = { ...defaultSettings, _id: result.insertedId }
    }
    
    return NextResponse.json({ success: true, data: settings })
  } catch (error) {
    console.error('Error fetching system settings:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch system settings' 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get the latest user role from database to ensure it's current
    const client = await clientPromise()
    const db = client.db('cycorgi')
    const userCollection = db.collection('users')
    
    const currentUser = await userCollection.findOne({ email: session.user.email })
    
    if (!currentUser || currentUser.role !== USER_ROLES.ADMIN) {
      return NextResponse.json({ 
        success: false, 
        error: 'Access denied. Admin role required.' 
      }, { status: 403 })
    }

    const body = await request.json()
    const { riskTreatmentDueDates } = body
    
    // Validate the due dates
    if (!riskTreatmentDueDates || 
        typeof riskTreatmentDueDates.extreme !== 'number' ||
        typeof riskTreatmentDueDates.high !== 'number' ||
        typeof riskTreatmentDueDates.moderate !== 'number' ||
        typeof riskTreatmentDueDates.low !== 'number') {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid due dates format' 
      }, { status: 400 })
    }
    
    // Validate that due dates are positive numbers
    if (riskTreatmentDueDates.extreme <= 0 || 
        riskTreatmentDueDates.high <= 0 || 
        riskTreatmentDueDates.moderate <= 0 || 
        riskTreatmentDueDates.low <= 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Due dates must be positive numbers' 
      }, { status: 400 })
    }

    const systemSettingsCollection = db.collection('system-settings')
    
    // Update or create system settings
    await systemSettingsCollection.updateOne(
      {}, // Update the first (and only) document
      {
        $set: {
          riskTreatmentDueDates,
          updatedAt: new Date()
        },
        $setOnInsert: {
          createdAt: new Date()
        }
      },
      { upsert: true }
    )
    
    return NextResponse.json({ 
      success: true, 
      message: 'System settings updated successfully' 
    })
  } catch (error) {
    console.error('Error updating system settings:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update system settings' 
    }, { status: 500 })
  }
}

// Debug endpoint to check user role status
export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await clientPromise()
    const db = client.db('cycorgi')
    const userCollection = db.collection('users')
    
    const currentUser = await userCollection.findOne({ email: session.user.email })
    
    return NextResponse.json({ 
      success: true, 
      data: {
        sessionRole: session.user.role,
        databaseRole: currentUser?.role || 'Not found',
        email: session.user.email,
        name: session.user.name,
        status: currentUser?.status || 'Unknown'
      }
    })
  } catch (error) {
    console.error('Error checking user role:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to check user role' 
    }, { status: 500 })
  }
}
