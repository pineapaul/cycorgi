import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'
import _ from 'lodash'

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
      const safeSearch = _.escapeRegExp(search)
      filter.$or = [
        { name: { $regex: safeSearch, $options: 'i' } },
        { description: { $regex: safeSearch, $options: 'i' } },
        { tags: { $in: [new RegExp(safeSearch, 'i')] } }
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
    let threats = await collection
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray()

    // Map MongoDB _id to id for frontend compatibility
    threats = threats.map(threat => ({
      ...threat,
      id: threat._id.toString()
    }))

    // Populate information assets details
    if (threats.length > 0) {
      const assetIds = [...new Set(threats.flatMap(threat => threat.informationAssets || []))]
      
      if (assetIds.length > 0) {
        const assetsCollection = db.collection('information-assets')
        const assets = await assetsCollection
          .find({ id: { $in: assetIds } }, { 
            projection: { 
              id: 1, 
              informationAsset: 1, 
              category: 1, 
              type: 1,
              criticality: 1
            } 
          })
          .toArray()
        
        const assetsMap = new Map(assets.map(asset => [asset.id, asset]))
        
        threats = threats.map(threat => ({
          ...threat,
          informationAssets: (threat.informationAssets || []).map((assetId: string) => assetsMap.get(assetId)).filter(Boolean)
        }))
      }
    }

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
    const { name, description, category, severity, mitreId, mitreTactic, mitreTechnique, tags, status, informationAssets } = body

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
    const existingThreat = await collection.findOne({ name: { $regex: new RegExp(`^${_.escapeRegExp(name)}$`, 'i') } })
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
      informationAssets: informationAssets || [],
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
