import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import getClientPromise from '@/lib/mongodb'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can view user roles
    if (!session.user.roles?.includes('Admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const client = await getClientPromise()
    const db = client.db('cycorgi')
    const roles = await db.collection('user-roles').find({}).toArray()

    return NextResponse.json(roles)
  } catch (error) {
    console.error('Error fetching user roles:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can create user roles
    if (!session.user.roles?.includes('Admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, permissions } = body

    // Validate required fields
    if (!name || !description || !permissions || !Array.isArray(permissions)) {
      return NextResponse.json(
        { error: 'Name, description, and permissions array are required' },
        { status: 400 }
      )
    }

    // Validate permissions array is not empty
    if (permissions.length === 0) {
      return NextResponse.json(
        { error: 'Permissions array cannot be empty' },
        { status: 400 }
      )
    }

    const client = await getClientPromise()
    const db = client.db('cycorgi')
    
    // Check if role name already exists
    const existingRole = await db.collection('user-roles').findOne({ name })
    if (existingRole) {
      return NextResponse.json(
        { error: 'Role name already exists' },
        { status: 409 }
      )
    }

    const newRole = {
      name,
      description,
      permissions,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection('user-roles').insertOne(newRole)
    
    return NextResponse.json(
      { ...newRole, _id: result.insertedId },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating user role:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
