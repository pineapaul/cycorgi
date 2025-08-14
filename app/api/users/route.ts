import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import getClientPromise from '@/lib/mongodb'
import { USER_STATUS, UserStatus } from '@/lib/constants'
import { ObjectId } from 'mongodb'

// GET - Fetch all users (Admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!session.user.roles?.includes('Admin')) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const client = await getClientPromise()
    const db = client.db()
    
    const users = await db.collection('users').find({}).toArray()
    
    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new user (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!session.user.roles?.includes('Admin')) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { name, email, roles, status } = body

    // Validation
    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    if (roles && (!Array.isArray(roles) || roles.length === 0)) {
      return NextResponse.json({ error: 'At least one role is required' }, { status: 400 })
    }

    if (status && !Object.values(USER_STATUS).includes(status as UserStatus)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const client = await getClientPromise()
    const db = client.db()
    
    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 })
    }

    const newUser = {
      name,
      email,
      roles: roles || [],
      status: status || USER_STATUS.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: session.user.id
    }

    const result = await db.collection('users').insertOne(newUser)
    
    return NextResponse.json({ 
      message: 'User created successfully', 
      userId: result.insertedId 
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update user role/status (Admin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!session.user.roles?.includes('Admin')) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    console.log('User update request body:', body)
    
    const { id, roles, status } = body

    if (!id) {
      console.log('Missing user ID in request body')
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    if (roles && (!Array.isArray(roles) || roles.length === 0)) {
      console.log('Invalid roles provided:', roles)
      return NextResponse.json({ error: 'At least one role is required' }, { status: 400 })
    }

    if (status && !Object.values(USER_STATUS).includes(status as UserStatus)) {
      console.log('Invalid status provided:', status)
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const client = await getClientPromise()
    const db = client.db()
    
    const updateData: any = {
      updatedAt: new Date(),
      updatedBy: session.user.id
    }

    if (roles) updateData.roles = roles
    if (status) updateData.status = status

    console.log('Update data:', updateData)

    // Convert string ID to ObjectId for MongoDB query
    let objectId: ObjectId
    try {
      objectId = new ObjectId(id)
      console.log('Converted ID to ObjectId:', objectId)
    } catch (error) {
      console.log('Failed to convert ID to ObjectId:', id, error)
      return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 })
    }

    const result = await db.collection('users').updateOne(
      { _id: objectId },
      { $set: updateData }
    )

    console.log('Update result:', result)

    if (result.matchedCount === 0) {
      console.log('No user found with ID:', id)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'User updated successfully' })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
