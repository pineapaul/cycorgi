const { MongoClient } = require('mongodb')
require('dotenv').config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cycorgi'

async function migrateThreatsAddInformationAssets() {
  let client

  try {
    console.log('🔌 Connecting to MongoDB...')
    client = new MongoClient(MONGODB_URI)
    await client.connect()
    console.log('✅ Connected to MongoDB')

    const db = client.db('cycorgi')
    const threatsCollection = db.collection('threats')

    // Check if threats collection exists
    const collections = await db.listCollections().toArray()
    const threatsExists = collections.some(col => col.name === 'threats')

    if (!threatsExists) {
      console.log('⚠️  Threats collection does not exist. Creating it...')
      await db.createCollection('threats')
      console.log('✅ Created threats collection')
    }

    // Get count of existing threats
    const existingThreatsCount = await threatsCollection.countDocuments()
    console.log(`📊 Found ${existingThreatsCount} existing threats`)

    if (existingThreatsCount === 0) {
      console.log('ℹ️  No threats to migrate. Skipping...')
      return
    }

    // Update all existing threats to add information-assets field if it doesn't exist
    const result = await threatsCollection.updateMany(
      { informationAssets: { $exists: false } },
      { $set: { informationAssets: [] } }
    )

    console.log(`✅ Updated ${result.modifiedCount} threats with information-assets field`)

    // Verify the migration
    const threatsWithoutAssets = await threatsCollection.countDocuments({ informationAssets: { $exists: false } })
    const threatsWithAssets = await threatsCollection.countDocuments({ informationAssets: { $exists: true } })

    console.log(`📊 Verification:`)
    console.log(`   - Threats without information-assets: ${threatsWithoutAssets}`)
    console.log(`   - Threats with information-assets: ${threatsWithAssets}`)

    if (threatsWithoutAssets === 0) {
      console.log('🎉 Migration completed successfully!')
    } else {
      console.log('⚠️  Some threats still missing information-assets field')
    }

  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    if (client) {
      await client.close()
      console.log('🔌 Disconnected from MongoDB')
    }
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateThreatsAddInformationAssets()
    .then(() => {
      console.log('✨ Migration script completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Migration script failed:', error)
      process.exit(1)
    })
}

module.exports = { migrateThreatsAddInformationAssets }
