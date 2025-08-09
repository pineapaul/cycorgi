import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '../../../../../lib/mongodb'
import { ObjectId } from 'mongodb'

interface MeetingMinutesItem {
  riskId: string
  selectedTreatments?: string[]
  actionsTaken?: string
  toDo?: string
  outcome?: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { riskId, topic, selectedTreatments } = body

    if (!riskId || !topic) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: riskId and topic are required'
      }, { status: 400 })
    }

    if (!['extensions', 'closure', 'newRisks'].includes(topic)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid topic. Must be one of: extensions, closure, newRisks'
      }, { status: 400 })
    }

    const client = await clientPromise()
    const db = client.db('cycorgi')
    const workshopsCollection = db.collection('workshops')
    const risksCollection = db.collection('risks')

    // Check if workshop exists
    let workshop
    try {
      workshop = await workshopsCollection.findOne({ 
        $or: [
          { _id: new ObjectId(id) },
          { id: id }
        ]
      })
    } catch {
      // If ObjectId conversion fails, try with just the id field
      workshop = await workshopsCollection.findOne({ id: id })
    }

    if (!workshop) {
      return NextResponse.json({
        success: false,
        error: 'Workshop not found'
      }, { status: 404 })
    }

    // Check if workshop status allows modifications
    const selectableStatuses = ['Planned', 'Scheduled', 'Pending Agenda']
    if (!selectableStatuses.includes(workshop.status)) {
      return NextResponse.json({
        success: false,
        error: `Cannot add risks to workshop with status "${workshop.status}". Workshop must be Planned, Scheduled, or Pending Agenda.`
      }, { status: 400 })
    }

    // Check if workshop date is in the future
    const currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0) // Set to start of today for comparison
    const workshopDate = new Date(workshop.date)
    
    if (workshopDate < currentDate) {
      return NextResponse.json({
        success: false,
        error: `Cannot add risks to workshop scheduled for ${workshop.date}. Only workshops with future dates can be modified.`
      }, { status: 400 })
    }

    // Check if risk exists
    const risk = await risksCollection.findOne({ riskId })
    if (!risk) {
      return NextResponse.json({
        success: false,
        error: 'Risk not found'
      }, { status: 404 })
    }

    // Validate risk phase against topic
    const riskPhase = risk.currentPhase?.toLowerCase()
    
    if (topic === 'extensions' || topic === 'closure') {
      if (riskPhase !== 'treatment' && riskPhase !== 'monitoring') {
        return NextResponse.json({
          success: false,
          error: `Risks in "${risk.currentPhase}" phase cannot be added to ${topic}. Only Treatment and Monitoring phase risks are allowed.`
        }, { status: 400 })
      }
    }

    if (topic === 'newRisks') {
      if (riskPhase === 'treatment' || riskPhase === 'monitoring') {
        return NextResponse.json({
          success: false,
          error: `Risks in "${risk.currentPhase}" phase cannot be added as new risks.`
        }, { status: 400 })
      }
    }

    // Check if risk is already in this topic section
    const existingTopicItems = workshop[topic] || []
    const isAlreadyAdded = existingTopicItems.some((item: MeetingMinutesItem) => item.riskId === riskId)
    
    if (isAlreadyAdded) {
      return NextResponse.json({
        success: false,
        error: `Risk ${riskId} is already in the ${topic} section of this workshop.`
      }, { status: 400 })
    }

    // Validate selected treatments for extensions/closure
    if ((topic === 'extensions' || topic === 'closure') && (!selectedTreatments || selectedTreatments.length === 0)) {
      return NextResponse.json({
        success: false,
        error: 'Selected treatments are required for extensions and closure topics'
      }, { status: 400 })
    }

    // For extensions/closure, validate that all selected treatments have pending closure approval
    if (topic === 'extensions' || topic === 'closure') {
      const treatmentsCollection = db.collection('treatments')
      
      for (const treatmentId of selectedTreatments) {
        const treatment = await treatmentsCollection.findOne({ treatmentId, riskId })
        
        if (!treatment) {
          return NextResponse.json({
            success: false,
            error: `Treatment ${treatmentId} not found for risk ${riskId}`
          }, { status: 400 })
        }
        
        if (treatment.closureApproval !== 'Pending') {
          return NextResponse.json({
            success: false,
            error: `Treatment ${treatmentId} does not have pending closure approval. Only treatments with "Pending" status can be added to workshop agenda.`
          }, { status: 400 })
        }
      }
    }

    // Create new agenda item
    const newItem: MeetingMinutesItem = {
      riskId,
      selectedTreatments: selectedTreatments || [],
      actionsTaken: '',
      toDo: '',
      outcome: ''
    }

    // Add the risk to the appropriate section
    const updateField = `${topic}`
    const updateQuery: any = {
      $push: {
        [updateField]: newItem
      },
      $set: {
        updatedAt: new Date().toISOString()
      }
    }

    const result = await workshopsCollection.updateOne(
      { _id: workshop._id },
      updateQuery
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json({
        success: false,
        error: 'Failed to add risk to workshop agenda'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Risk ${riskId} successfully added to ${topic} section of workshop ${workshop.id}`,
      data: {
        workshopId: workshop.id,
        riskId,
        topic,
        addedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error adding risk to workshop agenda:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
