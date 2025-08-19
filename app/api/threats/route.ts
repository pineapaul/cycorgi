import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const severity = searchParams.get('severity') || ''
    const source = searchParams.get('source') || ''
    const status = searchParams.get('status') || ''
    const sortBy = searchParams.get('sortBy') || 'name'
    const sortOrder = searchParams.get('sortOrder') || 'asc'

    const client = await clientPromise()
    const db = client.db('cycorgi')
    const collection = db.collection('threats')

    // Build filter object
    const filter: any = {}
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ]
    }
    
    if (category) filter.category = category
    if (severity) filter.severity = severity
    if (source) filter.source = source
    if (status) filter.status = status

    // Get total count
    const totalCount = await collection.countDocuments(filter)
    const totalPages = Math.ceil(totalCount / limit)
    const skip = (page - 1) * limit

    // Build sort object
    const sort: any = {}
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1

    // Get threats with pagination
    const threats = await collection
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray()

    // Calculate pagination info
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      success: true,
      data: threats,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    })
  } catch (error) {
    console.error('Error fetching threats:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, category, severity, mitreId, mitreTactic, mitreTechnique, tags, status } = body

    // Validation
    if (!name || !description || !category || !severity) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const client = await clientPromise()
    const db = client.db('cycorgi')
    const collection = db.collection('threats')

    // Check if threat with same name already exists
    const existingThreat = await collection.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } })
    if (existingThreat) {
      return NextResponse.json(
        { success: false, error: 'Threat with this name already exists' },
        { status: 400 }
      )
    }

    // Create new threat
    const newThreat = {
      name,
      description,
      category,
      severity,
      mitreId: mitreId || null,
      mitreTactic: mitreTactic || null,
      mitreTechnique: mitreTechnique || null,
      source: mitreId ? 'MITRE ATTACK' : 'Custom',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map((tag: string) => tag.trim()) : []),
      status: status || 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: session.user.id
    }

    const result = await collection.insertOne(newThreat)
    
    return NextResponse.json({
      success: true,
      data: { ...newThreat, id: result.insertedId.toString() }
    })
  } catch (error) {
    console.error('Error creating threat:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
