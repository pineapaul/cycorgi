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

async function migrateCurrentControlsToArray() {
  let client;
  
  try {
    console.log('📡 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db('cycorgi');
    const risksCollection = db.collection('risks');
    
    console.log('✅ Connected to database. Starting migration...');
    
    // Find all risks where currentControls is a string (not an array)
    const risksToUpdate = await risksCollection.find({
      currentControls: { $exists: true, $type: 'string' }
    }).toArray();
    
    console.log(`Found ${risksToUpdate.length} risks with string currentControls to migrate.`);
    
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
        // Convert string to array
        let newCurrentControls = [];
        
        if (risk.currentControls && typeof risk.currentControls === 'string') {
          // Split by common delimiters and clean up
          newCurrentControls = risk.currentControls
            .split(/[,;|\n\r]+/) // Split by comma, semicolon, pipe, or newline
            .map(control => control.trim())
            .filter(control => control.length > 0); // Remove empty strings
        }
        
        // Update the document
        const result = await risksCollection.updateOne(
          { _id: risk._id },
          { 
            $set: { 
              currentControls: newCurrentControls,
              updatedAt: new Date()
            } 
          }
        );
        
        if (result.modifiedCount > 0) {
          updatedCount++;
          console.log(`[${progress}%] ✓ Updated risk ${risk.riskId || risk._id}: "${risk.currentControls}" → [${newCurrentControls.join(', ')}]`);
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
    
    if (errorCount > 0) {
      console.log('\n⚠️  Some risks failed to update. Check the error logs above.');
    } else {
      console.log('\n✅ Migration completed successfully!');
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
migrateCurrentControlsToArray()
  .then(() => {
    console.log('Migration script finished.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });
