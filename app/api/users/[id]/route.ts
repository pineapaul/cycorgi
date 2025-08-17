import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import getClientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// GET - Fetch user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const client = await getClientPromise()
    const db = client.db()
    
    // Try to find user by ObjectId first, then by string ID
    let user = null
    
    try {
      if (ObjectId.isValid(id)) {
        user = await db.collection('users').findOne({ _id: new ObjectId(id) })
      }
    } catch (err) {
      // Ignore ObjectId conversion errors
    }
    
    // If not found by ObjectId, try by string ID (email or other identifier)
    if (!user) {
      user = await db.collection('users').findOne({ 
        $or: [
          { email: id },
          { name: id }
        ]
      })
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Return only safe user data (exclude sensitive information)
    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      roles: user.roles || [],
      status: user.status
    }

    return NextResponse.json(safeUser)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
