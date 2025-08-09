/**
 * Test script to demonstrate the findSoAControlsByRiskId function
 * 
 * Usage:
 * node test-soa-function.js [riskId]
 * 
 * Example:
 * node test-soa-function.js RISK-001
 */

require('dotenv').config({ path: '.env.local' });

// Import the function - in a real JS file, you'd need to transpile the TypeScript
// For demo purposes, here's a JS version of the function
const { MongoClient } = require('mongodb');

async function findSoAControlsByRiskId(riskId) {
  if (!riskId || typeof riskId !== 'string') {
    throw new Error('Risk ID must be a non-empty string');
  }

  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('cycorgi');
    const collection = db.collection('soa_controls');
    
    // Find all controls where the relatedRisks array contains the specified riskId
    const controls = await collection.find(
      { relatedRisks: riskId },
      { projection: { id: 1, title: 1, _id: 0 } }
    ).toArray();
    
    // Return only the id and title fields as specified
    return controls.map(control => ({
      id: control.id,
      title: control.title
    }));
  } catch (error) {
    console.error('Error finding SOA controls by risk ID:', error);
    throw new Error(`Failed to find SOA controls for risk ID: ${riskId}`);
  } finally {
    await client.close();
  }
}

async function testFunction() {
  const riskId = process.argv[2] || 'RISK-001';
  
  console.log(`🔍 Testing findSoAControlsByRiskId with riskId: ${riskId}`);
  console.log('='.repeat(60));
  
  try {
    const controls = await findSoAControlsByRiskId(riskId);
    
    if (controls.length === 0) {
      console.log(`❌ No SOA controls found for risk ID: ${riskId}`);
    } else {
      console.log(`✅ Found ${controls.length} SOA controls for risk ID: ${riskId}`);
      console.log('\nResults:');
      controls.forEach((control, index) => {
        console.log(`${index + 1}. ID: ${control.id}`);
        console.log(`   Title: ${control.title}`);
        console.log('');
      });
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testFunction().catch(console.error);
}

module.exports = { findSoAControlsByRiskId };
