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

async function backupRisks() {
  let client;
  
  try {
    console.log('🔗 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db('cycorgi');
    const risksCollection = db.collection('risks');
    
    console.log('📊 Fetching all risks...');
    const risks = await risksCollection.find({}).toArray();
    console.log(`📋 Found ${risks.length} risks to backup`);
    
    // Create backup directory if it doesn't exist
    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Create backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `risks-backup-${timestamp}.json`);
    
    console.log(`💾 Creating backup file: ${backupFile}`);
    
    // Write backup to file
    fs.writeFileSync(backupFile, JSON.stringify(risks, null, 2));
    
    console.log('✅ Backup completed successfully!');
    console.log(`📁 Backup saved to: ${backupFile}`);
    console.log(`📊 Total risks backed up: ${risks.length}`);
    
    // Also create a summary of informationAsset field types
    const fieldTypes = {};
    risks.forEach(risk => {
      const type = risk.informationAsset ? 
        (Array.isArray(risk.informationAsset) ? 'array' : typeof risk.informationAsset) : 
        'undefined';
      fieldTypes[type] = (fieldTypes[type] || 0) + 1;
    });
    
    console.log('\n📋 InformationAsset field types summary:');
    Object.entries(fieldTypes).forEach(([type, count]) => {
      console.log(`   - ${type}: ${count} risks`);
    });
    
  } catch (error) {
    console.error('❌ Backup failed:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Disconnected from MongoDB');
    }
  }
}

// Run the backup
if (require.main === module) {
  console.log('🚀 Starting Risks Backup...\n');
  backupRisks()
    .then(() => {
      console.log('\n✨ Backup script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Backup script failed:', error);
      process.exit(1);
    });
}

module.exports = { backupRisks }; 