const { MongoClient } = require('mongodb')

async function debugWorkshop() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017'
  const client = new MongoClient(uri)
  
  try {
    await client.connect()
    const db = client.db('cycorgi')
    const collection = db.collection('workshops')
    
    const workshops = await collection.find({}).toArray()
    
    console.log(`Found ${workshops.length} workshops`)
    
    workshops.forEach((workshop, index) => {
      console.log(`\n--- Workshop ${index + 1} (ID: ${workshop.id}) ---`)
      console.log('Extensions:', JSON.stringify(workshop.extensions, null, 2))
      console.log('Closure:', JSON.stringify(workshop.closure, null, 2))
      console.log('New Risks:', JSON.stringify(workshop.newRisks, null, 2))
    })
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await client.close()
  }
}

debugWorkshop() 