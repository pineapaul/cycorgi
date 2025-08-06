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

// Mapping from old values to new values
const CONSEQUENCE_MAPPING = {
  'Low': 'Minor',
  'Medium': 'Moderate', 
  'High': 'Major'
}

const LIKELIHOOD_MAPPING = {
  'Low': 'Rare',
  'Medium': 'Possible',
  'High': 'Likely'
}

async function migrateConsequenceValues() {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI not found in environment variables')
    process.exit(1)
  }

  const client = new MongoClient(MONGODB_URI)
  
  try {
    await client.connect()
    console.log('Connected to MongoDB')
    
    const db = client.db('cycorgi')
    const risksCollection = db.collection('risks')
    
    // Find all risks that need migration
    const risksToMigrate = await risksCollection.find({
      $or: [
        { consequence: { $in: ['Low', 'Medium', 'High'] } },
        { likelihood: { $in: ['Low', 'Medium', 'High'] } },
        { residualConsequence: { $in: ['Low', 'Medium', 'High'] } },
        { residualLikelihood: { $in: ['Low', 'Medium', 'High'] } }
      ]
    }).toArray()
    
    console.log(`Found ${risksToMigrate.length} risks to migrate`)
    
    if (risksToMigrate.length === 0) {
      console.log('No risks need migration')
      return
    }
    
    let migratedCount = 0
    
    for (const risk of risksToMigrate) {
      const updateFields = {}
      
      // Update consequence fields
      if (risk.consequence && CONSEQUENCE_MAPPING[risk.consequence]) {
        updateFields.consequence = CONSEQUENCE_MAPPING[risk.consequence]
        console.log(`Risk ${risk.riskId}: consequence ${risk.consequence} -> ${CONSEQUENCE_MAPPING[risk.consequence]}`)
      }
      
      if (risk.likelihood && LIKELIHOOD_MAPPING[risk.likelihood]) {
        updateFields.likelihood = LIKELIHOOD_MAPPING[risk.likelihood]
        console.log(`Risk ${risk.riskId}: likelihood ${risk.likelihood} -> ${LIKELIHOOD_MAPPING[risk.likelihood]}`)
      }
      
      if (risk.residualConsequence && CONSEQUENCE_MAPPING[risk.residualConsequence]) {
        updateFields.residualConsequence = CONSEQUENCE_MAPPING[risk.residualConsequence]
        console.log(`Risk ${risk.riskId}: residualConsequence ${risk.residualConsequence} -> ${CONSEQUENCE_MAPPING[risk.residualConsequence]}`)
      }
      
      if (risk.residualLikelihood && LIKELIHOOD_MAPPING[risk.residualLikelihood]) {
        updateFields.residualLikelihood = LIKELIHOOD_MAPPING[risk.residualLikelihood]
        console.log(`Risk ${risk.riskId}: residualLikelihood ${risk.residualLikelihood} -> ${LIKELIHOOD_MAPPING[risk.residualLikelihood]}`)
      }
      
      if (Object.keys(updateFields).length > 0) {
        const result = await risksCollection.updateOne(
          { _id: risk._id },
          { $set: updateFields }
        )
        
        if (result.modifiedCount > 0) {
          migratedCount++
        }
      }
    }
    
    console.log(`Successfully migrated ${migratedCount} risks`)
    
  } catch (error) {
    console.error('Error during migration:', error)
  } finally {
    await client.close()
    console.log('Disconnected from MongoDB')
  }
}

// Run the migration
migrateConsequenceValues()
  .then(() => {
    console.log('Migration completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Migration failed:', error)
    process.exit(1)
  }) 