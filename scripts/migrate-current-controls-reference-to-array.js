// Load environment variables from .env.local file
require('dotenv').config({ path: '.env.local' });

const { MongoClient } = require('mongodb');

// MongoDB connection string from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is not set in .env.local file');
  console.error('Please ensure your .env.local file contains: MONGODB_URI=your_mongodb_connection_string');
  process.exit(1);
}

// Log connection info (masked for security)
const maskedUri = MONGODB_URI.replace(/(mongodb:\/\/[^:]+:)[^@]+@/, '$1***@');
console.log(`🔗 Using MongoDB URI: ${maskedUri}`);

async function migrateCurrentControlsReferenceToArray() {
  let client;
  
  try {
    console.log('📡 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db('cycorgi');
    const risksCollection = db.collection('risks');
    const soaControlsCollection = db.collection('soa_controls');
    
    console.log('✅ Connected to database. Starting migration...');
    
    // First, get all available SOA control IDs
    console.log('🔍 Fetching available SOA control IDs...');
    const soaControls = await soaControlsCollection.find({}, { projection: { id: 1, title: 1 } }).toArray();
    
    if (soaControls.length === 0) {
      console.error('❌ No SOA controls found in the database. Cannot proceed with migration.');
      return;
    }
    
    console.log(`✅ Found ${soaControls.length} SOA controls available for reference.`);
    
    // Find all risks that need migration (either string or missing currentControlsReference)
    const risksToUpdate = await risksCollection.find({
      $or: [
        { currentControlsReference: { $exists: true, $type: 'string' } },
        { currentControlsReference: { $exists: false } }
      ]
    }).toArray();
    
    console.log(`Found ${risksToUpdate.length} risks to migrate.`);
    
    if (risksToUpdate.length === 0) {
      console.log('No risks need migration. Exiting...');
      return;
    }
    
    console.log('\n🔄 Starting migration process...\n');
    
    let updatedCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < risksToUpdate.length; i++) {
      const risk = risksToUpdate[i];
      const progress = ((i + 1) / risksToUpdate.length * 100).toFixed(1);
      
      try {
        // Randomly pick at least 4 SOA control IDs
        const minControls = 4;
        const maxControls = Math.min(8, soaControls.length); // Cap at 8 or total available
        const numControls = Math.floor(Math.random() * (maxControls - minControls + 1)) + minControls;
        
        // Shuffle the SOA controls array and pick the first 'numControls' elements
        const shuffledControls = [...soaControls].sort(() => Math.random() - 0.5);
        const selectedControlIds = shuffledControls.slice(0, numControls).map(control => control.id);
        
        // Update the document
        const result = await risksCollection.updateOne(
          { _id: risk._id },
          { 
            $set: { 
              currentControlsReference: selectedControlIds,
              updatedAt: new Date()
            } 
          }
        );
        
        if (result.modifiedCount > 0) {
          updatedCount++;
          const oldValue = risk.currentControlsReference || 'Not specified';
          console.log(`[${progress}%] ✓ Updated risk ${risk.riskId || risk._id}: "${oldValue}" → [${selectedControlIds.join(', ')}] (${numControls} controls)`);
        }
        
      } catch (error) {
        errorCount++;
        console.error(`[${progress}%] ✗ Error updating risk ${risk.riskId || risk._id}:`, error.message);
      }
    }
    
    console.log('\n📊 === Migration Summary ===');
    console.log(`Total risks processed: ${risksToUpdate.length}`);
    console.log(`Successfully updated: ${updatedCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log(`SOA controls available: ${soaControls.length}`);
    console.log(`Controls per risk: 4-${Math.min(8, soaControls.length)} (randomly selected)`);
    
    if (errorCount > 0) {
      console.log('\n⚠️  Some risks failed to update. Check the error logs above.');
    } else {
      console.log('\n✅ Migration completed successfully!');
      console.log('📝 Each risk now has 4-8 randomly selected SOA control IDs in currentControlsReference.');
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Database connection closed.');
    }
  }
}

// Run the migration
migrateCurrentControlsReferenceToArray()
  .then(() => {
    console.log('Migration script finished.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });
