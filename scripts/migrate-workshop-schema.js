const { MongoClient } = require('mongodb')
require('dotenv').config({ path: '.env.local' })

async function migrateWorkshopSchema() {
  if (!process.env.MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable in .env.local')
    process.exit(1)
  }
  
  const client = new MongoClient(process.env.MONGODB_URI)

  try {
    await client.connect()
    console.log('Connected to MongoDB')

    const db = client.db('cycorgi')
    const collection = db.collection('workshops')

    // Find all workshops
    const workshops = await collection.find({}).toArray()
    console.log(`Found ${workshops.length} workshops to migrate`)

    let migratedCount = 0
    let skippedCount = 0

    for (const workshop of workshops) {
      let needsUpdate = false
      const updateData = {}

      // Check and migrate extensions
      if (workshop.extensions && Array.isArray(workshop.extensions)) {
        const migratedExtensions = workshop.extensions.map(item => {
          if (item.selectedTreatments && Array.isArray(item.selectedTreatments)) {
            // Check if it's already in the new format
            if (item.selectedTreatments.length > 0 && typeof item.selectedTreatments[0] === 'object' && item.selectedTreatments[0].treatmentJiraTicket) {
              return item // Already migrated
            }
            
            // Convert string array to TreatmentMinutes objects
            const migratedTreatments = item.selectedTreatments.map(treatmentId => ({
              treatmentJiraTicket: treatmentId,
              actionsTaken: '',
              toDo: '',
              outcome: ''
            }))
            
            needsUpdate = true
            return {
              ...item,
              selectedTreatments: migratedTreatments
            }
          }
          return item
        })
        
        if (needsUpdate) {
          updateData.extensions = migratedExtensions
        }
      }

      // Check and migrate closure
      if (workshop.closure && Array.isArray(workshop.closure)) {
        const migratedClosure = workshop.closure.map(item => {
          if (item.selectedTreatments && Array.isArray(item.selectedTreatments)) {
            // Check if it's already in the new format
            if (item.selectedTreatments.length > 0 && typeof item.selectedTreatments[0] === 'object' && item.selectedTreatments[0].treatmentJiraTicket) {
              return item // Already migrated
            }
            
            // Convert string array to TreatmentMinutes objects
            const migratedTreatments = item.selectedTreatments.map(treatmentId => ({
              treatmentJiraTicket: treatmentId,
              actionsTaken: '',
              toDo: '',
              outcome: ''
            }))
            
            needsUpdate = true
            return {
              ...item,
              selectedTreatments: migratedTreatments
            }
          }
          return item
        })
        
        if (needsUpdate) {
          updateData.closure = migratedClosure
        }
      }

      // Check and migrate newRisks
      if (workshop.newRisks && Array.isArray(workshop.newRisks)) {
        const migratedNewRisks = workshop.newRisks.map(item => {
          if (item.selectedTreatments && Array.isArray(item.selectedTreatments)) {
            // Check if it's already in the new format
            if (item.selectedTreatments.length > 0 && typeof item.selectedTreatments[0] === 'object' && item.selectedTreatments[0].treatmentJiraTicket) {
              return item // Already migrated
            }
            
            // Convert string array to TreatmentMinutes objects
            const migratedTreatments = item.selectedTreatments.map(treatmentId => ({
              treatmentJiraTicket: treatmentId,
              actionsTaken: '',
              toDo: '',
              outcome: ''
            }))
            
            needsUpdate = true
            return {
              ...item,
              selectedTreatments: migratedTreatments
            }
          }
          return item
        })
        
        if (needsUpdate) {
          updateData.newRisks = migratedNewRisks
        }
      }

      // Update the workshop if needed
      if (needsUpdate) {
        updateData.updatedAt = new Date().toISOString()
        
        await collection.updateOne(
          { _id: workshop._id },
          { $set: updateData }
        )
        
        console.log(`Migrated workshop ${workshop.id || workshop._id}`)
        migratedCount++
      } else {
        console.log(`Skipped workshop ${workshop.id || workshop._id} (already migrated or no selectedTreatments)`)
        skippedCount++
      }
    }

    console.log(`\nMigration completed:`)
    console.log(`- Migrated: ${migratedCount} workshops`)
    console.log(`- Skipped: ${skippedCount} workshops`)

  } catch (error) {
    console.error('Migration failed:', error)
  } finally {
    await client.close()
    console.log('Disconnected from MongoDB')
  }
}

// Run the migration
migrateWorkshopSchema().catch(console.error) 