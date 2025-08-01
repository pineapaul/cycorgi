const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const iso27001Controls = [
  {
    id: 'A.5',
    title: 'Organizational Controls',
    description: 'Controls that set the organizational context for information security',
    controls: [
      {
        id: 'A.5.1',
        title: 'Information security policies',
        description: 'Information security policy and topic-specific policies',
        status: 'implemented',
        justification: 'Core security policies are in place',
        implementationNotes: 'Policies reviewed annually and communicated to all staff'
      },
      {
        id: 'A.5.2',
        title: 'Information security roles and responsibilities',
        description: 'Define and allocate information security responsibilities',
        status: 'implemented',
        justification: 'Security roles clearly defined in organizational structure',
        implementationNotes: 'RACI matrix maintained and updated quarterly'
      },
      {
        id: 'A.5.3',
        title: 'Segregation of duties',
        description: 'Conflicting duties and responsibilities segregated',
        status: 'implemented',
        justification: 'Critical functions have appropriate segregation',
        implementationNotes: 'Regular access reviews conducted to ensure compliance'
      },
      {
        id: 'A.5.4',
        title: 'Management responsibilities',
        description: 'Management support for information security',
        status: 'implemented',
        justification: 'Executive management actively supports security initiatives',
        implementationNotes: 'Monthly security briefings provided to leadership'
      },
      {
        id: 'A.5.5',
        title: 'Contact with authorities',
        description: 'Maintain appropriate contacts with authorities',
        status: 'implemented',
        justification: 'Established relationships with relevant authorities',
        implementationNotes: 'Contact list maintained and updated annually'
      },
      {
        id: 'A.5.6',
        title: 'Contact with special interest groups',
        description: 'Maintain contacts with special interest groups',
        status: 'implemented',
        justification: 'Active participation in industry security groups',
        implementationNotes: 'Membership in relevant professional associations'
      },
      {
        id: 'A.5.7',
        title: 'Threat intelligence',
        description: 'Receive and analyze threat intelligence',
        status: 'implemented',
        justification: 'Threat intelligence feeds integrated into security monitoring',
        implementationNotes: 'Automated threat intelligence processing and alerting'
      },
      {
        id: 'A.5.8',
        title: 'Information security in project management',
        description: 'Address information security in project management',
        status: 'implemented',
        justification: 'Security requirements integrated into project lifecycle',
        implementationNotes: 'Security gates implemented in project methodology'
      },
      {
        id: 'A.5.9',
        title: 'Inventory of information and other associated assets',
        description: 'Identify and document information assets',
        status: 'implemented',
        justification: 'Comprehensive asset inventory maintained',
        implementationNotes: 'Automated asset discovery and classification tools deployed'
      },
      {
        id: 'A.5.10',
        title: 'Acceptable use of information and other associated assets',
        description: 'Rules for acceptable use of assets',
        status: 'implemented',
        justification: 'Acceptable use policies clearly defined',
        implementationNotes: 'Regular training on acceptable use requirements'
      },
      {
        id: 'A.5.11',
        title: 'Return of assets',
        description: 'Return of assets upon change or termination',
        status: 'implemented',
        justification: 'Formal asset return procedures established',
        implementationNotes: 'Exit procedures include asset recovery checklist'
      },
      {
        id: 'A.5.12',
        title: 'Classification of information',
        description: 'Classify information based on security needs',
        status: 'implemented',
        justification: 'Information classification scheme implemented',
        implementationNotes: 'Automated classification tools deployed for sensitive data'
      },
      {
        id: 'A.5.13',
        title: 'Labelling of information',
        description: 'Appropriate labelling procedures for information',
        status: 'implemented',
        justification: 'Labelling procedures aligned with classification scheme',
        implementationNotes: 'Digital and physical labelling systems in place'
      },
      {
        id: 'A.5.14',
        title: 'Information transfer',
        description: 'Secure procedures for information transfer',
        status: 'implemented',
        justification: 'Secure transfer protocols and tools implemented',
        implementationNotes: 'Encrypted channels used for sensitive information transfer'
      },
      {
        id: 'A.5.15',
        title: 'Access control',
        description: 'Rules and procedures for access control',
        status: 'implemented',
        justification: 'Comprehensive access control framework established',
        implementationNotes: 'Role-based access control with regular reviews'
      },
      {
        id: 'A.5.16',
        title: 'Identity verification',
        description: 'Verify identity of users and entities',
        status: 'implemented',
        justification: 'Multi-factor authentication implemented',
        implementationNotes: 'Identity verification procedures documented and tested'
      },
      {
        id: 'A.5.17',
        title: 'Authentication information',
        description: 'Manage authentication information securely',
        status: 'implemented',
        justification: 'Secure authentication information management',
        implementationNotes: 'Password policies and secure storage implemented'
      },
      {
        id: 'A.5.18',
        title: 'Access rights',
        description: 'Allocate and review access rights',
        status: 'implemented',
        justification: 'Formal access rights management process',
        implementationNotes: 'Regular access reviews and privilege management'
      },
      {
        id: 'A.5.19',
        title: 'Information security in supplier relationships',
        description: 'Address security in supplier relationships',
        status: 'implemented',
        justification: 'Supplier security requirements and assessments',
        implementationNotes: 'Supplier security questionnaires and monitoring'
      },
      {
        id: 'A.5.20',
        title: 'Addressing information security within supplier agreements',
        description: 'Include security requirements in agreements',
        status: 'implemented',
        justification: 'Security clauses included in supplier contracts',
        implementationNotes: 'Standard security terms and conditions template'
      },
      {
        id: 'A.5.21',
        title: 'Managing information security in the ICT supply chain',
        description: 'Manage security risks in ICT supply chain',
        status: 'implemented',
        justification: 'ICT supply chain security assessment process',
        implementationNotes: 'Vendor security assessments and monitoring'
      },
      {
        id: 'A.5.22',
        title: 'Monitoring, review and change management of supplier services',
        description: 'Monitor and manage supplier service changes',
        status: 'implemented',
        justification: 'Supplier service monitoring and change management',
        implementationNotes: 'Regular supplier performance reviews and updates'
      },
      {
        id: 'A.5.23',
        title: 'Information security for use of cloud services',
        description: 'Address security for cloud service usage',
        status: 'implemented',
        justification: 'Cloud security requirements and controls implemented',
        implementationNotes: 'Cloud security assessment and monitoring procedures'
      },
      {
        id: 'A.5.24',
        title: 'Information security incident management planning and preparation',
        description: 'Plan and prepare for security incidents',
        status: 'implemented',
        justification: 'Incident management plan and procedures established',
        implementationNotes: 'Regular incident response exercises and training'
      },
      {
        id: 'A.5.25',
        title: 'Assessment and decision on information security events',
        description: 'Assess and decide on security events',
        status: 'implemented',
        justification: 'Event assessment and escalation procedures',
        implementationNotes: 'Automated event correlation and analysis tools'
      },
      {
        id: 'A.5.26',
        title: 'Response to information security incidents',
        description: 'Respond to security incidents',
        status: 'implemented',
        justification: 'Incident response procedures and team established',
        implementationNotes: 'Documented response procedures and communication plans'
      },
      {
        id: 'A.5.27',
        title: 'Learning from information security incidents',
        description: 'Learn from security incidents',
        status: 'implemented',
        justification: 'Post-incident review and lessons learned process',
        implementationNotes: 'Incident analysis and improvement procedures'
      },
      {
        id: 'A.5.28',
        title: 'Collection of evidence',
        description: 'Collect and preserve evidence',
        status: 'implemented',
        justification: 'Evidence collection and preservation procedures',
        implementationNotes: 'Forensic capabilities and evidence handling training'
      },
      {
        id: 'A.5.29',
        title: 'Information security during disruption',
        description: 'Maintain security during business disruption',
        status: 'implemented',
        justification: 'Business continuity security procedures',
        implementationNotes: 'Security controls integrated into BCP/DRP'
      },
      {
        id: 'A.5.30',
        title: 'ICT readiness for business continuity',
        description: 'Ensure ICT readiness for business continuity',
        status: 'implemented',
        justification: 'ICT continuity planning and testing',
        implementationNotes: 'Regular ICT continuity exercises and validation'
      },
      {
        id: 'A.5.31',
        title: 'Legal, statutory, regulatory and contractual requirements',
        description: 'Identify and comply with legal requirements',
        status: 'implemented',
        justification: 'Legal and regulatory compliance framework',
        implementationNotes: 'Regular compliance assessments and updates'
      },
      {
        id: 'A.5.32',
        title: 'Intellectual property rights',
        description: 'Protect intellectual property rights',
        status: 'implemented',
        justification: 'IP protection procedures and awareness',
        implementationNotes: 'IP rights management and protection measures'
      },
      {
        id: 'A.5.33',
        title: 'Protection of records',
        description: 'Protect important records',
        status: 'implemented',
        justification: 'Records protection and retention procedures',
        implementationNotes: 'Electronic records management system deployed'
      },
      {
        id: 'A.5.34',
        title: 'Privacy and protection of PII',
        description: 'Protect privacy and personal data',
        status: 'implemented',
        justification: 'Privacy protection framework and procedures',
        implementationNotes: 'GDPR compliance and PII protection measures'
      },
      {
        id: 'A.5.35',
        title: 'Independent review of information security',
        description: 'Independent review of security practices',
        status: 'implemented',
        justification: 'Regular independent security assessments',
        implementationNotes: 'Annual third-party security audits conducted'
      },
      {
        id: 'A.5.36',
        title: 'Compliance with policies, rules and standards',
        description: 'Ensure compliance with policies and standards',
        status: 'implemented',
        justification: 'Compliance monitoring and enforcement procedures',
        implementationNotes: 'Automated compliance checking and reporting'
      },
      {
        id: 'A.5.37',
        title: 'Documented operating procedures',
        description: 'Document and maintain operating procedures',
        status: 'implemented',
        justification: 'Comprehensive procedure documentation',
        implementationNotes: 'Centralized procedure repository and version control'
      }
    ]
  },
  {
    id: 'A.6',
    title: 'People Controls',
    description: 'Controls that address human resource security',
    controls: [
      {
        id: 'A.6.1',
        title: 'Screening',
        description: 'Background verification checks',
        status: 'implemented',
        justification: 'Comprehensive background screening procedures',
        implementationNotes: 'Pre-employment screening for all staff and contractors'
      },
      {
        id: 'A.6.2',
        title: 'Terms and conditions of employment',
        description: 'Security responsibilities in employment terms',
        status: 'implemented',
        justification: 'Security responsibilities included in employment contracts',
        implementationNotes: 'Standard security clauses in all employment agreements'
      },
      {
        id: 'A.6.3',
        title: 'Information security awareness, education and training',
        description: 'Security awareness and training programs',
        status: 'implemented',
        justification: 'Comprehensive security awareness program',
        implementationNotes: 'Regular training sessions and awareness campaigns'
      },
      {
        id: 'A.6.4',
        title: 'Disciplinary process',
        description: 'Process for security violations',
        status: 'implemented',
        justification: 'Formal disciplinary procedures for security violations',
        implementationNotes: 'Clear escalation and disciplinary action procedures'
      },
      {
        id: 'A.6.5',
        title: 'Responsibilities after termination or change of employment',
        description: 'Post-employment security responsibilities',
        status: 'implemented',
        justification: 'Clear post-employment security procedures',
        implementationNotes: 'Exit procedures include security responsibilities'
      },
      {
        id: 'A.6.6',
        title: 'Confidentiality or non-disclosure agreements',
        description: 'Confidentiality agreements for staff',
        status: 'implemented',
        justification: 'Confidentiality agreements for all staff',
        implementationNotes: 'Standard confidentiality agreement templates'
      },
      {
        id: 'A.6.7',
        title: 'Remote working',
        description: 'Security for remote working',
        status: 'implemented',
        justification: 'Remote working security policies and procedures',
        implementationNotes: 'Secure remote access and device management'
      },
      {
        id: 'A.6.8',
        title: 'Information security event reporting',
        description: 'Security event reporting procedures',
        status: 'implemented',
        justification: 'Clear security event reporting procedures',
        implementationNotes: 'Multiple reporting channels and escalation procedures'
      }
    ]
  },
  {
    id: 'A.7',
    title: 'Physical Controls',
    description: 'Controls that address physical security',
    controls: [
      {
        id: 'A.7.1',
        title: 'Physical security perimeters',
        description: 'Define and use security perimeters',
        status: 'implemented',
        justification: 'Physical security perimeters established',
        implementationNotes: 'Multi-layer physical security controls'
      },
      {
        id: 'A.7.2',
        title: 'Physical entry',
        description: 'Secure physical entry controls',
        status: 'implemented',
        justification: 'Controlled physical entry systems',
        implementationNotes: 'Access control systems and visitor management'
      },
      {
        id: 'A.7.3',
        title: 'Securing offices, rooms and facilities',
        description: 'Secure design and protection of facilities',
        status: 'implemented',
        justification: 'Secure facility design and protection',
        implementationNotes: 'Security measures for offices and critical areas'
      },
      {
        id: 'A.7.4',
        title: 'Physical security monitoring',
        description: 'Physical security monitoring systems',
        status: 'implemented',
        justification: 'Physical security monitoring and surveillance',
        implementationNotes: 'CCTV systems and security monitoring procedures'
      },
      {
        id: 'A.7.5',
        title: 'Protecting against physical and environmental threats',
        description: 'Protection against physical threats',
        status: 'implemented',
        justification: 'Protection against physical and environmental threats',
        implementationNotes: 'Environmental controls and threat mitigation'
      },
      {
        id: 'A.7.6',
        title: 'Working in secure areas',
        description: 'Procedures for working in secure areas',
        status: 'implemented',
        justification: 'Procedures for secure area operations',
        implementationNotes: 'Secure area access and working procedures'
      },
      {
        id: 'A.7.7',
        title: 'Clear desk and clear screen',
        description: 'Clear desk and screen policies',
        status: 'implemented',
        justification: 'Clear desk and screen policies implemented',
        implementationNotes: 'Regular compliance checks and awareness training'
      },
      {
        id: 'A.7.8',
        title: 'Equipment siting and protection',
        description: 'Secure equipment placement and protection',
        status: 'implemented',
        justification: 'Secure equipment siting and protection measures',
        implementationNotes: 'Equipment placement guidelines and protection'
      },
      {
        id: 'A.7.9',
        title: 'Security of assets off-premises',
        description: 'Security for off-premises assets',
        status: 'implemented',
        justification: 'Security measures for off-premises assets',
        implementationNotes: 'Mobile device and asset security policies'
      },
      {
        id: 'A.7.10',
        title: 'Storage media',
        description: 'Secure storage media management',
        status: 'implemented',
        justification: 'Secure storage media procedures',
        implementationNotes: 'Media handling and disposal procedures'
      },
      {
        id: 'A.7.11',
        title: 'Supporting utilities',
        description: 'Protect supporting utilities',
        status: 'implemented',
        justification: 'Protection of critical utilities',
        implementationNotes: 'UPS systems and utility protection measures'
      },
      {
        id: 'A.7.12',
        title: 'Power cabling',
        description: 'Protect power cabling',
        status: 'implemented',
        justification: 'Power cabling protection measures',
        implementationNotes: 'Power cabling security and redundancy'
      },
      {
        id: 'A.7.13',
        title: 'Equipment maintenance',
        description: 'Secure equipment maintenance',
        status: 'implemented',
        justification: 'Secure equipment maintenance procedures',
        implementationNotes: 'Maintenance access controls and procedures'
      },
      {
        id: 'A.7.14',
        title: 'Secure disposal or re-use of equipment',
        description: 'Secure equipment disposal and reuse',
        status: 'implemented',
        justification: 'Secure equipment disposal procedures',
        implementationNotes: 'Data sanitization and equipment disposal processes'
      }
    ]
  },
  {
    id: 'A.8',
    title: 'Technological Controls',
    description: 'Controls that address technical security measures',
    controls: [
      {
        id: 'A.8.1',
        title: 'User endpoint devices',
        description: 'Security for user endpoint devices',
        status: 'implemented',
        justification: 'Endpoint security controls implemented',
        implementationNotes: 'Endpoint protection and management systems'
      },
      {
        id: 'A.8.2',
        title: 'Privileged access rights',
        description: 'Manage privileged access rights',
        status: 'implemented',
        justification: 'Privileged access management system',
        implementationNotes: 'Just-in-time access and privilege escalation controls'
      },
      {
        id: 'A.8.3',
        title: 'Information access restriction',
        description: 'Restrict information access',
        status: 'implemented',
        justification: 'Information access restriction controls',
        implementationNotes: 'Role-based access control and data classification'
      },
      {
        id: 'A.8.4',
        title: 'Access to source code',
        description: 'Control access to source code',
        status: 'implemented',
        justification: 'Source code access controls implemented',
        implementationNotes: 'Version control and code access management'
      },
      {
        id: 'A.8.5',
        title: 'Secure authentication',
        description: 'Secure authentication systems',
        status: 'implemented',
        justification: 'Multi-factor authentication implemented',
        implementationNotes: 'MFA for all critical systems and applications'
      },
      {
        id: 'A.8.6',
        title: 'Capacity management',
        description: 'Manage system capacity',
        status: 'implemented',
        justification: 'Capacity management procedures',
        implementationNotes: 'Automated capacity monitoring and scaling'
      },
      {
        id: 'A.8.7',
        title: 'Protection against malware',
        description: 'Malware protection measures',
        status: 'implemented',
        justification: 'Comprehensive malware protection',
        implementationNotes: 'Anti-malware tools and regular scanning'
      },
      {
        id: 'A.8.8',
        title: 'Management of technical vulnerabilities',
        description: 'Technical vulnerability management',
        status: 'implemented',
        justification: 'Vulnerability management program',
        implementationNotes: 'Regular vulnerability scanning and patching'
      },
      {
        id: 'A.8.9',
        title: 'Configuration management',
        description: 'Configuration management controls',
        status: 'implemented',
        justification: 'Configuration management procedures',
        implementationNotes: 'Automated configuration management tools'
      },
      {
        id: 'A.8.10',
        title: 'Information deletion',
        description: 'Secure information deletion',
        status: 'implemented',
        justification: 'Secure deletion procedures',
        implementationNotes: 'Data sanitization and secure deletion tools'
      },
      {
        id: 'A.8.11',
        title: 'Data masking',
        description: 'Data masking techniques',
        status: 'implemented',
        justification: 'Data masking for sensitive information',
        implementationNotes: 'Automated data masking in development and testing'
      },
      {
        id: 'A.8.12',
        title: 'Data leakage prevention',
        description: 'Data leakage prevention measures',
        status: 'implemented',
        justification: 'DLP controls implemented',
        implementationNotes: 'DLP tools and monitoring systems'
      },
      {
        id: 'A.8.13',
        title: 'Information backup',
        description: 'Information backup procedures',
        status: 'implemented',
        justification: 'Comprehensive backup procedures',
        implementationNotes: 'Automated backup systems and testing'
      },
      {
        id: 'A.8.14',
        title: 'Redundancy of information processing facilities',
        description: 'Redundant processing facilities',
        status: 'implemented',
        justification: 'Redundant processing facilities',
        implementationNotes: 'High availability and disaster recovery systems'
      },
      {
        id: 'A.8.15',
        title: 'Logging',
        description: 'System logging procedures',
        status: 'implemented',
        justification: 'Comprehensive logging procedures',
        implementationNotes: 'Centralized logging and monitoring systems'
      },
      {
        id: 'A.8.16',
        title: 'Monitoring activities',
        description: 'System monitoring activities',
        status: 'implemented',
        justification: 'System monitoring and alerting',
        implementationNotes: 'Real-time monitoring and automated alerting'
      },
      {
        id: 'A.8.17',
        title: 'Clock synchronization',
        description: 'Clock synchronization',
        status: 'implemented',
        justification: 'Clock synchronization procedures',
        implementationNotes: 'NTP servers and time synchronization'
      },
      {
        id: 'A.8.18',
        title: 'Use of privileged utility programs',
        description: 'Control use of privileged utilities',
        status: 'implemented',
        justification: 'Privileged utility program controls',
        implementationNotes: 'Restricted access to privileged utilities'
      },
      {
        id: 'A.8.19',
        title: 'Installation of software on operational systems',
        description: 'Control software installation',
        status: 'implemented',
        justification: 'Software installation controls',
        implementationNotes: 'Change management and software approval process'
      },
      {
        id: 'A.8.20',
        title: 'Networks security',
        description: 'Network security controls',
        status: 'implemented',
        justification: 'Comprehensive network security',
        implementationNotes: 'Network segmentation and security controls'
      },
      {
        id: 'A.8.21',
        title: 'Security of network services',
        description: 'Secure network services',
        status: 'implemented',
        justification: 'Network service security',
        implementationNotes: 'Secure network service configuration'
      },
      {
        id: 'A.8.22',
        title: 'Web filtering',
        description: 'Web filtering controls',
        status: 'implemented',
        justification: 'Web filtering implemented',
        implementationNotes: 'Web content filtering and monitoring'
      },
      {
        id: 'A.8.23',
        title: 'Security of network services',
        description: 'Secure network services',
        status: 'implemented',
        justification: 'Network service security controls',
        implementationNotes: 'Secure network service management'
      },
      {
        id: 'A.8.24',
        title: 'Network routing control',
        description: 'Network routing controls',
        status: 'implemented',
        justification: 'Network routing control measures',
        implementationNotes: 'Secure routing and network path control'
      },
      {
        id: 'A.8.25',
        title: 'Secure system architecture and engineering principles',
        description: 'Secure system architecture',
        status: 'implemented',
        justification: 'Secure architecture principles',
        implementationNotes: 'Security by design and secure development'
      },
      {
        id: 'A.8.26',
        title: 'Secure coding',
        description: 'Secure coding practices',
        status: 'implemented',
        justification: 'Secure coding standards and practices',
        implementationNotes: 'Secure development lifecycle and code review'
      },
      {
        id: 'A.8.27',
        title: 'Security testing in development and acceptance',
        description: 'Security testing procedures',
        status: 'implemented',
        justification: 'Security testing in development',
        implementationNotes: 'Automated security testing and code analysis'
      },
      {
        id: 'A.8.28',
        title: 'Protection of test data',
        description: 'Protect test data',
        status: 'implemented',
        justification: 'Test data protection measures',
        implementationNotes: 'Test data anonymization and protection'
      },
      {
        id: 'A.8.29',
        title: 'Interoperability and portability',
        description: 'System interoperability and portability',
        status: 'implemented',
        justification: 'Interoperability and portability controls',
        implementationNotes: 'Standard interfaces and data formats'
      },
      {
        id: 'A.8.30',
        title: 'Eradication of data',
        description: 'Secure data eradication',
        status: 'implemented',
        justification: 'Secure data eradication procedures',
        implementationNotes: 'Data sanitization and secure disposal'
      },
      {
        id: 'A.8.31',
        title: 'Data leakage prevention',
        description: 'Data leakage prevention',
        status: 'implemented',
        justification: 'DLP controls and monitoring',
        implementationNotes: 'DLP tools and data flow monitoring'
      },
      {
        id: 'A.8.32',
        title: 'Web filtering',
        description: 'Web filtering controls',
        status: 'implemented',
        justification: 'Web filtering and content control',
        implementationNotes: 'Web content filtering and access control'
      },
      {
        id: 'A.8.33',
        title: 'Secure coding',
        description: 'Secure coding practices',
        status: 'implemented',
        justification: 'Secure coding standards',
        implementationNotes: 'Secure development practices and training'
      },
      {
        id: 'A.8.34',
        title: 'Security testing in development and acceptance',
        description: 'Security testing procedures',
        status: 'implemented',
        justification: 'Security testing in development lifecycle',
        implementationNotes: 'Automated security testing and validation'
      },
      {
        id: 'A.8.35',
        title: 'Protection of test data',
        description: 'Protect test data',
        status: 'implemented',
        justification: 'Test data protection measures',
        implementationNotes: 'Test data anonymization and secure handling'
      }
    ]
  }
];

async function seedSoAControls() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI environment variable is not set');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('cycorgi');
    const collection = db.collection('soa_controls');

    // Clear existing data
    await collection.deleteMany({});
    console.log('Cleared existing SoA controls');

    // Flatten the control sets into individual control documents
    const controlsToInsert = [];
    
    for (const controlSet of iso27001Controls) {
      for (const control of controlSet.controls) {
        controlsToInsert.push({
          ...control,
          controlSetId: controlSet.id,
          controlSetTitle: controlSet.title,
          controlSetDescription: controlSet.description,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    // Insert all controls
    const result = await collection.insertMany(controlsToInsert);
    console.log(`Successfully seeded ${result.insertedCount} SoA controls`);

    // Create indexes for better performance
    await collection.createIndex({ id: 1 });
    await collection.createIndex({ controlSetId: 1 });
    await collection.createIndex({ status: 1 });
    console.log('Created indexes for SoA controls');

  } catch (error) {
    console.error('Error seeding SoA controls:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

seedSoAControls().catch(console.error); 