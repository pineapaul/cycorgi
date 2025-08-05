const fetch = require('node-fetch')

async function checkCurrentPhaseViaAPI() {
  try {
    console.log('Checking currentPhase values via API...')
    
    // Call the risks API to get all risks
    const response = await fetch('http://localhost:3000/api/risks')
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }
    
    const result = await response.json()
    
    if (!result.success) {
      throw new Error(`API returned error: ${result.error}`)
    }
    
    const risks = result.data
    
    console.log(`\nFound ${risks.length} risks via API:`)
    console.log('=' .repeat(50))
    
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
      
      console.log('\n💡 To fix these case issues, run:')
      console.log('   node scripts/fix-current-phase-case.js')
      console.log('   (Make sure MongoDB is running first)')
    } else {
      console.log('\n✅ No case mismatches found')
    }

    // Check for null/undefined values
    const nullCount = phaseCounts['null/undefined'] || 0
    if (nullCount > 0) {
      console.log(`\n⚠️  ${nullCount} risks have null/undefined currentPhase values`)
    }

  } catch (error) {
    console.error('Error:', error.message)
    console.log('\n💡 Make sure your Next.js development server is running:')
    console.log('   npm run dev')
    console.log('   or')
    console.log('   yarn dev')
  }
}

// Only run if this script is executed directly
if (require.main === module) {
  console.log('⚠️  NOTE: This script requires your Next.js development server to be running.')
  console.log('Start your server with: npm run dev')
  console.log('Then run: node scripts/check-current-phase-via-api.js')
}

module.exports = { checkCurrentPhaseViaAPI } 