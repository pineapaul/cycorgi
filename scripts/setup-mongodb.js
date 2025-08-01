const { MongoClient } = require('mongodb')
const fs = require('fs')
const path = require('path')

// Common MongoDB connection strings to test
const connectionStrings = [
  'mongodb://localhost:27017/cycorgi',
  'mongodb://127.0.0.1:27017/cycorgi',
  'mongodb+srv://username:password@cluster.mongodb.net/cycorgi?retryWrites=true&w=majority' // Replace with your Atlas connection
]

async function testConnection(uri, name) {
  const client = new MongoClient(uri, { 
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000 
  })
  
  try {
    console.log(`🔍 Testing ${name}...`)
    await client.connect()
    console.log(`✅ ${name} - Connection successful!`)
    
    const db = client.db()
    const collections = await db.listCollections().toArray()
    console.log(`📊 Database: ${db.databaseName}`)
    console.log(`📁 Collections: ${collections.map(c => c.name).join(', ')}`)
    
    return true
  } catch (error) {
    console.log(`❌ ${name} - Connection failed: ${error.message}`)
    return false
  } finally {
    await client.close()
  }
}

async function setupMongoDB() {
  console.log('🚀 MongoDB Connection Setup\n')
  
  // Test each connection string
  for (const uri of connectionStrings) {
    const name = uri.includes('mongodb+srv') ? 'MongoDB Atlas' : 'Local MongoDB'
    const success = await testConnection(uri, name)
    
    if (success) {
      console.log(`\n🎉 Found working connection: ${uri}`)
      
      // Create .env.local file
      const envContent = `MONGODB_URI=${uri}\n`
      const envPath = path.join(process.cwd(), '.env.local')
      
      try {
        fs.writeFileSync(envPath, envContent)
        console.log(`📝 Created .env.local file with connection string`)
        console.log(`📍 File location: ${envPath}`)
        
        // Test the workshops API
        console.log('\n🧪 Testing workshops API...')
        process.env.MONGODB_URI = uri
        const { testWorkshopsAPI } = require('./test-workshops-api')
        await testWorkshopsAPI()
        
        return
      } catch (error) {
        console.log(`❌ Failed to create .env.local file: ${error.message}`)
        console.log(`💡 You can manually create .env.local with: MONGODB_URI=${uri}`)
      }
    }
  }
  
  console.log('\n❌ No working MongoDB connection found!')
  console.log('\n🔧 Setup Options:')
  console.log('1. Install MongoDB locally: https://docs.mongodb.com/manual/installation/')
  console.log('2. Use MongoDB Atlas (free tier): https://www.mongodb.com/atlas')
  console.log('3. Update the connection strings in this script with your actual MongoDB URI')
  
  console.log('\n📝 To manually set up:')
  console.log('1. Create a .env.local file in the project root')
  console.log('2. Add: MONGODB_URI=your_mongodb_connection_string')
  console.log('3. Run: node scripts/test-workshops-api.js')
}

setupMongoDB().catch(console.error) 