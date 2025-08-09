require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

/**
 * Migration script to update SOA controls data structure
 * 
 * Changes:
 * 1. Rename 'status' field to 'controlStatus'
 * 2. Add 'controlApplicability' field with default value
 * 3. Add 'relatedRisks' field as empty array
 * 4. Update field values to match new constants
 * 5. Update indexes
 */

// Mapping old status values to new CONTROL_STATUS constants
const STATUS_MAPPING = {
  'implemented': 'Implemented',
  'not-implemented': 'Not Implemented',
  'excluded': 'Not Implemented', // Map excluded to not implemented for now
  'partially-implemented': 'Partially Implemented',
  'planning': 'Planning Implementation'
};

async function migrateSoAControls() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI environment variable is not set');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('cycorgi');
    const collection = db.collection('soa_controls');

    // Check if migration is needed
    const sampleDoc = await collection.findOne({});
    if (!sampleDoc) {
      console.log('No SOA controls found. Running initial seed...');
      return;
    }

    if (sampleDoc.controlStatus) {
      console.log('Migration already completed. SOA controls already use new field structure.');
      return;
    }

    console.log('Starting SOA controls migration...');

    // Get all controls
    const controls = await collection.find({}).toArray();
    console.log(`Found ${controls.length} controls to migrate`);

    const bulkOps = [];

    for (const control of controls) {
      const updateDoc = {
        $set: {
          controlStatus: STATUS_MAPPING[control.status] || 'Not Implemented',
          controlApplicability: 'Applicable', // Default to applicable
          relatedRisks: [], // Initialize as empty array
          updatedAt: new Date().toISOString()
        },
        $unset: {
          status: "" // Remove old status field
        }
      };

      bulkOps.push({
        updateOne: {
          filter: { _id: control._id },
          update: updateDoc
        }
      });
    }

    // Execute bulk update
    if (bulkOps.length > 0) {
      const result = await collection.bulkWrite(bulkOps);
      console.log(`Migration completed: ${result.modifiedCount} controls updated`);
    }

    // Drop old index on 'status' field and create new ones
    try {
      await collection.dropIndex({ status: 1 });
      console.log('Dropped old status index');
    } catch (error) {
      console.log('Old status index not found (this is normal)');
    }

    // Create new indexes
    await collection.createIndex({ controlStatus: 1 });
    await collection.createIndex({ controlApplicability: 1 });
    await collection.createIndex({ relatedRisks: 1 });
    console.log('Created new indexes for controlStatus, controlApplicability, and relatedRisks');

    // Verify migration
    const updatedControls = await collection.find({}).limit(5).toArray();
    console.log('\nSample migrated controls:');
    updatedControls.forEach(control => {
      console.log(`  ${control.id}: ${control.controlStatus} | ${control.controlApplicability}`);
    });

    console.log('\n✅ SOA controls migration completed successfully!');

  } catch (error) {
    console.error('❌ Error during SOA controls migration:', error);
    throw error;
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

// Allow script to be run directly or imported
if (require.main === module) {
  migrateSoAControls().catch(console.error);
}

module.exports = { migrateSoAControls };
