const { MongoClient } = require('mongodb')
require('dotenv').config({ path: '.env.local' })

async function migrateUsersToMultipleRoles() {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/cycorgi')
  
  try {
    await client.connect()
    console.log('Connected to MongoDB')
    
    const db = client.db()
    const usersCollection = db.collection('users')
    
    // Find all users with the old single role field
    const users = await usersCollection.find({}).toArray()
    console.log(`Found ${users.length} users to migrate`)
    
    let migratedCount = 0
    
    for (const user of users) {
      if (user.role && !user.roles) {
        // Convert single role to roles array
        const updateResult = await usersCollection.updateOne(
          { _id: user._id },
          { 
            $set: { 
              roles: [user.role],
              updatedAt: new Date()
            },
            $unset: { role: "" }
          }
        )
        
        if (updateResult.modifiedCount > 0) {
          migratedCount++
          console.log(`Migrated user: ${user.email} (${user.role} -> [${user.role}])`)
        }
      } else if (user.roles) {
        console.log(`User ${user.email} already has roles array, skipping`)
      } else {
        // User has no role, set default
        const updateResult = await usersCollection.updateOne(
          { _id: user._id },
          { 
            $set: { 
              roles: ['viewer'],
              updatedAt: new Date()
            }
          }
        )
        
        if (updateResult.modifiedCount > 0) {
          migratedCount++
          console.log(`Set default role for user: ${user.email} -> [viewer]`)
        }
      }
    }
    
    console.log(`\nMigration completed! Migrated ${migratedCount} users`)
    
  } catch (error) {
    console.error('Migration failed:', error)
  } finally {
    await client.close()
    console.log('Disconnected from MongoDB')
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateUsersToMultipleRoles()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Migration failed:', error)
      process.exit(1)
    })
}

module.exports = { migrateUsersToMultipleRoles }
