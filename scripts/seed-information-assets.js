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

// CIA Constants matching the constants file
const CONFIDENTIALITY_LEVELS = {
  PUBLIC: 'Public',
  INTERNAL_USE: 'Internal Use',
  CONFIDENTIAL: 'Confidential',
  STRICTLY_CONFIDENTIAL: 'Strictly Confidential'
};

const INTEGRITY_LEVELS = {
  LOW: 'Low',
  MODERATE: 'Moderate',
  HIGH: 'High'
};

const AVAILABILITY_LEVELS = {
  LOW: 'Low',
  MODERATE: 'Moderate',
  HIGH: 'High'
};

// Generate additional fake data
function generateAdditionalAssets() {
  const categories = ['Customer Data', 'HR Data', 'Financial Data', 'Intellectual Property', 'Infrastructure', 'Security', 'Marketing', 'Legal', 'Communication', 'Operations'];
  const types = ['Database', 'Documents', 'Code Repository', 'Network', 'Credentials', 'Backup', 'Media', 'Development', 'API', 'Email', 'Logs', 'Cloud Storage'];
  const locations = ['AWS RDS', 'On-Premise SQL Server', 'SharePoint Online', 'GitHub Enterprise', 'On-Premise', 'Azure Key Vault', 'Azure Storage', 'Google Drive', 'AWS EC2', 'Salesforce', 'Splunk', 'DocuSign', 'AWS Lambda', 'Microsoft Exchange', 'Google Cloud Storage', 'Docker Hub', 'Jira', 'Confluence', 'Slack', 'Zoom'];
  const owners = ['John Smith', 'Lisa Wang', 'Robert Davis', 'Jennifer Lee', 'Kevin Thompson', 'Patricia Garcia', 'David Brown', 'Tom Wilson', 'Helen Rodriguez', 'Mark Johnson', 'Anna Davis', 'Sarah Johnson', 'Mike Chen', 'Alex Rodriguez', 'Emily Wilson', 'Carlos Martinez', 'Rachel Green', 'Amanda White', 'Steve Johnson', 'Maria Lopez'];
  const smes = ['Sarah Johnson', 'David Brown', 'Emily Wilson', 'Carlos Martinez', 'Amanda White', 'Daniel Kim', 'James Wilson', 'Mark Johnson', 'Anna Davis', 'Kevin Thompson', 'Helen Rodriguez', 'Jennifer Lee', 'Tom Wilson', 'Robert Davis', 'Lisa Wang', 'John Smith', 'Patricia Garcia', 'David Brown', 'Rachel Green', 'Steve Johnson'];
  const administrators = ['Mike Chen', 'Alex Rodriguez', 'Tom Anderson', 'Rachel Green', 'Steve Johnson', 'Maria Lopez', 'Amanda White', 'Rachel Green', 'Lisa Chen', 'Rachel Green', 'Mike Chen', 'Steve Johnson', 'Rachel Green', 'Tom Anderson', 'Alex Rodriguez', 'Mike Chen', 'Maria Lopez', 'Steve Johnson', 'Rachel Green', 'Amanda White'];
  const agileReleaseTrains = ['ART-1', 'ART-2', 'ART-3', 'ART-4', 'ART-5', 'ART-6', 'ART-7', 'ART-8'];
  const confidentialityLevels = Object.values(CONFIDENTIALITY_LEVELS);
  const integrityLevels = Object.values(INTEGRITY_LEVELS);
  const availabilityLevels = Object.values(AVAILABILITY_LEVELS);
  const criticalityLevels = ['mission-critical', 'business-critical', 'standard', 'non-critical'];

  const additionalAssets = [];
  
  for (let i = 16; i <= 120; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const owner = owners[Math.floor(Math.random() * owners.length)];
    const sme = smes[Math.floor(Math.random() * smes.length)];
    const administrator = administrators[Math.floor(Math.random() * administrators.length)];
    const agileReleaseTrain = agileReleaseTrains[Math.floor(Math.random() * agileReleaseTrains.length)];
    const confidentiality = confidentialityLevels[Math.floor(Math.random() * confidentialityLevels.length)];
    const integrity = integrityLevels[Math.floor(Math.random() * integrityLevels.length)];
    const availability = availabilityLevels[Math.floor(Math.random() * availabilityLevels.length)];
    const criticality = criticalityLevels[Math.floor(Math.random() * criticalityLevels.length)];

    // Generate asset names based on category and type
    let assetName = '';
    let description = '';
    
    switch(category) {
      case 'Customer Data':
        assetName = `Customer ${['Database', 'Records', 'Profiles', 'Preferences', 'History', 'Analytics', 'Feedback', 'Support', 'Orders', 'Accounts'][Math.floor(Math.random() * 10)]}`;
        description = `Customer-related ${type.toLowerCase()} containing ${['personal information', 'transaction history', 'preferences', 'support tickets', 'order data', 'account details', 'feedback data', 'analytics data', 'profile information', 'behavioral data'][Math.floor(Math.random() * 10)]}`;
        break;
      case 'HR Data':
        assetName = `HR ${['Records', 'Database', 'Payroll', 'Benefits', 'Performance', 'Training', 'Recruitment', 'Policies', 'Compliance', 'Analytics'][Math.floor(Math.random() * 10)]}`;
        description = `Human resources ${type.toLowerCase()} containing ${['employee records', 'payroll information', 'benefits data', 'performance reviews', 'training records', 'recruitment data', 'policy documents', 'compliance reports', 'analytics data', 'organizational data'][Math.floor(Math.random() * 10)]}`;
        break;
      case 'Financial Data':
        assetName = `Financial ${['Reports', 'Data', 'Analytics', 'Transactions', 'Budget', 'Forecasts', 'Compliance', 'Audit', 'Tax', 'Revenue'][Math.floor(Math.random() * 10)]}`;
        description = `Financial ${type.toLowerCase()} containing ${['financial reports', 'transaction data', 'budget information', 'forecasting data', 'compliance records', 'audit trails', 'tax documents', 'revenue analytics', 'expense data', 'investment records'][Math.floor(Math.random() * 10)]}`;
        break;
      case 'Infrastructure':
        assetName = `${['Network', 'Server', 'Cloud', 'Database', 'Storage', 'Backup', 'Security', 'Monitoring', 'Load Balancer', 'CDN'][Math.floor(Math.random() * 10)]} ${['Infrastructure', 'System', 'Platform', 'Service', 'Component', 'Resource', 'Environment', 'Cluster', 'Instance', 'Stack'][Math.floor(Math.random() * 10)]}`;
        description = `Infrastructure ${type.toLowerCase()} for ${['system operations', 'data processing', 'application hosting', 'network management', 'security controls', 'backup and recovery', 'monitoring and alerting', 'load balancing', 'content delivery', 'resource management'][Math.floor(Math.random() * 10)]}`;
        break;
      case 'Security':
        assetName = `Security ${['Keys', 'Certificates', 'Tokens', 'Credentials', 'Policies', 'Logs', 'Alerts', 'Configurations', 'Tools', 'Reports'][Math.floor(Math.random() * 10)]}`;
        description = `Security-related ${type.toLowerCase()} containing ${['authentication data', 'encryption keys', 'security certificates', 'access tokens', 'security policies', 'audit logs', 'alert configurations', 'security tools', 'compliance reports', 'threat intelligence'][Math.floor(Math.random() * 10)]}`;
        break;
      default:
        assetName = `${category} ${['System', 'Data', 'Platform', 'Service', 'Application', 'Tool', 'Resource', 'Component', 'Module', 'Service'][Math.floor(Math.random() * 10)]}`;
        description = `${category.toLowerCase()} ${type.toLowerCase()} for ${['business operations', 'data management', 'service delivery', 'application support', 'resource management', 'compliance requirements', 'analytics processing', 'communication needs', 'operational support', 'strategic initiatives'][Math.floor(Math.random() * 10)]}`;
    }

    additionalAssets.push({
      id: i.toString(),
      informationAsset: assetName,
      category: category,
      type: type,
      description: description,
      location: location,
      owner: owner,
      sme: sme,
      administrator: administrator,
      agileReleaseTrain: agileReleaseTrain,
      confidentiality: confidentiality,
      integrity: integrity,
      availability: availability,
      criticality: criticality,
      additionalInfo: `Additional information for ${assetName.toLowerCase()}`
    });
  }
  
  return additionalAssets;
}

