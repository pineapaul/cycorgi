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
          envVars[key.trim()] = value.replace(/^[\"'“”‘’]|[\"'“”‘’]$/g, ''); // Remove quotes
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

// Risk data generation
function generateRisks() {
  const functionalUnits = [
    'IT Security', 'Finance', 'HR', 'Operations', 'Legal', 'Marketing', 
    'Procurement', 'Sales', 'Customer Support', 'Research & Development',
    'Quality Assurance', 'Facilities', 'Compliance', 'Business Development',
    'Product Management', 'Engineering', 'Data Analytics', 'Risk Management',
    'Internal Audit', 'Strategic Planning'
  ];

  const informationAssets = [
    'Customer Database, Payment Systems', 'Vendor Management System', 'Financial Systems',
    'HR Systems', 'Production Systems, Network Infrastructure', 'Contract Management System, Legal Documents',
    'Customer Data, Marketing Campaigns', 'Source Code Repository, Development Environment',
    'Backup Systems, Disaster Recovery', 'API Keys, Security Credentials',
    'Employee Records, Payroll System', 'Network Infrastructure, Security Devices',
    'Compliance Documentation, Audit Trails', 'Marketing Materials, Brand Assets',
    'System Logs, Monitoring Tools', 'Email Archive, Communication Systems',
    'Mobile App Backend, API Services', 'Cloud Infrastructure, Storage Systems',
    'Third-party Integrations, External APIs', 'Business Intelligence, Analytics Platform'
  ];

  const riskStatements = [
    'Risk of unauthorized access to sensitive customer data through weak authentication mechanisms and insufficient access controls, potentially leading to data breaches and regulatory non-compliance.',
    'Risk associated with third-party vendors accessing company systems without proper security controls and monitoring, potentially leading to data exposure and compliance violations.',
    'Risk of financial fraud due to inadequate controls and monitoring in financial systems, potentially leading to significant financial losses and regulatory penalties.',
    'Risk of unauthorized access to employee personal data through weak access controls and insufficient monitoring, potentially leading to privacy violations and regulatory non-compliance.',
    'Risk of system downtime and data loss due to inadequate backup procedures and disaster recovery planning, potentially leading to business interruption and revenue loss.',
    'Risk of non-compliance with regulatory requirements and contractual obligations due to inadequate legal review processes and documentation management.',
    'Risk of data privacy violations and reputational damage due to inadequate customer consent management and data protection measures in marketing activities.',
    'Risk of intellectual property theft and code vulnerabilities due to insufficient security controls in development environments and source code repositories.',
    'Risk of data loss and business continuity failure due to inadequate backup procedures and disaster recovery testing.',
    'Risk of security breaches and unauthorized access due to weak credential management and insufficient access controls.',
    'Risk of privacy violations and regulatory non-compliance due to inadequate protection of employee personal information and payroll data.',
    'Risk of network security breaches and service disruption due to insufficient network monitoring and security controls.',
    'Risk of regulatory violations and audit failures due to inadequate compliance documentation and audit trail management.',
    'Risk of brand damage and reputational harm due to inadequate protection of marketing assets and brand materials.',
    'Risk of security incidents and operational failures due to insufficient system monitoring and log management.',
    'Risk of communication security breaches and data exposure due to inadequate email security and communication controls.',
    'Risk of API security vulnerabilities and service disruption due to insufficient API security controls and monitoring.',
    'Risk of cloud security breaches and data exposure due to inadequate cloud security controls and configuration management.',
    'Risk of third-party security breaches and data exposure due to insufficient vendor security controls and monitoring.',
    'Risk of data analytics security breaches and privacy violations due to inadequate protection of business intelligence and analytics data.'
  ];

  const threats = [
    'Malicious actors attempting to gain unauthorized access to customer data',
    'Third-party vendors with excessive or inappropriate access to company systems',
    'Internal fraud, external cyber attacks targeting financial data',
    'Unauthorized access to sensitive employee information',
    'Hardware failures, natural disasters, cyber attacks causing system outages',
    'Regulatory violations, contractual breaches, legal disputes',
    'Data privacy violations, customer complaints, regulatory fines',
    'Intellectual property theft, code vulnerabilities, security breaches',
    'Data loss, backup failures, disaster recovery failures',
    'Credential theft, unauthorized access, security breaches',
    'Privacy violations, regulatory non-compliance, data exposure',
    'Network attacks, service disruption, security breaches',
    'Regulatory violations, audit failures, compliance breaches',
    'Brand damage, reputational harm, intellectual property theft',
    'Security incidents, operational failures, system breaches',
    'Communication security breaches, data exposure, privacy violations',
    'API security vulnerabilities, service disruption, unauthorized access',
    'Cloud security breaches, data exposure, configuration vulnerabilities',
    'Third-party security breaches, data exposure, vendor vulnerabilities',
    'Data analytics security breaches, privacy violations, unauthorized access'
  ];

  const vulnerabilities = [
    'Weak password policies, lack of multi-factor authentication, insufficient access controls',
    'Lack of vendor access controls, insufficient monitoring of vendor activities',
    'Inadequate segregation of duties, weak approval workflows, insufficient monitoring',
    'Weak access controls, insufficient monitoring of HR system access',
    'Inadequate backup procedures, lack of disaster recovery testing, insufficient redundancy',
    'Inadequate legal review processes, poor documentation management, lack of compliance monitoring',
    'Inadequate consent management, poor data protection practices, insufficient privacy controls',
    'Insufficient code security controls, weak development practices, inadequate access controls',
    'Inadequate backup procedures, lack of disaster recovery testing, insufficient redundancy',
    'Weak credential management, insufficient access controls, poor security practices',
    'Inadequate data protection, insufficient access controls, poor privacy practices',
    'Insufficient network monitoring, weak security controls, inadequate threat detection',
    'Inadequate compliance documentation, poor audit trail management, insufficient monitoring',
    'Inadequate brand protection, insufficient access controls, poor asset management',
    'Insufficient system monitoring, weak log management, inadequate threat detection',
    'Inadequate email security, insufficient communication controls, poor data protection',
    'Insufficient API security controls, weak authentication, inadequate monitoring',
    'Inadequate cloud security controls, poor configuration management, insufficient monitoring',
    'Insufficient vendor security controls, inadequate monitoring, poor risk assessment',
    'Inadequate data analytics security, insufficient privacy controls, poor access management'
  ];

  const currentControls = [
    'Basic password authentication, quarterly access reviews, network segmentation',
    'Basic vendor agreements, annual security assessments',
    'Basic approval workflows, monthly reconciliations, annual audits',
    'Basic access controls, annual access reviews, data encryption',
    'Weekly backups, basic disaster recovery plan, annual testing',
    'Basic contract review process, annual compliance audits, legal document storage',
    'Basic consent collection, quarterly privacy reviews, data encryption',
    'Basic code review process, annual security assessments, access controls',
    'Weekly backups, basic disaster recovery plan, annual testing',
    'Basic credential management, quarterly access reviews, security monitoring',
    'Basic data protection, annual privacy reviews, access controls',
    'Basic network monitoring, quarterly security assessments, threat detection',
    'Basic compliance documentation, annual audit reviews, monitoring',
    'Basic brand protection, quarterly asset reviews, access controls',
    'Basic system monitoring, quarterly log reviews, threat detection',
    'Basic email security, quarterly communication reviews, data protection',
    'Basic API security, quarterly access reviews, monitoring',
    'Basic cloud security, quarterly configuration reviews, monitoring',
    'Basic vendor security, annual risk assessments, monitoring',
    'Basic analytics security, quarterly privacy reviews, access controls'
  ];

  const risks = [];

  for (let i = 1; i <= 20; i++) {
    const riskId = `RISK-${i.toString().padStart(3, '0')}`;
    const functionalUnit = functionalUnits[i - 1];
    const informationAsset = informationAssets[i - 1];
    const riskStatement = riskStatements[i - 1];
    const threat = threats[i - 1];
    const vulnerability = vulnerabilities[i - 1];
    const currentControlsValue = currentControls[i - 1];

    // Generate risk rating based on index
    let riskRating, consequenceRating, likelihoodRating;
    if (i <= 5) {
      riskRating = 'High';
      consequenceRating = 'High';
      likelihoodRating = 'Medium';
    } else if (i <= 10) {
      riskRating = 'Medium';
      consequenceRating = 'Medium';
      likelihoodRating = 'Medium';
    } else if (i <= 15) {
      riskRating = 'High';
      consequenceRating = 'High';
      likelihoodRating = 'Low';
    } else {
      riskRating = 'Medium';
      consequenceRating = 'Low';
      likelihoodRating = 'High';
    }

    // Generate CIA impact based on risk type
    let impact;
    if (i <= 5) {
      impact = ['Confidentiality', 'Integrity']; // High priority risks affect C and I
    } else if (i <= 10) {
      impact = ['Confidentiality']; // Medium priority risks affect C
    } else if (i <= 15) {
      impact = ['Integrity', 'Availability']; // High priority risks affect I and A
    } else {
      impact = ['Availability']; // Medium priority risks affect A
    }

    // Distribute phases equally among 20 risks (4 risks per phase)
    const phases = ['identification', 'analysis', 'evaluation', 'treatment', 'monitoring'];
    const currentPhase = phases[Math.floor((i - 1) / 4)]; // 4 risks per phase

    const risk = {
      riskId,
      functionalUnit,
      informationAsset,
      riskStatement,
      riskRating,
      consequenceRating,
      likelihoodRating,
      impact,
      riskOwner: `${functionalUnit} Director`,
      threat,
      vulnerability,
      currentControls: currentControlsValue,
      currentPhase, // Add current phase field
      // Add missing fields
      reasonForAcceptance: i <= 5 ? 'High business impact requires immediate attention' : i <= 10 ? 'Moderate risk acceptable with monitoring' : i <= 15 ? 'Risk accepted pending treatment implementation' : 'Low risk acceptable with current controls',
      dateOfSSCApproval: i <= 5 ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() : i <= 10 ? new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() : null,
      dateRiskTreatmentsApproved: i <= 5 ? new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() : i <= 10 ? new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() : null,
      residualConsequence: i <= 5 ? 'Medium' : i <= 10 ? 'Low' : i <= 15 ? 'Medium' : 'Low',
      residualLikelihood: i <= 5 ? 'Low' : i <= 10 ? 'Low' : i <= 15 ? 'Medium' : 'Low',
      residualRiskRating: i <= 5 ? 'Medium' : i <= 10 ? 'Low' : i <= 15 ? 'Medium' : 'Low',
      residualRiskAcceptedByOwner: i <= 5 ? `${functionalUnit} Director` : i <= 10 ? `${functionalUnit} Manager` : i <= 15 ? `${functionalUnit} Director` : `${functionalUnit} Manager`,
      dateResidualRiskAccepted: i <= 5 ? new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() : i <= 10 ? new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() : null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    risks.push(risk);
  }

  return risks;
}

// Treatment data generation
function generateTreatments() {
  const treatments = [];
  const treatmentTypes = [
    'Implement multi-factor authentication and access controls',
    'Enhanced vendor security assessments and monitoring',
    'Implement enhanced approval workflows and monitoring',
    'Implement multi-factor authentication and access reviews',
    'Implement comprehensive backup and disaster recovery procedures',
    'Implement enhanced legal review and compliance monitoring processes',
    'Implement enhanced customer consent management and data protection',
    'Implement secure code review and development practices',
    'Conduct disaster recovery testing and training',
    'Implement enhanced credential management and security controls',
    'Implement enhanced data protection and privacy controls',
    'Implement enhanced network monitoring and security controls',
    'Implement enhanced compliance documentation and audit processes',
    'Implement enhanced brand protection and asset management',
    'Implement enhanced system monitoring and log management',
    'Implement enhanced email security and communication controls',
    'Implement enhanced API security controls and monitoring',
    'Implement enhanced cloud security controls and configuration management',
    'Implement enhanced vendor security controls and monitoring',
    'Implement enhanced data analytics security and privacy controls'
  ];

  const treatmentOwners = [
    'IT Security Team', 'Procurement Team', 'Finance Team', 'HR Team',
    'Operations Team', 'Legal Team', 'Marketing Team', 'Development Team',
    'Operations Team', 'Security Team', 'Privacy Team', 'Network Team',
    'Compliance Team', 'Marketing Team', 'IT Operations Team', 'Communication Team',
    'API Development Team', 'Cloud Infrastructure Team', 'Vendor Management Team',
    'Data Analytics Team'
  ];

  const approvers = [
    'Security Manager', 'Procurement Director', 'Finance Director', 'HR Director',
    'Operations Director', 'Legal Director', 'Marketing Director', 'Development Manager',
    'Operations Director', 'Security Manager', 'Privacy Officer', 'Network Manager',
    'Compliance Officer', 'Marketing Director', 'IT Operations Manager', 'Communication Manager',
    'API Development Manager', 'Cloud Infrastructure Manager', 'Vendor Management Director',
    'Data Analytics Manager'
  ];

  for (let riskIndex = 1; riskIndex <= 20; riskIndex++) {
    const riskId = `RISK-${riskIndex.toString().padStart(3, '0')}`;
    
    // Generate 4 treatments per risk
    for (let treatmentIndex = 1; treatmentIndex <= 4; treatmentIndex++) {
      const treatmentJiraTicket = `TREAT-${riskIndex.toString().padStart(3, '0')}-${treatmentIndex.toString().padStart(2, '0')}`;
      const treatmentType = treatmentTypes[riskIndex - 1];
      const treatmentOwner = treatmentOwners[riskIndex - 1];
      const approver = approvers[riskIndex - 1];

      // Base due date (3 months from now)
      const baseDueDate = new Date();
      baseDueDate.setMonth(baseDueDate.getMonth() + 3);

      // Generate extensions for 10 treatments (riskIndex 1-10)
      const extensions = [];
      let currentDueDate = new Date(baseDueDate);
      let numberOfExtensions = 0;

      if (riskIndex <= 10) {
        // Generate 3-4 extensions
        const numExtensions = Math.floor(Math.random() * 2) + 3; // 3 or 4
        
        for (let extIndex = 1; extIndex <= numExtensions; extIndex++) {
          const extensionDate = new Date(currentDueDate);
          extensionDate.setMonth(extensionDate.getMonth() + 1);
          
          const approvalDate = new Date(currentDueDate);
          approvalDate.setDate(approvalDate.getDate() - 5);
          
          const justifications = [
            'Additional time required for comprehensive testing',
            'Resource constraints due to concurrent projects',
            'Complex integration requirements identified',
            'Stakeholder review process taking longer than expected',
            'Technical challenges discovered during implementation',
            'Security review process requires additional time',
            'Third-party vendor delays affecting timeline',
            'Scope expansion due to new requirements'
          ];
          
          extensions.push({
            extendedDueDate: extensionDate.toISOString().split('T')[0],
            approver,
            dateApproved: approvalDate.toISOString().split('T')[0],
            justification: justifications[Math.floor(Math.random() * justifications.length)]
          });
          
          currentDueDate = extensionDate;
          numberOfExtensions++;
        }
      }

      // Determine completion status
      const isCompleted = Math.random() > 0.3; // 70% completion rate
      const completionDate = isCompleted ? new Date(currentDueDate) : null;
      completionDate?.setDate(completionDate.getDate() - 7); // Complete 1 week before due date

      const treatment = {
        riskId,
        treatmentJiraTicket,
        riskTreatment: treatmentType,
        riskTreatmentOwner: treatmentOwner,
        dateRiskTreatmentDue: baseDueDate.toISOString().split('T')[0],
        extendedDueDate: extensions.length > 0 ? extensions[extensions.length - 1].extendedDueDate : null,
        numberOfExtensions,
        completionDate: completionDate ? completionDate.toISOString().split('T')[0] : null,
        closureApproval: isCompleted ? 'Approved' : 'Pending',
        closureApprovedBy: isCompleted ? approver : null,
        extensions,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      treatments.push(treatment);
    }
  }

  return treatments;
}

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
    
    // Generate data
    console.log('📊 Generating risk data...');
    const risks = generateRisks();
    
    console.log('📊 Generating treatment data...');
    const treatments = generateTreatments();
    
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await db.collection('risks').deleteMany({});
    await db.collection('treatments').deleteMany({});
    
    // Insert risks
    console.log('📝 Inserting risks...');
    const risksResult = await db.collection('risks').insertMany(risks);
    
    // Insert treatments
    console.log('📝 Inserting treatments...');
    const treatmentsResult = await db.collection('treatments').insertMany(treatments);
    
    console.log(`✅ Successfully seeded database:`);
    console.log(`   - ${risksResult.insertedCount} risks`);
    console.log(`   - ${treatmentsResult.insertedCount} treatments`);
    console.log(`   - ${treatments.filter(t => t.numberOfExtensions > 0).length} treatments with extensions`);
    
    console.log('\n📊 Sample data includes:');
    console.log('- RISK-001: Customer data security (High risk)');
    console.log('- RISK-005: HR data protection (High risk)');
    console.log('- RISK-010: Legal compliance (Medium risk)');
    console.log('- RISK-015: System monitoring (High risk)');
    console.log('- RISK-020: Data analytics security (Medium risk)');
    
    console.log('\n🎯 Treatment statistics:');
    console.log(`   - Average extensions per treatment: ${(treatments.reduce((sum, t) => sum + t.numberOfExtensions, 0) / treatments.length).toFixed(1)}`);
    console.log(`   - Completion rate: ${((treatments.filter(t => t.closureApproval === 'Approved').length / treatments.length) * 100).toFixed(1)}%`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await client.close();
    console.log('\n🔗 Database connection closed');
  }
}

// Run the seeding function
seedDatabase(); 