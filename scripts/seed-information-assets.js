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

// Fake data for information assets
const fakeInformationAssets = [
  {
    id: '1',
    informationAsset: 'Customer Database',
    category: 'Customer Data',
    type: 'Database',
    description: 'Primary customer information database containing personal and financial data',
    location: 'AWS RDS',
    owner: 'John Smith',
    sme: 'Sarah Johnson',
    administrator: 'Mike Chen',
    agileReleaseTrain: 'ART-1',
    confidentiality: 'High',
    integrity: 'High',
    availability: 'High',
    additionalInfo: 'Requires encryption at rest and in transit'
  },
  {
    id: '2',
    informationAsset: 'Employee Records',
    category: 'HR Data',
    type: 'Database',
    description: 'HR employee data and performance records',
    location: 'On-Premise SQL Server',
    owner: 'Lisa Wang',
    sme: 'David Brown',
    administrator: 'Alex Rodriguez',
    agileReleaseTrain: 'ART-2',
    confidentiality: 'High',
    integrity: 'Medium',
    availability: 'Medium',
    additionalInfo: 'Contains sensitive HR information'
  },
  {
    id: '3',
    informationAsset: 'Financial Reports',
    category: 'Financial Data',
    type: 'Documents',
    description: 'Quarterly and annual financial statements',
    location: 'SharePoint Online',
    owner: 'Robert Davis',
    sme: 'Emily Wilson',
    administrator: 'Tom Anderson',
    agileReleaseTrain: 'ART-3',
    confidentiality: 'Medium',
    integrity: 'High',
    availability: 'Medium',
    additionalInfo: 'Regulatory compliance required'
  },
  {
    id: '4',
    informationAsset: 'Source Code Repository',
    category: 'Intellectual Property',
    type: 'Code Repository',
    description: 'Application source code and version control',
    location: 'GitHub Enterprise',
    owner: 'Jennifer Lee',
    sme: 'Carlos Martinez',
    administrator: 'Rachel Green',
    agileReleaseTrain: 'ART-1',
    confidentiality: 'Medium',
    integrity: 'High',
    availability: 'High',
    additionalInfo: 'Contains proprietary algorithms'
  },
  {
    id: '5',
    informationAsset: 'Network Infrastructure',
    category: 'Infrastructure',
    type: 'Network',
    description: 'Network devices and configuration data',
    location: 'On-Premise',
    owner: 'Kevin Thompson',
    sme: 'Amanda White',
    administrator: 'Steve Johnson',
    agileReleaseTrain: 'ART-4',
    confidentiality: 'Low',
    integrity: 'High',
    availability: 'Critical',
    additionalInfo: 'Critical for business operations'
  },
  {
    id: '6',
    informationAsset: 'API Keys',
    category: 'Security',
    type: 'Credentials',
    description: 'Third-party service integration keys',
    location: 'Azure Key Vault',
    owner: 'Patricia Garcia',
    sme: 'Daniel Kim',
    administrator: 'Maria Lopez',
    agileReleaseTrain: 'ART-2',
    confidentiality: 'High',
    integrity: 'High',
    availability: 'Medium',
    additionalInfo: 'Rotated quarterly'
  },
  {
    id: '7',
    informationAsset: 'Backup Systems',
    category: 'Infrastructure',
    type: 'Backup',
    description: 'Automated system backups and disaster recovery files',
    location: 'Azure Storage',
    owner: 'David Brown',
    sme: 'Amanda White',
    administrator: 'Steve Johnson',
    agileReleaseTrain: 'ART-4',
    confidentiality: 'High',
    integrity: 'High',
    availability: 'Critical',
    additionalInfo: 'Encrypted and geo-replicated'
  },
  {
    id: '8',
    informationAsset: 'Marketing Materials',
    category: 'Marketing',
    type: 'Media',
    description: 'Brand assets, logos, and marketing collateral',
    location: 'Google Drive',
    owner: 'Tom Wilson',
    sme: 'Emily Wilson',
    administrator: 'Rachel Green',
    agileReleaseTrain: 'ART-3',
    confidentiality: 'Low',
    integrity: 'Medium',
    availability: 'Medium',
    additionalInfo: 'Publicly accessible for partners'
  },
  {
    id: '9',
    informationAsset: 'Compliance Documentation',
    category: 'Legal',
    type: 'Documents',
    description: 'Regulatory compliance documents and certifications',
    location: 'SharePoint Online',
    owner: 'Helen Rodriguez',
    sme: 'James Wilson',
    administrator: 'Lisa Chen',
    agileReleaseTrain: 'ART-5',
    confidentiality: 'High',
    integrity: 'High',
    availability: 'Medium',
    additionalInfo: 'Audit trail required'
  },
  {
    id: '10',
    informationAsset: 'Development Environment',
    category: 'Infrastructure',
    type: 'Development',
    description: 'Development servers and testing environments',
    location: 'AWS EC2',
    owner: 'Mark Johnson',
    sme: 'Carlos Martinez',
    administrator: 'Rachel Green',
    agileReleaseTrain: 'ART-1',
    confidentiality: 'Medium',
    integrity: 'Medium',
    availability: 'Medium',
    additionalInfo: 'Non-production data only'
  },
  {
    id: '11',
    informationAsset: 'Customer Support Tickets',
    category: 'Customer Data',
    type: 'Database',
    description: 'Customer support and service request records',
    location: 'Salesforce',
    owner: 'Anna Davis',
    sme: 'Sarah Johnson',
    administrator: 'Mike Chen',
    agileReleaseTrain: 'ART-2',
    confidentiality: 'Medium',
    integrity: 'High',
    availability: 'High',
    additionalInfo: 'Contains customer PII'
  },
  {
    id: '12',
    informationAsset: 'System Logs',
    category: 'Infrastructure',
    type: 'Logs',
    description: 'Application and system audit logs',
    location: 'Splunk',
    owner: 'Kevin Thompson',
    sme: 'Amanda White',
    administrator: 'Steve Johnson',
    agileReleaseTrain: 'ART-4',
    confidentiality: 'Medium',
    integrity: 'High',
    availability: 'High',
    additionalInfo: 'Retention policy: 1 year'
  },
  {
    id: '13',
    informationAsset: 'Vendor Contracts',
    category: 'Legal',
    type: 'Documents',
    description: 'Third-party vendor agreements and contracts',
    location: 'DocuSign',
    owner: 'Helen Rodriguez',
    sme: 'James Wilson',
    administrator: 'Lisa Chen',
    agileReleaseTrain: 'ART-5',
    confidentiality: 'High',
    integrity: 'High',
    availability: 'Medium',
    additionalInfo: 'Legal review required'
  },
  {
    id: '14',
    informationAsset: 'Mobile App Backend',
    category: 'Infrastructure',
    type: 'API',
    description: 'Backend services for mobile applications',
    location: 'AWS Lambda',
    owner: 'Jennifer Lee',
    sme: 'Carlos Martinez',
    administrator: 'Rachel Green',
    agileReleaseTrain: 'ART-1',
    confidentiality: 'Medium',
    integrity: 'High',
    availability: 'Critical',
    additionalInfo: 'Real-time processing required'
  },
  {
    id: '15',
    informationAsset: 'Email Archive',
    category: 'Communication',
    type: 'Email',
    description: 'Corporate email archive and retention',
    location: 'Microsoft Exchange',
    owner: 'Tom Wilson',
    sme: 'Emily Wilson',
    administrator: 'Rachel Green',
    agileReleaseTrain: 'ART-3',
    confidentiality: 'Medium',
    integrity: 'Medium',
    availability: 'Medium',
    additionalInfo: '7-year retention policy'
  }
];

async function seedDatabase() {
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in environment variables');
    console.log('💡 Make sure your .env.local file contains MONGODB_URI=your_connection_string');
    process.exit(1);
  }
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔗 Connecting to MongoDB...');
    console.log(`📡 Using URI: ${MONGODB_URI.substring(0, 20)}...`);
    await client.connect();
    
    const db = client.db('cycorgi');
    const collection = db.collection('information-assets');
    
    // Clear existing data
    console.log('Clearing existing data...');
    await collection.deleteMany({});
    
    // Insert fake data
    console.log('Inserting fake data...');
    const result = await collection.insertMany(fakeInformationAssets);
    
    console.log(`✅ Successfully seeded database with ${result.insertedCount} information assets`);
    console.log('\n📊 Sample data includes:');
    console.log('- Customer Database (High confidentiality)');
    console.log('- Employee Records (HR Data)');
    console.log('- Financial Reports (Regulatory compliance)');
    console.log('- Source Code Repository (Intellectual Property)');
    console.log('- Network Infrastructure (Critical availability)');
    console.log('- API Keys (Security credentials)');
    console.log('- And 9 more diverse assets...');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await client.close();
    console.log('\n🔗 Database connection closed');
  }
}

// Run the seeding function
seedDatabase(); 