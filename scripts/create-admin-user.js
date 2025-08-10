const { MongoClient } = require('mongodb')

async function createAdminUser() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cycorgi'
  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log('Connected to MongoDB')

    const db = client.db()
    const usersCollection = db.collection('users')

    // Option 1: Create a new admin user
    const adminUser = {
      email: 'admin@cycorgi.com',
      name: 'System Administrator',
      role: 'Admin',
      status: 'Active',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Check if admin user already exists
    const existingAdmin = await usersCollection.findOne({ email: adminUser.email })
    
    if (existingAdmin) {
      console.log('Admin user already exists, updating to admin role...')
      
      const result = await usersCollection.updateOne(
        { email: adminUser.email },
        { 
          $set: { 
            role: 'Admin', 
            status: 'Active',
            updatedAt: new Date()
          } 
        }
      )
      
      if (result.modifiedCount > 0) {
        console.log('✅ Existing user updated to admin role')
      } else {
        console.log('⚠️ User already has admin role')
      }
    } else {
      console.log('Creating new admin user...')
      
      const result = await usersCollection.insertOne(adminUser)
      
      if (result.insertedId) {
        console.log('✅ New admin user created successfully')
        console.log('Email:', adminUser.email)
        console.log('Password: Use Google OAuth to sign in')
      }
    }

    // Option 2: Update your current user to admin (if you know your email)
    const yourEmail = process.argv[2] // Pass your email as command line argument
    
    if (yourEmail) {
      console.log(`\nUpdating user ${yourEmail} to admin role...`)
      
      const result = await usersCollection.updateOne(
        { email: yourEmail },
        { 
          $set: { 
            role: 'Admin', 
            status: 'Active',
            updatedAt: new Date()
          } 
        }
      )
      
      if (result.modifiedCount > 0) {
        console.log(`✅ User ${yourEmail} updated to admin role`)
      } else if (result.matchedCount === 0) {
        console.log(`❌ User ${yourEmail} not found`)
      } else {
        console.log(`⚠️ User ${yourEmail} already has admin role`)
      }
    }

    // Show all users
    console.log('\n📋 Current users in database:')
    const allUsers = await usersCollection.find({}).toArray()
    
    allUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ${user.role} - ${user.status}`)
    })

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await client.close()
    console.log('\nDisconnected from MongoDB')
  }
}

// Run the script
createAdminUser().catch(console.error)
