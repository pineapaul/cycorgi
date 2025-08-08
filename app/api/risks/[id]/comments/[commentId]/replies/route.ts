import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '../../../../../../../lib/mongodb'
import { ObjectId } from 'mongodb'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { commentId } = await params
    const { content } = await request.json()
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Reply content is required' }, { status: 400 })
    }
    const client = await clientPromise()
    const db = client.db('cycorgi')
    const reply = {
      content: content.trim(),
      author: 'Current User', // TODO: Get from auth context
      timestamp: new Date().toISOString()
    }
    const result = await db.collection('comments').updateOne(
      { _id: new ObjectId(commentId) },
      { $push: { replies: reply } } as any
    )
    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: 'Comment not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: reply })
  } catch (error) {
    console.error('Error creating reply:', error)
    return NextResponse.json({ success: false, error: 'Failed to create reply' }, { status: 500 })
  }
} 