// Original fake data with updated CIA values
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
    confidentiality: CONFIDENTIALITY_LEVELS.STRICTLY_CONFIDENTIAL,
    integrity: INTEGRITY_LEVELS.HIGH,
    availability: AVAILABILITY_LEVELS.HIGH,
    criticality: 'mission-critical',
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
    confidentiality: CONFIDENTIALITY_LEVELS.CONFIDENTIAL,
    integrity: INTEGRITY_LEVELS.MODERATE,
    availability: AVAILABILITY_LEVELS.MODERATE,
    criticality: 'business-critical',
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
    confidentiality: CONFIDENTIALITY_LEVELS.INTERNAL_USE,
    integrity: INTEGRITY_LEVELS.HIGH,
    availability: AVAILABILITY_LEVELS.MODERATE,
    criticality: 'business-critical',
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
    confidentiality: CONFIDENTIALITY_LEVELS.CONFIDENTIAL,
    integrity: INTEGRITY_LEVELS.HIGH,
    availability: AVAILABILITY_LEVELS.HIGH,
    criticality: 'mission-critical',
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
    confidentiality: CONFIDENTIALITY_LEVELS.PUBLIC,
    integrity: INTEGRITY_LEVELS.HIGH,
    availability: AVAILABILITY_LEVELS.HIGH,
    criticality: 'mission-critical',
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
    confidentiality: CONFIDENTIALITY_LEVELS.STRICTLY_CONFIDENTIAL,
    integrity: INTEGRITY_LEVELS.HIGH,
    availability: AVAILABILITY_LEVELS.MODERATE,
    criticality: 'business-critical',
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
    confidentiality: CONFIDENTIALITY_LEVELS.CONFIDENTIAL,
    integrity: INTEGRITY_LEVELS.HIGH,
    availability: AVAILABILITY_LEVELS.HIGH,
    criticality: 'mission-critical',
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
    confidentiality: CONFIDENTIALITY_LEVELS.PUBLIC,
    integrity: INTEGRITY_LEVELS.MODERATE,
    availability: AVAILABILITY_LEVELS.MODERATE,
    criticality: 'standard',
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
    confidentiality: CONFIDENTIALITY_LEVELS.CONFIDENTIAL,
    integrity: INTEGRITY_LEVELS.HIGH,
    availability: AVAILABILITY_LEVELS.MODERATE,
    criticality: 'business-critical',
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
    confidentiality: CONFIDENTIALITY_LEVELS.INTERNAL_USE,
    integrity: INTEGRITY_LEVELS.MODERATE,
    availability: AVAILABILITY_LEVELS.MODERATE,
    criticality: 'standard',
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
    confidentiality: CONFIDENTIALITY_LEVELS.CONFIDENTIAL,
    integrity: INTEGRITY_LEVELS.HIGH,
    availability: AVAILABILITY_LEVELS.HIGH,
    criticality: 'business-critical',
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
    confidentiality: CONFIDENTIALITY_LEVELS.INTERNAL_USE,
    integrity: INTEGRITY_LEVELS.HIGH,
    availability: AVAILABILITY_LEVELS.HIGH,
    criticality: 'standard',
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
    confidentiality: CONFIDENTIALITY_LEVELS.CONFIDENTIAL,
    integrity: INTEGRITY_LEVELS.HIGH,
    availability: AVAILABILITY_LEVELS.MODERATE,
    criticality: 'business-critical',
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
    confidentiality: CONFIDENTIALITY_LEVELS.CONFIDENTIAL,
    integrity: INTEGRITY_LEVELS.HIGH,
    availability: AVAILABILITY_LEVELS.HIGH,
    criticality: 'mission-critical',
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
    confidentiality: CONFIDENTIALITY_LEVELS.INTERNAL_USE,
    integrity: INTEGRITY_LEVELS.MODERATE,
    availability: AVAILABILITY_LEVELS.MODERATE,
    criticality: 'standard',
    additionalInfo: '7-year retention policy'
  }
];

// Combine original and generated data
const allInformationAssets = [...fakeInformationAssets, ...generateAdditionalAssets()];

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
    const result = await collection.insertMany(allInformationAssets);
    
    console.log(`✅ Successfully seeded database with ${result.insertedCount} information assets`);
    console.log('\n📊 Sample data includes:');
    console.log('- Customer Database (High confidentiality)');
    console.log('- Employee Records (HR Data)');
    console.log('- Financial Reports (Regulatory compliance)');
    console.log('- Source Code Repository (Intellectual Property)');
    console.log('- Network Infrastructure (Critical availability)');
    console.log('- API Keys (Security credentials)');
    console.log('- And 114 more diverse assets...');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await client.close();
    console.log('\n🔗 Database connection closed');
  }
}

// Run the seeding function
seedDatabase(); 