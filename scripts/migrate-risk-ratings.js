const { MongoClient } = require('mongodb')
const path = require('path')
const fs = require('fs')

// Load environment variables from .env.local
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    const envVars = {}
    
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim()
        if (!key.startsWith('#')) {
          envVars[key.trim()] = value.replace(/^[\"'""'']|[\"'""'']$/g, '') // Remove quotes
        }
      }
    })
    
    // Set environment variables
    Object.keys(envVars).forEach(key => {
      process.env[key] = envVars[key]
    })
  }
}

// Load environment variables
loadEnvFile()

// MongoDB connection string from environment
const MONGODB_URI = process.env.MONGODB_URI

// Mapping for risk rating values
const RISK_RATING_MAPPING = {
  'Low': 'Low',      // No change
  'Medium': 'Moderate', // Medium -> Moderate
  'High': 'High'     // No change, but we'll add Extreme for some cases
}

async function migrateRiskRatings() {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI not found in environment variables')
    process.exit(1)
  }

  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log('Connected to MongoDB')

    const db = client.db()
    const risksCollection = db.collection('risks')

    // Find all risks with old risk rating values
    const risksToUpdate = await risksCollection.find({
      $or: [
        { currentRiskRating: { $in: ['Medium'] } },
        { residualRiskRating: { $in: ['Medium'] } }
      ]
    }).toArray()

    console.log(`Found ${risksToUpdate.length} risks to update`)

    if (risksToUpdate.length === 0) {
      console.log('No risks need to be updated')
      return
    }

    // Update each risk
    let updatedCount = 0
    for (const risk of risksToUpdate) {
      const updateFields = {}

      // Update current risk rating if it's 'Medium'
      if (risk.currentRiskRating === 'Medium') {
        updateFields.currentRiskRating = 'Moderate'
      }

      // Update residual risk rating if it's 'Medium'
      if (risk.residualRiskRating === 'Medium') {
        updateFields.residualRiskRating = 'Moderate'
      }

      if (Object.keys(updateFields).length > 0) {
        await risksCollection.updateOne(
          { _id: risk._id },
          { $set: updateFields }
        )
        updatedCount++
        console.log(`Updated risk ${risk.riskId}: ${JSON.stringify(updateFields)}`)
      }
    }

    console.log(`Successfully updated ${updatedCount} risks`)

    // Also add some 'Extreme' ratings to high-risk items
    const highRiskRisks = await risksCollection.find({
      $and: [
        { currentRiskRating: 'High' },
        { 
          $or: [
            { consequence: 'Critical' },
            { likelihood: 'Almost Certain' }
          ]
        }
      ]
    }).limit(3).toArray()

    if (highRiskRisks.length > 0) {
      console.log(`Updating ${highRiskRisks.length} high-risk items to 'Extreme' rating`)
      
      for (const risk of highRiskRisks) {
        await risksCollection.updateOne(
          { _id: risk._id },
          { $set: { currentRiskRating: 'Extreme' } }
        )
        console.log(`Updated risk ${risk.riskId} to Extreme rating`)
      }
    }

  } catch (error) {
    console.error('Error during migration:', error)
  } finally {
    await client.close()
    console.log('Disconnected from MongoDB')
  }
}

// Run the migration
migrateRiskRatings().then(() => {
  console.log('Migration completed')
  process.exit(0)
}).catch((error) => {
  console.error('Migration failed:', error)
  process.exit(1)
}) 