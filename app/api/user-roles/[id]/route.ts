import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import getClientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can update user roles
    if (!session.user.roles?.includes('Admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
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

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid role ID format' },
        { status: 400 }
      )
    }

    const client = await getClientPromise()
    const db = client.db('cycorgi')
    
    // Check if role name already exists (excluding current role)
    const existingRole = await db.collection('user-roles').findOne({
      name,
      _id: { $ne: new ObjectId(id) }
    })
    
    if (existingRole) {
      return NextResponse.json(
        { error: 'Role name already exists' },
        { status: 409 }
      )
    }

    const updateData = {
      name,
      description,
      permissions,
      updatedAt: new Date()
    }

    const result = await db.collection('user-roles').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Role updated successfully' })
  } catch (error) {
    console.error('Error updating user role:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can delete user roles
    if (!session.user.roles?.includes('Admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid role ID format' },
        { status: 400 }
      )
    }

    const client = await getClientPromise()
    const db = client.db('cycorgi')
    
    // Check if role is being used by any users
    const usersWithRole = await db.collection('users').findOne({
      role: id
    })

    if (usersWithRole) {
      return NextResponse.json(
        { error: 'Cannot delete role that is currently assigned to users' },
        { status: 409 }
      )
    }

    const result = await db.collection('user-roles').deleteOne({
      _id: new ObjectId(id)
    })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Role deleted successfully' })
  } catch (error) {
    console.error('Error deleting user role:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
