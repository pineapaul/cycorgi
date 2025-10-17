import { NextRequest, NextResponse } from 'next/server'
import getClientPromise from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const taskOwner = searchParams.get('taskOwner')
    const functionalUnit = searchParams.get('functionalUnit')

    const client = await getClientPromise()
    const db = client.db()
    
    // Build filter object
    const filter: any = {}
    
    if (category) {
      filter.category = category
    }
    
    if (startDate || endDate) {
      filter.plannedDate = {}
      if (startDate) {
        filter.plannedDate.$gte = new Date(startDate)
      }
      if (endDate) {
        filter.plannedDate.$lte = new Date(endDate)
      }
    }
    
    if (taskOwner) {
      filter.taskOwner = { $regex: taskOwner, $options: 'i' }
    }
    
    if (functionalUnit) {
      filter.functionalUnit = { $regex: functionalUnit, $options: 'i' }
    }

    const tasks = await db
      .collection('calendar_tasks')
      .find(filter)
      .sort({ plannedDate: 1 })
      .toArray()

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error fetching calendar tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calendar tasks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = [
      'taskId', 'plannedDate', 'taskName', 'functionalUnit',
      'agileReleaseTrain', 'frequency', 'output', 'taskOwner',
      'supportFromART', 'dueDate', 'category'
    ]
    
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Validate dates
    const plannedDate = new Date(body.plannedDate)
    const dueDate = new Date(body.dueDate)
    
    if (plannedDate > dueDate) {
      return NextResponse.json(
        { error: 'Planned date cannot be after due date' },
        { status: 400 }
      )
    }

    // Validate category
    const validCategories = ['audit', 'operations', 'documentation', 'external', 'functional']
    if (!validCategories.includes(body.category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      )
    }

    // Validate frequency
    const validFrequencies = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annual']
    if (!validFrequencies.includes(body.frequency)) {
      return NextResponse.json(
        { error: 'Invalid frequency' },
        { status: 400 }
      )
    }

    // Validate supportFromART
    if (!['Yes', 'No'].includes(body.supportFromART)) {
      return NextResponse.json(
        { error: 'Support from ART must be either "Yes" or "No"' },
        { status: 400 }
      )
    }

    const client = await getClientPromise()
    const db = client.db()
    
    // Check if taskId already exists
    const existingTask = await db
      .collection('calendar_tasks')
      .findOne({ taskId: body.taskId })
    
    if (existingTask) {
      return NextResponse.json(
        { error: 'Task ID already exists' },
        { status: 409 }
      )
    }

    const task = {
      ...body,
      plannedDate: new Date(body.plannedDate),
      dueDate: new Date(body.dueDate),
      completionDate: body.completionDate ? new Date(body.completionDate) : undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection('calendar_tasks').insertOne(task)
    
    return NextResponse.json(
      { ...task, _id: result.insertedId },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating calendar task:', error)
    return NextResponse.json(
      { error: 'Failed to create calendar task' },
      { status: 500 }
    )
  }
}
