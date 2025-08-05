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

async function verifyMigrationCorrected() {
  let client;
  
  try {
    console.log('🔗 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db('cycorgi');
    const risksCollection = db.collection('risks');
    const informationAssetsCollection = db.collection('information-assets');
    
    console.log('📊 Fetching risks for verification...');
    const risks = await risksCollection.find({}).toArray();
    
    console.log('📊 Fetching information assets for name lookup...');
    const informationAssets = await informationAssetsCollection.find({}).toArray();
    const assetIdMap = new Map(informationAssets.map(asset => [asset.id, asset.informationAsset]));
    
    console.log(`📋 Found ${risks.length} risks to verify`);
    
    let correctFormat = 0;
    let incorrectFormat = 0;
    let missingField = 0;
    
    console.log('\n🔍 Verification Results:');
    console.log('=' .repeat(80));
    
    risks.forEach((risk, index) => {
      console.log(`\n${index + 1}. Risk ID: ${risk.riskId}`);
      
      if (!risk.informationAsset) {
        console.log('   ❌ Missing informationAsset field');
        missingField++;
      } else if (Array.isArray(risk.informationAsset)) {
        const isValidFormat = risk.informationAsset.every(asset => 
          typeof asset === 'string'
        );
        
        if (isValidFormat) {
          console.log('   ✅ Correct array format (array of ID strings)');
          const assetNames = risk.informationAsset.map(id => {
            const name = assetIdMap.get(id);
            return name ? `${name} (ID: ${id})` : `Unknown Asset (ID: ${id})`;
          });
          console.log(`   📋 Assets: ${assetNames.join(', ')}`);
          correctFormat++;
        } else {
          console.log('   ❌ Invalid array format - not all elements are strings');
          console.log(`   📋 Data: ${JSON.stringify(risk.informationAsset)}`);
          incorrectFormat++;
        }
      } else {
        console.log('   ❌ Still in old string format');
        console.log(`   📋 Data: ${risk.informationAsset}`);
        incorrectFormat++;
      }
    });
    
    console.log('\n' + '=' .repeat(80));
    console.log('📊 Verification Summary:');
    console.log(`   - Total risks: ${risks.length}`);
    console.log(`   - Correct format: ${correctFormat}`);
    console.log(`   - Incorrect format: ${incorrectFormat}`);
    console.log(`   - Missing field: ${missingField}`);
    
    if (incorrectFormat === 0 && missingField === 0) {
      console.log('\n🎉 Migration verification successful! All risks are in the correct format.');
    } else {
      console.log('\n⚠️  Migration verification found issues. Some risks may need attention.');
    }
    
    // Show sample of migrated data
    console.log('\n📋 Sample Migrated Data:');
    console.log('=' .repeat(80));
    
    const sampleRisks = risks.slice(0, 3);
    sampleRisks.forEach((risk, index) => {
      console.log(`\nSample ${index + 1} - ${risk.riskId}:`);
      console.log(JSON.stringify(risk.informationAsset, null, 2));
      
      if (Array.isArray(risk.informationAsset)) {
        console.log('Asset Names:');
        risk.informationAsset.forEach(id => {
          const name = assetIdMap.get(id);
          console.log(`  - ${id}: ${name || 'Unknown Asset'}`);
        });
      }
    });
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Disconnected from MongoDB');
    }
  }
}

// Run the verification
if (require.main === module) {
  console.log('🔍 Starting Corrected Migration Verification...\n');
  verifyMigrationCorrected()
    .then(() => {
      console.log('\n✨ Verification completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Verification failed:', error);
      process.exit(1);
    });
}

module.exports = { verifyMigrationCorrected }; 