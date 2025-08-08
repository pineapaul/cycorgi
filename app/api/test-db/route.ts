import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('cycorgi')
    const collection = db.collection('test')

    await collection.insertOne({ message: 'Hello from GRC Platform', timestamp: new Date() })
    const messages = await collection.find({}).sort({ timestamp: -1 }).limit(5).toArray()

    return NextResponse.json({ success: true, messages })
  } catch (error: unknown) {
    console.error('MongoDB connection error:', error instanceof Error ? error.message : String(error))
    return NextResponse.json({ success: false, error: 'Failed to connect to MongoDB' }, { status: 500 })
  }
}