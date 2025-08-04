const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function updateThirdPartiesDataPrivacy() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('MONGODB_URI not found in environment variables');
    console.log('Please make sure you have a .env.local file with MONGODB_URI');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();
    const collection = db.collection('third-parties');

    // Update dataPrivacy values to Jira ticket format
    const updates = [
      { vendorId: 'V001', dataPrivacy: 'DPR-2023-001' },
      { vendorId: 'V002', dataPrivacy: 'DPR-2023-002' },
      { vendorId: 'V003', dataPrivacy: 'DPR-2023-003' },
      { vendorId: 'V004', dataPrivacy: 'DPR-2023-004' },
      { vendorId: 'V005', dataPrivacy: 'DPR-2023-005' },
      { vendorId: 'V006', dataPrivacy: 'DPR-2023-006' },
      { vendorId: 'V007', dataPrivacy: 'DPR-2023-007' },
      { vendorId: 'V008', dataPrivacy: 'DPR-2023-008' },
      { vendorId: 'V009', dataPrivacy: 'DPR-2023-009' },
      { vendorId: 'V010', dataPrivacy: 'DPR-2023-010' },
      { vendorId: 'V011', dataPrivacy: 'DPR-2023-011' },
      { vendorId: 'V012', dataPrivacy: 'DPR-2023-012' },
      { vendorId: 'V013', dataPrivacy: 'DPR-2023-013' },
      { vendorId: 'V014', dataPrivacy: 'DPR-2023-014' },
      { vendorId: 'V015', dataPrivacy: 'DPR-2023-015' }
    ];

    let updatedCount = 0;
    let errorCount = 0;

    for (const update of updates) {
      try {
        const result = await collection.updateOne(
          { vendorId: update.vendorId },
          { $set: { dataPrivacy: update.dataPrivacy } }
        );

        if (result.matchedCount > 0) {
          console.log(`Updated vendor ${update.vendorId}: ${update.dataPrivacy}`);
          updatedCount++;
        } else {
          console.log(`Vendor ${update.vendorId} not found`);
          errorCount++;
        }
      } catch (error) {
        console.error(`Error updating vendor ${update.vendorId}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\nUpdate complete:`);
    console.log(`- Successfully updated: ${updatedCount} records`);
    console.log(`- Errors: ${errorCount} records`);

    // Also ensure informationAssetIds field exists
    console.log('\nEnsuring informationAssetIds field exists...');
    const result = await collection.updateMany(
      { informationAssetId: { $exists: true }, informationAssetIds: { $exists: false } },
      [
        {
          $set: {
            informationAssetIds: ['$informationAssetId'],
            informationAssetId: '$$REMOVE'
          }
        }
      ]
    );

    if (result.modifiedCount > 0) {
      console.log(`Migrated ${result.modifiedCount} records to use informationAssetIds array`);
    } else {
      console.log('No records needed migration for informationAssetIds');
    }

  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

updateThirdPartiesDataPrivacy().catch(console.error); 