const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function checkDatabase() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('MONGODB_URI not found in .env.local file');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('cycorgi');
    console.log(`Using database: ${db.databaseName}`);
    
    // Check risks collection
    const risksCollection = db.collection('risks');
    const count = await risksCollection.countDocuments();
    console.log(`\nRisks collection has ${count} documents`);

    if (count > 0) {
      console.log('\nCurrent phase values in risks:');
      console.log('=' .repeat(50));
      
      const risks = await risksCollection.find({}, { projection: { riskId: 1, currentPhase: 1, _id: 0 } }).toArray();
      
      const phaseCounts = {}
      const uniquePhases = new Set()

      risks.forEach(risk => {
        const phase = risk.currentPhase || 'null/undefined'
        console.log(`Risk ID: ${risk.riskId} | Current Phase: "${phase}"`)
        
        if (!phaseCounts[phase]) {
          phaseCounts[phase] = 0
        }
        phaseCounts[phase]++
        
        uniquePhases.add(phase)
      })

      console.log('\n' + '=' .repeat(50))
      console.log('SUMMARY:')
      console.log('=' .repeat(50))
      console.log(`Total unique phase values: ${uniquePhases.size}`)
      console.log('Phase value counts:')
      
      Object.entries(phaseCounts).forEach(([phase, count]) => {
        console.log(`  "${phase}": ${count} risks`)
      })

      console.log('\n' + '=' .repeat(50))
      console.log('ANALYSIS:')
      console.log('=' .repeat(50))

      // Check for case issues
      const expectedPhases = ['Draft', 'Identification', 'Analysis', 'Evaluation', 'Treatment', 'Monitoring']
      const foundPhases = Array.from(uniquePhases).filter(p => p !== 'null/undefined')

      console.log('Expected phases (case-sensitive):', expectedPhases)
      console.log('Found phases in database:', foundPhases)

      const caseIssues = foundPhases.filter(phase => !expectedPhases.includes(phase))
      if (caseIssues.length > 0) {
        console.log('\n⚠️  CASE MISMATCHES FOUND:')
        caseIssues.forEach(phase => {
          const lowercase = phase.toLowerCase()
          const matchingExpected = expectedPhases.find(exp => exp.toLowerCase() === lowercase)
          if (matchingExpected) {
            console.log(`  "${phase}" should be "${matchingExpected}"`)
          } else {
            console.log(`  "${phase}" is not a valid phase`)
          }
        })
      } else {
        console.log('\n✅ No case mismatches found')
      }

      // Check for null/undefined values
      const nullCount = phaseCounts['null/undefined'] || 0
      if (nullCount > 0) {
        console.log(`\n⚠️  ${nullCount} risks have null/undefined currentPhase values`)
      }
    }

  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await client.close();
    console.log('\nDisconnected from MongoDB');
  }
}

checkDatabase().catch(console.error); 