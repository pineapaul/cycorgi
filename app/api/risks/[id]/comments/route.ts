import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '../../../../../lib/mongodb'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const client = await clientPromise
    const db = client.db('cycorgi')
    const comments = await db
      .collection('comments')
      .find({ riskId: id })
      .sort({ timestamp: -1 })
      .toArray()
    return NextResponse.json({ success: true, data: comments })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch comments' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { content } = await request.json()
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Comment content is required' }, { status: 400 })
    }
    const client = await clientPromise
    const db = client.db('cycorgi')
    const comment = {
      riskId: id,
      content: content.trim(),
      author: 'Current User', // TODO: Get from auth context
      timestamp: new Date().toISOString(),
      replies: []
    }
    const result = await db.collection('comments').insertOne(comment)
    return NextResponse.json({ success: true, data: { ...comment, _id: result.insertedId } })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json({ success: false, error: 'Failed to create comment' }, { status: 500 })
  }
} 