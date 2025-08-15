import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import getClientPromise from '@/lib/mongodb'
import { APPROVAL_STATUS, ApprovalStatus } from '@/lib/constants'
import { ObjectId } from 'mongodb'

// GET - Fetch a specific approval by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid approval ID' }, { status: 400 })
    }

    const client = await getClientPromise()
    const db = client.db()
    
    const approval = await db.collection('approvals').findOne({ _id: new ObjectId(id) })
    
    if (!approval) {
      return NextResponse.json({ error: 'Approval not found' }, { status: 404 })
    }

    // Check if user has access to this approval
    if (!session.user.roles?.includes('Admin') && 
        approval.requester !== session.user.id && 
        !approval.approvers.includes(session.user.id)) {
      return NextResponse.json({ error: 'Forbidden - Access denied' }, { status: 403 })
    }
    
    return NextResponse.json(approval)
  } catch (error) {
    console.error('Error fetching approval:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update approval status and details
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { status, approvedDate, approvers } = body

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid approval ID' }, { status: 400 })
    }

    // Validate status if provided
    if (status && !Object.values(APPROVAL_STATUS).includes(status as ApprovalStatus)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const client = await getClientPromise()
    const db = client.db()
    
    const approval = await db.collection('approvals').findOne({ _id: new ObjectId(id) })
    
    if (!approval) {
      return NextResponse.json({ error: 'Approval not found' }, { status: 404 })
    }

    // Check if user has permission to update this approval
    if (!session.user.roles?.includes('Admin') && 
        !approval.approvers.includes(session.user.id)) {
      return NextResponse.json({ error: 'Forbidden - Only approvers can update status' }, { status: 403 })
    }

    const updateData: any = {
      updatedAt: new Date(),
      updatedBy: session.user.id
    }

    if (status) {
      updateData.status = status
      
      // If status is being changed to approved/rejected, set approvedDate
      if (status === APPROVAL_STATUS.APPROVED || status === APPROVAL_STATUS.REJECTED) {
        updateData.approvedDate = new Date()
      }
    }

    if (approvedDate) {
      updateData.approvedDate = new Date(approvedDate)
    }

    if (approvers && Array.isArray(approvers)) {
      updateData.approvers = approvers
    }

    const result = await db.collection('approvals').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Approval not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Approval updated successfully' })
  } catch (error) {
    console.error('Error updating approval:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete an approval (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!session.user.roles?.includes('Admin')) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const { id } = params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid approval ID' }, { status: 400 })
    }

    const client = await getClientPromise()
    const db = client.db()
    
    const result = await db.collection('approvals').deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Approval not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Approval deleted successfully' })
  } catch (error) {
    console.error('Error deleting approval:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
