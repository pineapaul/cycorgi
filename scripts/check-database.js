const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function checkDatabase() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('MONGODB_URI not found in environment variables');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('\nCollections in database:');
    collections.forEach(col => console.log(`- ${col.name}`));

    // Check third-parties collection
    const thirdPartiesCollection = db.collection('third-parties');
    const count = await thirdPartiesCollection.countDocuments();
    console.log(`\nThird-parties collection has ${count} documents`);

    if (count > 0) {
      console.log('\nSample documents:');
      const sample = await thirdPartiesCollection.find().limit(3).toArray();
      sample.forEach((doc, index) => {
        console.log(`\nDocument ${index + 1}:`);
        console.log(JSON.stringify(doc, null, 2));
      });
    }

  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await client.close();
    console.log('\nDisconnected from MongoDB');
  }
}

checkDatabase().catch(console.error); 