const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function exploreDatabase() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('MONGODB_URI not found in .env.local file');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    // List all databases
    const adminDb = client.db('admin');
    const databases = await adminDb.admin().listDatabases();
    
    console.log('\nAvailable databases:');
    databases.databases.forEach(db => {
      console.log(`- ${db.name} (${db.sizeOnDisk} bytes)`);
    });

    // Check each database for risks data
    console.log('\n' + '=' .repeat(50));
    console.log('SEARCHING FOR RISKS DATA IN ALL DATABASES:');
    console.log('=' .repeat(50));

    for (const dbInfo of databases.databases) {
      const dbName = dbInfo.name;
      
      // Skip system databases
      if (['admin', 'local', 'config'].includes(dbName)) {
        continue;
      }
      
      console.log(`\nChecking database: ${dbName}`);
      
      const db = client.db(dbName);
      
      // List collections in this database
      const collections = await db.listCollections().toArray();
      console.log(`  Collections: ${collections.length}`);
      
      if (collections.length > 0) {
        collections.forEach(col => console.log(`    - ${col.name}`));
        
        // Check each collection for risks data
        for (const collection of collections) {
          const collectionName = collection.name;
          const count = await db.collection(collectionName).countDocuments();
          
          if (count > 0) {
            console.log(`    ${collectionName}: ${count} documents`);
            
            // Get a sample document to see the structure
            const sample = await db.collection(collectionName).findOne();
            const keys = Object.keys(sample);
            console.log(`      Sample keys: ${keys.join(', ')}`);
            
            // Check if this looks like a risks collection
            if (sample.riskId || sample.riskStatement || sample.currentPhase) {
              console.log(`      ✅ This looks like a risks collection!`);
              
              // Check for currentPhase values
              const risksWithPhase = await db.collection(collectionName).find(
                { currentPhase: { $exists: true } },
                { projection: { riskId: 1, currentPhase: 1, _id: 0 } }
              ).toArray();
              
              console.log(`      Risks with currentPhase: ${risksWithPhase.length}`);
              
              if (risksWithPhase.length > 0) {
                console.log('      Sample currentPhase values:');
                risksWithPhase.slice(0, 5).forEach(risk => {
                  console.log(`        ${risk.riskId}: "${risk.currentPhase}"`);
                });
              }
            }
          }
        }
      }
    }

  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await client.close();
    console.log('\nDisconnected from MongoDB');
  }
}

exploreDatabase().catch(console.error); 