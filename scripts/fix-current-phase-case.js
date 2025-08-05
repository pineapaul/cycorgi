const { MongoClient } = require('mongodb')
require('dotenv').config({ path: '.env.local' })

async function fixCurrentPhaseCase() {
  const uri = process.env.MONGODB_URI
  
  if (!uri) {
    console.error('MONGODB_URI not found in .env.local file')
    process.exit(1)
  }

  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log('Connected to MongoDB')

    const db = client.db('cycorgi')
    console.log(`Using database: ${db.databaseName}`)
    
    const risksCollection = db.collection('risks')

    // Define the mapping of lowercase to proper case
    const phaseMapping = {
      'draft': 'Draft',
      'identification': 'Identification',
      'analysis': 'Analysis',
      'evaluation': 'Evaluation',
      'treatment': 'Treatment',
      'monitoring': 'Monitoring'
    }

    console.log('Phase mapping:')
    Object.entries(phaseMapping).forEach(([lower, proper]) => {
      console.log(`  "${lower}" → "${proper}"`)
    })

    // Find all risks with lowercase currentPhase values
    const lowercaseQuery = {
      currentPhase: { 
        $in: Object.keys(phaseMapping) 
      }
    }

    const risksToUpdate = await risksCollection.find(lowercaseQuery).toArray()
    
    console.log(`\nFound ${risksToUpdate.length} risks with lowercase currentPhase values:`)
    
    if (risksToUpdate.length > 0) {
      risksToUpdate.forEach(risk => {
        const oldPhase = risk.currentPhase
        const newPhase = phaseMapping[oldPhase]
        console.log(`  Risk ID: ${risk.riskId} | "${oldPhase}" → "${newPhase}"`)
      })

      console.log('\nUpdating risks...')
      
      // Update each risk
      for (const risk of risksToUpdate) {
        const oldPhase = risk.currentPhase
        const newPhase = phaseMapping[oldPhase]
        
        const result = await risksCollection.updateOne(
          { _id: risk._id },
          { $set: { currentPhase: newPhase } }
        )
        
        if (result.modifiedCount > 0) {
          console.log(`✅ Updated Risk ID: ${risk.riskId} | "${oldPhase}" → "${newPhase}"`)
        } else {
          console.log(`❌ Failed to update Risk ID: ${risk.riskId}`)
        }
      }

      console.log('\n✅ Case fix completed!')
    } else {
      console.log('✅ No risks found with lowercase currentPhase values')
    }

    // Show summary of all currentPhase values after the fix
    console.log('\n' + '=' .repeat(50))
    console.log('FINAL SUMMARY:')
    console.log('=' .repeat(50))
    
    const allRisks = await risksCollection.find({}, { projection: { riskId: 1, currentPhase: 1, _id: 0 } }).toArray()
    const phaseCounts = {}
    
    allRisks.forEach(risk => {
      const phase = risk.currentPhase || 'null/undefined'
      if (!phaseCounts[phase]) {
        phaseCounts[phase] = 0
      }
      phaseCounts[phase]++
    })

    console.log('Current phase distribution:')
    Object.entries(phaseCounts).forEach(([phase, count]) => {
      console.log(`  "${phase}": ${count} risks`)
    })

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await client.close()
    console.log('\nDisconnected from MongoDB')
  }
}

// Only run if this script is executed directly
if (require.main === module) {
  console.log('⚠️  WARNING: This script will modify currentPhase values in your database.')
  console.log('Make sure you have a backup before proceeding.')
  console.log('Using MongoDB URI from .env.local file')
  console.log('\nRunning fix script...')
  fixCurrentPhaseCase().catch(console.error)
}

module.exports = { fixCurrentPhaseCase } 