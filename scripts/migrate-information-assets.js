const { MongoClient } = require('mongodb');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env.local
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        if (!key.startsWith('#')) {
          envVars[key.trim()] = value.replace(/^["']|["']$/g, ''); // Remove quotes
        }
      }
    });
    
    // Set environment variables
    Object.keys(envVars).forEach(key => {
      process.env[key] = envVars[key];
    });
  }
}

// Load environment variables
loadEnvFile();

// MongoDB connection string from environment
const MONGODB_URI = process.env.MONGODB_URI;

async function migrateInformationAssets() {
  let client;
  
  try {
    console.log('🔗 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db('cycorgi');
    const risksCollection = db.collection('risks');
    const informationAssetsCollection = db.collection('information-assets');
    
    console.log('📊 Fetching all information assets...');
    const informationAssets = await informationAssetsCollection.find({}).toArray();
    
    // Create a map for quick lookup by asset name
    const assetNameMap = new Map();
    const assetIdMap = new Map();
    
    informationAssets.forEach(asset => {
      assetNameMap.set(asset.informationAsset.toLowerCase(), asset);
      assetIdMap.set(asset.id, asset);
    });
    
    console.log(`📋 Found ${informationAssets.length} information assets`);
    
    console.log('🔍 Fetching all risks...');
    const risks = await risksCollection.find({}).toArray();
    console.log(`📋 Found ${risks.length} risks to migrate`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const risk of risks) {
      try {
        let needsUpdate = false;
        let newInformationAsset = [];
        
        // Check if informationAsset field exists and needs migration
        if (risk.informationAsset) {
          if (Array.isArray(risk.informationAsset)) {
            // Already in new format, check if it needs transformation
            const needsTransformation = risk.informationAsset.some(asset => 
              typeof asset === 'string' || !asset.id
            );
            
            if (needsTransformation) {
              newInformationAsset = risk.informationAsset.map(asset => {
                if (typeof asset === 'string') {
                  // If it's a string, try to find the asset by name or ID
                  const foundAsset = assetNameMap.get(asset.toLowerCase()) || assetIdMap.get(asset);
                  return foundAsset ? { id: foundAsset.id, name: foundAsset.informationAsset } : { id: asset, name: asset };
                } else if (asset && asset.id) {
                  // If it's an object with id, ensure it has name
                  const foundAsset = assetIdMap.get(asset.id);
                  return { id: asset.id, name: foundAsset ? foundAsset.informationAsset : asset.name || asset.id };
                }
                return asset;
              });
              needsUpdate = true;
            } else {
              // Already in correct format, skip
              skippedCount++;
              continue;
            }
          } else if (typeof risk.informationAsset === 'string') {
            // Old format: string - convert to new format
            const assetNames = risk.informationAsset.split(',').map(name => name.trim());
            newInformationAsset = assetNames.map(name => {
              const foundAsset = assetNameMap.get(name.toLowerCase());
              return foundAsset ? { id: foundAsset.id, name: foundAsset.informationAsset } : { id: name, name: name };
            });
            needsUpdate = true;
          }
        }
        
        if (needsUpdate) {
          console.log(`🔄 Migrating risk ${risk.riskId}: "${risk.informationAsset}" -> ${JSON.stringify(newInformationAsset)}`);
          
          await risksCollection.updateOne(
            { _id: risk._id },
            { 
              $set: { 
                informationAsset: newInformationAsset,
                updatedAt: new Date().toISOString()
              }
            }
          );
          
          migratedCount++;
        } else {
          skippedCount++;
        }
        
      } catch (error) {
        console.error(`❌ Error migrating risk ${risk.riskId}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n✅ Migration completed!');
    console.log(`📊 Summary:`);
    console.log(`   - Total risks processed: ${risks.length}`);
    console.log(`   - Successfully migrated: ${migratedCount}`);
    console.log(`   - Skipped (already correct format): ${skippedCount}`);
    console.log(`   - Errors: ${errorCount}`);
    
    if (errorCount > 0) {
      console.log('\n⚠️  Some risks failed to migrate. Please check the errors above.');
    } else {
      console.log('\n🎉 All risks migrated successfully!');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Disconnected from MongoDB');
    }
  }
}

// Run the migration
if (require.main === module) {
  console.log('🚀 Starting Information Assets Migration...\n');
  migrateInformationAssets()
    .then(() => {
      console.log('\n✨ Migration script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateInformationAssets }; 