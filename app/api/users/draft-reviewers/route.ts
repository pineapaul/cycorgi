import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import getClientPromise from '@/lib/mongodb'

// GET - Fetch users with "Draft Risk Reviewer" role
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await getClientPromise()
    const db = client.db()
    
    // Find users who have the "Draft Risk Reviewer" role
    const users = await db.collection('users').find({
      roles: { $in: ['Draft Risk Reviewer'] },
      status: 'Active'
    }).project({
      _id: 1,
      name: 1,
      email: 1,
      roles: 1
    }).toArray()
    
    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching draft risk reviewers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
