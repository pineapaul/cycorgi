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

// Risk action mapping logic based on risk characteristics
function determineRiskAction(risk) {
  const { riskRating, currentPhase, consequenceRating, likelihoodRating } = risk
  
  // High and Extreme risks typically require Mitigation
  if (riskRating === 'Extreme' || riskRating === 'High') {
    return 'Mitigate'
  }
  
  // Risks in Treatment phase should be Mitigated
  if (currentPhase === 'Treatment') {
    return 'Mitigate'
  }
  
  // Risks with Critical or Major consequences should be Mitigated
  if (consequenceRating === 'Critical' || consequenceRating === 'Major') {
    return 'Mitigate'
  }
  
  // Moderate risks with Possible likelihood should be Mitigated
  if (riskRating === 'Moderate' && likelihoodRating === 'Possible') {
    return 'Mitigate'
  }
  
  // Low risks with Rare likelihood can be Accepted
  if (riskRating === 'Low' && likelihoodRating === 'Rare') {
    return 'Accept'
  }
  
  // Risks in Monitoring phase are typically Accepted (already treated)
  if (currentPhase === 'Monitoring') {
    return 'Accept'
  }
  
  // Risks in Closed phase are typically Accepted
  if (currentPhase === 'Closed') {
    return 'Accept'
  }
  
  // Default to Mitigate for safety
  return 'Mitigate'
}

async function updateRiskActions() {
  const client = new MongoClient(MONGODB_URI)
  
  try {
    console.log('Connecting to MongoDB...')
    await client.connect()
    console.log('Connected to MongoDB successfully')
    
    const db = client.db()
    const risksCollection = db.collection('risks')
    
    // Get all existing risks
    console.log('Fetching existing risks...')
    const existingRisks = await risksCollection.find({}).toArray()
    console.log(`Found ${existingRisks.length} risks to update`)
    
    if (existingRisks.length === 0) {
      console.log('No risks found in the database')
      return
    }
    
    // Update each risk with appropriate riskAction
    let updatedCount = 0
    let skippedCount = 0
    
    for (const risk of existingRisks) {
      // Skip if riskAction already exists and has a value
      if (risk.riskAction && risk.riskAction.trim() !== '') {
        console.log(`Skipping ${risk.riskId} - already has riskAction: ${risk.riskAction}`)
        skippedCount++
        continue
      }
      
      // Determine appropriate risk action
      const riskAction = determineRiskAction(risk)
      
      // Update the risk document
      const result = await risksCollection.updateOne(
        { _id: risk._id },
        { 
          $set: { 
            riskAction: riskAction,
            updatedAt: new Date()
          }
        }
      )
      
      if (result.modifiedCount > 0) {
        console.log(`Updated ${risk.riskId}: riskAction = ${riskAction}`)
        updatedCount++
      } else {
        console.log(`Failed to update ${risk.riskId}`)
      }
    }
    
    console.log('\n=== Update Summary ===')
    console.log(`Total risks processed: ${existingRisks.length}`)
    console.log(`Risks updated: ${updatedCount}`)
    console.log(`Risks skipped (already had riskAction): ${skippedCount}`)
    
    // Show distribution of risk actions
    console.log('\n=== Risk Action Distribution ===')
    const actionStats = await risksCollection.aggregate([
      { $group: { _id: '$riskAction', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray()
    
    actionStats.forEach(stat => {
      console.log(`${stat._id || 'Not specified'}: ${stat.count} risks`)
    })
    
  } catch (error) {
    console.error('Error updating risk actions:', error)
  } finally {
    await client.close()
    console.log('MongoDB connection closed')
  }
}

// Run the update
if (require.main === module) {
  updateRiskActions()
    .then(() => {
      console.log('Risk action update completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Risk action update failed:', error)
      process.exit(1)
    })
}

module.exports = { updateRiskActions, determineRiskAction }
