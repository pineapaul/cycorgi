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

async function seedRoles() {
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
    const rolesCollection = db.collection('user-roles');

    // Clear existing roles
    await rolesCollection.deleteMany({});
    console.log('Cleared existing user roles');

    // Sample roles for different risks
    const sampleRoles = [
      {
        name: "Draft Risk Reviewer",
        description: "Reviews draft risk statements and ensures accuracy, completeness, and compliance before submission for approval.",
        permissions: [
          "view_risks",
          "comment_on_draft_risks",
          "request_changes_on_draft_risks"
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Risk Owner",
        description: "Responsible for approving risks and associated risk treatments. Oversees implementation and ensures timely mitigation or acceptance.",
        permissions: [
          "view_risks",
          "approve_risks",
          "approve_risk_treatments",
          "update_risk_status",
          "assign_risk_treatments"
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Risk Manager",
        description: "Manages the risk register, coordinates assessments, assigns risk owners, and monitors treatment progress.",
        permissions: [
          "view_risks",
          "create_risks",
          "update_risks",
          "delete_risks",
          "assign_risk_owners",
          "approve_risk_treatments"
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Risk Treatment Owner",
        description: "Executes assigned risk treatments and provides updates on implementation progress.",
        permissions: [
          "view_assigned_treatments",
          "update_treatment_progress",
          "upload_evidence"
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Risk Viewer",
        description: "Has read-only access to risk information for awareness and monitoring purposes.",
        permissions: [
          "view_risks",
          "view_treatments"
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Guest",
        description: "Has read-only access to the whole application",
        permissions: [
          "view_risks",
          "view_treatments"
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Admin",
        description: "Has full system access, including management of users, roles, permissions, and system configurations.",
        permissions: [
          "view_risks",
          "create_risks",
          "update_risks",
          "delete_risks",
          "assign_risk_owners",
          "approve_risks",
          "approve_risk_treatments",
          "manage_users",
          "manage_roles",
          "manage_permissions",
          "configure_system"
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Insert sample roles
    await rolesCollection.insertMany(sampleRoles);
    console.log(`Inserted ${sampleRoles.length} sample roles`);

    // Show roles count
    const rolesCount = await rolesCollection.countDocuments();

    console.log('\nRoles counts:');
    console.log(`- ${rolesCount} roles`);

  } catch (error) {
    console.error('Error seeding roles:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('\nDisconnected from MongoDB');
    }
  }
}

// Run the seeding function
seedRoles().catch(console.error);
