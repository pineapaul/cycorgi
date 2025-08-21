import { NextRequest, NextResponse } from 'next/server'
import getClientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const client = await getClientPromise()
    const db = client.db()
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid task ID' },
        { status: 400 }
      )
    }

    const task = await db
      .collection('calendar_tasks')
      .findOne({ _id: new ObjectId(id) })

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error fetching calendar task:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calendar task' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid task ID' },
        { status: 400 }
      )
    }

    const client = await getClientPromise()
    const db = client.db()
    
    // Check if task exists
    const existingTask = await db
      .collection('calendar_tasks')
      .findOne({ _id: new ObjectId(id) })

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    // Check if taskId is being changed and if it conflicts with another task
    if (body.taskId && body.taskId !== existingTask.taskId) {
      const conflictingTask = await db
        .collection('calendar_tasks')
        .findOne({ taskId: body.taskId, _id: { $ne: new ObjectId(id) } })
      
      if (conflictingTask) {
        return NextResponse.json(
          { error: 'Task ID already exists' },
          { status: 409 }
        )
      }
    }

    // Validate dates if they're being updated
    if (body.plannedDate || body.dueDate) {
      const plannedDate = body.plannedDate ? new Date(body.plannedDate) : new Date(existingTask.plannedDate)
      const dueDate = body.dueDate ? new Date(body.dueDate) : new Date(existingTask.dueDate)
      
      if (plannedDate > dueDate) {
        return NextResponse.json(
          { error: 'Planned date cannot be after due date' },
          { status: 400 }
        )
      }
    }

    // Validate category if it's being updated
    if (body.category) {
      const validCategories = ['audit', 'operations', 'documentation', 'external', 'functional']
      if (!validCategories.includes(body.category)) {
        return NextResponse.json(
          { error: 'Invalid category' },
          { status: 400 }
        )
      }
    }

    // Validate frequency if it's being updated
    if (body.frequency) {
      const validFrequencies = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annual']
      if (!validFrequencies.includes(body.frequency)) {
        return NextResponse.json(
          { error: 'Invalid frequency' },
          { status: 400 }
        )
      }
    }

    // Validate supportFromART if it's being updated
    if (body.supportFromART) {
      if (!['Yes', 'No'].includes(body.supportFromART)) {
        return NextResponse.json(
          { error: 'Support from ART must be either "Yes" or "No"' },
          { status: 400 }
        )
      }
    }

    // Prepare update object
    const updateData: any = { ...body }
    
    // Convert date strings to Date objects
    if (body.plannedDate) {
      updateData.plannedDate = new Date(body.plannedDate)
    }
    if (body.dueDate) {
      updateData.dueDate = new Date(body.dueDate)
    }
    if (body.completionDate) {
      updateData.completionDate = new Date(body.completionDate)
    }
    
    updateData.updatedAt = new Date()

    const result = await db
      .collection('calendar_tasks')
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    // Return updated task
    const updatedTask = await db
      .collection('calendar-tasks')
      .findOne({ _id: new ObjectId(id) })

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error('Error updating calendar task:', error)
    return NextResponse.json(
      { error: 'Failed to update calendar task' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid task ID' },
        { status: 400 }
      )
    }

    const client = await getClientPromise()
    const db = client.db()
    
    // Check if task exists and if it can be deleted
    const task = await db
      .collection('calendar_tasks')
      .findOne({ _id: new ObjectId(id) })

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    // Check if task is completed (business rule: completed tasks cannot be deleted)
    if (task.completionDate) {
      return NextResponse.json(
        { error: 'Completed tasks cannot be deleted' },
        { status: 400 }
      )
    }

    const result = await db
      .collection('calendar_tasks')
      .deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { message: 'Task deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting calendar task:', error)
    return NextResponse.json(
      { error: 'Failed to delete calendar task' },
      { status: 500 }
    )
  }
}
