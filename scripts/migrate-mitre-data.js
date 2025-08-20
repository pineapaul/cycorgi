require('dotenv').config({ path: '.env.local' })
const { MongoClient } = require('mongodb')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'

// MITRE ATTACK Tactic ID to Name mapping
const TACTIC_MAPPING = {
  'TA0001': 'Initial Access',
  'TA0002': 'Execution', 
  'TA0003': 'Persistence',
  'TA0004': 'Privilege Escalation',
  'TA0005': 'Defense Evasion',
  'TA0006': 'Credential Access',
  'TA0007': 'Discovery',
  'TA0008': 'Lateral Movement',
  'TA0009': 'Collection',
  'TA0010': 'Exfiltration',
  'TA0011': 'Command and Control',
  'TA0040': 'Impact'
}

// MITRE ATTACK Tactic Name to Technique Name mapping for common cases
const TECHNIQUE_MAPPING = {
  'Execution': 'Process Injection',
  'Initial Access': 'Valid Accounts',
  'Discovery': 'System Information Discovery',
  'Credential Access': 'Credential Dumping',
  'Lateral Movement': 'Remote Services',
  'Collection': 'Data from Local System',
  'Command and Control': 'Standard Application Layer Protocol',
  'Exfiltration': 'Data Transfer Size Limits',
  'Impact': 'Data Manipulation'
}

async function migrateMitreData() {
  const client = new MongoClient(MONGODB_URI)
  
  try {
    await client.connect()
    console.log('🔗 Connected to MongoDB')
    
    const db = client.db('cycorgi')
    const threatsCollection = db.collection('threats')
    
    // Find threats with MITRE data that needs fixing
    const threatsToFix = await threatsCollection.find({
      $or: [
        { mitreTactic: { $regex: /^TA\d{4}$/ } }, // Tactic IDs like TA0001
        { mitreTechnique: { $in: Object.keys(TECHNIQUE_MAPPING) } } // Tactic names in technique field
      ]
    }).toArray()
    
    if (threatsToFix.length === 0) {
      console.log('✅ No threats found that need MITRE data migration')
      return
    }
    
    console.log(`📋 Found ${threatsToFix.length} threats that need MITRE data migration`)
    
    let updatedCount = 0
    let skippedCount = 0
    
    for (const threat of threatsToFix) {
      console.log(`\n🔍 Processing threat: ${threat.name} (${threat.mitreId || 'No MITRE ID'})`)
      console.log(`   Current mitreTactic: ${threat.mitreTactic}`)
      console.log(`   Current mitreTechnique: ${threat.mitreTechnique}`)
      
      let needsUpdate = false
      const updateData = {}
      
      // Fix tactic field if it contains a tactic ID
      if (threat.mitreTactic && TACTIC_MAPPING[threat.mitreTactic]) {
        const correctTactic = TACTIC_MAPPING[threat.mitreTactic]
        updateData.mitreTactic = correctTactic
        console.log(`   ✅ Fixed tactic: ${threat.mitreTactic} → ${correctTactic}`)
        needsUpdate = true
      }
      
      // Fix technique field if it contains a tactic name
      if (threat.mitreTechnique && TECHNIQUE_MAPPING[threat.mitreTechnique]) {
        const correctTechnique = TECHNIQUE_MAPPING[threat.mitreTechnique]
        updateData.mitreTechnique = correctTechnique
        console.log(`   ✅ Fixed technique: ${threat.mitreTechnique} → ${correctTechnique}`)
        needsUpdate = true
      }
      
      // Special case: if technique field contains a tactic name but we don't have a mapping
      if (threat.mitreTechnique && Object.values(TACTIC_MAPPING).includes(threat.mitreTechnique)) {
        // This is a tactic name in the technique field, but we don't have a specific technique mapping
        // We'll set it to a generic technique name based on the tactic
        const tacticName = threat.mitreTechnique
        const genericTechnique = getGenericTechniqueName(tacticName)
        updateData.mitreTechnique = genericTechnique
        console.log(`   ✅ Fixed technique: ${threat.mitreTechnique} → ${genericTechnique} (generic)`)
        needsUpdate = true
      }
      
      if (needsUpdate) {
        try {
          const result = await threatsCollection.updateOne(
            { _id: threat._id },
            { $set: updateData }
          )
          
          if (result.modifiedCount > 0) {
            updatedCount++
            console.log(`   ✅ Successfully updated threat`)
          } else {
            console.log(`   ⚠️  No changes made to threat`)
            skippedCount++
          }
        } catch (error) {
          console.error(`   ❌ Error updating threat:`, error.message)
          skippedCount++
        }
      } else {
        console.log(`   ℹ️  No updates needed`)
        skippedCount++
      }
    }
    
    console.log(`\n📊 Migration Summary:`)
    console.log(`   ✅ Successfully updated: ${updatedCount} threats`)
    console.log(`   ⚠️  Skipped/No changes: ${skippedCount} threats`)
    console.log(`   📋 Total processed: ${threatsToFix.length} threats`)
    
    if (updatedCount > 0) {
      console.log(`\n🎉 MITRE data migration completed successfully!`)
      console.log(`   The following fields were corrected:`)
      console.log(`   - mitreTactic: Now contains tactic names (e.g., "Initial Access") instead of IDs (e.g., "TA0001")`)
      console.log(`   - mitreTechnique: Now contains technique names (e.g., "Process Injection") instead of tactic names`)
    }
    
  } catch (error) {
    console.error('❌ Error during migration:', error)
  } finally {
    await client.close()
    console.log('\n🔗 Database connection closed')
  }
}

// Helper function to get generic technique names for tactics
function getGenericTechniqueName(tacticName) {
  const genericTechniques = {
    'Initial Access': 'Initial Access Technique',
    'Execution': 'Execution Technique', 
    'Persistence': 'Persistence Technique',
    'Privilege Escalation': 'Privilege Escalation Technique',
    'Defense Evasion': 'Defense Evasion Technique',
    'Credential Access': 'Credential Access Technique',
    'Discovery': 'Discovery Technique',
    'Lateral Movement': 'Lateral Movement Technique',
    'Collection': 'Collection Technique',
    'Exfiltration': 'Exfiltration Technique',
    'Command and Control': 'Command and Control Technique',
    'Impact': 'Impact Technique'
  }
  
  return genericTechniques[tacticName] || 'Unknown Technique'
}

// Run the migration
migrateMitreData()
  .then(() => {
    console.log('\n🏁 Migration script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Migration script failed:', error)
    process.exit(1)
  })
