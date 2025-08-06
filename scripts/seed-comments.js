const { MongoClient } = require('mongodb')
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
          envVars[key.trim()] = value.replace(/^[\"'""'']|[\"'""'']$/g, ''); // Remove quotes
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

const MONGODB_URI = process.env.MONGODB_URI;

async function seedComments() {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI is not defined in environment variables');
    return;
  }

  let client;
  
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('cycorgi');
    const commentsCollection = db.collection('comments');
    
    // Clear existing comments
    await commentsCollection.deleteMany({});
    console.log('Cleared existing comments');
    
    // Sample comments for different risks
    const sampleComments = [
      {
        riskId: 'RISK-001',
        content: 'This risk requires immediate attention due to the high impact on our customer data.',
        author: 'Sarah Johnson',
        timestamp: new Date('2024-01-15T10:30:00Z').toISOString(),
        replies: [
          {
            content: 'I agree. We should prioritize the treatment plan.',
            author: 'Mike Chen',
            timestamp: new Date('2024-01-15T11:00:00Z').toISOString()
          }
        ]
      },
      {
        riskId: 'RISK-001',
        content: 'The current controls seem insufficient for this threat level.',
        author: 'David Wilson',
        timestamp: new Date('2024-01-14T16:45:00Z').toISOString(),
        replies: []
      },
      {
        riskId: 'RISK-001',
        content: 'We need to review the risk assessment methodology for this type of threat.',
        author: 'Emma Davis',
        timestamp: new Date('2024-01-13T09:15:00Z').toISOString(),
        replies: []
      },
      {
        riskId: 'RISK-005',
        content: 'HR data protection measures should be enhanced.',
        author: 'John Smith',
        timestamp: new Date('2024-01-12T14:20:00Z').toISOString(),
        replies: [
          {
            content: 'Agreed. What specific measures do you recommend?',
            author: 'Lisa Brown',
            timestamp: new Date('2024-01-12T15:30:00Z').toISOString()
          }
        ]
      },
      {
        riskId: 'RISK-010',
        content: 'Legal compliance requirements have been updated.',
        author: 'Robert Taylor',
        timestamp: new Date('2024-01-11T13:45:00Z').toISOString(),
        replies: []
      }
    ];
    
    // Insert sample comments
    await commentsCollection.insertMany(sampleComments);
    console.log(`Inserted ${sampleComments.length} sample comments`);
    
    // Show comment counts by risk
    const commentCounts = await commentsCollection.aggregate([
      { $group: { _id: '$riskId', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]).toArray();
    
    console.log('\nComment counts by risk:');
    commentCounts.forEach(({ _id, count }) => {
      console.log(`- ${_id}: ${count} comments`);
    });
    
  } catch (error) {
    console.error('Error seeding comments:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('\nDisconnected from MongoDB');
    }
  }
}

// Run the seeding function
seedComments().catch(console.error);
