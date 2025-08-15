import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import getClientPromise from '@/lib/mongodb'
import { APPROVAL_STATUS, ApprovalStatus } from '@/lib/constants'
import { ObjectId } from 'mongodb'

// GET - Fetch approvals (filtered by user role and permissions)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const userId = searchParams.get('userId')

    const client = await getClientPromise()
    const db = client.db()
    
    // Build filter based on query parameters
    const filter: any = {}
    
    if (status && Object.values(APPROVAL_STATUS).includes(status as ApprovalStatus)) {
      filter.status = status
    }
    
    if (type) {
      filter.type = { $regex: type, $options: 'i' }
    }
    
    if (category) {
      filter.category = { $regex: category, $options: 'i' }
    }

    // If userId is provided, filter by that user's approvals
    if (userId) {
      filter.requester = userId
    }

    // If user is not admin, only show approvals they're involved with
    if (!session.user.roles?.includes('Admin')) {
      filter.$or = [
        { requester: session.user.id },
        { approvers: session.user.id }
      ]
    }

    const approvals = await db.collection('approvals')
      .find(filter)
      .sort({ submitted: -1 })
      .toArray()
    
    return NextResponse.json(approvals)
  } catch (error) {
    console.error('Error fetching approvals:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new approval request
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { request, category, type, approvers } = body

    // Validation
    if (!request || !category || !type) {
      return NextResponse.json({ 
        error: 'Request, category, and type are required' 
      }, { status: 400 })
    }

    if (!approvers || !Array.isArray(approvers) || approvers.length === 0) {
      return NextResponse.json({ 
        error: 'At least one approver is required' 
      }, { status: 400 })
    }

    const client = await getClientPromise()
    const db = client.db()
    
    // Generate next request ID
    const lastApproval = await db.collection('approvals')
      .findOne({}, { sort: { requestId: -1 } })
    
    let nextNumber = 1
    if (lastApproval?.requestId) {
      const lastNumber = parseInt(lastApproval.requestId.split('-')[1])
      nextNumber = lastNumber + 1
    }
    
    const requestId = `REQ-${nextNumber.toString().padStart(4, '0')}`

    const newApproval = {
      requestId,
      request,
      category,
      type,
      requester: session.user.id,
      submitted: new Date(),
      approvedDate: null,
      status: APPROVAL_STATUS.PENDING,
      approvers,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: session.user.id
    }

    const result = await db.collection('approvals').insertOne(newApproval)
    
    return NextResponse.json({ 
      message: 'Approval request created successfully', 
      approvalId: result.insertedId,
      requestId
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating approval:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
